import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import type { ItemKey, ItemGroup } from "../src/enums.js";
import { extractFromPayload } from "../src/services/becon-mapper.js";
import { computeHairStrength, computeScalpEnvironment } from "../src/services/scores.js";
import type { BeconPayload } from "../src/types/becon.js";

const prisma = new PrismaClient();

const SAMPLE_JSON_PATH = path.resolve(__dirname, "../../docs/sample-becon-payload.json");

// Customer B: 4 scans, 30 days apart, with an overall upward trend plus one degraded
// Scalp Environment item at each step to exercise the §7.3 alcohol-minox copy.
const CUSTOMER_B_ID = "b1111111-2222-3333-4444-555555555555";

type ItemSeed = { itemKey: ItemKey; group: ItemGroup; score: number; rawValue: number | null; unit: string | null };

function itemsFromScoreset(scoreset: Record<ItemKey, number>): ItemSeed[] {
  const groups: Record<ItemKey, ItemGroup> = {
    DENSITY: "HAIR_STRENGTH",
    HAIRS_PER_FOLLICLE: "HAIR_STRENGTH",
    THICKNESS: "HAIR_STRENGTH",
    VOLUME: "HAIR_STRENGTH",
    SENSITIVITY: "SCALP_ENVIRONMENT",
    MOISTURE: "SCALP_ENVIRONMENT",
    SEBUM: "SCALP_ENVIRONMENT",
    DANDRUFF: "SCALP_ENVIRONMENT"
  };
  return (Object.entries(scoreset) as [ItemKey, number][]).map(([itemKey, score]) => ({
    itemKey,
    group: groups[itemKey],
    score,
    rawValue: null,
    unit: null
  }));
}

async function seedCustomerA() {
  const raw = fs.readFileSync(SAMPLE_JSON_PATH, "utf8");
  const payload = JSON.parse(raw) as BeconPayload;
  const extracted = extractFromPayload(payload);

  const treatmentStart = new Date();
  treatmentStart.setDate(treatmentStart.getDate() - 10); // 10 days → Weeks 0–8

  // Case 1 demo needs the latest scan to be 10 days ago so the booking card
  // shows PREMATURE. The Becon sample payload's `analysis_date` is fixed in
  // 2025-12-18, so we override it at seed time to stay in sync with the clock.
  const scanTimestamp = new Date();
  scanTimestamp.setDate(scanTimestamp.getDate() - 10);

  await prisma.customer.upsert({
    where: { id: extracted.customerId },
    create: {
      id: extracted.customerId,
      firstName: extracted.customer.firstName ?? "Testing",
      phoneNumber: extracted.customer.phoneNumber,
      gender: extracted.customer.gender,
      birth: extracted.customer.birth,
      email: extracted.customer.email,
      treatmentStartDate: treatmentStart,
      onAlcoholMinoxidil: false
    },
    update: { treatmentStartDate: treatmentStart, onAlcoholMinoxidil: false }
  });

  // Clear ad-hoc bookings so the Case 1 demo lands on the PREMATURE variant.
  await prisma.booking.deleteMany({ where: { customerId: extracted.customerId } });

  const hairStrength = computeHairStrength(extracted.items) ?? 0;
  const scalpEnv = computeScalpEnvironment(extracted.items) ?? 0;

  await prisma.scan.upsert({
    where: { id: extracted.scanId },
    create: {
      id: extracted.scanId,
      customerId: extracted.customerId,
      clinicId: extracted.clinicId,
      scanTimestamp,
      firmwareVersion: extracted.firmwareVersion ?? "1.0.0",
      scalpHealthScore: extracted.scalpHealthScore,
      hairStrengthScore: hairStrength,
      scalpEnvironmentScore: scalpEnv,
      rawPayload: JSON.stringify(payload),
      photos: JSON.stringify(extracted.photos),
      items: {
        create: extracted.items.map((i) => ({
          itemKey: i.itemKey,
          group: i.group,
          score: i.score,
          rawValue: i.rawValue,
          unit: i.unit
        }))
      }
    },
    update: { scanTimestamp, photos: JSON.stringify(extracted.photos) }
  });

  await prisma.treatmentPlan.upsert({
    where: { customerId: extracted.customerId },
    create: {
      customerId: extracted.customerId,
      startDate: treatmentStart,
      monthlyProducts: JSON.stringify(buildMonthlyProducts())
    },
    update: {}
  });

  console.log(`[seed] Customer A (${extracted.customerId}) → 1 scan (Case 1)`);
}

async function seedCustomerB() {
  const treatmentStart = new Date();
  treatmentStart.setDate(treatmentStart.getDate() - 130); // 130 days → Weeks 16+

  await prisma.customer.upsert({
    where: { id: CUSTOMER_B_ID },
    create: {
      id: CUSTOMER_B_ID,
      firstName: "Priya",
      phoneNumber: "+91 9000000001",
      gender: "F",
      birth: "15081990",
      email: "priya@example.com",
      treatmentStartDate: treatmentStart,
      onAlcoholMinoxidil: true
    },
    update: { treatmentStartDate: treatmentStart, onAlcoholMinoxidil: true }
  });

  // Four scans: ScalpHealth trends up overall; a couple of Scalp Environment items degrade
  // on the latest visit so the alcohol-minox reassurance copy fires.
  const monthlyScoresets: Array<Record<ItemKey, number>> = [
    // Month 1 (oldest) — starting point
    {
      DENSITY: 60,
      HAIRS_PER_FOLLICLE: 55,
      THICKNESS: 62,
      VOLUME: 58,
      SENSITIVITY: 70,
      MOISTURE: 65,
      SEBUM: 60,
      DANDRUFF: 72
    },
    // Month 2
    {
      DENSITY: 66,
      HAIRS_PER_FOLLICLE: 60,
      THICKNESS: 65,
      VOLUME: 62,
      SENSITIVITY: 74,
      MOISTURE: 70,
      SEBUM: 66,
      DANDRUFF: 78
    },
    // Month 3
    {
      DENSITY: 72,
      HAIRS_PER_FOLLICLE: 68,
      THICKNESS: 71,
      VOLUME: 67,
      SENSITIVITY: 78,
      MOISTURE: 74,
      SEBUM: 70,
      DANDRUFF: 80
    },
    // Month 4 (latest) — overall up, but SENSITIVITY + MOISTURE dip (alcohol-minox)
    {
      DENSITY: 78,
      HAIRS_PER_FOLLICLE: 74,
      THICKNESS: 75,
      VOLUME: 72,
      SENSITIVITY: 70, // degraded from 78
      MOISTURE: 68, // degraded from 74
      SEBUM: 74,
      DANDRUFF: 82
    }
  ];

  // Placeholder scalp photos for the demo. Real ingest will pull these from the
  // Becon payload's detail_items[*].images[] block.
  const PLACEHOLDER_PHOTOS = {
    front:
      "https://stg-assets.withbecon.com/result-scalp/20251204-050422-TdlaijcW7Lv6C0MYWsIq0_f632_duplicated.png",
    back:
      "https://stg-assets.withbecon.com/result-scalp/20251204-050505--V725ux9uE6QbEUhnrjgQ_1235_duplicated.png",
    side:
      "https://stg-assets.withbecon.com/result-scalp/20251204-050538-q_9x1Yv-IjIdeqyqK3Pdr_8e7a_duplicated.jpg",
    crown:
      "https://stg-assets.withbecon.com/result-scalp/20251204-050442-zOluwf2uEy66vah7fWDbo_6a17_duplicated.png",
    count: 4
  };

  for (let m = 0; m < monthlyScoresets.length; m++) {
    const scanId = 900001 + m; // stable ids for idempotent reseed
    const scanDate = new Date(treatmentStart);
    scanDate.setDate(scanDate.getDate() + m * 30);

    const items = itemsFromScoreset(monthlyScoresets[m]);
    const hairStrength = computeHairStrength(items) ?? 0;
    const scalpEnv = computeScalpEnvironment(items) ?? 0;
    const scalpHealth = Math.round((hairStrength + scalpEnv) / 2);

    await prisma.scan.upsert({
      where: { id: scanId },
      create: {
        id: scanId,
        customerId: CUSTOMER_B_ID,
        clinicId: "TS_TEST",
        scanTimestamp: scanDate,
        firmwareVersion: "1.0.0",
        scalpHealthScore: scalpHealth,
        hairStrengthScore: hairStrength,
        scalpEnvironmentScore: scalpEnv,
        rawPayload: JSON.stringify({ seed: true, monthIndex: m }),
        photos: JSON.stringify(PLACEHOLDER_PHOTOS),
        items: {
          create: items.map((i) => ({
            itemKey: i.itemKey,
            group: i.group,
            score: i.score,
            rawValue: i.rawValue,
            unit: i.unit
          }))
        }
      },
      update: { photos: JSON.stringify(PLACEHOLDER_PHOTOS) }
    });
  }

  await prisma.treatmentPlan.upsert({
    where: { customerId: CUSTOMER_B_ID },
    create: {
      customerId: CUSTOMER_B_ID,
      startDate: treatmentStart,
      monthlyProducts: JSON.stringify(buildMonthlyProducts())
    },
    update: {}
  });

  // A pending booking far enough out that Case 2 shows it as a pill.
  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + 5);
  scheduled.setHours(11, 40, 0, 0);
  const existing = await prisma.booking.findFirst({
    where: { customerId: CUSTOMER_B_ID, status: "BOOKED" }
  });
  if (!existing) {
    await prisma.booking.create({
      data: { customerId: CUSTOMER_B_ID, scheduledAt: scheduled }
    });
  }

  console.log(`[seed] Customer B (${CUSTOMER_B_ID}) → 4 scans (Case 2, on alcohol-Minoxidil)`);
}

function buildMonthlyProducts() {
  return [
    {
      monthIndex: 0,
      products: [
        { name: "Defence Shampoo", purpose: "Calms scalp, reduces sensitivity" },
        { name: "Minoxidil 5%", purpose: "Activates follicles" },
        { name: "Nutri Hair Tablets", purpose: "Internal nourishment" }
      ]
    },
    {
      monthIndex: 1,
      products: [
        { name: "Defence Shampoo", purpose: "Scalp care" },
        { name: "Minoxidil 5%", purpose: "Activates follicles" },
        { name: "Nutri Hair Tablets", purpose: "Internal nourishment" },
        { name: "Hair Vitalizer", purpose: "Supports thickness" }
      ]
    },
    {
      monthIndex: 2,
      products: [
        { name: "Hair Growth Serum", purpose: "Boosts density" },
        { name: "Minoxidil 5%", purpose: "Activates follicles" },
        { name: "Nutri Hair Tablets", purpose: "Internal nourishment" }
      ]
    },
    {
      monthIndex: 3,
      products: [
        { name: "Hair Growth Serum", purpose: "Boosts density" },
        { name: "Minoxidil 5%", purpose: "Activates follicles" },
        { name: "Nutri Hair Tablets", purpose: "Internal nourishment" },
        { name: "Strength Conditioner", purpose: "Strand strength" }
      ]
    },
    {
      monthIndex: 4,
      products: [
        { name: "Hair Growth Serum", purpose: "Boosts density" },
        { name: "Minoxidil 5%", purpose: "Activates follicles" },
        { name: "Nutri Hair Tablets", purpose: "Internal nourishment" }
      ]
    },
    {
      monthIndex: 5,
      products: [
        { name: "Maintenance Shampoo", purpose: "Maintains scalp health" },
        { name: "Nutri Hair Tablets", purpose: "Internal nourishment" }
      ]
    }
  ];
}

async function main() {
  await seedCustomerA();
  await seedCustomerB();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

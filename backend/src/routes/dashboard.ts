import { Router } from "express";
import { prisma } from "../db.js";
import { requireCustomer } from "../middleware/customer.js";
import { bandFor } from "../services/scores.js";
import { CONSUMER_LABEL } from "../services/becon-mapper.js";
import { buildCase1Summary, buildCase2Group } from "../services/summary.js";
import { daysSince, phaseFor, PHASE_COPY } from "../services/phase.js";
import { buildKitJourney } from "../services/kits.js";
import type { ScanPhotos } from "../services/becon-mapper.js";
import type { ItemKey } from "../enums.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireCustomer);

const DISCLAIMER =
  "This score is a tracking tool to help you and your Traya team monitor progress. It is not a medical diagnosis. Please consult your Traya doctor for treatment decisions.";

dashboardRouter.get("/", async (req, res) => {
  const customer = req.customer!;

  const scans = await prisma.scan.findMany({
    where: { customerId: customer.id },
    orderBy: { scanTimestamp: "desc" },
    include: { items: true }
  });

  if (scans.length === 0) {
    return res.status(409).json({ error: "no_scan_on_record" });
  }

  const latest = scans[0];
  const previous = scans[1];
  const isCase2 = scans.length >= 2;

  const parsePhotos = (raw: string | null): ScanPhotos => {
    if (!raw) return { count: 0 };
    try {
      return JSON.parse(raw) as ScanPhotos;
    } catch {
      return { count: 0 };
    }
  };

  const latestScan = {
    id: latest.id,
    scanTimestamp: latest.scanTimestamp,
    firmwareVersion: latest.firmwareVersion,
    scalpHealthScore: latest.scalpHealthScore,
    hairStrengthScore: latest.hairStrengthScore,
    scalpEnvironmentScore: latest.scalpEnvironmentScore,
    bands: {
      scalpHealth: bandFor(latest.scalpHealthScore),
      hairStrength: bandFor(latest.hairStrengthScore),
      scalpEnvironment: bandFor(latest.scalpEnvironmentScore)
    },
    photos: parsePhotos(latest.photos),
    items: latest.items.map((i) => ({
      itemKey: i.itemKey as ItemKey,
      label: CONSUMER_LABEL[i.itemKey as ItemKey],
      group: i.group,
      score: i.score,
      rawValue: i.rawValue,
      unit: i.unit,
      band: bandFor(i.score).band
    }))
  };

  // Trend for Case 2 — chronological order (oldest first).
  const chrono = [...scans].reverse();
  const trend = isCase2
    ? {
        scalpHealth: chrono.map((s) => ({ scanDate: s.scanTimestamp, score: s.scalpHealthScore })),
        hairStrength: chrono.map((s) => ({ scanDate: s.scanTimestamp, score: s.hairStrengthScore })),
        scalpEnvironment: chrono.map((s) => ({ scanDate: s.scanTimestamp, score: s.scalpEnvironmentScore })),
        firmwareMismatch:
          latest.firmwareVersion != null &&
          previous?.firmwareVersion != null &&
          latest.firmwareVersion !== previous.firmwareVersion
      }
    : undefined;

  const summary = isCase2
    ? {
        case2: {
          hairStrength: buildCase2Group(latest.items, previous!.items, "HAIR_STRENGTH", customer.onAlcoholMinoxidil),
          scalpEnvironment: buildCase2Group(
            latest.items,
            previous!.items,
            "SCALP_ENVIRONMENT",
            customer.onAlcoholMinoxidil
          )
        }
      }
    : {
        case1: buildCase1Summary(latest.items)
      };

  // Monthly goal — phase + products from TreatmentPlan.
  const plan = await prisma.treatmentPlan.findUnique({ where: { customerId: customer.id } });
  let monthlyGoal: {
    phase: string;
    phaseCopy: string;
    currentMonth: { name: string; purpose: string }[];
    nextMonth: { name: string; purpose: string }[];
  } | null = null;

  if (plan && customer.treatmentStartDate) {
    const phase = phaseFor(customer.treatmentStartDate);
    const monthsIn = Math.max(0, Math.floor(daysSince(customer.treatmentStartDate) / 30));
    const monthly = JSON.parse(plan.monthlyProducts) as Array<{
      monthIndex: number;
      products: { name: string; purpose: string }[];
    }>;
    const currentMonth = monthly.find((m) => m.monthIndex === monthsIn)?.products ?? [];
    const nextMonth = monthly.find((m) => m.monthIndex === monthsIn + 1)?.products ?? [];
    monthlyGoal = {
      phase: phase ?? "weeks_0_8",
      phaseCopy: PHASE_COPY[phase ?? "weeks_0_8"],
      currentMonth,
      nextMonth
    };
  }

  // Booking component state — PRD §5.4.
  const existing = await prisma.booking.findFirst({
    where: { customerId: customer.id, status: "BOOKED", scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" }
  });
  const daysSinceLatestScan = daysSince(latest.scanTimestamp);
  const component = daysSinceLatestScan >= 25 ? "MATURE" : "PREMATURE";
  const booking = {
    existing: existing ? { id: existing.id, scheduledAt: existing.scheduledAt } : null,
    component,
    daysSinceLatestScan,
    rationale: "Regular scans help you and your Traya doctor track progress and adjust your plan."
  };

  const kitJourney = buildKitJourney(customer.treatmentStartDate);

  // Deltas used by the photo-thumbnail chips in Case 2.
  const deltas = isCase2
    ? {
        scalpHealth: latest.scalpHealthScore - previous!.scalpHealthScore,
        hairStrength: latest.hairStrengthScore - previous!.hairStrengthScore,
        scalpEnvironment: latest.scalpEnvironmentScore - previous!.scalpEnvironmentScore
      }
    : null;

  res.json({
    case: isCase2 ? "CASE_2" : "CASE_1",
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      onAlcoholMinoxidil: customer.onAlcoholMinoxidil
    },
    latestScan,
    trend,
    deltas,
    summary,
    monthlyGoal,
    booking,
    kitJourney,
    disclaimer: DISCLAIMER
  });
});

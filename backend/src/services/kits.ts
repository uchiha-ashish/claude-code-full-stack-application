import { daysSince } from "./phase.js";

export const TOTAL_KITS = 8;

export interface KitRow {
  index: number;
  title: string;
  body: string;
  isCurrent: boolean;
}

// Phase-1 placeholder kit copy. Final strings to be confirmed with the medical team.
const KIT_COPY: Array<{ title: string; body: string }> = [
  { title: "Healthy Scalp - Set the Foundation", body: "We calm the scalp and prep the environment for regrowth." },
  { title: "Nourish the Roots", body: "Building follicle strength from the inside out." },
  { title: "Activate Growth", body: "Stimulating follicles to wake up and produce new hair." },
  { title: "Healthy Hair - Strong from Root", body: "Nutritional deficiencies cause hair fall in almost 50% of cases." },
  { title: "Improve Density", body: "Nutritional deficiencies cause hair fall in almost 50% of cases." },
  { title: "Thicken Strands", body: "Hair shafts gain diameter and resilience." },
  { title: "Build Volume", body: "Visible fullness and coverage across the scalp." },
  { title: "Lock In Results", body: "Consolidate gains and prepare for maintenance." }
];

export function currentKitIndex(treatmentStartDate: Date | null | undefined, now: Date = new Date()): number {
  if (!treatmentStartDate) return 1;
  const days = Math.max(0, daysSince(treatmentStartDate, now));
  const idx = Math.floor(days / 30) + 1;
  return Math.max(1, Math.min(TOTAL_KITS, idx));
}

export function buildKitJourney(treatmentStartDate: Date | null | undefined, now: Date = new Date()) {
  const current = currentKitIndex(treatmentStartDate, now);
  const kits: KitRow[] = KIT_COPY.map((k, i) => ({
    index: i + 1,
    title: k.title,
    body: k.body,
    isCurrent: i + 1 === current
  }));
  const percentLeft = Math.round(((TOTAL_KITS - current) / TOTAL_KITS) * 100);
  return {
    currentKitIndex: current,
    totalKits: TOTAL_KITS,
    percentLeft,
    kits
  };
}

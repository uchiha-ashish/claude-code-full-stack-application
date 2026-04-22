export type TreatmentPhase = "weeks_0_8" | "weeks_8_16" | "weeks_16_plus";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSince(from: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - from.getTime()) / MS_PER_DAY);
}

export function phaseFor(treatmentStartDate: Date | null | undefined, now: Date = new Date()): TreatmentPhase | null {
  if (!treatmentStartDate) return null;
  const d = daysSince(treatmentStartDate, now);
  if (d < 0) return null;
  if (d <= 56) return "weeks_0_8";
  if (d <= 112) return "weeks_8_16";
  return "weeks_16_plus";
}

export const PHASE_COPY: Record<TreatmentPhase, string> = {
  weeks_0_8:
    "Treatment focuses on creating the right scalp environment for growth. Your Scalp Health Score should improve first (calmer, hydrated, balanced). Hair Strength will likely not move yet — that is normal and expected.",
  weeks_8_16:
    "Growth response phase. Watch for improvements in Hair Thickness and Follicle Fullness. Hair Strength should start to climb.",
  weeks_16_plus:
    "Results become visible. Hair Strength reflects real changes in how hair is growing. The biggest gains are typically between months 4 and 8."
};

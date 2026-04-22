import type { ItemGroup, ItemKey } from "../enums.js";
import { MappedScanItem } from "./becon-mapper.js";

export type Band = "warning" | "caution" | "normal" | "healthy";

export interface BandInfo {
  band: Band;
  label: "Warning" | "Caution" | "Normal" | "Healthy";
}

export function bandFor(score: number): BandInfo {
  // PRD §4.3 — 0–50 Warning, 50–70 Caution, 70–86 Normal, 86–100 Healthy.
  // Lower-inclusive boundaries: 50 -> Caution, 70 -> Normal, 86 -> Healthy.
  if (score < 50) return { band: "warning", label: "Warning" };
  if (score < 70) return { band: "caution", label: "Caution" };
  if (score < 86) return { band: "normal", label: "Normal" };
  return { band: "healthy", label: "Healthy" };
}

function averageOfGroup(items: MappedScanItem[], group: ItemGroup): number | null {
  const present = items.filter((i) => (i.group as ItemGroup) === group && Number.isFinite(i.score));
  if (present.length === 0) return null;
  const sum = present.reduce((acc, i) => acc + i.score, 0);
  return Math.round(sum / present.length);
}

export function computeHairStrength(items: MappedScanItem[]): number | null {
  return averageOfGroup(items, "HAIR_STRENGTH");
}

export function computeScalpEnvironment(items: MappedScanItem[]): number | null {
  return averageOfGroup(items, "SCALP_ENVIRONMENT");
}

export const GROUP_OF: Record<ItemKey, ItemGroup> = {
  DENSITY: "HAIR_STRENGTH",
  HAIRS_PER_FOLLICLE: "HAIR_STRENGTH",
  THICKNESS: "HAIR_STRENGTH",
  VOLUME: "HAIR_STRENGTH",
  SENSITIVITY: "SCALP_ENVIRONMENT",
  MOISTURE: "SCALP_ENVIRONMENT",
  SEBUM: "SCALP_ENVIRONMENT",
  DANDRUFF: "SCALP_ENVIRONMENT"
};

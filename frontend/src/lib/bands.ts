import { Band, BandLabel } from "./types";

export function bandFor(score: number): { band: Band; label: BandLabel } {
  if (score < 50) return { band: "warning", label: "Warning" };
  if (score < 70) return { band: "caution", label: "Caution" };
  if (score < 86) return { band: "normal", label: "Normal" };
  return { band: "healthy", label: "Healthy" };
}

export const BAND_HEX: Record<Band, string> = {
  warning: "#EF4444",
  caution: "#F59E0B",
  normal: "#10B981",
  healthy: "#059669"
};

export const BAND_BG_CLASS: Record<Band, string> = {
  warning: "bg-band-warning/10 text-band-warning border-band-warning/30",
  caution: "bg-band-caution/10 text-band-caution border-band-caution/30",
  normal: "bg-band-normal/10 text-band-normal border-band-normal/30",
  healthy: "bg-band-healthy/10 text-band-healthy border-band-healthy/30"
};

export const BAND_RING_CLASS: Record<Band, string> = {
  warning: "stroke-band-warning",
  caution: "stroke-band-caution",
  normal: "stroke-band-normal",
  healthy: "stroke-band-healthy"
};

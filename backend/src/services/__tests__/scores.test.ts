import { describe, expect, it } from "vitest";
import { bandFor, computeHairStrength, computeScalpEnvironment } from "../scores.js";
import type { MappedScanItem } from "../becon-mapper.js";

const item = (itemKey: any, group: any, score: number): MappedScanItem => ({
  itemKey,
  group,
  score,
  rawValue: null,
  unit: null
});

describe("bandFor", () => {
  it("applies PRD §4.3 thresholds", () => {
    expect(bandFor(0).band).toBe("warning");
    expect(bandFor(49).band).toBe("warning");
    expect(bandFor(50).band).toBe("caution");
    expect(bandFor(69).band).toBe("caution");
    expect(bandFor(70).band).toBe("normal");
    expect(bandFor(85).band).toBe("normal");
    expect(bandFor(86).band).toBe("healthy");
    expect(bandFor(100).band).toBe("healthy");
  });
});

describe("computed scores", () => {
  const items: MappedScanItem[] = [
    item("DENSITY", "HAIR_STRENGTH", 91),
    item("HAIRS_PER_FOLLICLE", "HAIR_STRENGTH", 73),
    item("THICKNESS", "HAIR_STRENGTH", 89),
    item("VOLUME", "HAIR_STRENGTH", 70),
    item("SENSITIVITY", "SCALP_ENVIRONMENT", 50),
    item("MOISTURE", "SCALP_ENVIRONMENT", 76),
    item("SEBUM", "SCALP_ENVIRONMENT", 78),
    item("DANDRUFF", "SCALP_ENVIRONMENT", 96)
  ];

  it("computes Hair Strength as rounded average of 4 items", () => {
    expect(computeHairStrength(items)).toBe(Math.round((91 + 73 + 89 + 70) / 4));
  });

  it("computes Scalp Environment as rounded average of 4 items", () => {
    expect(computeScalpEnvironment(items)).toBe(Math.round((50 + 76 + 78 + 96) / 4));
  });

  it("excludes missing items from the average (PRD §8.5)", () => {
    const partial = items.filter((i) => i.itemKey !== "DENSITY");
    expect(computeHairStrength(partial)).toBe(Math.round((73 + 89 + 70) / 3));
  });

  it("returns null when no items exist for a group", () => {
    expect(computeHairStrength([])).toBeNull();
  });
});

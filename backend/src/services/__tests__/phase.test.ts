import { describe, expect, it } from "vitest";
import { phaseFor } from "../phase.js";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

describe("phaseFor", () => {
  it("returns weeks_0_8 for days 0-56", () => {
    expect(phaseFor(daysAgo(0))).toBe("weeks_0_8");
    expect(phaseFor(daysAgo(10))).toBe("weeks_0_8");
    expect(phaseFor(daysAgo(56))).toBe("weeks_0_8");
  });
  it("returns weeks_8_16 for days 57-112", () => {
    expect(phaseFor(daysAgo(57))).toBe("weeks_8_16");
    expect(phaseFor(daysAgo(80))).toBe("weeks_8_16");
    expect(phaseFor(daysAgo(112))).toBe("weeks_8_16");
  });
  it("returns weeks_16_plus for day 113+", () => {
    expect(phaseFor(daysAgo(113))).toBe("weeks_16_plus");
    expect(phaseFor(daysAgo(200))).toBe("weeks_16_plus");
  });
  it("returns null when no start date", () => {
    expect(phaseFor(null)).toBeNull();
  });
});

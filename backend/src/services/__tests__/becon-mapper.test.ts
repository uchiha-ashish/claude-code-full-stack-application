import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractFromPayload, BECON_TO_TRAYA } from "../becon-mapper.js";
import type { BeconPayload } from "../../types/becon.js";

const SAMPLE = path.resolve(__dirname, "../../../../docs/sample-becon-payload.json");

describe("becon-mapper", () => {
  it("maps 8 retained items from the sample payload", () => {
    const payload = JSON.parse(fs.readFileSync(SAMPLE, "utf8")) as BeconPayload;
    const extracted = extractFromPayload(payload);
    expect(extracted.items.length).toBe(8);
    const keys = new Set(extracted.items.map((i) => i.itemKey));
    expect(keys).toEqual(
      new Set(["DENSITY", "HAIRS_PER_FOLLICLE", "THICKNESS", "VOLUME", "SENSITIVITY", "MOISTURE", "SEBUM", "DANDRUFF"])
    );
    for (const it of extracted.items) {
      expect(Number.isInteger(it.score)).toBe(true);
    }
  });

  it("drops discarded Becon parameters (TEMPERATURE, GAS, etc.)", () => {
    expect(BECON_TO_TRAYA["TEMPERATURE"]).toBeUndefined();
    expect(BECON_TO_TRAYA["GAS"]).toBeUndefined();
  });

  it("uses Becon composite_scalp_score as-is (PRD §7.4)", () => {
    const payload = JSON.parse(fs.readFileSync(SAMPLE, "utf8")) as BeconPayload;
    const extracted = extractFromPayload(payload);
    expect(extracted.scalpHealthScore).toBe(payload.composite_scalp_result.result.overview.composite_scalp_score);
  });
});

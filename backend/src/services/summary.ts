import type { ScanItemScore } from "@prisma/client";
import type { ItemGroup, ItemKey } from "../enums.js";
import { bandFor } from "./scores.js";
import { CONSUMER_LABEL } from "./becon-mapper.js";

export interface SummaryRow {
  itemKey: ItemKey;
  label: string;
  score: number;
  band: ReturnType<typeof bandFor>["band"];
  description: string;
  expectation: string;
}

export interface DeltaRow extends SummaryRow {
  delta: number;
  previousScore: number;
  direction: "up" | "down";
}

// PRD §7.1 — directional, timeline-framed, no diagnostic / efficacy / comparative language.
// Content is phase-1 placeholder pending medical-team copy finalization.
const DESCRIPTIONS: Record<ItemKey, string> = {
  DENSITY: "How thickly packed your hair follicles are across the scalp.",
  HAIRS_PER_FOLLICLE: "Number of hairs growing from each follicle.",
  THICKNESS: "Diameter of individual hair strands.",
  VOLUME: "Overall hair coverage on the scalp.",
  SENSITIVITY: "How calm and non-reactive your scalp is.",
  MOISTURE: "Hydration level of the scalp surface.",
  SEBUM: "Oil balance across the scalp.",
  DANDRUFF: "Scalp clarity and freedom from flakes."
};

const HEALTHY_EXPECTATION: Record<ItemKey, string> = {
  DENSITY: "Maintain this with your current plan; re-scan in 30 days to confirm.",
  HAIRS_PER_FOLLICLE: "Continue your plan; this area is on track.",
  THICKNESS: "Keep going — thickness builds slowly, and you're tracking well.",
  VOLUME: "Maintain current habits and products; re-scan to confirm stability.",
  SENSITIVITY: "Your scalp environment is calm; maintain the routine.",
  MOISTURE: "Hydration is in a good range; keep up your routine.",
  SEBUM: "Oil is balanced; continue your current care.",
  DANDRUFF: "Scalp is clear; maintain your current plan."
};

const IMPROVE_EXPECTATION: Record<ItemKey, string> = {
  DENSITY: "Density responds at 16+ weeks. Stay consistent with your plan.",
  HAIRS_PER_FOLLICLE: "Follicle fullness typically improves between 8–16 weeks.",
  THICKNESS: "Thickness responds at 8–16+ weeks; consistency matters most.",
  VOLUME: "Visible changes in volume typically appear between 16–32 weeks.",
  SENSITIVITY: "Scalp calm usually improves within 4–8 weeks of a focused plan.",
  MOISTURE: "Hydration typically improves within 4–8 weeks.",
  SEBUM: "Oil balance responds at 4–8 weeks of consistent care.",
  DANDRUFF: "Scalp clarity generally improves within 4–8 weeks."
};

// PRD §7.3 — alcohol Minoxidil reassurance for degraded Scalp Environment items.
const ALCOHOL_MINOX_COPY: Partial<Record<ItemKey, string>> = {
  SENSITIVITY: "Temporary dip is a known effect of alcohol-based Minoxidil, not a regression. Expect recovery as your scalp adjusts.",
  MOISTURE: "Alcohol-based Minoxidil can temporarily reduce hydration. This is expected and typically self-corrects.",
  DANDRUFF: "Mild flaking can occur from alcohol-based Minoxidil. This is temporary as your scalp adjusts."
};

export function buildCase1Summary(items: ScanItemScore[]): {
  goodThings: SummaryRow[];
  improvementAreas: SummaryRow[];
} {
  const rows: SummaryRow[] = items.map((i) => {
    const key = i.itemKey as ItemKey;
    return {
      itemKey: key,
      label: CONSUMER_LABEL[key],
      score: i.score,
      band: bandFor(i.score).band,
      description: DESCRIPTIONS[key],
      expectation: i.score >= 70 ? HEALTHY_EXPECTATION[key] : IMPROVE_EXPECTATION[key]
    };
  });

  return {
    goodThings: rows.filter((r) => r.score >= 70),
    improvementAreas: rows.filter((r) => r.score < 70)
  };
}

export interface GroupDelta {
  improved: DeltaRow[];
  degraded: DeltaRow[];
}

export function buildCase2Group(
  currentItems: ScanItemScore[],
  previousItems: ScanItemScore[],
  group: ItemGroup,
  onAlcoholMinoxidil: boolean
): GroupDelta {
  const prevByKey = new Map(previousItems.map((i) => [i.itemKey as ItemKey, i]));
  const rows: DeltaRow[] = [];

  for (const cur of currentItems) {
    const curKey = cur.itemKey as ItemKey;
    const curGroup = cur.group as ItemGroup;
    if (curGroup !== group) continue;
    const prev = prevByKey.get(curKey);
    if (!prev) continue;
    const delta = cur.score - prev.score;
    if (delta === 0) continue;
    const direction: "up" | "down" = delta > 0 ? "up" : "down";

    const baseExpectation =
      direction === "up" ? HEALTHY_EXPECTATION[curKey] : IMPROVE_EXPECTATION[curKey];

    const expectation =
      direction === "down" && group === "SCALP_ENVIRONMENT" && onAlcoholMinoxidil && ALCOHOL_MINOX_COPY[curKey]
        ? ALCOHOL_MINOX_COPY[curKey]!
        : baseExpectation;

    rows.push({
      itemKey: curKey,
      label: CONSUMER_LABEL[curKey],
      score: cur.score,
      band: bandFor(cur.score).band,
      description: DESCRIPTIONS[curKey],
      expectation,
      delta,
      previousScore: prev.score,
      direction
    });
  }

  return {
    improved: rows.filter((r) => r.direction === "up"),
    degraded: rows.filter((r) => r.direction === "down")
  };
}

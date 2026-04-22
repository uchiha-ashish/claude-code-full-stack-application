---
name: PRD section → authoritative copy/behavior lookup
description: Quick lookup for the PRD's load-bearing sections and their exact text/thresholds.
type: reference
---

Source of truth: `C:\Users\Traya\Desktop\progress tracking page\prd_extracted.txt`.

**§4.3 — Band thresholds (uniform, score higher = better)**
- 0–50 Warning, 50–70 Caution, 70–86 Normal, 86–100 Healthy. Lower-inclusive boundaries: 50→Caution, 70→Normal, 86→Healthy.

**§5.4 — Booking states**
- PREMATURE if `daysSinceLatestScan < 25`; else MATURE. Third UI state: existing booking = "Your scan is booked + Rescheduled".

**§6.1 / §8.3 — Phase copy windows**
- Weeks 0–8: days 0–56 — "Treatment focuses on creating the right scalp environment for growth…"
- Weeks 8–16: days 57–112 — "Growth response phase. Watch for improvements in Hair Thickness and Follicle Fullness…"
- Weeks 16+: days 113+ — "Results become visible. Hair Strength reflects real changes in how hair is growing…"

**§7.2 — Mandatory disclaimer (EXACT TEXT, must render at bottom in both cases)**
"This score is a tracking tool to help you and your Traya team monitor progress. It is not a medical diagnosis. Please consult your Traya doctor for treatment decisions."

**§7.3 — Alcohol-Minoxidil reassurance (Case 2 only)**
Triggers when `group === "SCALP_ENVIRONMENT"`, `direction === "down"`, and `customer.onAlcoholMinoxidil === true`. Applies to SENSITIVITY, MOISTURE, DANDRUFF (SEBUM falls through to the standard IMPROVE_EXPECTATION).

**§5.2 / §5.3 / §6 — Monthly goal**
BOTH Case 1 and Case 2 must render **this month AND next month's product pills**, plus phase-copy one-line explanation.

**§7.1 — Language guardrails**
No diagnosis ("you have X"), no efficacy ("your treatment is working"), no comparisons ("better than 80%"). Always directional + timeline-framed.

**§8.5 — Edge state fallbacks**
- No treatment plan: "Your plan will appear here once your doctor finalizes it."
- Missing parameter in a scan: exclude from group average, show "Data not available" in the row.
- Cross-version firmware in Case 2: inline note flags methodology change.

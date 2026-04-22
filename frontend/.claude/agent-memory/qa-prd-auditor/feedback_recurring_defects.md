---
name: Recurring defect patterns in ScalpScan frontend
description: Known frontend anti-patterns — backend-computed payload fields that the UI silently drops — to check on every audit.
type: feedback
---

Whenever the backend adds a new field to `/api/dashboard`, verify the frontend actually renders it. In this codebase several payload fields are computed server-side but never consumed by the UI.

**Why:** noticed during the first audit pass — three separate PRD-mandatory fields were all dropped: `disclaimer`, `monthlyGoal.phaseCopy`, `monthlyGoal.nextMonth`. The pattern is "backend knows, UI forgot."

**How to apply:**
- Before signing off on any dashboard change, grep `frontend/src/app/dashboard/page.tsx` and `components/dashboard/*` for each top-level payload key. If a field is in `DashboardPayload` (types.ts) but has zero references under `src/`, open a bug.
- Commonly dropped fields so far: `data.disclaimer`, `data.monthlyGoal.phaseCopy`, `data.monthlyGoal.nextMonth`.
- The frontend sometimes hard-codes a divergent version in `lib/copy.ts` (e.g. `DISCLAIMER`). When PRD copy is mandatory, always verify against the backend `disclaimer` field rather than the local constant.

**Secondary pattern:** `ScoreBadge` is a defined component never referenced. When cleaning up code, confirm with design whether rating-badge should appear on score tiles — design screenshots don't show it, but PRD §5.2 says "rating badge" for Case 1 Hair Strength / Scalp Environment tiles.

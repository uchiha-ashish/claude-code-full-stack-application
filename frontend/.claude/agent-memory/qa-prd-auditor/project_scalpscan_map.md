---
name: ScalpScan Phase-1 project map
description: Repo layout, ports, demo customer ids, and PRD → code mapping for the Traya ScalpScan dashboard.
type: project
---

Traya ScalpScan Phase-1 is a Next.js 14 (App Router) mobile-width dashboard backed by Express + Prisma + SQLite.

**Ports / environment**
- Backend dev: `http://localhost:4001` (CLAUDE.md says 4000, but the running env uses 4001 — always confirm with `curl /health`).
- Frontend dev: `http://localhost:3002`.

**Demo customer ids**
- Case 1 (1 scan, Customer A): `0314683c-44c2-4383-b94d-efaaa5b4e7c8`. Seed loads from `response after scalp test is completed.txt`, so `Scan.scanTimestamp = 2025-12-18T06:41:07Z` (the payload's `analysis_date`), NOT `now - 10 days` as the audit brief implies. This makes `daysSinceLatestScan` large in current time and forces the MATURE booking variant instead of PREMATURE.
- Case 2 (4 scans, on alcohol-Minoxidil, Customer B / Priya): `b1111111-2222-3333-4444-555555555555`.

**Why:** the seed's Customer A is intended to demo Case 1 with a premature booking window, but the scan timestamp isn't stamped at seed time.

**How to apply:** when auditing the PREMATURE booking state for Case 1, don't trust the default seed — either reseed with a manual `scanTimestamp = now - 10d` or drop the existing bookings + patch the Scan row.

**PRD → code mapping (quick index)**
- Banding: `backend/src/services/scores.ts:11` (`bandFor`) duplicated in `frontend/src/lib/bands.ts:3`.
- Alcohol-Minox copy (PRD §7.3): `backend/src/services/summary.ts:57` (`ALCOHOL_MINOX_COPY`).
- Phase copy (PRD §2.1/§7.2): `backend/src/services/phase.ts:18` (`PHASE_COPY`).
- Booking states (PRD §5.4): computed in `backend/src/routes/dashboard.ts:129-135`; rendered in `frontend/src/components/dashboard/NextMilestoneCard.tsx`.
- Customer scoping middleware: `backend/src/middleware/customer.ts`.
- Mandatory disclaimer (PRD §7.2): backend sends correct text via `dashboard.disclaimer`; frontend `components/dashboard/Disclaimer.tsx` uses `copy.ts:DISCLAIMER` which DIVERGES from the PRD text.

**Component inventory (frontend/src/components/dashboard)**
AfterJourneyCard, AiNutritionistCard, CurrentKitSection, Disclaimer, ExpandableMetricRow, FirmwareNote, KitJourneySection, MetricList, NextMilestoneCard, OverallScoreCard, ProductCard, ScalpPhotoThumbnail, ScanTimestamp, ScoreBadge (unused), SecondaryScoresRow, SecondaryScoreTile, ShareResultsBar, TrendChart.

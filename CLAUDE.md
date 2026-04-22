# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Monorepo (no workspaces — each side has its own `package.json`):

- `backend/` — Node 20 + Express + Prisma + SQLite (PRD-driven scan ingest + dashboard API)
- `frontend/` — Next.js 14 App Router + Tailwind + Recharts (single mobile-width dashboard page)
- `docs/prd.txt` / `docs/prd.docx` — product requirements; source of truth for banding, phase copy, and Case 1 vs Case 2 behavior
- `docs/sample-becon-payload.json` — sample Becon webhook payload used by both the seed script and `curl` examples
- `docs/design/` — UI mocks (source of truth for layout & copy)

## Commands

Backend (`cd backend`):

```bash
npm run dev            # tsx watch on http://localhost:4000
npm run build          # tsc → dist/
npm start              # node dist/index.js
npm run seed           # tsx prisma/seed.ts (loads sample payload + seeds Customer B)
npm test               # vitest run (all)
npx vitest run src/services/__tests__/scores.test.ts   # single file
npx vitest run -t "bandFor"                            # single test by name
npx prisma migrate dev --name <name>
npx prisma generate
```

Frontend (`cd frontend`):

```bash
npm run dev            # next dev on :3000
npm run build
npm run lint           # next lint
```

No root-level scripts — always `cd` into `backend/` or `frontend/` first.

## Architecture

### Data flow

1. **Ingest** (`POST /api/scans/webhook`): a Becon "composite_scalp_result" payload arrives. `services/becon-mapper.ts` translates Becon item names (e.g. `HAIR_FOLLICLE_DENSITY`) into the 8 internal `ItemKey`s and splits them into two groups (`HAIR_STRENGTH`, `SCALP_ENVIRONMENT`). `services/scores.ts` averages each group to derive `hairStrengthScore` / `scalpEnvironmentScore`; `scalpHealthScore` comes directly from Becon's composite. Ingest is idempotent on `composite_scalp_result.id` (= `Scan.id`).
2. **Read** (`GET /api/dashboard`): `routes/dashboard.ts` loads all scans for the customer and branches on scan count: **Case 1** (1 scan) returns `summary.case1` with `goodThings` / `improvementAreas`; **Case 2** (≥2 scans) returns `summary.case2` with per-item deltas and a chronological `trend` series. The same endpoint also computes treatment phase + monthly products (from `TreatmentPlan.monthlyProducts` JSON) and booking component state (`MATURE` if ≥25 days since latest scan, else `PREMATURE`).
3. **Render**: `frontend/src/app/dashboard/page.tsx` is a server component that calls `fetchDashboard` and conditionally renders Case 1 vs Case 2 subtrees. No client-side data fetching for the main payload.

### Key invariants (from the PRD — change only with reason)

- **Banding thresholds** live in `backend/src/services/scores.ts` (`bandFor`) and are duplicated in `frontend/src/lib/bands.ts`. Keep them in sync: `<50 warning`, `<70 caution`, `<86 normal`, `≥86 healthy`.
- **Treatment phase buckets** in `backend/src/services/phase.ts`: days 0–56 → `weeks_0_8`, 57–112 → `weeks_8_16`, else `weeks_16_plus`. `PHASE_COPY` is the user-facing text for each.
- **Alcohol-Minoxidil reassurance copy** in `services/summary.ts` (`ALCOHOL_MINOX_COPY`) only applies when direction is `down`, group is `SCALP_ENVIRONMENT`, and `customer.onAlcoholMinoxidil` is true — mirrors PRD §7.3.
- **Consumer-facing item labels** are centralized in `CONSUMER_LABEL` (backend) and must match what the frontend renders. The internal `ItemKey` / `ItemGroup` unions live in `backend/src/enums.ts` (Prisma enums aren't supported on SQLite, so these are app-layer only).

### Auth / customer scoping

Every `/api/dashboard`, `/api/bookings`, `/api/hair-progress`, and `/api/treatment-plan` route goes through `middleware/customer.ts`, which composes:
1. `verifyCustomerSignature` (from `middleware/security.ts`) — if `AUTH_SIGNING_SECRET` is set (required in production), enforces `x-traya-signature = HMAC-SHA256(`${customerId}.${isoMinute}`, secret)` with a ±1 minute skew window. Without this, `x-traya-customer-id` alone would be a direct-object-reference.
2. Identity check — validates the header is a UUID v4, looks up the customer, attaches to `req.customer`.

The webhook route (`POST /api/scans/webhook`) instead uses `verifyBeconWebhook` — HMAC-SHA256 of the raw body using `BECON_WEBHOOK_SECRET`, sent in `x-becon-signature`. In production, a missing secret causes the route to 503; in dev it falls through so local curl-based ingest still works.

The frontend passes the customer id header through `fetchDashboard` / `createBooking` / `rescheduleBooking` / `fetchHairProgress` in `frontend/src/lib/api.ts`; for the demo page, the id comes from `?c=` or `DEMO_CUSTOMER_ID`. The frontend does **not** currently sign requests — the app shell that owns authentication needs to add the `x-traya-signature` header before calling the API in production.

### Production security posture

`backend/src/index.ts` mounts: `helmet` (HSTS, nosniff, frame-deny, Referrer-Policy, same-site CORP), `cors` with `FRONTEND_ORIGIN` parsed as a comma-separated allowlist, `express-rate-limit` (global 120 req/min in prod, 600 in dev), per-route limiters on writes, `trust proxy` set for correct IP extraction behind an LB. `middleware/security.ts` exposes `errorHandler` that never leaks stack traces or `err.message` when `NODE_ENV=production`; every response carries an `x-request-id` for log correlation. `frontend/next.config.mjs` ships a strict CSP plus HSTS / XFO / COOP / Permissions-Policy. See `backend/.env.production.example` for the required secrets (`BECON_WEBHOOK_SECRET`, `AUTH_SIGNING_SECRET`).

### Prisma / DB

- SQLite file at `backend/prisma/dev.db` (configured by `DATABASE_URL="file:./dev.db"`).
- `TreatmentPlan.monthlyProducts` is a JSON string (SQLite has no native JSON type) — always `JSON.parse` after reading and `JSON.stringify` when writing.
- `Scan.rawPayload` stores the original Becon JSON as a string for audit/replay.
- Backend imports use `.js` extensions on relative paths (`NodeNext` module resolution with TS source) — keep this convention when adding new files.

### Frontend conventions

- Tailwind config defines semantic color scales: `band.{warning,caution,normal,healthy}`, `ink.{100..900}`, `brand.{primary,accent,bg}`, and `maxWidth.mobile = 390px`. Prefer these over raw hex.
- `MobileShell` wraps the page to enforce mobile width. The dashboard is the only user-facing route.
- Alias `@/*` → `src/*` (see `frontend/tsconfig.json`).

## Testing

Vitest runs backend-only. The tests under `backend/src/services/__tests__/` cover the pure service functions (`becon-mapper`, `phase`, `scores`) — that's where new unit tests belong. There is no frontend test setup.

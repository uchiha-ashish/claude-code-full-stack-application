# Traya ScalpScan — Phase 1

Monorepo for the ScalpScan Phase 1 Dashboard (Case 1 & Case 2), per the PRD.

```
backend/    Node.js + Express + Prisma + PostgreSQL
frontend/   Next.js 14 (App Router) + Tailwind + Recharts
docs/       PRD, sample Becon payload, and UI design mocks
CLAUDE.md   Architecture & security posture for future sessions
```

## Local development

### Prerequisites
- Node 20+
- Docker (for local Postgres)

### One-time setup

```bash
# Backend
cd backend
cp .env.example .env
docker compose up -d                       # starts Postgres on :5432
npm install
npx prisma migrate dev --name init          # creates tables
npm run seed                                # seeds Customer A (Case 1) and Customer B (Case 2)
npm run dev                                 # http://localhost:4000

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                                 # http://localhost:3000
```

### Demo URLs
- `http://localhost:3000/dashboard` → Case 1 (first scan, starting-point)
- `http://localhost:3000/dashboard?c=b1111111-2222-3333-4444-555555555555` → Case 2 (4 scans, alcohol-Minox)
- `http://localhost:3000/hair-progress?c=b1111111-2222-3333-4444-555555555555` → per-scan photo grid

### Backend tests

```bash
cd backend
npm test
```

## Deploy

### Backend → Railway (+ Railway Postgres)

1. Create a new Railway project, add a Postgres plugin; Railway will inject `DATABASE_URL`.
2. New service → GitHub repo → select this repo, set **root directory** to `backend/`.
3. Set env vars on the service:
   - `NODE_ENV=production`
   - `FRONTEND_ORIGIN=https://<your-vercel-domain>` (comma-separated allowlist is supported)
   - `BECON_WEBHOOK_SECRET=<openssl rand -hex 32>` (enforced in prod)
   - `AUTH_SIGNING_SECRET=<openssl rand -hex 32>` (enforced in prod)
4. Deploy. Railway runs `npx prisma migrate deploy && npm start` on boot (see `railway.json`).
5. Once healthy at `GET /health`, grab the public URL for Vercel's env vars.

### Frontend → Vercel

1. Vercel → New Project → import this repo, **root directory** = `frontend/`.
2. Framework preset: **Next.js** (auto-detected).
3. Environment Variables:
   - `NEXT_PUBLIC_API_BASE=https://<your-railway-domain>`
   - `DEMO_CUSTOMER_ID=0314683c-44c2-4383-b94d-efaaa5b4e7c8` (optional)
4. Deploy.

> The backend's `FRONTEND_ORIGIN` CORS allowlist must include the Vercel
> preview + production domains, otherwise requests from the browser will be
> blocked by CORS.

## Security

- Helmet, `express-rate-limit`, CORS allowlist, and sanitized errors on the backend.
- HMAC-gated webhook (`x-becon-signature`) + HMAC-gated customer identity (`x-traya-signature`) when the respective secrets are set.
- Strict CSP + HSTS on the frontend via `next.config.mjs`.

Full security model in `CLAUDE.md` → "Auth / customer scoping" + "Production security posture".

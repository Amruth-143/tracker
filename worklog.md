# Worklog

---
Task ID: 1
Agent: main agent (Z.ai)
Task: Build "LinkLeak" — a transparent tracking-link security-awareness demo website (Next.js 16 + Prisma + shadcn/ui)

Work Log:
- Loaded fullstack-dev skill, initialized project environment (init script, dev server on port 3000)
- Replaced Prisma models with `Visit` (network signals, IP-geo fields, client env signals, consent-gated GPS fields); pushed schema via `bun run db:push`
- Created `src/lib/ua.ts` (dependency-free UA parser, private-IP detection, header IP extraction) and `src/lib/geo.ts` (server-side ip-api.com lookup, 2.5s timeout, graceful fallback)
- Created API routes: `POST/PATCH /api/visit` (record visit / attach GPS only after browser Allow) and `GET/DELETE /api/visits` (dashboard list / clear)
- Built UI: `src/app/page.tsx` (dark theme, tabs: Visitor view / Tracker dashboard / How it works), `src/components/demo/visitor-panel.tsx` (Level-1 silent data cards + Level-2 consent GPS flow with dialog, OSM map embed, denied/granted states), `dashboard-panel.tsx` (5s polling table, GPS badges, clear-data AlertDialog), `education-panel.tsx` (three-level comparison, protection checklist, myths, legal note)
- Updated layout metadata + forced dark theme via `<html className="dark">`
- Lint clean; browser-verified end-to-end with agent-browser: silent visit recording, IP geo display, GPS consent dialog, denial path (educational toast), granted path (coords + accuracy + map), dashboard records/badges, mobile responsiveness, sticky footer, zero console errors
- Cleared test data after verification

Stage Summary:
- Deliverable: runnable Next.js app at / (only visible route), SQLite at db/custom.db
- Design boundary: fully transparent demo — no covert/lure features; GPS strictly behind browser permission prompt; legal warnings on dashboard and education tab
- Fun teaching artifact observed: sandbox IP 21.0.0.1 geolocates to "Whitehall, Ohio — US DoD", live proof that IP geo is unreliable

---
Task ID: 2
Agent: main agent (Z.ai)
Task: Fix Vercel deployment errors reported by user

Work Log:
- Diagnosed 4 deployment blockers: (1) missing `postinstall: prisma generate` → build fails at page-data collection with "@prisma/client did not initialize yet"; (2) DATABASE_URL = absolute sandbox path + .env gitignored → runtime "unable to open database file"; (3) `output: "standalone"` + build script `cp .next/standalone/...` → sandbox-only artifacts confusing Vercel; (4) fresh serverless FS has no DB table
- package.json: build → plain `next build`, start → `next start`, added postinstall prisma generate, added engines.node >=20.9
- next.config.ts: removed output: "standalone"
- src/lib/db.ts: production fallback DATABASE_URL → file:/tmp/linkleak.db (respects explicit production env), dev-only query logging, added idempotent ensureSchema() bootstrap (CREATE TABLE IF NOT EXISTS "Visit") with retry-on-failure
- API routes (visit POST/PATCH, visits GET/DELETE): await ensureSchema() before queries
- Fixed genuine TS error: dashboard-panel gpsLon null guard
- Verified: tsc clean on app code, eslint clean, REAL production build passed in isolated distDir (.next-prod-test), production runtime cold-start test on :3005 (fresh /tmp db → POST 201, GET 200, PATCH 200, DELETE 200, homepage 200), test artifacts removed, dev server :3000 healthy after config revert

Stage Summary:
- Project now deploys to Vercel with zero env config: postinstall generates Prisma client, production DB falls back to /tmp/linkleak.db, schema self-creates on first request
- Caveat documented for user: Vercel /tmp is ephemeral per lambda (data resets on cold start) — for persistence, point DATABASE_URL at Turso/Vercel Postgres
- Dev preview untouched and healthy

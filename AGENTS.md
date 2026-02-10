# Gifta — AI Coding Agent Instructions

Owner: Ryan Laubscher (@laup30, Ryan@redcliffebay.com)

## How to read this repo

- Source of truth for runtime behavior: `src/` + `drizzle/migrations/` + `package.json`
- Product/spec docs: `docs/Platform-Spec-Docs/` (start at `CANONICAL.md`)
- Current-state audit notes: `docs/forensic-audit/REPORT.md` + `docs/forensic-audit/STATE.md`

If docs and code disagree, update the docs to match the code (or clearly label the doc as historical).

## Stack (as implemented)

- Framework: Next.js `16.1.4` (App Router)
- UI: React `19.2.3`
- Language: TypeScript (strict)
- DB: Postgres (Neon); ORM: Drizzle
- Auth: Clerk (`@clerk/nextjs`)
- Payments (inbound): PayFast, Ozow, SnapScan
- Payout: Karri Card (sole payout type in code)
- Storage: Vercel Blob
- Cache/rate limits: Vercel KV (with dev fallback in some paths)
- AI images: Google Gemini image generation (`GEMINI_API_KEY`)
- Observability: Sentry (+ optional OpenTelemetry/Axiom env wiring)

## Commands (pnpm only)

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm knip
pnpm openapi:generate
pnpm db:seed
pnpm drizzle:generate
pnpm drizzle:push
```

## Environment

- Copy `.env.example` → `.env.local` for local development.
- Sandbox flags are granular (`MOCK_PAYMENTS`, `MOCK_PAYMENT_WEBHOOKS`, `MOCK_KARRI`, `MOCK_SENTRY`).
- Internal jobs are protected by `INTERNAL_JOB_SECRET` and must be triggered by an external scheduler (nothing in-repo runs cron).

## Repo conventions

- Do this first: *Always* read /docs/napkin/SKILL.md before you start any new session. Follow the instructions in this document.
- This application only uses the phrase 'Dreamboard', never 'Dream Board'. Ensure that you never introduce copy on surfaces that uses the incorrect terminology.
- Keep changes small and reviewable.
- Prefer updating docs that make product guarantees (CANONICAL/SPEC/UX/JOURNEYS/PAYMENTS/DATA/SECURITY/ARCHITECTURE) over duplicating truth elsewhere.
- When you discover a code-vs-doc mismatch that you’re not fixing in code, add a short “Known issue” note to the relevant doc and a follow-up in `BACKLOG.md`.

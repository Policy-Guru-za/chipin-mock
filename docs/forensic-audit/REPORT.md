# Codebase Forensic Review (Gifta)

Last updated: 2026-02-05

Note: this report describes “as-built” code reality at the time of writing and calls out docs drift. If you have since synced docs, re-validate the referenced drift items.

Compaction-safe entrypoints:
- Audit state + findings: `docs/forensic-audit/STATE.md`
- Docs drift inventory: `docs/forensic-audit/DOC-DRIFT.md`

## 1) Executive summary

This repository is a single Next.js (App Router) application that ships:
- a mobile-first guest web experience for “Dream Boards” (`/[slug]`)
- a Clerk-authenticated host experience (`/create/*`, `/dashboard/*`)
- an admin payouts console (`/admin/payouts*`)
- payment-provider webhooks (`/api/webhooks/*`)
- a partner API surfaced as `/v1/*` (rewritten to `/api/v1/*`)
- multiple internal “job” endpoints gated by `INTERNAL_JOB_SECRET` (queue processors, retention, reconciliation, Karri batch)

The codebase is feature-complete enough to support the core flows, but several **spec-vs-code** and **accounting semantics** mismatches exist that can materially affect product behavior and financial correctness.

Top confirmed risks (see IDs in `STATE.md`):
- **F-005 Payments/fee semantics**: checkout charges `amount + fee`, but DB “net/raised” computes `amount - fee` and user-visible “raised” aggregates `net` (likely wrong unless fee is meant to be deducted rather than add-on).
- **F-002 Lifecycle**: docs say auto-close on `party_date`; repo shows no scheduler, only explicit close via partner API.
- **F-004 Karri batch**: `pending` Karri result resets queue attempts, enabling infinite retries and masking stuck payouts.
- **F-001 Guest privacy**: docs say “% only”; guest UI renders exact ZAR totals.
- **F-003 Webhook events**: catalog supports many events; runtime emits only 2.
- **F-006 Seed/demo**: seed data violates encryption expectations and uses inconsistent webhook event naming.
- **F-007 Branding**: runtime metadata is “Gifta”; some docs used legacy “ChipIn” naming.

## 2) Tech stack (as implemented)

From `package.json`:
- Framework: Next.js `16.1.4` (App Router)
- React: `19.2.3`
- Language: TypeScript `5.5.x` (`strict` via `tsconfig.json`)
- DB: Postgres (Neon); ORM: Drizzle (`drizzle-orm`, `drizzle-kit`)
- Auth: Clerk (`@clerk/nextjs`)
- Cache / rate limiting: Vercel KV (`@vercel/kv`) with dev fallback in some paths
- Storage: Vercel Blob (`@vercel/blob`)
- Gift imagery: static curated icons under `/public/icons/gifts/`
- Email: Resend (`resend`)
- Observability: Sentry (`@sentry/nextjs`), optional OpenTelemetry (`@opentelemetry/*`), optional Axiom env keys present
- Payments (inbound): PayFast, Ozow, SnapScan
- Payout: Karri Card (sole type in DB enums)
- Testing: Vitest + Testing Library

## 3) Repo structure (functional map)

High-signal directories:
- `src/app/*`: App Router pages, route handlers, route groups
- `src/lib/*`: domain logic (payments, payouts, webhooks, integrations, db, security, observability)
- `drizzle/migrations/*`: schema/view evolution
- `tests/*`: unit + integration tests (Vitest)
- `scripts/*`: OpenAPI generation, load test, seeding
- `docs/*`: specs, runbooks, execution plans, vendor references

## 4) HTTP surface area (pages + APIs)

### Pages (UI)

Guest (public):
- `GET /[slug]` → `src/app/(guest)/[slug]/page.tsx`
- `GET /[slug]/contribute` → `src/app/(guest)/[slug]/contribute/page.tsx`
- `GET /[slug]/thanks` → `src/app/(guest)/[slug]/thanks/page.tsx`
- `GET /[slug]/payment-failed` → `src/app/(guest)/[slug]/payment-failed/page.tsx`

Host (Clerk):
- `GET /create/*` → `src/app/(host)/create/*`
- `GET /dashboard/*` → `src/app/(host)/dashboard/*`

Admin (Clerk + allowlist):
- `GET /admin/payouts` → `src/app/(admin)/payouts/page.tsx`
- `GET /admin/payouts/[id]` → `src/app/(admin)/payouts/[id]/page.tsx`

Auth entrypoints (Clerk):
- `GET /sign-in/*`, `GET /sign-up/*` (Clerk pages)

Health:
- `GET /health/live`, `GET /health/ready`, `GET /api/health`

### Route handlers (server)

Guest checkout (public allowlist):
- `POST /api/internal/contributions/create`

Provider webhooks:
- `POST /api/webhooks/payfast`
- `POST /api/webhooks/ozow`
- `POST /api/webhooks/snapscan`

Partner API (`/v1/*` → `/api/v1/*`):
- dream boards: create/get/update, list contributions, close
- contributions: get
- payouts: get/pending/confirm/fail
- partner webhooks: CRUD

Internal job endpoints (must supply `Authorization: Bearer ${INTERNAL_JOB_SECRET}`):
- `POST /api/internal/webhooks/process` (outgoing webhook queue processor)
- `POST /api/internal/retention/run` (anonymization + network metadata scrub)
- `POST /api/internal/karri/batch` (process Karri credit queue)
- `POST /api/internal/payments/reconcile` (provider reconciliation)
- `POST /api/internal/api-keys/*` (internal key ops)

Internal utilities (Clerk-protected or internal):
- `POST /api/internal/upload` (blob uploads)
- `GET /api/internal/auth/me` (session diagnostics)
- metrics/analytics/debug routes under `/api/internal/*`

## 5) Auth + access control model

### Clerk gating (middleware)

`middleware.ts` uses Clerk when configured; else returns 503 for most routes while bypassing:
- health endpoints
- provider webhooks
- internal api-key endpoints
- job-secret endpoints (still enforced in handler)

Important nuance:
- Non-public **API routes** return `404` if unauthenticated (to reduce endpoint discovery).
- Guest pages are explicitly allowlisted via regex in `isPublicRoute`.
- `POST /api/internal/contributions/create` is allowlisted as intentionally public.

### Admin access

Admin routes exist under `(admin)` and are expected to be restricted via allowlist (env var `ADMIN_EMAIL_ALLOWLIST`). Confirm the check is enforced in admin server components/routes before relying on it.

## 6) Core domain model (DB + invariants)

Schema lives in `src/lib/db/schema.ts` and migrations under `drizzle/migrations/`.

Key enums:
- dream board status: `draft | active | funded | closed | paid_out | expired | cancelled`
- payment status: `pending | processing | completed | failed | refunded`
- payment providers: `payfast | ozow | snapscan`
- payout type/method: `karri_card` only

Primary tables:
- `partners`: tenant
- `hosts`: host identity (Clerk-linked via mapping)
- `dream_boards`: core “pot” entity (child, gift, goal, party_date, payout details)
- `contributions`: individual guest contributions
  - `amount_cents`, `fee_cents`, generated `net_cents = amount_cents - fee_cents`
- `payouts`, `payout_items`: post-close payout tracking
- `api_keys`: partner API keys (SHA-256 hash lookup)
- `webhook_endpoints`: partner subscriptions
- `webhook_events`: outgoing webhook queue/audit log
- `audit_logs`: actor/action/metadata
- `karri_credit_queue`: async credits to Karri

DB views:
- `dream_boards_with_totals`: includes `raised_cents = SUM(contributions.net_cents WHERE completed)` and contribution_count
- `expiring_dream_boards`: active boards with party_date within next 7 days

## 7) Dream Board lifecycle (implemented reality)

State transitions:
- `draft` created during host wizard (draft persistence via server actions + storage)
- `active` once created/published
- `funded` when `raised >= goal` (computed from `raised_cents` definition)
- `closed` when partner closes via API (`POST /v1/dream-boards/{id}/close`)
- `paid_out` when payout processing completes (Karri batch)
- `expired/cancelled` exist in schema but lifecycle triggers should be verified (no auto-expire job found)

Confirmed mismatch:
- Specs describe “automatic close on party date”; current repo requires explicit close (no scheduler configured).

## 8) Guest contribution + payment flow (end-to-end)

### Create contribution + provider intent

`POST /api/internal/contributions/create`:
- validates payload: `dreamBoardId`, `contributionCents`, optional name/message, provider
- rate limits per IP + dreamBoard
- checks board status in `{active,funded}`
- computes `totalCents = calculateTotalWithFee(contributionCents)`
- persists contribution:
  - `amountCents = contributionCents`
  - `feeCents = total - contribution`
  - `paymentStatus = pending`
- calls `createPaymentIntent(provider, { amountCents: totalCents, ... })`
- returns redirect/intent details for guest to complete hosted payment

### Webhook processing

Each provider webhook:
- locates contribution by `(provider, paymentRef)`
- validates amount equals expected `amountCents + feeCents` (confirmed in ozow webhook)
- maps provider status → internal status
- updates contribution, invalidates cache
- on success:
  - attempts to mark board funded
  - emits partner webhooks:
    - `contribution.received`
    - `pot.funded` (if funded transition occurred)
  - sends WhatsApp notification to host (contribution + “funded” alert)

Critical correctness dependency:
- “raised” and “funded” transitions rely on `raised_cents` definition. If fee semantics are wrong, all goal/funded/overfunding logic becomes wrong.

## 9) Partner webhooks (outgoing)

Catalog (`src/lib/webhooks/types.ts`) supports:
- `dreamboard.*`, `contribution.received`, `pot.*`, `payout.*`

Runtime emission sites (confirmed):
- payment-provider webhook handlers emit only:
  - `contribution.received`
  - `pot.funded`

Delivery architecture:
- events stored in `webhook_events`
- endpoints in `webhook_endpoints`
- queue drained by `processWebhookQueue()` triggered via internal job endpoint `/api/internal/webhooks/process`

Operational requirement:
- an external scheduler (Vercel Cron or equivalent) must call `/api/internal/webhooks/process` at a cadence.

## 10) Payouts + Karri batch

Payout creation trigger:
- Partner API close endpoint closes board and calls `createPayoutsForDreamBoard` (see `src/lib/payouts/service.ts`) to create payout records.

Karri execution:
- queue records in `karri_credit_queue`
- batch processor `processDailyKarriBatch` (called via `/api/internal/karri/batch`) processes pending entries
- calls Karri API integration (`topUpKarriCard`)
- on completion:
  - marks payout completed + queue completed
  - sends WhatsApp payout confirmation

Confirmed bug (F-004):
- On `result.status === 'pending'`, code sets queue status back to pending but resets attempts to the previous value:
  - `markQueuePending(entry.id, entry.attempts)` should likely use the incremented `attempts`.

Scheduling reality:
- docs claim “daily at 6 AM SAST”; repo provides only the internal endpoint. Cron must be external.

## 11) Internal jobs + ops

Internal job endpoints are secured by `INTERNAL_JOB_SECRET` in each handler.

Jobs present:
- webhook queue processor
- payments reconciliation
- retention scrub/anonymization
- Karri batch

There is no in-repo scheduler configuration; deployment must supply cron triggers.

## 12) Observability + logging

Components:
- Sentry integration files: `sentry.*.config.ts`
- Optional OpenTelemetry env hooks (`OTEL_*`)
- App logger wrapper `src/lib/observability/logger` (used broadly)
- Axiom env vars referenced (AXIOM_*), confirm actual usage wiring

Recommendation:
- document exactly which environments send Sentry/OTel/Axiom and how to disable/enable in dev (some mock flags exist).

## 13) Security posture (implemented)

Key mechanisms:
- Clerk auth + middleware gating for host/admin surfaces
- Public guest surfaces are allowlisted; guest checkout endpoint is intentionally public + rate limited
- Partner API uses SHA-256 hashed API keys with scope checks (`src/lib/api/auth.ts`)
- Sensitive card data encrypted via AES-256-GCM with key derived from `CARD_DATA_ENCRYPTION_KEY` (`src/lib/utils/encryption.ts`)
- Internal jobs protected by bearer secret (`INTERNAL_JOB_SECRET`)
- Provider webhooks perform signature/timestamp/amount checks (implementation varies per provider)

Confirmed docs mismatch:
- `SECURITY.md` claims bcrypt API key hashing; code uses SHA-256.

## 14) Testing + quality gates

Scripts (see `package.json`):
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`
- targeted test suites: `test:payments`, `test:webhooks`, `test:payouts`
- load test: `pnpm test:load` (`scripts/load-test/index.ts`)
- OpenAPI generation: `pnpm openapi:generate`

## 15) Documentation drift (what to fix first)

See `docs/forensic-audit/DOC-DRIFT.md`.

Priority order (because they affect correctness and user trust):
1) `docs/Platform-Spec-Docs/CANONICAL.md` (it claims authority) + `README.md`
2) Payments + data semantics: `PAYMENTS.md`, `DATA.md`
3) Guest UX docs: `UX.md`, `JOURNEYS.md`, perf notes
4) Ops/scheduler reality: `ARCHITECTURE.md`, `KARRI.md`, runbooks

## 16) Open questions (need owner decisions)

1) Guests: show exact ZAR totals or % only? (code currently shows amounts)
2) Pot close: implement auto-close scheduler, or update docs/UI to “manual/partner close”?
3) Fee semantics: add-on vs deducted? (this drives `net_cents`, `raised_cents`, funded logic, payouts, and partner reporting)

## 17) Recommended remediation plan (high-level)

P0 (correctness / money):
- Resolve fee semantics; align DB fields + webhook amount checks + “raised” aggregation accordingly.
- Fix Karri batch attempts reset on pending.
- Decide and enforce guest privacy (UI + docs).

P1 (product + partner trust):
- Align webhook event catalog with actual emitted events (either implement emission or narrow catalog + docs).
- Align pot close behavior (scheduler + job endpoint wiring) with docs.

P2 (hygiene):
- Fix seed/demo data to respect encryption + correct webhook event naming/payload shape.
- Unify branding (Gifta vs legacy ChipIn surfaces) across metadata, docs, OpenAPI.

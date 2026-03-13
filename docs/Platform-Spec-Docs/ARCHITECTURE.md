# Architecture

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Application Shape

- Single Next.js App Router application
- Primary route groups:
  - `(marketing)`
  - `(guest)`
  - `(host)`
  - `(admin)`
- Public API under `/api/v1/*`, rewritten from `/v1/*`
- Internal operational routes under `/api/internal/*`

## Root Request Hook

- The current root request hook is [`proxy.ts`](../../proxy.ts).
- It adds/propagates `x-request-id`.
- It is not the auth middleware layer.

## Auth Model

- Clerk is the host/admin auth system.
- Host and admin pages use server-side auth wrappers and route/layout guards.
- Admin access requires Clerk plus `ADMIN_EMAIL_ALLOWLIST`.
- Partner API auth is separate and uses bearer API keys.
- Internal jobs use `Authorization: Bearer ${INTERNAL_JOB_SECRET}`.

## Persistence and Data Flow

- Postgres on Neon
- Drizzle schema in [`src/lib/db/schema.ts`](../../src/lib/db/schema.ts)
- Read/query helpers in [`src/lib/db/queries.ts`](../../src/lib/db/queries.ts)
- OpenAPI source in [`src/lib/api/openapi.ts`](../../src/lib/api/openapi.ts)

## External Systems

- Payments: PayFast, Ozow, SnapScan
- Payouts: default host-created boards use `takealot_voucher`; `karri_card` writes are off by default and gated by `UX_V2_ENABLE_KARRI_WRITE_PATH`; bank writes remain gated by `UX_V2_ENABLE_BANK_WRITE_PATH`; charity payout rows may also exist when enabled
- Storage: Vercel Blob
- Cache / rate limiting: Vercel KV with development fallback in some paths
- Email: Resend
- Observability: Sentry, optional OpenTelemetry, optional Axiom

## Scheduling Reality

There is no in-repo cron scheduler. Jobs are exposed as internal routes and must be triggered externally:

- `/api/internal/webhooks/process`
- `/api/internal/karri/batch`
- `/api/internal/payments/reconcile`
- `/api/internal/reminders/dispatch`
- `/api/internal/retention/run`

## Source of Truth

For runtime behavior, prefer:

1. [`docs/Platform-Spec-Docs/CANONICAL.md`](./CANONICAL.md)
2. current code in `src/`
3. generated OpenAPI

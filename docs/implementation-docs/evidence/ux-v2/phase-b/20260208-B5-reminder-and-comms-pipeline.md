# Phase B - B5 Reminder and Comms Pipeline Evidence

Timestamp (UTC): 2026-02-08T06:34:00Z

## Scope Executed

Read order completed as requested:
1. `docs/napkin/napkin.md`
2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
4. `docs/implementation-docs/GIFTA_UX_V2_REMINDERS_AND_COMMS_SPEC.md`
5. `src/lib/ux-v2/decision-locks.ts`
6. `src/lib/db/schema.ts`
7. `src/app/api/internal/contributions/reminders/route.ts`

Implemented B5 scope:
- Reminder dispatch job and service layer:
  - `src/lib/reminders/service.ts`
  - `src/lib/reminders/templates.ts`
  - `src/lib/reminders/index.ts`
- Internal trigger endpoint (job-secret protected):
  - `src/app/api/internal/reminders/dispatch/route.ts`
  - middleware allowlist update in `middleware.ts`
- Reminder scheduling endpoint idempotency improvements:
  - `src/app/api/internal/contributions/reminders/route.ts`
- WhatsApp Cloud API integration hardening + webhook ingestion:
  - `src/lib/integrations/whatsapp.ts`
  - `src/lib/integrations/whatsapp-webhook.ts`
  - `src/app/api/webhooks/whatsapp/route.ts`
- Reminder delivery state normalization for per-channel idempotency:
  - `src/lib/db/schema.ts`
  - `drizzle/migrations/0014_add_whatsapp_delivery_state.sql`
- Job endpoint coverage update:
  - `tests/unit/internal-job-endpoints.test.ts`

## B5 Requirement Cross-Check

| Requirement | Implementation | Result |
|---|---|---|
| Dispatch due reminders where `remind_at <= now` and `sent_at IS NULL` | `dispatchDueReminders()` queries due unsent rows in due-time order and processes each reminder deterministically | PASS |
| Mark channel send completion and terminal `sent_at` | successful channel sends persist `email_sent_at` / `whatsapp_sent_at`, then finalize `sent_at` only when required channel(s) are complete | PASS |
| Empty due set returns success | dispatch endpoint returns `{ ok: true, scanned: 0, sent: 0, ... }` when nothing is due | PASS |
| Idempotent rerun protection | already-sent rows are excluded by `sent_at IS NULL`; per-channel timestamps prevent duplicate email/WhatsApp sends; provider idempotency key remains `reminder:<id>:<remindAt>:email` for email dispatch attempts | PASS |
| Retry behavior for transient failures | provider failures keep `sent_at` null, allowing next dispatch run to retry | PASS |
| Bounded retry (48h) | reminders due for more than 48h are marked terminal (set `sent_at`) and logged as expired to prevent infinite retries | PASS |
| Attempt observability | each attempt/success/failure/expiry path logs structured reminder events | PASS |
| Template variable validation before send | strict validator enforces required vars (`child_name`, `dreamboard_title`, `dreamboard_url`, `campaign_close_date`) prior to dispatch | PASS |
| Required reminder content fields | email and WhatsApp template payload include child name, dream board title, public URL (`/<slug>`), campaign close date, and CTA text | PASS |
| Scheduling endpoint duplicate behavior | duplicate `(dream_board_id,email,remind_at)` now returns explicit idempotent `200` response (`{ idempotent: true }`) | PASS |
| Scheduling guardrails | active/funded board requirement retained; invalid/past reminder windows return `invalid_reminder_window` | PASS |
| WhatsApp sender env parity | sender supports modern Cloud API env keys (`WA_*`) with backward-compatible legacy aliases (`WHATSAPP_*`) | PASS |
| WhatsApp webhook operational path | webhook verify + signature validation + inbound/status event ingestion + failed-status reminder requeue implemented | PASS |

## Test Coverage Added/Updated

- New:
  - `tests/unit/reminder-templates.test.ts`
  - `tests/unit/reminder-dispatch-service.test.ts`
  - `tests/unit/whatsapp-webhook-signature.test.ts`
  - `tests/unit/whatsapp-webhook-processing.test.ts`
  - `tests/integration/internal-reminders-dispatch.test.ts`
  - `tests/integration/whatsapp-webhook-route.test.ts`
- Updated:
  - `tests/integration/internal-contribution-reminders.test.ts`
  - `tests/unit/internal-job-endpoints.test.ts`
  - `tests/unit/whatsapp.test.ts`

## Command Gates

| Gate | Result | Notes |
|---|---|---|
| `pnpm lint && pnpm typecheck && pnpm test` | PASS | lint warnings only; no lint/type errors; 102 files / 404 tests passed |
| `pnpm openapi:generate` | PASS | `public/v1/openapi.json` regenerated successfully |
| `pnpm test tests/unit/openapi-spec.test.ts` | PASS | 1 file / 4 tests passed |

## Acceptance Assessment

- P0: PASS - reminders dispatch exactly once per reminder row, including multi-channel safety (`email_sent_at`/`whatsapp_sent_at` + terminal `sent_at` gating)
- P1: PASS - retry behavior bounded and observable (retryable failures keep `sent_at` null; >48h due reminders terminally expired with logs)
- P1: PASS - template variable validation tests pass (`reminder-templates.test.ts`)
- P1: PASS - WhatsApp integration hardened for Cloud API production usage (env parity + signed webhook processing + failed status requeue path)
- P2: PASS - no additional P2 blocker identified for B5 scope

## Out-of-Scope Confirmations (Still Not Implemented in B5)

- No UI reminder opt-in work (Phase C)
- No separate third-party WhatsApp abstraction package; current implementation uses direct Cloud API calls with a swappable sender function contract
- No fee/raised semantic changes (B6)
- No admin notification management UI (B7/C5)

## Stop/Proceed Decision

B5 is fully green per milestone criteria. Stop here; do not proceed to B6 in this run.

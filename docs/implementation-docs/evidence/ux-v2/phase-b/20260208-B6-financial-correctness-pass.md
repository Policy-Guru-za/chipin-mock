# Phase B - B6 Financial Correctness Pass Evidence

Timestamp (UTC): 2026-02-08T05:31:00Z

## Scope Executed

Read order completed exactly as requested:
1. `docs/napkin/napkin.md`
2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
4. `docs/implementation-docs/GIFTA_UX_V2_PAYOUT_ENGINE_SPEC.md`
5. `src/lib/ux-v2/decision-locks.ts`
6. `docs/implementation-docs/evidence/ux-v2/phase-b/20260207-B0-baseline-freeze.md`
7. `src/lib/db/queries.ts`
8. `src/lib/payouts/queries.ts`
9. `src/lib/db/api-queries.ts`
10. `src/lib/payouts/calculation.ts`
11. `src/app/api/internal/contributions/create/route.ts`

## B6 Changes

### 1) Raised/Funded semantics corrected (D-004, D-005)

All runtime raised aggregations changed from post-fee to gift-intent amount:
- `SUM(contributions.netCents)` -> `SUM(contributions.amountCents)`

Updated locations:
- `src/lib/db/queries.ts` (6 raised/funded/notification paths)
- `src/lib/payouts/queries.ts` (2 payout-context readiness paths)
- `src/lib/db/api-queries.ts` (1 API board serializer path)

Funded transition now evaluates against amount-based raised totals:
- `src/lib/db/queries.ts:markDreamBoardFundedIfNeeded`

### 2) net_cents semantic split documented

Added schema-level comment clarifying:
- `amount_cents` = goal progress source
- `net_cents` = payout-ledger arithmetic source

Updated:
- `src/lib/db/schema.ts`

### 3) Payout calculation reconciliation aligned

Adjusted payout math so gift payout net is fee-aware:
- `gift net = raised(amount) - platform fees - charity`

Updated:
- `src/lib/payouts/calculation.ts`
- `src/lib/payouts/service.ts`
- `src/lib/payouts/queries.ts` (payout readiness uses fee-aware gift-net check)

Gift payout row behavior now:
- `gross_cents = SUM(amount_cents)`
- `fee_cents = SUM(fee_cents)`
- `net_cents = gross_cents - fee_cents - charity_total`

Charity payout behavior unchanged:
- `gross_cents = charity_total`
- `net_cents = charity_total`

### 4) Legacy view read-path corrected without migration

No schema/migration changes made. To prevent legacy view under-reporting from leaking into webhook payload enrichment, `getDreamBoardWithTotals` now computes amount-based raised totals directly from base tables at query time.

Updated:
- `src/lib/db/views.ts`

## Verification of Provider Amount Consistency

Confirmed unchanged and correct:
- contribution create path charges `totalCents = amount + fee`
  - `src/app/api/internal/contributions/create/route.ts`
- webhook amount checks compare provider amount to `amount + fee`
  - `src/app/api/webhooks/payfast/route.ts`
  - `src/app/api/webhooks/ozow/route.ts`
  - `src/app/api/webhooks/snapscan/route.ts`
- reconciliation expected totals use `amount + fee`
  - `src/lib/payments/reconciliation.ts`
  - `src/lib/payments/reconciliation-job.ts`

## Regression Tests Added/Updated

Updated assertions:
- `tests/unit/payout-calculation.test.ts`
  - explicit formula checks for `gross - fee - charity = host net`
- `tests/unit/payout-service-create.test.ts`
  - gift payout row now asserts fee-aware net and queue amount
- `tests/unit/payout-queries.test.ts`
  - fee-aware readiness guard (no gift payout when fee consumes raised total)

## Edge-Case Impact Assessment

Expected semantic correction:
- Boards where `SUM(amount_cents) >= goal_cents` but `SUM(net_cents) < goal_cents` are now treated as funded when funding status is evaluated.
- This is a correctness fix (previous behavior under-reported progress).

Operational note:
- Existing boards already stuck in `active` because of prior under-reporting will transition when next funded check runs (webhook/reconciliation/demo completion path).
- No destructive backfill or migration was introduced in B6.

## Command Gates

| Gate | Result | Notes |
|---|---|---|
| `pnpm lint && pnpm typecheck && pnpm test` | PASS | lint warnings only; no lint/type errors; `102` files / `408` tests passed |
| `pnpm openapi:generate` | PASS | regenerated `public/v1/openapi.json` |
| `pnpm test tests/unit/openapi-spec.test.ts` | PASS | `1` file / `4` tests passed |

## B6 Acceptance

- P0: PASS - raised/funded transitions now reflect locked D-004/D-005 semantics (`raised = SUM(amount_cents)`)
- P0: PASS - payout calculations reconcile from ledger (`gross - fee - charity = host net`)
- P1: PASS - provider amount-check regressions remain green (webhook + reconciliation tests)
- P2: PASS - no additional P2 blockers identified

## Stop/Proceed Decision

B6 is fully green. Stop here; do not proceed to B7 in this run.

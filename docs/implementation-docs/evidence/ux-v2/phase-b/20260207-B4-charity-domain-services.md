# Phase B - B4 Charity Domain Services Evidence

Timestamp (UTC): 2026-02-07T19:25:30Z

## Scope Executed

Read order completed as requested:
1. `docs/napkin/napkin.md`
2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
4. `docs/implementation-docs/GIFTA_UX_V2_CHARITY_DOMAIN_SPEC.md`
5. `src/lib/ux-v2/decision-locks.ts`
6. `src/lib/ux-v2/write-path-gates.ts`
7. `src/lib/payouts/service.ts`
8. `src/lib/payouts/calculation.ts`

Implemented B4 scope only:
- Charity registry services (CRUD + active filtering for non-admin):
  - `src/lib/charities/service.ts`
  - `src/lib/charities/index.ts`
- Charity allocation computation service (percentage/threshold + idempotency):
  - `src/lib/charities/allocation.ts`
- Contribution completion wiring for `charity_cents` persistence:
  - `src/app/api/webhooks/payfast/route.ts`
  - `src/app/api/webhooks/ozow/route.ts`
  - `src/app/api/webhooks/snapscan/route.ts`
  - `src/app/api/demo/payment-complete/route.ts`
  - `src/lib/db/queries.ts` (new `setContributionCharityCents` helper)
  - `src/lib/webhooks/payloads.ts` (contribution payload accepts `charityCents`)
- Reporting datasets for B7 consumption:
  - monthly charity summary (`listMonthlyCharitySummary`)
  - per-board charity breakdown (`listBoardCharityBreakdown`)
- DTO documentation for admin-facing service outputs:
  - `docs/implementation-docs/GIFTA_UX_V2_CHARITY_DOMAIN_SPEC.md`

## B4 Requirement Cross-Check

| Requirement | Implementation | Result |
|---|---|---|
| Charity registry module with CRUD + list/get | `listCharities`, `listActiveCharities`, `getCharityById`, `createCharity`, `updateCharity`, `activateCharity`, `deactivateCharity` in `src/lib/charities/service.ts` | PASS |
| Non-admin charity queries filter by active | `scope='public'` enforces `is_active=true` in service visibility conditions | PASS |
| Active/inactive charity usage rules | Existing B2 route validations remain: inactive/unknown charity rejected on create/update (integration tests in dream-board create/update suites); existing linked boards remain payout-processable | PASS |
| Percentage allocation rule | `calculatePercentageCharityCents` uses `Math.round(amount * bps / 10000)` | PASS |
| Threshold allocation rule | `calculateThresholdCharityCents` uses `min(amount, max(0, threshold - alreadyAllocated))` | PASS |
| Idempotent allocation for completed contributions | resolver returns existing `charity_cents` before threshold history query when contribution already completed | PASS |
| Monthly charity summary query | `listMonthlyCharitySummary({year,month})` queries charity payouts in month window, aggregates per charity | PASS |
| Per-board charity breakdown query | `listBoardCharityBreakdown` aggregates totals, allocated-contribution count, split type | PASS |
| Webhook completion stores `charity_cents` | PayFast/Ozow/SnapScan + demo completion now resolve allocation and persist `contributions.charity_cents` before marking completed | PASS |
| `charity_enabled=false` keeps `charity_cents` null | resolver returns `null` when board charity disabled; persisted as null | PASS |

## Test Coverage Added/Updated

- New:
  - `tests/unit/charity-allocation.test.ts`
  - `tests/unit/charity-service.test.ts`
- Updated webhook integration suites:
  - `tests/integration/payfast-webhook.test.ts`
  - `tests/integration/ozow-webhook.test.ts`
  - `tests/integration/snapscan-webhook.test.ts`
- Existing attach/inactive coverage retained from B2:
  - `tests/integration/api-dream-boards-list-create.test.ts`
  - `tests/integration/api-dream-boards-update.test.ts`
- Existing linked-charity payout behavior retained:
  - `tests/unit/payout-service-create.test.ts`

## Command Gates

| Gate | Result | Notes |
|---|---|---|
| `pnpm lint && pnpm typecheck && pnpm test` | PASS | lint warnings only; 0 errors; 96 files / 383 tests passed |
| `pnpm openapi:generate` | PASS | OpenAPI regenerated |
| `pnpm test tests/unit/openapi-spec.test.ts` | PASS | 1 file / 4 tests passed |

## Acceptance Assessment

- P0: PASS - inactive/unknown charity cannot be attached to active board (validated by create/update integration coverage)
- P1: PASS - monthly charity summary query correctness verified (`listMonthlyCharitySummary` + unit aggregation coverage)
- P2: PASS - admin-facing service DTOs documented in `GIFTA_UX_V2_CHARITY_DOMAIN_SPEC.md`

## Out-of-Scope Confirmations (Not Implemented in B4)

- No admin UI screens (B7/C5)
- No monthly charity batch job runner (deferred operational infrastructure)
- No fee/raised semantics changes (B6)
- No payout processing pipeline redesign (B3 remains intact)

## Stop/Proceed Decision

B4 is fully green per milestone criteria. Stop here; do not proceed to B5 in this run.

# 09_voucher-payout-api-contract-fix

## Objective

- Fix the voucher payout API contract gap so `takealot_voucher` payouts expose the contact data partners need for manual fulfilment.

## In Scope

- payout recipient serialization for `takealot_voucher`
- OpenAPI schema updates for voucher recipient fields
- regression coverage for payout read/list endpoints
- execution-ledger updates for this fix session

## Out Of Scope

- broader voucher fulfilment workflow design
- unrelated create-flow, admin UI, or payout-engine changes
- schema or migration changes

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../src/lib/payouts/service.ts`](../src/lib/payouts/service.ts)
- [`../src/lib/api/payouts.ts`](../src/lib/api/payouts.ts)
- [`../src/lib/api/openapi.ts`](../src/lib/api/openapi.ts)
- [`../tests/integration/api-payouts.test.ts`](../tests/integration/api-payouts.test.ts)

## Stage Plan

1. Stage 1 — update the active spec/ledger state for this review follow-up.
2. Stage 2 — patch payout serialization and OpenAPI so voucher payouts publish fulfilment contact fields.
3. Stage 3 — add regression tests, run the relevant gates, and hand off with `10_session-placeholder` active.

## Test Gate

- `pnpm openapi:generate`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- payout API responses include voucher fulfilment contact fields needed by manual partner processing
- generated OpenAPI documents those fields
- regression tests cover voucher payouts on both list and detail read paths
- session closes with `10_session-placeholder` active and napkin evidence recorded in [`../progress.md`](../progress.md)

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Patched payout recipient serialization and `PayoutRecipientData`/generated OpenAPI to expose voucher fulfilment contact data, added regression coverage for both payout list/detail read paths, and closed with [`./10_session-placeholder.md`](./10_session-placeholder.md) active for the next bounded session.

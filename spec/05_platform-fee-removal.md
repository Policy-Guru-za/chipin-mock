# 05_platform-fee-removal

> Historical context note (2026-03-19): this closed fee-removal spec predates the Stitch placeholder pivot and voucher-removal docs sync. Treat payment-provider assumptions below as legacy context only.

## Objective

- Remove Gifta platform fees from all active Dreamboard product flows while preserving historical fee-bearing records, legacy payout compatibility, and current payment-provider UX.

## In Scope

- zero-fee contribution creation for new payments
- contributor checkout, payment summary, and receipt copy cleanup
- host and admin surface cleanup so fee is no longer shown as an active product concept
- partner/OpenAPI deprecation markers for legacy fee fields without removing contract compatibility
- seed/demo data updates and regression test coverage for zero-fee defaults
- Tier 1 docs and execution-artifact updates for the fee-free active product

## Out Of Scope

- merchant-of-record or payment architecture redesign
- destructive schema changes or historical data rewrites
- webhook/reconciliation logic changes that would invalidate legacy fee-bearing rows
- payout engine redesign beyond preserving existing legacy fee-aware math

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../docs/Platform-Spec-Docs/PAYMENTS.md`](../docs/Platform-Spec-Docs/PAYMENTS.md)
- [`../docs/Platform-Spec-Docs/DATA.md`](../docs/Platform-Spec-Docs/DATA.md)
- [`../src/app/(guest)/[slug]/contribute/page.tsx`](../src/app/(guest)/[slug]/contribute/page.tsx)
- [`../src/lib/payments/index.ts`](../src/lib/payments/index.ts)
- [`../src/lib/admin/service.ts`](../src/lib/admin/service.ts)
- [`../src/lib/api/openapi.ts`](../src/lib/api/openapi.ts)

## Stage Plan

1. Stage 1 — make new contribution creation fee-free and remove contributor-facing fee display/copy.
2. Stage 2 — remove fee from active host/admin/reporting surfaces while keeping historical ledger math intact.
3. Stage 3 — mark contract fee fields as deprecated, sync Tier 1 docs/generated artifacts, update seeds/tests, and run the full verification chain.

## Test Gate

- `pnpm openapi:generate`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- new contributions write `fee_cents = 0` and provider charge amount equals `amount_cents`
- active guest, host, and admin surfaces no longer display or describe a Gifta platform fee
- legacy fee fields remain available for historical records and partner compatibility, with deprecation markers where appropriate
- seed/demo defaults reflect fee-free active behavior
- Tier 1 docs, generated OpenAPI, and regression tests all match the fee-free runtime

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed the active platform-fee behavior and closed cleanly before handing off to spec 06.

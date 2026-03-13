# 16_dreamboard-pivot-hardening

## Objective

- Harden the repo around the Dreamboard pivot so active first-party flows are voucher-default, fee-free, and charity-disabled by construction, while legacy fee, charity, Karri, and bank compatibility paths remain explicit for historical reconciliation and partner API support.

## In Scope

- active first-party host-create draft, review, publish, and compatibility-wrapper hardening
- removal of active-flow charity/Karri/bank assumptions from first-party runtime types, admin settings metadata, telemetry defaults, seeds, and default test fixtures
- regression additions or updates for zero-fee contributions, charity-disabled completions, voucher-default payouts, and legacy compatibility behavior
- docs-free runtime cleanup plus execution artifact updates for this bounded session

## Out Of Scope

- public partner API contract removals
- destructive schema cleanup, data migration, or backfill work
- removal of historical charity reconciliation, legacy fee fields, or gated Karri/bank partner write paths
- redesign of payment-provider UX beyond preserving current active behavior

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../src/lib/dream-boards/draft.ts`](../src/lib/dream-boards/draft.ts)
- [`../src/lib/dream-boards/schema.ts`](../src/lib/dream-boards/schema.ts)
- `src/app/(host)/create/review/actions.ts`
- [`../src/lib/admin/service.ts`](../src/lib/admin/service.ts)
- [`../src/lib/payouts/service.ts`](../src/lib/payouts/service.ts)

## Stage Plan

1. Stage 1 — tighten active first-party Dreamboard create boundaries so draft/types/review/publish paths model voucher-only active flows and no longer carry dormant charity/Karri/bank branches by default.
2. Stage 2 — contain remaining active-product leakage in admin settings, telemetry/default fixtures, seeds, and runtime compatibility wrappers while preserving explicit historical and partner-gated behavior.
3. Stage 3 — align regression coverage and run the full verification gate, then hand off with the next numbered placeholder active.

## Test Gate

- focused Dreamboard create, payout, and webhook regression suites during stage work
- final gate: `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Exit Criteria

- first-party Dreamboard create/review/publish paths accept voucher-default active-flow data without modeling dormant charity or Karri/bank defaults
- active runtime defaults for seeds, fixtures, telemetry, and admin settings no longer imply active charity or legacy payout methods
- historical fee, charity, Karri, and bank compatibility behavior remains covered by explicit legacy tests and runtime paths
- required verification gate is green and [`../progress.md`](../progress.md) records current-session status for this spec before handoff

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Completed voucher-only first-party host-create boundary hardening, deactivated charity write-path leakage in admin/telemetry, reset active-flow fixtures to zero-fee voucher defaults, preserved explicit legacy compatibility coverage, and verified with the full docs/lint/typecheck/test gate.

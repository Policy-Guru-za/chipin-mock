# 10_karri-default-path-decoupling

## Objective

- Finish removing Karri from the default Dreamboard product experience while preserving Karri as a gated legacy or partner capability.

## In Scope

- central Karri write-path capability gating for API, config, health, and docs
- voucher-default Dreamboard contract alignment for public create and update behavior
- removal of remaining default-path Karri UX and copy from standard Dreamboard surfaces
- test, docs, dogfood, and handoff evidence updates for this behavior change

## Out Of Scope

- deleting Karri data model support, automation modules, or admin legacy handling
- changing bank or charity capability policy beyond wiring Karri into the same gating pattern
- schema migrations or data backfills

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../src/app/api/v1/dream-boards/route.ts`](../src/app/api/v1/dream-boards/route.ts)
- [`../src/app/api/v1/dream-boards/[id]/route.ts`](../src/app/api/v1/dream-boards/[id]/route.ts)
- [`../src/lib/config/feature-flags.ts`](../src/lib/config/feature-flags.ts)
- [`../src/lib/health/checks.ts`](../src/lib/health/checks.ts)
- [`../src/lib/api/openapi.ts`](../src/lib/api/openapi.ts)

## Stage Plan

1. Stage 1 — add Karri capability resolution and wire it into API create/update, Karri verification, startup config, and readiness behavior.
2. Stage 2 — remove default-path Karri UX and copy from standard Dreamboard landing, review, dashboard, and legacy payout compatibility surfaces.
3. Stage 3 — sync OpenAPI, Tier 1 docs, README, fixtures, and regression tests to voucher-default behavior; then verify, dogfood, and hand off.

## Test Gate

- `pnpm openapi:generate`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- standard Dreamboard host flow and standard public-facing copy expose no Karri requirement or Karri-default messaging
- `POST /api/v1/dream-boards` defaults omitted `payout_method` to `takealot_voucher`
- `karri_card` create or update requests are rejected with `422 unsupported_operation` when Karri write path is disabled
- startup config and readiness checks do not require Karri credentials in standard mode
- legacy Karri records and admin automation handling remain intact
- docs, progress ledger, dogfood evidence, and napkin evidence are current
- this spec closes with `11_session-placeholder` active in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md)

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Added `UX_V2_ENABLE_KARRI_WRITE_PATH`, defaulted public Dreamboard create to `takealot_voucher`, removed remaining default-path Karri copy and dead payout-step UI, synced Tier 1 docs/OpenAPI/tests, and closed with fallback dogfood because local browser proof was blocked by missing Clerk keys and `DATABASE_URL`.

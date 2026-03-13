# 13_charity-product-disablement

## Objective

- Remove charity from the active Dreamboard product so first-party runtime paths, public UI, host UI, and active Dreamboard API surfaces behave as if the feature does not exist, while preserving historical accounting data for ops/admin reconciliation.

## In Scope

- active-product charity omission across Dreamboard runtime view-models, public pages, thank-you flow, host dashboard, create-flow leftovers, and landing copy
- runtime short-circuiting so newly completed contributions and payout planning do not create new charity allocation in active mode
- Dreamboard partner API and generated OpenAPI removal of charity request/response fields
- admin/runtime surface cleanup for active-product paths while preserving historical reconciliation access where needed
- regression coverage, docs sync, dogfood, napkin evidence, and successor placeholder handoff

## Out Of Scope

- destructive schema removal or historical data rewrite
- implementing charity migration tooling beyond active-product omission and historical read containment
- unrelated payout-provider, Karri, or voucher-fulfilment work

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../src/lib/dream-boards/view-model.ts`](../src/lib/dream-boards/view-model.ts)
- [`../src/lib/payouts/queries.ts`](../src/lib/payouts/queries.ts)
- [`../src/lib/payouts/service.ts`](../src/lib/payouts/service.ts)
- [`../src/app/api/v1/dream-boards/route.ts`](../src/app/api/v1/dream-boards/route.ts)
- [`../src/app/api/v1/dream-boards/[id]/route.ts`](../src/app/api/v1/dream-boards/[id]/route.ts)

## Stage Plan

1. Stage 1 — add the product-level charity capability and remove active-product charity branches from Dreamboard runtime view-models, public UI, host UI, and create-flow leftovers.
2. Stage 2 — short-circuit new charity allocation/payout creation, remove active Dreamboard API/OpenAPI charity fields, and update admin/runtime settings surfaces.
3. Stage 3 — sync docs/copy/tests/generated artifacts, dogfood the changed flows, and hand off with `14_session-placeholder` active.

## Test Gate

- focused regression suites for create-flow leftovers, guest/thank-you/dashboard views, payout/runtime behavior, Dreamboard API/OpenAPI, and admin/settings paths during stage work
- `pnpm openapi:generate`
- final gate: `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Exit Criteria

- first-party Dreamboard product flows no longer surface charity copy, cards, labels, steps, or summaries in active mode
- new contribution completion and payout planning produce no new charity allocation or charity payout rows in active mode
- Dreamboard API/OpenAPI request and response shapes no longer expose charity fields in the committed active contract
- admin surfaces keep historical reconciliation truth where required but remove charity from active-product settings/navigation/reporting paths
- Tier 1 docs, generated artifacts, progress ledger, dogfood evidence, and napkin outcome are current before handoff

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Added product-level charity capability shaping, removed charity from active first-party/public Dreamboard surfaces and public Dreamboard API/OpenAPI, preserved historical ops/accounting paths, passed the full verification gate, and closed with `14_session-placeholder` active. Live UI dogfood was partially blocked by missing local Clerk/DB config, so fallback proof relies on startup evidence plus the full green automated gate.

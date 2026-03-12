# 08_dreamboard-create-voucher-flow

## Objective

- Refactor the default Dreamboard create flow so it becomes a 5-step voucher-placeholder journey with no active charity step, no Karri/bank setup in the host path, and coherent downstream runtime truth.

## In Scope

- host create flow state-machine changes from `child -> gift -> dates -> giving-back -> payout -> review` to `child -> gift -> dates -> voucher -> review`
- new `takealot_voucher` runtime truth across draft, schema, DB, queries, view models, serializers, and payout handling
- compatibility redirects from legacy `/create/giving-back` and `/create/payout`
- review, dashboard, guest/public, telemetry, and copy updates needed to remove default Karri/charity assumptions from the active product flow
- test coverage, docs sync, dogfood, and napkin evidence for this session

## Out Of Scope

- implementing actual Takealot voucher fulfillment or redemption workflows
- broad charity-domain removal outside the default Dreamboard creation path
- removing legacy API support for bank/charity/Karri where it is not required for this active-product-flow refactor
- unrelated payment-provider, webhook, or admin-surface work

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../docs/Platform-Spec-Docs/JOURNEYS.md`](../docs/Platform-Spec-Docs/JOURNEYS.md)
- [`../src/lib/host/create-view-model.ts`](../src/lib/host/create-view-model.ts)
- [`../src/lib/dream-boards/schema.ts`](../src/lib/dream-boards/schema.ts)
- [`../src/lib/db/schema.ts`](../src/lib/db/schema.ts)
- [`../src/lib/payouts/service.ts`](../src/lib/payouts/service.ts)

## Stage Plan

1. Stage 1 — establish runtime truth: add `takealot_voucher`, update draft/schema/DB/query/view-model foundations, and normalize legacy draft state.
2. Stage 2 — refactor the host flow to 5 steps: remove `giving-back` from the active engine, replace payout with `/create/voucher`, and reindex routing, validation, review, and stepper behavior.
3. Stage 3 — harden downstream surfaces: dashboard/public/thank-you/admin labels, payout creation, telemetry, API serialization/write handling, and compatibility redirects.
4. Stage 4 — sync docs, run verification, dogfood the new and legacy entry paths, update napkin evidence, and hand off with `09_session-placeholder` active.

## Test Gate

- targeted create-flow, payout, review, guest-view, dashboard, API, and payout-service tests during stage work
- `pnpm openapi:generate` if generated contract surfaces change
- final gate: `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Exit Criteria

- the active Dreamboard create flow is 5 steps with no active charity step and a voucher-placeholder contact step
- `takealot_voucher` is valid runtime truth for newly created host Dreamboards across schema, publish, read models, and payout creation
- legacy `/create/giving-back` and `/create/payout` URLs safely redirect into the new flow
- review, dashboard, and guest-facing downstream surfaces no longer present default Karri/charity assumptions for newly created boards
- docs, progress ledger, dogfood evidence, and napkin evidence are current
- this spec closes with `09_session-placeholder` active in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md)

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Implemented the 5-step voucher-placeholder Dreamboard create flow, added `takealot_voucher` runtime truth, synced docs/contracts/tests, and recorded that local browser dogfood of authenticated host routes was blocked by missing Clerk keys (`503 Authentication unavailable` on `/create*`).

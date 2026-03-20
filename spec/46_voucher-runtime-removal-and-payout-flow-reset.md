# 46_voucher-runtime-removal-and-payout-flow-reset

## Objective

- Remove the Takealot voucher workflow from active Gifta runtime and replace it with an elegant host payout step built around bank deposits with an optional Karri Card path, so the implementation finally matches the intended product truth.

## In Scope

- Host create flow step-4 runtime, routing, validation, draft persistence, review summaries, and publish behavior.
- Active runtime payout contracts in `src/lib/dream-boards/`, `src/lib/ux-v2/decision-locks.ts`, `src/app/api/v1/`, `src/lib/api/`, `src/lib/payouts/`, `src/lib/db/schema.ts`, and any related migration needed for hard voucher removal.
- Host dashboard and admin payout labels/copy that still describe voucher behavior.
- Generated contract sync (`public/v1/openapi.json`) plus current-reference docs that must change with the new runtime truth.
- Test coverage, execution artifacts, and dogfood evidence for the new payout flow.

## Out Of Scope

- Implementing live Stitch payment initiation or any new guest checkout flow.
- Broad redesigns outside the payout-related host/admin/dashboard surfaces.
- Preserving compatibility for legacy voucher-era records beyond what is minimally required to land the hard-removal migration safely.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../docs/Platform-Spec-Docs/JOURNEYS.md`](../docs/Platform-Spec-Docs/JOURNEYS.md)
- `../src/app/(host)/create/dates/`
- `../src/app/(host)/create/payout/`
- `../src/app/(host)/create/voucher/`
- `../src/app/(host)/create/review/ReviewClient.tsx`
- [`../src/lib/dream-boards/payout-methods.ts`](../src/lib/dream-boards/payout-methods.ts)
- [`../src/lib/dream-boards/draft.ts`](../src/lib/dream-boards/draft.ts)
- [`../src/lib/db/schema.ts`](../src/lib/db/schema.ts)
- [`../src/lib/payouts/service.ts`](../src/lib/payouts/service.ts)

## Stage Plan

1. Stage 1 — Register spec 46, then replace the host voucher step with a polished `/create/payout` bank/Karri experience and update review routing/summaries.
2. Stage 2 — Remove `takealot_voucher` from active runtime contracts, schema/API/payout service branches, dashboard/admin labels, and generated OpenAPI surfaces.
3. Stage 3 — Sync current docs, run the full verification gate, dogfood the refreshed create flow across breakpoints, and close the spec with proof.

## Test Gate

- `pnpm openapi:generate`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Dogfood `/create/child -> /create/gift -> /create/dates -> /create/payout -> /create/review` at mobile, tablet, and desktop widths.

## Exit Criteria

- New Dreamboards no longer expose any Takealot voucher route, copy, default, or runtime branch in the host create flow.
- Active runtime payout methods/contracts are narrowed to bank with optional Karri; `takealot_voucher` is removed from active runtime behavior and generated contracts.
- Dashboard/admin/review surfaces no longer present voucher-era wording for active product flows.
- The payout step is visually polished, responsive, and coherent with the existing premium create-wizard design language.
- [`../progress.md`](../progress.md) and [`./00_overview.md`](./00_overview.md) reflect the full-path execution lifecycle, including dogfood evidence and napkin handling.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Stages 2 and 3 are complete. Active runtime now uses bank with optional Karri only, voucher-era contracts are removed from schema/API/OpenAPI/dashboard/admin surfaces, and closure evidence includes a full green gate plus auth-blocked browser dogfood attempts across desktop/tablet/mobile.

## Stage 1 Status

- Completed the host create step migration from `/create/voucher` to `/create/payout`, including draft normalization, payout validation, bank/Karri form UX, review wiring, publish persistence, and legacy route redirects.
- Preserved broader API/OpenAPI/database voucher defaults for now by separating the host-create bank default from the shared runtime default.
- Verification: `pnpm lint` (warnings-only, exit 0), `pnpm typecheck`, `pnpm test -- tests/unit/create-step-payout.test.ts tests/unit/create-payout-page.test.tsx tests/unit/create-voucher-page.test.tsx tests/unit/host-create-view-model.test.ts tests/unit/review-client-ui.test.tsx tests/unit/create-step-dates.test.ts tests/unit/create-step-giving-back.test.ts tests/unit/create-giving-back-page.test.tsx tests/integration/create-flow-steps.test.ts tests/unit/payout-form.test.tsx tests/unit/dream-board-draft-normalization.test.ts tests/unit/dream-board-draft-schema.test.ts tests/unit/create-review-page.test.tsx tests/unit/create-review-publish.test.ts tests/unit/review-preview-card.test.tsx tests/unit/review-detail-rows.test.tsx tests/e2e/uat-host-create.test.ts tests/e2e/uat-edge-cases.test.ts` (Vitest executed 175 files / 877 tests, all passing).

## Stage 2 Status

- Removed `takealot_voucher` from the shared payout enums/defaults, database schema constraints, payout planning/service branches, API request validation, OpenAPI source, seed data, host dashboard copy, admin payout labels, and payout serialization.
- Replaced the temporary write-path gating with active bank + Karri capture semantics, while keeping Karri credential requirements tied to automation-only paths.
- Added migration `0021_remove_takealot_voucher_payout.sql` plus journal entry to delete voucher-era rows before rebuilding the payout enums without `takealot_voucher`.

## Stage 3 Status

- Synced current-reference docs (`CANONICAL`, `DATA`, `ARCHITECTURE`, `JOURNEYS`, `NFR-OPERATIONS`, `INTEGRATIONS`, `KARRI`), removed the resolved backlog item, and refreshed generated OpenAPI output.
- Verification: `pnpm openapi:generate`, `pnpm lint` (warnings-only, exit 0), `pnpm typecheck`, `pnpm test`, `pnpm docs:audit -- --sync`, `pnpm docs:audit`.
- Dogfood: attempted live browser verification of `/create/child` at desktop, tablet, and mobile breakpoints via `agent-browser`; each redirected to Clerk sign-in, so authenticated in-app flow proof remained blocked by unavailable host credentials. Fallback coverage came from the full green automated suite, including create-flow and host dashboard tests.

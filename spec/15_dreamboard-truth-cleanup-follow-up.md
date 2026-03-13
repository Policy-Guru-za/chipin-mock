# 15_dreamboard-truth-cleanup-follow-up

## Objective

- Remove dormant first-party charity promo/presentation surfaces, finish the remaining Dreamboard terminology cleanup, and keep charity available only where historical admin/ops truth still requires it.

## In Scope

- deleting dormant charity promo/presentation code from marketing, public Dreamboard, thank-you, host dashboard, and legacy create UI
- simplifying first-party guest/host view-models and tests so they no longer carry charity presentation state
- converting direct `/admin/charities` access from active product-management posture to historical-support posture
- normalizing human-readable `Dreamboard` terminology in active admin and partner API/OpenAPI text
- updating seed/demo data, tests, generated OpenAPI, Tier 1 docs, and execution artifacts for the cleaned product truth

## Out Of Scope

- removing historical charity payout/accounting/reporting data paths
- renaming stable API routes, JSON keys, DB fields, or legacy operational identifiers like `/dream-boards` or `dream_board_id`
- broad payout-engine, webhook, or Karri automation changes beyond copy/seed/truth cleanup
- unrelated admin UX refactors outside the product-truth slice

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../src/components/landing/LandingPage.tsx`](../src/components/landing/LandingPage.tsx)
- `../src/app/(admin)/admin/charities/page.tsx`
- [`../src/lib/dream-boards/view-model.ts`](../src/lib/dream-boards/view-model.ts)
- [`../src/lib/host/dashboard-view-model.ts`](../src/lib/host/dashboard-view-model.ts)

## Stage Plan

1. Stage 1 — delete dormant first-party charity promo/presentation code and simplify first-party Dreamboard/host view-models plus legacy create charity UI leftovers.
2. Stage 2 — convert direct charity admin to historical-support posture and normalize remaining active `Dreamboard` terminology in admin and human-readable API/OpenAPI text.
3. Stage 3 — align seeds, tests, docs, and generated artifacts; run the full gate; dogfood the changed flow where feasible; then hand off into `16_session-placeholder`.

## Test Gate

- focused regression suites for landing/public/thank-you/host/admin/API copy and routing slices during stage work
- `pnpm openapi:generate`
- final gate: `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Exit Criteria

- dormant first-party charity promo/presentation code is removed from active marketing, public Dreamboard, thank-you, host dashboard, and legacy create UI surfaces
- charity remains available only on historical admin/ops surfaces that are explicitly labeled as historical/support-only
- active admin and human-readable API/OpenAPI text use `Dreamboard` consistently without renaming stable contract identifiers
- seeds, tests, Tier 1 docs, and generated artifacts reflect the current product truth
- the session closes with `16_session-placeholder` active and `progress.md` recording the napkin outcome for this closed session

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Completed the dormant charity presentation purge, converted charity admin to historical-support posture, normalized Dreamboard terminology, synced seeds/tests/docs/OpenAPI, and handed off into `16_session-placeholder`.

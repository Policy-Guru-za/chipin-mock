# 28_homepage-timeline-eyebrow-removal

## Objective

- Remove only the homepage timeline eyebrow (`How it works`) and pull the section upward while preserving the main `Gifting, together` title.

## In Scope

- Homepage timeline runtime updates in `src/components/landing-exact/LandingTimelineExact.tsx` and `LandingTimelineExact.module.css`.
- Focused regression coverage updates for the eyebrow-only removal and tightened section-spacing contract.
- Session-artifact updates in `spec/00_overview.md`, `progress.md`, and this spec.

## Out Of Scope

- Changes to the preserved landing nav, hero, voucher band, or footer.
- Copy or layout rewrites outside the homepage timeline section beyond removing the eyebrow and retuning its top spacing.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../src/components/landing-exact/LandingTimelineExact.tsx`](../src/components/landing-exact/LandingTimelineExact.tsx)
- [`../src/components/landing-exact/LandingTimelineExact.module.css`](../src/components/landing-exact/LandingTimelineExact.module.css)
- [`../tests/unit/landing-below-nav-replica.test.ts`](../tests/unit/landing-below-nav-replica.test.ts)

## Stage Plan

1. Stage 1 — Remove only the eyebrow copy and rebalance the section spacing upward while keeping the main title.
2. Stage 2 — Update focused regression coverage for the revised eyebrow-only timeline contract.
3. Stage 3 — Run verification, capture dogfood proof, and close the session artifacts cleanly.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm test tests/unit/landing-below-nav-replica.test.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Desktop localhost screenshot dogfood for the timeline section at the reviewed viewport.

## Exit Criteria

- The homepage timeline eyebrow copy is removed while the main `Gifting, together` title remains.
- The timeline section sits higher with balanced spacing after the eyebrow-only removal.
- Focused regression coverage reflects the new timeline contract.
- `progress.md` records the session result, verification, dogfood, and napkin outcome before handoff.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed only the `How it works` eyebrow, preserved the main `Gifting, together` title, tightened the section top rhythm, updated the focused landing regression, and verified the result with localhost browser dogfood at the reviewed viewport.

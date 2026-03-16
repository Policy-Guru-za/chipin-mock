# 27_homepage-hero-duplicate-rail-cleanup

## Objective

- Remove the duplicated desktop/mobile hero blocks introduced by the previous desktop quote-stack refactor while keeping the desktop quote/CTA placement elegant and preserving the existing mobile flow.

## In Scope

- Homepage hero runtime changes in `src/components/landing-exact/LandingHeroExact.tsx` and `src/components/landing-exact/LandingHeroExact.module.css` needed to replace the duplicated render paths with one semantic composition.
- Any supporting layout changes needed to keep the desktop quote/CTA stack visually strong without reintroducing large white gaps.
- Focused regression coverage for the no-duplicate desktop quote-stack contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Changes to nav seam tokens, font tokens, Agentation overlay behavior, or non-hero homepage sections.
- Mobile/tablet redesign beyond preserving the current hero flow.
- Timeline, voucher band, footer, or any non-homepage routes.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Current duplicated hero runtime in `../src/components/landing-exact/LandingHeroExact.tsx` and `../src/components/landing-exact/LandingHeroExact.module.css`
- Landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`
- Live localhost homepage currently reachable at `http://localhost:3000` for desktop dogfood

## Stage Plan

1. Stage 1 — Replace the duplicated desktop/mobile hero render paths with one semantic composition that supports both desktop rails and the existing mobile order.
2. Stage 2 — Tighten the desktop rail spacing so the quote and CTA stay elegant beneath the funded chip without reintroducing the old dead space.
3. Stage 3 — Run the verification gate, dogfood the desktop homepage layout against localhost, and hand off into `28_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual desktop localhost screenshot dogfood of `/` confirming the duplicate lower copy is gone and the left-rail stack remains elegant.

## Exit Criteria

- The duplicate quote/attribution/CTA is removed.
- The duplicate contributors block is removed.
- Desktop keeps the tighter left-rail stack beneath the funded chip without the previous large dead space.
- Mobile/tablet hero flow remains intact.
- Focused regression coverage locks the no-duplicate desktop quote-stack contract.
- `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live desktop homepage verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Replaced the duplicated desktop/mobile hero paths with one semantic left-rail/right-rail composition, re-locked the contract in `tests/unit/landing-below-nav-replica.test.ts`, and captured live localhost screenshot proof at `output/spec27-homepage-hero-no-duplicate.png` showing the duplicate lower copy removed.

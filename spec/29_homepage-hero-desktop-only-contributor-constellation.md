# 29_homepage-hero-desktop-only-contributor-constellation

## Objective

- Keep the homepage contributor constellation as a true desktop-only decorative element, remove it for widths at `1100px` and below, and rebalance below-desktop hero spacing without disturbing the wide-desktop composition that already works.

## In Scope

- Homepage hero runtime updates in `src/components/landing-exact/LandingHeroExact.module.css` and any minimal supporting `LandingHeroExact.tsx` changes needed to make the external contributor constellation desktop-only.
- Narrow-desktop/tablet/mobile spacing adjustments required to keep the hero elegant after that decorative block is removed below desktop.
- Focused regression coverage for the desktop-only constellation contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Changes to the wide-desktop `1101px+` constellation composition that already works.
- Nav seam, font-token, Agentation, timeline, voucher band, or footer changes.
- New replacement components or compact fallback versions of the constellation below desktop.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Current landing hero runtime in `../src/components/landing-exact/LandingHeroExact.tsx` and `../src/components/landing-exact/LandingHeroExact.module.css`
- Landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`
- Live localhost homepage currently reachable at `http://localhost:3000` for hero breakpoint dogfood

## Stage Plan

1. Stage 1 — Remove the external contributor constellation for widths at `1100px` and below while leaving the existing `1101px+` desktop constellation untouched.
2. Stage 2 — Rebalance hero spacing below desktop so the card, quote, and CTA still feel elegant after the constellation disappears.
3. Stage 3 — Run the verification gate, dogfood the hero at desktop/narrow-desktop/tablet/mobile widths, and hand off into `30_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual localhost screenshot dogfood of `/` at `1440`, `1024`, `820`, and `375` widths confirming the constellation remains at `1101px+`, disappears below desktop, and the hero spacing stays elegant.

## Exit Criteria

- The external `VillageContributors` constellation remains visually unchanged at `1101px+`.
- The external constellation is removed entirely for widths at `1100px` and below.
- Narrow-desktop/tablet/mobile hero spacing remains balanced after the removal.
- No new compact constellation fallback is introduced below desktop.
- Focused regression coverage locks the desktop-only constellation contract plus the below-desktop spacing rules.
- `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live localhost verification at `1440`, `1024`, `820`, and `375` widths or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Kept the wide-desktop contributor constellation intact at `1101px+`, removed it entirely at `1100px` and below, tightened the below-desktop hero spacing, locked the contract in focused regression coverage, and verified the result with localhost screenshots at `1440`, `1024`, `820`, and `375` widths plus the full verification gate.

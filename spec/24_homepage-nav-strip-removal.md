# 24_homepage-nav-strip-removal

## Objective

- Remove the visible white strip directly under the fixed homepage nav so the hero UI begins immediately below the nav border, prioritizing the live app over strict prototype spacing inheritance.

## In Scope

- Landing-page layout changes in `src/components/landing/` and `src/components/landing-exact/` required to eliminate the separate blank band under the nav.
- Homepage hero spacing/min-height adjustments needed to preserve a clean fixed-nav offset without a standalone visible spacer.
- Focused regression coverage for the no-strip nav/hero contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Broad redesign of homepage copy, cards, timeline, or footer.
- Auth/menu behavior changes beyond preserving the current nav states while removing the blank strip below the nav.
- Non-homepage layout changes outside the landing nav/hero seam.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Current landing layout surfaces in `../src/components/landing/LandingPage.tsx`, `../src/components/landing/LandingChrome.module.css`, and `../src/components/landing/LandingNav.tsx`
- Current hero spacing contract in `../src/components/landing-exact/LandingHeroExact.module.css` and `../src/components/landing-exact/LandingBodyExactShell.module.css`
- Existing landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`
- Reviewed prototype inheritance path in `../tmp/gifta-react/src/App.jsx` and `../tmp/gifta-react/src/styles.css`

## Stage Plan

1. Stage 1 — Remove the standalone visible landing spacer and move fixed-nav clearance ownership into the first visible homepage section.
2. Stage 2 — Reconcile hero top spacing/min-height so the hero begins immediately below the nav border, then update focused regression coverage.
3. Stage 3 — Run the verification gate, dogfood the homepage seam at the approved surface, and hand off into `25_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual dogfood of `/` focused on the fixed nav seam, or explicit fallback evidence if local env constraints block live proof.

## Exit Criteria

- The homepage no longer renders a separate visible blank strip beneath the fixed nav border.
- Fixed-nav clearance is still preserved, but it is owned by the first visible hero/shell layout rather than a standalone spacer block.
- Focused regression coverage locks the no-strip nav/hero contract.
- `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live homepage seam verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed the standalone landing nav spacer, folded fixed-nav clearance into the hero section padding, switched the desktop hero to start-aligned placement, and updated landing regression coverage so the blank strip cannot return. Live localhost dogfood succeeded at `http://localhost:3000` via agent-browser screenshot verification in a desktop viewport, showing the hero beginning directly below the nav border without the previous empty band.

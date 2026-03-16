# 25_homepage-hero-top-inset-polish

## Objective

- Restore a polished, elegant nav-to-hero relationship by keeping the blank strip removed while adding a small deliberate breathing inset inside the hero section below the fixed nav.

## In Scope

- Homepage hero spacing updates in `src/components/landing-exact/LandingHeroExact.module.css` needed to add a subtle post-nav inset without reintroducing a visible spacer.
- Any small landing token updates in `src/components/landing/LandingChrome.module.css` needed to express that inset cleanly across current breakpoints.
- Focused regression coverage for the no-strip plus subtle-inset contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Reintroducing a standalone spacer in `LandingPage.tsx`.
- Broader homepage redesign outside the hero section.
- Auth, nav behavior, overlay behavior, or non-hero landing section changes unless strictly required by the spacing polish.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Current no-strip landing seam contract in `../src/components/landing/LandingPage.tsx`, `../src/components/landing/LandingChrome.module.css`, and `../src/components/landing-exact/LandingHeroExact.module.css`
- Landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`
- Live localhost homepage currently reachable at `http://localhost:3000` for screenshot dogfood

## Stage Plan

1. Stage 1 — Introduce a small hero-owned top inset beneath the fixed nav while preserving the no-strip architecture.
2. Stage 2 — Reconcile hero height math and update focused regression coverage so the seam remains clean but no longer cramped.
3. Stage 3 — Run the verification gate, dogfood the desktop homepage hero seam, and hand off into `26_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual desktop localhost screenshot dogfood of `/` focused on the nav-to-hero spacing.

## Exit Criteria

- The homepage still has no visible blank strip beneath the nav.
- The hero no longer feels jammed against the nav border because a small intentional inset exists inside the visible hero section.
- Focused regression coverage locks the no-strip plus subtle-inset contract.
- `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live desktop homepage seam verification.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Added a restrained hero-owned top inset through shared landing tokens, updated hero height math so the no-strip seam stayed clean without reintroducing a blank band, and locked the subtle-inset contract with focused regression coverage. Live localhost dogfood via agent-browser at desktop width confirmed the hero now sits below the nav border with visible breathing room while keeping the strip removed.

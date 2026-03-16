# Progress

## Current Spec

- `26_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/25_homepage-hero-top-inset-polish.md`](./spec/25_homepage-hero-top-inset-polish.md) as done and activated [`spec/26_session-placeholder.md`](./spec/26_session-placeholder.md).
- Added shared landing hero top-inset tokens so the first visible hero section now owns a small breathing gap beneath the fixed nav without reintroducing a blank spacer.
- Reconciled hero height math to preserve the no-strip seam, then updated regression coverage to lock the subtle-inset contract.

## Blockers

- None.

## Next Step

- Rename [`spec/26_session-placeholder.md`](./spec/26_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `25_homepage-hero-top-inset-polish`

## Last Completed Spec

- `25_homepage-hero-top-inset-polish`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 179 markdown files)
- `pnpm docs:audit` (passed; 179 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 942 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: `agent-browser open http://localhost:3000 && agent-browser set viewport 1440 1200 && agent-browser wait 5000 && agent-browser screenshot --annotate` produced a desktop screenshot confirming the hero now sits below the nav border with visible breathing room while keeping the blank strip removed.
- Focused regression proof: `tests/unit/landing-below-nav-replica.test.ts` now locks the shared hero top-inset tokens plus the hero-owned subtle-inset/no-strip seam contract.
- Full gate proof: docs audit sync, docs audit, the focused landing regression test, lint, typecheck, and the full test suite all passed after the hero top-inset polish.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 25 learning: after collapsing nav clearance into the hero, add a small section-owned inset so the seam stays clean without feeling cramped against the nav border.

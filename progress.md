# Progress

## Current Spec

- `25_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/24_homepage-nav-strip-removal.md`](./spec/24_homepage-nav-strip-removal.md) as done and activated [`spec/25_session-placeholder.md`](./spec/25_session-placeholder.md).
- Removed the standalone landing nav spacer from `LandingPage`, so the fixed-nav offset is no longer rendered as a visible blank band between the nav and the hero.
- Shifted the nav clearance into the hero layout itself by using the landing nav offset for hero top padding, start-aligning the hero row, and updating regression coverage so the strip cannot return unnoticed.

## Blockers

- None.

## Next Step

- Rename [`spec/25_session-placeholder.md`](./spec/25_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `24_homepage-nav-strip-removal`

## Last Completed Spec

- `24_homepage-nav-strip-removal`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 177 markdown files)
- `pnpm docs:audit` (passed; 177 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 942 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: `curl -I` returned `200 OK`, and `agent-browser open http://localhost:3000 && agent-browser wait 5000 && agent-browser screenshot --annotate` produced a desktop screenshot showing the hero starting directly below the nav border with no separate blank strip.
- Focused regression proof: `tests/unit/landing-below-nav-replica.test.ts` now locks the absence of a standalone landing nav spacer plus the hero's offset-owned no-strip seam contract.
- Full gate proof: docs audit sync, docs audit, the focused landing regression test, lint, typecheck, and the full test suite all passed after the nav-strip removal.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 24 learning: never reserve fixed-nav clearance as a visible empty spacer on the homepage; hide the offset under the nav or let the first visible section own it and lock that rule with a regression test.

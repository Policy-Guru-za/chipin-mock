# Progress

## Current Spec

- `28_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/27_homepage-hero-duplicate-rail-cleanup.md`](./spec/27_homepage-hero-duplicate-rail-cleanup.md) as done and activated [`spec/28_session-placeholder.md`](./spec/28_session-placeholder.md).
- Replaced the homepage hero’s cloned desktop/mobile quote-stack paths with one semantic left-rail/right-rail composition so the quote, CTA, and contributors each render once while still reordering cleanly across breakpoints.
- Updated the landing regression contract to lock the one-composition/no-duplicate hero structure and the mobile-safe breakpoint ordering that now powers the layout.

## Blockers

- None.

## Next Step

- Rename [`spec/28_session-placeholder.md`](./spec/28_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `27_homepage-hero-duplicate-rail-cleanup`

## Last Completed Spec

- `27_homepage-hero-duplicate-rail-cleanup`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 181 markdown files)
- `pnpm docs:audit` (passed; 181 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 943 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: `agent-browser open http://localhost:3000 && agent-browser set viewport 1440 1200 && agent-browser wait --load networkidle && agent-browser screenshot output/spec27-homepage-hero-no-duplicate.png --annotate` produced a desktop screenshot confirming the duplicate lower quote/CTA copy is gone while the left-rail stack remains intact; the homepage-only Agentation overlay was active during capture and did not reintroduce duplicate hero content.
- Screenshot proof for Spec 27 is saved at [`output/spec27-homepage-hero-no-duplicate.png`](./output/spec27-homepage-hero-no-duplicate.png).
- Focused regression proof: `pnpm test tests/unit/landing-below-nav-replica.test.ts` passed after the runtime cleanup and now locks the one-composition/no-duplicate hero contract plus the mobile-safe breakpoint ordering.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the duplicate-rail cleanup and final handoff artifact sync.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 27 learning: for breakpoint-specific hero composition work, keep one semantic set of narrative/visual blocks in JSX and use CSS reordering/layout overrides instead of cloning desktop/mobile copies.

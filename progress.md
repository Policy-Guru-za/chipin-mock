# Progress

## Current Spec

- `31_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/30_homepage-hero-headline-libre-baskerville.md`](./spec/30_homepage-hero-headline-libre-baskerville.md) as done and activated [`spec/31_session-placeholder.md`](./spec/31_session-placeholder.md).
- Expanded the active Libre Baskerville font registration to cover bold upright plus regular italic without disturbing the shared Fraunces editorial token.
- Moved only the live homepage hero headline to `--font-libre-baskerville`, preserved the testimonial quote ornament on Fraunces, and locked the headline-only contract with focused regression coverage.

## Blockers

- None.

## Next Step

- Rename [`spec/31_session-placeholder.md`](./spec/31_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `30_homepage-hero-headline-libre-baskerville`

## Last Completed Spec

- `30_homepage-hero-headline-libre-baskerville`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 184 markdown files)
- `pnpm docs:audit` (passed; 184 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 946 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: `agent-browser open http://localhost:3000 && agent-browser set viewport 1440 1200 && agent-browser wait --load networkidle && agent-browser wait 2000 && agent-browser screenshot output/spec30-homepage-hero-libre-baskerville.png --annotate && agent-browser errors` produced a desktop hero screenshot confirming the two-line headline now renders in Libre Baskerville while the testimonial quote ornament and the rest of the homepage remain visually unchanged; browser error output stayed empty.
- Screenshot proof for Spec 30 is saved at [`output/spec30-homepage-hero-libre-baskerville.png`](./output/spec30-homepage-hero-libre-baskerville.png).
- Focused regression proof: `pnpm test tests/unit/landing-below-nav-replica.test.ts` passed after the runtime update and now locks the headline-only Libre Baskerville contract plus the preserved Fraunces quote-ornament token.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the headline-only hero font update and final handoff artifact sync.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 30 learning: for one-off homepage font swaps, keep shared tokens stable and target the exact selector instead of rewiring the shared editorial token.

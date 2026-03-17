# Progress

## Current Spec

- `37_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/36_homepage-testimonial-timing-and-copy-polish.md`](./spec/36_homepage-testimonial-timing-and-copy-polish.md) as done and activated [`spec/37_session-placeholder.md`](./spec/37_session-placeholder.md).
- Slowed the shared testimonial cadence to 8 seconds, shortened the Rachel quote, and removed the exact hero's extra per-quote entrance replay so the transition feels calmer without changing the shell.
- Re-ran focused homepage regressions, the full verification gate, and live localhost browser dogfood to confirm the quote now stays on Priya beyond 5 seconds before rotating forward.

## Blockers

- None.

## Next Step

- Rename [`spec/37_session-placeholder.md`](./spec/37_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `36_homepage-testimonial-timing-and-copy-polish`

## Last Completed Spec

- `36_homepage-testimonial-timing-and-copy-polish`

## Last Green Commands

- `pnpm exec vitest run tests/unit/landing-hero-testimonial-rotator.test.tsx tests/unit/landing-below-nav-replica.test.ts` (passed; 2 files, 17 tests)
- `pnpm docs:audit -- --sync` (passed; 190 markdown files)
- `pnpm docs:audit` (passed; 190 markdown files)
- `pnpm lint` (0 errors, 107 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (199 test files, 965 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: reloading the page and waiting 5.5 seconds kept Priya on screen, while a browser-side timing probe confirmed the shortened Rachel quote appeared after hydration at roughly 6.4 seconds into the live client interval, consistent with the slower 8-second cadence once the initial hydration delay is accounted for.
- Screenshot proof for Spec 36 is saved at [`output/spec36-homepage-testimonial-priya-initial.png`](./output/spec36-homepage-testimonial-priya-initial.png), [`output/spec36-homepage-testimonial-priya-still-at-5s.png`](./output/spec36-homepage-testimonial-priya-still-at-5s.png), and [`output/spec36-homepage-testimonial-rachel-after-hydration.png`](./output/spec36-homepage-testimonial-rachel-after-hydration.png).
- Focused regression proof: `pnpm exec vitest run tests/unit/landing-hero-testimonial-rotator.test.tsx tests/unit/landing-below-nav-replica.test.ts` passed after the timing/copy polish and now locks the slower shared interval plus the updated Rachel quote contract.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the testimonial polish and final artifact sync.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 36 learning: client-side rotation dogfood should measure from post-hydration browser timing rather than only wall-clock waits between CLI screenshots.

# Progress

## Current Spec

- `29_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/28_homepage-timeline-eyebrow-removal.md`](./spec/28_homepage-timeline-eyebrow-removal.md) as done and activated [`spec/29_session-placeholder.md`](./spec/29_session-placeholder.md).
- Removed only the homepage timeline eyebrow copy while preserving the main `Gifting, together` title.
- Tightened the timeline section top rhythm and updated the focused landing regression so the eyebrow-only contract stays locked.

## Blockers

- None.

## Next Step

- Rename [`spec/29_session-placeholder.md`](./spec/29_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `28_homepage-timeline-eyebrow-removal`

## Last Completed Spec

- `28_homepage-timeline-eyebrow-removal`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed)
- `pnpm docs:audit` (passed)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 944 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000/#how-it-works`: `agent-browser open http://localhost:3000/#how-it-works && agent-browser set viewport 1920 929 && agent-browser wait --load networkidle && agent-browser wait 2000 && agent-browser screenshot output/spec28-timeline-eyebrow-only-removed.png --annotate` produced a reviewed-viewport screenshot confirming the eyebrow is gone while the `Gifting, together` title remains and the timeline sits higher.
- Screenshot proof for Spec 28 is saved at [`output/spec28-timeline-eyebrow-only-removed.png`](./output/spec28-timeline-eyebrow-only-removed.png).
- Focused regression proof: `pnpm test tests/unit/landing-below-nav-replica.test.ts` passed after the runtime update and now locks the eyebrow-only removal plus the tightened timeline top-rhythm contract.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the eyebrow-only removal and final handoff artifact sync.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 28 learning: for multi-level section headings, remove only the explicitly named tier and preserve the primary title unless the user asks to remove the whole stack.

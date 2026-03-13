# Progress

## Current Spec

- `18_session-placeholder`

## Current Stage

- Placeholder — awaiting next session activation

## Status

- Closed [`spec/17_draft-strict-parsing-fix.md`](./spec/17_draft-strict-parsing-fix.md) as `Done` after fixing the P1 strict-parsing rejection of persisted host-create drafts at the review and publish consumption sites.
- Activated [`spec/18_session-placeholder.md`](./spec/18_session-placeholder.md) as the standing next-session placeholder.

## Blockers

- None.

## Next Step

- Rename `spec/18_session-placeholder.md` in place when the next bounded Gifta session begins.

## Last Session Spec

- `17_draft-strict-parsing-fix`

## Last Completed Spec

- `17_draft-strict-parsing-fix`

## Last Green Commands

- `pnpm lint` (0 errors, 105 pre-existing warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (195 test files, 930 tests passed)

## Dogfood Evidence

- Full gate green: lint, typecheck, and test all passing.
- Confirmed both `page.tsx` and `actions.ts` use `.strip().safeParse()`.
- Updated `create-review-page.test.tsx` schema mock to expose `.strip()` matching the new runtime call chain.
- New schema test cases prove: (1) strict schema rejects persisted fields, (2) stripped schema accepts and removes them.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 17 learning: use `.strip().safeParse()` at KV consumption sites; keep `.strict()` on canonical schema; always test with real persisted shape.

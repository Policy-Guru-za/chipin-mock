# Progress

## Current Spec

- `21_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/20_hero-font-token-cleanup.md`](./spec/20_hero-font-token-cleanup.md) as done and activated [`spec/21_session-placeholder.md`](./spec/21_session-placeholder.md).
- Restored the prototype font-token split by moving shared display surfaces back to DM Serif Display, introducing a dedicated Fraunces editorial token, and preserving the old `--font-dm-serif` references through an alias.
- Rewired the active homepage Hero editorial surfaces and the legacy landing Hero to the editorial token, then added focused regression coverage for the split token contract.

## Blockers

- None.

## Next Step

- Rename [`spec/21_session-placeholder.md`](./spec/21_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `20_hero-font-token-cleanup`

## Last Completed Spec

- `20_hero-font-token-cleanup`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 174 markdown files)
- `pnpm docs:audit` (passed; 174 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 939 tests passed)

## Dogfood Evidence

- Live localhost Hero dogfood was blocked in this workspace because neither the reviewed prototype server (`http://localhost:5174`) nor the app server (`http://localhost:3000`) was running.
- Safe fallback proof for Spec 20: compared the active app font-token wiring against the reviewed prototype source in `tmp/gifta-react`, and the focused `landing-below-nav-replica` regression test now locks the shared display/editorial split plus the homepage Hero editorial token usage.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the font-token cleanup.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 20 learning: preserve the prototype split between shared display and editorial font tokens so homepage Hero parity does not depend on an overloaded `--font-display` variable.

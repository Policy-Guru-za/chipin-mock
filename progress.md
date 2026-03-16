# Progress

## Current Spec

- `23_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/22_homepage-hero-headline-nowrap.md`](./spec/22_homepage-hero-headline-nowrap.md) as done and activated [`spec/23_session-placeholder.md`](./spec/23_session-placeholder.md).
- Replaced the desktop hero equal-column squeeze with a wider explicit text/card split, slightly reduced the desktop hero type scale, and added desktop-only no-wrap protection for the two intended headline lines.
- Added a mobile-safe single-column fallback plus focused regression coverage so the desktop headline contract is now explicit instead of accidental.

## Blockers

- None.

## Next Step

- Rename [`spec/23_session-placeholder.md`](./spec/23_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `22_homepage-hero-headline-nowrap`

## Last Completed Spec

- `22_homepage-hero-headline-nowrap`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 176 markdown files)
- `pnpm docs:audit` (passed; 176 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 941 tests passed)

## Dogfood Evidence

- Local homepage hero dogfood remained blocked by the repo's auth-unavailable middleware: the existing localhost dev server on `http://localhost:3000` returned `503 Authentication unavailable` to both `curl -I` and body checks without Clerk keys.
- Safe fallback proof for Spec 22: the hero source now encodes an explicit wider desktop text track, desktop-only no-wrap protection, and a single-column fallback below the desktop threshold; `tests/unit/landing-below-nav-replica.test.ts` locks that contract directly.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, the focused hero regression test, and the full test suite all passed after the hero headline fix.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 22 learning: encode screenshot-level hero text contracts explicitly with guaranteed text width, desktop-only no-wrap, and regression coverage instead of relying on incidental column width.

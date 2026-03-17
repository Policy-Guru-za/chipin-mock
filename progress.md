# Progress

## Current Spec

- `40_session-placeholder`

## Current Stage

- Awaiting next session topic

## Status

- Closed [`spec/39_shared-header-top-link-removal.md`](./spec/39_shared-header-top-link-removal.md) after removing the shared-shell `How it works` and `Trust & safety` headings from both the desktop header and mobile drawer while preserving the remaining CTA/auth balance.
- Moved the progress ledger forward to `40_session-placeholder` while carrying the green Spec 39 verification, localhost dogfood proof, and the new napkin note.

## Blockers

- None.

## Next Step

- Rename `40_session-placeholder` in place once the next session topic is known.

## Last Session Spec

- `39_shared-header-top-link-removal`

## Last Completed Spec

- `39_shared-header-top-link-removal`

## Last Green Commands

- `pnpm exec vitest run tests/unit/auth-nav-user-menu.test.ts tests/unit/mobile-nav.test.tsx` (passed; 2 files, 5 tests)
- `pnpm docs:audit -- --sync` (passed; 193 markdown files)
- `pnpm docs:audit` (passed; 193 markdown files)
- `pnpm lint` (0 errors, 107 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (199 test files, 967 tests passed)

## Dogfood Evidence

- Live localhost shared-header proof on `http://localhost:3000/maya-birthday-demo` shows the desktop header reduced to Gifta + Create + Sign in in [`output/spec39-shared-header-demo-board-desktop.png`](./output/spec39-shared-header-demo-board-desktop.png), and the mobile drawer reduced to Sign in + Create in [`output/spec39-shared-header-demo-board-mobile-drawer.png`](./output/spec39-shared-header-demo-board-mobile-drawer.png); a direct host-route visual pass remained auth-blocked by the signed-out Clerk redirect, but both host and guest layouts share the same updated `Header`/`MobileNav` components.

## Napkin Evidence

- See [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) for the Spec 39 shared-header dogfood route-selection note.

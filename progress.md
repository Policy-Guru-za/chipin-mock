# Progress

## Current Spec

- `30_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/29_homepage-hero-desktop-only-contributor-constellation.md`](./spec/29_homepage-hero-desktop-only-contributor-constellation.md) as done and activated [`spec/30_session-placeholder.md`](./spec/30_session-placeholder.md).
- Kept the contributor constellation only on true desktop (`1101px+`), removed it entirely at `1100px` and below, and rebalanced the below-desktop hero spacing without disturbing the reviewed wide-desktop composition.
- Locked the desktop-only constellation contract in focused regression coverage and captured localhost screenshot proof at `1440`, `1024`, `820`, and `375` widths.

## Blockers

- None.

## Next Step

- Rename [`spec/30_session-placeholder.md`](./spec/30_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `29_homepage-hero-desktop-only-contributor-constellation`

## Last Completed Spec

- `29_homepage-hero-desktop-only-contributor-constellation`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed)
- `pnpm docs:audit` (passed)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 945 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: screenshot capture at `1440`, `1024`, `820`, and `375` widths confirmed the contributor constellation remains on the wide-desktop hero, disappears completely below `1100px`, and the tightened below-desktop hero spacing stays balanced.
- Screenshot proof for Spec 29 is saved at [`output/spec29-hero-1440.png`](./output/spec29-hero-1440.png), [`output/spec29-hero-1024.png`](./output/spec29-hero-1024.png), [`output/spec29-hero-820.png`](./output/spec29-hero-820.png), and [`output/spec29-hero-375.png`](./output/spec29-hero-375.png).
- Focused regression proof: `pnpm test tests/unit/landing-below-nav-replica.test.ts` passed after the runtime update and now locks the desktop-only constellation plus below-desktop spacing contract.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the desktop-only constellation update and final handoff artifact sync.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 29 learning: when a decorative hero constellation relies on wide-desktop fixed offsets, remove it entirely below the cutoff and rebalance spacing instead of inventing a compact fallback.

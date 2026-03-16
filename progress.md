# Progress

## Current Spec

- `22_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/21_landing-nav-seam-alignment.md`](./spec/21_landing-nav-seam-alignment.md) as done and activated [`spec/22_session-placeholder.md`](./spec/22_session-placeholder.md).
- Replaced the hard-coded landing spacer heights with shared landing chrome tokens so the preserved nav chrome now follows the reviewed `1100px`/`480px` breakpoint contract instead of generic Tailwind `md/lg` cutoffs.
- Synced the first homepage hero seam math to the shared nav offset and added focused regression coverage for the breakpoint contract.

## Blockers

- None.

## Next Step

- Rename [`spec/22_session-placeholder.md`](./spec/22_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `21_landing-nav-seam-alignment`

## Last Completed Spec

- `21_landing-nav-seam-alignment`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 175 markdown files)
- `pnpm docs:audit` (passed; 175 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 940 tests passed)

## Dogfood Evidence

- Local homepage dogfood via `pnpm dev` remained blocked by the repo's auth-unavailable middleware: `curl http://localhost:3000` returned `503 Authentication unavailable` without Clerk keys.
- Safe fallback proof for Spec 21: source comparison against `tmp/gifta-react/src/styles.css` confirmed the reviewed `1100px` and `480px` seam offsets, and `tests/unit/landing-below-nav-replica.test.ts` now locks the shared landing chrome breakpoint contract plus the hero seam offset wiring.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the seam-alignment fix.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 21 learning: keep seam-critical homepage spacing on one landing-specific CSS contract instead of approximating the reviewed breakpoint math with generic Tailwind `md/lg` classes.

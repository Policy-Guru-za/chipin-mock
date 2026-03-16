# Progress

## Current Spec

- `19_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/18_below-nav-homepage-replica.md`](./spec/18_below-nav-homepage-replica.md) as done and activated [`spec/19_session-placeholder.md`](./spec/19_session-placeholder.md).
- Preserved the current homepage nav/auth shell, kept the two homepage nav links removed, and replaced everything below the nav seam with the reviewed replica in isolated homepage-only components/styles/assets.
- Added homepage regression coverage for the preserved nav/auth contract plus the new below-nav replica contract.

## Blockers

- `pnpm docs:audit` still fails on pre-existing control-matrix classification gaps in the current tree (latest first failure: `tmp/gifta-react/README.md`).

## Next Step

- Rename [`spec/19_session-placeholder.md`](./spec/19_session-placeholder.md) in place when the next session topic is known.
- If live homepage auth dogfood is needed in a future session, rerun browser verification with real Clerk test keys instead of missing or dummy keys.

## Last Session Spec

- `18_below-nav-homepage-replica`

## Last Completed Spec

- `18_below-nav-homepage-replica`

## Last Green Commands

- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (196 test files, 934 tests passed)

## Dogfood Evidence

- Local browser dogfood of `/` without Clerk keys returned `503 Authentication unavailable`, matching the repo's auth-unavailable middleware contract.
- Local browser dogfood with dummy Clerk env values failed at runtime with `Publishable key not valid.`, so route-level auth-enabled homepage verification remains blocked on real Clerk test keys.
- Safe fallback proof for Spec 18: the targeted homepage regression suite passed (`landing-below-nav-replica`, `auth-nav-user-menu`, `copy-matrix-compliance`, `colour-contrast`, `accessibility`) and the full `pnpm test` suite stayed green.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 18 learning: local homepage/auth dogfood needs real Clerk test keys; dummy keys only replace the 503 middleware block with a Clerk runtime error.

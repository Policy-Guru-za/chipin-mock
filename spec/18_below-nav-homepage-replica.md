# 18_below-nav-homepage-replica

## Objective

- Replace the homepage content below the existing marketing nav with a pixel-perfect replica of the reviewed `tmp/gifta-react` design while keeping the current nav, avatar, auth behavior, and wider application UI/UX unchanged.

## In Scope

- Homepage body content rendered below the current marketing nav/spacer seam.
- Exact replication of the reviewed design's below-nav typography, copy, assets, colors, gradients, icons, spacing, breakpoints, shadows, and motion.
- Homepage-only assets, components, styles, and tests needed to deliver and verify the replica.
- Keeping the two removed homepage menu items removed while preserving the rest of the current nav/auth surface.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Restyling or changing the current homepage nav shell.
- Changing avatar appearance, avatar interactions, signed-in nav behavior, signed-out nav behavior, or Clerk wiring.
- Host, guest, admin, dashboard, create, sign-in, and sign-up surfaces outside the homepage body.
- Reintroducing the removed marketing menu items.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Reviewed design sources under `../tmp/gifta-react/`
- Current marketing homepage runtime in `../src/app/(marketing)/` and `../src/components/landing/`
- Current auth/menu runtime in `../src/components/auth/UserAvatarMenu.tsx` and `../src/lib/auth/clerk-config.ts`

## Stage Plan

1. Stage 1 — Activate the session artifacts, freeze the current nav seam as untouchable, and build the new below-nav homepage shell in isolated homepage-only components/styles/assets.
2. Stage 2 — Port the reviewed below-nav motion, footer, route wiring, and homepage-specific regression coverage without altering the current nav/auth behavior.
3. Stage 3 — Run the verification gate, dogfood the homepage where the local auth environment allows it, record any auth-enabled verification block explicitly, and hand off into `19_session-placeholder`.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual dogfood of `/` with current nav/auth preserved; if real Clerk test keys are unavailable locally, record the auth-enabled homepage verification block explicitly and rely on targeted plus full automated regression coverage as fallback proof.

## Exit Criteria

- The current homepage nav/auth region remains visually and behaviorally unchanged except that the two removed marketing menu items stay removed.
- Everything below the nav seam matches the reviewed design's below-nav contract, including assets, typography, colors, layout, responsiveness, and motion.
- Prototype dead anchors used in the below-nav body are replaced with real app routes where required.
- Homepage-specific tests and verification prove the preserved nav/auth contract plus the new below-nav contract.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records the homepage verification status honestly, including any local auth-enabled verification block when real Clerk test keys are unavailable.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Replaced the homepage body below the preserved nav/auth seam with the reviewed replica, kept the two homepage nav links removed, added homepage contract regression coverage, and verified with `pnpm lint`, `pnpm typecheck`, and `pnpm test`; `pnpm docs:audit` still fails on pre-existing control-matrix classification gaps outside this pass, and because real Clerk test keys were unavailable locally, live auth-enabled browser dogfood was recorded as blocked with targeted plus full automated coverage used as fallback proof.

# 34_homepage-footer-voucher-partner-pill-removal

## Objective

- Remove the homepage footer voucher-partner pill and rebalance the footer spacing so the remaining brand, social, policy, and copyright blocks still feel intentional.

## In Scope

- Runtime updates in `src/components/landing-exact/LandingFooterExact.tsx` and `LandingFooterExact.module.css` for the footer voucher-partner pill removal and spacing retune.
- Focused regression coverage updates for the revised footer contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Changes to the homepage voucher band, hero, timeline, or other landing sections.
- Removal of any other footer block besides the voucher-partner pill.
- Copy or route changes to the footer links.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/components/landing-exact/LandingFooterExact.tsx`](../src/components/landing-exact/LandingFooterExact.tsx)
- [`../src/components/landing-exact/LandingFooterExact.module.css`](../src/components/landing-exact/LandingFooterExact.module.css)
- [`../tests/unit/landing-below-nav-replica.test.ts`](../tests/unit/landing-below-nav-replica.test.ts)
- Live localhost homepage currently reachable at `http://localhost:3000` for footer dogfood

## Stage Plan

1. Stage 1 — Remove the footer voucher-partner pill from the exact landing footer component and prune any now-unused imports/styles.
2. Stage 2 — Retune the footer spacing plus focused regression coverage so the remaining footer stack stays balanced after the pill disappears.
3. Stage 3 — Run the verification gate, dogfood the homepage footer at the reviewed viewport, and hand off into `35_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual localhost dogfood of `/` at the reviewed desktop viewport confirming the footer pill is gone and the remaining spacing still feels balanced.

## Exit Criteria

- The homepage footer no longer renders the voucher-partner pill.
- The remaining footer blocks keep balanced spacing after the pill is removed.
- Focused regression coverage locks the no-pill footer contract while preserving voucher-partner messaging in the voucher band.
- `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records localhost footer verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed the footer voucher-partner pill from the exact landing footer, pruned the unused partner styles/import, tightened the remaining footer spacing, updated the landing regression coverage to lock the no-pill contract while preserving voucher-band partner messaging, and verified the result with localhost browser screenshots plus the full verification gate.

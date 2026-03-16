# 23_agentation-homepage-dev-overlay

## Objective

- Wire Agentation into the homepage as a development-only overlay so Gifta can generate highly specific UI-fix requests from live annotations without affecting production or non-homepage surfaces.

## In Scope

- A dedicated client-only Agentation wrapper for homepage use.
- Homepage-only mounting on the landing surface in development mode.
- An explicit opt-in env guard for the overlay.
- Focused regression coverage for the homepage/dev-only/manual-overlay contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- MCP, webhook, or endpoint wiring in app code.
- Rollout beyond the homepage landing surface.
- Production activation or any admin/guest/payment-surface integration.
- Changes to homepage content, layout, auth, or landing chrome beyond what is strictly required to mount the overlay.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Existing marketing homepage route in `../src/app/(marketing)/page.tsx`
- Landing runtime in `../src/components/landing/LandingPage.tsx`
- Existing Agentation package registration in `../package.json`
- Landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`

## Stage Plan

1. Stage 1 — Update the execution artifacts for the Agentation homepage-overlay session and add the dedicated client-only wrapper.
2. Stage 2 — Mount the wrapper on the homepage landing surface and add focused regression coverage for the dev-only/manual-overlay contract.
3. Stage 3 — Run the verification gate, dogfood the homepage overlay or record the explicit local-auth blocker, then hand off into `24_session-placeholder`.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Manual dogfood of `/` on desktop with Agentation enabled, or explicit fallback evidence if local auth middleware still blocks the homepage.

## Exit Criteria

- The session is tracked under `spec/23_agentation-homepage-dev-overlay.md` with `spec/00_overview.md` and `progress.md` updated before runtime edits.
- Homepage runtime mounts a dedicated Agentation wrapper only on the landing surface.
- The overlay stays gated to development mode plus an explicit opt-in env flag.
- The first slice remains local/manual only with no `endpoint`, `sessionId`, or `webhookUrl` app wiring.
- Focused regression coverage locks the homepage/dev-only/manual-overlay contract.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are green.
- Dogfood evidence records live homepage overlay verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Added a dedicated client-only Agentation wrapper, mounted it only on the homepage landing surface behind `NODE_ENV === 'development'` plus `NEXT_PUBLIC_ENABLE_AGENTATION === 'true'`, and kept the first slice manual-only with no endpoint/webhook/session props. Focused regression coverage now locks the homepage/dev-only/manual-overlay contract. Full docs/code/build gates passed. Live overlay dogfood remained blocked because a separate existing `next dev` instance held the repo lock, which prevented starting a dedicated overlay-enabled server for this session; the running localhost instance was reachable, but its env state was not controlled here, so the session records the blocker and uses the green gate plus source-level contract proof as fallback evidence.

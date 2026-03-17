# 37_create-review-publish-scroll-reset

## Objective

- Ensure the `/create/review` publish-success celebration always loads from the top of the viewport instead of inheriting the previous preview-step scroll position.

## In Scope

- Runtime updates in `src/app/(host)/create/review/ReviewClient.tsx` for the celebration-only scroll reset and any minimal focus-management support tied to that state transition.
- Focused regression coverage for the published-state scroll-reset contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Changes to other create steps or general `/create/review` first-entry behavior.
- Confetti visual changes, review-step copy changes, or layout restyling outside the success-state scroll/focus reset.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- `../src/app/(host)/create/review/ReviewClient.tsx`
- [`../tests/unit/review-client-ui.test.tsx`](../tests/unit/review-client-ui.test.tsx)
- Live localhost host-create flow if an authenticated session/draft is available for dogfood

## Stage Plan

1. Stage 1 — Add a celebration-only publish-success scroll reset in `ReviewClient` so the success state starts at the top on the same route transition.
2. Stage 2 — Add focused regression coverage for published-state scroll behavior while keeping preview behavior unchanged.
3. Stage 3 — Run the verification gate, dogfood the publish-success flow if possible, and hand off into `38_session-placeholder`.

## Test Gate

- `pnpm exec vitest run tests/unit/review-client-ui.test.tsx`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual localhost dogfood of the `/create/review` publish-success celebration if an authenticated host session/draft is available, or an explicit environment block with focused test fallback proof.

## Exit Criteria

- The publish-success `Dreamboard is ready!` celebration resets scroll to the top when it appears.
- The reset is scoped to the published celebration state, not every `/create/review` visit.
- Focused regression coverage locks the published-state scroll-reset contract.
- `pnpm exec vitest run tests/unit/review-client-ui.test.tsx`, `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live localhost verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Added a celebration-only top-of-page scroll reset and focus handoff in `ReviewClient`, locked the behavior with focused published-state regression coverage, and verified the full gate. Live localhost publish-success dogfood stayed blocked by the host auth redirect to Clerk sign-in without an authenticated agent-browser session.

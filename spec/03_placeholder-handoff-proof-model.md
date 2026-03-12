# 03_placeholder-handoff-proof-model

## Objective

- Fix the placeholder handoff proof model so the repo can keep an always-active successor placeholder without letting `progress.md`, review guidance, or release verification misread completed-session evidence as current-session state.

## In Scope

- redefining the `progress.md` contract around current-session state vs completed-session proof
- placeholder-aware guidance updates in Tier 1 docs and repo-local skills
- execution-artifact validation updates in [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- handoff state updates in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md)

## Out Of Scope

- runtime, schema, auth, payment, payout, API, or UX behavior changes
- changing the always-active placeholder model itself
- creating parallel active specs

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/agent-playbooks/code_review.md`](../docs/agent-playbooks/code_review.md)
- [`../.agents/skills/execution-loop/SKILL.md`](../.agents/skills/execution-loop/SKILL.md)
- [`../.agents/skills/review-flow/SKILL.md`](../.agents/skills/review-flow/SKILL.md)
- [`../.agents/skills/release-verification/SKILL.md`](../.agents/skills/release-verification/SKILL.md)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)

## Stage Plan

1. Stage 1 — Rename the active placeholder in place and bootstrap spec/progress state for this remediation session.
2. Stage 2 — Separate current-session state from completed-session proof across `progress.md`, Tier 1 docs, and execution-loop guidance.
3. Stage 3 — Make docs audit, review, and release-verification placeholder-aware.
4. Stage 4 — Verify the new contract, dogfood the rollover model, then create the next numbered placeholder at handoff.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- [`../progress.md`](../progress.md) distinguishes the active spec from the last completed spec without stale current-session proof.
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs) enforces the new ledger contract and placeholder/completed-spec linkage.
- Review and release-verification guidance resolve the verified/reviewed spec correctly when a successor placeholder is active.
- Verification passes and a newer numbered placeholder exists before this spec is marked `Done`.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Placeholder-aware proof ownership shipped cleanly before spec 04 opened.

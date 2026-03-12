# 06_execution-ledger-hardening

## Objective

- Harden the execution ledger so Gate A / Gate B stoppages are explicitly terminalized as non-completions and cannot be misrepresented as finished work.

## In Scope

- execution-artifact contract changes for `progress.md`, `spec/00_overview.md`, and numbered specs
- audit validation for `Active`, `Done`, and `Superseded` session states
- repo-local guidance and playbook updates for placeholder rollover and closed-session resolution
- focused automated coverage for the execution-artifact audit
- handoff updates that backfill spec 04 honestly and leave a clean successor placeholder active

## Out Of Scope

- runtime product, payment, payout, API, schema, or UX behavior changes
- git-history inspection or chronology heuristics inside `docs:audit`
- removing the successor placeholder model

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../docs/agent-playbooks/code_review.md`](../docs/agent-playbooks/code_review.md)
- [`../.agents/skills/execution-loop/SKILL.md`](../.agents/skills/execution-loop/SKILL.md)
- [`../.agents/skills/review-flow/SKILL.md`](../.agents/skills/review-flow/SKILL.md)
- [`../.agents/skills/release-verification/SKILL.md`](../.agents/skills/release-verification/SKILL.md)
- [`../.agents/skills/docs-sync/SKILL.md`](../.agents/skills/docs-sync/SKILL.md)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- [`../scripts/docs/execution-artifact-audit.mjs`](../scripts/docs/execution-artifact-audit.mjs)

## Stage Plan

1. Stage 1 — rename the placeholder in place, add the `Final State` contract, and backfill the active registry/ledger for honest session status.
2. Stage 2 — update the audit engine plus Tier 1 guidance so `Superseded` is explicit and placeholder resolution uses `Last Session Spec`.
3. Stage 3 — add focused audit tests, run verification, and hand off with `07_session-placeholder` active.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- the overview registry supports `Active`, `Done`, and `Superseded` and matches each numbered spec’s terminal metadata
- `progress.md` distinguishes the most recent closed session from the most recent completed session through `Last Session Spec` and `Last Completed Spec`
- `docs:audit` fails when a spec’s `Final State` conflicts with the overview/progress ledger or when a placeholder lacks a valid terminal predecessor
- review, release-verification, execution-loop, and docs-sync guidance resolve the correct session proof under placeholder rollover
- verification passes and `07_session-placeholder` is active before this spec is marked `Done`

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Shipped explicit `Superseded` terminal metadata, `Last Session Spec` rollover semantics, focused audit coverage, and handed off to slot 07 cleanly.

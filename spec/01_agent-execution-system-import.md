# 01_agent-execution-system-import

## Objective

- Import DadPad’s reusable execution operating system into Gifta: numbered specs, `progress.md`, approval gates, proof-before-handoff discipline, harmonized agent docs, and audit enforcement.

## In Scope

- new execution artifacts under [`spec/`](./) plus [`../progress.md`](../progress.md)
- Tier 1 agent and onboarding docs
- repo-local skills under [`../.agents/skills/`](../.agents/skills/)
- docs governance tooling for the new execution artifacts and drift checks
- reclassification of [`../tasks/todo.md`](../tasks/todo.md) as historical residue

## Out Of Scope

- runtime product behavior
- API, DB schema, payment, payout, or auth logic changes
- adoption of DadPad’s product-specific Tauri/Xcode/iPad guidance

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../docs/agent-playbooks/code_review.md`](../docs/agent-playbooks/code_review.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- [`../scripts/docs/control-matrix.mjs`](../scripts/docs/control-matrix.mjs)

## Stage Plan

1. Stage 1 — Add `progress.md`, numbered-spec scaffolding, and the initial execution spec for this migration.
2. Stage 2 — Rewrite Tier 1 agent docs so the new execution model is the only current path for non-trivial work.
3. Stage 3 — Update repo-local skills and napkin guidance to align with the spec/progress system.
4. Stage 4 — Extend docs governance and audit checks for execution-artifact completeness and deprecated-tracker drift.
5. Stage 5 — Sync the control matrix and run verification gates.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- `progress.md`, `spec/00_overview.md`, and `spec/SPEC_TEMPLATE.md` exist and are current.
- Active Tier 1 agent docs no longer instruct agents to use `tasks/todo.md` as the live tracker.
- Repo-local skills route non-trivial work through the spec/progress system where applicable.
- `pnpm docs:audit` enforces the new execution artifacts and agent-guidance drift rules.
- Verification gates pass.

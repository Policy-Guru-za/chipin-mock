# 41_workflow-audit-hardening

## Objective

- Harden the workflow audit and companion docs so `Recently Closed Specs` is parsed correctly, newest closure proof is independently machine-checkable, and AGENTS-led napkin-first startup guidance stays consistent without reintroducing workflow bloat.

## In Scope

- Fixing `Recently Closed Specs` parsing and validation in [`../scripts/docs/execution-artifact-audit.mjs`](../scripts/docs/execution-artifact-audit.mjs) and [`../scripts/docs/execution-artifact-audit-helpers.mjs`](../scripts/docs/execution-artifact-audit-helpers.mjs).
- Adding overview-level closure-order metadata in [`./00_overview.md`](./00_overview.md) and the matching audit checks needed to prove newest terminal-spec ordering under parallel active specs.
- Updating companion workflow docs and guidance checks so [`../README.md`](../README.md), [`../docs/agent-playbooks/code_review.md`](../docs/agent-playbooks/code_review.md), and review-related agent guidance delegate to [`../AGENTS.md`](../AGENTS.md) while preserving napkin-first startup.
- Expanding the focused docs-audit and execution-artifact regression tests.
- Updating [`../progress.md`](../progress.md), [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md), and any directly coupled workflow artifacts needed for the new contract.

## Out Of Scope

- Reintroducing placeholder specs, single-active-spec rules, or heavier startup doc sweeps.
- Broad runtime or product-behavior changes outside the workflow/document-governance system.
- Rewriting historical/reference docs beyond the minimal schema or banner effects required by the audit hardening.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../README.md`](../README.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../docs/agent-playbooks/code_review.md`](../docs/agent-playbooks/code_review.md)
- [`../.agents/skills/review-flow/SKILL.md`](../.agents/skills/review-flow/SKILL.md)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- [`../scripts/docs/control-matrix.mjs`](../scripts/docs/control-matrix.mjs)
- [`../scripts/docs/execution-artifact-audit.mjs`](../scripts/docs/execution-artifact-audit.mjs)
- [`../scripts/docs/execution-artifact-audit-helpers.mjs`](../scripts/docs/execution-artifact-audit-helpers.mjs)
- [`../tests/unit/docs-audit.test.ts`](../tests/unit/docs-audit.test.ts)
- [`../tests/unit/execution-artifact-audit.test.ts`](../tests/unit/execution-artifact-audit.test.ts)

## Stage Plan

1. Stage 1 — Replace the brittle `Recently Closed Specs` parsing with a structured primary-entry parser and add overview-level closure-order metadata that works with parallel active specs.
2. Stage 2 — Restore AGENTS + napkin-first delegation in README/review guidance and align docs-audit checks so companion docs stay lean instead of duplicating workflow prose.
3. Stage 3 — Expand regression coverage, run the full verification gate, dogfood a fast-path plus full-path closure scenario, and close the spec cleanly.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Workflow dogfood proving: (a) successor references inside `Recently Closed Specs` do not misclassify active specs, (b) the newest terminal spec is derived from overview closure metadata instead of list order alone, and (c) README/review entrypoints preserve AGENTS + napkin-first startup without restoring heavy duplicate workflow text.

## Exit Criteria

- `Recently Closed Specs` supports explanatory successor references without false positives.
- The audit can independently determine the newest terminal spec under the parallel-active-spec model and fail when `progress.md` omits it.
- README and review guidance stay lean but no longer contradict AGENTS’ napkin-first startup contract.
- Fast path, parallel active specs, and the no-placeholder workflow remain intact and covered by regression tests.
- Verification is green and handoff evidence records the workflow dogfood plus any durable napkin learning.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Hardened Recently Closed parsing, added overview-level Closed At ordering for slot 40+ terminal specs, restored napkin-first delegation in lean companion docs, expanded regression coverage, and verified the workflow contract with docs audit sync, lint, typecheck, and the full test suite.

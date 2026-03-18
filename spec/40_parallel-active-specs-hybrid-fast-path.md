# 40_parallel-active-specs-hybrid-fast-path

## Objective

- Refactor the repo execution system so Gifta can run multiple active full-path specs in parallel, keep a true fast path for small tasks, and reduce startup overhead around duplicated workflow docs while preserving AGENTS-led guidance, auditability, verification, and dogfood proof.

## In Scope

- Updating the current workflow contract in [`../AGENTS.md`](../AGENTS.md), [`../workflow-orchestration.md`](../workflow-orchestration.md), [`../README.md`](../README.md), and the relevant repo skill docs so AGENTS stays the central operational document and duplicate read-order guidance is reduced.
- Redesigning the execution artifacts in [`../progress.md`](../progress.md), [`./00_overview.md`](./00_overview.md), and [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md) to support multiple active full-path specs plus a fast-path quick-task lane.
- Replacing the old successor-placeholder invariant with on-demand spec numbering for new full-path work.
- Updating docs governance and validation in [`../scripts/docs/execution-artifact-audit.mjs`](../scripts/docs/execution-artifact-audit.mjs), [`../scripts/docs/execution-artifact-audit-helpers.mjs`](../scripts/docs/execution-artifact-audit-helpers.mjs), [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs), and [`../scripts/docs/control-matrix.mjs`](../scripts/docs/control-matrix.mjs) so the new model is machine-checkable.
- Updating the focused regression tests for docs/execution-audit behavior and syncing the control matrix.

## Out Of Scope

- Changing product runtime behavior outside the workflow/document-governance system itself.
- Rewriting platform/product reference docs like [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md) beyond any minimal pointer changes required by the execution-system refactor.
- Removing AGENTS or the napkin system.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../README.md`](../README.md)
- [`../TESTING.md`](../TESTING.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/agent-playbooks/code_review.md`](../docs/agent-playbooks/code_review.md)
- [`../docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`](../docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md)
- [`../docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md`](../docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md)
- [`../.agents/skills/napkin/SKILL.md`](../.agents/skills/napkin/SKILL.md)
- [`../.agents/skills/execution-loop/SKILL.md`](../.agents/skills/execution-loop/SKILL.md)
- [`../.agents/skills/docs-sync/SKILL.md`](../.agents/skills/docs-sync/SKILL.md)
- [`../.agents/skills/review-flow/SKILL.md`](../.agents/skills/review-flow/SKILL.md)
- [`../.agents/skills/release-verification/SKILL.md`](../.agents/skills/release-verification/SKILL.md)
- [`../.agents/skills/payments-webhooks-debug/SKILL.md`](../.agents/skills/payments-webhooks-debug/SKILL.md)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- [`../scripts/docs/control-matrix.mjs`](../scripts/docs/control-matrix.mjs)
- [`../scripts/docs/execution-artifact-audit.mjs`](../scripts/docs/execution-artifact-audit.mjs)
- [`../scripts/docs/execution-artifact-audit-helpers.mjs`](../scripts/docs/execution-artifact-audit-helpers.mjs)
- [`../tests/unit/docs-audit.test.ts`](../tests/unit/docs-audit.test.ts)
- [`../tests/unit/execution-artifact-audit.test.ts`](../tests/unit/execution-artifact-audit.test.ts)

## Stage Plan

1. Stage 1 — Rewrite the core workflow contract so AGENTS is the lean canonical entrypoint, the placeholder requirement is removed, and the fast-path vs full-path rules are explicit.
2. Stage 2 — Redesign `progress.md`, `spec/00_overview.md`, and the spec template for parallel active specs plus quick tasks, then align the repo skill docs to the new contract.
3. Stage 3 — Update docs-audit/control-matrix enforcement and regression tests to validate the new model, then run the full gate and dogfood the workflow by simulating concurrent active specs and a fast-path task.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Workflow dogfood proving: (a) two active full-path specs can coexist in the docs model, (b) a fast-path task can exist without a numbered spec, and (c) a completed spec can close without a mandatory successor placeholder.

## Exit Criteria

- AGENTS is the central lean workflow document and duplicate operational guidance is reduced to pointers or task-specific deltas.
- The execution system supports multiple active numbered specs in parallel without requiring older active specs to close first.
- The fast path remains available for small low-risk tasks without forcing a numbered spec.
- `progress.md`, `spec/00_overview.md`, the spec template, and docs-audit enforcement all align on the new model.
- The verification gate is green and workflow dogfood proves the new model end to end.
- Session closeout records the napkin outcome and hands off cleanly under the new no-placeholder requirement.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Replaced the placeholder-era workflow with parallel active specs plus quick tasks, aligned docs governance/audit enforcement to the new model, and verified the end-to-end contract with docs audit sync, lint, typecheck, and the full test suite.

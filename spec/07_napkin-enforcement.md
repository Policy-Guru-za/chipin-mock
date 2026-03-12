# 07_napkin-enforcement

## Objective

- Enforce napkin startup and handoff proof so every Gifta session reads the napkin first and closes with explicit napkin evidence.

## In Scope

- repo-local `napkin` skill registration under [`.agents/skills/`](../.agents/skills/)
- AGENTS, workflow, and repo-skill bootstrap updates so napkin is read first
- execution-ledger contract changes that require `## Napkin Evidence` in [`../progress.md`](../progress.md)
- audit enforcement plus focused regression coverage for missing or weak napkin evidence
- dogfood updates to [`../docs/napkin/napkin.md`](../docs/napkin/napkin.md) and session handoff artifacts

## Out Of Scope

- product runtime, API, payment, payout, or schema behavior changes
- replacing the numbered-spec / placeholder execution model
- speculative automation outside the existing repo docs/audit path

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../docs/napkin/SKILL.md`](../docs/napkin/SKILL.md)
- [`../docs/napkin/napkin.md`](../docs/napkin/napkin.md)
- [`../.agents/skills/execution-loop/SKILL.md`](../.agents/skills/execution-loop/SKILL.md)
- [`../.agents/skills/docs-sync/SKILL.md`](../.agents/skills/docs-sync/SKILL.md)
- [`../.agents/skills/review-flow/SKILL.md`](../.agents/skills/review-flow/SKILL.md)
- [`../.agents/skills/release-verification/SKILL.md`](../.agents/skills/release-verification/SKILL.md)
- [`../.agents/skills/payments-webhooks-debug/SKILL.md`](../.agents/skills/payments-webhooks-debug/SKILL.md)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- [`../scripts/docs/control-matrix.mjs`](../scripts/docs/control-matrix.mjs)
- [`../scripts/docs/execution-artifact-audit.mjs`](../scripts/docs/execution-artifact-audit.mjs)
- [`../scripts/docs/execution-artifact-audit-helpers.mjs`](../scripts/docs/execution-artifact-audit-helpers.mjs)
- [`../tests/unit/execution-artifact-audit.test.ts`](../tests/unit/execution-artifact-audit.test.ts)

## Stage Plan

1. Stage 1 — register a real repo-local `napkin` skill and align AGENTS / workflow / repo skills so napkin is always in the startup path.
2. Stage 2 — add `Napkin Evidence` to the execution ledger contract and enforce it in the audit/test path.
3. Stage 3 — dogfood the napkin flow, verify the full gate, and hand off with `08_session-placeholder` active.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- repo-local skills and top-level agent docs all route session startup through the napkin skill plus [`../docs/napkin/napkin.md`](../docs/napkin/napkin.md)
- [`../progress.md`](../progress.md) includes `## Napkin Evidence`, and the execution audit fails when that proof is missing or vague
- the current session dogfoods the contract by updating the napkin and closing with explicit napkin evidence
- verification passes and `08_session-placeholder.md` is active before this spec is marked `Done`

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Registered a repo-local napkin skill, threaded it through repo startup docs/skills, enforced `Napkin Evidence`, and dogfooded the new handoff proof in this session.

# 19_control-matrix-gap-remediation

## Objective

- Eliminate the docs-audit control-matrix gap by excluding transient markdown from governance scope, codifying `CLAUDE.md` retirement in favor of `AGENTS.md`, and making unsupported markdown failures explicit and testable.

## In Scope

- `scripts/docs/audit.mjs`
- `scripts/docs/control-matrix.mjs`
- Shared docs-audit policy helpers under `scripts/docs/`
- Focused docs-audit regression coverage under `tests/unit/`
- Regenerated `docs/DOCUMENT_CONTROL_MATRIX.md`
- Execution-artifact updates for this session

## Out Of Scope

- Reclassifying transient prototype/import folders under `tmp/` or `.reference/` as governed Tier 1 or Tier 2 documentation
- Product runtime behavior outside the docs-governance tooling
- Nav, auth, homepage, or payment-flow changes

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/napkin/napkin.md`](../docs/napkin/napkin.md)

## Stage Plan

1. Stage 1 — Separate governed documentation from transient workspace markdown by excluding `tmp/` and `.reference/` from docs-audit crawl scope and centralizing that policy.
2. Stage 2 — Refactor docs audit to surface explicit policy errors for retired or unsupported markdown (`CLAUDE.md`, future unclassified files) instead of throwing at the first unknown file.
3. Stage 3 — Add focused regression coverage, sync the control matrix, run the verification gate, and hand off into `20_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- `tmp/**` and `.reference/**` markdown files no longer participate in docs governance audit.
- A reintroduced root `CLAUDE.md` fails with an explicit retirement message pointing maintainers to `AGENTS.md`.
- Unsupported markdown files inside governed docs scope fail with actionable errors instead of an early throw.
- Focused regression tests cover docs-audit scope exclusion plus retired/unsupported markdown handling.
- `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green after sync.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Excluded transient workspace markdown from docs governance, codified explicit `CLAUDE.md` retirement toward `AGENTS.md`, added focused docs-audit regression coverage, regenerated the control matrix, and verified with docs audit plus the full repo gate.

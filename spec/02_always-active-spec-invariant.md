# 02_always-active-spec-invariant

## Objective

- Enforce a repo invariant that every work session has exactly one active numbered spec and that [`progress.md`](../progress.md) always points at it.

## In Scope

- execution-artifact validation in [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)
- spec/progress bootstrap for the always-active model
- current operational docs and repo-local skill guidance for session rollover

## Out Of Scope

- runtime product behavior
- payment, payout, auth, schema, or API changes
- changes to preserved historical evidence outside required registry references

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../scripts/docs/control-matrix.mjs`](../scripts/docs/control-matrix.mjs)
- [`../scripts/docs/audit.mjs`](../scripts/docs/audit.mjs)

## Stage Plan

1. Stage 1 — Define the always-active spec contract and bootstrap the next numbered session spec.
2. Stage 2 — Tighten audit validation so the current spec must match the single `Active` overview row.
3. Stage 3 — Rewrite current execution-system docs and skills around every-session specs plus placeholder rollover.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- [`../progress.md`](../progress.md) points at the single active numbered spec.
- [`./00_overview.md`](./00_overview.md) uses only `Active` and `Done` statuses and contains exactly one `Active` row.
- `pnpm docs:audit` fails when `## Current Spec` is empty or points at a `Done` spec.
- Current operational docs and repo-local skills describe the always-active spec and placeholder rollover rule.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Locked the always-active invariant and handed the next refinement to spec 03.

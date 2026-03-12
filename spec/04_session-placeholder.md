# 04_session-placeholder

## Objective

- Hold the active spec slot between sessions so the repo always has one current numbered spec.

## In Scope

- renaming this file in place to `spec/04_<topic>.md` when the next session starts
- updating [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md) to the concrete session topic
- recording the next session's scope, gates, and handoff evidence under this same spec number

## Out Of Scope

- runtime, schema, auth, payment, payout, or UX changes until this placeholder is renamed to the next session topic
- creating parallel active specs

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)

## Stage Plan

1. Stage 1 — Rename this file in place to `spec/04_<topic>.md` before substantive work begins.
2. Stage 2 — Replace the placeholder scope, dependencies, gates, and exit criteria with the concrete session plan.
3. Stage 3 — Complete that session, mark it `Done`, and create the next numbered placeholder at handoff.

## Test Gate

- Update this section to the concrete next session before claiming any work complete.

## Exit Criteria

- This placeholder has been renamed in place to the next concrete session topic.
- [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md) point at that renamed active spec during the session.
- A newer numbered placeholder exists before this spec is marked `Done`.

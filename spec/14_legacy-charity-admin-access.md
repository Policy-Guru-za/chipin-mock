# 14_legacy-charity-admin-access

## Objective

- Restore direct admin access to the charity-management surface for legacy reconciliation work while keeping charity hidden from the active admin navigation.

## In Scope

- remove the `/admin/charities` hard redirect added by charity product disablement
- keep the active admin navigation behavior unchanged
- add regression coverage proving direct route access still works when the charity product capability is off
- sync execution artifacts for this bounded fix

## Out Of Scope

- broader charity product re-enablement
- public Dreamboard/API charity behavior changes
- admin navigation reintroduction of charity management

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/components/admin/AdminSidebar.tsx`](../src/components/admin/AdminSidebar.tsx)

## Stage Plan

1. Stage 1 — restore direct `/admin/charities` access while keeping charity hidden from the sidebar when the product capability is off.
2. Stage 2 — add a regression test for the direct-access path under product-off mode.
3. Stage 3 — run the smallest relevant gate, then hand off into `15_session-placeholder`.

## Test Gate

- focused admin route regression coverage
- final gate for this fix: `pnpm test`
- handoff gate: `pnpm docs:audit -- --sync`, `pnpm docs:audit`

## Exit Criteria

- `/admin/charities` remains directly reachable for admins when the charity product capability is off
- charity management remains absent from the active admin navigation when the capability is off
- regression coverage protects the direct-access behavior
- execution artifacts hand off with `15_session-placeholder` active

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed the charity-management hard redirect, preserved the nav hide behavior, added direct-access regression coverage, and handed off into `15_session-placeholder`.

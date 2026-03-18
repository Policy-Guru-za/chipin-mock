# Spec Template

Use this template for any numbered **full-path** task.

Create a new numbered spec on demand by using the next available slot in `spec/`.

Use the fast path in [`../AGENTS.md`](../AGENTS.md) when the task is small enough to stay out of a numbered spec.

## Objective

- State the exact outcome the stage sequence is meant to achieve.

## In Scope

- List the behavior, docs, tests, and artifacts this spec is allowed to change.

## Out Of Scope

- List what must not change during this spec.

## Dependencies

- List required docs, runtime surfaces, env assumptions, or upstream blockers.

## Stage Plan

1. Stage 1 — Define the first bounded slice.
2. Stage 2 — Define the second bounded slice.
3. Stage 3 — Define the remaining bounded slices.

## Test Gate

- List the smallest useful commands or manual checks required to prove this spec.

## Exit Criteria

- Define the conditions that must be true before the spec can be marked done.
- Include how dogfood and napkin handling will be proven in [`../progress.md`](../progress.md) when the spec closes.

## Final State

- Status: Active | Done | Superseded
- Exit Criteria State: pending | satisfied | not-satisfied
- Successor Slot: none | NN
- Notes: <specific summary>

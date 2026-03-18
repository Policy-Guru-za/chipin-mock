# Workflow Orchestration

> AGENTS is the canonical workflow document.
> This file is a companion reference that summarizes artifact responsibilities under the current model.

## Core Principle

Use the lightest lane that still preserves correctness:
- **Fast path** for small, low-risk work tracked in [`progress.md`](./progress.md) under `## Quick Tasks`
- **Full path** for larger or riskier work tracked by numbered specs plus [`progress.md`](./progress.md)

## Artifact Responsibilities

### `AGENTS.md`
- canonical workflow rules
- startup order
- fast path vs full path thresholds
- verification and handoff requirements

### `progress.md`
- active full specs dashboard
- quick-task dashboard
- recently closed specs
- latest completed proof (`Last Completed Spec`, green commands, dogfood, napkin evidence)

### `spec/00_overview.md`
- registry of numbered full-path specs
- terminal closure-order metadata (`Closed At`) for newest-proof checks
- may contain multiple `Active` rows
- no placeholder row is required

### `spec/NN_<topic>.md`
- full-path plan and execution record for one numbered task
- multiple numbered specs may be active in parallel

## Operating Loop

1. Read napkin, then [`AGENTS.md`](./AGENTS.md), then [`progress.md`](./progress.md)
2. Choose the correct lane
3. For fast path, add or update a quick-task row and start work
4. For full path, allocate the next numbered spec, add it to [`spec/00_overview.md`](./spec/00_overview.md), add it to `## Active Full Specs`, then start work
5. Verify with the smallest useful gate
6. Dogfood the changed flow
7. Close the task by updating the relevant dashboard/proof sections; do not create a placeholder

## Definition Of Done

- relevant gate is green
- dogfood is complete or clearly blocked with explicit evidence
- [`progress.md`](./progress.md) accurately reflects active work and latest completed proof
- the relevant numbered spec is `Done` or `Superseded` when the work used the full path
- `## Napkin Evidence` records the most recent durable workflow learning or explicit `No durable napkin update.`

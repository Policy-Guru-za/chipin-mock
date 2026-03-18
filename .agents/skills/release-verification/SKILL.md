---
name: release-verification
description: |
  Use for pre-handoff, pre-release, or post-change verification when the goal
  is to prove the repo is in a safe, reviewable, and well-documented state.
author: Codex
version: 2.0.0
date: 2026-03-18
---

# Release Verification

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. [`../../../README.md`](../../../README.md)
6. [`../../../TESTING.md`](../../../TESTING.md)
7. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
8. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
9. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)

## Use This Skill When

- the user asks for final verification before handoff
- a phase, spec, or milestone is complete and needs quality confirmation
- docs, generated artifacts, and code gates all need a final consistency pass

## Workflow

1. Capture current repo state with `git status --short`.
2. Resolve the verification target from explicit user scope, active spec rows, or the latest completed proof.
3. Check the current progress/spec/napkin evidence before running gates.
4. Run the standard gate chain.
5. Confirm the target’s `Test Gate` and `Exit Criteria` are satisfied when it is `Done`, or explicitly not satisfied plus successor linkage when it is `Superseded`.
6. Confirm generated artifacts, Tier 1 docs, and `Napkin Evidence` are in sync with the current change set.
7. Report exact results, blocks, and residual risks.

## Standard Gate Chain

```bash
pnpm docs:audit
pnpm lint
pnpm typecheck
pnpm test
```

Add these when relevant:

```bash
pnpm docs:audit -- --sync
pnpm openapi:generate
```

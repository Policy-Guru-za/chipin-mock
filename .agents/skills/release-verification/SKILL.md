---
name: release-verification
description: |
  Use for pre-handoff, pre-release, or post-change verification when the goal
  is to prove the repo is in a safe, reviewable, and well-documented state.
author: Codex
version: 1.0.0
date: 2026-03-12
---

# Release Verification

## Read First

1. [`../../../AGENTS.md`](../../../AGENTS.md)
2. [`../../../README.md`](../../../README.md)
3. [`../../../TESTING.md`](../../../TESTING.md)
4. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
5. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
6. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)

## Use This Skill When

- the user asks for final verification before handoff
- a phase or milestone is complete and needs quality confirmation
- docs, generated artifacts, and code gates all need a final consistency pass

## Workflow

1. Capture current repo state with `git status --short`.
2. Run the standard gate chain.
3. Confirm generated artifacts and Tier 1 docs are in sync with the current change set.
4. Report exact results, blocks, and residual risks.
5. If something cannot be verified, say what evidence is missing.

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

## Output

- current gate results
- changed/generated artifact status
- remaining risks or manual follow-ups
- explicit note of anything not verified

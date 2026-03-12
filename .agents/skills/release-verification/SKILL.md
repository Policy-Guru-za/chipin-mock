---
name: release-verification
description: |
  Use for pre-handoff, pre-release, or post-change verification when the goal
  is to prove the repo is in a safe, reviewable, and well-documented state.
author: Codex
version: 1.2.0
date: 2026-03-12
---

# Release Verification

## Read First

1. [`../../../AGENTS.md`](../../../AGENTS.md)
2. [`../../../progress.md`](../../../progress.md)
3. [`../../../spec/00_overview.md`](../../../spec/00_overview.md)
4. resolve the verification target spec from [`../../../progress.md`](../../../progress.md): use `Current Spec` unless it is `NN_session-placeholder`, then use `Last Completed Spec`
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
2. Resolve the verification target spec: use `Current Spec` unless it is `NN_session-placeholder`, then use `Last Completed Spec` and keep the placeholder only for successor-state checks.
3. Check current progress/spec evidence before running gates.
4. Run the standard gate chain.
5. Confirm the resolved verification target spec’s `Test Gate` and `Exit Criteria` are satisfied.
6. If the resolved target is `Done`, confirm the finished session is not being closed before the next numbered placeholder is active as the single `Active` spec.
7. Confirm generated artifacts and Tier 1 docs are in sync with the current change set.
8. Report exact results, blocks, and residual risks, naming both the verified spec and the active placeholder when they differ.
9. If something cannot be verified, say what evidence is missing.

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

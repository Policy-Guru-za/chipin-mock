---
name: review-flow
description: |
  Use when the user asks for a review, audit, critique, or assessment of code,
  docs, or recent changes in this repo. Routes the agent through the canonical
  repo review contract and enforces findings-first output.
author: Codex
version: 1.2.0
date: 2026-03-12
---

# Review Flow

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. [`../../../spec/00_overview.md`](../../../spec/00_overview.md)
6. resolve the review target spec from [`../../../progress.md`](../../../progress.md): use `Current Spec` unless it is `NN_session-placeholder`, then use `Last Session Spec`
7. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
8. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
9. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
10. [`../../../TESTING.md`](../../../TESTING.md)
11. [`../../../docs/agent-playbooks/code_review.md`](../../../docs/agent-playbooks/code_review.md)

## Use This Skill When

- the user says `review`, `audit`, `assess`, `critique`, or asks for an independent second opinion
- the task is to inspect recent work, changed files, or repo health rather than implement changes

## Workflow

1. Inspect `git status --short` and the relevant diff or files first.
2. Read the current subsystem docs that match the review scope, including current-reference docs when they are the active subsystem references; only use historical or reference-only material for provenance.
3. Resolve the review target spec: use `Current Spec` unless it is `NN_session-placeholder`, then use `Last Session Spec` and keep the placeholder only for rollover-state checks.
4. Check whether the current session has active spec/progress/napkin coverage; missing proof is itself a finding.
5. Treat a successor `NN_session-placeholder` as valid only when `Last Session Spec` cleanly owns the most recent closed session and `Last Completed Spec` still owns the latest `Done` proof; otherwise report operational drift.
6. Follow the severity model and output structure in [`code_review.md`](../../../docs/agent-playbooks/code_review.md).
7. Findings first, ordered by severity, with file references.
8. Only include a short change summary after findings and open questions.

## Verification

- Run the smallest useful checks for the review scope.
- Use the standard gate set when the review is broad or release-relevant:

```bash
pnpm docs:audit
pnpm lint
pnpm typecheck
pnpm test
```

- If you do not run a check, say why.

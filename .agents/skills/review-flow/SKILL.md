---
name: review-flow
description: |
  Use when the user asks for a review, audit, critique, or assessment of code,
  docs, or recent changes in this repo. Routes the agent through the canonical
  repo review contract and enforces findings-first output.
author: Codex
version: 1.0.0
date: 2026-03-12
---

# Review Flow

## Read First

1. [`../../../AGENTS.md`](../../../AGENTS.md)
2. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
3. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
4. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
5. [`../../../TESTING.md`](../../../TESTING.md)
6. [`../../../docs/agent-playbooks/code_review.md`](../../../docs/agent-playbooks/code_review.md)

## Use This Skill When

- the user says `review`, `audit`, `assess`, `critique`, or asks for an independent second opinion
- the task is to inspect recent work, changed files, or repo health rather than implement changes

## Workflow

1. Inspect `git status --short` and the relevant diff or files first.
2. Read the current subsystem docs that match the review scope, including current-reference docs when they are the active subsystem references; only use historical or reference-only material for provenance.
3. Follow the severity model and output structure in [`code_review.md`](../../../docs/agent-playbooks/code_review.md).
4. Findings first, ordered by severity, with file references.
5. Only include a short change summary after findings and open questions.

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

---
name: review-flow
description: |
  Use when the user asks for a review, audit, critique, or assessment of code,
  docs, or recent changes in this repo. Routes the agent through the canonical
  repo review contract and enforces findings-first output.
author: Codex
version: 2.0.0
date: 2026-03-18
---

# Review Flow

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
6. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
7. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
8. [`../../../TESTING.md`](../../../TESTING.md)
9. [`../../../docs/agent-playbooks/code_review.md`](../../../docs/agent-playbooks/code_review.md)

## Use This Skill When

- the user says `review`, `audit`, `assess`, `critique`, or asks for an independent second opinion
- the task is to inspect recent work, changed files, or repo health rather than implement changes

## Workflow

1. Inspect `git status --short` and the relevant diff or files first.
2. Resolve the review target using the playbook rules: explicit user scope first, then matching active spec rows, then recently closed/full completed proof.
3. Read only the current subsystem docs that match the review scope.
4. Check whether the current session has progress/napkin/spec coverage where the workflow requires it; missing proof is itself a finding.
5. Follow the severity model and output structure in [`../../../docs/agent-playbooks/code_review.md`](../../../docs/agent-playbooks/code_review.md).
6. Findings first, ordered by severity, with file references.

## Verification

```bash
pnpm docs:audit
pnpm lint
pnpm typecheck
pnpm test
```

- If you do not run a check, say why.

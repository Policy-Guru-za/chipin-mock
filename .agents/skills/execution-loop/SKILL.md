---
name: execution-loop
description: |
  Use for Gifta work sessions that change or verify repo artifacts. Enforces
  the repo's execution system: fast path, numbered full-path specs,
  verification, dogfooding, and handoff evidence.
author: Codex
version: 2.0.0
date: 2026-03-18
---

# Execution Loop

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. if you are continuing a numbered full-path task, read that spec
6. if document authority is unclear, read [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)

## Use This Skill When

- the session changes or verifies repo artifacts
- work spans multiple files or stages
- the session changes behavior, policy, contracts, auth, security, payments, payouts, schema, UX, or agent operations
- the session needs explicit gates, dogfooding, or handoff evidence

## Workflow

1. Read napkin first, then AGENTS, then progress.
2. Choose the lane:
   - fast path for small low-risk work tracked in `## Quick Tasks`
   - full path for larger or riskier work tracked in numbered specs plus `## Active Full Specs`
3. For a new full-path task, create the next numbered spec immediately; do not wait for another active spec to close.
4. Add or update the relevant row in [`../../../progress.md`](../../../progress.md).
5. Implement one bounded slice at a time.
6. Run the smallest gate that proves the slice.
7. Debug until green.
8. Dogfood the changed flow.
9. Close the task by updating the progress dashboard and, when relevant, the numbered spec final state.

## Rules

- Multiple numbered specs may be Active at the same time.
- No placeholder spec is required.
- No completed slice while a required gate is red.
- Do not use ad hoc trackers for work sessions; keep the progress dashboard and numbered specs current.
- If a blocker remains, report the failing command, exact error, current hypothesis, and missing dependency.

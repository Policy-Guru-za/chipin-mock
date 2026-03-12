---
name: execution-loop
description: |
  Use for Gifta work sessions that change or verify repo artifacts. Enforces
  the repo's execution system:
  numbered specs, `progress.md`, bounded stages, gates, dogfooding, and
  handoff evidence.
author: Codex
version: 1.1.0
date: 2026-03-12
---

# Execution Loop

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../workflow-orchestration.md`](../../../workflow-orchestration.md)
5. [`../../../progress.md`](../../../progress.md)
6. [`../../../spec/00_overview.md`](../../../spec/00_overview.md)
7. the active numbered spec in [`../../../spec/`](../../../spec/) or [`../../../spec/SPEC_TEMPLATE.md`](../../../spec/SPEC_TEMPLATE.md) if the active placeholder needs to be renamed for this session
8. if `Current Spec` is already a successor placeholder, use `Last Session Spec` in [`../../../progress.md`](../../../progress.md) for the most recently closed session and `Last Completed Spec` for the most recently completed proof

## Use This Skill When

- the session changes or verifies repo artifacts
- work spans multiple files or stages
- the session changes behavior, policy, contracts, auth, security, payments, payouts, schema, UX, or agent operations
- the session needs explicit gates, dogfooding, or handoff evidence

## Workflow

1. Confirm the active numbered spec for the session.
2. If it is `NN_session-placeholder`, rename that same numbered file in place to `NN_<topic>` before substantive work starts.
3. Update [`../../../spec/00_overview.md`](../../../spec/00_overview.md).
4. Update [`../../../progress.md`](../../../progress.md) before coding.
5. Implement one bounded stage at a time.
6. Run the smallest gate that proves the stage.
7. Debug until green.
8. Dogfood the changed flow.
9. Record active-session `Current Stage`, `Status`, `Blockers`, and `Next Step` in [`../../../progress.md`](../../../progress.md).
10. Mark the finished session spec `Done` or `Superseded`, create the next numbered placeholder, and update [`../../../progress.md`](../../../progress.md) so `Current Spec` points at that active placeholder while `Last Session Spec` points at the closed session, `Napkin Evidence` records either a linked napkin update or explicit `No durable napkin update.`, and `Last Completed Spec`, `Last Green Commands`, and `Dogfood Evidence` stay attributed to the latest `Done` session.

## Rules

- One active spec at a time unless the user says otherwise.
- No completed stage while a required gate is red.
- Do not use ad hoc trackers for work sessions; keep the active spec and [`../../../progress.md`](../../../progress.md) current instead.
- Do not close a session until the next numbered placeholder is active, `Last Session Spec` identifies the most recently closed session, `Napkin Evidence` records that session's napkin outcome, and proof sections in [`../../../progress.md`](../../../progress.md) are attributed through `Last Completed Spec` only when that closed session is `Done`.
- If a blocker remains, report the failing command, exact error, current hypothesis, and missing dependency.

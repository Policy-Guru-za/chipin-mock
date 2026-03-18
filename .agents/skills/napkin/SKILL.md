---
name: napkin
description: |
  Maintain a per-repo napkin file that tracks mistakes, corrections, and
  what works. Read it before any repo work and close tasks with explicit
  napkin evidence in `progress.md`.
author: Codex
version: 6.0.0
date: 2026-03-18
---

# Napkin

## Read First

1. [`../../../docs/napkin/SKILL.md`](../../../docs/napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)

## Workflow

1. Read [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md) before any other repo work in the session.
2. Apply the napkin silently unless the user explicitly asks for proof that you read it.
3. Update [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md) whenever you learn a durable correction, preference, failure pattern, or winning pattern.
4. Before handoff, update [`../../../progress.md`](../../../progress.md) `## Napkin Evidence` for the most recently closed full-path spec or completed quick task outcome.
5. `## Napkin Evidence` must either link [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md) or say `No durable napkin update.` exactly.
6. Do not use the napkin as a progress tracker; active work state lives in the progress dashboard and numbered specs.

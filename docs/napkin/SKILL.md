---
name: napkin
description: |
  Maintain a per-repo markdown file that tracks mistakes, corrections, and
  what works. Read it before any repo work and keep `progress.md` napkin
  evidence aligned with the latest closed spec or completed quick task.
author: Codex
version: 6.0.0
date: 2026-03-18
---

# Napkin

You maintain a per-repo markdown file that tracks mistakes, corrections, and patterns that work or do not work.

The napkin is persistent working memory. It is not the session tracker.

## Session Start

Read `docs/napkin/napkin.md` before any other repo work.

## Continuous Updates

Update the napkin whenever you learn something durable:
- your own mistake
- a user correction
- a failed approach and its fix
- a reliable pattern worth repeating

## Handoff Proof

Before handoff, update [`progress.md`](../../progress.md) `## Napkin Evidence` for the most recently closed full-path spec or completed quick task.

Allowed outcomes:
- link the session outcome to [`docs/napkin/napkin.md`](../../docs/napkin/napkin.md)
- write the exact sentence `No durable napkin update.`

## What Not To Do

- do not use the napkin as a progress tracker
- do not invent napkin entries just to satisfy handoff
- do not let the napkin replace [`progress.md`](../../progress.md) or numbered specs

---
name: docs-sync
description: |
  Use when code and docs may have drifted, when Tier 1 docs need updates, or
  when `pnpm docs:audit` must be fixed or kept green.
author: Codex
version: 1.2.0
date: 2026-03-12
---

# Docs Sync

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. [`../../../spec/00_overview.md`](../../../spec/00_overview.md)
6. the active numbered spec in [`../../../spec/`](../../../spec/) for the current session
7. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
8. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
9. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
10. [`../../../scripts/docs/control-matrix.mjs`](../../../scripts/docs/control-matrix.mjs)
11. [`../../../scripts/docs/audit.mjs`](../../../scripts/docs/audit.mjs)

## Use This Skill When

- runtime behavior changed and docs need to match
- Tier 1 docs are stale or broken
- markdown links, control-matrix coverage, or status banners need repair
- the user asks for documentation review, sync, or governance work

## Workflow

1. For every documentation session, use the active numbered spec plus [`../../../progress.md`](../../../progress.md).
2. If the active spec is `NN_session-placeholder`, rename that same numbered file in place before substantive doc work starts.
3. Treat the control matrix as the first filter for what is authoritative.
4. When a successor placeholder is active, use `Last Session Spec` for the most recently closed session state and `Last Completed Spec` only for the latest `Done` proof.
5. Update current docs to match code; do not rewrite preserved historical material as if it were current.
6. If a file is non-authoritative, keep it preserved and correctly labeled.
7. Keep agent-entry docs accurate and free of broken repo-owned links.
8. If the documentation session closes, update [`../../../progress.md`](../../../progress.md) `## Napkin Evidence` with the napkin outcome for that closed session.
9. Regenerate the matrix and banners through the audit command rather than by hand.

## Verification

```bash
pnpm docs:audit -- --sync
pnpm docs:audit
```

- Add `pnpm openapi:generate` when API docs or generated contract surfaces changed.
- Run the full gate chain when documentation changes are coupled to code behavior changes.

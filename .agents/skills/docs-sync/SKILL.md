---
name: docs-sync
description: |
  Use when code and docs may have drifted, when Tier 1 docs need updates, or
  when `pnpm docs:audit` must be fixed or kept green.
author: Codex
version: 2.0.0
date: 2026-03-18
---

# Docs Sync

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. the relevant numbered spec if the docs change belongs to a full-path task
6. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
7. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
8. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
9. [`../../../scripts/docs/control-matrix.mjs`](../../../scripts/docs/control-matrix.mjs)
10. [`../../../scripts/docs/audit.mjs`](../../../scripts/docs/audit.mjs)

## Use This Skill When

- runtime behavior changed and docs need to match
- Tier 1 docs are stale or broken
- markdown links, control-matrix coverage, or status banners need repair
- the user asks for documentation review, sync, or governance work

## Workflow

1. Treat AGENTS as the canonical workflow doc.
2. Keep the relevant full-path spec row or quick-task row current in [`../../../progress.md`](../../../progress.md).
3. Use the control matrix as the first filter for what is authoritative.
4. Update current docs to match code; do not rewrite preserved historical material as if it were current.
5. Keep duplicate workflow docs as pointers or task-specific companions, not parallel authorities.
6. Regenerate the matrix and governance output through the audit command rather than by hand.
7. If the docs task closes a numbered spec or completed quick task, update `## Napkin Evidence` accordingly.

## Verification

```bash
pnpm docs:audit -- --sync
pnpm docs:audit
```

- Add `pnpm openapi:generate` when API docs or generated contract surfaces changed.
- Run the full gate chain when documentation changes are coupled to code behavior changes.

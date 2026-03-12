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

1. [`../../../AGENTS.md`](../../../AGENTS.md)
2. [`../../../progress.md`](../../../progress.md)
3. [`../../../spec/00_overview.md`](../../../spec/00_overview.md)
4. the active numbered spec in [`../../../spec/`](../../../spec/) for the current session
5. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
6. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
7. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
8. [`../../../scripts/docs/control-matrix.mjs`](../../../scripts/docs/control-matrix.mjs)
9. [`../../../scripts/docs/audit.mjs`](../../../scripts/docs/audit.mjs)

## Use This Skill When

- runtime behavior changed and docs need to match
- Tier 1 docs are stale or broken
- markdown links, control-matrix coverage, or status banners need repair
- the user asks for documentation review, sync, or governance work

## Workflow

1. For every documentation session, use the active numbered spec plus [`../../../progress.md`](../../../progress.md).
2. If the active spec is `NN_session-placeholder`, rename that same numbered file in place before substantive doc work starts.
3. Treat the control matrix as the first filter for what is authoritative.
4. Update current docs to match code; do not rewrite preserved historical material as if it were current.
5. If a file is non-authoritative, keep it preserved and correctly labeled.
6. Keep agent-entry docs accurate and free of broken repo-owned links.
7. Regenerate the matrix and banners through the audit command rather than by hand.

## Verification

```bash
pnpm docs:audit -- --sync
pnpm docs:audit
```

- Add `pnpm openapi:generate` when API docs or generated contract surfaces changed.
- Run the full gate chain when documentation changes are coupled to code behavior changes.

---
name: docs-sync
description: |
  Use when code and docs may have drifted, when Tier 1 docs need updates, or
  when `pnpm docs:audit` must be fixed or kept green.
author: Codex
version: 1.0.0
date: 2026-03-12
---

# Docs Sync

## Read First

1. [`../../../AGENTS.md`](../../../AGENTS.md)
2. [`../../../docs/DOCUMENT_CONTROL_MATRIX.md`](../../../docs/DOCUMENT_CONTROL_MATRIX.md)
3. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
4. [`../../../docs/forensic-audit/REPORT.md`](../../../docs/forensic-audit/REPORT.md)
5. [`../../../scripts/docs/control-matrix.mjs`](../../../scripts/docs/control-matrix.mjs)
6. [`../../../scripts/docs/audit.mjs`](../../../scripts/docs/audit.mjs)

## Use This Skill When

- runtime behavior changed and docs need to match
- Tier 1 docs are stale or broken
- markdown links, control-matrix coverage, or status banners need repair
- the user asks for documentation review, sync, or governance work

## Workflow

1. Treat the control matrix as the first filter for what is authoritative.
2. Update current docs to match code; do not rewrite preserved historical material as if it were current.
3. If a file is non-authoritative, keep it preserved and correctly labeled.
4. Keep agent-entry docs accurate and free of broken repo-owned links.
5. Regenerate the matrix and banners through the audit command rather than by hand.

## Verification

```bash
pnpm docs:audit -- --sync
pnpm docs:audit
```

- Add `pnpm openapi:generate` when API docs or generated contract surfaces changed.
- Run the full gate chain when documentation changes are coupled to code behavior changes.

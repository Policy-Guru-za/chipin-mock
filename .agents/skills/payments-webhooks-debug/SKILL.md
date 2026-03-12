---
name: payments-webhooks-debug
description: |
  Use when investigating payment-provider flows, contribution creation,
  webhook handling, payout execution, retries, reconciliation, or contract
  drift in the money-moving parts of Gifta.
author: Codex
version: 1.2.0
date: 2026-03-12
---

# Payments and Webhooks Debug

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. [`../../../spec/00_overview.md`](../../../spec/00_overview.md)
6. the active numbered spec in [`../../../spec/`](../../../spec/) for the current session
7. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
8. [`../../../docs/Platform-Spec-Docs/PAYMENTS.md`](../../../docs/Platform-Spec-Docs/PAYMENTS.md)
9. [`../../../docs/Platform-Spec-Docs/INTEGRATIONS.md`](../../../docs/Platform-Spec-Docs/INTEGRATIONS.md)
10. [`../../../docs/Platform-Spec-Docs/KARRI.md`](../../../docs/Platform-Spec-Docs/KARRI.md)
11. [`../../../docs/Platform-Spec-Docs/SECURITY.md`](../../../docs/Platform-Spec-Docs/SECURITY.md)

## Focus Areas

- contribution creation path and provider redirect or handoff logic
- PayFast, Ozow, and SnapScan webhooks
- Karri batch processing, bank payout paths, charity ledger rows
- fee semantics, close semantics, payout readiness, retries, and reconciliation
- idempotency and duplicate-delivery handling
- public API and outgoing webhook contract drift

## Workflow

1. For every payment or webhook session, read the napkin first, keep the active numbered spec and [`../../../progress.md`](../../../progress.md) current, and log durable money-flow learnings back to [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md).
2. If the active spec is `NN_session-placeholder`, rename that same numbered file in place before substantive investigation or changes begin.
3. Map the exact flow first: route -> service -> DB write -> downstream event/webhook.
4. Verify auth and trust boundaries on every involved route.
5. Inspect status transitions and retry counters before changing logic.
6. Prefer targeted tests and exact webhook/payment fixtures over broad guesses.
7. Call out contract mismatches between runtime code, generated OpenAPI, docs, and current execution evidence.

## Verification

```bash
pnpm test:payments
pnpm test:webhooks
pnpm test:payouts
```

- Add `pnpm typecheck` and targeted integration tests when the fix crosses API, service, and DB boundaries.

---
name: payments-webhooks-debug
description: |
  Use when investigating payment-provider flows, contribution creation,
  webhook handling, payout execution, retries, reconciliation, or contract
  drift in the money-moving parts of Gifta.
author: Codex
version: 1.0.0
date: 2026-03-12
---

# Payments and Webhooks Debug

## Read First

1. [`../../../AGENTS.md`](../../../AGENTS.md)
2. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
3. [`../../../docs/Platform-Spec-Docs/PAYMENTS.md`](../../../docs/Platform-Spec-Docs/PAYMENTS.md)
4. [`../../../docs/Platform-Spec-Docs/INTEGRATIONS.md`](../../../docs/Platform-Spec-Docs/INTEGRATIONS.md)
5. [`../../../docs/Platform-Spec-Docs/KARRI.md`](../../../docs/Platform-Spec-Docs/KARRI.md)
6. [`../../../docs/Platform-Spec-Docs/SECURITY.md`](../../../docs/Platform-Spec-Docs/SECURITY.md)

## Focus Areas

- contribution creation path and provider redirect or handoff logic
- PayFast, Ozow, and SnapScan webhooks
- Karri batch processing, bank payout paths, charity ledger rows
- fee semantics, close semantics, payout readiness, retries, and reconciliation
- idempotency and duplicate-delivery handling
- public API and outgoing webhook contract drift

## Workflow

1. Map the exact flow first: route -> service -> DB write -> downstream event/webhook.
2. Verify auth and trust boundaries on every involved route.
3. Inspect status transitions and retry counters before changing logic.
4. Prefer targeted tests and exact webhook/payment fixtures over broad guesses.
5. Call out contract mismatches between runtime code, generated OpenAPI, and docs.

## Verification

```bash
pnpm test:payments
pnpm test:webhooks
pnpm test:payouts
```

- Add `pnpm typecheck` and targeted integration tests when the fix crosses API, service, and DB boundaries.

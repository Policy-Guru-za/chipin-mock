---
name: payments-webhooks-debug
description: |
  Use when investigating payment-provider flows, contribution creation,
  webhook handling, payout execution, retries, reconciliation, or contract
  drift in the money-moving parts of Gifta.
author: Codex
version: 2.0.0
date: 2026-03-18
---

# Payments and Webhooks Debug

## Read First

1. [`../napkin/SKILL.md`](../napkin/SKILL.md)
2. [`../../../docs/napkin/napkin.md`](../../../docs/napkin/napkin.md)
3. [`../../../AGENTS.md`](../../../AGENTS.md)
4. [`../../../progress.md`](../../../progress.md)
5. the relevant numbered spec if this investigation belongs to full-path work
6. [`../../../docs/Platform-Spec-Docs/CANONICAL.md`](../../../docs/Platform-Spec-Docs/CANONICAL.md)
7. [`../../../docs/Platform-Spec-Docs/PAYMENTS.md`](../../../docs/Platform-Spec-Docs/PAYMENTS.md)
8. [`../../../docs/Platform-Spec-Docs/INTEGRATIONS.md`](../../../docs/Platform-Spec-Docs/INTEGRATIONS.md)
9. [`../../../docs/Platform-Spec-Docs/KARRI.md`](../../../docs/Platform-Spec-Docs/KARRI.md)
10. [`../../../docs/Platform-Spec-Docs/SECURITY.md`](../../../docs/Platform-Spec-Docs/SECURITY.md)

## Focus Areas

- contribution creation path and provider redirect or handoff logic
- PayFast, Ozow, and SnapScan webhooks
- Karri batch processing, bank payout paths, and charity ledger rows
- fee semantics, close semantics, payout readiness, retries, and reconciliation
- idempotency and duplicate-delivery handling
- public API and outgoing webhook contract drift

## Workflow

1. Read napkin first, then AGENTS, then progress.
2. Keep the relevant full-path spec row or quick-task row current.
3. Promote the work to a numbered full-path spec immediately if the investigation crosses risky money-moving surfaces.
4. Map the exact flow first: route -> service -> DB write -> downstream event/webhook.
5. Verify auth and trust boundaries on every involved route.
6. Inspect status transitions and retry counters before changing logic.
7. Prefer targeted tests and exact fixtures over broad guesses.

## Verification

```bash
pnpm test:payments
pnpm test:webhooks
pnpm test:payouts
```

- Add `pnpm typecheck` and targeted integration tests when the fix crosses API, service, and DB boundaries.

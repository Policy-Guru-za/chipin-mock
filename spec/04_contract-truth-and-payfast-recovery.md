# 04_contract-truth-and-payfast-recovery

> Historical context note (2026-03-19): this superseded spec reflects a PayFast-era recovery plan. Current Gifta product truth is a Stitch-coming-soon guest placeholder with no live checkout provider.

## Objective

- Align Gifta's public webhook contract, guest contribution flow, payment recovery behavior, and admin payout surface with current runtime truth while preserving safe rollback and verification paths.

## In Scope

- narrowing supported outbound webhook events to the currently emitted set and removing unsupported wildcard handling
- adding snapshot and restore tooling plus a one-time sanitization migration for legacy webhook endpoint rows
- updating public copy, generated OpenAPI, and Tier 1 docs to match current provider and domain truth
- unifying guest contribution message limits at 280 characters and normalizing legacy session flow data
- adding PayFast reconciliation support with strict provider-authoritative matching and `dryRun=1`
- removing the incomplete admin payout-documents surface while keeping the stub route dormant
- updating tests, progress tracking, and handoff evidence for this session

## Out Of Scope

- adding new outbound webhook event emitters beyond `contribution.received` and `pot.funded`
- changing Karri automation, payout-engine scope, or bank/charity payout execution
- implementing payout-evidence upload/download workflows
- broad UX redesigns outside the touched guest and admin surfaces

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- [`../docs/Platform-Spec-Docs/CANONICAL.md`](../docs/Platform-Spec-Docs/CANONICAL.md)
- [`../docs/Platform-Spec-Docs/API.md`](../docs/Platform-Spec-Docs/API.md)
- [`../docs/Platform-Spec-Docs/PAYMENTS.md`](../docs/Platform-Spec-Docs/PAYMENTS.md)
- [`../src/app/api/v1/webhooks/route.ts`](../src/app/api/v1/webhooks/route.ts)
- [`../src/lib/payments/index.ts`](../src/lib/payments/index.ts)

## Stage Plan

1. Stage 1 — Contract truth and rollback safety: shared webhook event constants, snapshot/restore tooling, webhook endpoint sanitization migration, wildcard removal, copy/domain cleanup, and OpenAPI/doc updates.
2. Stage 2 — Guest message flow correctness: shared 280-char limit, early enforcement, legacy flow-data normalization, and guest-flow test updates.
3. Stage 3 — PayFast reconciliation hardening: provider-authoritative transaction lookup, strict matching rules, `dryRun=1`, and reconciliation test expansion.
4. Stage 4 — Payout-document surface removal, full docs sync, verification chain, dogfood, and handoff.

## Test Gate

- Stage 1: `pnpm openapi:generate`, targeted webhook/copy tests, `pnpm docs:audit`
- Stage 2: targeted guest-flow tests, then `pnpm lint`, `pnpm typecheck`
- Stage 3: targeted reconciliation/payment tests, then `pnpm lint`, `pnpm typecheck`, `pnpm test`
- Stage 4 / final handoff: `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm openapi:generate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Exit Criteria

- public webhook contract, runtime validation, docs, and generated OpenAPI all expose only `contribution.received` and `pot.funded`
- rollback snapshot and restore tooling exists for affected webhook rows and the sanitization migration preserves auditability
- guest contribution messages are capped consistently at 280 without silent submit-time truncation
- PayFast reconciliation supports dry-run and only mutates when provider data yields a unique exact match
- admin payout detail no longer presents the incomplete documents surface
- this spec is marked `Done`, a new `05_session-placeholder` exists, and [`../progress.md`](../progress.md) attributes proof through this completed spec at handoff

## Final State

- Status: Superseded
- Exit Criteria State: not-satisfied
- Successor Slot: 05
- Notes: Stage 1 completed and stopped at Gate A; follow-on product work was captured under spec 05 instead of finishing this spec’s original exit criteria.

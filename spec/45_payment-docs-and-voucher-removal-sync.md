# 45_payment-docs-and-voucher-removal-sync

## Objective

- Sync Gifta's important markdown docs to the intended product truth: no active Takealot voucher path, public guest payments described as a Stitch-coming-soon placeholder only, and payouts described as bank with an optional Karri path.

## In Scope

- Tier 1/current docs that still describe PayFast, Ozow, SnapScan, or Takealot voucher product truth.
- High-traffic Tier 2 references the user asked to sweep (`runbooks`, `Demo-Mode`, selected `UX/ui-specs`, `payment-docs`, and the UX v2 decision register).
- Legacy-context notes for historical plans/evidence that still read like current payment guidance.
- Execution artifacts for this spec in `progress.md`, `spec/00_overview.md`, and this spec file.
- A follow-up backlog note for any remaining runtime/OpenAPI voucher drift not resolved in this docs-only pass.

## Out Of Scope

- Runtime/code removal of the remaining voucher host/admin/API surfaces.
- Generated contract or schema changes in `public/v1/openapi.json`, `src/lib/api/openapi.ts`, or `src/lib/db/schema.ts`.
- Rewriting historical evidence as if it were current instead of marking it as legacy context.

## Dependencies

- `../AGENTS.md`
- `../progress.md`
- `./00_overview.md`
- `../docs/DOCUMENT_CONTROL_MATRIX.md`
- `../docs/Platform-Spec-Docs/CANONICAL.md`
- `../docs/Platform-Spec-Docs/PAYMENTS.md`
- `../docs/forensic-audit/REPORT.md`
- `../README.md`
- `../BACKLOG.md`
- `../.env.example`
- `../drizzle/migrations/0020_replace_legacy_payment_providers_with_stitch.sql`

## Stage Plan

1. Stage 1 — Register the new full-path spec, then update authoritative/current-reference docs to the intended payment and payout truth.
2. Stage 2 — Sweep the selected Tier 2 reference docs so they either match the new truth or clearly declare themselves legacy-only.
3. Stage 3 — Add legacy-context notes to historical docs surfaced by the inventory, record the remaining runtime/OpenAPI voucher drift follow-up, and run the docs verification gate.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`

## Exit Criteria

- Current-authoritative/current-reference markdown no longer describes PayFast, Ozow, SnapScan, or Takealot vouchers as the active Gifta product truth.
- Current docs describe the public guest payment state as a Stitch-coming-soon placeholder only, with no live checkout.
- Current docs describe the intended payout model as bank with an optional Karri path.
- Historical docs that still mention the retired providers or vouchers carry explicit legacy-context notes instead of reading like current guidance.
- `progress.md` records the spec lifecycle and notes whether a durable napkin update was required.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Completed the intended-truth docs sync, marked legacy/payment-provider reference docs explicitly, and recorded the remaining runtime/OpenAPI voucher drift in `BACKLOG.md` for follow-up cleanup.

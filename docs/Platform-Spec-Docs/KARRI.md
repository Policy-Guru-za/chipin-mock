# Karri

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Current Role

Karri handles automated card payout credits for gift payouts where the Dreamboard payout method is `karri_card`.
It is not part of the standard default Dreamboard host flow; it remains a gated legacy or partner capability.

## Runtime Files

- [`src/lib/integrations/karri.ts`](../../src/lib/integrations/karri.ts)
- [`src/lib/integrations/karri-batch.ts`](../../src/lib/integrations/karri-batch.ts)
- [`src/lib/payouts/service.ts`](../../src/lib/payouts/service.ts)

## Operational Trigger

- Internal route: `/api/internal/karri/batch`
- Protected by `INTERNAL_JOB_SECRET`
- Must be triggered externally; there is no in-repo scheduler definition

## Current Flags

- `MOCK_KARRI`
- `UX_V2_ENABLE_KARRI_WRITE_PATH`
- `KARRI_BATCH_ENABLED`
- `KARRI_AUTOMATION_ENABLED`

## Activation Rules

- Public API `karri_card` writes are rejected unless `UX_V2_ENABLE_KARRI_WRITE_PATH=true`.
- Startup and `/health/ready` only require `KARRI_*` credentials when `UX_V2_ENABLE_KARRI_WRITE_PATH=true` or `KARRI_AUTOMATION_ENABLED=true`, unless `MOCK_KARRI=true`.
- Automated execution still depends on `KARRI_AUTOMATION_ENABLED=true`; enabling the write path alone does not enable payout automation.

## Known Runtime Debt

- Pending Karri responses currently reset the queue attempt counter to the prior value instead of the incremented count.
- This is tracked in [`BACKLOG.md`](../../BACKLOG.md) and should be treated as known current behavior until fixed.

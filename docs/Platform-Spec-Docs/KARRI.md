# Karri

> **Status:** Current reference  
> **Last reviewed:** March 20, 2026

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
- `KARRI_BATCH_ENABLED`
- `KARRI_AUTOMATION_ENABLED`

## Activation Rules

- Host and partner API `karri_card` writes are active.
- `CARD_DATA_ENCRYPTION_KEY` is required for active payout capture.
- Startup and `/health/ready` only require `KARRI_*` credentials when `KARRI_AUTOMATION_ENABLED=true`, unless `MOCK_KARRI=true`.
- Automated execution still depends on `KARRI_AUTOMATION_ENABLED=true`; capture/write-path availability alone does not enable payout automation.

## Known Runtime Debt

- Pending Karri responses currently reset the queue attempt counter to the prior value instead of the incremented count.
- This is tracked in [`BACKLOG.md`](../../BACKLOG.md) and should be treated as known current behavior until fixed.

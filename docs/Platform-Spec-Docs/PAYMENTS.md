# Payments

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Current Providers

- PayFast
- Ozow
- SnapScan

## Contribution Create Flow

Source route: [`src/app/api/internal/contributions/create/route.ts`](../../src/app/api/internal/contributions/create/route.ts)

Current behavior:

- validates `dreamBoardId`, contribution amount, contributor details, and provider
- allows contributions while board status is `active` or `funded`
- calculates checkout total as `amount_cents + fee_cents`
- persists contribution with `amount_cents`, `fee_cents`, provider, ref, and pending status
- creates provider-specific payment intent/redirect payload

## Current Money Semantics

- contributor chooses gift amount
- platform fee is calculated separately
- checkout total is provider charge amount
- completed goal progress uses `amount_cents`
- payout math uses `net_cents`

## Webhooks

Webhook route handlers live under:

- `/api/webhooks/payfast`
- `/api/webhooks/ozow`
- `/api/webhooks/snapscan`

On successful completion they update contribution state, refresh board totals, and may emit partner webhooks / notifications.

Current outbound partner webhook events:

- `contribution.received`
- `pot.funded`

Legacy wildcard endpoint subscriptions and non-emitted legacy event names are not part of the supported partner contract.

## Known Constraints

- Current docs should describe provider reality as implemented, not older freehand examples.
- Use [`docs/Platform-Spec-Docs/API.md`](./API.md) plus generated OpenAPI for contract work.

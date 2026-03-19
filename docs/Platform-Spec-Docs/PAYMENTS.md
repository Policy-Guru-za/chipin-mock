# Payments

> **Status:** Current reference  
> **Last reviewed:** March 19, 2026

## Current Runtime State

- No live guest payment provider is enabled right now.
- Public contribution routes now show a Stitch-coming-soon placeholder instead of a working checkout.
- Active payment creation, provider selection, inbound provider webhooks, demo payment simulator, and reconciliation routes have been removed.
- Future direction: Stitch, but the integration is not implemented yet.

## Public Guest Flow

Source files:

- [`src/app/(guest)/[slug]/contribute/page.tsx`](../../src/app/(guest)/[slug]/contribute/page.tsx)
- [`src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx`](../../src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx)
- [`src/app/(guest)/[slug]/contribute/payment/page.tsx`](../../src/app/(guest)/[slug]/contribute/payment/page.tsx)
- [`src/app/(guest)/[slug]/payment-failed/page.tsx`](../../src/app/(guest)/[slug]/payment-failed/page.tsx)
- [`src/lib/payments/index.ts`](../../src/lib/payments/index.ts)

Current behavior:

- `/{slug}/contribute` renders Dreamboard context plus a public Stitch-coming-soon placeholder.
- `/{slug}/contribute/payment` redirects back to `/{slug}/contribute`.
- `/{slug}/payment-failed` redirects back to `/{slug}/contribute`.
- `/{slug}/thanks` can still render historical receipt state for stored `stitch` contribution refs, but no live checkout path currently lands there.

## Current Money Semantics

- The public guest flow does not create live contributions right now.
- Historical contribution storage still keeps `amount_cents`, `fee_cents`, `net_cents`, `payment_provider`, `payment_status`, and `payment_ref` fields for ledger/admin compatibility.
- The active runtime enum for `payment_provider` is now `stitch`.
- Payout math continues to respect stored contribution amounts.

## Webhooks and Jobs

- No inbound payment-provider webhook routes are active.
- No payment reconciliation job route is active.
- Outbound partner webhook dispatch still lives under [`src/lib/webhooks/`](../../src/lib/webhooks/) for Dreamboard/contribution events generated elsewhere in the runtime.

Current outbound partner webhook events:

- `contribution.received`
- `pot.funded`

Legacy wildcard endpoint subscriptions and non-emitted legacy event names are not part of the supported partner contract.

## Known Constraints

- Stitch integration is future work; this doc should not describe a live Stitch API flow until code exists.
- Current docs should describe provider reality as implemented, not older freehand examples.
- Use [`docs/Platform-Spec-Docs/API.md`](./API.md) plus generated OpenAPI for contract work.

# Product Specification

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Current Product Shape

Gifta is a free Dreamboard gifting orchestration platform built around one primary Dreamboard flow:

- one child
- one gift concept
- public guest contribution flow
- host dashboard
- admin operations surface

## Current In-Scope Capabilities

- Clerk-authenticated host/admin flows
- five-step host create flow plus review/publish
- public guest contribute + payment + thank-you flow
- PayFast, Ozow, SnapScan payments
- `takealot_voucher` default host-create payout path, with `karri_card` and bank preserved as gated legacy or partner payout capabilities in the data model and payout engine
- optional charity configuration and charity payout rows outside the active default host create path
- partner API for dream boards, contributions, payouts, and webhooks

## Current Out-of-Scope Reality

- no in-repo auto-close scheduler
- no native mobile app
- no multi-item registry
- no fulfillment/catalog purchasing flow

## Current Product Terms

- Brand: `Gifta`
- User-facing product term: `Dreamboard`
- Action term: `chip in`

## Source of Truth

Use [`docs/Platform-Spec-Docs/CANONICAL.md`](./CANONICAL.md) for conflict resolution.

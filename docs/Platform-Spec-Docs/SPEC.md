# Product Specification

> **Status:** Current reference  
> **Last reviewed:** March 19, 2026

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
- public guest contribute placeholder + historical thank-you flow
- Stitch-coming-soon placeholder only (no live guest checkout)
- bank payout as the intended default product path, with optional Karri preserved as a gated path in the data model and payout engine
- optional charity configuration and charity payout rows outside the active default host create path
- partner API for Dreamboards, contributions, payouts, and webhooks

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

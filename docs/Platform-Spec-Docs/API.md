# Gifta Public API

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026  
> **Primary source of truth:** [`src/lib/api/openapi.ts`](../../src/lib/api/openapi.ts) and [`public/v1/openapi.json`](../../public/v1/openapi.json)

## Current Endpoints

- Production base URL: `https://api.gifta.co.za/v1`
- Local base URL: `http://localhost:3000/v1`
- Rewrites are defined in [`next.config.js`](../../next.config.js)

## Authentication

- All partner API routes use bearer API keys.
- Raw key format remains legacy:
  - `cpk_live_<32 chars>`
  - `cpk_test_<32 chars>`
- Runtime validation and hashing live in [`src/lib/api/auth.ts`](../../src/lib/api/auth.ts).
- Keys are hashed with SHA-256 for lookup.

## Current Scope Set

- `dreamboards:read`
- `dreamboards:write`
- `contributions:read`
- `payouts:read`
- `payouts:write`
- `webhooks:manage`

## Current Resource Surface

- `GET /dream-boards`
- `POST /dream-boards`
- `GET /dream-boards/{id}`
- `PATCH /dream-boards/{id}`
- `POST /dream-boards/{id}/close`
- `GET /dream-boards/{id}/contributions`
- `GET /contributions/{id}`
- `GET /payouts`
- `GET /payouts/{id}`
- `POST /payouts/{id}/confirm`
- `POST /payouts/{id}/fail`
- webhook endpoint management routes under `/webhooks`

## Important Current Contracts

- Public Dreamboard identifiers accept UUIDs and, where implemented, slug-compatible public IDs.
- `raised_cents` is based on completed `amount_cents`, not `net_cents`.
- Close is explicit through the close endpoint; there is no in-repo scheduler that auto-closes boards.
- Webhook endpoint subscriptions currently accept only:
  - `contribution.received`
  - `pot.funded`
- Legacy wildcard or non-emitted webhook event names are not part of the current public API contract.
- Generated OpenAPI is the canonical response/request contract. The human doc exists to orient implementers, not to override the generated artifact.

## Legacy Protocol Details Still Present

- API key prefix remains `cpk_*`
- Outgoing webhook headers remain:
  - `X-ChipIn-Signature`
  - `X-ChipIn-Event-Id`

These are current runtime behavior, not documentation mistakes.

## Regeneration

```bash
pnpm openapi:generate
pnpm docs:audit
```

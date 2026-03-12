# Security

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Current Controls

### Auth

- Clerk for host/admin auth
- admin allowlist on top of Clerk
- bearer API keys for partner API
- bearer `INTERNAL_JOB_SECRET` for internal job routes

### Secrets and encryption

- API keys are hashed with SHA-256 for lookup
- sensitive payout data uses encryption helpers from [`src/lib/utils/encryption.ts`](../../src/lib/utils/encryption.ts)
- payout secrets/config are environment-driven through `.env.example`

### Webhooks

- provider webhooks validate provider-specific signatures and payload rules
- outgoing partner webhook signatures use the current legacy header names:
  - `X-ChipIn-Signature`
  - `X-ChipIn-Event-Id`

### Retention

Current retention helpers live in [`src/lib/retention/retention.ts`](../../src/lib/retention/retention.ts):

- IP address retention window: `30` days
- anonymization grace after terminal board states: `90` days

## Documentation Rule

Do not document controls that are not present in code as if they are deployed. When a desired control is not implemented yet, mark it as planned or backlog work.

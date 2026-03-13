# Integrations

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Current Integrations

### Auth

- Clerk
- Config derived from `.env` and [`src/lib/auth/clerk-config.ts`](../../src/lib/auth/clerk-config.ts)

### Payments

- PayFast
- Ozow
- SnapScan

### Payouts

- Takealot voucher placeholder for the standard Dreamboard path
- Karri Card queue processing and automation for gated legacy or partner flows
- Bank payout tracking in the payout engine

### Messaging / Email

- Resend
- WhatsApp Business / Meta Cloud API compatible env support

### Storage and Cache

- Vercel Blob
- Vercel KV

### Observability

- Sentry
- Optional OpenTelemetry export
- Optional Axiom wiring

## Current Feature Flags

Derived from [`src/lib/config/feature-flags.ts`](../../src/lib/config/feature-flags.ts):

- `MOCK_PAYMENTS`
- `MOCK_PAYMENT_WEBHOOKS`
- `MOCK_KARRI`
- `UX_V2_ENABLE_KARRI_WRITE_PATH`
- `MOCK_SENTRY`
- `UX_V2_ENABLE_BANK_WRITE_PATH`
- `UX_V2_ENABLE_CHARITY_WRITE_PATH`
- `UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH`

## Notes

- Current docs must reference `MOCK_*` flags, not the removed `DEMO_MODE` control path.
- Karri credentials are required only when `UX_V2_ENABLE_KARRI_WRITE_PATH=true` or `KARRI_AUTOMATION_ENABLED=true`, unless `MOCK_KARRI=true`.
- Charity URL autofill currently uses Anthropic env wiring in `.env.example`.

# Integrations

> **Status:** Current reference  
> **Last reviewed:** March 19, 2026

## Current Integrations

### Auth

- Clerk
- Config derived from `.env` and [`src/lib/auth/clerk-config.ts`](../../src/lib/auth/clerk-config.ts)

### Payments

- Stitch coming-soon placeholder only (no live guest checkout)

### Payouts

- Bank payout tracking in the payout engine
- Optional Karri Card queue processing and automation for the gated Karri path

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

- `MOCK_KARRI`
- `UX_V2_ENABLE_KARRI_WRITE_PATH`
- `MOCK_SENTRY`
- `UX_V2_ENABLE_BANK_WRITE_PATH`
- `UX_V2_ENABLE_CHARITY_WRITE_PATH`
- `UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH`

## Notes

- Current docs must reference the actual remaining `MOCK_*` flags, not removed payment mocks or the removed `DEMO_MODE` control path.
- No live inbound payment-provider env block remains in `.env.example`; the active payment story is the public Stitch placeholder only.
- Karri credentials are required only when `UX_V2_ENABLE_KARRI_WRITE_PATH=true` or `KARRI_AUTOMATION_ENABLED=true`, unless `MOCK_KARRI=true`.
- Charity URL autofill currently uses Anthropic env wiring in `.env.example`.

# Migration Guide: DEMO_MODE → Sandbox Flags

## Summary

`DEMO_MODE` has been replaced by granular sandbox flags. The legacy `isDemoMode()` helper now always returns `false` and is deprecated.

## Environment Variable Changes

### Remove

- `DEMO_MODE`
- `NEXT_PUBLIC_DEMO_MODE`

### Add (granular mocks)

| Flag | When `true` | Notes |
| --- | --- | --- |
| `MOCK_PAYMENTS` | Simulate payment creation + redirects | Enables payment simulator UI. |
| `MOCK_PAYMENT_WEBHOOKS` | Skip webhook signature validation | Use for sandbox-only webhooks. |
| `MOCK_KARRI` | Simulate Karri Card verification/topups | No external Karri calls. |
| `MOCK_SENTRY` | Suppress Sentry reporting | Optional for local/sandbox. |

### Recommended Sandbox Defaults

```
MOCK_PAYMENTS=true
MOCK_PAYMENT_WEBHOOKS=true
MOCK_KARRI=true
MOCK_SENTRY=true
```

## Required Integrations (No Longer Mocked)

Sandbox mode now uses **real** integrations for:

- Resend (email)
- WhatsApp Business API
- Vercel Blob
- Vercel KV

Make sure these are configured before running sandbox flows:

- `RESEND_API_KEY`
- `WHATSAPP_BUSINESS_API_URL`, `WHATSAPP_BUSINESS_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `BLOB_READ_WRITE_TOKEN`
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`

## Payment Simulator

When `MOCK_PAYMENTS=true`, payment creation redirects to:

```
/demo/payment-simulator
```

This simulates completion and returns to the guest flow without contacting external providers.

## Karri Credentials

When `MOCK_KARRI=false`, the following are required:

- `KARRI_BASE_URL`
- `KARRI_API_KEY`

## Database Safety

Mocking payments or Karri enforces a startup guard that rejects production databases. Ensure `DATABASE_URL` points to a non-production instance when mock flags are enabled.

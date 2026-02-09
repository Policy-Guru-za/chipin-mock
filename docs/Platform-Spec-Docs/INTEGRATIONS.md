# Gifta Third-Party Integrations

> **Version:** 2.0.0  
> **Last Updated:** February 2026  
> **Status:** Platform Simplification In Progress

---

## Overview

Gifta integrates with external services for payments, payouts, notifications, and storage. This document specifies the integration patterns and requirements.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Gifta Platform                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Core Application                      │  │
│  │   Dream Boards │ Contributions │ Payouts │ Users          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                     Gifta Public API                           │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
    ┌──────────────┬───────────┼───────────┬──────────────┐
    │              │           │           │              │
    ▼              ▼           ▼           ▼              ▼
┌────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐
│ Icons  │  │ WhatsApp │  │ Karri  │  │ Payment │  │  Email   │
│(Static)│  │ Business │  │  Card  │  │Providers│  │ (Resend) │
└────────┘  └──────────┘  └────────┘  └─────────┘  └──────────┘
```

### Integration Summary

| Integration | Purpose | Status |
|-------------|---------|--------|
| Gift Icon Library | Curated static icon imagery for dream gifts | **NEW** |
| WhatsApp Business API | Transactional notifications | **NEW** |
| Karri Card | Sole payout method (daily batch) | **ENHANCED** |
| PayFast | Inbound card payments | Unchanged |
| Ozow | Inbound EFT payments | Unchanged |
| SnapScan | Inbound QR payments | Unchanged |
| Resend | Email notifications | Unchanged |
| Vercel Blob | Child photo storage | Unchanged |
| Vercel KV | Cache & rate limiting | Unchanged |

---

## Gift Icon Library (Static Assets)

Dream gift imagery is sourced from static PNG assets at `/public/icons/gifts/*`.

Current behavior:

1. Hosts select a curated icon during create step 2.
2. The selected icon path is stored in `dream_boards.gift_image_url` (e.g. `/icons/gifts/ballet.png`).
3. `gift_image_prompt` is deprecated legacy data and null for icon-based boards.
4. No third-party AI image provider is called at runtime.
5. No internal artwork-generation endpoint exists.

---

## WhatsApp Business API

### Purpose

Send transactional notifications to hosts via WhatsApp. More immediate and reliable than email for time-sensitive updates.

### Provider

Meta WhatsApp Business API (via official API or approved BSP).

### Environment Variables

```bash
WHATSAPP_BUSINESS_API_URL=""
WHATSAPP_BUSINESS_API_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
```

### Message Templates

All messages must use pre-approved templates in WhatsApp Business Manager.

#### Template: `dream_board_created`
```
🎉 {{child_name}}'s Dream Board is live!

Share this link with party guests:
{{dream_board_url}}

You'll receive notifications when friends chip in.
```

#### Template: `contribution_received`
```
💝 {{contributor_name}} just contributed to {{child_name}}'s Dream Board!

Progress: {{percentage}}% funded
```

#### Template: `funding_complete`
```
🎊 Amazing news! {{child_name}}'s Dream Board is fully funded!

Total raised: R{{amount}}

Funds will be credited to your Karri Card ending in {{card_last4}} within 24 hours.
```

#### Template: `payout_confirmed`
```
✅ R{{amount}} has been credited to your Karri Card ending in {{card_last4}}.

Thank you for using Gifta! 🎁
```

### Interface

```typescript
interface WhatsAppService {
  sendDreamBoardLink(
    phoneNumber: string,
    dreamBoardUrl: string,
    childName: string
  ): Promise<void>;

  sendContributionNotification(
    phoneNumber: string,
    contributorName: string,
    childName: string,
    percentage: number
  ): Promise<void>;

  sendFundingCompleteNotification(
    phoneNumber: string,
    childName: string,
    totalRaisedCents: number,
    cardLast4: string
  ): Promise<void>;

  sendPayoutConfirmation(
    phoneNumber: string,
    amountCents: number,
    cardLast4: string
  ): Promise<void>;
}
```

### Phone Number Validation

South African mobile numbers only:
- Format: `+27XXXXXXXXX` (international) or `0XXXXXXXXX` (local)
- Normalize to international format before sending
- Validate against SA mobile prefixes (06x, 07x, 08x)

### Error Handling

| Error | Handling |
|-------|----------|
| Invalid phone number | Skip WhatsApp, fall back to email |
| Template not approved | Log error, fall back to email |
| Rate limited | Queue and retry |
| Delivery failed | Log, no retry (user may have blocked) |

---

## Karri Card Integration

### Purpose

Credit pooled funds to the host's Karri Card. This is the **sole payout method**.

### Flow: Immediate Debit, Daily Batch Credit

```
┌─────────────────────────────────────────────────────────────────┐
│                     Contribution Flow                           │
│                                                                 │
│   Guest ──► PayFast/Ozow/SnapScan ──► Contribution Record      │
│              (Immediate Debit)         (Status: completed)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Pot closes)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Payout Queue                                │
│                                                                 │
│   Closed Pot ──► karri_credit_queue ──► Batch Job Endpoint     │
│                  (Status: pending)      (external scheduler)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Karri Card Credit                           │
│                                                                 │
│   Batch Job ──► Karri API ──► Status: completed                │
│                              ──► WhatsApp confirmation          │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
KARRI_BASE_URL=""
KARRI_API_KEY=""
KARRI_BATCH_ENABLED="true"
KARRI_AUTOMATION_ENABLED="false"  # optional: enable automated payout execution

# Internal job endpoints auth
INTERNAL_JOB_SECRET=""
```

Scheduling note:
- This repo does not configure cron. Use an external scheduler (e.g. Vercel Cron) to call `POST /api/internal/karri/batch` with `Authorization: Bearer ${INTERNAL_JOB_SECRET}`.

### Interface

```typescript
interface KarriBatchService {
  queueKarriCredit(
    karriCardNumber: string,
    amountCents: number,
    reference: string,
    dreamBoardId: string
  ): Promise<void>;

  processDailyKarriBatch(): Promise<BatchResult>;
}

interface BatchResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: BatchError[];
}

interface BatchError {
  dreamBoardId: string;
  karriCardNumber: string;
  error: string;
  attempts: number;
}
```

### Database: `karri_credit_queue`

```sql
CREATE TABLE karri_credit_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_board_id UUID NOT NULL REFERENCES dream_boards(id),
  karri_card_number VARCHAR(20) NOT NULL,
  amount_cents INTEGER NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Batch Processing Logic

1. Query all `pending` entries
2. For each entry:
   - Update status to `processing`
   - Call Karri Card API
   - On success: status = `completed`, set `completed_at`, send WhatsApp
   - On failure: status = `pending`, increment `attempts`, set `error_message`
3. If `attempts >= 3`: status = `failed`, send alert email to admin

### Idempotency

Each credit has a unique `reference` (format: `chipin-{dreamBoardId}-{timestamp}`). Karri API must reject duplicate references.

### Karri Card Number Validation

- 16-digit card number
- Validate Luhn checksum
- Store only last 4 digits for display (`****1234`)

---

## Payment Providers (Inbound)

Payment providers handle contributions from guests. No changes from previous implementation.

### PayFast
- Card payments
- See `docs/payment-docs/payfast-developer-reference.md`

### Ozow
- EFT payments
- See `docs/payment-docs/ozow-oneapi-developer-reference.md`

### SnapScan
- QR code payments
- See `docs/payment-docs/snapscan-developer-reference.md`

### Webhook Security

All webhooks must verify signatures before processing. See `PAYMENTS.md` for details.

---

## Email (Resend)

Email remains for:
- Magic link authentication
- Backup notifications (when WhatsApp fails)
- Host receipts and summaries

### Environment Variables

```bash
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@chipin.co.za"
RESEND_FROM_NAME="Gifta"
```

No changes to existing email implementation.

---

## Storage (Vercel Blob)

Used for:
- Child photos (uploaded by host)

### Environment Variables

```bash
BLOB_READ_WRITE_TOKEN=""
```

No changes to existing blob implementation.

---

## Cache (Vercel KV)

Used for:
- Session storage
- Magic link tokens
- Rate limiting counters
- Dream board draft state

### Environment Variables

```bash
KV_REST_API_URL=""
KV_REST_API_TOKEN=""
```

No changes to existing KV implementation.

---

## Health Checks

Integration health is monitored via `/health/ready`:

| Check | Integration | Criticality |
|-------|-------------|-------------|
| Database | Neon PostgreSQL | Critical |
| Cache | Vercel KV | Critical |
| Storage | Vercel Blob | Warning |
| Email | Resend | Warning |
| WhatsApp | WhatsApp Business | Warning |
| Karri | Karri Card API | Warning |

Critical failures return 503. Warning failures log but return 200.

---

## Removed Integrations

The following integrations have been removed in the platform simplification:

| Integration | Reason |
|-------------|--------|
| Takealot Product Scraping | Gifts now defined manually by parent |
| Takealot Gift Card API | Karri Card is sole payout method |
| GivenGain Philanthropy | Charity features removed from scope |

Historical code and documentation have been archived.

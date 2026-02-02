# ChipIn Third-Party Integrations

> **Version:** 2.0.0  
> **Last Updated:** February 2026  
> **Status:** Platform Simplification In Progress

---

## Overview

ChipIn integrates with external services for payments, payouts, notifications, and AI image generation. This document specifies the integration patterns and requirements.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChipIn Platform                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Core Application                      │  │
│  │   Dream Boards │ Contributions │ Payouts │ Users          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                     ChipIn Public API                          │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
    ┌──────────────┬───────────┼───────────┬──────────────┐
    │              │           │           │              │
    ▼              ▼           ▼           ▼              ▼
┌────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐
│  AI    │  │ WhatsApp │  │ Karri  │  │ Payment │  │  Email   │
│ Images │  │ Business │  │  Card  │  │Providers│  │ (Resend) │
└────────┘  └──────────┘  └────────┘  └─────────┘  └──────────┘
```

### Integration Summary

| Integration | Purpose | Status |
|-------------|---------|--------|
| AI Image Generation | Generate gift artwork from descriptions | **NEW** |
| WhatsApp Business API | Transactional notifications | **NEW** |
| Karri Card | Sole payout method (daily batch) | **ENHANCED** |
| PayFast | Inbound card payments | Unchanged |
| Ozow | Inbound EFT payments | Unchanged |
| SnapScan | Inbound QR payments | Unchanged |
| Resend | Email notifications | Unchanged |
| Vercel Blob | Image storage | Unchanged |
| Vercel KV | Session/cache storage | Unchanged |

---

## AI Image Generation

### Purpose

Generate whimsical, non-photorealistic artwork for gift descriptions. Parents describe their child's dream gift, and AI creates an illustration.

### Provider

OpenAI DALL-E 3 (default), with flexibility for alternative providers.

### Environment Variables

```bash
IMAGE_GENERATION_API_KEY=""
IMAGE_GENERATION_API_URL="https://api.openai.com/v1/images/generations"
IMAGE_GENERATION_MODEL="dall-e-3"
```

### Interface

```typescript
interface ImageGenerationService {
  generateGiftArtwork(giftDescription: string): Promise<GeneratedImage>;
}

interface GeneratedImage {
  imageUrl: string;   // Vercel Blob URL (permanent storage)
  prompt: string;     // Full prompt used (for regeneration)
}
```

### Implementation Requirements

1. **Style Directive**: Prepend style instructions to ensure child-friendly, non-photorealistic output:

```typescript
const STYLE_DIRECTIVE = `Create a whimsical, playful illustration in a
watercolor and hand-drawn style. The image should feel warm, celebratory,
and child-friendly. DO NOT create photorealistic images. Use soft colors
and gentle shapes. The subject is: `;
```

2. **Upload to Blob**: Generated images must be uploaded to Vercel Blob for permanent storage (AI provider URLs are temporary).

3. **Rate Limiting**: Maximum 5 generations per session per hour.

4. **Cost Tracking**: Log token/credit usage for monitoring.

5. **Retry Logic**: Exponential backoff on transient failures.

### API Route

```
POST /api/internal/artwork/generate
```

**Request:**
```json
{
  "description": "A shiny red mountain bike with training wheels"
}
```

**Response:**
```json
{
  "imageUrl": "https://xxx.public.blob.vercel-storage.com/artwork/abc123.png",
  "prompt": "Create a whimsical, playful illustration... A shiny red mountain bike with training wheels"
}
```

### Error Handling

| Error | Status | User Message |
|-------|--------|--------------|
| Rate limit exceeded | 429 | "You've generated too many images. Please wait a bit." |
| Invalid description | 400 | "Please provide a description between 10-500 characters." |
| API failure | 500 | "We couldn't generate artwork right now. Please try again." |
| Content policy violation | 400 | "We couldn't illustrate that description. Please try different words." |

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

Thank you for using ChipIn! 🎁
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
│   Closed Pot ──► karri_credit_queue ──► Daily Batch Job        │
│                  (Status: pending)      (6 AM SAST)             │
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
KARRI_API_URL=""
KARRI_API_KEY=""
KARRI_BATCH_ENABLED="true"
KARRI_BATCH_SCHEDULE="0 6 * * *"  # 6 AM SAST daily
```

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
RESEND_FROM_NAME="ChipIn"
```

No changes to existing email implementation.

---

## Storage (Vercel Blob)

Used for:
- Child photos (uploaded by host)
- AI-generated gift artwork

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
| AI Images | OpenAI | Warning |
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

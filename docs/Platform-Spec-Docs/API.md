# Gifta Public API Specification

> **Version:** 1.0.0  
> **Last Updated:** January 28, 2026  
> **Status:** Ready for Development

---

## Overview

Gifta exposes a RESTful API for partner integrations. The API follows the principle that **Gifta is the source of truth** — partners integrate with us, not the reverse.

### Base URL

```
Production:  https://api.chipin.co.za/v1
Development: http://localhost:3000/v1
```

### API Design Principles

1. **RESTful** — Resources as nouns, HTTP methods as verbs
2. **JSON** — All request/response bodies are JSON
3. **Versioned** — URL versioning (`/v1/`)
4. **Consistent** — Standard error formats, pagination, filtering
5. **Secure** — HTTPS only, API key authentication, webhook signatures

---

## Authentication

### API Keys

All API requests require authentication via API key in the Authorization header:

```http
Authorization: Bearer cpk_live_xxxxxxxxxxxxxxxxxxxx
```

**Key Format:**
- Prefix: `cpk_live_` (production) or `cpk_test_` (sandbox)
- Length: 32 characters after prefix
- Example: `cpk_live_abc123def456ghi789jkl012mno345`

**Key Scopes:**
| Scope | Description |
|-------|-------------|
| `dreamboards:read` | Read Dream Board data |
| `dreamboards:write` | Create/update Dream Boards |
| `contributions:read` | Read contribution data |
| `payouts:read` | Read payout status |
| `payouts:write` | Confirm payout execution |
| `webhooks:manage` | Manage webhook endpoints |

### Tenant Isolation (Partner Scoping)

- Every API key belongs to a single **partner** (tenant).
- All reads/writes are scoped to that partner; cross-tenant resource access returns `404 not_found`.
- Rate limiting is applied at the **partner** level (shared across that partner's API keys).

### Rate Limiting

Limits are applied per **partner**:

- **Hourly quota:** fixed window counter (requests/hour)
- **Burst quota:** **sliding window** over the last 60 seconds (requests/minute)

| Tier | Requests/Hour | Burst (per 60s sliding window) |
|------|---------------|--------------------------------|
| Default | 1,000 | 100 |
| Partner | 10,000 | 500 |
| Enterprise | Custom | Custom |

Rate limit headers are returned on every response. `Retry-After` is only included on `429` responses.

**Example (200 response):**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706140800
```

**Example (429 response):**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706140800
Retry-After: 30
```

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-21T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input data",
    "details": {
      "field": "amount",
      "reason": "must be at least 2000 cents"
    }
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-21T10:30:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Invalid or missing API key |
| `forbidden` | 403 | Valid key but insufficient scope |
| `not_found` | 404 | Resource does not exist |
| `validation_error` | 400 | Invalid request parameters |
| `conflict` | 409 | Resource state conflict |
| `rate_limited` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

### Pagination

List endpoints support cursor-based pagination:

```http
GET /v1/dream-boards?limit=20&after=cursor_xyz
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "has_more": true,
    "next_cursor": "cursor_abc",
    "total_count": 150
  }
}
```

---

## Endpoints

### Dream Boards

#### Create Dream Board

```http
POST /v1/dream-boards
```

**Request Body:**
```json
{
  "child_name": "Maya",
  "child_photo_url": "https://example.public.blob.vercel-storage.com/photos/abc123.jpg",
  "party_date": "2026-02-15",
  "gift_name": "Mountain Bike with Bells",
  "gift_image_url": "https://example.public.blob.vercel-storage.com/artwork/bike.png",
  "gift_image_prompt": "A shiny red mountain bike with training wheels and a bell",
  "goal_cents": 250000,
  "payout_email": "parent@example.com",
  "host_whatsapp_number": "+27821234567",
  "karri_card_number": "1234567890123456",
  "karri_card_holder_name": "Maya's Mom",
  "message": "Maya would love your contribution toward her dream bike!"
}
```

**Notes:**
- `gift_image_prompt` is optional; it stores the prompt used for AI artwork.
- `payout_method` is always `karri_card`.
- `party_date` must be within the next 6 months.

**Response:** `201 Created`
```json
{
  "data": {
    "id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
    "slug": "maya-7th-birthday-x7k9m2",
    "child_name": "Maya",
    "child_photo_url": "https://example.public.blob.vercel-storage.com/photos/abc123.jpg",
    "party_date": "2026-02-15",
    "gift_data": {
      "gift_name": "Mountain Bike with Bells",
      "gift_image_url": "https://example.public.blob.vercel-storage.com/artwork/bike.png",
      "gift_image_prompt": "A shiny red mountain bike with training wheels and a bell"
    },
    "payout_method": "karri_card",
    "goal_cents": 250000,
    "raised_cents": 0,
    "message": "Maya would love your contribution toward her dream bike!",
    "status": "active",
    "display_mode": "gift",
    "contribution_count": 0,
    "public_url": "https://<APP_DOMAIN>/maya-7th-birthday-x7k9m2",
    "created_at": "2026-01-21T10:30:00Z",
    "updated_at": "2026-01-21T10:30:00Z"
  }
}
```

#### Get Dream Board

```http
GET /v1/dream-boards/{id}
```

**Path Parameters:**
- `id` — Dream Board public identifier (UUID or slug)

**Response:** `200 OK`
```json
{
  "data": {
    "id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
    "slug": "maya-7th-birthday-x7k9m2",
    "child_name": "Maya",
    "child_photo_url": "https://example.public.blob.vercel-storage.com/photos/abc123.jpg",
    "party_date": "2026-02-15",
    "gift_data": { ... },
    "payout_method": "karri_card",
    "goal_cents": 250000,
    "raised_cents": 125000,
    "message": "...",
    "status": "active",
    "display_mode": "gift",
    "contribution_count": 8,
    "public_url": "https://<APP_DOMAIN>/maya-7th-birthday-x7k9m2",
    "created_at": "2026-01-21T10:30:00Z",
    "updated_at": "2026-01-22T15:45:00Z"
  }
}
```

#### List Dream Boards

```http
GET /v1/dream-boards
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (`active`, `funded`, `closed`, etc.) |
| `limit` | integer | Results per page (default: 20, max: 100) |
| `after` | string | Cursor for pagination |

**Response:** `200 OK`
```json
{
  "data": [
    { "id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab", "slug": "...", ... },
    { "id": "8f5d2c1b-3a4e-4f6a-9b0c-1234567890de", "slug": "...", ... }
  ],
  "pagination": {
    "has_more": true,
    "next_cursor": "cursor_abc123"
  }
}
```

#### Update Dream Board

```http
PATCH /v1/dream-boards/{id}
```

**Request Body** (partial update):
```json
{
  "message": "Updated message",
  "party_date": "2026-02-20"
}
```

**Updatable Fields:**
- `message`
- `party_date` (can only extend, not shorten)
- `status` (only certain transitions allowed)

**Response:** `200 OK` with updated Dream Board

#### Close Dream Board

```http
POST /v1/dream-boards/{id}/close
```

**Request Body:**
```json
{
  "reason": "manual"  // or "party_date_reached", "goal_reached"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
    "status": "closed",
    "raised_cents": 125000,
    "payouts": [
      {
        "id": "po_xyz789",
        "type": "karri_card",
        "status": "pending",
        "net_cents": 121250  // After fees
      }
    ]
  }
}
```

---

### Contributions

#### List Contributions

```http
GET /v1/dream-boards/{id}/contributions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by payment status |
| `limit` | integer | Results per page |
| `after` | string | Pagination cursor |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "con_abc123",
      "dream_board_id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
      "contributor_name": "Sarah M.",
      "message": "Happy birthday Maya!",
      "amount_cents": 20000,
      "fee_cents": 600,
      "net_cents": 19400,
      "payment_status": "completed",
      "created_at": "2026-01-22T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Get Contribution

```http
GET /v1/contributions/{id}
```

**Response:** `200 OK` with contribution details

---

### Payouts

**Note:** Each Dream Board has a single Karri payout.

#### List Pending Payouts

For partners to poll for payouts they need to execute.

```http
GET /v1/payouts/pending
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by payout type |
| `limit` | integer | Results per page |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "po_abc123",
      "dream_board_id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
      "type": "karri_card",
      "gross_cents": 125000,
      "fee_cents": 3750,
      "net_cents": 121250,
      "status": "pending",
      "recipient_data": {
        "karri_card_holder_name": "Maya's Mom",
        "card_number_last4": "1234",
        "card_number_masked": "****1234"
      },
      "created_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

#### Get Payout

```http
GET /v1/payouts/{id}
```

**Response:** `200 OK` with payout details

#### Confirm Payout

For partners to confirm they've executed a payout.

```http
POST /v1/payouts/{id}/confirm
```

**Request Body:**
```json
{
  "external_ref": "KARRI_TOPUP_12345",  // Partner's reference
  "completed_at": "2026-01-25T11:30:00Z"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "po_abc123",
    "status": "completed",
    "external_ref": "KARRI_TOPUP_12345",
    "completed_at": "2026-01-25T11:30:00Z"
  }
}
```

#### Report Payout Failure

```http
POST /v1/payouts/{id}/fail
```

**Request Body:**
```json
{
  "error_code": "INSUFFICIENT_STOCK",
  "error_message": "Product no longer available"
}
```

**Response:** `200 OK` with updated payout status

---

### Webhooks

#### Register Webhook Endpoint

```http
POST /v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://partner.com/webhooks/chipin",
  "events": ["contribution.received", "pot.closed", "payout.ready"],
  "secret": "whsec_abc123..."  // For signature verification
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "wh_abc123",
    "url": "https://partner.com/webhooks/chipin",
    "events": ["contribution.received", "pot.closed", "payout.ready"],
    "is_active": true,
    "created_at": "2026-01-21T10:00:00Z"
  }
}
```

#### List Webhook Endpoints

```http
GET /v1/webhooks
```

#### Delete Webhook Endpoint

```http
DELETE /v1/webhooks/{id}
```

---

## Webhook Events

Gifta pushes events to registered webhook endpoints.

### Event Format

```json
{
  "id": "evt_abc123def456",
  "type": "contribution.received",
  "created_at": "2026-01-22T14:30:00Z",
  "data": {
    "contribution": {
      "id": "con_xyz789",
      "dream_board_id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
      "amount_cents": 20000,
      ...
    },
    "dream_board": {
      "id": "0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab",
      "slug": "maya-7th-birthday-x7k9m2",
      "raised_cents": 145000,
      "goal_cents": 249900,
      ...
    }
  }
}
```

### Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `dreamboard.created` | New Dream Board created | Dream Board object |
| `dreamboard.updated` | Dream Board updated | Dream Board object |
| `contribution.received` | Successful contribution | Contribution + Dream Board |
| `pot.funded` | Goal amount reached | Dream Board object |
| `pot.closed` | Dream Board closed | Dream Board object |
| `payout.ready` | Payout ready for execution | Payout object |
| `payout.completed` | Payout confirmed complete | Payout object |
| `payout.failed` | Payout failed | Payout object + error |

### Webhook Signature Verification

All webhook requests include a signature header:

```http
X-Gifta-Signature: t=1706140800,v1=abc123...
```

**Verification Process:**

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const [timestamp, hash] = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false;
  }

  // Verify signature
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  );
}
```

### Webhook Retry Policy

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 12 hours |
| 7 | 24 hours |

After 7 failed attempts, the webhook is marked as failed and requires manual retry.

---

## Internal API Endpoints

These endpoints are used by the Gifta frontend, not exposed to partners.

### Authentication

Clerk manages host sessions for the frontend.

#### Get Current User

```http
GET /api/internal/auth/me
```

### Image Upload

```http
POST /api/internal/upload
Content-Type: multipart/form-data

file: [binary]
```

**Response:**
```json
{
  "url": "https://example.public.blob.vercel-storage.com/photos/abc123.jpg"
}
```

---

## Payment Provider Webhooks

These endpoints receive callbacks from payment providers.

### PayFast Webhook

```http
POST /api/webhooks/payfast
```

Receives ITN (Instant Transaction Notification) from PayFast.

### Ozow Webhook

```http
POST /api/webhooks/ozow
```

Receives payment notification from Ozow.

### SnapScan Webhook

```http
POST /api/webhooks/snapscan
```

Receives payment notification from SnapScan.

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ChipInClient } from '@chipin/sdk';

const chipin = new ChipInClient({
  apiKey: 'cpk_live_xxx',
});

// Create Dream Board
const dreamBoard = await chipin.dreamBoards.create({
  childName: 'Maya',
  childPhotoUrl: 'https://...',
  partyDate: '2026-02-15',
  giftName: 'Mountain Bike with Bells',
  giftImageUrl: 'https://...',
  giftImagePrompt: 'A shiny red mountain bike with training wheels and a bell',
  goalCents: 250000,
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardNumber: '1234567890123456',
  karriCardHolderName: "Maya's Mom",
});

// Get Dream Board
const board = await chipin.dreamBoards.get('0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab');

// List contributions
const contributions = await chipin.contributions.list('0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab');

// Confirm payout
await chipin.payouts.confirm('po_xyz789', {
  externalRef: 'KARRI_TOPUP_12345',
});
```

### cURL Examples

```bash
# Create Dream Board
curl -X POST https://api.chipin.co.za/v1/dream-boards \
  -H "Authorization: Bearer cpk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "child_name": "Maya",
    "party_date": "2026-02-15",
    "gift_name": "Mountain Bike with Bells",
    "gift_image_url": "https://...",
    "goal_cents": 250000,
    "payout_email": "parent@example.com",
    "host_whatsapp_number": "+27821234567",
    "karri_card_number": "1234567890123456",
    "karri_card_holder_name": "Maya\u0027s Mom"
  }'

# Get Dream Board
curl https://api.chipin.co.za/v1/dream-boards/0f3b3f3e-1a2b-4c5d-8e9f-0123456789ab \
  -H "Authorization: Bearer cpk_live_xxx"

# Confirm payout
curl -X POST https://api.chipin.co.za/v1/payouts/po_xyz789/confirm \
  -H "Authorization: Bearer cpk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"external_ref": "KARRI_TOPUP_12345"}'
```

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:

```
https://api.chipin.co.za/v1/openapi.json
http://localhost:3000/v1/openapi.json
```

Source file: `public/v1/openapi.json`

---

## Document References

| Document | Purpose |
|----------|---------|
| [DATA.md](./DATA.md) | Data models backing these endpoints |
| [PAYMENTS.md](./PAYMENTS.md) | Payment flow details |
| [SECURITY.md](./SECURITY.md) | API security requirements |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Third-party integration patterns |

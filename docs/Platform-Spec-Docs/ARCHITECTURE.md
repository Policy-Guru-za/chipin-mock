# Gifta Technical Architecture

> **Version:** 2.0.0  
> **Last Updated:** February 2026  
> **Status:** Platform Simplification In Progress

---

## Architecture Overview

Gifta follows a **modern serverless architecture** optimized for:
- Rapid development (single codebase)
- Global edge performance (Vercel)
- Cost-efficient scaling (pay-per-use)
- API-first design (partners integrate with us)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Host App (Next.js)  │  Guest Web (Next.js)  │  Partner APIs    │
└──────────┬───────────┴──────────┬────────────┴────────┬─────────┘
           │                      │                     │
           ▼                      ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Static/SSR  │  │  API Routes │  │  Edge Functions         │  │
│  │   Pages     │  │  /api/*     │  │  (geolocation, auth)    │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Neon DB    │  │  Vercel KV   │  │ Vercel Blob  │
│ (PostgreSQL) │  │   (Redis)    │  │  (Images)    │
│              │  │              │  │              │
│ - Dream Boards│  │ - Rate limits│ │ - Child photos│
│ - Contributions│ │ - Caching   │  │ - Gift images │
│ - Payouts    │  │             │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Payments       │  Payout         │  Notifications              │
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐              │
│  │ PayFast   │  │  │ Karri     │  │  │ WhatsApp  │              │
│  │ Ozow      │  │  │ Card      │  │  │ Business  │              │
│  │ SnapScan  │  │  │ (batch)   │  │  │ Resend    │              │
│  └───────────┘  │  └───────────┘  │  └───────────┘              │
├─────────────────┴─────────────────┴─────────────────────────────┤
│  AI Services                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Gemini Image Generation (Gift Artwork)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 16.1.4 (App Router) | Full-stack React, SSR, API routes, edge-ready |
| **UI** | React 19.2.3 | Modern React runtime |
| **Language** | TypeScript | Type safety, better DX, fewer runtime errors |
| **Styling** | Tailwind CSS | Rapid UI development, consistent design system |
| **Database** | Neon (PostgreSQL) | Serverless Postgres, Vercel integration, branching |
| **ORM** | Drizzle ORM | Type-safe, lightweight, excellent DX |
| **Hosting** | Vercel | Edge network, seamless Next.js integration |
| **Cache/KV** | Vercel KV (Redis) | Rate limiting, caching |
| **Blob Storage** | Vercel Blob | Image uploads (child photos) |
| **Email** | Resend | Developer-friendly transactional email |

### Payment Providers

| Provider | Use Case | Integration Type |
|----------|----------|------------------|
| **PayFast** | Card payments, EFT | Redirect + webhook |
| **Ozow** | Instant EFT | Redirect + webhook |
| **SnapScan** | QR code payments | API + webhook |

### External Integrations

| Service | Purpose | Integration Status |
|---------|---------|-------------------|
| **Gemini** | AI-generated gift artwork | API integration |
| **WhatsApp Business** | Transactional notifications | API integration |
| **Karri Card** | Sole payout method (daily batch) | API integration |

---

## Project Structure

```
chipin/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/          # Public pages (landing, about)
│   │   │   ├── page.tsx          # Landing page
│   │   │   └── layout.tsx
│   │   ├── (host)/               # Host-side pages (authenticated)
│   │   │   ├── create/           # Dream Board creation wizard
│   │   │   ├── dashboard/        # Host dashboard
│   │   │   └── layout.tsx
│   │   ├── (guest)/              # Guest-side pages (public)
│   │   │   └── [slug]/           # Dream Board view + contribute
│   │   │       └── page.tsx
│   │   ├── api/                  # API Routes
│   │   │   ├── v1/               # Versioned public API
│   │   │   │   ├── dream-boards/
│   │   │   │   ├── contributions/
│   │   │   │   ├── payouts/
│   │   │   │   └── webhooks/
│   │   │   ├── internal/         # Internal API (not versioned)
│   │   │   │   ├── auth/
│   │   │   │   ├── upload/
│   │   │   │   └── products/
│   │   │   └── webhooks/         # Payment provider webhooks
│   │   │       ├── payfast/
│   │   │       ├── ozow/
│   │   │       └── snapscan/
│   │   └── layout.tsx            # Root layout
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components (shadcn/ui)
│   │   ├── dream-board/          # Dream Board specific components
│   │   ├── payment/              # Payment flow components
│   │   └── shared/               # Shared components
│   ├── lib/                      # Utilities and helpers
│   │   ├── db/                   # Database client and schema
│   │   │   ├── index.ts          # Drizzle client
│   │   │   ├── schema.ts         # Database schema
│   │   │   └── views.ts          # DB views (SQL-backed)
│   │   ├── payments/             # Payment provider abstraction
│   │   │   ├── index.ts          # Unified payment interface
│   │   │   ├── payfast.ts
│   │   │   ├── ozow.ts
│   │   │   └── snapscan.ts
│   │   ├── integrations/         # External service integrations
│   │   │   ├── blob.ts
│   │   │   ├── email.ts
│   │   │   ├── image-generation.ts
│   │   │   ├── karri.ts
│   │   │   ├── karri-batch.ts
│   │   │   └── whatsapp.ts
│   │   ├── auth/                 # Authentication utilities
│   │   ├── utils/                # General utilities
│   │   └── constants.ts          # App constants
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   └── styles/                   # Global styles
├── public/                       # Static assets
├── docs/                         # This documentation
├── tests/                        # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── drizzle/                     # Drizzle migrations
│   └── migrations/
├── drizzle.config.ts            # Drizzle ORM config
├── next.config.js               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## Database Architecture

### Primary Entities

```
┌─────────────────┐       ┌─────────────────┐
│   dream_boards  │       │     hosts       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ slug (unique)   │───────│ email           │
│ host_id (FK)    │       │ name            │
│ child_name      │       │ phone           │
│ child_photo_url │       │ created_at      │
│ gift_name       │       └─────────────────┘
│ gift_image_url  │
│ payout_method   │       ┌─────────────────┐
│ goal_cents      │       │  contributions  │
│ party_date      │       ├─────────────────┤
│ status          │◄──────│ id (PK)         │
│ message         │       │ dream_board_id  │
│ created_at      │       │ contributor_name│
│ updated_at      │       │ amount          │
└─────────────────┘       │ message         │
         │                │ payment_ref     │
         │                │ payment_status  │
         │                │ created_at      │
         ▼                └─────────────────┘
┌─────────────────┐
│     payouts     │
├─────────────────┤
│ id (PK)         │
│ dream_board_id  │
│ type            │
│ amount          │
│ recipient_data  │
│ status          │
│ external_ref    │
│ created_at      │
│ completed_at    │
└─────────────────┘
```

### Entity Relationships

- **Host** → **Dream Board**: One-to-Many (a host can create multiple Dream Boards)
- **Dream Board** → **Contribution**: One-to-Many (a Dream Board receives many contributions)
- **Dream Board** → **Payout**: One-to-One (single Karri payout)

### Status Enums

```typescript
// Dream Board Status
type DreamBoardStatus = 
  | 'draft'      // Being created
  | 'active'     // Accepting contributions
  | 'funded'     // Goal reached
  | 'closed'     // Manually closed by host
  | 'paid_out'   // Payout completed
  | 'expired'    // Deadline passed without action
  | 'cancelled'  // Cancelled by host

// Contribution Payment Status
type PaymentStatus = 
  | 'pending'    // Awaiting payment
  | 'processing' // Payment in progress
  | 'completed'  // Payment successful
  | 'failed'     // Payment failed
  | 'refunded'   // Contribution refunded

// Payout Status
type PayoutStatus = 
  | 'pending'    // Awaiting trigger
  | 'processing' // Payout in progress
  | 'completed'  // Payout successful
  | 'failed'     // Payout failed
```

---

## Authentication Architecture

### Host Authentication

Hosts authenticate via **Clerk** (email + OTP/password):

```
1. Host signs in via Clerk UI (/sign-in or /sign-up)
2. Clerk verifies identity
3. Session cookies set by Clerk (httpOnly, secure)
4. User redirected back to /create/child
```

**Why Clerk?**
- Managed auth and session lifecycle
- Built-in MFA/OTP options
- Reduced security surface area

### Guest Authentication

Guests are **unauthenticated**. They access Dream Boards via unique slug:

```
https://<APP_DOMAIN>/maya-7th-birthday-abc123
                      └── unique slug ──────┘
```

Guest contributions are tracked by:
- Optional name (displayed to host)
- Payment reference (for reconciliation)
- IP address + user agent (fraud detection / abuse prevention; retention-limited)

### API Authentication

Public API (for partners) uses **API keys**:

```
Authorization: Bearer cpk_live_xxxxxxxxxxxx
```

- Keys scoped to specific partner
- Rate limited per key
- Webhook signatures for verification

---

## Payment Flow Architecture

### Contribution Flow

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│  Guest   │───▶│  Gifta   │───▶│   Payment    │───▶│  Gifta   │
│  Browser │    │  Server  │    │   Provider   │    │  Webhook │
└──────────┘    └──────────┘    └──────────────┘    └──────────┘
     │               │                  │                 │
     │  1. Select    │                  │                 │
     │     amount    │                  │                 │
     │──────────────▶│                  │                 │
     │               │  2. Create       │                 │
     │               │     payment      │                 │
     │               │─────────────────▶│                 │
     │               │                  │                 │
     │  3. Redirect  │◀─────────────────│                 │
     │     to pay    │                  │                 │
     │◀──────────────│                  │                 │
     │               │                  │                 │
     │  4. Complete  │                  │                 │
     │     payment   │                  │                 │
     │──────────────────────────────────▶                 │
     │               │                  │                 │
     │               │                  │  5. Webhook     │
     │               │                  │     notify      │
     │               │                  │────────────────▶│
     │               │                  │                 │
     │               │◀─────────────────────────────────── │
     │               │     6. Update DB                   │
     │               │                                    │
     │  7. Redirect  │                                    │
     │     to thanks │                                    │
     │◀──────────────│                                    │
```

**Gift funded behavior:** When `raised_cents >= goal_cents`, the Dream Board is marked funded but the guest view remains gift-focused while contributions remain open until close.

### Payment Provider Abstraction

All payment providers implement a common interface:

```typescript
interface PaymentProvider {
  name: string;
  
  // Create a payment request
  createPayment(params: CreatePaymentParams): Promise<PaymentRequest>;
  
  // Verify webhook signature
  verifyWebhook(payload: unknown, signature: string): boolean;
  
  // Parse webhook payload
  parseWebhook(payload: unknown): WebhookEvent;
  
  // Query payment status (if needed)
  getPaymentStatus(reference: string): Promise<PaymentStatus>;
}

interface CreatePaymentParams {
  amount: number;          // In cents
  reference: string;       // Our internal reference
  description: string;     // Shown to customer
  returnUrl: string;       // Where to redirect after
  cancelUrl: string;       // Where to redirect on cancel
  notifyUrl: string;       // Webhook URL
  customerEmail?: string;
  customerName?: string;
}

interface PaymentRequest {
  providerReference: string;
  redirectUrl: string;     // Send customer here
  expiresAt?: Date;
}
```

### Escrow & Fund Holding

**Critical:** Gifta does not hold funds.

```
Payment Provider receives contribution
         │
         ▼
Funds held by Payment Provider (their escrow)
         │
         ▼
Pot closes → Gifta triggers payout instruction
         │
         ▼
Payment Provider transfers to:
  └── Karri (card top-up)
```

This architecture means:
- Gifta never holds customer funds
- Regulatory burden sits with licensed payment providers
- We instruct; they execute

---

## Payout Architecture

### Payout Routing

```typescript
type PayoutType = 'karri_card';

interface PayoutInstruction {
  type: PayoutType;
  amount: number;
  recipientData: PayoutRecipientData;
}

type PayoutRecipientData = { type: 'karri_card'; cardNumber: string }
```

### Karri Card Flow

```
1. Pot closes (party date or host triggers)
2. Gifta calculates payout amount (net contributions)
3. Gifta queues a Karri top-up
4. Batch job processes top-up and updates payout status
5. Host receives confirmation
```

---

## API Architecture

Gifta exposes a versioned public API for partner integrations.

### Base URL
```
https://api.chipin.co.za/v1
```

### Authentication
```
Authorization: Bearer cpk_live_xxxxxxxxxxxx
```

### Tenant Isolation

- Public API requests run in a **partner** context derived from the API key.
- All public API queries are filtered by `partner_id` at the database layer.
- Requests for resources outside the partner scope return `404`.

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/dream-boards` | Create Dream Board |
| GET | `/dream-boards/{id}` | Get Dream Board details |
| GET | `/dream-boards/{id}/contributions` | List contributions |
| GET | `/payouts/pending` | List pending payouts (for partners) |
| POST | `/payouts/{id}/confirm` | Confirm payout executed |

### Webhooks (We Push to Partners)

```typescript
interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  created_at: string;
  data: Record<string, unknown>;
}

type WebhookEventType =
  | 'dreamboard.created'
  | 'contribution.received'
  | 'pot.closed'
  | 'payout.ready'
  | 'payout.completed';
```

Full API specification in [API.md](./API.md).

---

## Caching Strategy

### Vercel KV Usage

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `dream-board:{slug}` | 5 min | Dream Board cache (guest view); dates hydrated on read |
| `webhook:{provider}:{ip}` | 1 min | Webhook rate limiting (fixed window) |
| `rate:api:partner:{partnerId}:hour` | 1 hour | Public API hourly quota (partner-scoped) |
| `rate:api:partner:{partnerId}:minute` | 60s | Public API burst quota (partner-scoped sliding window) |
| `product:{url_hash}` | 24 hours | Takealot product data |

### Cache Invalidation

- Dream Board cache invalidated when a contribution status transitions (webhooks + reconciliation)
- Product cache refreshed daily or on-demand
- Session cache invalidated on logout

---

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;        // Machine-readable code
    message: string;     // Human-readable message
    details?: unknown;   // Additional context
  };
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `not_found` | 404 | Resource not found |
| `validation_error` | 400 | Invalid input |
| `unauthorized` | 401 | Authentication required |
| `forbidden` | 403 | Insufficient permissions |
| `payment_failed` | 402 | Payment processing failed |
| `rate_limited` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

---

## Observability

### Logging

- Structured JSON logs via Vercel
- Request ID propagation
- Sensitive data redaction (card numbers, emails in logs)

### Monitoring

- Vercel Analytics for web vitals
- Vercel Speed Insights for performance
- Custom events for business metrics:
  - Dream Board created
  - Contribution received
  - Payout completed

### Alerting

- Payment webhook failures
- High error rates
- Payout processing delays

---

## Security Architecture

See [SECURITY.md](./SECURITY.md) for comprehensive security requirements.

Key points:
- All traffic over HTTPS
- PCI compliance via payment providers (not us)
- No storage of payment card data
- POPIA-compliant data handling
- Rate limiting on all endpoints
- Webhook signature verification

---

## Deployment Architecture

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Production | `<APP_DOMAIN>` | Live traffic |
| Preview | *.vercel.app | PR previews |
| Development | localhost:3000 | Local development |

Notes:
- App domain is configured via `NEXT_PUBLIC_APP_URL`.
- Partner API base URL is `https://api.chipin.co.za/v1` (see `public/v1/openapi.json`).

### Internal Jobs / Scheduling

This repo exposes internal job endpoints under `/api/internal/*` (webhook queue, retention, reconciliation, Karri batch).

- All internal job endpoints require `Authorization: Bearer ${INTERNAL_JOB_SECRET}`.
- There is no in-repo scheduler; use an external scheduler (e.g. Vercel Cron) to invoke:
  - `POST /api/internal/webhooks/process`
  - `POST /api/internal/karri/batch`
  - `POST /api/internal/retention/run`
  - `POST /api/internal/payments/reconcile`

### CI/CD Pipeline

```
Push to main
     │
     ▼
GitHub Actions
     │
     ├── Lint + Type Check
     ├── Unit Tests
     ├── Integration Tests
     │
     ▼
Vercel Build
     │
     ├── Build Next.js
     ├── Run DB migrations (Neon)
     │
     ▼
Deploy to Production
```

### Database Branching (Neon)

- Each PR gets a database branch
- Migrations tested in branch
- Merged to main → applied to production

---

## Scalability Considerations

### Current Architecture Limits

| Resource | Limit | Mitigation |
|----------|-------|------------|
| Vercel Functions | 10s timeout | Offload long tasks to queues |
| Neon connections | 100 concurrent | Connection pooling |
| Vercel KV | 30k ops/day (free) | Upgrade tier as needed |

### Future Scaling Path

If Gifta reaches >100k Dream Boards:
1. Move to dedicated PostgreSQL (Neon Pro or Supabase)
2. Add job queue (Inngest or Trigger.dev) for async processing
3. Consider edge caching for high-traffic Dream Boards
4. Evaluate moving compute to Fly.io for more control

---

## Document References

| Document | Purpose |
|----------|---------|
| [SPEC.md](./SPEC.md) | Product specification |
| [JOURNEYS.md](./JOURNEYS.md) | User journey details |
| [DATA.md](./DATA.md) | Complete data models |
| [API.md](./API.md) | API specification |
| [PAYMENTS.md](./PAYMENTS.md) | Payment flow details |
| [SECURITY.md](./SECURITY.md) | Security requirements |

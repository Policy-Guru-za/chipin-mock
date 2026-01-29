# PHASE1_PLAN.md — ChipIn DEMO_MODE Implementation Plan

> Generated: 2026-01-29
> Updated: 2026-01-29 (Critical corrections applied)
> Purpose: Comprehensive plan for converting ChipIn to a zero-external-call demo mode

---

## Executive Summary

This document details the plan to implement a `DEMO_MODE` for ChipIn that:
- Makes **ZERO real external API calls**
- Processes **ZERO real payments**
- Uses **NO real user accounts**
- Is **deterministic and resettable**
- Supports **scripted walkthrough flows**

---

## CRITICAL SAFETY CONSTRAINTS

### Single-Gift Invariant

Per ChipIn's product model (AGENTS.md), each Dream Board contains **exactly one gift**.

> **Single-Gift Rule:**
> - Each Dream Board must contain exactly one gift.
> - Demo seed data must create one and only one gift per Dream Board.
> - UI demo flows must not expose multi-gift selection.
> - Payment simulator must map contributions to this single gift only.

This is a **non-negotiable** product constraint. The demo must not imply or allow:
- Multiple gifts per board
- Gift lists or registries
- Gift selection interfaces with multiple items

### Production Database Safety Guard

> **Production DB Guard:**
> DEMO_MODE must refuse to start if `DATABASE_URL` points to a production database.

Implementation requirement:
- If `DEMO_MODE=true` and `DATABASE_URL` contains a production hostname or known production identifier:
  - Throw a startup error
  - Abort the application
  - Log a clear warning message

This guard must be implemented in `src/lib/demo/index.ts` and checked early in the application lifecycle.

### Webhook Short-Circuit Rule

> **Webhook Short-Circuit Rule:**
> All routes under `src/app/api/webhooks/*` must immediately return HTTP 200 in DEMO_MODE:
> - No signature validation
> - No outbound HTTP calls
> - No DB mutations
> - No side effects

This applies to:
- `src/app/api/webhooks/payfast/route.ts`
- `src/app/api/webhooks/ozow/route.ts`
- `src/app/api/webhooks/snapscan/route.ts`

These routes must be **true no-ops** in DEMO_MODE.

### Client-Side Analytics Safety

> **Client-Side Analytics Safety:**
> In DEMO_MODE:
> - No `NEXT_PUBLIC_*` analytics keys may be active
> - No browser beacons (Sentry, OTEL, metrics) may fire
> - No third-party scripts should load

Files requiring explicit audit:
- `src/app/layout.tsx` — no analytics script tags
- `src/lib/analytics/metrics.ts` — no beacon calls
- `src/lib/analytics/web-vitals.ts` — no reporting
- `sentry.client.config.ts` — no Sentry init

### Webhook Dispatcher Rule

> **Webhook Dispatcher Rule:**
> `src/lib/webhooks/dispatcher.ts` must be a true no-op in DEMO_MODE:
> - No retries
> - No queueing
> - No network calls
> - Console log only (optional, for debugging)

### Blob Mock Compatibility

> **Blob Mock Compatibility Requirement:**
> Blob mock must return the same shape as the real Blob integration:
> - `url` — string (placeholder URL)
> - `filename` — string
> - All metadata fields expected by callers
> - No nulls where strings are expected

The mock must not break downstream UI rendering or DB inserts that depend on these fields.

---

## PART 1: CODEBASE AUDIT FINDINGS

### A) Payments & Financial Flows

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| PayFast payment creation | `src/lib/payments/payfast.ts` | Create payment redirects, generate signatures | **MOCK** |
| PayFast ITN validation | `src/lib/payments/payfast.ts` → `validatePayfastItn()` | **Outbound call to PayFast servers** | **MOCK** |
| PayFast webhook | `src/app/api/webhooks/payfast/route.ts` | Process ITN callbacks, update contributions | **MOCK** |
| Ozow payment creation | `src/lib/payments/ozow.ts` | OAuth token fetch, payment API | **MOCK** |
| Ozow token cache | `src/lib/payments/ozow.ts` → `getOzowAccessToken()` | Token caching via KV | **MOCK** |
| Ozow transactions list | `src/lib/payments/ozow.ts` → `listOzowTransactionsPaged()` | Reconciliation API calls | **MOCK** |
| Ozow webhook | `src/app/api/webhooks/ozow/route.ts` | Process Svix webhooks | **MOCK** |
| SnapScan QR generation | `src/lib/payments/snapscan.ts` | Generate QR URLs | **MOCK** |
| SnapScan payments list | `src/lib/payments/snapscan.ts` → `listSnapScanPayments()` | Reconciliation API | **MOCK** |
| SnapScan webhook | `src/app/api/webhooks/snapscan/route.ts` | Process webhook payloads | **MOCK** |
| Payment abstraction | `src/lib/payments/index.ts` | Provider selection, payment intent creation | **MOCK** |
| Fee calculation | `src/lib/payments/fees.ts` | Calculate platform fees | **KEEP AS-IS** |
| Contribution creation | `src/app/api/internal/contributions/create/route.ts` | Create contribution + payment intent | **MOCK** (payment part) |

**Hidden Risk Identified**: `validatePayfastItn()` in `src/lib/payments/payfast.ts` makes an **outbound HTTP call** to PayFast's validation endpoint. This MUST be mocked in demo mode.

### B) Commerce / Product APIs

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| Takealot product scraper | `src/lib/integrations/takealot.ts` → `fetchTakealotProduct()` | Scrape product pages | **MOCK** |
| Takealot search | `src/lib/integrations/takealot.ts` → `fetchTakealotSearch()` | Search results scraping | **MOCK** |
| Takealot cache | `src/lib/integrations/takealot.ts` | KV caching of products | **MOCK** |
| Product search API | `src/app/api/internal/products/search/route.ts` | Internal product search | **MOCK** (calls Takealot) |
| Product fetch API | `src/app/api/internal/products/fetch/route.ts` | Internal product fetch | **MOCK** (calls Takealot) |
| Takealot gift cards | `src/lib/integrations/takealot-gift-cards.ts` | Issue gift cards | **MOCK** |
| Karri card top-up | `src/lib/integrations/karri.ts` | Top-up Karri cards | **MOCK** |
| Karri card verification | `src/lib/integrations/karri.ts` → `verifyKarriCard()` | Validate cards | **MOCK** |
| GivenGain donations | `src/lib/integrations/givengain.ts` | Create charity donations | **MOCK** |
| Curated causes | `src/lib/dream-boards/causes.ts` | Static cause data | **KEEP AS-IS** |

### C) Authentication

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| Magic link send | `src/lib/auth/magic-link.ts` → `sendMagicLink()` | Send email via Resend | **MOCK** |
| Magic link verify | `src/lib/auth/magic-link.ts` → `verifyMagicLink()` | Token verification via KV | **MOCK** |
| Session management | `src/lib/auth/session.ts` | Session CRUD via KV | **MOCK** (use in-memory) |
| Rate limiting | `src/lib/auth/rate-limit.ts` | Rate limit via KV | **MOCK** (use in-memory) |
| Login page | `src/app/(host)/create/page.tsx` | Magic link request form | **MOCK** (bypass auth) |
| Verify page | `src/app/auth/verify/page.tsx` | Token verification | **MOCK** (auto-login) |
| Admin allowlist | `src/lib/auth/session.ts` → `isAdminEmail()` | Admin access control | **KEEP AS-IS** |

### D) Dream Boards & Contributions

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| Dream board CRUD | `src/lib/db/queries.ts` | Database operations | **KEEP AS-IS** |
| Dream board cache | `src/lib/dream-boards/cache.ts` | KV caching | **MOCK** (use in-memory) |
| Dream board draft | `src/lib/dream-boards/draft.ts` | Draft storage in KV | **MOCK** (use in-memory) |
| Contribution queries | `src/lib/db/queries.ts` | Contribution DB ops | **KEEP AS-IS** |
| View models | `src/lib/dream-boards/view-model.ts` | UI view builders | **KEEP AS-IS** |
| Gift info | `src/lib/dream-boards/gift-info.ts` | Gift data extraction | **KEEP AS-IS** |
| Overflow logic | `src/lib/dream-boards/overflow.ts` | Charity overflow detection | **KEEP AS-IS** |

### E) Notifications & Sharing

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| Email sending | `src/lib/integrations/email.ts` | Send via Resend | **MOCK** |
| Share URLs | `src/lib/dream-boards/view-model.ts` | Generate share links | **KEEP AS-IS** |
| Outbound webhooks | `src/lib/webhooks/dispatcher.ts` | Send partner webhooks | **DISABLE** |
| Webhook payloads | `src/lib/webhooks/payloads.ts` | Build webhook data | **KEEP AS-IS** |

### F) Infrastructure (KV, Blob)

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| Vercel KV (sessions) | `src/lib/auth/session.ts` | Session storage | **MOCK** (in-memory Map) |
| Vercel KV (magic links) | `src/lib/auth/magic-link.ts` | Token storage | **MOCK** (in-memory Map) |
| Vercel KV (rate limits) | `src/lib/auth/rate-limit.ts` | Rate limiting | **MOCK** (in-memory or bypass) |
| Vercel KV (API rate limits) | `src/lib/api/rate-limit.ts` | API rate limiting | **MOCK** (bypass) |
| Vercel KV (Takealot cache) | `src/lib/integrations/takealot.ts` | Product caching | **MOCK** (in-memory) |
| Vercel KV (Ozow tokens) | `src/lib/payments/ozow.ts` | OAuth token cache | **MOCK** (in-memory) |
| Vercel KV (dream board cache) | `src/lib/dream-boards/cache.ts` | Board caching | **MOCK** (in-memory) |
| Vercel KV (drafts) | `src/lib/dream-boards/draft.ts` | Draft storage | **MOCK** (in-memory) |
| Vercel Blob | `src/lib/integrations/blob.ts` | Image uploads | **MOCK** (return placeholder URLs) |

### G) Observability (OpenTelemetry, Sentry)

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| OpenTelemetry init | `src/instrumentation.ts` | Tracing initialization | **DISABLE** |
| OTEL exporter | `src/lib/observability/otel.ts` | Trace export | **DISABLE** |
| Sentry client | `sentry.client.config.ts` | Client-side errors | **DISABLE** |
| Sentry server | `sentry.server.config.ts` | Server-side errors | **DISABLE** |
| Sentry edge | `sentry.edge.config.ts` | Edge function errors | **DISABLE** |
| Sentry captures | Multiple files | Error/message capture | **DISABLE** |
| Web vitals | `src/lib/analytics/web-vitals.ts` | Performance metrics | **DISABLE** |
| Custom metrics | `src/lib/analytics/metrics.ts` | Business metrics beacon | **DISABLE** |
| Logger | `src/lib/observability/logger.ts` | JSON logging | **KEEP AS-IS** (console only) |

### H) Scheduled Jobs / Reconciliation

| Module | Path | Responsibility | Category |
|--------|------|----------------|----------|
| Reconciliation job | `src/lib/payments/reconciliation-job.ts` | Payment reconciliation | **MOCK** |
| Reconciliation endpoint | `src/app/api/internal/payments/reconcile/route.ts` | Trigger reconciliation | **MOCK** |
| Ozow transaction fetch | `src/lib/payments/ozow.ts` | Fetch for reconciliation | **MOCK** |
| SnapScan payment fetch | `src/lib/payments/snapscan.ts` | Fetch for reconciliation | **MOCK** |
| Payout automation | `src/lib/payouts/automation.ts` | Execute payouts | **MOCK** |

---

## PART 2: DEMO_MODE ARCHITECTURE

### 2.1 Existing Patterns to Leverage

The codebase already has feature flag patterns we MUST use:

```typescript
// Pattern 1: PAYFAST_SANDBOX (src/lib/payments/payfast.ts)
sandbox: process.env.PAYFAST_SANDBOX === 'true'

// Pattern 2: *_AUTOMATION_ENABLED (src/lib/payouts/automation.ts)
const isEnabledFlag = (value?: string) => value === 'true';
export const isAutomationEnabledForType = (type: PayoutType) => {
  if (type === 'takealot_gift_card') {
    return isEnabledFlag(process.env.TAKEALOT_GIFTCARD_AUTOMATION_ENABLED);
  }
  // ...
};

// Pattern 3: Health check disabled state (src/lib/health/checks.ts)
if (!isEnabledFlag(process.env.KARRI_AUTOMATION_ENABLED)) {
  return { ok: true, detail: 'disabled' };
}
```

### 2.2 DEMO_MODE Flag Design

Create a centralized demo mode check:

```typescript
// src/lib/demo/index.ts
export const isDemoMode = () => process.env.DEMO_MODE === 'true';
export const DEMO_MODE = process.env.DEMO_MODE === 'true';
```

**No shared HTTP wrapper exists** - demo guards must be applied per integration file using this pattern:

```typescript
// Example: src/lib/integrations/takealot.ts
import { isDemoMode } from '@/lib/demo';
import { getDemoProduct, getDemoSearchResults } from '@/lib/demo/fixtures';

export async function fetchTakealotProduct(url: string): Promise<TakealotProduct> {
  if (isDemoMode()) {
    return getDemoProduct(url);
  }
  // ... existing implementation
}
```

### 2.3 Environment Configuration

Create `.env.demo`:

```bash
# Demo Mode Toggle
DEMO_MODE=true

# Database (real Neon, seeded with demo data)
DATABASE_URL=postgresql://...  # Demo database

# Disable all external integrations
PAYFAST_SANDBOX=true
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=

OZOW_CLIENT_ID=
OZOW_CLIENT_SECRET=
OZOW_SITE_CODE=
OZOW_BASE_URL=

SNAPSCAN_SNAPCODE=demo
SNAPSCAN_API_KEY=
SNAPSCAN_WEBHOOK_AUTH_KEY=

# Disable payout automation
TAKEALOT_GIFTCARD_AUTOMATION_ENABLED=false
KARRI_AUTOMATION_ENABLED=false
GIVENGAIN_AUTOMATION_ENABLED=false

# Disable reconciliation alerts
RECONCILIATION_ALERTS_ENABLED=false

# Email (mocked, no real sends)
RESEND_API_KEY=

# Disable observability
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=

# KV fallback (use in-memory)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Blob (use placeholders)
BLOB_READ_WRITE_TOKEN=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.4 KV Fallback Strategy

Create an in-memory KV adapter for demo mode:

```typescript
// src/lib/demo/kv-mock.ts
const store = new Map<string, { value: unknown; expiresAt?: number }>();

export const demoKv = {
  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  },
  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    store.set(key, {
      value,
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : undefined,
    });
  },
  async del(key: string): Promise<void> {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },
};
```

### 2.5 Demo Users & Seed Data

**Seeded Demo Host:**
| Field | Value |
|-------|-------|
| Name | Sarah Thompson |
| Email | sarah@demo.chipin.co.za |
| ID | Fixed UUID for determinism |

**Seeded Demo Guests:**
| Name | Use Case |
|------|----------|
| Demo Guest 1 (Alex) | First contributor |
| Demo Guest 2 (Jamie) | Second contributor |
| Demo Guest 3 (Morgan) | Final contribution to trigger funding |

**Seeded Dream Board:**
| Field | Value |
|-------|-------|
| Child Name | Emma |
| Event | Emma's 7th Birthday |
| Slug | `emma-birthday-demo` |
| Gift | Wooden Train Set (Takealot) |
| Goal | R350.00 |
| Status | Active |
| Raised | R150.00 (partial, for demo) |
| Overflow Cause | Food Forward SA |

### 2.6 Demo Payment Flow

Instead of redirecting to PayFast/Ozow:

```typescript
// src/lib/demo/payments.ts
export const createDemoPaymentIntent = (params: CreatePaymentParams): PaymentIntent => ({
  provider: 'payfast',
  mode: 'form',
  reference: `DEMO-${Date.now()}`,
  redirectUrl: '/demo/payment-simulator',
  fields: [['demo', 'true']],
});
```

**Demo Payment Simulator Page** (`/demo/payment-simulator`):
1. Shows payment summary
2. Buttons: "Complete Payment" / "Cancel Payment"
3. On complete: Calls internal API to mark contribution completed
4. Redirects to thank-you page

---

## PART 3: DEMO SCENARIOS

### Scenario A: Host Creates Dream Board

| Aspect | Details |
|--------|---------|
| Entry URL | `/create` |
| Demo Account | sarah@demo.chipin.co.za |
| Required State | Clean database (or reset) |
| Screens | Create → Magic Link (auto-bypassed) → Child Details → Gift Selection → Payout Details → Review → Dashboard |
| Expected Output | New Dream Board created, shareable link |
| Mocked | Magic link email, Takealot product fetch, Karri card verification, Image upload |
| Could Break | KV unavailable (mitigated by in-memory), DB connection |

**Flow:**
1. User enters email → Demo mode auto-creates session
2. Child details form → Image upload returns placeholder
3. Gift selection → Takealot search returns demo products
4. Payout details → Karri verification returns demo success
5. Review → Dream board created in DB
6. Dashboard → Shows new board with share link

### Scenario B: Guest Contributes

| Aspect | Details |
|--------|---------|
| Entry URL | `/emma-birthday-demo` |
| Demo Account | Anonymous guest |
| Required State | Seeded dream board exists |
| Screens | Dream Board View → Contribute → Payment Simulator → Thank You |
| Expected Output | Contribution recorded, progress bar updated |
| Mocked | Payment intent creation, webhook processing |
| Could Break | Board not found (seed issue), payment redirect |

**Flow:**
1. Guest opens dream board link
2. Clicks "Contribute now"
3. Selects amount, enters name (optional)
4. Clicks "Pay with PayFast"
5. Redirected to `/demo/payment-simulator`
6. Clicks "Complete Payment"
7. Contribution marked completed, redirects to thank-you

### Scenario C: Funding Completes

| Aspect | Details |
|--------|---------|
| Entry URL | `/emma-birthday-demo/contribute` |
| Demo Account | Demo Guest 3 (Morgan) |
| Required State | Board at 90% funded |
| Screens | Contribute → Payment Simulator → Thank You (with confetti) → Dream Board (overflow view) |
| Expected Output | Goal reached, status = funded, charity overflow visible |
| Mocked | Payment, automatic status update |
| Could Break | Fund detection logic, confetti trigger |

**Flow:**
1. Board is at R315/R350
2. Guest contributes R50
3. Payment completes
4. `markDreamBoardFundedIfNeeded()` triggers
5. Board status → "funded"
6. Dream board now shows charity overflow UI

### Scenario D: Full Journey Replay

| Aspect | Details |
|--------|---------|
| Entry URL | `/demo/reset` then `/create` |
| Demo Account | Sarah + Guests |
| Required State | Post-reset clean state |
| Screens | All screens in sequence |
| Expected Output | Complete flow from creation to payout |
| Mocked | All external services |
| Could Break | State inconsistency between steps |

**Flow:**
1. Hit `/demo/reset` to clear demo data
2. Sarah creates board (Scenario A)
3. Guest 1 contributes R150
4. Guest 2 contributes R150
5. Guest 3 contributes R50 (triggers funding)
6. Sarah views dashboard (board shows funded)
7. Admin triggers payout (mock completes)

---

## PART 4: IMPLEMENTATION PLAN

### Phase 4.1: Environment Setup

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Create `.env.demo` | `.env.demo` | 0.5h |
| Create `src/lib/demo/index.ts` | New file | 0.5h |
| **Implement Production DB Guard** | `src/lib/demo/index.ts` | 1h |
| Create `src/lib/demo/kv-mock.ts` | New file | 1h |
| Create `src/lib/demo/fixtures.ts` | New file | 2h |
| Update `src/lib/db/seed.ts` | Modify existing | 1h |

**Production DB Guard Implementation:**
- `src/lib/demo/index.ts` must export `assertNotProductionDb()`
- Called at startup when `DEMO_MODE=true`
- Checks `DATABASE_URL` for known production hostnames (e.g., `neon.tech` production projects)
- Throws fatal error if production DB detected
- Logged with clear message: `"FATAL: DEMO_MODE cannot run against production database"`

**Dependencies:** None
**Testing:** 
- Verify `isDemoMode()` returns correct value
- Verify startup fails if `DATABASE_URL` contains production identifier

### Phase 4.2: Auth Mocks

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Add demo bypass to magic link | `src/lib/auth/magic-link.ts` | 1h |
| Add demo session creation | `src/lib/auth/session.ts` | 1h |
| Add demo auto-login route | `src/app/api/demo/auto-login/route.ts` (new) | 1h |
| Update login page for demo | `src/app/(host)/create/page.tsx` | 0.5h |
| Update verify page for demo | `src/app/auth/verify/page.tsx` | 0.5h |

**Dependencies:** Phase 4.1
**Testing:** 
- Verify demo user can "log in" without real email
- Verify session persists across requests

### Phase 4.3: Payment Mocks

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Add demo check to `createPayfastPayment` | `src/lib/payments/payfast.ts` | 0.5h |
| Add demo check to `createOzowPayment` | `src/lib/payments/ozow.ts` | 0.5h |
| Add demo check to `createSnapScanPayment` | `src/lib/payments/snapscan.ts` | 0.5h |
| Add demo check to `createPaymentIntent` | `src/lib/payments/index.ts` | 0.5h |
| **Mock `validatePayfastItn`** | `src/lib/payments/payfast.ts` | 0.5h |
| **Short-circuit PayFast webhook** | `src/app/api/webhooks/payfast/route.ts` | 0.5h |
| **Short-circuit Ozow webhook** | `src/app/api/webhooks/ozow/route.ts` | 0.5h |
| **Short-circuit SnapScan webhook** | `src/app/api/webhooks/snapscan/route.ts` | 0.5h |
| Create payment simulator page | `src/app/demo/payment-simulator/page.tsx` (new) | 2h |
| Create demo payment complete API | `src/app/api/demo/payment-complete/route.ts` (new) | 1h |
| Mock reconciliation job | `src/lib/payments/reconciliation-job.ts` | 1h |

**Webhook Short-Circuit Implementation:**
All webhook routes must return HTTP 200 immediately in DEMO_MODE:
```typescript
// At the top of each webhook route.ts
if (isDemoMode()) {
  return NextResponse.json({ received: true, demo: true });
}
```
- No signature validation
- No outbound HTTP calls (including PayFast ITN validation)
- No DB mutations
- No side effects

**Dependencies:** Phase 4.1, 4.2
**Testing:**
- Verify payment flow redirects to simulator
- Verify contribution status updates correctly
- Verify reconciliation returns empty results
- Verify all webhook routes return 200 with no side effects in demo

### Phase 4.4: Commerce Mocks

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Add demo fixtures for Takealot products | `src/lib/demo/fixtures.ts` | 1h |
| Add demo check to `fetchTakealotProduct` | `src/lib/integrations/takealot.ts` | 0.5h |
| Add demo check to `fetchTakealotSearch` | `src/lib/integrations/takealot.ts` | 0.5h |
| Mock gift card issuance | `src/lib/integrations/takealot-gift-cards.ts` | 0.5h |
| Mock Karri verification | `src/lib/integrations/karri.ts` | 0.5h |
| Mock Karri top-up | `src/lib/integrations/karri.ts` | 0.5h |
| Mock GivenGain donation | `src/lib/integrations/givengain.ts` | 0.5h |

**Dependencies:** Phase 4.1
**Testing:**
- Verify product search returns demo products
- Verify product fetch returns demo data
- Verify payout automation returns mock success

### Phase 4.5: Seed Data

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Create demo seed script | `scripts/seed-demo.ts` (new) | 2h |
| Add Sarah host | Seed script | 0.5h |
| Add Emma dream board | Seed script | 0.5h |
| Add partial contributions | Seed script | 0.5h |
| Add demo partner | Seed script | 0.5h |
| Add demo API key | Seed script | 0.5h |

**Dependencies:** Phase 4.1
**Testing:**
- Run seed, verify data in DB
- Verify dream board accessible at `/emma-birthday-demo`

### Phase 4.6: Notification Mocks

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Add demo check to `sendEmail` | `src/lib/integrations/email.ts` | 0.5h |
| Disable outbound webhooks in demo | `src/lib/webhooks/dispatcher.ts` | 0.5h |

**Dependencies:** Phase 4.1
**Testing:**
- Verify no emails sent in demo
- Verify no webhook dispatches

### Phase 4.7: Infrastructure Mocks

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Create KV adapter factory | `src/lib/demo/kv-adapter.ts` (new) | 1h |
| Update all KV imports to use adapter | Multiple files (9 files) | 2h |
| Mock blob uploads | `src/lib/integrations/blob.ts` | 0.5h |

**Dependencies:** Phase 4.1
**Testing:**
- Verify sessions work with in-memory KV
- Verify image uploads return placeholder URLs

### Phase 4.8: Observability Disable

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Guard OTEL init | `src/instrumentation.ts` | 0.5h |
| Guard Sentry init | `sentry.*.config.ts` (3 files) | 0.5h |
| Guard Sentry captures | 5 files with `Sentry.capture*` | 1h |
| Disable web vitals | `src/lib/analytics/web-vitals.ts` | 0.5h |
| Disable custom metrics beacon | `src/lib/analytics/metrics.ts` | 0.5h |

**Dependencies:** Phase 4.1
**Testing:**
- Verify no network calls to Sentry
- Verify no OTEL traces exported
- Verify console still logs locally

### Phase 4.9: UI Polish

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Add demo mode banner | `src/app/layout.tsx` | 1h |
| Style payment simulator | `src/app/demo/payment-simulator/page.tsx` | 1h |
| Add demo reset button to UI | `src/components/layout/Header.tsx` | 0.5h |

**Dependencies:** Phase 4.3
**Testing:**
- Verify banner visible in demo mode
- Verify simulator looks professional

### Phase 4.10: Reset Mechanism

| Task | Files/Modules | Effort |
|------|---------------|--------|
| Create reset API | `src/app/api/demo/reset/route.ts` (new) | 1h |
| Create reset page | `src/app/demo/reset/page.tsx` (new) | 1h |
| Clear in-memory KV on reset | `src/lib/demo/kv-mock.ts` | 0.5h |
| Re-run demo seed on reset | Reset API | 0.5h |

**Dependencies:** Phase 4.5, 4.7
**Testing:**
- Hit reset, verify clean state
- Verify seed data repopulated

---

## Effort Summary

| Phase | Estimated Hours |
|-------|-----------------|
| 4.1 Environment Setup (incl. DB guard) | 6h |
| 4.2 Auth Mocks | 4h |
| 4.3 Payment Mocks (incl. webhook short-circuit) | 8h |
| 4.4 Commerce Mocks | 4h |
| 4.5 Seed Data | 4.5h |
| 4.6 Notification Mocks | 1h |
| 4.7 Infrastructure Mocks | 3.5h |
| 4.8 Observability Disable | 3h |
| 4.9 UI Polish | 2.5h |
| 4.10 Reset Mechanism | 3h |
| **TOTAL** | **39.5 hours** |

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/demo/index.ts` | `isDemoMode()` and exports |
| `src/lib/demo/kv-mock.ts` | In-memory KV adapter |
| `src/lib/demo/kv-adapter.ts` | KV factory (real vs mock) |
| `src/lib/demo/fixtures.ts` | Demo products, users, boards |
| `src/app/demo/payment-simulator/page.tsx` | Fake payment UI |
| `src/app/demo/reset/page.tsx` | Reset confirmation UI |
| `src/app/api/demo/auto-login/route.ts` | Auto-login for demo |
| `src/app/api/demo/payment-complete/route.ts` | Complete demo payment |
| `src/app/api/demo/reset/route.ts` | Reset demo data |
| `scripts/seed-demo.ts` | Demo-specific seed script |
| `.env.demo` | Demo environment variables |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/payments/payfast.ts` | Add `isDemoMode()` guard, mock `validatePayfastItn` |
| `src/lib/payments/ozow.ts` | Add `isDemoMode()` guard |
| `src/lib/payments/snapscan.ts` | Add `isDemoMode()` guard |
| `src/lib/payments/index.ts` | Add demo payment intent creation |
| `src/lib/payments/reconciliation-job.ts` | Return empty results in demo |
| `src/lib/integrations/takealot.ts` | Add `isDemoMode()` guard |
| `src/lib/integrations/takealot-gift-cards.ts` | Add `isDemoMode()` guard |
| `src/lib/integrations/karri.ts` | Add `isDemoMode()` guard |
| `src/lib/integrations/givengain.ts` | Add `isDemoMode()` guard |
| `src/lib/integrations/email.ts` | Add `isDemoMode()` guard |
| `src/lib/integrations/blob.ts` | Add `isDemoMode()` guard |
| `src/lib/auth/magic-link.ts` | Add demo bypass |
| `src/lib/auth/session.ts` | Use KV adapter |
| `src/lib/auth/rate-limit.ts` | Use KV adapter |
| `src/lib/api/rate-limit.ts` | Use KV adapter |
| `src/lib/dream-boards/cache.ts` | Use KV adapter |
| `src/lib/dream-boards/draft.ts` | Use KV adapter |
| `src/lib/webhooks/dispatcher.ts` | Add `isDemoMode()` guard |
| `src/instrumentation.ts` | Guard OTEL init |
| `sentry.client.config.ts` | Guard Sentry init |
| `sentry.server.config.ts` | Guard Sentry init |
| `sentry.edge.config.ts` | Guard Sentry init |
| `src/lib/analytics/metrics.ts` | No-op in demo |
| `src/lib/analytics/web-vitals.ts` | No-op in demo |
| `src/app/(host)/create/page.tsx` | Demo login bypass UI |
| `src/app/auth/verify/page.tsx` | Demo auto-verify |
| `src/app/layout.tsx` | Demo mode banner |
| `src/components/layout/Header.tsx` | Demo reset button |

---

## Constraints Checklist

- [x] No code written
- [x] No architecture refactoring
- [x] No DB schema changes
- [x] Production paths preserved
- [x] Existing patterns used (`SANDBOX`, `*_AUTOMATION_ENABLED`)

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| KV unavailable breaks demo | In-memory fallback |
| DB unavailable breaks demo | Require real DB (seeded) |
| PayFast ITN callback leaks | Mock `validatePayfastItn()` |
| Sentry pollutes prod dashboard | Guard all Sentry calls |
| OTEL traces to prod collector | Guard instrumentation init |
| Webhooks dispatch in demo | Guard dispatcher (true no-op) |
| Email sends in demo | Guard `sendEmail()` |
| Metrics beacon to prod | Guard `trackMetric()` |
| **Multiple gifts per board break product truth** | Enforce single-gift invariant in seed and UI |
| **Demo runs against prod DB** | Hard guard: `assertNotProductionDb()` aborts startup |
| **Webhooks fire during demo** | Short-circuit all `/api/webhooks/*` routes to HTTP 200 no-op |
| **Browser analytics leak demo data** | Disable all `NEXT_PUBLIC_*` analytics keys, guard client Sentry |
| **Blob mock breaks UI** | Preserve exact response shape (`url`, `filename`, metadata) |
| **Dispatcher triggers outbound calls** | Implement true no-op: no retries, no queue, no fetch |

---

## Success Criteria

1. `pnpm dev` with `.env.demo` → app runs with zero external calls
2. Full host journey completable without real email
3. Full guest journey completable without real payment
4. `/demo/reset` returns app to known state
5. No Sentry events, OTEL traces, or webhook calls in demo
6. All existing tests pass (no regressions)

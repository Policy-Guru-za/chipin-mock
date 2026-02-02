# Sandbox Mode: Granular Feature Flags Implementation

**Implementation Specification for AI Coding Agent**

Version: 1.0  
Date: February 2026  
Author: System Architect  
Status: APPROVED FOR IMPLEMENTATION

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Background & Motivation](#2-background--motivation)
3. [Current State Analysis](#3-current-state-analysis)
4. [Target State Architecture](#4-target-state-architecture)
5. [Implementation Phases](#5-implementation-phases)
6. [Phase 1: Create Feature Flags Module](#phase-1-create-feature-flags-module)
7. [Phase 2: Update Payment & Financial Mocking](#phase-2-update-payment--financial-mocking)
8. [Phase 3: Enable Production Integrations](#phase-3-enable-production-integrations)
9. [Phase 4: Update Authentication Flow](#phase-4-update-authentication-flow)
10. [Phase 5: Remove Demo-Only Routes & Components](#phase-5-remove-demo-only-routes--components)
11. [Phase 6: Update Environment Configuration](#phase-6-update-environment-configuration)
12. [Phase 7: Cleanup & Validation](#phase-7-cleanup--validation)
13. [Environment Variables Reference](#environment-variables-reference)
14. [Gate Criteria](#gate-criteria)
15. [Rollback Plan](#rollback-plan)

---

## 1. EXECUTIVE SUMMARY

### What We're Doing

Replacing the binary `DEMO_MODE` flag with granular feature flags to create a **production-grade application with mocked payments**.

### Why We're Doing It

The current `DEMO_MODE=true` setting creates an all-or-nothing situation:
- Everyone shares a single demo host account (Sarah)
- No real emails are sent
- No real WhatsApp notifications
- No real file uploads
- No real analytics

This prevents meaningful testing of the user journey. We need:
- Real user accounts (unique per email)
- Real email/WhatsApp notifications (to test templates and delivery)
- Real file storage (to test upload flows)
- But **mocked payments** (because payment providers aren't configured)

### Outcome

| Area | Before (DEMO_MODE=true) | After (Sandbox Mode) |
|------|------------------------|---------------------|
| Login | Shared "Sarah" account | Unique accounts via magic link |
| Email | Suppressed | Real via Resend |
| WhatsApp | Suppressed | Real via WhatsApp API |
| Blob Storage | Placeholder URLs | Real Vercel Blob |
| Analytics | Disabled | Real tracking |
| Partner Webhooks | Skipped | Real dispatch |
| **Payments** | **Mocked** | **Mocked** (unchanged) |
| **Karri Card** | **Mocked** | **Mocked** (unchanged) |
| **Sentry** | **Suppressed** | **Suppressed** (unchanged) |

---

## 2. BACKGROUND & MOTIVATION

### The Problem with Binary Demo Mode

The `isDemoMode()` function is called in 40+ locations across the codebase. When `DEMO_MODE=true`:

1. **Authentication is bypassed** - Everyone logs in as `sarah@demo.chipin.co.za`
2. **All external APIs are mocked** - No real integrations work
3. **All hosts share data** - No isolation between testers

This was appropriate for early development but now blocks:
- QA testing with real notifications
- Stakeholder demos with personalized accounts
- Integration testing of email/WhatsApp templates

### The Solution: Granular Flags

Instead of one boolean controlling everything, we introduce specific flags:

```
MOCK_PAYMENTS=true       → Only mock payment creation/webhooks
MOCK_KARRI=true          → Only mock Karri Card API
MOCK_SENTRY=true         → Only suppress Sentry
```

Everything else (email, WhatsApp, blob, analytics) runs in **production mode**.

---

## 3. CURRENT STATE ANALYSIS

### File: `src/lib/demo/index.ts`

```typescript
// Current implementation
export const isDemoMode = (): boolean =>
  isDemoModeEnabled(process.env.DEMO_MODE) ||
  isDemoModeEnabled(process.env.NEXT_PUBLIC_DEMO_MODE);
```

### Files Using `isDemoMode()`

| Category | Files | Count |
|----------|-------|-------|
| **Payments** | `lib/payments/index.ts`, `lib/payments/payfast.ts`, `lib/payments/ozow.ts`, `lib/payments/snapscan.ts`, `lib/payments/reconciliation-job.ts` | 5 |
| **Karri Card** | `lib/integrations/karri.ts` | 1 |
| **Payment Webhooks** | `app/api/webhooks/payfast/route.ts`, `app/api/webhooks/ozow/route.ts`, `app/api/webhooks/snapscan/route.ts` | 3 |
| **Email** | `lib/integrations/email.ts`, `lib/auth/magic-link.ts` | 2 |
| **WhatsApp** | `lib/integrations/whatsapp.ts` | 1 |
| **Blob Storage** | `lib/integrations/blob.ts` | 1 |
| **Analytics** | `lib/analytics/metrics.ts`, `lib/analytics/web-vitals.ts` | 2 |
| **Webhooks** | `lib/webhooks/dispatcher.ts` | 1 |
| **Sentry/Logging** | `lib/payouts/service.ts`, `lib/payouts/automation.ts`, `app/(host)/create/child/page.tsx`, `app/(host)/create/details/page.tsx` | 4 |
| **Auth/Demo** | `app/(host)/create/page.tsx`, `app/auth/verify/page.tsx`, `app/api/demo/auto-login/route.ts`, `app/api/demo/reset/route.ts`, `app/api/demo/payment-complete/route.ts` | 5 |
| **UI** | `app/layout.tsx`, `components/layout/Header.tsx`, `app/demo/reset/page.tsx`, `app/demo/payment-simulator/page.tsx` | 4 |
| **Infrastructure** | `lib/demo/kv-adapter.ts`, `lib/health/checks.ts`, `instrumentation.node.ts` | 3 |
| **Reconciliation** | `app/api/internal/payments/reconcile/route.ts` | 1 |

**Total: 33 files** need review and potential modification.

---

## 4. TARGET STATE ARCHITECTURE

### New Module: `src/lib/config/feature-flags.ts`

```typescript
/**
 * Granular feature flags for sandbox/production mode control.
 * 
 * MOCK_* flags control which integrations are simulated.
 * When a MOCK_* flag is NOT set (or false), the real integration is used.
 */

// Payment & Financial (keep mocked until providers configured)
export const isMockPayments = (): boolean => 
  process.env.MOCK_PAYMENTS === 'true';

export const isMockKarri = (): boolean => 
  process.env.MOCK_KARRI === 'true';

export const isMockPaymentWebhooks = (): boolean => 
  process.env.MOCK_PAYMENT_WEBHOOKS === 'true';

// Observability (keep mocked to avoid noise)
export const isMockSentry = (): boolean => 
  process.env.MOCK_SENTRY === 'true';

// Legacy compatibility - DEPRECATED, do not use in new code
// This always returns false; use specific mock flags instead
export const isDemoMode = (): boolean => false;

// Check if ANY mocking is enabled (for UI indicators)
export const isAnyMockEnabled = (): boolean =>
  isMockPayments() || isMockKarri() || isMockSentry();
```

### Flag Decision Matrix

| Integration | Flag | `true` Behavior | `false` Behavior |
|-------------|------|-----------------|------------------|
| PayFast/Ozow/SnapScan | `MOCK_PAYMENTS` | Return demo payment URLs | Call real APIs |
| Payment Webhooks | `MOCK_PAYMENT_WEBHOOKS` | Skip signature validation | Validate signatures |
| Karri Card | `MOCK_KARRI` | Return mock verification/topup | Call real Karri API |
| Sentry | `MOCK_SENTRY` | Suppress `captureException` | Report to Sentry |
| Email | *(none)* | - | Always use Resend |
| WhatsApp | *(none)* | - | Always use WhatsApp API |
| Blob Storage | *(none)* | - | Always use Vercel Blob |
| Analytics | *(none)* | - | Always track metrics |
| KV | *(none)* | - | Always use Vercel KV |

---

## 5. IMPLEMENTATION PHASES

### Phase Overview

| Phase | Description | Files Modified | Estimated Changes |
|-------|-------------|----------------|-------------------|
| 1 | Create feature flags module | 1 new file | ~30 lines |
| 2 | Update payment/financial mocking | 8 files | ~20 lines each |
| 3 | Enable production integrations | 10 files | ~5-10 lines each |
| 4 | Update authentication flow | 4 files | ~50 lines each |
| 5 | Remove demo-only routes | 5 files deleted | N/A |
| 6 | Update environment config | 2 files | ~20 lines |
| 7 | Cleanup & validation | Tests, lint | Varies |

### Gate Between Phases

After each phase:
1. Run `pnpm lint`
2. Run `pnpm typecheck`
3. Commit changes with descriptive message

---

## PHASE 1: CREATE FEATURE FLAGS MODULE

### Step 1.1: Create the Feature Flags File

**Create:** `src/lib/config/feature-flags.ts`

```typescript
/**
 * Feature Flags for Sandbox Mode
 * 
 * ChipIn uses granular feature flags to control which integrations are mocked.
 * This allows running a production-grade app with only payments simulated.
 * 
 * Environment Variables:
 * - MOCK_PAYMENTS=true      → Mock PayFast/Ozow/SnapScan payment creation
 * - MOCK_PAYMENT_WEBHOOKS=true → Skip webhook signature validation
 * - MOCK_KARRI=true         → Mock Karri Card verification and topup
 * - MOCK_SENTRY=true        → Suppress Sentry error reporting
 * 
 * When these flags are NOT set, real integrations are used.
 */

const isEnabled = (value: string | undefined): boolean => value === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT & FINANCIAL MOCKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * When true, payment creation returns mock/demo URLs instead of calling
 * PayFast, Ozow, or SnapScan APIs.
 */
export const isMockPayments = (): boolean => 
  isEnabled(process.env.MOCK_PAYMENTS);

/**
 * When true, payment webhook endpoints skip signature validation and
 * return success without processing.
 */
export const isMockPaymentWebhooks = (): boolean => 
  isEnabled(process.env.MOCK_PAYMENT_WEBHOOKS);

/**
 * When true, Karri Card verification always returns valid and topup
 * returns a mock transaction token.
 */
export const isMockKarri = (): boolean => 
  isEnabled(process.env.MOCK_KARRI);

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVABILITY MOCKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * When true, Sentry.captureException() calls are suppressed.
 * Useful to avoid polluting error tracking during testing.
 */
export const isMockSentry = (): boolean => 
  isEnabled(process.env.MOCK_SENTRY);

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if ANY mocking is enabled.
 * Useful for displaying sandbox indicators in the UI.
 */
export const isAnyMockEnabled = (): boolean =>
  isMockPayments() || isMockKarri() || isMockSentry();

/**
 * Returns true if payments are mocked.
 * Alias for isMockPayments() - used by payment simulator page guard.
 */
export const isPaymentSimulatorEnabled = (): boolean => isMockPayments();

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY (DEPRECATED)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use specific mock flags instead (isMockPayments, isMockKarri, etc.)
 * This function always returns false. Left for temporary compatibility.
 */
export const isDemoMode = (): boolean => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'isDemoMode() is deprecated. Use isMockPayments(), isMockKarri(), etc.'
    );
  }
  return false;
};
```

### Step 1.2: Update the Demo Index (Deprecation Notice)

**Modify:** `src/lib/demo/index.ts`

```typescript
/**
 * @deprecated This module is deprecated. Use '@/lib/config/feature-flags' instead.
 * 
 * Migration guide:
 * - isDemoMode() → Use specific flags: isMockPayments(), isMockKarri(), etc.
 * - DEMO_MODE constant → Remove usage, check specific flags instead
 */

import { 
  isDemoMode as newIsDemoMode,
  isMockPayments,
  isMockKarri,
  isMockSentry,
} from '@/lib/config/feature-flags';

// Re-export for backward compatibility during migration
export const isDemoMode = newIsDemoMode;
export { isMockPayments, isMockKarri, isMockSentry };

// DEMO_MODE constant - deprecated
export const DEMO_MODE: boolean = false;

// Keep assertNotProductionDb for safety - but it now checks mock flags
const PRODUCTION_DENYLIST = ['prod', 'production'];

const isProductionDatabaseUrl = (databaseUrl: string): boolean => {
  const normalized = databaseUrl.toLowerCase();
  return PRODUCTION_DENYLIST.some((token) => normalized.includes(token));
};

export function assertNotProductionDb(): void {
  // Only enforce when mocking is enabled
  if (!isMockPayments() && !isMockKarri()) return;

  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (!databaseUrl.trim()) {
    throw new Error(
      'FATAL: Mock mode requires DATABASE_URL to be set.'
    );
  }

  if (isProductionDatabaseUrl(databaseUrl)) {
    const message =
      'FATAL: Mock mode cannot run against a production database. Refusing to start.';
    console.error(message);
    throw new Error(message);
  }
}
```

### Step 1.3: Commit Phase 1

```bash
git add src/lib/config/feature-flags.ts src/lib/demo/index.ts
git commit -m "feat(config): add granular feature flags for sandbox mode

- Create feature-flags.ts with isMockPayments, isMockKarri, isMockSentry
- Deprecate isDemoMode() in favor of specific mock flags
- Update assertNotProductionDb to check mock flags instead of DEMO_MODE

This is Phase 1 of the sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## PHASE 2: UPDATE PAYMENT & FINANCIAL MOCKING

### Step 2.1: Update Payment Index

**Modify:** `src/lib/payments/index.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments } from '@/lib/config/feature-flags';
```

Find all occurrences of:
```typescript
if (isDemoMode()) {
```

Replace with:
```typescript
if (isMockPayments()) {
```

### Step 2.2: Update PayFast

**Modify:** `src/lib/payments/payfast.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments, isMockPaymentWebhooks } from '@/lib/config/feature-flags';
```

Find:
```typescript
if (isDemoMode()) {
  return true;
}
```

Replace with:
```typescript
if (isMockPaymentWebhooks()) {
  return true;
}
```

### Step 2.3: Update Ozow

**Modify:** `src/lib/payments/ozow.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments } from '@/lib/config/feature-flags';
```

Replace all `isDemoMode()` with `isMockPayments()`.

### Step 2.4: Update SnapScan

**Modify:** `src/lib/payments/snapscan.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments } from '@/lib/config/feature-flags';
```

Replace all `isDemoMode()` with `isMockPayments()`.

### Step 2.5: Update Payment Webhooks

**Modify:** `src/app/api/webhooks/payfast/route.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPaymentWebhooks } from '@/lib/config/feature-flags';
```

Find:
```typescript
if (isDemoMode()) {
  return NextResponse.json({ received: true, demo: true }, { status: 200 });
}
```

Replace with:
```typescript
if (isMockPaymentWebhooks()) {
  return NextResponse.json({ received: true, mocked: true }, { status: 200 });
}
```

**Repeat for:**
- `src/app/api/webhooks/ozow/route.ts`
- `src/app/api/webhooks/snapscan/route.ts`

### Step 2.6: Update Karri Card Integration

**Modify:** `src/lib/integrations/karri.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockKarri } from '@/lib/config/feature-flags';
```

Replace all `isDemoMode()` with `isMockKarri()`.

### Step 2.7: Update Reconciliation Job

**Modify:** `src/lib/payments/reconciliation-job.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments } from '@/lib/config/feature-flags';
```

Replace `isDemoMode()` with `isMockPayments()`.

### Step 2.8: Update Reconciliation API Route

**Modify:** `src/app/api/internal/payments/reconcile/route.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments } from '@/lib/config/feature-flags';
```

Replace `isDemoMode()` with `isMockPayments()`.

### Step 2.9: Commit Phase 2

```bash
git add -A
git commit -m "refactor(payments): use granular mock flags for payment mocking

- Replace isDemoMode() with isMockPayments() in payment providers
- Replace isDemoMode() with isMockPaymentWebhooks() in webhook routes
- Replace isDemoMode() with isMockKarri() in Karri integration
- Update reconciliation to use isMockPayments()

Phase 2 of sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## PHASE 3: ENABLE PRODUCTION INTEGRATIONS

These files currently suppress functionality when `isDemoMode()` is true. We remove those checks entirely so they always use real integrations.

### Step 3.1: Enable Real Email

**Modify:** `src/lib/integrations/email.ts`

Find and **DELETE** this block:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE** this block:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: email suppressed', { to: payload.to, subject: payload.subject });
  return;
}
```

The function should now always send real emails via Resend.

### Step 3.2: Enable Real WhatsApp

**Modify:** `src/lib/integrations/whatsapp.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE** the entire block:
```typescript
if (isDemoMode()) {
  log('info', 'whatsapp.demo_suppressed', {
    template: params.template,
    // ... rest of logging
  });
  return { success: true, messageId: 'demo-message-id' };
}
```

### Step 3.3: Enable Real Blob Storage

**Modify:** `src/lib/integrations/blob.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
import { DEMO_BLOB_PLACEHOLDER_URL } from '@/lib/demo/fixtures';
```

Find and **DELETE** both demo mode blocks:
```typescript
if (isDemoMode()) {
  return {
    url: DEMO_BLOB_PLACEHOLDER_URL,
    // ...
  };
}
```

And:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: blob delete suppressed', { url });
  return;
}
```

### Step 3.4: Enable Real Analytics

**Modify:** `src/lib/analytics/metrics.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE**:
```typescript
if (isDemoMode()) {
  return;
}
```

**Modify:** `src/lib/analytics/web-vitals.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE** all instances of:
```typescript
if (isDemoMode()) {
  return;
}
```

### Step 3.5: Enable Real Partner Webhooks

**Modify:** `src/lib/webhooks/dispatcher.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE** all blocks like:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: webhook event creation skipped');
  return null;
}
```

And:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: webhook queue processing skipped');
  return 0;
}
```

And:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: partner webhook dispatch skipped');
  return null;
}
```

### Step 3.6: Enable Real KV (Remove Fallback)

**Modify:** `src/lib/demo/kv-adapter.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
import { demoKv } from '@/lib/demo/kv-mock';
```

Find and **DELETE** the demo fallback block:
```typescript
// Fall back to in-memory mock for local development without KV
if (isDemoMode()) {
  return demoKv;
}
```

The file should now **always** require real Vercel KV. If KV is not configured, it should throw an error.

**Update the file to:**
```typescript
import { kv } from '@vercel/kv';

// Unified KV adapter - always uses real Vercel KV
// Requires KV_REST_API_URL and KV_REST_API_TOKEN environment variables
export const kvAdapter = kv;
```

### Step 3.7: Enable Instrumentation

**Modify:** `src/instrumentation.node.ts`

Find:
```typescript
import { assertNotProductionDb, isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { assertNotProductionDb } from '@/lib/demo';
```

Find and **DELETE**:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: instrumentation disabled');
  return;
}
```

Instrumentation should now always run.

### Step 3.8: Update Health Checks

**Modify:** `src/lib/health/checks.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

**DELETE** this import.

Find and **DELETE**:
```typescript
if (isDemoMode()) {
  return { ok: true, detail: 'demo' };
}
```

Health checks should now always check real KV.

### Step 3.9: Update Sentry Suppression

**Modify:** `src/lib/payouts/service.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockSentry } from '@/lib/config/feature-flags';
```

Find:
```typescript
if (!isDemoMode()) {
  Sentry.captureException(error);
}
```

Replace with:
```typescript
if (!isMockSentry()) {
  Sentry.captureException(error);
}
```

**Repeat for:**
- `src/lib/payouts/automation.ts`
- `src/app/(host)/create/child/page.tsx`
- `src/app/(host)/create/details/page.tsx`
- `src/lib/auth/magic-link.ts`

### Step 3.10: Commit Phase 3

```bash
git add -A
git commit -m "feat(integrations): enable production integrations in sandbox mode

- Remove demo mode checks from email.ts - always send real emails
- Remove demo mode checks from whatsapp.ts - always send real notifications
- Remove demo mode checks from blob.ts - always use real storage
- Remove demo mode checks from analytics - always track metrics
- Remove demo mode checks from webhooks/dispatcher - always dispatch
- Remove KV fallback - always require real Vercel KV
- Enable instrumentation in all modes
- Update Sentry suppression to use isMockSentry() flag

Phase 3 of sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## PHASE 4: UPDATE AUTHENTICATION FLOW

### Step 4.1: Update Create Page (Remove Demo Login)

**Modify:** `src/app/(host)/create/page.tsx`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE** the entire `DemoLoginView` component:
```typescript
const DemoLoginView = () => (
  <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Demo access</CardTitle>
        <CardDescription>Skip the email step and jump straight in.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/api/demo/auto-login">Enter Demo as Sarah</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);
```

Find and **DELETE** in the page component:
```typescript
if (isDemoMode()) {
  return <DemoLoginView />;
}
```

The page should now always show the magic link form.

Also remove the unused `Link` import if no longer needed.

### Step 4.2: Update Auth Verify Page

**Modify:** `src/app/auth/verify/page.tsx`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Find and **DELETE** the demo bypass block:
```typescript
if (isDemoMode()) {
  const host = await ensureHostForEmail(DEMO_EMAIL);
  await createSession(host.id, host.email);
  redirect('/create/child');
}
```

Also **DELETE** the `DEMO_EMAIL` constant if it exists:
```typescript
const DEMO_EMAIL = 'sarah@demo.chipin.co.za';
```

The page should now always verify the real magic link token.

### Step 4.3: Update Magic Link (Remove Demo Bypass)

**Modify:** `src/lib/auth/magic-link.ts`

Find and **DELETE**:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Wait - we need to keep isMockSentry for Sentry suppression. Update the import:
```typescript
import { isMockSentry } from '@/lib/config/feature-flags';
```

Find and **DELETE** the demo bypass in `sendMagicLink`:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: magic link bypassed');
  return { ok: true } as const;
}
```

Find and **DELETE** the demo bypass in `verifyMagicLink`:
```typescript
if (isDemoMode()) {
  console.log('DEMO_MODE: magic link verification bypassed');
  return DEMO_EMAIL;
}
```

Also delete `DEMO_EMAIL` constant if present.

Update Sentry checks from `isDemoMode()` to `isMockSentry()`.

### Step 4.4: Commit Phase 4

```bash
git add -A
git commit -m "feat(auth): remove demo login, require magic link for all users

- Remove DemoLoginView component from create page
- Remove demo bypass from auth verify page
- Remove demo bypass from magic-link.ts
- Users must now use real email magic link to authenticate

Phase 4 of sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## PHASE 5: REMOVE DEMO-ONLY ROUTES & COMPONENTS

### Step 5.1: Delete Demo Auto-Login Route

**DELETE:** `src/app/api/demo/auto-login/route.ts`

### Step 5.2: Delete Demo Reset Route

**DELETE:** `src/app/api/demo/reset/route.ts`

### Step 5.3: Delete Demo Reset Page

**DELETE:** `src/app/demo/reset/page.tsx`
**DELETE:** `src/app/demo/reset/ResetClient.tsx`
**DELETE:** `src/app/demo/reset/` (entire directory)

### Step 5.4: Update Payment Simulator Page Guard

**Modify:** `src/app/demo/payment-simulator/page.tsx`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isPaymentSimulatorEnabled } from '@/lib/config/feature-flags';
```

Find:
```typescript
if (!isDemoMode()) {
  notFound();
}
```

Replace with:
```typescript
if (!isPaymentSimulatorEnabled()) {
  notFound();
}
```

### Step 5.5: Update Payment Complete Route

**Modify:** `src/app/api/demo/payment-complete/route.ts`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isMockPayments } from '@/lib/config/feature-flags';
```

Find:
```typescript
if (!isDemoMode()) {
  return NextResponse.json({ error: 'not_found' }, { status: 404 });
}
```

Replace with:
```typescript
if (!isMockPayments()) {
  return NextResponse.json({ error: 'not_found' }, { status: 404 });
}
```

### Step 5.6: Update Layout (Remove Demo Banner)

**Modify:** `src/app/layout.tsx`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

Replace with:
```typescript
import { isAnyMockEnabled } from '@/lib/config/feature-flags';
```

Find:
```typescript
{isDemoMode() ? (
  <div className="border-b border-border bg-accent/10 px-4 py-2 text-center text-xs font-semibold text-text">
    DEMO MODE — no real payments or external services
  </div>
) : null}
```

Replace with:
```typescript
{isAnyMockEnabled() ? (
  <div className="border-b border-border bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800">
    SANDBOX MODE — payments are simulated
  </div>
) : null}
```

### Step 5.7: Update Header (Remove Demo Reset Link)

**Modify:** `src/components/layout/Header.tsx`

Find:
```typescript
import { isDemoMode } from '@/lib/demo';
```

**DELETE** this import.

Find:
```typescript
const showDemoReset = isDemoMode();
```

**DELETE** this line.

Find and **DELETE** any JSX that conditionally renders based on `showDemoReset`:
```typescript
{showDemoReset && (
  <Link href="/demo/reset" className={navLinkClasses}>
    Reset Demo
  </Link>
)}
```

### Step 5.8: Delete Demo Seed File

**DELETE:** `src/lib/db/seed-demo.ts`

Note: Also update any imports of `DEMO_SEEDED_BOARD_SLUG` if used elsewhere.

### Step 5.9: Commit Phase 5

```bash
git add -A
git commit -m "refactor(demo): remove demo-only routes and components

- Delete /api/demo/auto-login route
- Delete /api/demo/reset route  
- Delete /demo/reset page and components
- Delete seed-demo.ts
- Update payment simulator to use isPaymentSimulatorEnabled()
- Update layout banner to show 'SANDBOX MODE' when mocking enabled
- Remove demo reset link from header

Phase 5 of sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## PHASE 6: UPDATE ENVIRONMENT CONFIGURATION

### Step 6.1: Update .env.example

**Modify:** `.env.example`

Add new section and update existing:

```bash
# ─────────────────────────────────────────────────────────────────────────────
# SANDBOX MODE FLAGS
# Set these to 'true' to mock specific integrations
# ─────────────────────────────────────────────────────────────────────────────

# Payment providers (PayFast, Ozow, SnapScan)
# When true: Returns mock payment URLs, enables payment simulator
# When false/unset: Requires real payment provider credentials
MOCK_PAYMENTS=true

# Payment webhook validation
# When true: Webhooks skip signature validation
# When false/unset: Webhooks require valid signatures
MOCK_PAYMENT_WEBHOOKS=true

# Karri Card API
# When true: Card verification always succeeds, topup returns mock token
# When false/unset: Requires real Karri API credentials
MOCK_KARRI=true

# Sentry error reporting
# When true: Errors not sent to Sentry
# When false/unset: Errors reported to Sentry
MOCK_SENTRY=true

# ─────────────────────────────────────────────────────────────────────────────
# DEPRECATED - DO NOT USE
# ─────────────────────────────────────────────────────────────────────────────
# DEMO_MODE - Replaced by granular MOCK_* flags above
# NEXT_PUBLIC_DEMO_MODE - Replaced by granular MOCK_* flags above
```

### Step 6.2: Create Documentation

**Create:** `docs/SANDBOX_MODE.md`

```markdown
# Sandbox Mode

ChipIn supports a **sandbox mode** for testing with mocked payments while using real integrations for everything else.

## Overview

Unlike the old binary "demo mode", sandbox mode uses granular feature flags:

| Flag | Purpose |
|------|---------|
| `MOCK_PAYMENTS=true` | Mock payment creation (PayFast/Ozow/SnapScan) |
| `MOCK_PAYMENT_WEBHOOKS=true` | Skip webhook signature validation |
| `MOCK_KARRI=true` | Mock Karri Card verification and topup |
| `MOCK_SENTRY=true` | Suppress Sentry error reporting |

## What's Real vs Mocked

### Always Real (Production Behavior)
- User authentication (magic link emails)
- Email notifications (via Resend)
- WhatsApp notifications (via WhatsApp Business API)
- File uploads (via Vercel Blob)
- Analytics tracking
- Partner webhook dispatch
- Payment reconciliation jobs

### Mocked When Flags Set
- Payment creation → Returns simulator URL
- Payment webhooks → Bypass validation
- Karri Card API → Always succeeds
- Sentry → Errors suppressed

## Required Environment Variables

For sandbox mode to work, you need:

```bash
# Email (required)
RESEND_API_KEY=re_xxxxx

# Database (required)
DATABASE_URL=postgresql://...

# KV Storage (required)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=xxxxx

# Blob Storage (required)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# WhatsApp (required for notifications)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=xxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxx

# Mock flags
MOCK_PAYMENTS=true
MOCK_PAYMENT_WEBHOOKS=true
MOCK_KARRI=true
MOCK_SENTRY=true
```

## Testing Payments

When `MOCK_PAYMENTS=true`, the contribution flow redirects to `/demo/payment-simulator` instead of a real payment provider. Complete the simulated payment there.

## Transitioning to Production

To enable real payments:

1. Configure payment provider credentials (PayFast, Ozow, SnapScan)
2. Configure Karri Card API credentials
3. Remove or set to `false` the mock flags:
   ```bash
   MOCK_PAYMENTS=false
   MOCK_PAYMENT_WEBHOOKS=false
   MOCK_KARRI=false
   MOCK_SENTRY=false
   ```
4. Redeploy
```

### Step 6.3: Commit Phase 6

```bash
git add -A
git commit -m "docs(config): update environment configuration for sandbox mode

- Update .env.example with MOCK_* flags
- Add SANDBOX_MODE.md documentation
- Deprecate DEMO_MODE variables

Phase 6 of sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## PHASE 7: CLEANUP & VALIDATION

### Step 7.1: Search for Remaining isDemoMode Usage

Run:
```bash
grep -r "isDemoMode" src/ --include="*.ts" --include="*.tsx"
```

Any remaining occurrences should be:
1. The deprecated export in `src/lib/demo/index.ts`
2. The implementation in `src/lib/config/feature-flags.ts`

If found elsewhere, update to use appropriate mock flag.

### Step 7.2: Search for Remaining DEMO_MODE References

Run:
```bash
grep -r "DEMO_MODE" src/ --include="*.ts" --include="*.tsx"
```

Should only appear in deprecation comments.

### Step 7.3: Delete Unused Demo Fixtures

Check if `src/lib/demo/fixtures.ts` is still used. If not, delete it.

Check if `src/lib/demo/kv-mock.ts` is still used. If not, delete it.

Check if `src/lib/demo/tokens.ts` is still used (by Karri mock). Keep if needed.

### Step 7.4: Run Lint and Typecheck

```bash
pnpm lint
pnpm typecheck
```

Fix any errors.

### Step 7.5: Update Tests

Search for tests that mock `isDemoMode`:
```bash
grep -r "isDemoMode" tests/
```

Update to mock specific flags instead.

### Step 7.6: Final Commit

```bash
git add -A
git commit -m "chore: cleanup deprecated demo mode references

- Remove unused demo fixtures
- Update tests to use mock flags
- Final cleanup of sandbox mode implementation

Phase 7 (final) of sandbox mode implementation.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## ENVIRONMENT VARIABLES REFERENCE

### Required for Sandbox Mode

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `RESEND_API_KEY` | Resend API key for emails | `re_123abc...` |
| `KV_REST_API_URL` | Vercel KV REST URL | `https://xyz.kv.vercel-storage.com` |
| `KV_REST_API_TOKEN` | Vercel KV token | `AaB1Cc2...` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | `vercel_blob_...` |
| `MOCK_PAYMENTS` | Mock payment providers | `true` |
| `MOCK_PAYMENT_WEBHOOKS` | Skip webhook validation | `true` |
| `MOCK_KARRI` | Mock Karri Card API | `true` |
| `MOCK_SENTRY` | Suppress Sentry | `true` |

### Optional (for WhatsApp)

| Variable | Description |
|----------|-------------|
| `WHATSAPP_API_URL` | WhatsApp Business API URL |
| `WHATSAPP_API_TOKEN` | WhatsApp API token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID |

---

## GATE CRITERIA

Before considering implementation complete:

- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm test` passes (update tests as needed)
- [ ] Magic link login sends real email
- [ ] Child photo uploads to real Vercel Blob
- [ ] Contribution flow shows payment simulator
- [ ] Payment simulator completes contribution
- [ ] No `isDemoMode()` calls remain (except deprecated exports)
- [ ] Banner shows "SANDBOX MODE" when mock flags set

---

## ROLLBACK PLAN

If issues arise, revert to previous behavior:

1. Set `DEMO_MODE=true` in environment
2. The deprecated `isDemoMode()` in `feature-flags.ts` returns `false`, but...
3. Original files still exist in git history

For full rollback:
```bash
git revert HEAD~7..HEAD  # Revert all 7 phase commits
```

---

## APPENDIX: FILE CHANGE SUMMARY

### New Files
- `src/lib/config/feature-flags.ts`
- `docs/SANDBOX_MODE.md`

### Modified Files
- `src/lib/demo/index.ts`
- `src/lib/payments/index.ts`
- `src/lib/payments/payfast.ts`
- `src/lib/payments/ozow.ts`
- `src/lib/payments/snapscan.ts`
- `src/lib/payments/reconciliation-job.ts`
- `src/lib/integrations/karri.ts`
- `src/lib/integrations/email.ts`
- `src/lib/integrations/whatsapp.ts`
- `src/lib/integrations/blob.ts`
- `src/lib/analytics/metrics.ts`
- `src/lib/analytics/web-vitals.ts`
- `src/lib/webhooks/dispatcher.ts`
- `src/lib/demo/kv-adapter.ts`
- `src/lib/health/checks.ts`
- `src/lib/payouts/service.ts`
- `src/lib/payouts/automation.ts`
- `src/lib/auth/magic-link.ts`
- `src/app/(host)/create/page.tsx`
- `src/app/(host)/create/child/page.tsx`
- `src/app/(host)/create/details/page.tsx`
- `src/app/auth/verify/page.tsx`
- `src/app/api/webhooks/payfast/route.ts`
- `src/app/api/webhooks/ozow/route.ts`
- `src/app/api/webhooks/snapscan/route.ts`
- `src/app/api/internal/payments/reconcile/route.ts`
- `src/app/api/demo/payment-complete/route.ts`
- `src/app/demo/payment-simulator/page.tsx`
- `src/app/layout.tsx`
- `src/components/layout/Header.tsx`
- `src/instrumentation.node.ts`
- `.env.example`

### Deleted Files
- `src/app/api/demo/auto-login/route.ts`
- `src/app/api/demo/reset/route.ts`
- `src/app/demo/reset/page.tsx`
- `src/app/demo/reset/ResetClient.tsx`
- `src/lib/db/seed-demo.ts`
- `src/lib/demo/fixtures.ts` (if unused)
- `src/lib/demo/kv-mock.ts` (if unused)

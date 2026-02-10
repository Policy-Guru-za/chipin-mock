# C3 — Contributor Journey Completion

## Objective

Split the monolithic contribute form into a proper two-step flow
(amount/details → payment), add the remind-me UX touchpoint, add
anonymous & birthday-message features, and wire the sessionStorage
write path for payment failure recovery.

---

## Context & Constraints

- Read these docs in order **before coding**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
     (C3 section)
  4. `docs/implementation-docs/GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md`
     (contribution page row)
  5. `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md`
  6. `docs/UX/ui-specs/10-CONTRIBUTE-AMOUNT-DETAILS.md`
  7. `docs/UX/ui-specs/11-CONTRIBUTE-PAYMENT.md`
  8. `docs/napkin/napkin.md` (all learnings)
- Gate commands: `pnpm lint && pnpm typecheck && pnpm test`
- All gates **must pass** before marking C3 complete.
- Do NOT proceed to C4.
- Do NOT modify Phase B backend APIs, DB schema, or webhook
  handlers.
- Do NOT change fee calculation logic (`src/lib/payments/fees.ts`).
- Do NOT modify the existing reminder API route
  (`/api/internal/contributions/reminders/route.ts`) — call it
  as-is from the new UX.
- Preserve all existing payment integration patterns (PayFast form
  submit, Ozow redirect, SnapScan QR + polling).
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF**.
- Respect `prefers-reduced-motion` for all animations.

---

## Current State

The contribute page at `src/app/(guest)/[slug]/contribute/page.tsx`
is a **single route** that combines amount selection, payment method
selection, contributor fields, payment summary, and payment
submission into one monolithic form via `ContributionForm.tsx`
(~354 lines).

**Missing from spec:**
- No anonymous checkbox (anonymous is implicit from empty name)
- No collapsible birthday message textarea with 500-char counter
- No social proof section ("Most people chip in R250 💝")
- No reminder link / email capture modal
- No two-step flow (no separate `/contribute/payment` page)
- Preset amounts are R100/R200/R500 — spec says R150/R250⭐/R500
- No sessionStorage write path for payment failure recovery
- Fee label says "ChipIn fee" — should be "Gifta fee"
- Metadata fallback says "ChipIn" — should be "Gifta"

---

## Build Sub-steps (execute in order)

### Sub-step 1: Contribute Flow Storage Bridge

Create `src/lib/contributions/flow-storage.ts`:

```typescript
// Session storage bridge between step 1 (details) and step 2 (payment)

export interface ContributeFlowData {
  amountCents: number;
  contributorName: string;
  isAnonymous: boolean;
  message: string;
  slug: string;
  childName: string;
  dreamBoardId: string;
  timestamp: number;
}

const FLOW_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getStorageKey(slug: string): string {
  return `gifta_contribute_${slug}`;
}

export function saveFlowData(data: ContributeFlowData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      getStorageKey(data.slug),
      JSON.stringify(data)
    );
  } catch {
    // sessionStorage may be unavailable
  }
}

export function getFlowData(slug: string): ContributeFlowData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(getStorageKey(slug));
    if (!raw) return null;
    const data = JSON.parse(raw) as ContributeFlowData;
    if (Date.now() - data.timestamp > FLOW_TTL_MS) {
      sessionStorage.removeItem(getStorageKey(slug));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearFlowData(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(getStorageKey(slug));
  } catch {
    // ignore
  }
}
```

Also update `src/lib/payments/recovery.ts` to add the **write
path** that C2 deferred. Add `savePaymentAttemptData(slug, data)`
which saves `{ amountCents, paymentProvider, timestamp }` to
sessionStorage key `gifta_payment_failed_${slug}` with the same
30-minute TTL that `getPaymentAttemptData` already respects. If
`savePaymentAttemptData` already exists, verify it matches this
contract.

---

### Sub-step 2: Restructure Amount & Details Page

**Route:** `/(guest)/[slug]/contribute/page.tsx`

**Server component** (`page.tsx`) stays as the entry point. It:
- Fetches board via `getCachedDreamBoardBySlug`
- Builds `ContributionViewModel`
- Checks closed/expired state (show StateCard if closed)
- Passes props to a **new** client component

Create `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx`
(`'use client'`):

#### 2a — Header / Breadcrumb
- Back button: `"← Back"` (Outfit 14px, sage `#6B9E88`),
  navigates to `/${slug}`
- Heading: `"Chip in for {childName}"` (Fraunces 24px, 700 weight)

#### 2b — Social Proof Section
- Text: `"Most people chip in R250 💝"` (Outfit 16px, 600 weight,
  text-gray-700)
- Background: subtle `#FDF8F3`, centered, 24px padding
- Informational only (not a form field)

#### 2c — Amount Selector (upgrade existing)
- Preset amounts: **R150, R250⭐, R500** (cents: 15000, 25000,
  50000) — replaces current R100/R200/R500
- R250 is **pre-selected** by default (marked with ⭐)
- Layout: **2x2 grid** on mobile, **4 columns** on desktop
  (R150, R250, R500, Other)
- "Other" button: when clicked, reveals custom amount input below
  the grid
- Custom input: `inputMode="numeric"`, placeholder "Enter amount
  (R20 - R10,000)", validates R20–R10,000
- Button styling (unselected): white bg, 1px gray-200 border,
  Fraunces 18px 700, rounded-lg, min-height 64px
- Button styling (selected): bg `#E8F5F0`, 2px teal `#0D9488`
  border, teal text

#### 2d — Name Input
- Label: `"YOUR NAME (as it will appear)"` (Outfit 12px, 700,
  uppercase, text-gray-500)
- Input: `type="text"`, placeholder `"The Mason Family"`,
  max 50 chars, Outfit 16px
- Conditionally **hidden** when anonymous is checked (fade out +
  slide up, 0.2s ease-out)
- When revealed: slide down + fade in, auto-focus input

#### 2e — Anonymous Checkbox
- Label: `"Keep my name private (Anonymous)"` (Outfit 14px)
- Checkbox: 20×20px, sage `#6B9E88` when checked
- When checked: hide name input, clear name from form data
- When unchecked: show name input, restore previous name if any
- `aria-label="Keep my name private"`,
  `aria-checked="true|false"`

#### 2f — Birthday Message Section (collapsible)
- **Collapsed state:** Link `"ADD A BIRTHDAY MESSAGE 🎂"`
  (Outfit 12px, uppercase, sage text)
- **Expanded state:** Textarea, placeholder
  `"Write a message for {childName}! (e.g., 'Dear Emma, we're so
  excited for your birthday...')"`, max 500 chars, 120px height
  (grows to 200px max)
- **Character counter:** Right-aligned below textarea,
  `"{current}/500"` (Outfit 12px, text-gray-500)
  - 400+ chars: orange-600
  - 490+ chars: red-600 + "You have {X} characters left"
- Hard limit: prevent typing beyond 500
- Collapse trigger: optional "↑ Collapse" link

#### 2g — Reminder Link
- Text: `"Remind me in 3 days 🔔"` (Outfit 12px, sage `#6B9E88`,
  underline on hover)
- Position: below message section
- Action: opens ReminderModal (see sub-step 4)

#### 2h — Primary CTA
- Text: `"Continue to payment →"` (Outfit 16px, 600 weight, white)
- Style: Sage filled button (`#6B9E88`), rounded-lg, full-width
  mobile / 60% max 400px desktop
- Hover: `#5A8E78`, Active: `#4A7E68`
- Disabled: opacity-50 + cursor-not-allowed if validation fails
- Loading: spinner + "Processing..."
- **On click:**
  1. Validate: amount in range, name required if not anonymous
     (2-50 chars)
  2. Save to sessionStorage via `saveFlowData()`
  3. Navigate to `/${slug}/contribute/payment`

#### 2i — Trust Badge
- Text: `"🔒 Payments secured by PayFast"` (Outfit 12px,
  text-gray-500)
- Centered below CTA

#### 2j — Metadata Branding
- Change fallback title from `'Contribute | ChipIn'` to
  `'Contribute | Gifta'`

---

### Sub-step 3: New Payment Page

**Route:** `/(guest)/[slug]/contribute/payment/page.tsx`

This is a **new route**. Create:
- `src/app/(guest)/[slug]/contribute/payment/page.tsx`
  (server component)
- `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx`
  (`'use client'`)

#### Server component (`page.tsx`):
- Fetch board via `getCachedDreamBoardBySlug`
- Check board status (notFound if missing, closed StateCard if
  closed/expired)
- Pass board data to `PaymentClient`
- Metadata: title `"Complete Payment | Gifta"`,
  description `"Complete your contribution to {childName}'s
  Dreamboard"`

#### Client component (`PaymentClient.tsx`):

On mount:
- Read `getFlowData(slug)`. If null or expired, redirect to
  `/${slug}/contribute` (user lost session data)
- Extract `amountCents`, `contributorName`, `isAnonymous`,
  `message`, `childName`, `dreamBoardId` from flow data

##### 3a — Header
- Heading: `"Complete your contribution"` (Fraunces 24px, 700)

##### 3b — Contribution Summary
- Text: `"Contributing R{amount} to {childName}'s Dreamboard"`
  (Outfit 16px, text-gray-600, 500 weight)
- Amount in bold emphasis

##### 3c — Payment Method Selector
- Label: `"HOW WOULD YOU LIKE TO PAY?"` (Outfit 12px, uppercase,
  gray)
- Layout: Card-based toggle buttons (2 columns on mobile, side by
  side on desktop)
- Cards match UX spec 11 section 3.3:
  - **Unselected:** white bg, 1px gray-200 border, rounded-lg,
    20px padding, min-height 140px (mobile) / 160px (desktop)
  - **Selected:** bg `#E8F5F0`, 2px teal `#0D9488` border,
    ✓ top-right
- Card content:
  - Credit/Debit Card (PayFast): 💳 icon, "Credit or Debit Card",
    "Visa, Mastercard, Amex", "Processing with PayFast"
  - SnapScan: 📱 icon, "SnapScan", "Scan a QR code with your
    banking app"
  - Ozow (if available): separate card, "Instant EFT",
    "Pay via Ozow bank transfer"
- **Card pre-selected** by default (highest conversion)
- Render only providers present in `availableProviders`

##### 3d — Payment Summary
- Reuse/adapt the existing `PaymentSummary` from
  `ContributionFormParts.tsx`
- Display: Contribution amount, Gifta fee (3%), Total
- **Change label** from `"ChipIn fee (3%)"` to
  `"Gifta fee (3%)"`

##### 3e — Primary CTA
- Text: `"Pay R{totalAmount} →"` (shows total including fee)
- Style: Sage filled, same as step 1 CTA
- **On click:**
  1. POST to `/api/internal/contributions/create` with:
     `{ dreamBoardId, contributionCents: amountCents,
     contributorName, message, paymentProvider }`
     (same API contract as current implementation)
  2. Handle response:
     - `mode: 'form'` → save payment attempt via
       `savePaymentAttemptData(slug, { amountCents, paymentProvider,
       timestamp })`, then submit PayFast form (existing pattern)
     - `mode: 'redirect'` → save payment attempt, then
       `window.location.assign(redirectUrl)` (Ozow)
     - `mode: 'qr'` → show SnapScan panel (existing pattern)
  3. On success redirect, also clear flow data via
     `clearFlowData(slug)`

##### 3f — SnapScan Panel
- Relocate the existing `SnapScanPanel` from
  `ContributionFormParts.tsx` — same logic, same styling
- QR display, reference copy, polling, fallback to card

##### 3g — Trust Badge
- Same as step 1: "🔒 Payments secured by PayFast"

##### 3h — Back Link
- Text: `"← Back to details"` — navigates to `/${slug}/contribute`
- Preserves sessionStorage (don't clear)

---

### Sub-step 4: Reminder Modal

Create `src/components/contribute/ReminderModal.tsx`
(`'use client'`):

```typescript
interface ReminderModalProps {
  dreamBoardId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**UI:**
- Overlay: fixed, centered, backdrop rgba(0,0,0,0.5)
- Card: white, rounded-2xl, shadow-lifted, max-width 400px
  (mobile) / 500px (desktop), padding 24px
- Title: `"Get a reminder 🔔"` (Fraunces 20px, text-gray-900)
- Description: `"We'll send you a reminder in 3 days so you can
  check on the progress."` (Outfit 14px, text-gray-600)
- Email input: required, validated (standard email regex),
  placeholder `"Your email address"`, Outfit 14px
- Submit button: `"Send Reminder"` (Sage filled button)
- Close: X button (top-right), backdrop click, Esc key
- Focus trap: tab cycles within modal while open
- `aria-modal="true"`, `role="dialog"`,
  `aria-labelledby="reminder-modal-title"`

**Behavior:**
- On submit: `POST /api/internal/contributions/reminders` with:
  ```json
  {
    "dreamBoardId": "{id}",
    "email": "{input}",
    "remindInDays": 3
  }
  ```
- Loading state: spinner + disable button
- **Success:** Close modal, show toast `"Reminder set! Check your
  email."` (auto-dismiss 3s)
- **Error:** Inline error below email input,
  `"Something went wrong. Please try again."`
- **Duplicate:** API returns 200 (idempotent) — treat as success
- **Validation error:** Show `"Please enter a valid email address"`
  below input

---

### Sub-step 5: Clean Up Legacy ContributionForm

After the new two-step flow is in place:

1. The original `ContributionForm.tsx` should be **refactored** to
   remove payment-related logic (it now only exists in the payment
   page). If the original component is no longer used anywhere,
   remove it and extract any shared utilities into their own files.

2. `ContributionFormParts.tsx` — keep shared parts
   (`AmountSelector`, `PaymentSummary`, `SnapScanPanel`) but
   relocate provider selection + payment actions to the payment
   page. Update the `PaymentSummary` label:
   `"ChipIn fee (3%)"` → `"Gifta fee (3%)"`

3. Remove the `ContributorFields` component from
   `ContributionFormParts.tsx` if it's replaced by the new
   name/anonymous/message components in the details page.

4. Update any imports across the codebase that referenced the old
   component locations.

---

### Sub-step 6: Tests

Create these test files:

**`tests/unit/contribute-flow-storage.test.ts`** (~10 tests):
- `saveFlowData` + `getFlowData` round-trip
- Expired data returns null and is cleaned up
- SSR safety (window undefined returns null)
- `clearFlowData` removes entry
- Invalid JSON returns null

**`tests/unit/contribute-details.test.ts`** (~12 tests):
- Amount selector: R150/R250/R500 presets render, R250 default
  selected
- Custom amount validates R20–R10,000 range
- Anonymous checkbox hides name field
- Unchecking anonymous restores previous name
- Birthday message textarea has 500 char limit
- Character counter displays correctly and changes color at 400+
  and 490+
- "Continue to payment" disabled when no amount selected
- "Continue to payment" disabled when name empty and not anonymous
- Social proof text renders
- Back button navigates to Dreamboard

**`tests/unit/contribute-payment.test.ts`** (~10 tests):
- Redirects to details page when no flow data in sessionStorage
- Displays correct contribution summary from flow data
- Payment method cards render for available providers
- Card pre-selected by default
- "Pay R{amount}" shows correct total with fee
- Submits correct payload to `/api/internal/contributions/create`
- Saves payment attempt data before redirect
- Clears flow data on successful payment initiation
- Back link navigates to contribute details

**`tests/unit/reminder-modal.test.ts`** (~8 tests):
- Modal renders when isOpen=true
- Email input validates format
- Submit sends POST to reminders API
- Success closes modal
- Error displays inline message
- Esc key closes modal
- Focus trap works (Tab cycles within modal)
- Backdrop click closes modal

**`tests/integration/contribute-two-step-flow.test.ts`** (~6 tests):
- Full flow: details → payment → API submission
- Flow data persists between pages via sessionStorage
- Payment failure saves recovery data
- Expired flow data redirects back to details
- Closed board shows StateCard on both pages
- Anonymous contribution omits name from API payload

**`tests/unit/payment-recovery-write.test.ts`** (~5 tests):
- `savePaymentAttemptData` stores correctly
- `getPaymentAttemptData` reads stored data
- Expired data returns null
- `clearPaymentAttemptData` removes entry
- SSR safety

---

### Sub-step 7: Accessibility Pass

Verify all new and modified components meet WCAG 2.1 AA:

- **Amount selector:** wrap in `<fieldset>` with
  `<legend>How much would you like to contribute?</legend>`,
  each button `aria-pressed={selected}`
- **Name input:** `<label htmlFor="display_name">`, input
  `aria-invalid` + `aria-describedby` for errors
- **Anonymous checkbox:** proper `<input type="checkbox">` with
  `aria-label`, `aria-checked`
- **Message textarea:** `<label htmlFor="message">`, counter
  `aria-live="polite"`
- **Reminder modal:** focus trap, `aria-modal`,
  `role="dialog"`, `aria-labelledby`
- **Payment method selector:** `<fieldset>` + `<legend>`, each
  card `role="radio"`, `aria-checked`
- **Minimum contrast:** 4.5:1 for all text
- **Focus indicators:** 2px solid blue-500 outline on all
  interactive elements
- **Tab order:** Back → Amount buttons → Custom → Name →
  Anonymous → Message → Reminder → CTA → Trust badge

---

### Sub-step 8: Gate & Evidence

1. Run `pnpm lint && pnpm typecheck && pnpm test`
2. All three must pass (0 errors; warnings OK)
3. Record: total test count, total test files, new C3-specific
   test count
4. Create evidence file at:
   `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C3-contributor-journey-completion.md`
5. Evidence must contain:
   - Files created
   - Files modified
   - Gate output (lint, typecheck, test)
   - Test count breakdown (total vs C3-new)
   - Any deferred items with milestone target
6. Append C3 learnings to `docs/napkin/napkin.md` under
   `## C3 Learnings (2026-02-08)`

---

## Acceptance Criteria

### P0 (blocks merge)
- Contribution path stable across all three providers
  (PayFast, Ozow, SnapScan)
- No money-movement semantic changes (fee calculation,
  API payload, webhook handling unchanged)
- sessionStorage flow data round-trip works correctly
- Board closed/expired state handled on both pages
- Gates pass

### P1 (blocks rollout)
- Reminder UX fully functional (modal → API → toast)
- Anonymous toggle works with name field hide/show
- Birthday message textarea with character counter
- Social proof section visible
- Preset amounts match spec (R150, R250⭐, R500)
- "Gifta fee" label (not "ChipIn fee")
- Metadata uses "Gifta" branding

### P2 (defer with waiver)
- Fade/slide animations for name field toggle
- Message textarea expand/collapse animation
- Form data persistence on page refresh (optional per UX spec
  section 12: "Acceptable (fast form, ~90 seconds)")

---

## Stop Conditions

- Any P0 gate failure → stop, fix, re-run
- Schema or migration file touched → STOP (Phase B is locked)
- Webhook handler modified → STOP
- Fee calculation logic modified → STOP
- Write-path gate toggles changed → STOP
- Any test count regression → stop, investigate

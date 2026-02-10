# Phase C — Milestone C2: Public Dreamboard Enhancements

## Context

Phase B complete, GO signed 2026-02-08. Phase C milestone C0
(UX Parity Baseline) approved. Phase C milestone C1 (Host
Create Flow Restructure) complete and approved: 6-step flow,
466 tests passing across 110 files.

Production deploy strategy: Phase B and C deploy together
after Phase C completion. Write-path toggles remain OFF.

You are now executing Milestone C2: Public Dreamboard
Enhancements. This milestone upgrades the three guest-facing
pages — the public Dreamboard, thank-you, and payment-failed
— with charity visibility, richer contributor display,
dynamic time messaging, return-visit detection, celebration
UX, receipt capture, and empathetic error recovery.

C2 is medium risk. No structural route changes. All three
routes already exist and receive in-place upgrades.

---

## Document Reading Order

Read these documents in this exact order before doing anything:

1. `docs/napkin/SKILL.md` (follow its instructions)
2. `docs/napkin/napkin.md` (apply everything silently)
3. `AGENTS.md` (repo conventions and commands)
4. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
   (hard constraints, stop conditions, rollback contract)
5. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
   (locked decisions D-001 through D-010)
6. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
   (Phase C milestones — focus on C2 section)
7. `docs/implementation-docs/GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md`
   (guest/public routes delta entries)
8. `docs/UX/ui-specs/00-DESIGN-SYSTEM.md` (design tokens)
9. `docs/UX/ui-specs/19-SHARED-COMPONENTS.md` (shared patterns)
10. `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C1-host-create-flow-restructure.md`
    (C1 completion context — what was just delivered)
11. `src/lib/ux-v2/decision-locks.ts` (enum source of truth)

Then read the three UX screen specs that define C2 target state:

12. `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md`
13. `docs/UX/ui-specs/12-CONTRIBUTE-THANK-YOU.md`
    (if file number differs, search for "THANK" in ui-specs)
14. `docs/UX/ui-specs/13-CONTRIBUTE-PAYMENT-FAILED.md`
    (if file number differs, search for "PAYMENT" or "FAILED")

Then read the current source code you will be modifying:

15. `src/app/(guest)/[slug]/page.tsx` (current public board)
16. `src/app/(guest)/[slug]/thanks/page.tsx` (current thank-you)
17. `src/app/(guest)/[slug]/payment-failed/page.tsx` (current payment-failed)
18. `src/app/(guest)/layout.tsx` (guest layout)
19. `src/components/dream-board/DreamBoardCard.tsx`
20. `src/components/dream-board/ProgressBar.tsx`
21. `src/components/dream-board/ContributorChips.tsx`
22. `src/lib/dream-boards/view-model.ts` (GuestViewModel,
    ThankYouViewModel)
23. `src/lib/dream-boards/cache.ts` (board cache)
24. `src/lib/dream-boards/metadata.ts` (OG metadata)
25. `src/lib/db/queries.ts` (getDreamBoardBySlug,
    listRecentContributors)
26. `src/components/effects/ConfettiTrigger.tsx` (created in
    C1 — reuse for thank-you page)
27. `src/components/ui/button.tsx` (Button variants)
28. `src/components/ui/state-card.tsx` (StateCard variants)

---

## C2 Scope Definition

**Routes being enhanced (all exist, no new routes):**

```
/(guest)/[slug]              → Public Dreamboard (MAJOR enhancement)
/(guest)/[slug]/thanks       → Thank-you page (MAJOR enhancement)
/(guest)/[slug]/payment-failed → Payment failed (SIGNIFICANT enhancement)
```

**What IS in C2 scope:**
- Charitable giving section on public board (conditional)
- Contributor display upgrade (avatars, colors, "+X others",
  modal for 6+)
- Dynamic time-remaining messaging (5 urgency tiers)
- Board state handling (active/funded/closed/expired)
- Return-visit detection + banner (localStorage-based)
- Parent-viewing-own-board detection + banner
- OG metadata upgrade (Gifta branding for public board)
- Thank-you page celebration (confetti, personalized message,
  charity impact section, receipt capture, share actions)
- Payment-failed empathetic recovery (dynamic error messages,
  two CTAs, sessionStorage utility module)

**What is NOT in C2 scope:**
- The contribution flow itself (`/[slug]/contribute`) — that
  is C3
- Writing to sessionStorage from the contribute page — C3
  will add the save call; C2 creates the utility and the
  read path
- Receipt email backend (new API route + email template) —
  create the client-side UI and a stub server action that
  returns success. The full email pipeline can be wired in
  C6 (comms alignment) or as a follow-up.
- Full branding sweep — C2 fixes public-facing metadata only.
  C6 does the full sweep.
- Admin pages — C5

---

## Build Sequence

Execute these sub-steps in order. Run `pnpm lint && pnpm typecheck`
after each sub-step. Run the full gate suite after all sub-steps
and again after writing tests.

### Sub-step 1: Extend ViewModels and Data Layer

**Files to modify:**
- `src/lib/dream-boards/view-model.ts`
- `src/lib/db/queries.ts`
- `src/lib/dream-boards/metadata.ts`

#### 1a. Extend GuestViewModel

Add these fields to the `GuestViewModel` type:

```typescript
// Charity display
charityEnabled: boolean;
charityName: string | null;
charityDescription: string | null;
charityLogoUrl: string | null;
charityAllocationLabel: string | null;
  // e.g. "20% of contributions support Ikamva Youth"

// Time remaining messaging
timeRemainingMessage: string;
timeRemainingUrgency: 'relaxed' | 'moderate' | 'urgent'
  | 'critical' | 'expired';

// Board states (refine existing)
isActive: boolean;
isFunded: boolean;
isExpired: boolean;
// isClosed already exists — keep it

// Return visit (set client-side, not in builder)
// Parent detection
hostId: string;
```

Update `buildGuestViewModel` to populate the new fields:

**Time remaining messaging logic:**
```
daysLeft > 14   → "Plenty of time to make this birthday
                    special! ⏰" (urgency: 'relaxed')
daysLeft 7-14   → "{X} days left to chip in 🎁"
                    (urgency: 'moderate')
daysLeft 2-6    → "Just {X} days left! 🎁"
                    (urgency: 'urgent')
daysLeft === 1  → "Last day! 🎁 Don't miss out."
                    (urgency: 'critical')
daysLeft < 1    → "Final hours! ⏰ Chip in now."
  AND not expired   (urgency: 'critical')
expired         → "This Dreamboard has closed. Thank you
                    for helping make this birthday special! 💝"
                    (urgency: 'expired')
```

**Board state logic:**
```
isActive:  status === 'active'
isFunded:  raisedCents >= goalCents
isExpired: partyDate or campaignEndDate has passed
isClosed:  status !== 'active' (keep existing logic)
```

**Charity fields:** Populate from the board data. The
`getDreamBoardBySlug` query must be updated to include
charity data (see sub-step 1b below).

**charityAllocationLabel:** Build from the board's
`charitySplitType` and values:
- If percentage: "{X}% of contributions support {charityName}"
- If threshold: "Up to R{X} will go to {charityName}"
- If not enabled: null

#### 1b. Update Database Query

Modify `getDreamBoardBySlug` in `src/lib/db/queries.ts` to
left-join the `charities` table when building the return
object. The join should fetch: `charities.name`,
`charities.description`, `charities.logoUrl`,
`charities.category`.

Search for the charities table in `src/lib/db/schema.ts`.
The join condition is: `dreamBoards.charityId = charities.id`
where `dreamBoards.charityEnabled = true`.

If the board has `charityEnabled = false` or `charityId` is
null, the charity fields should be null in the result.

Also add `dreamBoards.hostId` to the select fields of
`getDreamBoardBySlug` (and `getDreamBoardByPublicId`
which mirrors it). This field is needed for
parent-viewing-own-board detection in sub-step 2g.

Also update `listRecentContributors` to return the
`isAnonymous` flag (or derive it from `contributorName`
being null/empty) and a stable avatar color index. The avatar
color can be derived deterministically:
```typescript
const AVATAR_COLORS = [
  '#F5C6AA', '#A8D4E6', '#B8E0B8',
  '#E6B8B8', '#F0E68C', '#B8D4E0', '#D8B8E8'
];
const colorIndex = hashCode(contributor.id) % AVATAR_COLORS.length;
```

#### 1c. Extend ThankYouViewModel

Add these fields to `ThankYouViewModel`:

```typescript
contributorName: string | null;
isAnonymous: boolean;
contributionAmountCents: number;
charityEnabled: boolean;
charityName: string | null;
charityAmountCents: number | null;
  // Calculated: if percentage mode, amount × percentage / 10000
  // If threshold mode, min(threshold, amount)
childName: string;
```

Update `buildThankYouViewModel` to populate these from the
contribution and board data.

#### 1d. Update Metadata

In `src/lib/dream-boards/metadata.ts`, change the brand
name in OG titles from "ChipIn" to "Gifta":
```
"${childName}'s Dreamboard | ChipIn"
  → "${childName}'s Dreamboard | Gifta"
```

### Sub-step 2: Rewrite Public Dreamboard Page

**File:** `src/app/(guest)/[slug]/page.tsx`

**Reference spec:** `09-PUBLIC-DREAM-BOARD.md`

This is a major enhancement of the existing page. Keep it as
a server component with client sub-components where
interactivity is needed.

**Server component (page):**
- Fetch board via `getCachedDreamBoardBySlug(slug)`
- Fetch contributors via `listRecentContributors(board.id, 20)`
  (increase limit — we show 5 but need count for "+X others")
- Build `GuestViewModel` from board data
- Optionally detect parent: use an optional auth check to get
  current user ID. Search for `getOptionalAuth`,
  `getCurrentUserId`, or create a lightweight helper that
  returns the Clerk user ID without redirecting (wrap
  `currentUser()` from Clerk in a try-catch, returning null
  if not authenticated). Compare with `view.hostId`.
- Render sections in order

**Section components to create or update:**

**2a. HeaderSection** (update existing HeroCard)
- Sage gradient background: `bg-gradient-to-b from-[#E4F0E8]
  to-[#D5E8DC]`
- Circular child photo: 120px, white border, shadow
- Fallback: initials circle if no photo
- Child name: Fraunces font, text-gray-900
- Age line: "Turning {age} on {date}" (Outfit, text-gray-600)
- Centered mobile, left-aligned desktop

**2b. OneWishSection** (update existing GiftCardSection)
- Warm bg `#FDF8F3`, rounded-2xl, shadow-soft
- Label: "✨ {CHILD}'S ONE BIG WISH" (gold `#C4956A`,
  uppercase, letter-spacing +1px)
- Gift image 64px (80px desktop), rounded-lg
- Gift name: Fraunces 20px bold
- Gift description: Outfit 14px, text-gray-500, max 100 chars
- Goal amount formatted as ZAR

**2c. ContributorDisplay** (NEW — replaces ContributorChips)

Create `src/components/dream-board/ContributorDisplay.tsx`.
This needs a client component for the modal interaction.

Props:
```typescript
{
  contributors: Array<{
    name: string | null;
    isAnonymous: boolean;
    avatarColorIndex: number;
  }>;
  totalCount: number;
}
```

Display rules:
- 0 contributors: "Be the first to chip in... 🎁"
  (text-gray-400, italic)
- 1-5: Show all with 36px avatar circles (initials or "💝"
  for anonymous), cycling through 7 avatar colors
- 6+: Show first 5 + "+ {totalCount - 5} others ➜" link
- Avatar colors: `['#F5C6AA', '#A8D4E6', '#B8E0B8',
  '#E6B8B8', '#F0E68C', '#B8D4E0', '#D8B8E8']`
- Dynamic heading emoji: 🎁 (<3), 🎉 (3-10), ✨ (>10)
- Heading text (dynamic):
  - 1: "1 loved one has chipped in"
  - 2-5: "{X} loved ones have chipped in"
  - 6+: "{X} amazing people have chipped in"

**ContributorsModal** (client component, within
ContributorDisplay or separate):
- Triggered by "+X others" link
- Full list with pagination (6 per page)
- `role="dialog"`, `aria-modal="true"`, Escape to close
- Slide-up on mobile, fade-in on desktop
- Close button with focus trap

**2d. TimeRemaining** (NEW component)

Create `src/components/dream-board/TimeRemaining.tsx`.

Props:
```typescript
{
  message: string;
  urgency: 'relaxed' | 'moderate' | 'urgent'
    | 'critical' | 'expired';
}
```

Styling by urgency (match UX spec section 3.4):
- relaxed: Fraunces 18px 700, text-gray-900
- moderate: Fraunces 18px 700, text-gray-900, semi-bold
- urgent: Fraunces 16px, color `#C4785A`; add
  `bg-orange-50` only when daysLeft ≤ 3
- critical: Fraunces 20px bold, color `#C4785A`,
  `bg-orange-50`, optional pulse animation (respect
  prefers-reduced-motion)
- expired: text-gray-500, italic

**2e. CharitableGivingCard** (NEW component)

Create `src/components/dream-board/CharitableGivingCard.tsx`.

Props:
```typescript
{
  charityName: string;
  charityDescription: string | null;
  charityLogoUrl: string | null;
  allocationLabel: string;
}
```

Only rendered when `charityEnabled === true`.

Styling:
- Green tint bg `#F0F7F4`, 1px border
  `rgba(11, 125, 100, 0.1)`, rounded-2xl
- Label: "💚 A GIFT THAT GIVES TWICE" (teal `#0D9488`,
  uppercase, 11px, letter-spacing +1px)
- Charity logo: 48px, rounded-md
- Charity name: Fraunces 16px bold
- Allocation label: Outfit 14px, text-gray-600

This component is shared between the public board and the
thank-you page (with slight copy variations). Design it to
accept flexible children or a `variant` prop if needed.

**2f. ReturnVisitBanner** (NEW client component)

Create `src/components/dream-board/ReturnVisitBanner.tsx`.
Mark as `'use client'`.

This component checks localStorage on mount:
```typescript
const storageKey = `gifta_contributed_${slug}`;
const hasContributed = localStorage.getItem(storageKey);
```

If user has previously contributed:
- Show success banner: bg `#F0F7F4`, 1px border `#0D9488`
- Text: "Thanks for chipping in, {name}! 💝"
- Secondary CTA: "Share this Dreamboard" ghost button
- Hide the primary "Chip in" CTA

**2g. ParentBanner** (server-side conditional)

If current authenticated user's hostId matches the board's
hostId:
- Show info banner: bg `#FDF8F3`
- Text: "👋 This is your Dreamboard. You're all set!"
- Link: "View Dashboard" → `/dashboard/{boardId}`
- Hide the "Chip in" CTA

**2h. PrimaryCTA** (update existing ContributionCta)

- Ghost button style: white bg, 2px sage border `#6B9E88`
- Text: "Chip in for {childName} 💝"
- Disabled when expired (opacity-50, cursor-not-allowed,
  tooltip "This Dreamboard has closed")
- Loading state: spinner for 1s post-click
- Link: `/{slug}/contribute?source=dream-board`
- Hidden when return-visit banner or parent banner is active

**Page composition order (top to bottom):**
1. HeaderSection (sage gradient hero)
2. OneWishSection (gift card)
3. ProgressBar (existing component, keep as-is)
4. TimeRemaining
5. ContributorDisplay
6. CharitableGivingCard (conditional)
7. ReturnVisitBanner OR ParentBanner OR PrimaryCTA
8. Footer links

### Sub-step 3: Rewrite Thank-You Page

**File:** `src/app/(guest)/[slug]/thanks/page.tsx`

**Reference spec:** `12-CONTRIBUTE-THANK-YOU.md` (or nearest)

This is a major enhancement. The current simple page becomes
a celebration experience.

**Server component (page):**
- Fetch board + contribution (same pattern as current)
- Build extended ThankYouViewModel
- Render `ThankYouClient` client component with view data

**Client component: `ThankYouClient`**

Create `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx`.
Mark as `'use client'`.

Props:
```typescript
{
  view: ThankYouViewModel;
  slug: string;
}
```

**Sections:**

**3a. Confetti Animation**
- Reuse `ConfettiTrigger` from `@/components/effects/ConfettiTrigger`
  (already created in C1)
- 3 seconds duration, 50-100 particles
- Colors: teal, sage, warm gold, hero accent, soft pink,
  light blue, light green
- `aria-hidden="true"`, disabled for prefers-reduced-motion

**3b. Thank-You Message**
- Heading: "🎉 Thank you, {name}! 💝" (Fraunces 24px/28px)
- If anonymous: "🎉 Thank you! 💝" (no name)
- Primary: "Your contribution of R{amount} will help make
  {childName}'s birthday extra special."
- Secondary: "{childName}'s parents have been notified. 💝"
- Fade-up animation (0.5s, staggered)

**3c. Charitable Giving Impact** (conditional)
- Reuse `CharitableGivingCard` from sub-step 2e
- Different copy: "R{charityAmount} of your contribution
  will support {charityName}. Thank you for giving twice! 💚"
- charityAmount calculated from the contribution amount and
  the board's allocation percentage or threshold

**3d. Receipt Capture Section**

Create a client sub-component or inline section:
- Label: "WANT A RECEIPT?" (uppercase, text-gray-500)
- Email input (type="email", placeholder "you@example.com",
  44px touch target)
- "Send Receipt" ghost button
- Pre-fill email from contribution record if available
- On submit: call `requestReceiptAction` server action

**Server action: `requestReceiptAction`**
For C2, implement as a stub that returns success:
```typescript
async function requestReceiptAction(
  contributionId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  // Validate email format
  // TODO: Wire to email pipeline in C6
  // For now, return success to complete the UI flow
  return { success: true };
}
```

- Success toast: "Receipt sent to your email!" (green bg,
  checkmark, 3s auto-dismiss)
- Error toast: "Couldn't send receipt. Please try again."
  (red, 5s dismiss, retry)

**3e. Share CTA**
- Sage filled button: bg `#6B9E88`, white text
- Text: "📤 Share This Dreamboard"
- Click: Use `navigator.share()` if available, fallback to
  clipboard copy with toast "Link copied to clipboard!"
- Share data: title, text, URL per spec

**3f. Footer Links**
- "← Back to Dreamboard" → `/{slug}`
- "Need help? Contact us" → `/support` or help widget

**3g. localStorage Contribution Tracking**

After the thank-you page loads with a confirmed contribution,
store the contribution in localStorage so the public board
can show the return-visit banner:
```typescript
useEffect(() => {
  if (view.contributorName || view.isAnonymous) {
    localStorage.setItem(
      `gifta_contributed_${slug}`,
      JSON.stringify({
        name: view.contributorName ?? 'Anonymous',
        timestamp: Date.now()
      })
    );
  }
}, []);
```

### Sub-step 4: Rewrite Payment-Failed Page

**File:** `src/app/(guest)/[slug]/payment-failed/page.tsx`

**Reference spec:** `13-CONTRIBUTE-PAYMENT-FAILED.md`
(or nearest)

**Server component (page):**
- Fetch board (same as current)
- Read `reason` from searchParams
- Build error display data from reason

**Dynamic error messages:**

Create a utility function (inline or in a shared module):

```typescript
function getFailureDisplay(reason?: string): {
  heading: string;
  message: string;
  explanations: string[];
} {
  switch (reason) {
    case 'declined':
      return {
        heading: "Payment Didn't Go Through",
        message: "Your card was declined. Please check your
          details or try a different card.",
        explanations: [
          "Card details were incorrect",
          "Card was declined by your bank"
        ]
      };
    case 'insufficient_funds':
      return {
        heading: "Payment Didn't Go Through",
        message: "It looks like there weren't enough funds.
          Please try a different card or payment method.",
        explanations: ["Insufficient funds"]
      };
    case 'network_error':
      return {
        heading: "Connection Issue",
        message: "We lost connection during payment. No funds
          were taken. Please try again.",
        explanations: ["Connection interrupted"]
      };
    case 'invalid_card':
      return {
        heading: "Card Details Invalid",
        message: "The card details entered aren't valid.
          Please check and try again.",
        explanations: [
          "Card number is incorrect",
          "Expiry date is in the past",
          "CVV/security code is incorrect"
        ]
      };
    case 'timeout':
      return {
        heading: "Payment Timeout",
        message: "Payment took too long to process. Your
          card was not charged. Please try again.",
        explanations: ["Connection timed out"]
      };
    case 'user_cancelled':
      return {
        heading: "Payment Cancelled",
        message: "You cancelled the payment. No funds were
          taken. Ready to try again?",
        explanations: []
      };
    default:
      return {
        heading: "Payment Didn't Go Through",
        message: "Hmm, your payment didn't go through. Please
          check your card details and try again. 💳",
        explanations: [
          "Card details were incorrect",
          "Insufficient funds",
          "Card was declined by your bank",
          "Connection issue"
        ]
      };
  }
}
```

**Page layout:**
- Error heading: Fraunces 24px/28px, centered, with ❌ emoji
- Error message: Outfit 16px, text-gray-700
- Explanation list: Outfit 14px, text-gray-600, bullet items
- No funds taken reassurance
- Two CTAs:
  1. "Try Again" (sage filled button, primary) →
     `/{slug}/contribute`
  2. "Use a Different Payment Method" (ghost button) →
     `/{slug}/contribute?clear_payment_method=true`
- Footer links: "Need help? Contact us 💬" + "Back to
  {childName}'s Dreamboard ←"
- Board-expired check: if board is closed, show message
  "This Dreamboard has closed." instead of retry buttons

**Payment recovery utility module:**

Create `src/lib/payments/recovery.ts`:

```typescript
export function savePaymentAttemptData(
  slug: string,
  data: PaymentAttemptData
): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    `gifta_payment_failed_${slug}`,
    JSON.stringify({ ...data, timestamp: Date.now() })
  );
}

export function getPaymentAttemptData(
  slug: string
): PaymentAttemptData | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(
    `gifta_payment_failed_${slug}`
  );
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  // Expire after 30 minutes
  if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
    sessionStorage.removeItem(`gifta_payment_failed_${slug}`);
    return null;
  }
  return parsed;
}

export function clearPaymentAttemptData(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`gifta_payment_failed_${slug}`);
}

export type PaymentAttemptData = {
  amountCents: number;
  displayName: string | null;
  message: string | null;
  isAnonymous: boolean;
  attemptedMethod: string | null;
  reason: string | null;
  timestamp?: number;
};
```

Note: C2 creates this utility and has the payment-failed page
READ from it. C3 will add the WRITE call in the contribute
page before redirecting to a payment provider. For now, the
payment-failed page gracefully handles the case where no
saved data exists.

### Sub-step 5: Update Existing Steps (Child/Gift page references)

Check if any existing files outside C2 scope import the old
`ContributorChips` component. If they do, update the imports
to use the new `ContributorDisplay`. If `ContributorChips` is
only used on the public board page, it can be deprecated
(keep the file with a comment "Deprecated — use
ContributorDisplay") or removed if no other consumers exist.

### Sub-step 6: Accessibility Pass

Across all three pages, ensure:

- Semantic HTML: h1 for main heading, h2 for sections
- Landmarks: `<header>`, `<main>`, `<section>`, `<footer>`
- Color contrast: all text meets 4.5:1 (WCAG AA)
- Touch targets: minimum 44x44px for all interactive elements
- Focus management: visible focus rings, logical tab order
- ARIA on contributor modal: `role="dialog"`,
  `aria-modal="true"`, focus trap, Escape to close
- ARIA on time remaining: `aria-live="polite"` for dynamic
  countdown
- ARIA on error heading (payment-failed): `role="alert"`,
  `aria-live="assertive"`
- Images: alt text on child photo, gift image, charity logo
- Screen reader: progress bar already has
  `role="progressbar"` + aria-value attributes (verify)

---

## Test Requirements

Write full test coverage. Follow existing Vitest patterns.

### Unit Tests

**File: `tests/unit/guest-view-model.test.ts` (NEW)**

Test the extended GuestViewModel and ThankYouViewModel:
- Time remaining messages: one test per urgency tier (>14d,
  7-14d, 2-6d, 1d, <1d, expired)
- Board state flags: isActive, isFunded, isClosed, isExpired
  — test each combination
- Charity fields: enabled with percentage → correct label,
  enabled with threshold → correct label, disabled → all null
- charityAllocationLabel: percentage mode (e.g. 25% → "25%
  of contributions support {name}"), threshold mode
  (R500 → "Up to R500 will go to {name}")
- ThankYouViewModel: personalized headline with name,
  anonymous headline, charity amount calculation (percentage
  and threshold modes)

**File: `tests/unit/contributor-display.test.tsx` (NEW)**

Test the ContributorDisplay component rendering:
- 0 contributors: shows "Be the first" message
- 1-5 contributors: shows all names with avatars
- 6+ contributors: shows first 5 + "+X others" link
- Anonymous contributor: shows "💝 Anonymous contributor"
- Avatar colors cycle correctly through 7 colors
- Dynamic heading emoji: 🎁 (<3), 🎉 (3-10), ✨ (>10)

**File: `tests/unit/time-remaining.test.tsx` (NEW)**

Test the TimeRemaining component:
- Each urgency tier renders correct styling class
- Critical tier has pulse animation class
- Expired tier has italic/muted styling
- Respects prefers-reduced-motion (no pulse)

**File: `tests/unit/charitable-giving-card.test.tsx` (NEW)**

Test CharitableGivingCard:
- Renders charity name, logo, allocation label
- Handles null description gracefully
- Handles null logo (fallback display)

**File: `tests/unit/payment-recovery.test.ts` (NEW)**

Test the sessionStorage utility:
- savePaymentAttemptData: saves to sessionStorage
- getPaymentAttemptData: retrieves valid data
- getPaymentAttemptData: returns null for expired data (>30min)
- getPaymentAttemptData: returns null when no data exists
- clearPaymentAttemptData: removes from sessionStorage
- All functions handle SSR (typeof window === 'undefined')

**File: `tests/unit/payment-failed-messages.test.ts` (NEW)**

Test getFailureDisplay:
- Each reason ('declined', 'insufficient_funds',
  'network_error', 'invalid_card', 'timeout',
  'user_cancelled') returns correct heading,
  message, and explanations
- Unknown/missing reason returns default message
- Default has all 4 explanation bullets

### Integration Tests

**File: `tests/integration/public-board-display.test.ts` (NEW)**

Test the public board data flow:
- Board with charity enabled: ViewModel includes charity
  fields, CharitableGivingCard should render
- Board without charity: charity fields null, no charity card
- Board with 0 contributors: empty state message
- Board with 5 contributors: all shown
- Board with 20 contributors: first 5 shown + "+15 others"
- Expired board: CTA disabled, expired time message
- Funded board: funded banner visible
- Active board: CTA enabled, time remaining shown

**File: `tests/integration/thank-you-display.test.ts` (NEW)**

Test the thank-you page data flow:
- Contribution with name: personalized heading
- Anonymous contribution: generic heading
- Board with charity: charity impact section with calculated
  amount
- Board without charity: no charity section
- Receipt action stub: returns success

Mock: `getCachedDreamBoardBySlug`,
`getContributionByPaymentRef`, `listRecentContributors`.

---

## Gate Commands

Run after all code and tests are written:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

All three must pass with zero errors. The existing 466 tests
must continue passing alongside new tests.

---

## C2 Acceptance Criteria

**P0 (blocks merge):**
- [ ] Public board correctly displays active, funded, closed,
      and expired states with appropriate CTA behavior
- [ ] Contributor display shows correct count, first 5 names,
      "+X others" for 6+, and empty state
- [ ] Time remaining shows correct message for all 5 urgency
      tiers plus expired
- [ ] No regressions: all pre-existing 466 tests pass
- [ ] New unit + integration tests pass

**P1 (blocks rollout):**
- [ ] Charitable giving section renders when enabled with
      correct allocation label; hidden when disabled
- [ ] Thank-you page shows confetti, personalized message,
      charity impact (when applicable), receipt capture,
      share buttons
- [ ] Payment-failed page shows dynamic error message based
      on reason, two CTA buttons, footer links
- [ ] Return-visit banner shows for returning contributors
      (localStorage-based)
- [ ] Parent-viewing-own-board banner shows with dashboard
      link
- [ ] Contributor modal accessible (keyboard, ARIA,
      focus trap)
- [ ] OG metadata uses "Gifta" branding (not "ChipIn")
- [ ] Copy matches UX specs for all visible text
- [ ] Responsive layout correct across mobile/tablet/desktop

---

## Evidence

Write C2 evidence to:
```
docs/implementation-docs/evidence/ux-v2/phase-c/
20260208-C2-public-dream-board-enhancements.md
```

Include:
1. Summary of what was implemented
2. Files created and modified (with paths)
3. Gate results (lint, typecheck, test — exact output)
4. Test coverage: new test files and test counts
5. Spec gaps or deferred items (receipt email backend, etc.)
6. Any P2 items deferred

Update `docs/napkin/napkin.md` with any corrections or
learnings discovered during C2 execution. This was missed
in C1 — make sure to actually add C2-specific learnings
(e.g. patterns discovered, gotchas encountered, decisions
made about optional auth, charity query joins, etc.).

---

## Stop Conditions

Stop and report immediately if:
- Money-movement semantics change (fee, raised, funded
  calculations must not be altered)
- The contribution creation flow is modified (that is C3)
- The `dreamBoards` table schema needs modification
- More than 3 existing tests break simultaneously
- Any hard stop condition from the Agent Execution Contract

---

**Do not proceed to C3 until C2 evidence is written and the
gate suite passes clean.**

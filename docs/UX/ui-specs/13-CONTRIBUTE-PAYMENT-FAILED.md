# 13 — CONTRIBUTE PAYMENT FAILED (Error Recovery)

**Route:** `/[slug]/payment-failed`
**Purpose:** Handle failed payment gracefully and offer recovery options
**Audience:** Contributors whose payment declined or was cancelled
**Device Priority:** Mobile-first
**Context:** Payment attempt failed; help user recover without losing contribution data

---

## 1. Screen Overview

This is the **error recovery screen** when payment fails. It:

1. **Acknowledges** the failure with empathy (not blame)
2. **Explains** why it happened (card details, declined, etc.)
3. **Offers multiple paths** to retry:
   - Try same method again (most common fix)
   - Use different payment method
   - Contact support for help
4. **Preserves form data** so user doesn't re-enter (amount, name, message)

Philosophy: **Empathetic, helpful, unblocking.** Payment failures are frustrating. Clear language, multiple options, and frictionless recovery build trust.

---

## 2. Visual Layout

### Mobile (375px viewport)
```
┌─────────────────────────────────────┐
│                                     │
│  ❌ Payment Didn't Go Through        │
│  (Heading, Fraunces 24px, red)      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  "Hmm, your payment didn't go       │
│   through. Please check your card   │
│   details and try again. 💳"        │
│  (Outfit 16px, centered)            │
│                                     │
│  This usually happens if:           │
│  • Card details were incorrect      │
│  • Insufficient funds               │
│  • Card was declined by your bank   │
│  • Connection issue                 │
│                                     │
│  (Outfit 14px, gray text, bullet)   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Try Again                      ││
│  │  (Primary button, sage)         ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Use a Different Payment Method ││
│  │  (Secondary button, ghost)      ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Need help? Contact us 💬           │
│  (Text link)                        │
│                                     │
│  Back to [Child]'s Dreamboard ←    │
│  (Text link)                        │
│                                     │
└─────────────────────────────────────┘
```

### Desktop (1024px viewport)
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│               ❌ Payment Didn't Go Through                      │
│               (Fraunces 28px, centered, red)                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         "Hmm, your payment didn't go through.                 │
│          Please check your card details and try again. 💳"    │
│         (Outfit 16px, centered, text-gray-700)                │
│                                                                │
│         This usually happens if:                              │
│         • Card details were incorrect                         │
│         • Insufficient funds                                  │
│         • Card was declined by your bank                      │
│         • Connection issue                                    │
│                                                                │
│         (Outfit 14px, gray, indented bullets)                 │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         ┌──────────────────────────────────────────────────┐  │
│         │  Try Again                                       │  │
│         │  (Sage button, 50% width max 400px)             │  │
│         └──────────────────────────────────────────────────┘  │
│                                                                │
│         ┌──────────────────────────────────────────────────┐  │
│         │  Use a Different Payment Method                 │  │
│         │  (Ghost button, sage border)                    │  │
│         └──────────────────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         Need help? Contact us 💬    Back to Dreamboard ←      │
│         (Text links, centered, spaced)                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Section-by-Section Specification

### 3.1 Header Section

**Purpose:** Show error state clearly
**Display:** Prominent, sympathetic
**Styling:** Centered, subtle error color emphasis

#### Heading
- **Text:** `"❌ Payment Didn't Go Through"` (or variations: "Oops!", "Hmm,...")
- **Font:** Fraunces 24px (mobile), 28px (desktop), 700 weight
- **Color:** text-gray-900 (heading), but with icon emphasis (❌ in red)
- **Icon:** ❌ emoji (or error icon SVG, red `#DC2626`)
- **Positioning:** Centered
- **Spacing:** 24px top padding, 16px bottom margin

#### Alternative Headings (A/B test)
- `"Oops! That didn't work."`
- `"Let's try that again."`
- `"Hmm, we couldn't process that."`

---

### 3.2 Error Message & Explanation

**Purpose:** Provide context and reduce frustration
**Display:** Empathetic, non-technical language
**Styling:** Clean, readable text block

#### Primary Error Message
- **Text:** `"Hmm, your payment didn't go through. Please check your card details and try again. 💳"`
- **Font:** Outfit 16px, text-gray-700
- **Color:** text-gray-700 (warm, not cold red)
- **Emoji:** 💳 at end
- **Spacing:** 24px margin below
- **Line height:** 1.6 (generous)
- **Positioning:** Centered

#### Explanation List (Why this happens)
- **Label:** `"This usually happens if:"` (Outfit 14px, text-gray-600, semi-bold)
- **Items:**
  - `"Card details were incorrect"`
  - `"Insufficient funds"`
  - `"Card was declined by your bank"`
  - `"Connection issue"`
- **Font:** Outfit 14px, text-gray-600
- **Bullets:** `•` or `-` (text-based, not images)
- **Spacing:** 8px vertical gap between items
- **Margin:** 24px top, 32px bottom
- **Indentation:** 16px left margin for readability

#### Tone Guidelines
- **Avoid:** "Error", "failure", "problem", "issue" (too technical/blame)
- **Use:** "Didn't go through", "Let's try again", "Usually happens when..."
- **Avoid:** "You entered an invalid card number"
- **Use:** "Please check your card details"

---

### 3.3 Primary CTA — Try Again

**Purpose:** Simple retry with same payment method
**Display:** Full-width button
**Styling:** Sage filled button (primary action)

#### Button Style
- **Style:** Filled (primary action)
- **Background:** Sage `#6B9E88`
- **Text Color:** White
- **Text:** `"Try Again"` (Outfit 16px, 600 weight)
- **No emoji:** Keep simple
- **Padding:** 16px vertical, 24px horizontal
- **Rounded:** `rounded-lg`
- **Width:** 100% on mobile, 60% max 400px on desktop
- **Hover:** bg darker sage `#5A8E78`
- **Active:** bg `#4A7E68`
- **Shadow:** `shadow-soft` on hover
- **Disabled:** opacity-50 if no valid payment method (shouldn't happen)

#### Click Behavior
- **Action:** Navigate back to `/[slug]/contribute/payment` (payment method selector)
- **Restore data:** Preserve amount, name, message from previous attempt (localStorage or session)
- **Default method:** If card was used before, pre-select card; if SnapScan, pre-select SnapScan
- **Focus:** Place user back at payment method selector, ready to resubmit
- **Analytics:** Log event `payment_failed_retry_clicked`

#### Loading State
- **On click:** Show spinner inside button
- **Text:** `"Retrying..."` or keep as "Try Again" with spinner overlay
- **Duration:** Show until navigation completes (~0.5-1s)

---

### 3.4 Secondary CTA — Different Payment Method

**Purpose:** Offer alternative if card repeatedly fails
**Display:** Below primary button
**Styling:** Ghost button (secondary action)

#### Button Style
- **Style:** Ghost (secondary)
- **Background:** White
- **Border:** 2px solid sage `#6B9E88`
- **Text Color:** Sage `#6B9E88`
- **Text:** `"Use a Different Payment Method"` (Outfit 14px-16px, 600 weight)
- **Padding:** 14px vertical, 24px horizontal (slightly smaller than primary)
- **Rounded:** `rounded-lg`
- **Width:** 100% on mobile, 60% max 400px on desktop
- **Hover:** bg sage-50 `#F5F9F7`, border darker
- **Active:** bg sage-100
- **No shadow:** Keep minimal

#### Click Behavior
- **Action:** Navigate to `/[slug]/contribute/payment` with `?clear_payment_method=true` (clear previous selection)
- **Restore data:** Same as "Try Again" (preserve amount, name, message)
- **Default method:** Show both card and SnapScan options (don't pre-select)
- **Focus:** Place user at payment method selector, ready to choose different method
- **Analytics:** Log event `payment_failed_different_method_clicked`

---

### 3.5 Footer Links

**Purpose:** Offer support and navigation options
**Display:** Text links below buttons
**Styling:** Subtle, not intrusive

#### Layout
- **Mobile:** Vertical stack, left-aligned (or centered)
- **Desktop:** Horizontal, centered with `·` divider (optional)
- **Spacing:** 24px top margin, 12px gap between (mobile), 24px gap (desktop)

#### "Need help? Contact us" Link
- **Text:** `"Need help? Contact us 💬"` (Outfit 14px, sage `#6B9E88`)
- **Color:** Sage, underline on hover
- **Action:** Navigate to `/support` or open help widget/modal
- **Target:** `_self` (same window)
- **Accessibility:** `aria-label="Contact support for payment help"`

#### "Back to Dreamboard" Link
- **Text:** `"Back to [Child]'s Dreamboard ←"` (Outfit 14px, sage)
- **Color:** Sage, underline on hover
- **Action:** Navigate to `/[slug]` (public dream board)
- **Target:** `_self`
- **Accessibility:** `aria-label="Return to ${child.name}'s Dreamboard"`

#### Alternative Footer Text
- `"Still having trouble? We're here to help at support@gifta.co.za"`
- `"Questions? Our team is here for you."`

---

## 4. Component Tree (React Hierarchy)

```
<PaymentFailedPage slug={string}>
  <Metadata
    title="Payment Failed – Let's Try Again"
    description="Your payment didn't go through. Let's fix it."
  />

  <Header>
    <ErrorHeading text="❌ Payment Didn't Go Through" />
  </Header>

  <ErrorMessage
    message="Hmm, your payment didn't go through. Please check your card details and try again. 💳"
    explanation={[
      "Card details were incorrect",
      "Insufficient funds",
      "Card was declined by your bank",
      "Connection issue",
    ]}
  />

  <CallToActionSection>
    <PrimaryRetryButton
      onClick={() => navigateToPayment()}
      loading={isRetrying}
    >
      Try Again
    </PrimaryRetryButton>

    <SecondaryButton
      onClick={() => navigateToPaymentWithClear()}
      variant="ghost"
    >
      Use a Different Payment Method
    </SecondaryButton>
  </CallToActionSection>

  <FooterLinks>
    <ContactSupportLink href="/support" />
    <BackToDreamBoardLink href={`/${slug}`} />
  </FooterLinks>

  <DataPreservation
    preservation={{
      amount: getFromStorage(`gifta_contribution_amount_${slug}`),
      displayName: getFromStorage(`gifta_contribution_name_${slug}`),
      message: getFromStorage(`gifta_contribution_message_${slug}`),
    }}
  />
</PaymentFailedPage>
```

---

## 5. TypeScript Interfaces

```typescript
// Page Props
interface PaymentFailedPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    reason?: string; // 'declined', 'insufficient_funds', 'invalid_card', 'network_error'
    clear_payment_method?: string;
  };
}

// Component Props
interface ErrorHeadingProps {
  text: string;
  iconColor?: string;
}

interface ErrorMessageProps {
  message: string;
  explanation: string[];
}

interface PrimaryRetryButtonProps {
  onClick: () => void;
  loading: boolean;
}

interface SecondaryButtonProps {
  onClick: () => void;
  variant: 'primary' | 'ghost';
  children: string;
}

interface FooterLinksProps {
  childName: string;
  slug: string;
}

// API Models (if needed)
interface PaymentFailureReason {
  code: string;
  message: string;
  recoverable: boolean;
  suggestion?: string;
}

// Session Data
interface PaymentFailureSession {
  amount: number;
  displayName?: string;
  message?: string;
  isAnonymous: boolean;
  attemptedPaymentMethod: 'card' | 'snapscan';
  failureReason: string;
  timestamp: number;
}
```

---

## 6. File Structure

```
src/
├── app/
│   └── [slug]/
│       └── payment-failed/
│           ├── page.tsx                    # Main error page
│           ├── layout.tsx
│           ├── error.tsx
│           └── loading.tsx
├── components/
│   └── payment/
│       ├── PaymentFailed/
│       │   ├── PaymentFailed.tsx          # Container
│       │   ├── ErrorHeading.tsx
│       │   ├── ErrorMessage.tsx
│       │   ├── ErrorExplanation.tsx
│       │   ├── RetryButton.tsx
│       │   ├── DifferentMethodButton.tsx
│       │   └── FooterLinks.tsx
│       └── shared/
│           └── Button.tsx
├── lib/
│   ├── payment-recovery.ts                # Session data recovery
│   └── error-messages.ts                  # Dynamic error messages
├── hooks/
│   └── usePaymentRecovery.ts              # Recovery logic
└── types/
    └── paymentFailed.ts                   # TypeScript definitions
```

---

## 7. Data Fetching & Session Recovery

### Preserve Form Data (Before Redirect)
```typescript
// When navigating TO payment failed page, preserve contribution data
// This happens in PayFast redirect or SnapScan error handling

// lib/payment-recovery.ts
export function savePaymentAttemptData(
  slug: string,
  data: {
    amount: number;
    displayName?: string;
    message?: string;
    isAnonymous: boolean;
    attemptedMethod: 'card' | 'snapscan';
    reason: string;
  }
): void {
  // Save to sessionStorage (cleared on browser close, better for sensitive data)
  sessionStorage.setItem(
    `gifta_payment_failed_${slug}`,
    JSON.stringify({
      ...data,
      timestamp: Date.now(),
    })
  );
}

export function getPaymentAttemptData(slug: string) {
  const data = sessionStorage.getItem(`gifta_payment_failed_${slug}`);
  if (!data) return null;

  const parsed = JSON.parse(data);

  // Expire data after 30 minutes
  if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
    clearPaymentAttemptData(slug);
    return null;
  }

  return parsed;
}

export function clearPaymentAttemptData(slug: string): void {
  sessionStorage.removeItem(`gifta_payment_failed_${slug}`);
}
```

### PayFast Redirect to Failed Page
```typescript
// lib/payfast.ts
export function handlePayFastCancel(
  reason: string = 'user_cancelled'
): void {
  const slug = getCurrentSlug(); // Get from URL
  const attemptData = getPaymentAttemptData(slug);

  if (attemptData) {
    savePaymentAttemptData(slug, {
      ...attemptData,
      reason,
    });
  }

  // Redirect to payment failed page
  window.location.href = `/${slug}/payment-failed?reason=${reason}`;
}
```

### Restore Data on Payment Retry
```typescript
// When user clicks "Try Again", restore previous form data

// hooks/usePaymentRecovery.ts
export function usePaymentRecovery(slug: string) {
  const recoveredData = getPaymentAttemptData(slug);

  const restoreData = () => {
    if (!recoveredData) return;

    // Set form state from recovered data
    return {
      amount: recoveredData.amount,
      displayName: recoveredData.displayName,
      message: recoveredData.message,
      isAnonymous: recoveredData.isAnonymous,
    };
  };

  const clearData = () => {
    clearPaymentAttemptData(slug);
  };

  return { recoveredData, restoreData, clearData };
}
```

### Dynamic Error Messages
```typescript
// lib/error-messages.ts
export function getFailureMessage(
  reason?: string
): { heading: string; message: string; explanation: string[] } {
  const messages: Record<string, any> = {
    declined: {
      heading: '❌ Card Declined',
      message:
        'Your bank declined this payment. This can happen for several reasons.',
      explanation: [
        'Check if card details are correct',
        'Ensure sufficient funds available',
        'Contact your bank to check for restrictions',
        'Try a different card',
      ],
    },
    insufficient_funds: {
      heading: '❌ Insufficient Funds',
      message:
        'Your card doesn\'t have enough funds. Please check your account balance.',
      explanation: [
        'Add funds to your account',
        'Try a different card with available balance',
        'Contact your bank for assistance',
      ],
    },
    invalid_card: {
      heading: '❌ Card Details Invalid',
      message: 'The card details you entered aren\'t valid. Please check and try again.',
      explanation: [
        'Card number is incorrect (usually 16 digits)',
        'Expiration date is in the past',
        'CVV/Security code is incorrect',
      ],
    },
    network_error: {
      heading: '❌ Connection Error',
      message:
        'We couldn\'t connect to process your payment. Check your internet and try again.',
      explanation: [
        'Check your internet connection',
        'Try again in a few moments',
        'Try a different payment method',
      ],
    },
    timeout: {
      heading: '❌ Payment Timeout',
      message:
        'Payment took too long to process. Your card was not charged.',
      explanation: [
        'Check your internet connection',
        'Try again with a stable connection',
        'Contact support if problem persists',
      ],
    },
    user_cancelled: {
      heading: 'Payment Cancelled',
      message:
        'You cancelled the payment. Your card was not charged. Ready to try again?',
      explanation: [
        'No charges have been made to your card',
        'Your contribution data has been saved',
        'Click "Try Again" when ready',
      ],
    },
    default: {
      heading: '❌ Payment Didn\'t Go Through',
      message:
        'Hmm, your payment didn\'t go through. Please check your card details and try again. 💳',
      explanation: [
        'Card details were incorrect',
        'Insufficient funds',
        'Card was declined by your bank',
        'Connection issue',
      ],
    },
  };

  return messages[reason] || messages.default;
}
```

### Page Rendering with Error Message
```typescript
// app/[slug]/payment-failed/page.tsx
import { getFailureMessage } from '@/lib/error-messages';

interface PaymentFailedPageProps {
  params: { slug: string };
  searchParams?: { reason?: string };
}

export default function PaymentFailedPage({
  params,
  searchParams,
}: PaymentFailedPageProps) {
  const { slug } = params;
  const reason = searchParams?.reason;

  const errorMessage = getFailureMessage(reason);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <ErrorHeading text={errorMessage.heading} />
        <ErrorMessage
          message={errorMessage.message}
          explanation={errorMessage.explanation}
        />

        <div className="mt-8 space-y-4">
          <PrimaryRetryButton
            onClick={() => {
              // Clear current reason from URL
              window.location.href = `/${slug}/contribute/payment`;
            }}
          >
            Try Again
          </PrimaryRetryButton>

          <SecondaryButton
            onClick={() => {
              window.location.href = `/${slug}/contribute/payment?clear_method=true`;
            }}
          >
            Use a Different Payment Method
          </SecondaryButton>
        </div>

        <FooterLinks slug={slug} />
      </div>
    </div>
  );
}
```

---

## 8. Responsive Behavior

### Mobile (375px - 767px)
- Full-width content, 16px padding
- Heading 24px, centered
- Error message centered, max 80 chars per line
- Buttons full-width, 48px height
- Links vertical stack, centered
- Font sizes: Body 14px, labels 14px

### Tablet (768px - 1023px)
- Content max-width 600px, centered
- Heading 28px
- Buttons 60% width max 400px
- Same fonts as mobile
- Links horizontal layout on desktop

### Desktop (1024px+)
- Content max-width 700px, centered
- Heading 28px, large
- Buttons 60% width max 400px
- Links horizontal, spaced
- All text center-aligned

---

## 9. Animations & Micro-interactions

### Page Load
- **Duration:** 0.3s fade-in
- **Effect:** Content fades in from bottom (translateY +10px)

### Button Interactions
- **Hover:** Border/bg shift, 0.15s ease-out
- **Active:** Scale 0.98, brief tactile feedback
- **Loading:** Spinner appears, text may change to "Retrying..."

### Link Hover
- **Duration:** 0.1s
- **Effect:** Underline appears, color darkens

---

## 10. Accessibility (WCAG 2.1 AA)

### Semantic HTML
- **Heading:** h1 for error message
- **Landmarks:** `<main>`, `<section>`
- **Links:** Descriptive text

### Color Contrast
- **Error icon (red) on white:** 5.3:1 ✓
- **Text-gray-900 on white:** 16.4:1 ✓
- **Text-gray-700 on white:** 10:1 ✓
- **Sage (#6B9E88) on white:** 4.8:1 ✓

### Interactive Elements
- **Buttons:** Min 44x44px touch target
- **Links:** Min 44px height with padding
- **Focus visible:** Blue 2px outline on all interactive elements

### Screen Reader
```typescript
<h1 role="alert" aria-live="assertive" aria-atomic="true">
  ❌ Payment Didn't Go Through
</h1>

<p aria-label="Payment error explanation">
  Hmm, your payment didn't go through...
</p>

<ul aria-label="Common reasons for payment failure">
  <li>Card details were incorrect</li>
  <li>Insufficient funds</li>
</ul>

<button aria-label="Retry payment with same payment method">
  Try Again
</button>

<button aria-label="Select a different payment method">
  Use a Different Payment Method
</button>
```

### Keyboard Navigation
- **Tab order:** Heading (no focus) → Try Again → Different Method → Contact Support → Back
- **Enter/Space:** Activate buttons
- **All elements reachable via keyboard**

---

## 11. Error Handling & Edge Cases

### Edge Case: User cleared sessionStorage
- **Handling:** Don't restore data, redirect to beginning of flow
- **UX:** Friendly message "Your session expired. Let's start fresh."
- **Fallback:** Offer to start over (create new dreamboard link)

### Edge Case: Very old failed session (>30 minutes)
- **Handling:** Clear data automatically
- **User sees:** Fresh payment failed page without pre-filled data
- **UX:** Ask user to try again from beginning

### Edge Case: Multiple payment attempts in quick succession
- **Handling:** Rate-limit at backend (max 3 attempts per 10 minutes)
- **Message:** "You've tried too many times. Please wait 10 minutes before trying again."
- **Offer:** "Contact support if you need help" link

### Edge Case: Dreamboard expired during payment retry
- **Handling:** Check expiration on page load
- **Display:** "This Dreamboard has closed. No contribution recorded."
- **Link:** Back to home

### Edge Case: Contribution record deleted (timing issue)
- **Handling:** Gracefully degrade, allow user to start fresh
- **Message:** "We couldn't find your contribution. Please try again."

### Edge Case: No reason parameter (unknown failure)
- **Handling:** Show default message (3.2 above)
- **Log:** Server-side error tracking `payment_failure_unknown`

---

## 12. Testing Checklist

- [ ] Error heading displays correctly with icon
- [ ] Error message displays correct heading based on reason parameter
- [ ] Explanation bullets display in correct order
- [ ] "Try Again" button navigates to payment page
- [ ] "Try Again" preserves form data (amount, name, message)
- [ ] "Different Method" button navigates and clears method selection
- [ ] Form data is preserved on both retry options
- [ ] "Contact Support" link navigates correctly
- [ ] "Back to Dreamboard" link navigates correctly
- [ ] Mobile layout stacks vertically
- [ ] Desktop layout centers content
- [ ] Focus indicators visible on all buttons and links
- [ ] Keyboard navigation works (Tab order)
- [ ] Screen reader announces error message
- [ ] Color contrast meets WCAG AA standards
- [ ] Session data expires after 30 minutes
- [ ] No sensitive data in URL parameters
- [ ] Touch targets are 44x44px minimum
- [ ] Page loads without flash of content
- [ ] Error messages are friendly, not technical

---

## 13. Testing Scenarios

### Scenario 1: Card Declined
- **Setup:** PayFast returns payment_status = FAILED
- **Expected:** Show "Card Declined" error message
- **Verify:** Explanation bullets match declined scenario

### Scenario 2: Insufficient Funds
- **Setup:** PayFast returns error code for low balance
- **Expected:** Show "Insufficient Funds" message
- **Verify:** Buttons offer "Try Again" and "Different Method"

### Scenario 3: User Cancels on PayFast
- **Setup:** User clicks "Back" on PayFast page
- **Expected:** Redirect to payment-failed?reason=user_cancelled
- **Verify:** Friendly message "You cancelled the payment"

### Scenario 4: Network Error During SnapScan
- **Setup:** SnapScan polling times out
- **Expected:** Show "Connection Error" message
- **Verify:** Suggest retrying with stable connection

### Scenario 5: Old Session Recovery
- **Setup:** User waits 45 minutes, then clicks retry
- **Expected:** Session data cleared, show fresh page
- **Verify:** No pre-filled data, offer to start fresh

---

## 14. Success Metrics

- **Retry completion rate:** 70%+ (users who attempt "Try Again")
- **Successful second attempt:** 85%+ (of retry attempts)
- **Method switching rate:** 15-20% (users who try "Different Method")
- **Support contact rate:** <5% (good error explanations)
- **Bounce rate:** <30% (users who abandon after failure)
- **Time to retry:** <30 seconds (quick decision)
- **Form data recovery success:** 95%+ (preserved data on retry)
- **Mobile completion:** 80%+ (device parity with desktop)

---

## 15. Post-Payment-Failure Actions

### When User Successfully Retries
1. Payment processes normally (see 11-CONTRIBUTE-PAYMENT.md)
2. On success: Redirect to `/[slug]/thanks` (same as successful payment)
3. Clear failed attempt data from sessionStorage
4. Log event `payment_failed_then_succeeded` for analytics

### When User Gives Up
1. Contribution remains in `pending` state in database
2. Background job: After 24 hours, send email "Complete your contribution"
3. If still pending after 7 days, contribution expires (no refund needed, never charged)
4. Log event `payment_failed_abandoned` for analytics

### Support Escalation
- **When user clicks "Contact Support":**
  - Pre-fill support form with failure reason
  - Offer to resend receipt or refund (if somehow charged)
  - Provide ticket tracking


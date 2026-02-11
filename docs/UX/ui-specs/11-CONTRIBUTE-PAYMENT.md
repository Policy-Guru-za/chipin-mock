# 11 — CONTRIBUTE PAYMENT (Payment Processing)

**Route:** `/[slug]/contribute/payment`
**Purpose:** Display payment method options and process payment securely
**Audience:** Contributors ready to pay
**Device Priority:** Mobile-first
**Context:** User has filled amount + details; now ready to pay

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/app/(guest)/[slug]/contribute/payment/page.tsx`, `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx`, `src/lib/payments/index.ts`.
- Runtime payment methods are:
  - PayFast (POST form handoff)
  - Ozow (redirect)
  - SnapScan (QR panel)
- Provider availability is environment-config driven and can change by deployment config.
- Fee display uses current runtime fee rules (3%, min R3, max R500) and total is shown before submission.

## 1. Screen Overview

This is the **payment collection screen** where contributors select a payment method and complete the transaction:

1. **Contribution summary** (amount + child name)
2. **Payment method selection** (PayFast card, Ozow EFT, or SnapScan)
3. **Process payment** via provider-specific flow (form post, redirect, or QR)

Philosophy: **Frictionless, secure, trusted.** Contributors want to complete payment in <60 seconds. Clear trust signals (lock icon, provider logos) build confidence.

---

## 2. Visual Layout

### Mobile (375px viewport)
```
┌─────────────────────────────────────┐
│                                     │
│  Complete your contribution          │
│  (Fraunces 24px, bold)              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Contributing R350 to Emma's         │
│  Dreamboard                        │
│  (Outfit 16px, text-gray-600)       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  HOW WOULD YOU LIKE TO PAY?         │
│  (Outfit 12px, uppercase, gray)     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 💳 Credit or Debit Card         ││
│  │                                 ││
│  │ Visa, Mastercard, Amex          ││
│  │ Processing with PayFast         ││
│  │                                 ││
│  │ [✓ Selected]                    ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📱 SnapScan                     ││
│  │                                 ││
│  │ Scan a QR code with your         ││
│  │ banking app                      ││
│  │                                 ││
│  │ [ ] Select                      ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Pay R350 →                      ││
│  │  (Sage button)                   ││
│  └─────────────────────────────────┘│
│                                     │
│  🔒 Payments secured by PayFast      │
│                                     │
└─────────────────────────────────────┘
```

### Desktop (1024px viewport)
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Complete your contribution                                    │
│                                                                │
│  Contributing R350 to Emma's Dreamboard                       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  HOW WOULD YOU LIKE TO PAY?                                    │
│                                                                │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ 💳 Credit or Debit Card  │  │ 📱 SnapScan             │   │
│  │                          │  │                          │   │
│  │ Visa, Mastercard, Amex   │  │ Scan a QR code with     │   │
│  │ Processing with PayFast  │  │ your banking app        │   │
│  │                          │  │                          │   │
│  │ [✓ Selected]             │  │ [ ] Select              │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Pay R350 →                                            │   │
│  │  (Sage button, 60% width max 400px)                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  🔒 Payments secured by PayFast                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### SnapScan QR Modal (Overlay)
```
┌────────────────────────────────────┐
│                                    │
│  Pay with SnapScan                 │
│                                    │
│  Scan this QR code with your       │
│  banking app to pay R350           │
│                                    │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │   [QR CODE IMAGE]            │ │
│  │   320x320px                  │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Waiting for payment...            │
│  (spinner)                         │
│                                    │
│  Timeout in 4:32                   │
│                                    │
│  ┌────────────────────────────────┐│
│  │  Didn't work? Try another way  ││
│  │  [Use Card Instead]            ││
│  └────────────────────────────────┘│
│                                    │
│  [X close]                         │
│                                    │
└────────────────────────────────────┘
```

---

## 3. Section-by-Section Specification

### 3.1 Header Section

**Purpose:** Show where contributor is in flow
**Display:** Simple, no breadcrumb
**Styling:** White background, subtle shadow

#### Heading
- **Text:** `"Complete your contribution"` (Fraunces 24px, 700 weight, text-gray-900)
- **Positioning:** Left-aligned
- **Spacing:** 24px top padding, 16px bottom

---

### 3.2 Contribution Summary

**Purpose:** Remind contributor of amount + recipient
**Display:** Prominent, clear

#### Summary Line
- **Text:** `"Contributing R[amount] to [Child]'s Dreamboard"` (Outfit 16px, text-gray-600)
- **Font weight:** 500 (semi-bold)
- **Color:** Gray-600
- **Spacing:** 24px margin below
- **Layout:** Single line on desktop, wraps on mobile

#### Amount Emphasis (Optional)
- **Amount in bold:** `"Contributing **R350**"` — emphasize the number
- **Child name in regular:** Rest of text normal weight

---

### 3.3 Payment Method Selector

**Purpose:** Choose payment provider
**Display:** Card-based buttons, clickable/hoverable
**Type:** Radio button group styled as cards

#### Container
- **Layout:** 2 columns on mobile (side-by-side if space), 2 columns on desktop
- **Gap:** 12px between cards
- **Padding:** 24px horizontal on mobile, 48px on desktop
- **Max-width:** 800px container

#### Payment Method Cards (Unselected)
- **Background:** White
- **Border:** 1px solid gray-200
- **Rounded:** `rounded-lg`
- **Padding:** 20px
- **Min-height:** 140px (mobile), 160px (desktop)
- **Hover:** Border gray-300, bg gray-50, cursor pointer
- **Transition:** 0.2s ease-out

#### Payment Method Cards (Selected)
- **Background:** Sage tint `#E8F5F0` (from-[#E4F0E8])
- **Border:** 2px solid teal `#0D9488`
- **Padding:** 20px (maintained)
- **Check mark:** ✓ in top-right corner (sage color, 24px font)

#### Card Content (Credit/Debit Card)
```
💳 Credit or Debit Card

Visa, Mastercard, Amex
Processing with PayFast

[Logo: PayFast 40x40px]
```

- **Icon:** 💳 emoji (32px) or card SVG
- **Title:** Outfit 16px, 600 weight, text-gray-900
- **Description:** Outfit 14px, text-gray-600, line-height 1.5
- **Logo:** PayFast logo 40x40px, gray-400 color

#### Card Content (SnapScan)
```
📱 SnapScan

Scan a QR code with your
banking app

[Logo: SnapScan 40x40px]
```

- **Icon:** 📱 emoji (32px) or phone SVG
- **Title:** Outfit 16px, 600 weight, text-gray-900
- **Description:** Outfit 14px, text-gray-600
- **Logo:** SnapScan logo 40x40px, colored (red/orange if available)

#### Radio Button Styling
- **Hidden native radio:** `input[type="radio"]` opacity-0
- **Custom indicator:** Circle with checkmark on select
- **Placement:** Top-right of card
- **Size:** 24x24px
- **Color:** Sage `#6B9E88` when selected
- **Focus:** 2px blue outline on card (focus-visible)

#### Default Selection
- **Credit/Debit Card** is pre-selected (most common, highest conversion)
- **Display:** Card already in "selected" state on load

---

### 3.4 Primary CTA

**Purpose:** Initiate payment
**Display:** Full-width button below method selector
**Styling:** Sage filled button

#### Button
- **Text:** `"Pay R[amount] →"` (Outfit 16px, 600 weight, white text)
- **Background:** Sage `#6B9E88`
- **Border:** None
- **Padding:** 16px vertical, 24px horizontal
- **Rounded:** `rounded-lg`
- **Width:** 100% on mobile, 60% max 400px on desktop
- **Hover:** bg `#5A8E78` (darker)
- **Active:** bg `#4A7E68`
- **Disabled:** opacity-50, cursor-not-allowed (if no method selected)
- **Shadow:** `shadow-soft` on hover

#### Click Behavior
- **If Card selected:** Show loading state (spinner + "Processing payment..."), redirect to PayFast form (see 3.5)
- **If SnapScan selected:** Show QR code modal, poll for payment status (see 3.6)
- **Loading:** Show spinner inside button for entire transaction

#### Accessibility
- **ARIA:** `aria-label="Pay R350 for contribution"`, `aria-disabled` if invalid state
- **Keyboard:** Enter/Space to submit

---

### 3.5 Card Payment (PayFast Redirect)

**Purpose:** Delegate payment to PayFast
**Flow:** User clicks "Pay R[amount]" → Client creates PayFast form → Auto-submit → Redirect to PayFast hosted page

#### PayFast Form (Hidden, Auto-submitted)
```html
<form
  id="payfast-form"
  method="POST"
  action="https://www.payfast.co.za/eng/process" (live)
  target="_blank"
>
  <!-- Merchant -->
  <input type="hidden" name="merchant_id" value={PAYFAST_MERCHANT_ID} />
  <input type="hidden" name="merchant_key" value={PAYFAST_MERCHANT_KEY} />

  <!-- Payment Info -->
  <input type="hidden" name="return_url" value={`https://gifta.co.za/${slug}/thanks`} />
  <input type="hidden" name="cancel_url" value={`https://gifta.co.za/${slug}/payment-failed`} />
  <input type="hidden" name="notify_url" value={`https://api.gifta.co.za/webhooks/payfast`} />

  <!-- Amount -->
  <input type="hidden" name="amount" value={amount} />
  <input type="hidden" name="item_name" value={`Contribution to ${child.name}'s Dreamboard`} />
  <input type="hidden" name="item_description" value={itemDescription} />

  <!-- Reference -->
  <input type="hidden" name="custom_str1" value={contribution_id} />
  <input type="hidden" name="custom_str2" value={dreamboard_slug} />

  <!-- Security -->
  <input type="hidden" name="signature" value={generateSignature()} />

  <!-- Email -->
  <input type="hidden" name="email_confirmation" value="1" />
  <input type="hidden" name="confirmation_address" value={contributor_email} />
</form>
```

#### Form Generation (Server-side)
```typescript
// lib/payfast.ts
export function generatePayFastForm(
  contribution: Contribution,
  dreamboard: Dreamboard
): string {
  const amount = (contribution.amount / 100).toFixed(2); // Convert cents to rands
  const itemName = `Contribution to ${dreamboard.child.name}'s Dreamboard`;
  const itemDescription = `Birthday gift contribution for ${dreamboard.child.name}`;

  const data = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${dreamboard.slug}/thanks`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${dreamboard.slug}/payment-failed`,
    notify_url: `${process.env.API_BASE_URL}/webhooks/payfast`,
    amount: amount,
    item_name: itemName,
    item_description: itemDescription,
    custom_str1: contribution.id,
    custom_str2: dreamboard.slug,
    email_confirmation: '1',
    confirmation_address: contribution.email,
  };

  const signature = generateSignature(data, process.env.PAYFAST_PASSPHRASE);
  data.signature = signature;

  return buildFormHTML(data);
}

function generateSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  let signatureString = '';

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      signatureString += `${key}=${encodeURIComponent(data[key])}&`;
    }
  }

  if (passphrase) {
    signatureString += `passphrase=${encodeURIComponent(passphrase)}`;
  }

  return md5(signatureString);
}
```

#### Button Click Handler
```typescript
const handlePaymentSubmit = async (method: 'card' | 'snapscan') => {
  if (method === 'card') {
    setIsLoading(true);
    try {
      // Get PayFast form HTML from server
      const formHTML = await getPayFastForm(contributionId);

      // Inject form into DOM
      const formContainer = document.createElement('div');
      formContainer.innerHTML = formHTML;
      document.body.appendChild(formContainer);

      // Auto-submit form
      const form = document.querySelector('#payfast-form') as HTMLFormElement;
      form.submit();

      // Keep loading state active during redirect
    } catch (error) {
      setIsLoading(false);
      setError('Failed to process payment. Please try again.');
    }
  }
};
```

#### Return from PayFast
- **Success:** PayFast redirects to `/[slug]/thanks` (after webhook confirmation)
- **Cancel:** PayFast redirects to `/[slug]/payment-failed` (user clicked back/cancel)
- **Webhook:** PayFast server calls `/api/webhooks/payfast` with payment confirmation (async, updated contribution status to "completed")

---

### 3.6 SnapScan Payment (QR Code + Polling)

**Purpose:** Generate QR code, user scans with banking app, wait for payment
**Flow:** User clicks "Pay R[amount]" → Generate SnapScan QR → Modal shows QR → Poll status → Auto-redirect on success

#### SnapScan QR Modal

**Container:**
- **Position:** Fixed, centered overlay
- **Background:** Backdrop rgba(0, 0, 0, 0.5), clickable to close (or X button only)
- **Card:** White, rounded-2xl, shadow-lifted, 400px max-width (mobile), 500px (desktop)

**Content:**
- **Title:** `"Pay with SnapScan"` (Fraunces 20px, text-gray-900)
- **Instruction:** `"Scan this QR code with your banking app to pay R[amount]"` (Outfit 14px, text-gray-600)
- **QR image:** 320x320px (mobile), 400x400px (desktop), centered
- **Status text:** `"Waiting for payment..."` (Outfit 14px, text-gray-700)
- **Spinner:** Rotating icon, 24px, sage color
- **Timer:** `"Timeout in 4:32"` (Outfit 12px, text-gray-500), counts down from 5 mins
- **Fallback button:** `"Didn't work? Try another way"` → `/[slug]/contribute/payment` to select card
- **Close button:** X icon, top-right, closes modal + returns to method selection

#### Timer Display
- **Countdown:** 5 minutes (300 seconds)
- **Format:** `MM:SS`
- **Update:** Every 1 second
- **At 0s:** Auto-close modal, show error state

```typescript
const [timeRemaining, setTimeRemaining] = useState(300);

useEffect(() => {
  const interval = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        handleSnapScanTimeout();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

#### QR Code Generation
```typescript
// lib/snapscan.ts
import QRCode from 'qrcode'; // Use qrcode npm package

export async function generateSnapScanQR(
  amount: number,
  reference: string,
  description: string
): Promise<string> {
  // SnapScan QR format: https://api.snapscan.io/qr/{id}
  // or use Stitch/OAuth for dynamic QR generation

  const snapScanUrl = `https://www.snapscan.io/code/${process.env.SNAPSCAN_MERCHANT_CODE}`;
  const qrData = JSON.stringify({
    amount: (amount / 100).toFixed(2), // Convert to rands
    reference: reference,
    description: description,
  });

  const qrCodeImage = await QRCode.toDataURL(snapScanUrl, {
    width: 320,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return qrCodeImage;
}

// In API endpoint:
export async function POST(req: NextRequest) {
  const { amount, reference, description } = await req.json();

  const qrCodeImage = await generateSnapScanQR(amount, reference, description);

  return NextResponse.json({
    qr_code: qrCodeImage,
    snapscan_id: generateSnapScanId(),
  });
}
```

#### Polling for Payment Status
```typescript
// hooks/useSnapScanPolling.ts
export function useSnapScanPolling(
  snapscanId: string,
  contributionId: string,
  onSuccess: () => void,
  onTimeout: () => void,
  timeoutSeconds: number = 300
) {
  const [status, setStatus] = useState('waiting');

  useEffect(() => {
    const startTime = Date.now();
    const pollInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed > timeoutSeconds * 1000) {
        clearInterval(pollInterval);
        onTimeout();
        return;
      }

      try {
        const response = await fetch(
          `/api/contributions/${contributionId}/snapscan-status`
        );
        const { status: paymentStatus } = await response.json();

        if (paymentStatus === 'completed') {
          clearInterval(pollInterval);
          setStatus('completed');
          onSuccess();
        }
      } catch (error) {
        console.error('SnapScan status check failed:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [snapscanId, contributionId]);

  return status;
}
```

#### Fallback to Card
- **Button:** `"Didn't work? Try another way"` (Ghost style, sage text)
- **Action:** Close modal, return to method selection, auto-focus Card button
- **Optional:** Log analytics event `snapscan_fallback_clicked`

---

### 3.7 Trust Badge

**Purpose:** Reassure about payment security
**Display:** Below button, center-aligned

#### Text & Icon
- **Copy:** `"🔒 Payments secured by PayFast"` (Outfit 12px, text-gray-500)
- **Icon:** 🔒 emoji or lock SVG (16x16px)
- **Link:** Optional, points to PayFast security page (noopener, noreferrer)

---

## 4. Component Tree (React Hierarchy)

```
<ContributePaymentPage slug={string} contributionId={string}>
  <Metadata title="Complete Payment - Gifta" />

  <Header>
    <Heading text="Complete your contribution" />
  </Header>

  <ContributionSummary
    amount={number}
    childName={string}
  />

  <PaymentMethodSelector
    selectedMethod={string}
    onSelect={(method) => setSelectedMethod(method)}
  >
    <PaymentMethodCard
      method="card"
      title="💳 Credit or Debit Card"
      description="Visa, Mastercard, Amex"
      logo={PayFastLogo}
      selected={selectedMethod === 'card'}
    />
    <PaymentMethodCard
      method="snapscan"
      title="📱 SnapScan"
      description="Scan a QR code with your banking app"
      logo={SnapScanLogo}
      selected={selectedMethod === 'snapscan'}
    />
  </PaymentMethodSelector>

  <PrimaryCallToAction
    amount={number}
    loading={isLoading}
    disabled={!selectedMethod}
    onClick={() => handlePaymentSubmit(selectedMethod)}
  >
    Pay R{amount} →
  </PrimaryCallToAction>

  {selectedMethod === 'snapscan' && (
    <SnapScanQRModal
      amount={number}
      contributionId={string}
      onSuccess={() => redirectToThanks()}
      onTimeout={() => showError()}
      onFallback={() => resetToCard()}
    >
      <QRCodeImage qrCode={qrImage} />
      <SnapScanStatusPoller
        contributionId={string}
        timeoutSeconds={300}
      />
    </SnapScanQRModal>
  )}

  <TrustBadge text="🔒 Payments secured by PayFast" />

  <ErrorState error={error}>
    <ErrorMessage message={error} />
    <RetryButton />
  </ErrorState>
</ContributePaymentPage>
```

---

## 5. TypeScript Interfaces

```typescript
// Page Props
interface ContributePaymentPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    contribution_id?: string;
  };
}

// Component Props
interface ContributionSummaryProps {
  amount: number;
  childName: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: 'card' | 'snapscan';
  onSelect: (method: 'card' | 'snapscan') => void;
}

interface PaymentMethodCardProps {
  method: 'card' | 'snapscan';
  title: string;
  description: string;
  logo: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

interface SnapScanQRModalProps {
  amount: number;
  contributionId: string;
  qrCode: string;
  onSuccess: () => void;
  onTimeout: () => void;
  onFallback: () => void;
  onClose: () => void;
}

interface TrustBadgeProps {
  text: string;
  link?: string;
}

// API Models
interface PayFastFormRequest {
  contribution_id: string;
  amount: number;
  child_name: string;
}

interface PayFastFormResponse {
  html: string; // Form HTML to submit
}

interface SnapScanQRRequest {
  amount: number;
  reference: string;
  description: string;
}

interface SnapScanQRResponse {
  qr_code: string; // Base64 data URL
  snapscan_id: string;
}

interface SnapScanStatusRequest {
  contribution_id: string;
}

interface SnapScanStatusResponse {
  status: 'waiting' | 'completed' | 'failed' | 'timeout';
  payment_id?: string;
}

// PayFast Webhook
interface PayFastWebhookPayload {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: 'COMPLETE' | 'FAILED' | 'PENDING';
  item_name: string;
  item_description: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1: string; // contribution_id
  custom_str2: string; // dreamboard_slug
  signature: string;
  email_address?: string;
  timestamp: string;
}
```

---

## 6. File Structure

```
src/
├── app/
│   └── [slug]/
│       └── contribute/
│           └── payment/
│               ├── page.tsx                    # Main payment page
│               ├── layout.tsx
│               ├── error.tsx
│               └── loading.tsx
├── components/
│   └── contribute/
│       ├── ContributePayment/
│       │   ├── ContributePayment.tsx          # Container
│       │   ├── ContributionSummary.tsx
│       │   ├── PaymentMethodSelector.tsx
│       │   ├── PaymentMethodCard.tsx
│       │   ├── SnapScanQRModal.tsx
│       │   ├── TrustBadge.tsx
│       │   └── PayFastForm.tsx                # Hidden form
│       └── shared/
│           ├── PrimaryCallToAction.tsx
│           └── ErrorMessage.tsx
├── lib/
│   ├── payfast.ts                             # PayFast integration
│   ├── snapscan.ts                            # SnapScan integration
│   ├── qrcode.ts                              # QR code generation
│   └── signature.ts                           # PayFast signature generation
├── hooks/
│   ├── useSnapScanPolling.ts                  # Poll SnapScan status
│   └── usePaymentMethod.ts                    # Payment method state
├── api/
│   ├── webhooks/
│   │   └── payfast.ts                         # PayFast webhook handler
│   ├── contributions/[id]/
│   │   ├── snapscan-status.ts                 # Get SnapScan status
│   │   └── payfast-form.ts                    # Generate PayFast form
│   └── snapscan/
│       ├── qr.ts                              # Generate QR code
│       └── status.ts                          # Check payment status
└── types/
    └── payment.ts                             # TypeScript definitions
```

---

## 7. Data Fetching & Payment Processing

### Get PayFast Form (Server-side)
```typescript
// app/api/[slug]/contributions/[id]/payfast-form.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePayFastForm } from '@/lib/payfast';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const contribution = await db.contribution.findUnique({
    where: { id: params.id },
    include: {
      dreamboard: { include: { child: true } },
    },
  });

  if (!contribution) {
    return NextResponse.json(
      { error: 'Contribution not found' },
      { status: 404 }
    );
  }

  const formHTML = await generatePayFastForm(contribution, contribution.dreamboard);

  return NextResponse.json({
    html: formHTML,
  });
}
```

### PayFast Webhook Handler
```typescript
// app/api/webhooks/payfast.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayFastSignature } from '@/lib/payfast';

export async function POST(req: NextRequest) {
  const payload = await req.json() as PayFastWebhookPayload;

  // Verify signature
  const isValid = verifyPayFastSignature(payload, process.env.PAYFAST_PASSPHRASE);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  const contributionId = payload.custom_str1;
  const dreamboardSlug = payload.custom_str2;

  // Update contribution based on payment status
  const status = payload.payment_status === 'COMPLETE' ? 'completed' : 'failed';

  const contribution = await db.contribution.update({
    where: { id: contributionId },
    data: {
      status,
      payment_id: payload.pf_payment_id,
      payment_fee: parseFloat(payload.amount_fee),
      payment_amount_net: parseFloat(payload.amount_net),
      paid_at: status === 'completed' ? new Date() : null,
    },
  });

  // Update dreamboard total raised
  if (status === 'completed') {
    await db.dreamboard.update({
      where: { slug: dreamboardSlug },
      data: {
        total_raised: {
          increment: contribution.amount,
        },
      },
    });

    // Trigger thank you email, SMS notification, etc.
    // (handled by job queue or immediate action)
    await triggerContributionNotifications(contribution);
  }

  return NextResponse.json({ success: true });
}
```

### SnapScan Status Polling
```typescript
// app/api/contributions/[id]/snapscan-status.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contribution = await db.contribution.findUnique({
    where: { id: params.id },
  });

  if (!contribution) {
    return NextResponse.json(
      { error: 'Contribution not found' },
      { status: 404 }
    );
  }

  // Check if payment was completed (via webhook from SnapScan provider)
  return NextResponse.json({
    status: contribution.status, // 'pending', 'completed', 'failed'
  });
}
```

---

## 8. Responsive Behavior

### Mobile (375px - 767px)
- Full-width cards, 16px horizontal padding
- Payment method cards stack vertically or 2-column grid
- QR code 320x320px
- Button full-width, 48px height
- Fonts: Body 14px, headings 16-20px

### Tablet (768px - 1023px)
- Form max-width 600px, centered
- Payment method cards side-by-side
- QR code 360x360px
- Button 60% width max 400px
- Same fonts as mobile

### Desktop (1024px+)
- Form max-width 700px
- Payment method cards: 2 columns
- QR code 400x400px
- Button 60% width max 400px
- Fonts: Body 14px, headings 24px

---

## 9. Animations & Micro-interactions

### Page Load
- **Duration:** 0.3s fade-in
- **Effect:** Entire form fades in

### Payment Method Card Selection
- **Duration:** 0.2s
- **Effect:** Border color + background change, no scale shift
- **Easing:** ease-out

### QR Modal Open
- **Duration:** 0.3s
- **Effect:** Slide up from bottom (mobile) or fade in (desktop)
- **Easing:** ease-out

### Loading State (Button)
- **Duration:** Entire API call duration
- **Effect:** Spinner rotates continuously, text fades to "Processing..."
- **Spinner speed:** 2s per rotation

### Timer Countdown
- **Duration:** 5 minutes, 1s updates
- **Update:** Smooth number change (no animation needed, just text update)

---

## 10. Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- **Tab order:** Method cards → Button → Modal (if SnapScan)
- **Enter/Space:** Select method, submit payment
- **Esc:** Close SnapScan modal

### Screen Reader Announcements
```typescript
<fieldset>
  <legend>How would you like to pay?</legend>
  <input
    type="radio"
    id="card"
    name="payment_method"
    aria-label="Credit or Debit Card, Visa, Mastercard, Amex"
    aria-checked={selectedMethod === 'card'}
  />
  <label htmlFor="card">Credit or Debit Card...</label>
</fieldset>

<button
  aria-label={`Pay R${amount} with ${selectedMethod}`}
  aria-busy={isLoading}
>
  Pay R{amount} →
</button>

<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading && 'Processing payment...'}
  {error && `Payment error: ${error}`}
</div>
```

### Focus Indicators
- **Style:** 2px solid blue-500 outline, 2px offset
- **Visible on all interactive elements**

### Color Contrast
- **All text:** >4.5:1 with background (WCAG AA)
- **Sage (#6B9E88) on white:** 4.8:1 ✓
- **Text-gray-900 on white:** 16.4:1 ✓

### Modal Accessibility
- **ARIA:** `role="alertdialog"`, `aria-modal="true"`, `aria-label="Pay with SnapScan"`
- **Focus trap:** Esc to close, focus returns to button
- **Backdrop:** Clickable to close (clear affordance)

---

## 11. Error Handling

### Method Selection Error
**Display:** Disabled submit button with tooltip

```
Please select a payment method
```

### PayFast Redirect Failure
**Display:** Error page after timeout or redirect

```
Hmm, we couldn't process your payment.

Your card details were not sent.

[Try again] [Use different method] [Contact support]
```

### SnapScan QR Generation Failure
**Display:** Error in modal

```
Oops! We couldn't generate the QR code.

[Retry] [Try card instead]
```

### SnapScan Timeout (5 minutes)
**Display:** Modal closes, error shows

```
Payment didn't go through in time.

[Try again with SnapScan] [Use card instead]
```

### Network Error
**Display:** Toast notification + retry button

```
Connection error. Please check your internet and try again.
[Retry]
```

### Webhook Failure
- **Internal error:** Contribution stays in `pending` state
- **Manual reconciliation:** Admin dashboard shows unmatched contributions
- **User sees:** Redirect to thank you page (optimistic), but actual payment status checked on next page load

---

## 12. Edge Cases

### Edge Case: User closes tab during payment
- **Behavior:** Payment may complete via webhook (async)
- **User experience:** Return to payment page later, see "completed" status
- **Handling:** Check status on page load, redirect to thanks if already paid

### Edge Case: User refreshes page mid-payment
- **Behavior:** Prevent duplicate submissions (use POST-Redirect-GET pattern)
- **Handling:** Check if contribution status already "completed"

### Edge Case: Invalid/expired amount (stale session)
- **Behavior:** Dreamboard expired or amount changed
- **Handling:** Check on load, show error "This Dreamboard has closed"

### Edge Case: SnapScan QR invalid/expired
- **Behavior:** User scans after modal timeout
- **Handling:** SnapScan should reject expired QR, user sees payment failed
- **Fallback:** Show error, offer card option

### Edge Case: User clicks pay twice (double-submit)
- **Prevention:** Disable button immediately on click
- **Server:** Check for duplicate contribution (same email + amount + seconds), reject second

### Edge Case: Very slow network (>30s payment)
- **Display:** Keep loading state active
- **Timeout:** After 60s, show "Still processing, please wait..." message
- **Don't timeout:** Keep polling in background

### Edge Case: User on slow 2G network
- **PayFast:** External redirect, fine
- **SnapScan:** QR generation may be slow, show spinner
- **Timeout:** Increase timeout to 10 minutes for slow networks (detect via `navigator.connection.effectiveType`)

---

## 13. Testing Checklist

- [ ] Payment method cards render correctly (default provider honors availability)
- [ ] Method cards are clickable and show selection state
- [ ] "Pay R[amount]" button shows correct amount
- [ ] Button disabled until method selected
- [ ] Click button with PayFast → form submit handoff works
- [ ] Click button with Ozow → redirect handoff works
- [ ] Click button with SnapScan → QR panel opens
- [ ] SnapScan QR code generates and displays correctly
- [ ] SnapScan "Check payment status" and "Choose another method" actions work
- [ ] Successful provider callback reaches `/thanks`
- [ ] Network errors show error message
- [ ] Trust badge displays correctly
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader announces method options and payment status
- [ ] Mobile layout stacks vertically
- [ ] Desktop layout shows 2-column method cards
- [ ] Focus indicators visible on all elements
- [ ] Loading state shows spinner and prevents re-submit

---

## 14. Success Metrics

- **Payment method selection mix:** PayFast / Ozow / SnapScan distribution tracked and reviewed
- **Payment completion rate:** 95%+ (industry standard ~90%)
- **Time to complete payment:** <60 seconds (after page load)
- **SnapScan success rate:** 80%+ (QR generation + scan success)
- **Fallback usage:** <5% (users who switch provider after a failed first attempt)
- **Error rate:** <1% (network, processing)
- **Mobile completion rate:** 85%+ (device parity)
- **Bounce rate:** <10% (after clicking "Pay")

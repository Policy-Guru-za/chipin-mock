# 12 — CONTRIBUTE THANK YOU (Celebration & Gratitude)

**Route:** `/[slug]/thanks`
**Purpose:** Celebrate contribution, provide receipt, encourage sharing
**Audience:** Contributors who just completed payment
**Device Priority:** Mobile-first
**Context:** Payment succeeded; show joy, gratitude, and options to engage further

---

## 1. Screen Overview

This is the **celebration screen** — the emotional payoff for making a gift contribution. It:

1. **Celebrates** with confetti animation
2. **Confirms** contribution details
3. **Shows impact** (charity split, if applicable)
4. **Offers receipts** (email capture)
5. **Encourages sharing** (return others to Dreamboard)
6. **Builds loyalty** (contact support, next steps)

Philosophy: **Joyful, grateful, not transactional.** This is the brand moment where contributors feel good about their choice. Design should feel celebratory and personal.

---

## 2. Visual Layout

### Mobile (375px viewport)
```
┌─────────────────────────────────────┐
│                                     │
│  ✨✨✨ CONFETTI BURST ✨✨✨     │
│  (3 seconds, celebratory colors)   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  🎉 Thank you, Sarah! 💝            │
│  (Fraunces 24px, bold, centered)    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Your contribution of R250 will      │
│  help make Emma's birthday extra     │
│  special.                           │
│  (Outfit 16px, centered, warm text) │
│                                     │
│  Emma's parents have been           │
│  notified. 💝                       │
│  (Outfit 14px, text-gray-600)       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [CHARITY SECTION - if enabled]     │
│  💚 A GIFT THAT GIVES TWICE         │
│  R50 of your contribution will      │
│  support Ikamva Youth. Thank you    │
│  for giving twice! 💚               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  WANT A RECEIPT?                    │
│  (Outfit 12px, uppercase, gray)     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ sarah@example.com               ││
│  │ (Email input, optional)          ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Send Receipt                   ││
│  │  (Ghost button)                 ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📤 Share This Dreamboard      ││
│  │  (Sage filled button)           ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Back to Dreamboard ←              │
│  (Text link)                        │
│                                     │
│  Need help? Contact us              │
│  (Text link)                        │
│                                     │
└─────────────────────────────────────┘
```

### Desktop (1024px viewport)
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ✨✨✨✨ CONFETTI BURST ✨✨✨✨                       │
│  (3 seconds, celebratory colors)                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                 🎉 Thank you, Sarah! 💝                        │
│                 (Fraunces 28px, centered)                      │
│                                                                │
│       Your contribution of R250 will help make Emma's          │
│       birthday extra special.                                  │
│       (Outfit 16px, centered)                                  │
│                                                                │
│       Emma's parents have been notified. 💝                    │
│       (Outfit 14px)                                            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │                                                          │  │
│ │ 💚 A GIFT THAT GIVES TWICE                             │  │
│ │                                                          │  │
│ │ R50 of your contribution will support Ikamva Youth.     │  │
│ │ Thank you for giving twice! 💚                          │  │
│ │                                                          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         WANT A RECEIPT?                                        │
│                                                                │
│         ┌──────────────────────────────────────────────────┐  │
│         │ sarah@example.com                               │  │
│         │ (Email input)                                   │  │
│         └──────────────────────────────────────────────────┘  │
│                                                                │
│         ┌──────────────────────────────────────────────────┐  │
│         │  Send Receipt                                    │  │
│         └──────────────────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         ┌──────────────────────────────────────────────────┐  │
│         │  📤 Share This Dreamboard                      │  │
│         │  (Sage filled button, 50% width)               │  │
│         └──────────────────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         Back to Dreamboard ←    Need help? Contact us         │
│         (Text links, centered)                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Section-by-Section Specification

### 3.1 Confetti Animation

**Purpose:** Create joy and celebration
**Display:** Full-screen, above all content
**Duration:** 3 seconds total (fade in 0.2s, hold 2.5s, fade out 0.3s)
**Timing:** Trigger on page mount (not after delay)

#### Animation Details
- **Type:** Canvas-based or CSS particles
- **Particle count:** 50-100 pieces
- **Particle shapes:** Circles, squares, confetti pieces
- **Particle colors (Gifta palette):**
  - Teal `#0D9488`
  - Sage `#6B9E88`
  - Warm gold `#C4956A`
  - Hero accent `#C4785A`
  - Soft pink `#F5C6AA`
  - Light blue `#A8D4E6`
  - Light green `#B8E0B8`
- **Particle size:** 4px - 12px diameter
- **Initial position:** Top of viewport, spread horizontally
- **Animation:** Fall down screen with gravity (accelerate), slight rotation
- **Easing:** Ease-in for descent
- **Opacity:** Fade to 0 in final 0.5s
- **Z-index:** Above all content but allow interaction with elements behind

#### Implementation (Canvas)
```typescript
import Confetti from 'react-confetti'; // or custom implementation

export function ConfettiAnimation() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

  return (
    <Confetti
      width={typeof window !== 'undefined' ? window.innerWidth : 1000}
      height={typeof window !== 'undefined' ? window.innerHeight : 800}
      numberOfPieces={80}
      recycle={false}
      run={isActive}
      colors={['#0D9488', '#6B9E88', '#C4956A', '#C4785A', '#F5C6AA', '#A8D4E6']}
    />
  );
}
```

#### CSS Alternative
```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.confetti-piece {
  position: fixed;
  pointer-events: none;
  animation: confetti-fall 3s ease-in forwards;
}

.confetti-fade-out {
  animation: confetti-fall 3s ease-in forwards;
}
```

---

### 3.2 Main Thank You Message

**Purpose:** Celebrate contributor by name
**Display:** Prominent, warm, personal
**Styling:** Centered text, large font

#### Heading
- **Text:** `"🎉 Thank you, [Name]! 💝"` (Fraunces 24px mobile, 28px desktop, 700 weight)
- **Color:** text-gray-900
- **Emoji:** 🎉 at start, 💝 at end (or other celebratory emojis: 🎊, 🥳, 🎈)
- **Positioning:** Centered
- **Spacing:** 24px margin below

#### Description Lines
- **Primary:** `"Your contribution of R[amount] will help make [Child]'s birthday extra special."` (Outfit 16px, text-gray-700, centered)
- **Secondary:** `"[Child]'s parents have been notified. 💝"` (Outfit 14px, text-gray-600, centered)
- **Spacing:** 16px between lines
- **Line height:** 1.6 (generous spacing for readability)

#### Dynamic Text Variations
- **Anonymous contributor:** `"Your anonymous contribution of R[amount] will help make [Child]'s birthday extra special."`
- **With message:** If contributor left birthday message, show success message: `"Thank you for your message! Emma's parents will treasure it."`

---

### 3.3 Charitable Giving Section (Conditional)

**Purpose:** Highlight social impact if enabled
**Display:** Only if `charitable_giving.enabled === true`
**Background:** Green tint `#F0F7F4`
**Border:** 1px solid rgba(11, 125, 100, 0.1)
**Styling:** `rounded-2xl`, centered card

#### Heading
- **Text:** `"💚 A GIFT THAT GIVES TWICE"` (Outfit 14px, uppercase, teal `#0D9488`)
- **Emoji:** 💚 heart
- **Spacing:** 20px padding inside card

#### Impact Statement
- **Text:** `"R[amount] of your contribution will support [Charity Name]. Thank you for giving twice! 💚"`
- **Format:** `"R[charity_allocation_amount] of your contribution will support [Charity Name]."`
- **Example:** `"R50 of your contribution will support Ikamva Youth. Thank you for giving twice! 💚"`
- **Font:** Outfit 14px, text-gray-700
- **Color:** Teal-accented
- **Spacing:** 16px padding

#### Dynamic Amount Calculation
```typescript
const charityAmount = amount * (charitable_giving.allocation_percentage / 100);
// Example: 250 * 0.20 = 50
```

#### Accessibility
- **ARIA:** `role="complementary"`, `aria-label="Charitable giving impact"`

---

### 3.4 Receipt Capture Section

**Purpose:** Provide proof of contribution for records
**Display:** Optional, non-intrusive
**Styling:** Subtle card, `rounded-lg`

#### Section Label
- **Text:** `"WANT A RECEIPT?"` (Outfit 12px, uppercase, text-gray-500)
- **Positioning:** Left-aligned above input

#### Email Input
- **Type:** `type="email"`
- **Placeholder:** `"you@example.com"` (gray-400)
- **Font:** Outfit 14px, text-gray-900
- **Padding:** 12px left/right, 8px top/bottom
- **Height:** 44px (touch target)
- **Border:** 1px solid gray-200
- **Rounded:** `rounded-lg`
- **Focus:** Border teal, shadow-focus
- **Validation:** Standard email regex, HTML5 `type="email"` validation

#### Submit Button
- **Style:** Ghost button (white bg, sage border, sage text)
- **Text:** `"Send Receipt"` (Outfit 14px, 600 weight)
- **Width:** 100% or auto (full input width)
- **Hover:** bg sage-50, border darker
- **Active:** bg sage-100
- **Disabled:** opacity-50 if input invalid
- **Loading state:** Show spinner, text "Sending..."

#### Pre-fill (Optional)
- **Attempt to pre-fill** with email from contribution record (if available)
- **Allow user to edit** before sending
- **Don't force:** If pre-filled, make it easy to change

#### Success Message
- **Toast notification:** `"Receipt sent to your email!"` (Outfit 14px)
- **Duration:** Show 3s, auto-dismiss
- **Position:** Bottom center (mobile) or top-right (desktop)
- **Background:** Green tint `#F0F7F4`
- **Icon:** ✓ checkmark (teal)

#### Error Message
- **Toast notification:** `"Couldn't send receipt. Please check your email and try again."` (Outfit 14px, red-600)
- **Dismissible:** Manual close or 5s auto-dismiss
- **Retry button:** Show inline

#### Email Template
**Subject:** `"Your Gifta Receipt – Contribution to Emma's Birthday"`

**Body:**
```
Hi Sarah,

Thank you for your contribution to Emma's Dreamboard! 🎉

Contribution Details:
- Child: Emma
- Amount: R250.00
- Date: 20 Feb 2025 at 14:32 SAST
- Status: Completed ✓

Your contribution will help make Emma's birthday extra special.

Charity Impact:
R50 of your contribution will support Ikamva Youth.

If you have any questions, contact us at support@gifta.co.za.

Thank you for giving! 💝

Gifta Team
```

---

### 3.5 Share CTA

**Purpose:** Encourage return sharing and viral growth
**Display:** Prominent, action-oriented button
**Styling:** Sage filled button (primary action)

#### Button Style
- **Style:** Filled (primary action, not ghost)
- **Background:** Sage `#6B9E88`
- **Text Color:** White
- **Text:** `"📤 Share This Dreamboard"` (Outfit 16px, 600 weight)
- **Icon:** 📤 upload emoji or share SVG
- **Padding:** 16px vertical, 24px horizontal
- **Rounded:** `rounded-lg`
- **Width:** 100% on mobile, 60% max 400px on desktop
- **Hover:** bg darker sage `#5A8E78`
- **Active:** bg `#4A7E68`
- **Shadow:** `shadow-soft` on hover

#### Click Behavior
- **Trigger:** Open native share sheet (mobile) or copy link (desktop)
- **Native share API:** Use `navigator.share()` if available
- **Fallback:** Copy link to clipboard + show toast

#### Share Text
- **Title:** `"Help Emma's birthday dream come true! 🎁"`
- **Text:** `"Sarah just contributed to Emma's birthday gift. Chip in to help make her birthday extra special on Gifta."`
- **URL:** `https://gifta.co.za/[dreamboard_slug]`

#### Implementation
```typescript
const handleShare = async () => {
  const shareData = {
    title: `Help ${child.name}'s birthday dream come true!`,
    text: `I just contributed to ${child.name}'s Dreamboard. Chip in to help make their birthday extra special!`,
    url: `https://gifta.co.za/${slug}`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      // Analytics: Share attempt
    } catch (err) {
      // User cancelled share
    }
  } else {
    // Fallback: Copy to clipboard
    const fullText = `${shareData.text}\n${shareData.url}`;
    navigator.clipboard.writeText(fullText);
    showToast('Link copied to clipboard!', 'success', 3000);
  }
};
```

---

### 3.6 Secondary Links (Footer)

**Purpose:** Allow navigation and support access
**Display:** Text links, subtle styling
**Spacing:** Below share button, 24px gap

#### "Back to Dreamboard" Link
- **Text:** `"← Back to Dreamboard"` (Outfit 14px, sage text)
- **Color:** Sage `#6B9E88` on hover darken
- **Action:** Navigate to `/[slug]` (return to public Dreamboard)
- **Underline:** On hover

#### "Contact Support" Link
- **Text:** `"Need help? Contact us"` (Outfit 14px, sage text)
- **Color:** Sage `#6B9E88`
- **Action:** Open help widget or navigate to `/support`
- **Target:** `_self` or modal depending on implementation

#### Layout (Mobile)
- **Vertical stack** (full-width)
- **Centered text**
- **24px gap between**

#### Layout (Desktop)
- **Horizontal layout** (centered, side-by-side)
- **"·" divider** between links (optional)
- **Spacing:** 24px horizontal gap

---

## 4. Component Tree (React Hierarchy)

```
<ContributionThankYouPage slug={string}>
  <Metadata
    title={`Thank you! – Gifta`}
    description={`Your contribution to ${child.name}'s Dreamboard is complete.`}
  />

  <ConfettiAnimation duration={3000} />

  <MainContent>
    <ThankYouMessage
      contributorName={string}
      amount={number}
      childName={string}
      hasMessage={boolean}
    />

    {dreamboard.charitable_giving?.enabled && (
      <CharitableGivingSection
        charity={Charity}
        contribution_amount={number}
        allocation_percentage={number}
      />
    )}

    <ReceiptCaptureSection
      onSubmit={(email) => sendReceipt(email)}
      defaultEmail={string}
    >
      <EmailInput
        value={email}
        onChange={(val) => setEmail(val)}
        onError={(err) => setEmailError(err)}
      />
      <SubmitButton
        disabled={!isValidEmail(email)}
        loading={isSending}
        onClick={() => sendReceipt(email)}
      />
    </ReceiptCaptureSection>

    <ShareCTA
      slug={slug}
      childName={string}
      onClick={() => handleShare()}
    />

    <FooterLinks>
      <BackToDreamBoardLink href={`/${slug}`} />
      <ContactSupportLink href="/support" />
    </FooterLinks>
  </MainContent>

  <SuccessToast
    message={string}
    visible={showSuccessToast}
    onDismiss={() => setShowSuccessToast(false)}
  />

  <ErrorBoundary>
    <ErrorFallback error={error} />
  </ErrorBoundary>
</ContributionThankYouPage>
```

---

## 5. TypeScript Interfaces

```typescript
// Page Props
interface ContributionThankYouPageProps {
  params: {
    slug: string;
  };
}

// Component Props
interface ConfettiAnimationProps {
  duration: number;
  colors?: string[];
  numberOfPieces?: number;
}

interface ThankYouMessageProps {
  contributorName: string;
  amount: number;
  childName: string;
  hasMessage: boolean;
  isAnonymous: boolean;
}

interface CharitableGivingSectionProps {
  charity: {
    name: string;
    description: string;
  };
  contributionAmount: number;
  allocationPercentage: number;
}

interface ReceiptCaptureSectionProps {
  defaultEmail?: string;
  onSubmit: (email: string) => Promise<void>;
}

interface ShareCTAProps {
  slug: string;
  childName: string;
  onClick: () => void;
}

// API Models
interface SendReceiptRequest {
  contribution_id: string;
  email: string;
}

interface SendReceiptResponse {
  success: boolean;
  message: string;
}

// Data Models
interface ReceiptEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface ThankYouPageData {
  contribution: Contribution;
  dreamboard: Dreamboard;
  child: Child;
  charity?: Charity;
}
```

---

## 6. File Structure

```
src/
├── app/
│   └── [slug]/
│       └── thanks/
│           ├── page.tsx                    # Main thank you page
│           ├── layout.tsx
│           ├── error.tsx
│           └── loading.tsx
├── components/
│   └── contribution/
│       ├── ThankYou/
│       │   ├── ContributionThankYou.tsx   # Container
│       │   ├── ConfettiAnimation.tsx
│       │   ├── ThankYouMessage.tsx
│       │   ├── CharitableGivingSection.tsx
│       │   ├── ReceiptCaptureSection.tsx
│       │   ├── ShareCTA.tsx
│       │   └── FooterLinks.tsx
│       └── shared/
│           ├── Toast.tsx
│           └── ErrorBoundary.tsx
├── lib/
│   ├── email.ts                           # Email sending (receipt)
│   ├── sharing.ts                         # Share data formatting
│   └── formatting.ts                      # Currency, date formatting
├── api/
│   ├── contributions/[id]/
│   │   └── send-receipt.ts                # Send receipt email
│   └── sharing/
│       └── share-preview.ts               # Preview for share
├── hooks/
│   ├── useShare.ts                        # Share functionality
│   └── useToast.ts                        # Toast notifications
└── types/
    └── thankYou.ts                        # TypeScript definitions
```

---

## 7. Data Fetching & Email

### Fetch Thank You Page Data
```typescript
// app/[slug]/thanks/page.tsx
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';

interface ThankYouPageProps {
  params: { slug: string };
  searchParams?: { contribution_id?: string };
}

export const dynamic = 'force-dynamic'; // No caching

export default async function ThankYouPage({
  params,
  searchParams,
}: ThankYouPageProps) {
  // Get contribution_id from URL param or session
  const contributionId = searchParams?.contribution_id;

  if (!contributionId) {
    redirect(`/${params.slug}`);
  }

  const contribution = await db.contribution.findUnique({
    where: { id: contributionId },
    include: {
      dreamboard: {
        include: {
          child: true,
          charitable_giving: {
            include: { charity: true },
          },
        },
      },
    },
  });

  if (
    !contribution ||
    contribution.status !== 'completed' ||
    contribution.dreamboard.slug !== params.slug
  ) {
    notFound();
  }

  return (
    <ContributionThankYou
      contribution={contribution}
      dreamboard={contribution.dreamboard}
    />
  );
}
```

### Send Receipt Email
```typescript
// app/api/contributions/[id]/send-receipt.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendReceiptEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json() as SendReceiptRequest;
  const { email } = body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email address' },
      { status: 400 }
    );
  }

  const contribution = await db.contribution.findUnique({
    where: { id: params.id },
    include: {
      dreamboard: {
        include: {
          child: true,
          charitable_giving: {
            include: { charity: true },
          },
        },
      },
    },
  });

  if (!contribution) {
    return NextResponse.json(
      { error: 'Contribution not found' },
      { status: 404 }
    );
  }

  try {
    await sendReceiptEmail(contribution, email);

    // Log for audit
    await db.receiptEmail.create({
      data: {
        contribution_id: contribution.id,
        email_address: email,
        sent_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Receipt sent to your email',
    });
  } catch (error) {
    console.error('Failed to send receipt:', error);
    return NextResponse.json(
      { error: 'Failed to send receipt. Please try again.' },
      { status: 500 }
    );
  }
}
```

### Email Template Rendering
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail(
  contribution: Contribution,
  recipientEmail: string
): Promise<void> {
  const subject = `Your Gifta Receipt – Contribution to ${contribution.dreamboard.child.name}'s Birthday`;

  const charityText = contribution.dreamboard.charitable_giving
    ? `\n\nCharity Impact:\nR${(
        contribution.amount *
        (contribution.dreamboard.charitable_giving.allocation_percentage / 100)
      ).toFixed(
        2
      )} of your contribution will support ${
        contribution.dreamboard.charitable_giving.charity.name
      }.`
    : '';

  const plainText = `
Hi ${contribution.display_name || 'Contributor'},

Thank you for your contribution to ${contribution.dreamboard.child.name}'s Dreamboard! 🎉

Contribution Details:
- Child: ${contribution.dreamboard.child.name}
- Amount: R${(contribution.amount / 100).toFixed(2)}
- Date: ${new Date(contribution.paid_at).toLocaleString('en-ZA')}
- Status: Completed ✓

Your contribution will help make ${contribution.dreamboard.child.name}'s birthday extra special.
${charityText}

If you have any questions, contact us at support@gifta.co.za.

Thank you for giving! 💝

Gifta Team
https://gifta.co.za
  `;

  const htmlText = `
    <h1>Thank You! 🎉</h1>
    <p>Hi ${contribution.display_name || 'Contributor'},</p>
    <p>Thank you for your contribution to <strong>${contribution.dreamboard.child.name}'s Dreamboard</strong>!</p>

    <h2>Contribution Details</h2>
    <ul>
      <li><strong>Child:</strong> ${contribution.dreamboard.child.name}</li>
      <li><strong>Amount:</strong> R${(contribution.amount / 100).toFixed(2)}</li>
      <li><strong>Date:</strong> ${new Date(contribution.paid_at).toLocaleString('en-ZA')}</li>
      <li><strong>Status:</strong> Completed ✓</li>
    </ul>

    <p>Your contribution will help make ${contribution.dreamboard.child.name}'s birthday extra special.</p>

    ${
      contribution.dreamboard.charitable_giving
        ? `<h2>Charity Impact 💚</h2>
         <p>R${(
           contribution.amount *
           (contribution.dreamboard.charitable_giving.allocation_percentage / 100)
         ).toFixed(2)} of your contribution will support <strong>${
           contribution.dreamboard.charitable_giving.charity.name
         }</strong>.</p>`
        : ''
    }

    <p>If you have any questions, contact us at <a href="mailto:support@gifta.co.za">support@gifta.co.za</a>.</p>

    <p><strong>Thank you for giving! 💝</strong></p>

    <p>
      <a href="https://gifta.co.za">Gifta Team</a>
    </p>
  `;

  await resend.emails.send({
    from: 'Gifta <noreply@gifta.co.za>',
    to: recipientEmail,
    subject,
    html: htmlText,
    text: plainText,
  });
}
```

---

## 8. Responsive Behavior

### Mobile (375px - 767px)
- Full-width content, 16px padding
- Confetti full viewport height
- Heading 24px, centered
- Cards full-width with spacing
- Button full-width, 48px height
- Links vertical stack, centered
- Toast bottom center

### Tablet (768px - 1023px)
- Form max-width 600px, centered
- Confetti full viewport
- Heading 28px
- Cards same as mobile with max-width container
- Button 60% width max 400px
- Links horizontal layout (side-by-side)

### Desktop (1024px+)
- Form max-width 700px, centered
- Full viewport confetti
- Heading 28px, large
- Cards max-width 600px
- Button 60% width max 400px
- Links horizontal, spaced apart
- Toast top-right

---

## 9. Animations & Micro-interactions

### Confetti (Page Load)
- **Duration:** 3s total
- **Effect:** 50-100 particles falling from top with rotation
- **Easing:** Ease-in for descent
- **Colors:** Gifta palette
- **Auto-dismiss:** After 3s

### Content Fade-In (After Confetti)
- **Duration:** 0.5s
- **Effect:** All text and buttons fade in from bottom (translateY +20px)
- **Delay:** Start after confetti begins (staggered)

### Toast Notification (Success)
- **Duration:** 3s (auto-dismiss)
- **Effect:** Slide up + fade in (0.3s), hold 2.5s, fade out (0.2s)
- **Position:** Bottom center (mobile) or top-right (desktop)

### Button Hover States
- **Share button:** Border/bg color shift, 0.15s ease-out
- **Links:** Underline + color shift on hover

### Email Input Focus
- **Duration:** 0.15s
- **Effect:** Border color to teal, shadow glow
- **Outline:** Blue focus ring

---

## 10. Accessibility (WCAG 2.1 AA)

### Semantic HTML
- **Heading hierarchy:** h1 for "Thank you", h2 for sections (receipt, charity)
- **Landmarks:** `<main>`, `<section>`, `<footer>`
- **Links:** Descriptive text (not "click here")

### Color Contrast
- **Text-gray-900 on white:** 16.4:1 ✓
- **Sage (#6B9E88) on white:** 4.8:1 ✓
- **Text-gray-600 on white:** 7:1 ✓

### Interactive Elements
- **Buttons:** Min 44x44px touch target
- **Links:** Min 44px height with padding
- **Focus visible:** Blue 2px outline, 2px offset on all interactive elements
- **Keyboard navigation:** Tab order (Share → Email → Send → Back to Board → Contact)

### Screen Reader Announcements
```typescript
<h1 aria-live="polite" aria-atomic="true">
  🎉 Thank you, {name}! 💝
</h1>

<section aria-label="Receipt capture">
  <label htmlFor="receipt_email">Want a receipt?</label>
  <input id="receipt_email" type="email" />
</section>

<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage && `Receipt sent to ${email}`}
</div>
```

### ARIA Labels
```html
<button aria-label="Share this Dreamboard on social media or messaging apps">
  📤 Share This Dreamboard
</button>

<a aria-label="Return to Emma's Dreamboard to view other contributors">
  ← Back to Dreamboard
</a>
```

### Modal/Dialog Management
- No modal on this page; just toasts
- Toast dismissible via close button or auto-dismiss

---

## 11. Error Handling

### Email Send Failure
**Display:** Error toast + retry option

```
Couldn't send receipt. Please check your email and try again.
[Retry]
```

**Auto-retry:** No, require user action

### Invalid Email
**Display:** Inline validation error below input

```
❌ Please enter a valid email address
```

**Validation:** On blur or submit attempt

### Network Error (During Receipt Send)
**Display:** Toast notification

```
Connection error. Please try again later.
[Retry]
```

### Missing Data (Contribution expired)
**Display:** Error page

```
Hmm, we couldn't load your receipt.

Your contribution may have expired. Check your email for confirmation.

[Return to home]
```

---

## 12. Edge Cases

### Edge Case: User closes page before confetti finishes
- **Handling:** Confetti auto-unmounts after 3s
- **No issues:** No state cleanup needed

### Edge Case: User has already received receipt (receipts table has duplicate)
- **Handling:** Allow re-sending (no hard limit)
- **UX:** Show success message each time

### Edge Case: Email already in use (user contributes again)
- **Handling:** Allow re-sending to same email (OK)
- **Unique identifier:** Contribution ID in email template

### Edge Case: Very long contributor name (>50 chars in email)
- **Handling:** Truncate in greeting, show full in receipt table
- **Example:** `"Hi Jo..."` but receipt shows `"Jonathan Smith-Johnson"`

### Edge Case: Share API not available (older browsers)
- **Fallback:** Copy URL to clipboard + show toast
- **Toast:** `"Link copied! Paste it in your messages."`

### Edge Case: User's email provider blocks receipt (spam)
- **Handling:** No way to prevent, but email should come from trusted sender
- **Solution:** Use SPF/DKIM/DMARC for authentication

### Edge Case: Contributor is anonymous
- **Handling:** Don't pre-fill email from record (don't reveal identity)
- **Greeting:** `"🎉 Thank you! 💝"` (no name)

---

## 13. Testing Checklist

- [ ] Confetti animation plays on page load (3 seconds)
- [ ] Thank you message displays contributor name
- [ ] Contribution amount displays correctly (R[X])
- [ ] Child name displays correctly
- [ ] Charity section shows when enabled
- [ ] Charity allocation amount calculated correctly
- [ ] Email input accepts valid email addresses
- [ ] Email input rejects invalid emails
- [ ] Send receipt button disabled until email valid
- [ ] Send receipt shows loading state
- [ ] Send receipt success toast displays
- [ ] Send receipt error toast displays (with retry)
- [ ] Share button triggers native share API (mobile)
- [ ] Share button copies URL to clipboard (desktop fallback)
- [ ] Back to Dreamboard link navigates correctly
- [ ] Contact Support link navigates or opens widget
- [ ] Keyboard navigation works (Tab order)
- [ ] Screen reader announces all sections
- [ ] Focus indicators visible
- [ ] Mobile layout stacks vertically
- [ ] Desktop layout centers content
- [ ] Error page shows if data invalid/missing
- [ ] Toast notifications auto-dismiss or are dismissible

---

## 14. Success Metrics

- **Page load time:** <1s (minimal JS)
- **Confetti visibility:** >95% (most users see animation)
- **Share completion rate:** >30% (users who share link)
- **Receipt capture rate:** 20-40% (email opt-in)
- **Return visitor rate (share):** >5% (contributors who follow share link)
- **Bounce rate:** <5% (very high engagement expected)
- **Mobile conversion:** >85% (device parity)
- **Email delivery:** >95% (few bounces)


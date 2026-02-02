# ChipIn User Journeys

> **Version:** 2.0.0  
> **Last Updated:** February 2026  
> **Status:** Platform Simplification In Progress

---

## Overview

ChipIn has two primary user journeys:

1. **Host Journey** — Creating and managing a Dream Board
2. **Guest Journey** — Viewing and contributing to a Dream Board

Both journeys are optimized for mobile-first usage via WhatsApp distribution.

**Key Changes in v2.0:**
- Gift is defined manually by parent (not from Takealot catalog)
- AI generates whimsical artwork for the gift
- Guests see % funded only (not Rand amounts)
- Karri Card is the sole payout method
- WhatsApp notifications throughout the journey

---

## Host Journey: Creating a Dream Board

### Journey Overview

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  LAND   │──▶│  AUTH   │──▶│  CHILD  │──▶│  GIFT   │──▶│ DETAILS │──▶│  SHARE  │
│         │   │         │   │         │   │         │   │         │   │         │
│ Welcome │   │ Magic   │   │ Photo + │   │ Gift +  │   │ Karri + │   │ Get     │
│ + CTA   │   │ Link    │   │ Name    │   │ Artwork │   │WhatsApp │   │ Link    │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

### Step 1: Landing & Call to Action

**URL:** `chipin.co.za`

**Screen Elements:**
- Hero headline: "Turn 20 toys into one dream gift"
- Subheadline: "Friends chip in together for your child's birthday"
- Primary CTA: "Create a Dream Board" (large, prominent)
- Secondary: "How it works" (scroll anchor)
- Social proof: "2,500+ dream gifts funded" (once we have data)

**User Action:** Clicks "Create a Dream Board"

**Transition:** → Step 2

---

### Step 2: Authentication (Magic Link)

**URL:** `chipin.co.za/create`

**Screen Elements:**
- Heading: "Let's get started"
- Email input field
- "Send magic link" button
- Helper text: "We'll email you a link to continue"
- Privacy note: "We never share your email"

**User Action:** Enters email, clicks send

**System Action:**
1. Generate magic link token (UUID, 1-hour expiry)
2. Store token in Vercel KV
3. Send email via Resend with link

**Email Content:**
```
Subject: Your ChipIn magic link ✨

Hi there!

Click below to create your Dream Board:

[Continue to ChipIn →]

This link expires in 1 hour.

— The ChipIn Team
```

**Screen After Send:**
- "Check your email!"
- "We sent a link to {email}"
- "Didn't receive it? [Resend]"

**User Action:** Opens email, clicks magic link

**Transition:** → Step 3

---

### Step 3: Child Details

**URL:** `chipin.co.za/create/child`

**Screen Elements:**
- Progress indicator: Step 1 of 4
- Heading: "Who's the birthday star?"

**Form Fields:**

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| Child's first name | Text input | 2-30 chars, letters only | Yes |
| Child's photo | Image upload | Max 5MB, jpg/png/webp | Yes |
| Party date | Date picker | Future date within 6 months | Yes |

**Photo Upload UX:**
- Tap area shows camera icon + "Add photo"
- Opens native file picker (mobile: camera option)
- Shows circular preview after upload
- "Change photo" option appears

**Validation Messages:**
- "Please enter your child's first name"
- "Please upload a photo of your child"
- "Please select a birthday date"

**User Action:** Fills form, clicks "Continue"

**System Action:**
1. Upload image to Vercel Blob
2. Store child details in session/draft
3. Navigate to next step

**Transition:** → Step 4

---

### Step 4: Dream Gift Definition

**URL:** `chipin.co.za/create/gift`

**Screen Elements:**
- Progress indicator: Step 2 of 4
- Heading: "What's {childName}'s dream gift?"
- Subheading: "Describe the gift in your own words"

**Form Fields:**

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| Gift name | Text input | 2-200 chars | Yes |
| Gift description | Textarea | 10-500 chars (for AI artwork) | Yes |
| Goal amount | Currency input | R100 - R50,000 | Yes |

**AI Artwork Generation:**

```
┌─────────────────────────────────────┐
│  Gift description:                  │
│  ┌─────────────────────────────────┐│
│  │ A shiny red mountain bike with  ││
│  │ training wheels and a bell      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌───────────────────────────────┐  │
│  │   ✨ Generate Artwork         │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Loading animation while generating]│
│                                     │
│  ┌─────────────────────────────────┐│
│  │     [AI Generated Artwork]      ││
│  │                                 ││
│  │  Whimsical watercolor-style    ││
│  │  illustration of the gift      ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [🔄 Regenerate]                    │
│                                     │
└─────────────────────────────────────┘
```

**Gift Preview Card:**
```
┌─────────────────────────────────┐
│  [AI Generated Artwork]         │
│                                 │
│  Mountain Bike with Bells      │
│  Goal: R2,500                   │
│                                 │
│  [✓ Artwork Generated]          │
└─────────────────────────────────┘
```

**Validation:**
- Gift name required (2-200 chars)
- Gift description required (10-500 chars)
- AI artwork must be generated
- Goal amount required (R100 minimum)
- "Please generate artwork before continuing"

**User Action:** Enters gift details, generates artwork, clicks "Continue"

**Transition:** → Step 5

---

### Step 5: Payout & Contact Details

**URL:** `chipin.co.za/create/details`

**Screen Elements:**
- Progress indicator: Step 3 of 4
- Heading: "Almost done!"

**Form Fields:**

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| Karri Card number | Card input | 16 digits, Luhn valid | Yes |
| Cardholder name | Text input | 2-100 chars | Yes |
| WhatsApp number | Phone input | Valid SA mobile (07x/08x/06x) | Yes |
| Email address | Email input | Valid email format | Yes |
| Personal message | Textarea | Max 280 chars | No |

**Karri Card Section:**
```
┌─────────────────────────────────────┐
│  Where should we send the funds?   │
│                                     │
│  Karri Card Number:                │
│  ┌─────────────────────────────────┐│
│  │ •••• •••• •••• 1234             ││
│  └─────────────────────────────────┘│
│                                     │
│  Cardholder Name:                  │
│  ┌─────────────────────────────────┐│
│  │ Maya Thompson                   ││
│  └─────────────────────────────────┘│
│                                     │
│  ℹ️ Funds will be credited to this │
│     card when the pot closes       │
│                                     │
└─────────────────────────────────────┘
```

**WhatsApp Notifications:**
```
┌─────────────────────────────────────┐
│  Get notified via WhatsApp         │
│                                     │
│  WhatsApp Number:                  │
│  ┌─────────────────────────────────┐│
│  │ +27 82 123 4567                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ✅ Notify me when someone         │
│     contributes                     │
│  ✅ Notify me when pot is funded   │
│  ✅ Notify me when payout is sent  │
│                                     │
└─────────────────────────────────────┘
```

**Personal Message:**
- Placeholder: "E.g., Maya would love your contribution toward her dream bike!"
- Character counter: "0/280"

**Note:** Party date from Step 3 serves as the pot close date.

**User Action:** Fills form, clicks "Review & Create"

**Transition:** → Step 6

---

### Step 6: Review & Share

**URL:** `chipin.co.za/create/review`

**Screen Elements:**
- Progress indicator: Step 4 of 4
- Heading: "Review your Dream Board"

**Preview Card (exactly as guests will see):**
```
┌─────────────────────────────────┐
│        [Child Photo]            │
│                                 │
│    Maya's 7th Birthday          │
│                                 │
│    [AI Generated Gift Artwork]  │
│    Mountain Bike with Bells     │
│                                 │
│    ████░░░░░░ 0% funded         │
│                                 │
│    "Maya would love your        │
│     contribution toward her     │
│     dream bike!"                │
│                                 │
│    ⏰ Party in 14 days          │
│                                 │
│    [Contribute →]               │
└─────────────────────────────────┘
```

**Note:** Guests see percentage funded only. Rand amounts are visible to host only.

**Actions:**
- "Edit" links next to each section (→ back to respective step)
- "Create Dream Board" button (primary)

**User Action:** Reviews, clicks "Create Dream Board"

**System Action:**
1. Create Dream Board record in database
2. Generate unique slug: `maya-7th-birthday-{random6chars}`
3. Upload finalized image if needed
4. Set status to 'active'

**Post-Creation Screen:**

**URL:** `chipin.co.za/dashboard/{dreamBoardId}` (or `/success`)

**Screen Elements:**
- 🎉 "Your Dream Board is live!"
- Shareable link in copy-able text box
- Share buttons:
  - "Share via WhatsApp" (deep link)
  - "Copy link"
  - "Share via Email" (mailto)
- Preview of the live Dream Board

**WhatsApp Share Template:**
```
🎂 Maya's 7th Birthday!

Help fund Maya's dream gift — a Mountain Bike with Bells!

👉 chipin.co.za/maya-7th-birthday-abc123

Every contribution helps! 💝
```

**WhatsApp Notification to Host:**
```
🎉 Your Dream Board is live!

Share this link with party guests:
chipin.co.za/maya-7th-birthday-abc123

You'll receive notifications when friends chip in.
```

---

## Host Journey: Managing a Dream Board

### Dashboard View

**URL:** `chipin.co.za/dashboard`

**Screen Elements:**
- List of host's Dream Boards
- Each card shows:
  - Child name + photo thumbnail
  - Progress: "R1,200 / R2,499 (48%)"
  - Status badge: "Active" / "Funded" / "Closed"
  - Deadline: "5 days left"
  - Contributor count: "8 contributions"

**Actions per Dream Board:**
- "View" → Opens public Dream Board
- "Manage" → Opens management screen

### Management Screen

**URL:** `chipin.co.za/dashboard/{dreamBoardId}`

**Tabs/Sections:**

#### Overview Tab
- Full preview of Dream Board
- Progress visualization (% AND Rand amount - host view)
- Quick stats: Total raised, # contributors, days until party

#### Contributors Tab
- List of contributions:
  ```
  Sarah M.        R200    2 days ago    "Happy birthday Maya!"
  John D.         R150    3 days ago    
  Anonymous       R100    5 days ago    "🎉"
  ```
- Note: Amounts visible to host only, not public

#### Settings Tab
- Edit message
- Close pot early
- Cancel Dream Board

#### Payout Tab (appears when pot closes)
- "Your pot has closed!"
- Summary: Total raised, fees, payout amount
- Karri Card confirmation (ending in ****1234)
- Status: "Pending" / "Processing" / "Credited"
- Note: "Funds are credited to your Karri Card within 24 hours"

---

## Guest Journey: Contributing to a Dream Board

### Journey Overview

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  CLICK  │──▶│  VIEW   │──▶│ AMOUNT  │──▶│  PAY    │──▶│ THANKS  │
│  LINK   │   │  BOARD  │   │         │   │         │   │         │
│         │   │         │   │ Select  │   │ Payment │   │ Confirm │
│ WhatsApp│   │ Dream   │   │ R100/   │   │ Provider│   │ + Share │
│ etc.    │   │ Board   │   │ R200... │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

### Step 1: Receive & Click Link

**Context:** Guest receives link via WhatsApp, SMS, email, etc.

**Link Format:** `chipin.co.za/maya-7th-birthday-abc123`

**User Action:** Taps link

**Transition:** → Step 2

---

### Step 2: View Dream Board

**URL:** `chipin.co.za/{slug}`

**Screen Elements:**

```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────┐             │
│         │             │             │
│         │   [Photo]   │             │
│         │             │             │
│         └─────────────┘             │
│                                     │
│         Maya's 7th Birthday         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [AI Generated Gift Artwork]   │  │
│  │ Mountain Bike with Bells      │  │
│  │ Her dream gift               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░━   │
│  48% funded                        │
│                                     │
│  "Maya would love your contribution │
│   toward her dream bike!"           │
│                                     │
│  ⏰ Party in 5 days                 │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Contribute Now →         │  │
│  └───────────────────────────────┘  │
│                                     │
│  Already contributed:               │
│  Sarah • John • Anonymous + 5 more  │
│                                     │
└─────────────────────────────────────┘
```

**Note:** Guests see percentage funded only (not Rand amounts). This creates social proof without money awkwardness.

**Key Design Principles:**
- Mobile-first (designed for phone screens)
- Loads fast (<2 seconds on 3G)
- No app download prompt
- Clear, single CTA

**User Action:** Taps "Contribute Now"

**Transition:** → Step 3

---

### Step 3: Select Contribution Amount

**Screen Elements (modal or new view):**

```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  Contribute to Maya's Dream Gift    │
│                                     │
│  Choose an amount:                  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │   R50   │ │  R100   │ │  R200  │ │
│  └─────────┘ └─────────┘ └────────┘ │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Other amount: R ________        ││
│  └─────────────────────────────────┘│
│                                     │
│  Your name (optional):              │
│  ┌─────────────────────────────────┐│
│  │ ________________________________││
│  └─────────────────────────────────┘│
│  Shown to the family                │
│                                     │
│  Add a message (optional):          │
│  ┌─────────────────────────────────┐│
│  │ ________________________________││
│  │ ________________________________││
│  └─────────────────────────────────┘│
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Continue to Payment →       │  │
│  └───────────────────────────────┘  │
│                                     │
│  🔒 Secure payment by trusted        │
│                                     │
└─────────────────────────────────────┘
```

**Amount Selection:**
- Predefined buttons: R50, R100, R200
- "Other" input for custom amount
- Minimum: R20 (below this, fees eat too much)
- Maximum: R5,000 (fraud prevention)
- Default/highlighted: R100

**Optional Fields:**
- Name: Shown to host + in contributor list
- Message: Shown to host only

**Fee Display:**
- Before payment: "A 3% fee (R6) supports ChipIn"
- Or integrate into amount: "R106 total (includes R6 fee)"

**User Action:** Selects amount, optionally adds name/message, clicks "Continue to Payment"

**System Action:**
1. Create contribution record (status: 'pending')
2. Create payment request with selected provider
3. Redirect to payment provider

**Transition:** → Step 4

---

### Step 4: Payment

**Context:** User is redirected to payment provider (PayFast, Ozow, or SnapScan)

**PayFast Flow:**
1. Redirect to PayFast hosted page
2. User enters card details or selects EFT
3. Payment processed
4. Redirect back to ChipIn

**Ozow Flow:**
1. Redirect to Ozow bank selection
2. User selects bank, logs in
3. Approves payment
4. Redirect back to ChipIn

**SnapScan Flow:**
1. Display QR code
2. User scans with SnapScan app
3. Approves in app
4. Webhook confirms, page updates

**Return URL:** `chipin.co.za/{slug}/thanks?ref={paymentRef}`

---

### Step 5: Thank You & Share

**URL:** `chipin.co.za/{slug}/thanks`

**Success Screen:**
```
┌─────────────────────────────────────┐
│                                     │
│              🎉                     │
│                                     │
│        Thank you, Sarah!            │
│                                     │
│  Your R200 contribution brings      │
│  Maya closer to her dream gift!     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░   │
│  56% funded                        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Share with friends →        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   View Dream Board            │  │
│  └───────────────────────────────┘  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  💳 Get a Karri Card for your      │
│     child — safe spending,         │
│     parental controls              │
│     [Learn more →]                 │
│                                     │
└─────────────────────────────────────┘
```

**Key Elements:**
- Personalized thank you (uses name if provided)
- Updated progress bar (real-time)
- Share CTA (viral loop)
- Optional Karri promo (if partnership active)

**Share Options:**
- WhatsApp share (pre-filled message)
- Copy link
- Other share options

---

## Edge Cases & Error States

### Dream Board Not Found

**URL:** `chipin.co.za/invalid-slug`

**Screen:**
```
┌─────────────────────────────────────┐
│                                     │
│              😕                     │
│                                     │
│     Dream Board not found          │
│                                     │
│  This link may have expired or     │
│  been removed.                      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Create your own →           │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Dream Board Closed

**Screen:**
```
┌─────────────────────────────────────┐
│                                     │
│         Maya's 7th Birthday         │
│                                     │
│              ✅                     │
│                                     │
│     This Dream Board has closed    │
│                                     │
│  R2,100 was raised toward Maya's   │
│  LEGO Death Star!                   │
│                                     │
│  Want to create your own?          │
│  ┌───────────────────────────────┐  │
│  │   Create a Dream Board →      │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Payment Failed

**Return URL:** `chipin.co.za/{slug}/payment-failed`

**Screen:**
```
┌─────────────────────────────────────┐
│                                     │
│              ❌                     │
│                                     │
│     Payment unsuccessful           │
│                                     │
│  Your payment could not be         │
│  processed. No funds were taken.   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Try again →                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  Having trouble? Contact us        │
│                                     │
└─────────────────────────────────────┘
```

### Gift Fully Funded

**Screen shows success state:**
```
┌─────────────────────────────────────┐
│                                     │
│              🎉                     │
│                                     │
│     Maya's dream gift is funded!   │
│                                     │
│  100% of the goal has been         │
│  reached. Thank you to everyone    │
│  who contributed!                   │
│                                     │
│  The pot will close on the party   │
│  date and funds will be credited   │
│  to the family.                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Notification Flows

### WhatsApp Notifications (Primary)

| Event | Recipient | Message |
|-------|-----------|---------|
| Dream Board created | Host | "🎉 Your Dream Board is live! Share this link: {url}" |
| Contribution received | Host | "💝 {name} just contributed to {childName}'s Dream Board! {percentage}% funded" |
| Goal reached | Host | "🎊 Amazing! {childName}'s Dream Board is fully funded! R{amount} raised" |
| Pot closed | Host | "Your pot has closed! R{amount} will be credited to Karri Card ending in {last4}" |
| Payout credited | Host | "✅ R{amount} has been credited to your Karri Card ending in {last4}" |

### Email Notifications (Backup)

| Event | Recipient | Email Content |
|-------|-----------|---------------|
| Dream Board created | Host | "Your Dream Board is live! Here's your link..." |
| Payout credited | Host | "Funds have been credited to your Karri Card" |
| Payout failed | Host | "We couldn't credit your Karri Card. Please contact support." |

### Optional: Push Notifications (Future)

If host enables browser notifications:
- New contribution received
- Goal reached
- Party date approaching

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

- All interactive elements keyboard accessible
- Minimum contrast ratio 4.5:1 for text
- Form inputs have visible labels
- Error messages announced to screen readers
- Focus indicators visible
- Alt text for all images

### Mobile Accessibility

- Touch targets minimum 44x44px
- Sufficient spacing between interactive elements
- Readable without zooming (16px base font)
- Works in landscape and portrait

---

## Performance Requirements

### Guest Page (Critical Path)

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Largest Contentful Paint | <2.5s |
| Time to Interactive | <3.5s |
| Cumulative Layout Shift | <0.1 |

### Optimization Strategies

- Static generation for Dream Board pages (ISR)
- Image optimization via Vercel
- Minimal JavaScript for guest view
- Edge caching for repeated views

---

## Document References

| Document | Purpose |
|----------|---------|
| [UX.md](./UX.md) | Detailed screen specifications |
| [DATA.md](./DATA.md) | Data models for all entities |
| [PAYMENTS.md](./PAYMENTS.md) | Payment flow details |

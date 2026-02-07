# 09 — PUBLIC DREAM BOARD (Shared Experience)

**Route:** `/[slug]`
**Purpose:** The public-facing dream board that contributors see via WhatsApp link. This is the MOST CRITICAL UI—it must inspire generosity, feel warm and personal, and never transactional.
**Audience:** Contributors (gift-givers) accessing via shared link
**Device Priority:** Mobile-first (85% WhatsApp preview/mobile traffic)

---

## 1. Screen Overview

The Public Dreamboard is the emotional centerpiece of Gifta. Parents share this page via WhatsApp; contributors click the link and see:

- Child's photo and dream
- Contributor avatars (social proof)
- Time remaining (urgency without pressure)
- Optional charity message
- Single, clear CTA: "Chip in for [Child] 💝"

Key philosophy: **Warm, celebratory, never pushy.** This page closes the gap between "I want to send money" and actually doing it.

---

## 2. Visual Layout

### Mobile (375px viewport)
```
┌─────────────────────────────────────┐
│  ✨✨✨ SAGE GRADIENT HEADER ✨✨✨ │
│                                     │
│         [CIRCULAR PHOTO]            │
│              120px                  │
│                                     │
│      Emma's Dreamboard             │
│      (Fraunces 28px, bold)          │
│                                     │
│      Turning 8 on Feb 20, 2025      │
│      Birthday party Feb 22 (optional)│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ✨ EMMA'S ONE BIG WISH             │
│     (Warm gold label, 11px)         │
│                                     │
│     [64x64 GIFT IMG]  Nintendo      │
│                      Switch OLED    │
│                      with Joy-Con   │
│                      controllers    │
│                      (14px muted)   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  🎉 12 loved ones have chipped in   │
│                                     │
│  [👤] Mom & Dad        💝           │
│  [👤] Aunt Rachel      💝           │
│  [👤] Grandma Jo       💝           │
│  [👤] Uncle Steve      💝           │
│  [👤] Cousin Sam       💝           │
│  + 7 others ➜                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ⏰ Just 4 days left! 🎁             │
│     (Warm urgency message)          │
│                                     │
├─────────────────────────────────────┤
│ 💚 A GIFT THAT GIVES TWICE [GREEN]  │
│    [CHARITY LOGO 48px]              │
│    We're donating R200 to Ikamva    │
│    Youth. Every gift adds twice.    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Chip in for Emma 💝             ││
│  │  (Ghost button: white bg,       ││
│  │   sage border, sage text)       ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  Have questions?                    │
│  💬 Contact us                      │
│                                     │
└─────────────────────────────────────┘
```

### Desktop (1024px viewport)
```
┌────────────────────────────────────────────────────────────────┐
│  ✨✨✨✨ SAGE GRADIENT HEADER ✨✨✨✨                     │
│                                                                │
│  [CIRCULAR PHOTO]  Emma's Dreamboard                         │
│   120px            Turning 8 on Feb 20, 2025                 │
│                    Birthday party Feb 22                      │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─ MAIN CONTENT ────────────┐  ┌─ SIDEBAR ────────────────┐ │
│  │                            │  │                          │ │
│  │ ✨ EMMA'S ONE BIG WISH      │  │  🎉 12 loved ones        │ │
│  │                            │  │                          │ │
│  │ [64x64 IMG] Nintendo       │  │  [👤] Mom & Dad 💝       │ │
│  │             Switch OLED    │  │  [👤] Aunt Rachel 💝     │ │
│  │             with Joy-Con   │  │  [👤] Grandma Jo 💝      │ │
│  │                            │  │  [👤] Uncle Steve 💝     │ │
│  │ "The ultimate gaming       │  │  [👤] Cousin Sam 💝      │ │
│  │  console for creative play"│  │  [👤] Auntie Lee 💝      │ │
│  │                            │  │  [👤] Uncle Mark 💝      │ │
│  │ ⏰ Just 4 days left! 🎁     │  │  + 5 others ➜            │ │
│  │                            │  │  [View All]              │ │
│  │ 💚 A GIFT THAT GIVES TWICE  │  │                          │ │
│  │    [LOGO] Ikamva Youth      │  │  ┌────────────────────┐  │ │
│  │                            │  │  │ Chip in for Emma   │  │ │
│  │ We're donating R200 to      │  │  │ 💝                │  │ │
│  │ youth development...       │  │  └────────────────────┘  │ │
│  │                            │  │                          │ │
│  └────────────────────────────┘  └──────────────────────────┘ │
│                                                                │
│  Have questions? 💬 Contact us                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Section-by-Section Specification

### 3.1 Header Section

**Purpose:** Establish child identity and create emotional connection
**Layout:** Full-width sage gradient background, centered content on mobile, left-aligned on desktop
**Background:** `from-[#E4F0E8] to-[#D5E8DC]` (sage gradient)

#### Child Photo
- **Type:** Circular image (120px diameter)
- **Border:** 3px solid white
- **Shadow:** `shadow-soft` (0 2px 8px rgba(0,0,0,0.08))
- **Accessibility:** Alt text: "[Child]'s birthday photo"
- **Fallback:** If no photo, show initials in sage circle (48px, sage text on white)
- **Responsive:** Same size mobile + desktop

#### Child Name & Date
- **Name:** `"[Child]'s Dreamboard"` (Fraunces 28px/700 weight, text-gray-900)
- **Age Line:** `"Turning [age] on [full date]"` (Outfit 16px, text-gray-600)
- **Party Line (conditional):** `"Birthday party on [party date]"` (Outfit 14px, text-gray-500) — only show if party_date differs from birthday
- **Spacing:** 12px between elements (vertical rhythm)
- **Line Height:** 1.4

#### Background Treatment
- **Mobile:** Full bleed to edges (padding: 24px horizontal)
- **Desktop:** Contained 80% width center, max 1200px
- **Padding Vertical:** 48px top, 40px bottom

---

### 3.2 One Big Wish Section

**Purpose:** Highlight the core gift request
**Background:** White card on subtle bg `#FDF8F3`
**Card Style:** `rounded-2xl`, `shadow-soft`

#### Section Label
- **Text:** `"✨ [CHILD]'S ONE BIG WISH"` (uppercase)
- **Font:** Outfit, 11px, 700 weight, letter-spacing +1px
- **Color:** Warm gold `#C4956A`
- **Padding:** 24px left, 12px top (relative to card)

#### Gift Display
**Layout:** Horizontal stack on mobile, vertical on desktop sidebar
- **Image:** 64x64px, `rounded-lg`, `shadow-soft`
- **Gap:** 16px between image and text
- **Gift Name:** Fraunces 20px, 700 weight, text-gray-900
- **Gift Description:** Outfit 14px, text-gray-500, max 100 chars
- **Spacing:** 24px padding inside card

#### Responsive Behavior
- **Mobile:** Full-width card, image 64px
- **Tablet:** Same as mobile
- **Desktop:** Image 80px, in sidebar position

---

### 3.3 Contributor Display Section

**Purpose:** Show social proof and celebrate contributors
**Background:** White card, subtle bg `#FDF8F3`
**Card Style:** `rounded-2xl`, `shadow-soft`

#### Contributor Heading
- **Text:** `"🎉 [X] loved ones have chipped in"`
- **Font:** Outfit 16px, 600 weight, text-gray-900
- **Emoji:** 🎉 (varies: 🎁 if <3, 🎉 if 3-10, ✨ if >10)
- **Dynamic language:**
  - 1: "1 loved one has chipped in"
  - 2-5: "[X] loved ones have chipped in"
  - 6+: "[X] amazing people have chipped in"

#### Contributor List
- **Display Order:** Reverse chronological (most recent first)
- **Avatar Style:** Circle 36px, initials inside (12px, centered)
- **Avatar Colors (cycle):** `#F5C6AA`, `#A8D4E6`, `#B8E0B8`, `#E6B8B8`, `#F0E68C`, `#B8D4E0`, `#D8B8E8`
- **Spacing:** 12px vertical gap between rows

#### Display Rules
- **≤5 contributors:** Show all names with "💝" emoji
- **6-10 contributors:** Show first 5, then `"+ X others ➜"` (as clickable link → modal)
- **>10 contributors:** Show first 5, then `"+ X others ➜"`
- **Anonymous:** Display as "💝 Anonymous contributor" with heart emoji avatar
- **0 contributors:** Show `"Be the first to chip in... 🎁"` (text-gray-400, italic)

#### List Item Format
```
[Avatar Circle]  [Display Name]      💝
[Avatar Circle]  [Display Name]      💝
[Avatar Circle]  [Display Name]      💝
                 + 7 others ➜
```

#### Modal (6+ contributors)
- **Trigger:** Click "X others" link
- **Content:** Full list, 6 per page with pagination
- **Close:** Backdrop click or X button (top-right)
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, keyboard-closable (Esc)

---

### 3.4 Time Remaining Section

**Purpose:** Create gentle urgency without pressure
**Display:** Large, friendly text
**Background:** Subtle bg `#FDF8F3` or white card
**Styling:** `rounded-2xl`, centered

#### Dynamic Language Based on Days Remaining
- **>14 days:** `"Plenty of time to make this birthday special! ⏰"`
- **7-14 days:** `"[X] days left to chip in 🎁"`
- **2-6 days:** `"Just [X] days left! 🎁"`
- **1 day:** `"Last day! 🎁 Don't miss out."`
- **<1 day (24 hrs remaining):** `"Final hours! ⏰ Chip in now."`
- **Expired:** `"This Dreamboard has closed. Thank you for helping make this birthday special! 💝"`

#### Text Specifications
- **Font:** Fraunces 18px, 700 weight (>6 days), Fraunces 16px (2-6 days), Fraunces 20px (1 day)
- **Color:** text-gray-900 (>6 days), `#C4785A` (2-6 days), `#C4785A` bold (1 day)
- **Padding:** 24px vertical, 16px horizontal
- **When expired:** Button disabled, text `text-gray-500`

#### Conditional Styling
- **Urgency State:** If 1-3 days left, add subtle `bg-orange-50` background tint
- **Expired State:** Greyed out, no background emphasis

---

### 3.5 Charitable Giving Section (Conditional)

**Purpose:** Highlight impact if charity split enabled
**Display:** Only if `charitable_giving.enabled === true`
**Background:** Green tint `#F0F7F4`, `rounded-2xl`
**Border:** 1px solid rgba(11, 125, 100, 0.1)

#### Section Label
- **Text:** `"💚 A GIFT THAT GIVES TWICE"` (uppercase)
- **Font:** Outfit 11px, 700 weight, letter-spacing +1px
- **Color:** Teal `#0D9488`
- **Padding:** 24px left, 12px top

#### Charity Logo & Details
- **Logo:** 48px height, auto width, `rounded-md`, centered
- **Charity Name:** Fraunces 16px, 700 weight, text-gray-900
- **Description:** `"We're donating R[amount] of every contribution to [Charity Name] to support [impact statement]."`
- **Font:** Outfit 14px, text-gray-600
- **Max width:** 60 chars per line

#### Example Copy (Template)
```
💚 A GIFT THAT GIVES TWICE

[48px Charity Logo]

Ikamva Youth
We're donating R[X] to Ikamva Youth
to support youth development and
mentoring in South Africa.

Every gift adds twice. 💚
```

#### Responsive Behavior
- **Mobile:** Full-width, logo centered, 24px padding
- **Desktop:** Same treatment in sidebar if space permits, else full-width below main wish

---

### 3.6 Primary CTA Section

**Purpose:** Convert contributors
**Placement:** After time remaining, before charity (if present), or at bottom
**Width:** Full-width container, button 100% on mobile, auto on desktop (max 400px)

#### Button Style
- **Style:** Ghost button (primary Gifta CTA style)
- **Background:** White or transparent
- **Border:** 2px solid `#6B9E88` (sage)
- **Text Color:** `#6B9E88` (sage)
- **Text:** `"Chip in for [Child] 💝"` (Outfit 16px, 600 weight)
- **Padding:** 16px vertical, 24px horizontal
- **Hover:** bg-sage-50 `#F5F9F7`, border `#5A8E78`
- **Active:** bg-sage-100, border `#4A7E68`
- **Disabled:** opacity-50, cursor-not-allowed (when expired)
- **Rounded:** `rounded-lg`
- **Shadow:** None (clean, minimal)

#### Click Behavior
- **If not expired:** Navigate to `/[slug]/contribute` with `?source=dream-board`
- **If expired:** Button disabled, show tooltip "This Dreamboard has closed"
- **On desktop:** Button in sidebar, sticky if viewport height permits
- **Loading state:** Show spinner inside button for 1sec after click

---

### 3.7 Return Visit Handling

**Purpose:** Handle returning contributors and parents viewing own board

#### Returning Contributor (already contributed)
**Display:** Replace CTA with success banner
- **Background:** `#F0F7F4` (green tint)
- **Border:** 1px solid `#0D9488`
- **Text:** `"Thanks for chipping in, [Name]! 💝"` (Outfit 14px, text-gray-900)
- **Secondary CTA:** `"Share this Dreamboard"` (ghost button, sage)
- **Padding:** 16px
- **Rounded:** `rounded-lg`
- **Detection:** Check localStorage `gifta_contributions[slug]`

#### Parent Viewing Own Board
**Display:** Informational banner + link to dashboard
- **Text:** `"👋 This is your Dreamboard. You're all set!"`
- **Link:** `"View Dashboard"` → `/dashboard/[dreamboard-id]`
- **Background:** `#FDF8F3` (subtle bg)
- **Detection:** Compare `user.id` with `dreamboard.parent_id` from session/auth

#### Return Visit Detection
- **Method 1:** Client-side localStorage key `gifta_contributions_[slug]` = boolean
- **Method 2:** Server-side: Check Contribution table for user's email + dreamboard_slug
- **Fallback:** If session/auth not available, use email in localStorage

---

### 3.8 Page Metadata & Social Sharing

**Purpose:** Enable rich WhatsApp previews and social sharing

#### OG Meta Tags
```html
<meta property="og:title" content="[Child]'s Dreamboard - Turning [Age] on [Date]">
<meta property="og:description" content="Help make [Child]'s birthday special! Chip in toward [Gift Name]. [X] people have already contributed.">
<meta property="og:image" content="[Child's Photo URL]">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://gifta.co.za/[slug]">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Child]'s Dreamboard">
<meta name="twitter:description" content="Help make [Child]'s birthday special!">
<meta name="twitter:image" content="[Child's Photo URL]">
```

#### WhatsApp Preview Optimization
- Image must be >200x200px, recommended 1200x630px
- Title must be <60 chars
- Description must be <140 chars (display limit)
- Test via: https://www.opengraph.xyz/ or WhatsApp share

---

## 4. Component Tree (React Hierarchy)

```
<PublicDreamBoardPage slug={string}>
  <Metadata title={string} og={OGObject} />

  <HeaderSection dreamboard={Dreamboard}>
    <CircularChildPhoto child={Child} />
    <ChildInfo child={Child} dreamboard={Dreamboard} />
  </HeaderSection>

  <MainContentArea>
    <OneWishSection gift={Gift} />

    <ContributorDisplay
      contributors={Contributor[]}
      dreamboardSlug={string}
      onShowAll={() => setShowModal(true)}
    >
      <ContributorList contributors={Contributor[]} />
      <MoreContributorsLink />
    </ContributorDisplay>

    {showAllContributorsModal && (
      <ContributorsModal
        contributors={Contributor[]}
        onClose={() => setShowModal(false)}
      />
    )}

    <TimeRemaining
      expiresAt={Date}
      isExpired={boolean}
    />

    {dreamboard.charitable_giving?.enabled && (
      <CharitableGivingSection
        charity={Charity}
        allocationPercentage={number}
      />
    )}

    <PrimaryCallToAction
      dreamboard={Dreamboard}
      isExpired={boolean}
      hasContributed={boolean}
      returnVisitMessage={string}
      onChipIn={() => navigate(`/[slug]/contribute`)}
      onShare={() => openShareModal()}
    />
  </MainContentArea>

  <FooterLinks>
    <ContactUsLink href="/support" />
    <PrivacyLink href="/privacy" />
    <TermsLink href="/terms" />
  </FooterLinks>

  <LoadingState>
    <DreamBoardSkeleton />
  </LoadingState>

  <ErrorState error={Error}>
    <ErrorMessage message={string} />
    <RetryButton />
  </ErrorState>
</PublicDreamBoardPage>
```

---

## 5. TypeScript Interfaces

```typescript
// Main Page Props
interface PublicDreamBoardPageProps {
  slug: string;
}

// Data Models
interface Dreamboard {
  id: string;
  slug: string;
  parent_id: string;
  child_id: string;
  child: Child;
  gift: Gift;
  created_at: Date;
  expires_at: Date;
  is_published: boolean;
  charitable_giving?: CharitableGiving;
  total_raised: number;
  target_amount: number;
}

interface Child {
  id: string;
  name: string;
  date_of_birth: Date;
  photo_url?: string;
  photo_alt_text: string;
}

interface Gift {
  id: string;
  name: string;
  description: string;
  image_url: string;
  image_alt_text: string;
  price: number;
  link?: string;
}

interface Contributor {
  id: string;
  display_name: string;
  email: string;
  is_anonymous: boolean;
  contribution_amount: number;
  contributed_at: Date;
  message?: string;
  avatar_color: string;
}

interface CharitableGiving {
  enabled: boolean;
  charity_id: string;
  charity: {
    id: string;
    name: string;
    logo_url: string;
    description: string;
    impact_statement: string;
  };
  allocation_percentage: number;
}

// API Response
interface PublicDreamBoardResponse {
  dreamboard: Dreamboard;
  contributors: Contributor[];
  contributor_count: number;
  days_remaining: number;
  is_expired: boolean;
  is_user_contributor: boolean;
  user_contribution?: Contributor;
}

// Component Props
interface HeaderSectionProps {
  dreamboard: Dreamboard;
}

interface ContributorDisplayProps {
  contributors: Contributor[];
  count: number;
  dreamboardSlug: string;
  onShowAll: () => void;
}

interface TimeRemainingProps {
  expiresAt: Date;
  isExpired: boolean;
  daysRemaining: number;
}

interface CharitableGivingSectionProps {
  charity: CharitableGiving['charity'];
  allocationPercentage: number;
  totalRaised: number;
}

interface PrimaryCallToActionProps {
  dreamboard: Dreamboard;
  isExpired: boolean;
  hasContributed: boolean;
  onChipIn: () => void;
  onShare: () => void;
}

interface OGObject {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website';
}
```

---

## 6. File Structure

```
src/
├── app/
│   └── [slug]/
│       ├── page.tsx                    # Main public dream board page
│       ├── layout.tsx                  # Layout with metadata
│       ├── error.tsx                   # Error boundary
│       └── loading.tsx                 # Loading skeleton
├── components/
│   └── public/
│       ├── PublicDreamBoard/
│       │   ├── PublicDreamBoard.tsx    # Container component
│       │   ├── HeaderSection.tsx       # Header with child photo + name
│       │   ├── OneWishSection.tsx      # Gift card
│       │   ├── ContributorDisplay.tsx  # Contributor list + modal
│       │   ├── TimeRemaining.tsx       # Days left messaging
│       │   ├── CharitableGiving.tsx    # Charity info (conditional)
│       │   ├── PrimaryCallToAction.tsx # "Chip in" button
│       │   └── ReturnVisitBanner.tsx   # Success banner for return visits
│       └── shared/
│           ├── CircularChildPhoto.tsx
│           ├── ContributorsList.tsx
│           └── ContributorsModal.tsx
├── lib/
│   ├── dreamboard.ts                  # API queries for public dreamboard
│   └── formatting.ts                  # Date/money formatting
├── hooks/
│   ├── useReturnVisit.ts              # Check if user has contributed
│   └── useDreamboardData.ts           # Fetch dreamboard + contributors
└── types/
    └── dreamboard.ts                  # TypeScript definitions
```

---

## 7. Data Fetching

### Server Component (Next.js 13+)
```typescript
// app/[slug]/page.tsx
export const dynamic = 'force-dynamic'; // Always fresh for contributor view
export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const dreamboard = await fetchPublicDreamboard(params.slug);

  if (!dreamboard) {
    return {
      title: 'Dreamboard Not Found',
    };
  }

  return {
    title: `${dreamboard.child.name}'s Dreamboard - Turning ${getAge(dreamboard.child.date_of_birth)}`,
    description: `Help make ${dreamboard.child.name}'s birthday special! Chip in toward ${dreamboard.gift.name}. ${dreamboard.contributors.length} people have already contributed.`,
    openGraph: {
      title: `${dreamboard.child.name}'s Dreamboard`,
      description: `Help make ${dreamboard.child.name}'s birthday special! R${dreamboard.total_raised} raised so far.`,
      images: [
        {
          url: dreamboard.child.photo_url || '/default-child.png',
          width: 1200,
          height: 630,
          alt: dreamboard.child.photo_alt_text,
        },
      ],
      url: `https://gifta.co.za/${params.slug}`,
    },
  };
}

export default async function PublicDreamBoardPage({
  params,
}: PageProps) {
  const dreamboard = await fetchPublicDreamboard(params.slug);

  if (!dreamboard || !dreamboard.is_published) {
    notFound();
  }

  return (
    <PublicDreamBoard
      dreamboard={dreamboard}
      contributors={dreamboard.contributors}
    />
  );
}
```

### API Endpoint
```typescript
// app/api/dreamboards/[slug]/public.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cache } from 'react';

export const fetchPublicDreamboard = cache(async (slug: string) => {
  const dreamboard = await db.dreamboard.findUnique({
    where: { slug },
    include: {
      child: true,
      gift: true,
      charitable_giving: {
        include: { charity: true },
      },
      contributions: {
        where: { status: 'completed' },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          display_name: true,
          email: true,
          is_anonymous: true,
          amount: true,
          created_at: true,
          message: true,
        },
      },
    },
  });

  if (!dreamboard || !dreamboard.is_published) {
    return null;
  }

  return {
    ...dreamboard,
    is_expired: new Date() > dreamboard.expires_at,
    days_remaining: Math.ceil(
      (dreamboard.expires_at.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
    contributor_count: dreamboard.contributions.length,
  };
});

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const dreamboard = await fetchPublicDreamboard(params.slug);

  if (!dreamboard) {
    return NextResponse.json(
      { error: 'Dreamboard not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(dreamboard);
}
```

### Caching Strategy
- **Static:** Generated at build time (revalidated every 60s)
- **Dynamic elements:** Client-side updates via polling (every 30s for contributor list)
- **Cache headers:** `Cache-Control: s-maxage=60, stale-while-revalidate=600`

---

## 8. Responsive Behavior

### Mobile (375px - 767px)
- Full-width cards with 16px padding
- Header photo 120px, centered
- Gift image 64px
- Contributor avatars 36px
- Text responsive: Headers 24px+, body 14px+
- Button full-width with 16px padding
- Stack vertical: header → wish → contributors → time → charity → CTA

### Tablet (768px - 1023px)
- Two-column layout: gift details + contributor sidebar
- Padding 24px horizontal
- Same font sizes as mobile
- Contributor list displays 6 items with scroll
- Button 60% width (max 400px)

### Desktop (1024px+)
- Three-column: gift details center, contributor sidebar right, charity left
- Padding 48px horizontal
- Max-width container 1200px
- Charity section inline with gift details
- Button sticky in sidebar (if space permits)
- Contributor sidebar with "View all" modal

### Breakpoints (Tailwind)
```javascript
md: '768px',   // Tablet
lg: '1024px',  // Desktop
xl: '1280px',  // Large desktop
```

---

## 9. Animations & Micro-interactions

### Load Animation
- **Duration:** 0.3s, easing: `ease-out`
- **Effect:** Fade-in + subtle slide-up (transform: translateY(8px) → 0)
- **Trigger:** Page mount (Framer Motion or CSS animation)

### Contributor List Expansion
- **Duration:** 0.4s
- **Effect:** Modal slides up from bottom (mobile) or fades in (desktop)
- **Easing:** `ease-out`
- **Close animation:** Reverse

### Button Interactions
- **Hover:** Border color shift + subtle background
- **Duration:** 0.15s
- **Active:** Scale slight (0.98) + darker border

### Time Remaining Pulse (when 1 day left)
- **Duration:** 2s, repeating
- **Effect:** Subtle opacity change (1 → 0.85 → 1)
- **Easing:** `ease-in-out`

### Confetti (on successful contribution return)
- **Not on dream board view** — reserved for thank-you page
- Handled in 12-CONTRIBUTE-THANK-YOU.md

---

## 10. Accessibility (WCAG 2.1 AA)

### Semantic HTML
- **Heading hierarchy:** h1 for child name, h2 for sections (wish, contributors, time)
- **Landmarks:** `<header>`, `<main>`, `<section>`, `<footer>`
- **Links:** All links have descriptive text (no "click here")

### Color Contrast
- **Sage (#6B9E88) on white:** 4.8:1 ✓ (exceeds AA)
- **Text-gray-900 on white:** 16.4:1 ✓
- **Text-gray-600 on white:** 7:1 ✓
- **Warm gold (#C4956A) on white:** 4.2:1 ✓

### Images & Alt Text
```typescript
<img
  src={child.photo_url}
  alt={`${child.name}'s birthday photo`}
  role="img"
  aria-label={`${child.name}, turning ${getAge(child.date_of_birth)}`}
/>
```

### Interactive Elements
- **Buttons:** Min 44x44px touch target
- **Focus visible:** blue-500 2px outline, 2px offset
- **Keyboard navigation:** Tab order logical (header → wish → contributors → time → CTA)
- **Modal:** Trap focus, return focus on close

### Screen Reader Announcements
```typescript
<div role="status" aria-live="polite" aria-atomic="true">
  {daysRemaining === 0 && 'This Dreamboard has closed'}
  {daysRemaining === 1 && 'Last day to chip in'}
</div>
```

### ARIA Labels
```html
<button
  aria-label="Chip in for Emma's Dreamboard, R[amount] target"
  aria-disabled={isExpired}
>
  Chip in for Emma 💝
</button>

<div aria-live="polite" aria-atomic="true">
  🎉 {count} loved ones have chipped in
</div>
```

### Focus Management
- Skip links to main content: Not needed (short page)
- Modal focus trap via `<FocusTrap>` component
- Esc to close modal

---

## 11. Error Handling

### 404 — Dreamboard Not Found
**Display:** Error page with messaging
```
Hmm, we can't find this Dreamboard.

It may have been deleted or the link might be incorrect.

[Go Home] [Contact Support]
```
**HTTP Status:** 404
**Redirect:** `/` after 10 seconds

### 403 — Dreamboard Not Published
**Display:** Parent view only, shows: "This Dreamboard is not yet live."
**Detection:** `is_published === false` and `user.id === dreamboard.parent_id`
**Show:** `[Publish Now]` link to dashboard

### Network Error (Failed to fetch contributors)
**Fallback:** Show cached data if available, else:
```
Oops! We had trouble loading the contributor list.

[Retry] [Continue anyway]
```
**Auto-retry:** 3 attempts with 2s exponential backoff

### Expired Dreamboard
- Button disabled with tooltip: "This Dreamboard has closed"
- Text: "This Dreamboard has closed. Thank you for helping make this birthday special! 💝"
- Can still view, but cannot contribute

### Charity Data Missing
- **Fallback:** Hide charity section entirely
- **Log:** Server-side warning "Charity data missing for dreamboard [id]"
- **Do NOT:** Show broken/empty charity card

---

## 12. Edge Cases

### Edge Case: User contributes, then page refresh
- **Handling:** Check localStorage for `gifta_contributions_[slug]`
- **Display:** Show return visit banner instead of CTA
- **Clear localStorage:** After 90 days (session-based cleanup)

### Edge Case: Contributor count just changed
- **Handling:** Real-time updates via polling (30s interval) or WebSocket
- **Display:** Smooth transition, no jarring count changes
- **User notification:** Toast notification "1 new person chipped in!"

### Edge Case: Child's birthday is TODAY
- **Handling:** Count as 0 days remaining
- **Display:** "Final hours! ⏰ Chip in now."
- **Expiration time:** End of day (11:59:59 PM SAST)

### Edge Case: Party date in past
- **Handling:** Hide party date line entirely
- **Logic:** Only show if `party_date > today`

### Edge Case: 1000+ contributors
- **Pagination:** Show 6 at a time in modal (≈166 pages)
- **Performance:** Use cursor-based pagination (not offset)
- **Display:** "Show more" button, not auto-load

### Edge Case: Image fails to load
- **Child photo fallback:** Circle with initials (sage bg, white text)
- **Gift image fallback:** Placeholder gift icon (48x48px gray)
- **Charity logo fallback:** Grey circle with charity initial

### Edge Case: No message/description text
- **Gift description:** Show generic text "A special birthday gift"
- **Charity statement:** Show generic text "Supporting South African communities"

### Edge Case: Very long child name (>30 chars)
- **Truncation:** Use hyphenation or wrap naturally
- **Font size:** Reduce to 24px if necessary

### Edge Case: User on slow network
- **Placeholder:** Show skeleton loading state for 2s minimum
- **Progressive enhancement:** Load above-fold content first
- **Timeout:** After 10s, show error with retry

### Edge Case: Bot/crawler access (SEO)
- **Static rendering:** Use `revalidate = 60` for crawler caching
- **Open Graph:** Ensure all meta tags present for preview
- **User-Agent detection:** Allow search engines, rate-limit others

---

## 13. Testing Checklist

- [ ] Photo loads and displays circular with border
- [ ] Child name and dates display correctly (test with long names)
- [ ] Time remaining shows correct language for all 6+ day ranges
- [ ] Contributor list shows first 5, "X others" clickable
- [ ] Contributors modal opens/closes with focus trap
- [ ] "Chip in" button navigates to contribute page
- [ ] Button disabled when expired
- [ ] Return visit banner shows when already contributed
- [ ] Charity section shows/hides correctly
- [ ] OG meta tags render correctly for WhatsApp preview
- [ ] Mobile layout stacks vertically
- [ ] Desktop layout shows 3-column layout
- [ ] Keyboard navigation works (Tab, Shift+Tab, Esc to close modal)
- [ ] Screen reader announces contributor count and time remaining
- [ ] Error states display correctly
- [ ] Page revalidates every 60s for fresh data
- [ ] Images don't break layout when failing to load
- [ ] Touch targets are 44x44px minimum

---

## 14. Success Metrics

- **Page load time:** <2s on 4G mobile
- **Bounce rate:** <25% (high engagement expected)
- **Contribution conversion:** 15-20% of visitors
- **Time to tap "Chip in":** <60 seconds
- **Mobile usage:** >80% of traffic
- **Return visit rate:** >5% (repeat contributors)
- **Share completion:** >40% of contributors share again


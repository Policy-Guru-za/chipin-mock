> **Document Status:** Reference only. Reviewed March 12, 2026.
> Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.
> Canonical replacement: `docs/Platform-Spec-Docs/UX.md`.
# Gifta — UX Architecture Document

## Overview

This document outlines the complete UX architecture for Gifta, a birthday gift pooling platform. It covers every screen, flow, field, and interaction required to deliver a seamless experience for parents (Dreamboard creators), contributors (gift-givers), and platform administrators.

**Core Principles:**
1. **Warmth over transaction** — Every interaction should feel personal and celebratory
2. **Simplicity** — Minimum steps, maximum clarity
3. **Transparency** — Clear breakdowns of fees, splits, and payouts
4. **Mobile-first** — Most usage will be via WhatsApp-shared links on phones
5. **Trust** — Security messaging, clear receipts, reliable notifications

---

## Table of Contents

1. [Landing Page & Onboarding](#1-landing-page--onboarding)
2. [Authentication (Clerk)](#2-authentication-clerk)
3. [Public Dreamboard (The Endgame)](#3-public-dreamboard-the-endgame)
4. [Parent Journey: Dreamboard Creation](#4-parent-journey-dreamboard-creation)
5. [Parent Dashboard](#5-parent-dashboard)
6. [Dreamboard Editing](#6-dreamboard-editing)
7. [Contributor Journey](#7-contributor-journey)
8. [Post-Contribution Experience](#8-post-contribution-experience)
9. [Communications Framework](#9-communications-framework)
10. [Admin Dashboards](#10-admin-dashboards)
11. [Charitable Giving Feature](#11-charitable-giving-feature)
12. [Loading, Empty & Error States](#12-loading-empty--error-states)
13. [Celebration Moments & Delight](#13-celebration-moments--delight)
14. [Accessibility](#14-accessibility)
15. [Edge Cases & Error States](#15-edge-cases--error-states)
16. [Data Model Summary](#16-data-model-summary)

---

## 1. Landing Page & Onboarding

The landing page is the first impression for new visitors. It must instantly communicate value while feeling warm and trustworthy.

### 1.1 Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Gifta Logo]                          [Sign in]                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    One gift they'll                             │
│                    actually love 🎁                             │
│                                                                 │
│      Pool contributions from friends and family                 │
│      toward one meaningful birthday gift.                       │
│                                                                 │
│      ┌─────────────────────────────────────────────┐            │
│      │       Create a Dreamboard →                 │            │
│      └─────────────────────────────────────────────┘            │
│                                                                 │
│               No more duplicate toys.                           │
│               No more gift pile chaos.                          │
│               Just one gift they'll treasure.                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HOW IT WORKS                                                   │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │     1       │   │     2       │   │     3       │            │
│  │   Create    │   │   Share     │   │   Receive   │            │
│  │             │   │             │   │             │            │
│  │ Set up your │   │ Send the    │   │ Get funds   │            │
│  │ child's     │   │ link to     │   │ sent to     │            │
│  │ Dreamboard  │   │ loved ones  │   │ your Karri  │            │
│  │ in 3 mins   │   │ via         │   │ Card or     │            │
│  │             │   │ WhatsApp    │   │ bank        │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TRUSTED BY SOUTH AFRICAN FAMILIES                              │
│                                                                 │
│        🎂 12,450+ birthday dreams funded                        │
│        💝 R2.4M+ raised for gifts                               │
│        👨‍👩‍👧‍👦 8,400+ happy families                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Finally, no more drawer full of toys Emma never               │
│   plays with. She got her telescope and uses it                 │
│   every single night!"                                          │
│                       — Sarah M., Cape Town                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│      ┌─────────────────────────────────────────────┐            │
│      │       Create a Dreamboard →                 │            │
│      └─────────────────────────────────────────────┘            │
│                                                                 │
│              Free to create • 2.9% card processing              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Gifta Logo]     About  •  FAQ  •  Contact  •  Privacy         │
│                                                                 │
│  Payments secured by [Payment Provider Logo]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Hero Section

| Element | Details |
|---------|---------|
| **Headline** | "One gift they'll actually love 🎁" — Fraunces, 40px |
| **Subhead** | "Pool contributions from friends and family toward one meaningful birthday gift." — Nunito, 18px |
| **Primary CTA** | "Create a Dreamboard →" — Ghost button, sage border |
| **Supporting copy** | Three short benefit lines, muted text |

### 1.3 Social Proof Section

Display real-time or weekly-updated metrics:

| Metric | Display |
|--------|---------|
| **Dreamboards created** | "12,450+ birthday dreams funded" |
| **Total raised** | "R2.4M+ raised for gifts" |
| **Families served** | "8,400+ happy families" |

### 1.4 Trust Signals

- Payment provider logo (Paystack/Yoco/Peach)
- "Free to create" messaging
- Transparent fee display (2.9% card processing)

### 1.5 Open Graph / Social Preview

Configure meta tags for beautiful WhatsApp/social previews:

```html
<meta property="og:title" content="Gifta — One gift they'll actually love" />
<meta property="og:description" content="Pool birthday contributions from friends and family toward one meaningful gift." />
<meta property="og:image" content="https://gifta.co.za/og-image.png" />
<meta property="og:url" content="https://gifta.co.za" />
```

**Dreamboard-specific previews:**
```html
<meta property="og:title" content="Sophie's Birthday Dreamboard" />
<meta property="og:description" content="Help make Sophie's birthday extra special! Chip in toward the one gift she's been dreaming of." />
<meta property="og:image" content="[Child photo or gift image]" />
```

---

## 2. Authentication (Clerk)

Gifta uses Clerk for all authentication. There are no magic links or custom session management.

### 2.1 Authentication Flow Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Landing   │ →  │   Sign Up   │ →  │   Create    │
│    Page     │    │   /Sign In  │    │  Dreamboard │
│             │    │   (Clerk)   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2.2 Sign Up Page (`/sign-up`)

Uses Clerk's prebuilt `<SignUp />` component, styled to match Gifta's design system.

**Available auth methods:**
- Email + password
- Google OAuth
- Apple OAuth (optional)

**Post-signup redirect:** `/create/child`

### 2.3 Sign In Page (`/sign-in`)

Uses Clerk's prebuilt `<SignIn />` component.

**Post-signin redirect:** `/dashboard` (if existing Dreamboards) or `/create/child` (if none)

### 2.4 Header Authentication States

**Signed Out:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Gifta Logo]                                    [Sign in]      │
└─────────────────────────────────────────────────────────────────┘
```

**Signed In:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Gifta Logo]              [Dashboard]    [UserButton/Avatar]   │
└─────────────────────────────────────────────────────────────────┘
```

The `<UserButton />` component provides:
- Account settings
- Sign out
- Manage account (Clerk hosted)

### 2.5 Route Protection

| Route Pattern | Protection |
|---------------|------------|
| `/` | Public |
| `/sign-in`, `/sign-up` | Public |
| `/:slug` (Dreamboard) | Public |
| `/:slug/contribute` | Public |
| `/:slug/thanks` | Public |
| `/create/*` | Protected (redirect to `/sign-in`) |
| `/dashboard/*` | Protected |
| `/admin/*` | Protected + Admin role |
| `/api/v1/*` | Public (API key auth) |
| `/api/webhooks/*` | Public (webhook signatures) |
| `/api/internal/*` | Internal-only (auth split by endpoint caller type) |

### 2.6 Internal API Auth Split (No Path Rename)

All `/api/internal/*` endpoints are private, but auth is split by **who calls the endpoint**:

| Internal Endpoint Type | Intended Caller | Auth |
|------------------------|-----------------|------|
| **Internal UI endpoints** | Signed-in host/admin requests | Clerk auth (`requireHostAuth` / `requireAdminAuth`) |
| **Internal job endpoints** | Schedulers/workers/ops automation | `Authorization: Bearer ${INTERNAL_JOB_SECRET}` |

**Important:** Keep existing internal paths. Do not rename endpoint URLs; enforce auth based on endpoint purpose.

**Current examples:**
- Clerk auth: `/api/internal/auth/me`, `/api/internal/upload`, `/api/internal/payouts/*`
- Job secret auth: `/api/internal/karri/batch`, `/api/internal/payments/reconcile`, `/api/internal/retention/run`, `/api/internal/webhooks/process`

**Security requirements for internal job endpoints:**
- Require `Authorization: Bearer ${INTERNAL_JOB_SECRET}` on every request.
- Return `401` for missing/invalid bearer token.
- Never log bearer token values.

### 2.7 Legacy Route Handling

| Legacy Route | Behavior |
|--------------|----------|
| `/auth/login` | Redirect to `/sign-in` |
| `/auth/logout` | Redirect to Clerk sign-out |
| `/auth/verify` | Show friendly message: "This link is no longer valid. Please sign in to continue." with link to `/sign-in` |

### 2.8 Session Cookie Cleanup

On first visit to `/sign-in` or `/create`, delete any legacy `chipin_session` cookie to prevent stale session issues.

---

## 3. Public Dreamboard (The Endgame)

The public Dreamboard is what contributors see when they receive a shared link. This is the most critical UI — it must inspire generosity while feeling warm, personal, and never transactional.

### 3.1 Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌──────────┐                                 │
│                    │  Child   │                                 │
│                    │  Photo   │                                 │
│                    └──────────┘                                 │
│                                                                 │
│              [Child's Name]'s Dreamboard                        │
│                                                                 │
│               Turning [age] on [birthday]                       │
│             Birthday party on [party date]                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ✨ [CHILD'S NAME]'S ONE BIG WISH                              │
│                                                                 │
│   ┌────────┐                                                    │
│   │ Gift   │  [Gift Name]                                       │
│   │ Image  │  [Gift description/tagline]                        │
│   └────────┘                                                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           🎉 [X] loved ones have chipped in                     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  (S)  Sarah M. has contributed                      💝  │   │
│   │  (D)  The Davidson Family has contributed           💝  │   │
│   │  (G)  Gran has contributed                          💝  │   │
│   │  (A)  Anonymous has contributed                     💝  │   │
│   │  (T)  The Thompsons has contributed                 💝  │   │
│   │       ... and 4 others have also contributed            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [X] days left to chip in                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   💚 A GIFT THAT GIVES TWICE (if enabled)                       │
│                                                                 │
│   [Parent name] has chosen to share the love.                   │
│   [X]% of contributions will support [Charity Name].            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│          ┌─────────────────────────────────────┐                │
│          │     Chip in for [Child] 💝          │                │
│          └─────────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Header Section

| Element | Details |
|---------|---------|
| **Child photo** | Circular crop, 120px diameter, subtle border, soft shadow |
| **Dreamboard title** | "[Child's Name]'s Dreamboard" — Fraunces/Nunito, 28px |
| **Line 1** | "Turning [age] on [full date]" — e.g., "Turning 6 on 28 March 2026" |
| **Line 2** | "Birthday party on [full date]" — e.g., "Birthday party on 30 March 2026" |
| **Background** | Soft sage gradient (#E8F0ED → #D8E8E0), rounded corners |

**Note:** If birthday and party date are the same, show only one line:
> "Turning 6 on 28 March 2026 🎈"

### 3.3 The One Big Wish Section

| Element | Details |
|---------|---------|
| **Section label** | "✨ [CHILD'S NAME]'S ONE BIG WISH" — uppercase, warm gold (#C4956A), 11px |
| **Gift image** | AI-generated or parent-uploaded, 64×64px, rounded corners |
| **Gift name** | Fraunces, 20px, dark text |
| **Gift tagline** | Optional description, 14px, muted gray |

### 3.4 Contributor Display — "Loved Ones Who've Chipped In"

**Replacing the progress bar** with an elegant, warm contributor list that emphasizes community over money.

#### Visual Design

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     🎉 7 loved ones have chipped in                             │
│                                                                 │
│     ┌────┐                                                      │
│     │ S  │  Sarah M. has contributed               💝           │
│     └────┘                                                      │
│     ┌────┐                                                      │
│     │ D  │  The Davidson Family has contributed    💝           │
│     └────┘                                                      │
│     ┌────┐                                                      │
│     │ G  │  Gran has contributed                   💝           │
│     └────┘                                                      │
│     ┌────┐                                                      │
│     │ 🎁 │  Anonymous has contributed              💝           │
│     └────┘                                                      │
│     ┌────┐                                                      │
│     │ T  │  The Thompsons has contributed          💝           │
│     └────┘                                                      │
│                                                                 │
│     ... and 2 others have also contributed                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Display Rules

| Scenario | Display |
|----------|---------|
| **≤5 contributors** | Show all names in full list |
| **6-10 contributors** | Show first 5, then "... and X others have also contributed" |
| **>10 contributors** | Show first 5, then "... and X others have also contributed" |
| **Anonymous contributor** | Show "Anonymous has contributed" with gift emoji (🎁) as avatar |
| **0 contributors** | Show: "Be the first to chip in for [Child]'s gift! 💝" |

#### Avatar Design

- Circle, 36px diameter
- Background: Randomly assigned from contributor color palette (peach, sky, mint, coral, golden, teal, lavender)
- Letter: First initial of display name, 14px, semi-bold
- Anonymous: Gift emoji (🎁) instead of initial

#### Contributor Order

Display in **reverse chronological order** (most recent first). This creates a sense of momentum and recency.

### 3.5 Time Remaining Display

Instead of a deadline that feels like pressure, use warm, inviting language:

| Days Remaining | Display Text |
|----------------|--------------|
| >14 days | "Plenty of time to chip in — [X] days left" |
| 7-14 days | "[X] days left to chip in" |
| 2-6 days | "Just [X] days left to chip in!" |
| 1 day | "Last day to chip in! 🎁" |
| 0 days (day of) | "Final hours to chip in!" |
| Expired | "This Dreamboard has closed. Thank you to everyone who contributed! 💝" |

### 3.6 Charitable Giving Display (If Enabled)

When the parent has opted to share contributions with a charity, display this section elegantly:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     💚 A GIFT THAT GIVES TWICE                                  │
│                                                                 │
│     The Mitchell family has chosen to share the love.           │
│     10% of all contributions will support                       │
│     Cape Town SPCA — helping animals in need.                   │
│                                                                 │
│     ┌──────────────────┐                                        │
│     │  [Charity Logo]  │                                        │
│     └──────────────────┘                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Soft green background tint (#F0F7F4)
- Charity logo displayed small (48px) with rounded corners
- Language emphasizes generosity, not obligation
- This section appears **after** the contributor list, **before** the CTA

### 3.7 Primary CTA Button

| State | Button Text | Style |
|-------|-------------|-------|
| **Active** | "Chip in for [Child] 💝" | Ghost style — white background, sage border, sage text |
| **Hover** | Same | Subtle fill (#F0F7F4), slight lift shadow |
| **Expired** | "This Dreamboard has closed" | Muted, disabled style |

### 3.8 Return Visit Handling

#### Returning Contributor (Has Already Contributed)

When a contributor returns to a Dreamboard they've already contributed to (detected via localStorage or cookie):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  💝 Thanks for chipping in, Sarah!                              │
│                                                                 │
│  Your contribution is helping make Sophie's                     │
│  birthday extra special.                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐            │
│  │       Share this Dreamboard 📤                  │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  Want to chip in again? [Add another contribution]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This banner appears at the top of the Dreamboard. The main CTA changes from "Chip in" to "Share this Dreamboard".

#### Parent Viewing Their Own Dreamboard

When a signed-in parent visits their own Dreamboard (detected via Clerk auth + Dreamboard ownership):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  👋 This is your Dreamboard                    [View Dashboard] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Subtle admin banner at the top with quick link to dashboard.

---

## 4. Parent Journey: Dreamboard Creation

The creation flow must be simple, delightful, and completable in under 3 minutes. We use a **progressive disclosure** approach — showing only what's needed at each step.

### 4.1 Entry Point

When a visitor clicks "Create a Dreamboard":

| Auth State | Behavior |
|------------|----------|
| **Signed out** | Redirect to `/sign-up?redirect_url=/create/child` |
| **Signed in** | Proceed directly to `/create/child` |

### 4.2 Creation Flow Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Step 1    │ →  │   Step 2    │ →  │   Step 3    │ →  │   Step 4    │ →  │   Step 5    │
│  The Child  │    │   The Gift  │    │  The Dates  │    │   Giving    │    │   Payout    │
│             │    │             │    │             │    │    Back     │    │   Setup     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              (optional)
```

### 4.3 Progress Indicator

Display at the top of each creation screen:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ● ○ ○ ○ ○                                    │
│                   Step 1 of 5                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Alternative conversational approach for later steps:
- Step 3: "Great! Just 2 more quick steps."
- Step 4: "Almost there! One more step after this."
- Step 5: "Last step — you're nearly done!"

### 4.4 Step 1: The Child

**Screen Title:** "Who's the birthday star? ⭐"

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Child's first name** | Text input | ✅ | 1-30 characters | Placeholder: "Sophie" |
| **Child's photo** | Image upload | ✅ | Max 5MB, JPG/PNG | Circular crop preview |
| **Age they're turning** | Number selector | ✅ | 1-18 | Scrollable picker or dropdown |

**UI Notes:**
- Large, friendly photo upload area with camera icon
- "Add a photo of [Name]" updates dynamically as they type the name
- Show circular preview of uploaded photo immediately

### 4.5 Step 2: The Gift

**Screen Title:** "What's [Child]'s one big wish? 🎁"

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Gift name** | Text input | ✅ | 1-100 characters | Placeholder: "Pink Electric Scooter" |
| **Gift description** | Text input | ❌ | Max 150 characters | Placeholder: "The one they've been dreaming about all year" |
| **Gift image** | Image upload OR AI generate | ❌ | Max 5MB | Option to generate via AI |

**AI Gift Image Feature:**
- Button: "✨ Generate gift image"
- Uses gift name to create a charming, illustrated image
- Shows 2-3 options for parent to choose from
- Fallback: Generic wrapped present if no image provided

### 4.6 Step 3: The Dates

**Screen Title:** "When's the big day? 🎈"

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Birthday date** | Date picker | ✅ | Must be in future | "[Child] is turning [age] on..." |
| **Party date** | Date picker | ❌ | Must be ≥ birthday date | "Party is on..." (defaults to birthday if not set) |
| **Campaign end date** | Date picker | ✅ | Must be ≤ party date | "Stop accepting contributions on..." |

**UI Notes:**
- Smart defaults: Campaign ends on party date
- Checkbox: "☐ Party is on a different day" — reveals party date field
- Calendar picker with disabled past dates

### 4.7 Step 4: Giving Back (Optional)

**Screen Title:** "Want to share the love? 💚"

This step introduces the charitable giving feature. It must feel **optional and warm**, not obligatory.

**Introduction Copy:**
> "Some families choose to share their joy by directing a portion of contributions to a cause they care about. This is completely optional — [Child]'s gift comes first."

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Enable giving back** | Toggle | ❌ | Default: Off | "Share a portion with charity" |
| **Select charity** | Dropdown/cards | If enabled | Must select one | Curated list with logos |
| **Split type** | Radio buttons | If enabled | — | "Percentage" or "Fixed amount first" |
| **Split value** | Slider or input | If enabled | 5-50% OR R50-R500 | Depends on split type |

**Charity Selection UI:**

Display as cards with:
- Charity logo (48px)
- Charity name
- One-line description
- Location/focus area

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Choose a cause close to your heart:                            │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  [SPCA Logo]    │  │  [Haven Logo]   │  │  [Habitat Logo] │  │
│  │                 │  │                 │  │                 │  │
│  │  Cape Town SPCA │  │  Haven Night    │  │  Habitat for    │  │
│  │  Helping animals│  │  Shelter        │  │  Humanity SA    │  │
│  │  in need        │  │  Supporting the │  │  Building homes │  │
│  │                 │  │  homeless       │  │  for families   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  [Sunflower]    │  │  [Food Bank]    │  │  [Red Cross]    │  │
│  │                 │  │                 │  │                 │  │
│  │  Sunflower Fund │  │  FoodForward SA │  │  SA Red Cross   │  │
│  │  Children's     │  │  Fighting hunger│  │  Disaster relief│  │
│  │  cancer care    │  │                 │  │  & aid          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Split Type Options:**

**Option A: Percentage Split**
> "Share [slider: 5-50%] of all contributions with [Charity]"
> 
> Preview: "If friends chip in R1,000 total, R100 goes to Cape Town SPCA and R900 goes toward Sophie's gift."

**Option B: Threshold Split (Fixed Amount First)**
> "The first R[input: 50-500] goes to [Charity], the rest goes to the gift"
>
> Preview: "The first R200 goes to Cape Town SPCA. Everything after that goes toward Sophie's gift."

### 4.8 Step 5: Payout Setup

**Screen Title:** "Where should we send the funds? 💳"

This step collects payout information. Karri Card is elegantly featured as the recommended option.

**Introduction Copy:**
> "Once the Dreamboard closes, we'll send the collected funds your way so you can buy [Child]'s gift."

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Payout method** | Radio cards | ✅ | Must select one | Karri featured |
| **Karri Card number** | Text input | If Karri | Valid Karri format | Only shown if Karri selected |
| **Bank name** | Dropdown | If Bank | Must select | Only shown if Bank selected |
| **Account number** | Text input | If Bank | Numeric, 8-15 digits | Only shown if Bank selected |
| **Branch code** | Text input | If Bank | 6 digits | Auto-fill for major banks |
| **Account holder name** | Text input | If Bank | 1-100 chars | Only shown if Bank selected |

**Note:** Parent email and phone are already captured via Clerk authentication.

**Payout Method Cards:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⭐ RECOMMENDED                                            │  │
│  │                                                           │  │
│  │  [Karri Logo]  Karri Card                                 │  │
│  │                                                           │  │
│  │  Instant payout • No fees • Spend anywhere               │  │
│  │                                                           │  │
│  │  ○ Select Karri Card                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  🏦  Bank Transfer                                        │  │
│  │                                                           │  │
│  │  1-3 business days • Standard EFT                        │  │
│  │                                                           │  │
│  │  ○ Select Bank Transfer                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.9 Confirmation & Share

**Screen Title:** "🎉 [Child]'s Dreamboard is ready!"

After completing all steps, show a celebration screen with confetti animation:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎉 [confetti burst]                          │
│                                                                 │
│           Sophie's Dreamboard is ready!                         │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │                                                 │         │
│     │         [Live preview of Dreamboard]            │         │
│     │                                                 │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     Share with friends and family:                              │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │  📋  gifta.co.za/sophie-abc123           [Copy] │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     ┌───────────────────┐  ┌───────────────────┐                │
│     │  Share on         │  │  Share on         │                │
│     │  WhatsApp 📱      │  │  Email ✉️          │                │
│     └───────────────────┘  └───────────────────┘                │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │       Go to your Dashboard →                    │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**WhatsApp Share Message (Pre-composed):**

```
🎁 Help make Sophie's birthday extra special!

We're pooling together to get them the one gift they've been dreaming of: Pink Electric Scooter

Chip in any amount — every little bit helps! 💝

gifta.co.za/sophie-abc123
```

---

## 5. Parent Dashboard

The parent dashboard is the control center for managing Dreamboards after creation. It must be simple, clear, and provide peace of mind.

### 5.1 Dashboard Access

Parents access their dashboard by signing in via Clerk. The dashboard URL is `/dashboard`.

### 5.2 Multi-Dreamboard List View

If a parent has multiple Dreamboards (twins, annual reuse, etc.), show a list:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Gifta Logo]                    [Dashboard]  [UserButton]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Dreamboards                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ┌────────┐                                             │    │
│  │  │ Sophie │  Sophie's Dreamboard                        │    │
│  │  │ Photo  │  Turning 6 on 28 March 2026                 │    │
│  │  └────────┘                                             │    │
│  │                                                         │    │
│  │  ● Active    8 days left    R2,450 from 12 people       │    │
│  │                                              [View →]   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ┌────────┐                                             │    │
│  │  │ Tommy  │  Tommy's Dreamboard                         │    │
│  │  │ Photo  │  Turned 4 on 15 January 2026                │    │
│  │  └────────┘                                             │    │
│  │                                                         │    │
│  │  ✓ Complete   Paid out    R1,890 from 8 people          │    │
│  │                                              [View →]   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              + Create another Dreamboard                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Single Dreamboard Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Gifta Logo]                    [Dashboard]  [UserButton]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ← Back to all Dreamboards                                      │
│                                                                 │
│  Sophie's Dreamboard                                            │
│  Turning 6 on 28 March 2026                                     │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   R2,450    │  │     12      │  │   8 days    │              │
│  │   raised    │  │ contributors│  │   left      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  R2,379 after 2.9% card processing fee                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 Contributions                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Sarah M.              R350    2 hours ago     💬       │    │
│  │  The Davidson Family   R500    Yesterday       💬       │    │
│  │  Anonymous             R150    Yesterday                │    │
│  │  Gran                  R200    3 days ago      💬       │    │
│  │  ...                                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [View all contributions]                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  💬 Birthday Messages (8)                     [View all]        │
│                                                                 │
│  "Happy birthday Sophie! Can't wait to see                      │
│   you ride that scooter! Love, Aunty Sarah"                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚙️ Quick Actions                                               │
│                                                                 │
│  [Share Dreamboard]  [Edit Dreamboard]  [View Public Page]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  💳 Payout Details                                              │
│                                                                 │
│  Method: Karri Card ending in ****4521                          │
│  Status: Ready — funds will be sent when Dreamboard closes      │
│                                                                 │
│  [Update payout details]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Dashboard Sections

#### 5.4.1 Summary Cards

| Card | Content |
|------|---------|
| **Total raised** | Sum of all contributions (before fees) — large, prominent |
| **Contributors** | Count of unique contributors |
| **Time remaining** | Days/hours until campaign end |

**After-fees display:**
> "R2,450 raised (R2,379 after 2.9% card processing fee)"

#### 5.4.2 Contributions List

Table/list showing:

| Column | Description |
|--------|-------------|
| **Contributor name** | Display name or "Anonymous" |
| **Amount** | Contribution amount (R) |
| **Time** | Relative time ("2 hours ago") |
| **Message indicator** | 💬 icon if message attached, clickable to view |

**Sorting:** Most recent first (default)

**Export:** Option to download as CSV (for thank-you card writing)

#### 5.4.3 Birthday Messages

A heartwarming section showing messages left by contributors.

- Show 1-2 preview messages on dashboard
- "View all" opens full messages modal
- Option to **create a printable/shareable "Birthday Messages Book"** — PDF download with all messages beautifully formatted (great keepsake!)

#### 5.4.4 Quick Actions

| Action | Function |
|--------|----------|
| **Share Dreamboard** | Opens share modal (copy link, WhatsApp, Email) |
| **Edit Dreamboard** | Opens edit modal (see Section 6) |
| **View Public Page** | Opens Dreamboard in new tab |

#### 5.4.5 Payout Details

Shows current payout configuration with option to update.

**Statuses:**
- "Collecting" — Dreamboard active, funds accumulating
- "Ready" — Dreamboard closed, awaiting payout
- "Processing" — Payout initiated
- "Complete" — Funds sent, with reference number

### 5.5 Post-Campaign Dashboard

After the Dreamboard closes, the dashboard transforms:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎉 Sophie's Dreamboard is complete!                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │    Total raised:                    R2,450              │    │
│  │    Card processing fee (2.9%):     -R71.05              │    │
│  │    Charity donation (10%):         -R237.90             │    │
│  │    ─────────────────────────────────────────            │    │
│  │    Your payout:                     R2,141.05           │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Payout status: ✅ Sent to Karri Card ****4521                  │
│  Reference: GFT-2026-03-28-4521                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📥 Download Birthday Messages Book (PDF)               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📤 Download Thank You Card List (CSV)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Notification Preferences

In dashboard settings, parent can toggle:

| Setting | Default |
|---------|---------|
| **Notify me for each contribution** | ✅ On |
| **Send daily summary instead** | ❌ Off |
| **Notify via WhatsApp** | ✅ On |
| **Notify via Email** | ✅ On |

---

## 6. Dreamboard Editing

Parents can make limited edits to their Dreamboard after creation. Editing is intentionally constrained to prevent confusion for contributors who have already seen or contributed to the Dreamboard.

### 6.1 Editable Fields

| Field | Editable | Notes |
|-------|----------|-------|
| **Child's name** | ✅ Yes | Typo corrections |
| **Child's photo** | ✅ Yes | Better photo available |
| **Party date** | ✅ Yes | Can only move forward, not backward |
| **Contribution deadline** | ✅ Yes | Can only extend, not shorten |
| **Child's age** | ❌ No | Locked after creation |
| **Birthday date** | ❌ No | Locked after creation |
| **Gift name** | ❌ No | Locked after creation |
| **Gift description** | ❌ No | Locked after creation |
| **Gift image** | ❌ No | Locked after creation |
| **Charity settings** | ❌ No | Locked after creation |
| **Payout method** | ✅ Yes | Separate "Update payout" flow |

### 6.2 Edit Modal

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Edit Sophie's Dreamboard                              [✕]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Child's name                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Sophie                                         │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  Child's photo                                                  │
│  ┌────────┐                                                     │
│  │ Current│  [Change photo]                                     │
│  │ Photo  │                                                     │
│  └────────┘                                                     │
│                                                                 │
│  Party date                                                     │
│  ┌─────────────────────────────────────────────────┐            │
│  │  30 March 2026                              [📅] │            │
│  └─────────────────────────────────────────────────┘            │
│  Can only be moved to a later date                              │
│                                                                 │
│  Stop accepting contributions on                                │
│  ┌─────────────────────────────────────────────────┐            │
│  │  30 March 2026                              [📅] │            │
│  └─────────────────────────────────────────────────┘            │
│  Can only be extended, not shortened                            │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Some fields can't be changed after creation:                   │
│  • Birthday date • Age • Gift details • Charity settings        │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐            │
│  │              Save changes                       │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Validation Rules

| Field | Validation |
|-------|------------|
| **Child's name** | 1-30 characters |
| **Child's photo** | Max 5MB, JPG/PNG |
| **Party date** | Must be ≥ current party date AND ≥ today |
| **Contribution deadline** | Must be ≥ current deadline AND ≤ new party date |

### 6.4 Change Confirmation

When saving changes that affect the public Dreamboard:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Save changes?                                                  │
│                                                                 │
│  Contributors will see the updated Dreamboard immediately.      │
│                                                                 │
│  Changes:                                                       │
│  • Child's name: "Sofie" → "Sophie"                             │
│  • Contribution deadline: 30 March → 2 April                    │
│                                                                 │
│  [Cancel]                              [Save changes]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Contributor Journey

The contributor experience must be frictionless, warm, and completable in under 60 seconds.

### 7.1 Contributor Flow Overview (Streamlined)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   View      │ →  │  Amount +   │ →  │   Payment   │ →  │   Thank     │
│ Dreamboard  │    │  Details    │    │             │    │    You      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Note:** Amount and Details are combined into a single screen for faster completion.

### 7.2 Step 1: View Dreamboard

Contributor arrives via shared link. They see the full public Dreamboard (as detailed in Section 3).

**Primary CTA:** "Chip in for [Child] 💝" — opens contribution flow

### 7.3 Step 2: Amount + Details (Combined)

**Screen Title:** "Chip in for [Child]"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ← Back                                                         │
│                                                                 │
│  Chip in for Sophie                                             │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Most people chip in R250 💝                                    │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │           │  │    ⭐     │  │           │  │           │     │
│  │   R150    │  │   R250    │  │   R500    │  │  Other    │     │
│  │           │  │           │  │           │  │           │     │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘     │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Your name (shown on the Dreamboard)                            │
│  ┌─────────────────────────────────────────────────┐            │
│  │  The Mason Family                               │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  ☐ Contribute anonymously                                       │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Add a birthday message (optional)                    [expand ▼]│
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐            │
│  │          Continue to payment →                  │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  Every contribution helps make Sophie's                         │
│  birthday dream come true.                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Dynamic Suggested Amount

The middle amount option shows the platform average with a subtle highlight:
- Calculated from rolling 30-day platform average
- Updated weekly
- If no data, default to R250

#### Message Field (Collapsed by Default)

When expanded:

```
│  Add a birthday message (optional)                   [collapse ▲]│
│  ┌─────────────────────────────────────────────────┐            │
│  │                                                 │            │
│  │  Happy birthday Sophie! Hope you love your      │            │
│  │  new scooter. Love from the Masons 💕           │            │
│  │                                                 │            │
│  └─────────────────────────────────────────────────┘            │
│  This will be shared with Sophie's parents                      │
```

#### Field Specifications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Amount** | Preset buttons or custom input | ✅ | Min R20, Max R10,000 |
| **Display name** | Text input | If not anonymous | Placeholder: "The Mason Family" |
| **Anonymous toggle** | Checkbox | ❌ | Default: unchecked |
| **Birthday message** | Textarea (collapsed) | ❌ | Max 500 characters |

#### Behavior Notes

- If "Anonymous" checked, hide display name field
- If "Anonymous" checked, message still allowed (parent sees it, but contributor listed as "Anonymous" publicly)
- "Other" amount opens a text input with R prefix

### 7.4 Step 3: Payment

**Screen Title:** "Complete your contribution"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ← Back                                                         │
│                                                                 │
│  Complete your contribution                                     │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Contributing R350 to Sophie's Dreamboard                       │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Select payment method:                                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  💳  Credit or Debit Card                                 │  │
│  │                                                           │  │
│  │  ○ Pay with card                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  [SnapScan Logo]  SnapScan                                │  │
│  │                                                           │  │
│  │  ○ Pay with SnapScan                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐            │
│  │             Pay R350 →                          │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  🔒 Payments secured by [Payment Provider]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Payment Methods:**

| Method | Implementation |
|--------|----------------|
| **Card** | Integrate with payment gateway (Paystack, Yoco, or Peach Payments) |
| **SnapScan** | Generate unique SnapScan code for each contribution |

**If Card Selected:**
Show inline card form (number, expiry, CVV) or redirect to secure payment page.

**If SnapScan Selected:**
Show QR code with waiting state (see Section 12.3).

### 7.5 Step 4: Thank You

**Screen Title:** "Thank you! 💝"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       💝 [confetti burst]                       │
│                                                                 │
│                 Thank you, Sarah!                               │
│                                                                 │
│     Your contribution of R350 will help make                    │
│     Sophie's birthday extra special.                            │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │                                                 │         │
│     │  Sophie's parents have been notified.           │         │
│     │                                                 │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     [If charitable giving enabled:]                             │
│     ┌─────────────────────────────────────────────────┐         │
│     │  💚 R35 of your contribution will support       │         │
│     │     Cape Town SPCA. Thank you for giving twice! │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     Know someone else who'd like to chip in?                    │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │       Share this Dreamboard 📤                  │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     ─────────────────────────────────────────────────           │
│                                                                 │
│     Want a receipt?                                             │
│     ┌─────────────────────────────────────────────────┐         │
│     │  your@email.com                          [Send] │         │
│     └─────────────────────────────────────────────────┘         │
│     We'll send a confirmation — no spam, ever.                  │
│                                                                 │
│     ─────────────────────────────────────────────────           │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │       Back to Dreamboard                        │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     ─────────────────────────────────────────────────           │
│                                                                 │
│     Need help? [Contact us]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Duplicate Contribution Prevention

If a contributor attempts to contribute again (detected via localStorage):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Looks like you've already chipped in — thank you! 💝           │
│                                                                 │
│  Want to add more?                                              │
│                                                                 │
│  [Contribute again]        [Share instead]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This appears as a modal before showing the contribution form. Clicking "Contribute again" dismisses it and proceeds normally.

### 7.7 "Remind Me" Feature

For contributors not ready to pay, offer a reminder option at the bottom of the Amount + Details screen:

```
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Not ready to chip in yet?                                      │
│  ┌─────────────────────────────────────────────────┐            │
│  │       Remind me in 3 days 🔔                    │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
```

Clicking opens an email capture modal:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  We'll send you a reminder 🔔                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐            │
│  │  your@email.com                                 │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐            │
│  │       Send reminder in 3 days                   │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  We'll only email you once. No spam, ever.                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Post-Contribution Experience

What happens after someone contributes — for both the contributor and the parent.

### 8.1 Contributor Post-Payment

| Timing | Action |
|--------|--------|
| **Immediate** | Show thank you screen with confetti (as above) |
| **Immediate** | Set localStorage flag to track return visits |
| **Immediate** | Update Dreamboard with new contributor (real-time via websocket or polling) |
| **If email provided** | Send confirmation email within 1 minute |

### 8.2 Parent Notifications

| Event | Notification Method | Content |
|-------|---------------------|---------|
| **New contribution** | WhatsApp + Email | "[Name] just chipped in R[X] for [Child]'s gift! 🎉" |
| **Daily summary** (if >3 contributions) | Email | "Today's contributions: 5 people chipped in R1,200 total" |
| **Milestone reached** | WhatsApp | "Amazing! 10 people have now chipped in for [Child]! 🎉" |
| **Campaign ending soon** | WhatsApp + Email | "[Child]'s Dreamboard closes in 24 hours. Share the link one more time?" |
| **Campaign ended** | WhatsApp + Email | "[Child]'s Dreamboard is complete! R[X] raised from [Y] contributors. Payout details inside." |

---

## 9. Communications Framework

All communications must be warm, celebratory, and on-brand.

### 9.1 Email Templates

#### 9.1.1 To Parent: Dreamboard Created

**Subject:** "🎁 [Child]'s Dreamboard is live!"

```
Hi [Parent name],

[Child]'s Dreamboard is ready to share!

Share this link with friends and family:
[Dreamboard URL]

[WhatsApp Share Button] [Copy Link Button]

Tip: The best results come from personal messages! 
Send the link directly to grandparents, aunties, uncles, 
and close friends with a short note.

Happy birthday planning!

— The Gifta Team
```

#### 9.1.2 To Parent: New Contribution

**Subject:** "💝 [Contributor] just chipped in for [Child]!"

```
Hi [Parent name],

Great news! [Contributor name] just contributed R[amount] 
toward [Child]'s gift.

[If message attached:]
They also left a birthday message:
"[Message text]"

Total raised so far: R[total]
Contributors: [count]

[View Dashboard Button]

— The Gifta Team
```

#### 9.1.3 To Parent: Campaign Complete

**Subject:** "🎉 [Child]'s Dreamboard is complete!"

```
Hi [Parent name],

[Child]'s Dreamboard has closed. Here's the summary:

Total raised:                 R[gross]
Card processing fee (2.9%):  -R[fees]
[If charity:]
Charity donation:            -R[charity_amount]
─────────────────────────────────────
Your payout:                  R[net]

Payout method: [Karri Card / Bank Transfer]
Status: [Processing / Sent]
[If sent:] Reference: [reference number]

[Download Birthday Messages Book] — A beautiful PDF 
keepsake of all the birthday wishes!

[Download Thank You List] — CSV of contributors 
for writing thank-you notes.

Thank you for using Gifta. We hope [Child] loves 
their gift! 🎁

— The Gifta Team
```

#### 9.1.4 To Contributor: Contribution Confirmation

**Subject:** "💝 Thanks for chipping in for [Child]!"

```
Hi [Contributor name / "there" if anonymous],

Thank you for your generous contribution of R[amount] 
toward [Child]'s birthday gift!

[If charity enabled:]
💚 R[charity_portion] of your contribution will support 
[Charity Name]. Thank you for giving twice!

[Child]'s parents have been notified of your contribution.
[If message:] Your birthday message has been shared with them.

Know someone else who'd like to chip in?
[Share Dreamboard Button]

— The Gifta Team
```

#### 9.1.5 To Contributor: Reminder

**Subject:** "🔔 Reminder: Chip in for [Child]'s birthday gift"

```
Hi there,

You asked us to remind you about [Child]'s Dreamboard.

There's still time to chip in! The Dreamboard closes 
on [date].

[Chip in now →]

— The Gifta Team

---
You requested this reminder. We won't email you again 
unless you ask.
```

### 9.2 WhatsApp Message Templates

#### 9.2.1 To Parent: New Contribution

```
🎉 [Contributor] just chipped in R[amount] for [Child]'s gift!

Total raised: R[total] from [count] people

[If message:] They wrote: "[message preview...]"

View details: [Dashboard Link]
```

#### 9.2.2 To Parent: Campaign Complete

```
🎁 [Child]'s Dreamboard is complete!

R[net] is on its way to your [Karri Card / bank account].

[count] people chipped in to make this happen! 💝

View details & download messages: [Dashboard Link]
```

---

## 10. Admin Dashboards

Platform administration for Gifta operators.

### 10.1 Admin Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  GIFTA ADMIN                                      [Admin Name]  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 Platform Overview                                           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  R847,250   │  │    1,247    │  │    8,432    │  │   342   │ │
│  │  Total GMV  │  │ Dreamboards │  │Contributors │  │ Active  │ │
│  │  (all time) │  │  (all time) │  │ (all time)  │  │ (live)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [Chart: GMV over time — last 30 days]                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Quick Stats (Last 30 days)                                     │
│                                                                 │
│  • New Dreamboards: 127                                         │
│  • New contributions: 892                                       │
│  • Total raised: R156,420                                       │
│  • Platform fees earned: R4,536.18                              │
│  • Avg contribution: R175.36                                    │
│  • Avg Dreamboard raised: R1,231.65                             │
│  • Charity donations facilitated: R12,450                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚨 Requires Attention                                          │
│                                                                 │
│  • 3 payouts pending review                                     │
│  • 1 Dreamboard flagged for review                              │
│  • 2 support tickets open                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Admin Sections

#### 10.2.1 Dreamboards Management

View and search all Dreamboards:

| Column | Description |
|--------|-------------|
| **ID** | Unique identifier |
| **Child name** | First name |
| **Created** | Date created |
| **Status** | Active / Closed / Paid out |
| **Contributors** | Count |
| **Raised** | Total amount |
| **End date** | Campaign end |
| **Actions** | View / Flag / Close |

**Filters:**
- Status (Active, Closed, Paid, Flagged)
- Date range
- Amount range
- Charity enabled (Yes/No)

**Detail View:**
- Full Dreamboard details
- Parent contact info (from Clerk)
- All contributions
- Payout status and history
- Audit log

#### 10.2.2 Contributions Management

View all contributions:

| Column | Description |
|--------|-------------|
| **ID** | Transaction ID |
| **Dreamboard** | Link to Dreamboard |
| **Contributor** | Name or Anonymous |
| **Amount** | Gross amount |
| **Fee** | Platform fee |
| **Net** | Net to Dreamboard |
| **Status** | Success / Failed / Refunded |
| **Payment method** | Card / SnapScan |
| **Date** | Timestamp |

**Actions:**
- View details
- Issue refund (with reason)
- Flag for review

#### 10.2.3 Payouts Management

View and process payouts:

| Column | Description |
|--------|-------------|
| **Dreamboard** | Link |
| **Parent** | Name + contact |
| **Method** | Karri / Bank |
| **Amount** | Payout amount |
| **Status** | Pending / Processing / Sent / Failed |
| **Request date** | When Dreamboard closed |
| **Processed date** | When payout sent |

**Actions:**
- Approve payout
- Hold for review
- Mark as sent
- View bank details

#### 10.2.4 Charity Management

Manage curated charity list:

| Column | Description |
|--------|-------------|
| **Name** | Charity name |
| **Category** | Animals / Children / Homeless / etc. |
| **Status** | Active / Inactive |
| **Logo** | Thumbnail |
| **Dreamboards** | Count using this charity |
| **Total donated** | Sum of donations |

**Actions:**
- Add new charity
- Edit details
- Deactivate
- View donation history

**Add Charity Form:**

| Field | Required |
|-------|----------|
| Charity name | ✅ |
| Description (short) | ✅ |
| Category | ✅ |
| Logo | ✅ |
| Website | ❌ |
| Bank details for payment | ✅ |
| Contact person | ✅ |
| Contact email | ✅ |

#### 10.2.5 Users Management

View parent accounts (synced from Clerk):

| Column | Description |
|--------|-------------|
| **Name** | Parent name |
| **Email** | Email address |
| **Clerk ID** | Clerk user ID |
| **Dreamboards** | Count created |
| **Total raised** | Across all Dreamboards |
| **Joined** | Registration date |

**Actions:**
- View profile
- View Dreamboards
- Suspend account (via Clerk)
- Send message

#### 10.2.6 Financial Reports

Downloadable reports:

| Report | Description | Format |
|--------|-------------|--------|
| **Revenue report** | Platform fees by period | CSV |
| **Payout report** | All payouts by period | CSV |
| **Charity report** | Donations by charity | CSV |
| **Transaction log** | All transactions | CSV |
| **Reconciliation** | Payment gateway vs. platform | CSV |

#### 10.2.7 Platform Settings

| Setting | Description |
|---------|-------------|
| **Platform fee** | Currently 2.9% |
| **Minimum contribution** | Currently R20 |
| **Maximum contribution** | Currently R10,000 |
| **Pre-set amounts** | R150, R250, R500 (middle value dynamic) |
| **WhatsApp notifications** | Enable/disable |
| **Email notifications** | Enable/disable |

---

## 11. Charitable Giving Feature

### 11.1 Feature Philosophy

The "Gift That Gives Twice" feature must:

1. **Feel optional, never obligatory** — Parents shouldn't feel pressured
2. **Be clearly explained** — Contributors should understand where money goes
3. **Celebrate generosity** — Make families feel good about sharing
4. **Be transparent** — Clear breakdown in all summaries

### 11.2 Charity Selection UX

**Curated list categories:**

| Category | Example Charities |
|----------|-------------------|
| **Animals** | Cape Town SPCA, Fallen Angels |
| **Children** | Sunflower Fund, Childline SA |
| **Hunger** | FoodForward SA, Gift of the Givers |
| **Homeless** | Haven Night Shelter, The Hope Factory |
| **Education** | Afrika Tikkun, Teach South Africa |
| **Environment** | WWF South Africa, Greenpop |

**Display:** 6-9 charities shown as cards with logos. Simple, visual selection.

### 11.3 Split Mechanics

#### Option A: Percentage Split

- Slider: 5% — 10% — 15% — 20% — 25% — 50%
- Default: 10%
- Preview calculation shown in real-time

**Example UI:**
```
Share [====●=====] 10% with Cape Town SPCA

Preview: If contributors chip in R1,000 total:
• R100 goes to Cape Town SPCA
• R900 goes toward Sophie's gift
```

#### Option B: Threshold Split (First X Goes to Charity)

- Input or presets: R50, R100, R200, R500
- Everything above threshold goes to gift

**Example UI:**
```
The first R[___100___] goes to Cape Town SPCA

Preview: 
• The first R100 goes to Cape Town SPCA
• Everything after that goes toward Sophie's gift
```

### 11.4 Display on Dreamboard

When enabled, show in a dedicated section (soft green tint):

```
💚 A GIFT THAT GIVES TWICE

The Mitchell family has chosen to share the love.
10% of contributions will support Cape Town SPCA — 
helping animals find loving homes.

[Small charity logo]
```

**Alternative for threshold:**
```
💚 A GIFT THAT GIVES TWICE

The Mitchell family has chosen to share the love.
The first R100 raised will support Cape Town SPCA — 
helping animals find loving homes. ✓ Goal reached!

[Small charity logo]
```

### 11.5 Contributor Visibility

On contribution thank-you screen:
```
💚 R35 of your contribution will support Cape Town SPCA.
   Thank you for giving twice!
```

### 11.6 Payout Handling

1. **When Dreamboard closes:**
   - Calculate total raised
   - Calculate charity portion (% or threshold)
   - Calculate platform fees
   - Net amount to parent

2. **Charity payouts:**
   - Batch monthly to each charity
   - Admin dashboard shows pending charity payouts
   - Generate donation receipts for charities

3. **Parent payout summary:**
```
Total raised:                 R2,450.00
Card processing fee (2.9%):  -R71.05
Charity (10%):               -R245.00
─────────────────────────────────────────
Your payout:                  R2,133.95
```

### 11.7 Charity Reporting

**Monthly email to charities:**
```
Subject: Gifta Donation Report — March 2026

Dear Cape Town SPCA,

Thank you for being part of the Gifta community!

This month, 23 families chose to share their birthday 
celebrations with you.

Total donations: R4,567.00

[Download detailed report]

Payment will be transferred to your account within 
5 business days.

Reference: GFT-CHARITY-2026-03-SPCA

With gratitude,
The Gifta Team
```

---

## 12. Loading, Empty & Error States

### 12.1 Loading States

#### Page Loading (Skeleton)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌──────────┐                                 │
│                    │ ░░░░░░░░ │                                 │
│                    │ ░░░░░░░░ │                                 │
│                    └──────────┘                                 │
│                                                                 │
│               ░░░░░░░░░░░░░░░░░░░░░░                            │
│                                                                 │
│               ░░░░░░░░░░░░░░░░░░░                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                  │
│                                                                 │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Use skeleton screens with subtle pulse animation. Match the layout of the expected content.

#### Button Loading

```
┌─────────────────────────────────────────────────┐
│          ◌ Processing...                        │
└─────────────────────────────────────────────────┘
```

Buttons show spinner and disabled state during actions.

#### Payment Processing

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Processing your                              │
│                    contribution...                              │
│                                                                 │
│                         ◌                                       │
│                                                                 │
│              Please don't close this page.                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Empty States

#### Dashboard: No Contributions Yet

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  📋 Contributions                                               │
│                                                                 │
│                         🎈                                      │
│                                                                 │
│           No contributions yet — but they're coming!            │
│                                                                 │
│           Share Sophie's Dreamboard to get started:             │
│                                                                 │
│           ┌─────────────────────────────────────┐               │
│           │     Share on WhatsApp 📱            │               │
│           └─────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Dashboard: No Birthday Messages

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  💬 Birthday Messages                                           │
│                                                                 │
│           No messages yet.                                      │
│           Messages from contributors will appear here.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Dashboard List: No Dreamboards

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Your Dreamboards                                               │
│                                                                 │
│                         🎁                                      │
│                                                                 │
│           You haven't created any Dreamboards yet.              │
│                                                                 │
│           Ready to make your child's birthday                   │
│           extra special?                                        │
│                                                                 │
│           ┌─────────────────────────────────────┐               │
│           │     Create your first Dreamboard    │               │
│           └─────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 SnapScan Waiting State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Waiting for SnapScan payment...                                │
│                                                                 │
│  ┌─────────────────────────────────────┐                        │
│  │                                     │                        │
│  │           [QR Code]                 │                        │
│  │                                     │                        │
│  └─────────────────────────────────────┘                        │
│                                                                 │
│  1. Open your SnapScan app                                      │
│  2. Scan this code                                              │
│  3. Confirm the payment of R350                                 │
│                                                                 │
│  We'll update automatically when payment is received.           │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  Taking too long?                                               │
│  [Try card payment instead]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Timeout behavior (5 minutes):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Payment not received                                           │
│                                                                 │
│  We didn't receive your SnapScan payment.                       │
│  This can happen if the app timed out.                          │
│                                                                 │
│  [Try again]        [Use card instead]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Celebration Moments & Delight

Gifta should feel celebratory, not transactional. Strategic micro-interactions reinforce emotional moments.

### 13.1 Confetti Moments

Trigger confetti animation on:

| Moment | Intensity |
|--------|-----------|
| **Dreamboard creation complete** | Full burst (3 seconds) |
| **Contribution thank-you screen** | Medium burst (2 seconds) |
| **Campaign complete (parent dashboard)** | Full burst (3 seconds) |

**Implementation:** Use canvas-confetti or similar library. Colors: Gifta palette (sage, peach, coral, gold).

### 13.2 Subtle Animations

| Element | Animation |
|---------|-----------|
| **New contribution appears** | Slide in from right + subtle pulse |
| **Contributor avatar** | Gentle bounce on first appearance |
| **Progress update** | Number counting animation |
| **Button hover** | Subtle lift + shadow |
| **Success checkmark** | Draw-in animation |

### 13.3 Haptic Feedback (Mobile)

| Action | Haptic Type |
|--------|-------------|
| **Payment success** | Success (medium) |
| **Button tap** | Light impact |
| **Error** | Error (double tap) |

### 13.4 Sound Effects (Optional, Off by Default)

If user enables sounds:

| Moment | Sound |
|--------|-------|
| **Contribution received** | Gentle chime |
| **Dreamboard created** | Celebration flourish |

---

## 14. Accessibility

Gifta must be accessible to all users, including those using assistive technologies.

### 14.1 WCAG 2.1 AA Compliance

**Target:** WCAG 2.1 Level AA compliance across all user-facing screens.

### 14.2 Color & Contrast

| Element | Requirement |
|---------|-------------|
| **Body text** | Minimum 4.5:1 contrast ratio |
| **Large text (18px+)** | Minimum 3:1 contrast ratio |
| **Interactive elements** | Clear focus indicators |
| **Sage palette** | Verify #D8E8E0 background provides sufficient contrast |

**Color-blind considerations:**
- Don't rely solely on color to convey information
- Use icons + text for status indicators
- Error states use icon + text, not just red

### 14.3 Keyboard Navigation

- All interactive elements reachable via Tab key
- Logical tab order follows visual layout
- Skip links for main content
- Escape key closes modals
- Enter/Space activates buttons

### 14.4 Screen Reader Support

| Element | Requirement |
|---------|-------------|
| **Images** | Alt text for all child photos and gift images |
| **Icons** | aria-label for icon-only buttons |
| **Forms** | Proper label associations |
| **Status updates** | aria-live regions for real-time updates |
| **Modals** | Focus trapping + aria-modal |

### 14.5 Form Accessibility

- Clear error messages associated with fields
- Required fields marked with aria-required
- Inline validation announcements
- Sufficient touch targets (minimum 44×44px)

### 14.6 Alt Text Guidelines

| Image Type | Alt Text Pattern |
|------------|------------------|
| **Child photo** | "Photo of [Child's name]" or "[Child's name]'s photo" |
| **Gift image** | "[Gift name]" or "Illustration of [gift name]" |
| **Charity logo** | "[Charity name] logo" |
| **Decorative elements** | alt="" (empty, decorative) |

---

## 15. Edge Cases & Error States

### 15.1 Dreamboard Edge Cases

| Scenario | Handling |
|----------|----------|
| **No contributions received** | Close gracefully, no payout needed |
| **Parent never sets up payout** | Send reminders, hold funds for 90 days, then attempt refund to contributors |
| **Duplicate Dreamboard for same child** | Allow (different parties may create) |
| **Inappropriate child photo** | Automated moderation + manual review queue |
| **Inappropriate gift** | Manual review if flagged |
| **Dreamboard accessed after expiry** | Show closed state with thank-you message |

### 15.2 Payment Edge Cases

| Scenario | Handling |
|----------|----------|
| **Payment fails** | Show clear error, allow retry, don't record contribution |
| **Partial payment (SnapScan timeout)** | Don't record until confirmed |
| **Refund requested** | Admin-only, with reason, notify parent |
| **Payout fails** | Retry, notify parent to update details |
| **Fraudulent contribution** | Flag for review, ability to reverse |
| **Duplicate submission** | Idempotency check, show "already contributed" message |

### 15.3 Authentication Edge Cases

| Scenario | Handling |
|----------|----------|
| **Session expires mid-creation** | Save draft to localStorage, restore after sign-in |
| **Email change in Clerk** | Sync email to host record on next sign-in |
| **Account deletion request** | Follow Clerk account deletion + remove host data |

### 15.4 Error Messages

All errors should be:
- **Clear:** What went wrong
- **Helpful:** What to do next
- **Warm:** Not cold/technical

**Examples:**

| Error | Message |
|-------|---------|
| Payment declined | "Hmm, your payment didn't go through. Please check your card details and try again. 💳" |
| Network error | "We're having trouble connecting. Please check your internet and try again." |
| Invalid amount | "Please enter an amount of R20 or more." |
| Session expired | "Your session has timed out. No worries — let's start fresh!" |
| File too large | "That image is a bit too big. Please choose one under 5MB." |
| Invalid email | "That doesn't look like a valid email address. Mind checking it?" |

### 15.5 Confirmation Dialogs

Require confirmation before irreversible actions:

**Close Dreamboard Early:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Close Sophie's Dreamboard early?                               │
│                                                                 │
│  This will stop accepting contributions immediately.            │
│  You'll receive your payout within 3 business days.             │
│                                                                 │
│  Total raised: R2,450 from 12 contributors                      │
│                                                                 │
│  [Cancel]                        [Yes, close it]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Update Payout Details:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Update payout details?                                         │
│                                                                 │
│  Your payout will be sent to the new account.                   │
│                                                                 │
│  Old: Karri Card ****4521                                       │
│  New: Karri Card ****7890                                       │
│                                                                 │
│  [Cancel]                        [Update]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 16. Data Model Summary

### 16.1 Core Entities

#### Host (Parent/User)
```
- id (unique)
- clerkUserId (unique, nullable → required after migration)
- email (from Clerk, kept in sync)
- name (from Clerk)
- phone (nullable)
- notification_preferences (JSON)
- created_at
- updated_at
```

#### Dreamboard
```
- id (unique)
- slug (URL-friendly, e.g., "sophie-abc123")
- child_name
- child_photo_url
- child_age
- birthday_date
- party_date (nullable)
- campaign_end_date
- gift_name
- gift_description (nullable)
- gift_image_url (nullable)
- charity_enabled (boolean)
- charity_id (nullable, FK)
- charity_split_type (nullable: "percentage" | "threshold")
- charity_split_value (nullable: number)
- host_id (FK)
- payout_method ("karri" | "bank")
- karri_card_number (nullable, encrypted)
- bank_name (nullable)
- bank_account_number (nullable, encrypted)
- bank_branch_code (nullable)
- bank_account_holder (nullable)
- status ("active" | "closed" | "paid")
- created_at
- updated_at
```

#### Contribution
```
- id (unique)
- dreamboard_id (FK)
- amount (cents)
- fee_amount (cents)
- net_amount (cents)
- charity_portion (cents, nullable)
- contributor_name (nullable if anonymous)
- contributor_email (nullable, for receipts)
- is_anonymous (boolean)
- message (nullable)
- payment_method ("card" | "snapscan")
- payment_reference
- status ("success" | "failed" | "refunded")
- created_at
```

#### Charity
```
- id (unique)
- name
- description
- category
- logo_url
- website (nullable)
- bank_details (encrypted JSON)
- contact_name
- contact_email
- is_active (boolean)
- created_at
```

#### Payout
```
- id (unique)
- dreamboard_id (FK)
- gross_amount (cents)
- fee_amount (cents)
- charity_amount (cents)
- net_amount (cents)
- method ("karri" | "bank")
- status ("pending" | "processing" | "sent" | "failed")
- reference (nullable)
- processed_at (nullable)
- created_at
```

#### ContributionReminder
```
- id (unique)
- dreamboard_id (FK)
- email
- remind_at (datetime)
- sent (boolean)
- created_at
```

---

## Summary

This document provides the complete UX architecture for Gifta. Key principles throughout:

1. **Warmth over transaction** — Every interaction should feel personal and celebratory
2. **Simplicity** — Minimum steps, maximum clarity
3. **Transparency** — Clear breakdowns of fees, splits, and payouts
4. **Mobile-first** — Most usage will be via WhatsApp-shared links on phones
5. **Trust** — Security messaging, clear receipts, reliable notifications
6. **Accessibility** — Usable by everyone, including those with disabilities

### Implementation Priority

**Phase 1: Core MVP**
1. Landing page
2. Clerk authentication
3. Dreamboard creation flow
4. Public Dreamboard view
5. Contributor flow (streamlined)
6. Parent dashboard (basic)
7. Payment integration

**Phase 2: Polish**
1. Celebration moments (confetti, animations)
2. Return visit handling
3. Reminder feature
4. Birthday Messages Book (PDF)
5. Accessibility audit

**Phase 3: Scale**
1. Charitable giving feature
2. Admin dashboards
3. Advanced notifications
4. Multi-Dreamboard management

---

*Document version: 2.0*
*Last updated: February 2026*

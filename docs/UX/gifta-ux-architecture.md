# Gifta — UX Architecture Document

## Overview

This document outlines the complete UX architecture for Gifta, a birthday gift pooling platform. It covers every screen, flow, field, and interaction required to deliver a seamless experience for parents (Dreamboard creators), contributors (gift-givers), and platform administrators.

---

## Table of Contents

1. [Public Dreamboard (The Endgame)](#1-public-dreamboard-the-endgame)
2. [Parent Journey: Dreamboard Creation](#2-parent-journey-dreamboard-creation)
3. [Parent Dashboard](#3-parent-dashboard)
4. [Contributor Journey](#4-contributor-journey)
5. [Post-Contribution Experience](#5-post-contribution-experience)
6. [Communications Framework](#6-communications-framework)
7. [Admin Dashboards](#7-admin-dashboards)
8. [Charitable Giving Feature](#8-charitable-giving-feature)
9. [Edge Cases & Error States](#9-edge-cases--error-states)
10. [Data Model Summary](#10-data-model-summary)

---

## 1. Public Dreamboard (The Endgame)

The public Dreamboard is what contributors see when they receive a shared link. This is the most critical UI — it must inspire generosity while feeling warm, personal, and never transactional.

### 1.1 Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ┌──────────┐                         │
│                    │  Child   │                         │
│                    │  Photo   │                         │
│                    └──────────┘                         │
│                                                         │
│              [Child's Name]'s Dreamboard                │
│                                                         │
│               Turning [age] on [birthday]               │
│             Birthday party on [party date]              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ✨ [CHILD'S NAME]'S ONE BIG WISH                      │
│                                                         │
│   ┌────────┐                                            │
│   │ Gift   │  [Gift Name]                               │
│   │ Image  │  [Gift description/tagline]                │
│   └────────┘                                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           🎉 [X] loved ones have chipped in             │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  (S)  Sarah M. has contributed                  │   │
│   │  (D)  The Davidson Family has contributed       │   │
│   │  (G)  Gran has contributed                      │   │
│   │  (A)  Anonymous has contributed                 │   │
│   │  (T)  The Thompsons has contributed             │   │
│   │       ... and 4 others have also contributed    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                         │
│              [X] days left to contribute                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   💚 A GIFT THAT GIVES TWICE (if enabled)              │
│                                                         │
│   [Parent name] has chosen to share the love.          │
│   [X]% of contributions will support [Charity Name].   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│          ┌─────────────────────────────────┐            │
│          │     Chip in for [Child] 💝      │            │
│          └─────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Header Section

| Element | Details |
|---------|---------|
| **Child photo** | Circular crop, 120px diameter, subtle border, soft shadow |
| **Dreamboard title** | "[Child's Name]'s Dreamboard" — Fraunces/Nunito, 28px |
| **Line 1** | "Turning [age] on [full date]" — e.g., "Turning 6 on 28 March 2026" |
| **Line 2** | "Birthday party on [full date]" — e.g., "Birthday party on 30 March 2026" |
| **Background** | Soft sage gradient (#E8F0ED → #D8E8E0), rounded corners |

**Note:** If birthday and party date are the same, show only one line:
> "Turning 6 on 28 March 2026 🎈"

### 1.3 The One Big Wish Section

| Element | Details |
|---------|---------|
| **Section label** | "✨ [CHILD'S NAME]'S ONE BIG WISH" — uppercase, warm gold (#C4956A), 11px |
| **Gift image** | AI-generated or parent-uploaded, 64×64px, rounded corners |
| **Gift name** | Fraunces, 20px, dark text |
| **Gift tagline** | Optional description, 14px, muted gray |

### 1.4 Contributor Display — "Loved Ones Who've Chipped In"

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

### 1.5 Time Remaining Display

Instead of a deadline that feels like pressure, use warm, inviting language:

| Days Remaining | Display Text |
|----------------|--------------|
| >14 days | "Plenty of time to chip in — [X] days left" |
| 7-14 days | "[X] days left to chip in" |
| 2-6 days | "Just [X] days left to chip in!" |
| 1 day | "Last day to chip in! 🎁" |
| 0 days (day of) | "Final hours to chip in!" |
| Expired | "This Dreamboard has closed. Thank you to everyone who contributed! 💝" |

### 1.6 Charitable Giving Display (If Enabled)

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

### 1.7 Primary CTA Button

| State | Button Text | Style |
|-------|-------------|-------|
| **Active** | "Chip in for [Child] 💝" | Ghost style — white background, sage border, sage text |
| **Hover** | Same | Subtle fill (#F0F7F4), slight lift shadow |
| **Expired** | "This Dreamboard has closed" | Muted, disabled style |

---

## 2. Parent Journey: Dreamboard Creation

The creation flow must be simple, delightful, and completable in under 3 minutes. We use a **progressive disclosure** approach — showing only what's needed at each step.

### 2.1 Creation Flow Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Step 1    │ →  │   Step 2    │ →  │   Step 3    │ →  │   Step 4    │ →  │   Step 5    │
│  The Child  │    │   The Gift  │    │  The Dates  │    │   Giving    │    │   Payout    │
│             │    │             │    │             │    │    Back     │    │   Setup     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              (optional)
```

### 2.2 Step 1: The Child

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

### 2.3 Step 2: The Gift

**Screen Title:** "What's [Child]'s one big wish? 🎁"

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Gift name** | Text input | ✅ | 1-100 characters | Placeholder: "Pink Electric Scooter" |
| **Gift description** | Text input | ❌ | Max 150 characters | Placeholder: "The one she's been dreaming about all year" |
| **Gift image** | Image upload OR AI generate | ❌ | Max 5MB | Option to generate via AI |

**AI Gift Image Feature:**
- Button: "✨ Generate gift image"
- Uses gift name to create a charming, illustrated image
- Shows 2-3 options for parent to choose from
- Fallback: Generic wrapped present if no image provided

### 2.4 Step 3: The Dates

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

### 2.5 Step 4: Giving Back (Optional)

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

### 2.6 Step 5: Payout Setup

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
| **Parent email** | Email input | ✅ | Valid email | For confirmations & dashboard access |
| **Parent mobile** | Phone input | ✅ | Valid SA mobile | For WhatsApp notifications |

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

### 2.7 Confirmation & Share

**Screen Title:** "🎉 [Child]'s Dreamboard is ready!"

After completing all steps, show a celebration screen:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         🎉                                      │
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
│     │  📋  gifta.co.za/d/sophie-abc123        [Copy]  │         │
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
🎁 Help make [Child]'s birthday extra special!

We're pooling together to get [him/her] the one gift [he/she]'s been dreaming of: [Gift Name]

Chip in any amount — every little bit helps! 💝

[Dreamboard Link]
```

---

## 3. Parent Dashboard

The parent dashboard is the control center for managing the Dreamboard after creation. It must be simple, clear, and provide peace of mind.

### 3.1 Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Gifta Logo]                              [Account] [Logout]   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sophie's Dreamboard                                            │
│  Turning 6 on 28 March 2026                                     │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   R2,450    │  │     12      │  │   8 days    │              │
│  │   raised    │  │ contributors│  │   left      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
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
│  [Share Dreamboard]  [Extend Deadline]  [View Public Page]      │
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

### 3.2 Dashboard Sections

#### 3.2.1 Summary Cards

| Card | Content |
|------|---------|
| **Total raised** | Sum of all contributions (before fees) — large, prominent |
| **Contributors** | Count of unique contributors |
| **Time remaining** | Days/hours until campaign end |

**Note:** Show "after fees" calculation on hover or in details view:
> "R2,450 raised (R2,379 after 2.9% payment fees)"

#### 3.2.2 Contributions List

Table/list showing:

| Column | Description |
|--------|-------------|
| **Contributor name** | Display name or "Anonymous" |
| **Amount** | Contribution amount (R) |
| **Time** | Relative time ("2 hours ago") |
| **Message indicator** | 💬 icon if message attached, clickable to view |

**Sorting:** Most recent first (default)

**Export:** Option to download as CSV (for thank-you card writing)

#### 3.2.3 Birthday Messages

A heartwarming section showing messages left by contributors.

- Show 1-2 preview messages on dashboard
- "View all" opens full messages modal
- Option to **create a printable/shareable "Birthday Messages Book"** — PDF download with all messages beautifully formatted (great keepsake!)

#### 3.2.4 Quick Actions

| Action | Function |
|--------|----------|
| **Share Dreamboard** | Opens share modal (copy link, WhatsApp, Email) |
| **Extend Deadline** | Opens date picker to extend (cannot shorten) |
| **View Public Page** | Opens Dreamboard in new tab |

#### 3.2.5 Payout Details

Shows current payout configuration with option to update.

**Statuses:**
- "Collecting" — Dreamboard active, funds accumulating
- "Ready" — Dreamboard closed, awaiting payout
- "Processing" — Payout initiated
- "Complete" — Funds sent, with reference number

### 3.3 Post-Campaign Dashboard

After the Dreamboard closes, the dashboard transforms:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎉 Sophie's Dreamboard is complete!                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │    Total raised:           R2,450                       │    │
│  │    Payment fees (2.9%):   -R71.05                       │    │
│  │    Charity donation (10%): -R237.90                     │    │
│  │    ─────────────────────────────────                    │    │
│  │    Your payout:            R2,141.05                    │    │
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

---

## 4. Contributor Journey

The contributor experience must be frictionless, warm, and completable in under 60 seconds.

### 4.1 Contributor Flow Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   View      │ →  │   Select    │ →  │   Add       │ →  │   Payment   │
│ Dreamboard  │    │   Amount    │    │   Details   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
                                                         ┌─────────────┐
                                                         │   Thank     │
                                                         │    You      │
                                                         └─────────────┘
```

### 4.2 Step 1: View Dreamboard

Contributor arrives via shared link. They see the full public Dreamboard (as detailed in Section 1).

**Primary CTA:** "Chip in for [Child] 💝" — opens contribution flow

### 4.3 Step 2: Select Amount

**Screen Title:** "How much would you like to chip in? 💝"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     How much would you like to chip in?                         │
│                                                                 │
│     ┌───────────┐  ┌───────────┐  ┌───────────┐                 │
│     │           │  │           │  │           │                 │
│     │   R150    │  │   R350    │  │   R500    │                 │
│     │           │  │           │  │           │                 │
│     └───────────┘  └───────────┘  └───────────┘                 │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │  R          Other amount                        │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     Every contribution helps make [Child]'s                     │
│     birthday dream come true.                                   │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │             Continue →                          │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Amount Selection:**

| Option | Value |
|--------|-------|
| Preset 1 | R150 |
| Preset 2 | R350 |
| Preset 3 | R500 |
| Custom | Free input (minimum R20) |

**Validation:**
- Minimum: R20 (to cover payment processing)
- Maximum: R10,000 (fraud prevention)

### 4.4 Step 3: Add Details

**Screen Title:** "Add your details"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     Add your details                                            │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │  ☐  Contribute anonymously                      │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     Display name                                                │
│     ┌─────────────────────────────────────────────────┐         │
│     │  The Mason Family                               │         │
│     └─────────────────────────────────────────────────┘         │
│     This is how your name will appear on the Dreamboard         │
│                                                                 │
│     Add a birthday message (optional)                           │
│     ┌─────────────────────────────────────────────────┐         │
│     │                                                 │         │
│     │  Happy birthday Sophie! Hope you love your      │         │
│     │  new scooter. Love from the Masons 💕           │         │
│     │                                                 │         │
│     └─────────────────────────────────────────────────┘         │
│     This will be shared with [Child]'s parents                  │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │             Continue to payment →               │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Anonymous toggle** | Checkbox | ❌ | Default: unchecked |
| **Display name** | Text input | If not anonymous | Placeholder: "The Mason Family" or "Katie M." |
| **Birthday message** | Textarea | ❌ | Max 500 characters, placeholder shown |

**Behavior:**
- If "Anonymous" checked, hide display name field
- If "Anonymous" checked, message still allowed (parent sees it, but contributor listed as "Anonymous" publicly)

### 4.5 Step 4: Payment

**Screen Title:** "Complete your contribution"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     Complete your contribution                                  │
│                                                                 │
│     Contributing: R350                                          │
│     For: Sophie's Dreamboard                                    │
│                                                                 │
│     ─────────────────────────────────────────────────           │
│                                                                 │
│     Select payment method:                                      │
│                                                                 │
│     ┌───────────────────────────────────────────────────────┐   │
│     │                                                       │   │
│     │  💳  Credit or Debit Card                             │   │
│     │                                                       │   │
│     │  ○ Pay with card                                      │   │
│     └───────────────────────────────────────────────────────┘   │
│                                                                 │
│     ┌───────────────────────────────────────────────────────┐   │
│     │                                                       │   │
│     │  [SnapScan Logo]  SnapScan                            │   │
│     │                                                       │   │
│     │  ○ Pay with SnapScan                                  │   │
│     └───────────────────────────────────────────────────────┘   │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │             Pay R350 →                          │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     🔒 Payments secured by [Payment Provider]                   │
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
Show QR code with instructions to scan.

### 4.6 Step 5: Thank You

**Screen Title:** "Thank you! 💝"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                           💝                                    │
│                                                                 │
│                 Thank you, Sarah!                               │
│                                                                 │
│     Your contribution of R350 will help make                    │
│     Sophie's birthday extra special.                            │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │                                                 │         │
│     │  [Child]'s parents have been notified.          │         │
│     │                                                 │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     Know someone else who'd like to chip in?                    │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │       Share this Dreamboard 📤                  │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │       Back to Dreamboard                        │         │
│     └─────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If charitable giving is enabled, add:**

```
│     ┌─────────────────────────────────────────────────┐         │
│     │  💚 R35 of your contribution will support       │         │
│     │     Cape Town SPCA. Thank you for giving twice! │         │
│     └─────────────────────────────────────────────────┘         │
```

---

## 5. Post-Contribution Experience

What happens after someone contributes — for both the contributor and the parent.

### 5.1 Contributor Post-Payment

| Timing | Action |
|--------|--------|
| **Immediate** | Show thank you screen (as above) |
| **Immediate** | Send confirmation email to contributor (if email captured) |
| **Immediate** | Update Dreamboard with new contributor (real-time) |

### 5.2 Parent Notifications

| Event | Notification Method | Content |
|-------|---------------------|---------|
| **New contribution** | WhatsApp + Email | "[Name] just chipped in R[X] for [Child]'s gift! 🎉" |
| **Daily summary** (if >3 contributions) | Email | "Today's contributions: 5 people chipped in R1,200 total" |
| **Milestone reached** | WhatsApp | "Amazing! 10 people have now chipped in for [Child]! 🎉" |
| **Campaign ending soon** | WhatsApp + Email | "[Child]'s Dreamboard closes in 24 hours. Share the link one more time?" |
| **Campaign ended** | WhatsApp + Email | "[Child]'s Dreamboard is complete! R[X] raised from [Y] contributors. Payout details inside." |

### 5.3 Notification Preferences (Parent)

In dashboard settings, parent can toggle:

| Setting | Default |
|---------|---------|
| **Notify me for each contribution** | ✅ On |
| **Send daily summary instead** | ❌ Off |
| **Notify via WhatsApp** | ✅ On |
| **Notify via Email** | ✅ On |

---

## 6. Communications Framework

All communications must be warm, celebratory, and on-brand.

### 6.1 Email Templates

#### 6.1.1 To Parent: Dreamboard Created

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

#### 6.1.2 To Parent: New Contribution

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

#### 6.1.3 To Parent: Campaign Complete

**Subject:** "🎉 [Child]'s Dreamboard is complete!"

```
Hi [Parent name],

[Child]'s Dreamboard has closed. Here's the summary:

Total raised:        R[gross]
Payment fees (2.9%): -R[fees]
[If charity:]
Charity donation:    -R[charity_amount]
─────────────────────────────
Your payout:         R[net]

Payout method: [Karri Card / Bank Transfer]
Status: [Processing / Sent]
[If sent:] Reference: [reference number]

[Download Birthday Messages Book] — A beautiful PDF 
keepsake of all the birthday wishes!

[Download Thank You List] — CSV of contributors 
for writing thank-you notes.

Thank you for using Gifta. We hope [Child] loves 
[his/her] gift! 🎁

— The Gifta Team
```

#### 6.1.4 To Contributor: Contribution Confirmation

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

### 6.2 WhatsApp Message Templates

#### 6.2.1 To Parent: New Contribution

```
🎉 [Contributor] just chipped in R[amount] for [Child]'s gift!

Total raised: R[total] from [count] people

[If message:] They wrote: "[message preview...]"

View details: [Dashboard Link]
```

#### 6.2.2 To Parent: Campaign Complete

```
🎁 [Child]'s Dreamboard is complete!

R[net] is on its way to your [Karri Card / bank account].

[count] people chipped in to make this happen! 💝

View details & download messages: [Dashboard Link]
```

---

## 7. Admin Dashboards

Platform administration for Gifta operators.

### 7.1 Admin Dashboard Overview

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

### 7.2 Admin Sections

#### 7.2.1 Dreamboards Management

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
- Parent contact info
- All contributions
- Payout status and history
- Audit log

#### 7.2.2 Contributions Management

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

#### 7.2.3 Payouts Management

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

#### 7.2.4 Charity Management

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

#### 7.2.5 Users Management

View parent accounts:

| Column | Description |
|--------|-------------|
| **Name** | Parent name |
| **Email** | Email address |
| **Phone** | Mobile number |
| **Dreamboards** | Count created |
| **Total raised** | Across all Dreamboards |
| **Joined** | Registration date |

**Actions:**
- View profile
- View Dreamboards
- Suspend account
- Send message

#### 7.2.6 Financial Reports

Downloadable reports:

| Report | Description | Format |
|--------|-------------|--------|
| **Revenue report** | Platform fees by period | CSV |
| **Payout report** | All payouts by period | CSV |
| **Charity report** | Donations by charity | CSV |
| **Transaction log** | All transactions | CSV |
| **Reconciliation** | Payment gateway vs. platform | CSV |

#### 7.2.7 Platform Settings

| Setting | Description |
|---------|-------------|
| **Platform fee** | Currently 2.9% |
| **Minimum contribution** | Currently R20 |
| **Maximum contribution** | Currently R10,000 |
| **Pre-set amounts** | R150, R350, R500 |
| **WhatsApp notifications** | Enable/disable |
| **Email notifications** | Enable/disable |

---

## 8. Charitable Giving Feature

### 8.1 Feature Philosophy

The "Gift That Gives Twice" feature must:

1. **Feel optional, never obligatory** — Parents shouldn't feel pressured
2. **Be clearly explained** — Contributors should understand where money goes
3. **Celebrate generosity** — Make families feel good about sharing
4. **Be transparent** — Clear breakdown in all summaries

### 8.2 Charity Selection UX

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

### 8.3 Split Mechanics

#### Option A: Percentage Split

- Slider: 5% — 10% — 15% — 20% — 25% — 50%
- Default: 10%
- Preview calculation shown in real-time

**Example UI:**
```
Share [====●=====] 10% with Cape Town SPCA

Preview: If contributors chip in R1,000 total:
• R100 goes to Cape Town SPCA
• R900 goes toward [Child]'s gift
```

#### Option B: Threshold Split (First X Goes to Charity)

- Input or presets: R50, R100, R200, R500
- Everything above threshold goes to gift

**Example UI:**
```
The first R[___100___] goes to Cape Town SPCA

Preview: 
• The first R100 goes to Cape Town SPCA
• Everything after that goes toward [Child]'s gift
```

### 8.4 Display on Dreamboard

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

### 8.5 Contributor Visibility

On contribution thank-you screen:
```
💚 R35 of your contribution will support Cape Town SPCA.
   Thank you for giving twice!
```

### 8.6 Payout Handling

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
Total raised:           R2,450.00
Platform fees (2.9%):  -R71.05
Charity (10%):         -R245.00
─────────────────────────────────
Your payout:            R2,133.95
```

### 8.7 Charity Reporting

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

## 9. Edge Cases & Error States

### 9.1 Dreamboard Edge Cases

| Scenario | Handling |
|----------|----------|
| **No contributions received** | Close gracefully, no payout needed |
| **Parent never sets up payout** | Send reminders, hold funds for 90 days, then attempt refund to contributors |
| **Duplicate Dreamboard for same child** | Allow (different parties may create) |
| **Inappropriate child photo** | Automated moderation + manual review queue |
| **Inappropriate gift** | Manual review if flagged |

### 9.2 Payment Edge Cases

| Scenario | Handling |
|----------|----------|
| **Payment fails** | Show clear error, allow retry, don't record contribution |
| **Partial payment (SnapScan timeout)** | Don't record until confirmed |
| **Refund requested** | Admin-only, with reason, notify parent |
| **Payout fails** | Retry, notify parent to update details |
| **Fraudulent contribution** | Flag for review, ability to reverse |

### 9.3 Error Messages

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

---

## 10. Data Model Summary

### 10.1 Core Entities

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
- parent_id (FK)
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
- is_anonymous (boolean)
- message (nullable)
- payment_method ("card" | "snapscan")
- payment_reference
- status ("success" | "failed" | "refunded")
- created_at
```

#### Parent (User)
```
- id (unique)
- email
- phone
- name
- notification_preferences (JSON)
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

---

## Summary

This document provides the complete UX architecture for Gifta. Key principles throughout:

1. **Warmth over transaction** — Every interaction should feel personal and celebratory
2. **Simplicity** — Minimum steps, maximum clarity
3. **Transparency** — Clear breakdowns of fees, splits, and payouts
4. **Mobile-first** — Most usage will be via WhatsApp-shared links on phones
5. **Trust** — Security messaging, clear receipts, reliable notifications

### Next Steps

1. **Design:** Create high-fidelity mockups for each screen
2. **Technical:** Define API structure and database schema
3. **Integration:** Select payment provider (Paystack/Yoco/Peach)
4. **Content:** Write all microcopy and email templates
5. **Build:** Prioritize MVP (Parent creation → Dreamboard → Contribution → Payout)

---

*Document version: 1.0*
*Last updated: February 2026*

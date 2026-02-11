# Landing Page UI Specification (01-LANDING-PAGE.md)

**Version:** 2.0
**Last Updated:** February 11, 2026
**Status:** Runtime-aligned with noted target-state sections
**Target:** AI Coding Agent Implementation

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/app/(marketing)/page.tsx` and `src/components/landing/*`.
- `/` is public and does not currently auto-redirect authenticated users to dashboard/create.
- CTA links route to `/create`; unauthenticated access is redirected to Clerk sign-in from `src/app/(host)/create/page.tsx`.
- Layout, hero, stats, testimonial rotation, and warm gradient treatment are implemented.

## Table of Contents

1. [Screen Overview](#screen-overview)
2. [Visual Hierarchy](#visual-hierarchy)
3. [Section-by-Section Specification](#section-by-section-specification)
4. [Component Tree](#component-tree)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [File Structure](#file-structure)
7. [Responsive Behavior](#responsive-behavior)
8. [Animations](#animations)
9. [Accessibility](#accessibility)
10. [SEO & Meta](#seo--meta)
11. [Performance](#performance)
12. [Edge Cases](#edge-cases)

---

## Screen Overview

### Purpose
The landing page is Gifta's primary marketing and conversion funnel entry point. It communicates the platform's core value proposition ("One dream gift. Everyone chips in.") and converts visitors into registered Dreamboard creators.

### Route
- **Path:** `/` (root domain)
- **Clerk Protection:** None (public, unauthenticated access)
- **Redirect Logic:**
  - Authenticated users with existing boards: Dashboard
  - Authenticated users with no boards: `/create/child`
  - Unauthenticated users: Stay on landing page

### Layout Type
- **Mobile (< 768px):** Single-column vertical stack with layered sections
- **Tablet (768px - 1023px):** 2-column grid for hero + dreamboard preview
- **Desktop (1024px+):** Full hero grid (1.1fr / 0.9fr) with sophisticated positioning

### Responsive Behavior Summary
The page employs a mobile-first approach with staggered animations triggering at each breakpoint. Hero and stats move down for tablet, dreamboard appears right side for desktop. All sections use CSS `order` utilities for flexible reordering without DOM manipulation.

---

## Visual Hierarchy

### Mobile Layout (< 768px)
```
┌───────────────────────────────────────────────────┐
│  📱 MOBILE VIEWPORT (full width)                  │
├───────────────────────────────────────────────────┤
│                                                   │
│  [Gifta Logo]        [Hamburger Menu]             │
│                                                   │
├───────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════╗│
│  ║ ✨ Warm gradient backdrop (radial)             ║│
│  ║                                               ║│
│  ║   "One dream gift.                            ║│
│  ║    Everyone chips in."  <- accent coral       ║│
│  ║                                               ║│
│  ║   Friends and family each give a little...    ║│
│  ║                                               ║│
│  ║   [CTA: Create Your Free Dreamboard]          ║│
│  ╚═══════════════════════════════════════════════╝│
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ 🎂 3,400+ gifts funded this year            │ │
│  │ (Stats pill - white, centered)              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ 💬 Rotating testimonial (5s rotation)       │ │
│  │                                             │ │
│  │ "No more wandering toy aisles..."           │ │
│  │ — Rachel K., Mom of Sophie, 8               │ │
│  │ • • •  (indicator dots)                      │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ [CTA: Create Your Free Dreamboard]          │ │
│  │ [Secondary: Login]                          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│  HOW IT WORKS (full width section)               │
│                                                   │
│  ┌──────────┐                                     │
│  │ 1 🎁     │  Create a Dreamboard               │
│  │ Set up   │  Add your child's one big wish...  │
│  └──────────┘                                     │
│                                                   │
│  ┌──────────┐                                     │
│  │ 2 📲     │  Share your Dreamboard             │
│  │ Send     │  Send via WhatsApp...              │
│  └──────────┘                                     │
│                                                   │
│  ┌──────────┐                                     │
│  │ 3 🎉     │  Gift funded                       │
│  │ Receive  │  Funds go to your Karri Card...    │
│  └──────────┘                                     │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│  [CTA: Create Your Free Dreamboard]              │
│                                                   │
├───────────────────────────────────────────────────┤
│  FOOTER                                           │
│  🎁 Gifta • Birthday gifting, simplified.        │
│  [Social icons]                                   │
│  [Trust badges]                                   │
│  [Legal links]                                    │
│  © 2026 Gifta (Pty) Ltd.                         │
└───────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1023px)
```
┌───────────────────────────────────────────────────────────┐
│  [Logo]                              [Nav Links] [CTA]    │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────┐  (GRID: 2 col, gap-12)         │
│  │ HERO TEXT (col 1)   │  ┌──────────────────────────┐  │
│  │                     │  │ DREAMBOARD PREVIEW       │  │
│  │ "One dream gift."   │  │ (col 2, floats right)    │  │
│  │ "Everyone chips.."  │  │                          │  │
│  │                     │  │ [White card shadow]      │  │
│  │ Subheading text...  │  │                          │  │
│  │                     │  └──────────────────────────┘  │
│  │ [Stats: 3,400+]     │                                │
│  │                     │  (Overlapping slightly)        │
│  │ [Testimonial]       │                                │
│  │                     │                                │
│  │ [CTA Button]        │                                │
│  └─────────────────────┘                                │
│                                                           │
├───────────────────────────────────────────────────────────┤
│  HOW IT WORKS (3-column card grid)                       │
│  [Card 1] [Card 2] [Card 3]                             │
├───────────────────────────────────────────────────────────┤
│  [Centered CTA: Create Your Free Dreamboard]             │
├───────────────────────────────────────────────────────────┤
│  FOOTER (horizontal layout)                              │
└───────────────────────────────────────────────────────────┘
```

### Desktop Layout (1024px+)
```
┌──────────────────────────────────────────────────────────────────────┐
│ [Logo] [Nav: How it works] [Trust & safety] [Create] [Login]        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║  MAIN HERO GRID (1.1fr | 0.9fr)                             ║  │
│  ║  ├─ LEFT COLUMN (Wide) ────────┬─ RIGHT COLUMN (Narrow) ──┤ ║  │
│  ║  │                              │                          │ ║  │
│  ║  │  "One dream gift."           │  ╔════════════════════╗ │ ║  │
│  ║  │  "Everyone chips in." ◄──    │  ║ Mia's Dreamboard   ║ │ ║  │
│  ║  │  (coral accent)              │  ║ [Card Preview]     ║ │ ║  │
│  ║  │                              │  ║ - Avatar           ║ │ ║  │
│  ║  │  Subheading...               │  ║ - Birthday info    ║ │ ║  │
│  ║  │                              │  ║ - Gift item        ║ │ ║  │
│  ║  │ [Stats Pill ─────────────]   │  ║ - Progress bar 82% ║ │ ║  │
│  ║  │  🎂 3,400+ gifts funded      │  ║ - 7 contributors   ║ │ ║  │
│  ║  │                              │  ║ [Chip in CTA]      ║ │ ║  │
│  ║  │ [Testimonial Card ────────]  │  ║                    ║ │ ║  │
│  ║  │  💬 "No more wandering.."    │  ╚════════════════════╝ │ ║  │
│  ║  │  — Rachel K.                 │                         │ ║  │
│  ║  │  • • • (indicators)          │  (Animated float)       │ ║  │
│  ║  │                              │  (Animated fade-in)     │ ║  │
│  ║  │ [CTA: Create Free Board]     │                         │ ║  │
│  ║  │                              │                         │ ║  │
│  ║  └──────────────────────────────┴──────────────────────────┘ ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  Warm gradient overlays (decorative, no interaction)               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS                                                        │
│  3-card grid: Create → Share → Receive                             │
├──────────────────────────────────────────────────────────────────────┤
│  [Centered CTA: Create Your Free Dreamboard]                        │
├──────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                              │
│  [Logo] [Social Icons] [Trust Badges] [Legal Links] [Copyright]    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Section-by-Section Specification

### 1. Navigation Bar (LandingNav)

#### 1.1 Desktop Navigation (lg breakpoint, 1024px+)

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Gifta  [How it works] [Trust & safety]  [Create] [Login] │
└─────────────────────────────────────────────────────────────┘
```

**Spacing & Layout:**
- **Container padding:**
  - Mobile: `px-4 py-4` (16px horizontal, 16px vertical)
  - Tablet: `px-10 py-6` (40px horizontal, 24px vertical)
  - Desktop: `px-16 py-7` (64px horizontal, 28px vertical)
- **Height:** Min 56px (Touch target: 44px minimum for buttons/links)
- **Background:** `#FFFCF9` (page background) with bottom border `border-b border-black/[0.04]`
- **Position:** `relative z-10` (above ambient gradients)

**Logo:**
- **Font:** Nunito Bold
- **Text Size:** 28px (desktop), scaled down to 20px on mobile
- **Icon:** 🎁 at 30px (desktop), 22px (mobile)
- **Gap between icon + text:** 2.5 (10px)
- **Color:** `#3D3D3D` for text
- **Link behavior:** Navigate to `/` (homepage)
- **No underline:** `no-underline`

**Desktop Nav Links (hidden on mobile, visible on lg):**
- **Display:** `hidden lg:flex`
- **Gap between items:** 10 (40px)
- **Links:**
  1. "How it works" → `href="#how-it-works"` (smooth scroll)
  2. "Trust & safety" → `href="#trust"` (smooth scroll)
- **Typography:**
  - Font: DM Sans, Medium (500)
  - Size: 15px
  - Color: `#777`
  - Hover: `#3D3D3D` with smooth `transition-colors`
  - No underline decoration

**Desktop CTA Buttons (hidden on mobile):**
- **Layout:** Two buttons side-by-side
- **Button 1 - "Create a Free Dreamboard" (Primary):**
  - Background: `gradient-to-br from-[#6B9E88] to-[#5A8E78]`
  - Text: White, semibold, 15px
  - Padding: `px-7 py-3.5` (28px horizontal, 14px vertical)
  - Border radius: `rounded-[10px]`
  - Shadow: `shadow-[0_4px_16px_rgba(107,158,136,0.3)]`
  - Hover: `-translate-y-0.5` + shadow-[0_6px_20px_rgba(107,158,136,0.4)]
  - Active: `translate-y-0` + shadow-[0_2px_12px_rgba(107,158,136,0.3)]
  - Transition: `transition-all` (duration-200 implied)
  - Min height: 44px (touch target)
  - Link to `/create`

- **Button 2 - "Login" (Secondary/Outline):**
  - Background: transparent
  - Border: `border-2 border-[#5A8E78]`
  - Text: `#5A8E78`, semibold, 15px
  - Padding: `px-6 py-3` (24px horizontal, 12px vertical)
  - Border radius: `rounded-[10px]`
  - Hover: `bg-[#5A8E78] text-white`
  - Transition: `transition-all`
  - Link to `/create` (on landing, this re-uses create button as a placeholder)
  - Min height: 44px (touch target)

#### 1.2 Mobile Navigation (< lg breakpoint)

**Desktop nav links hidden:** `lg:hidden`

**Hamburger Menu Button:**
- **Position:** `lg:hidden flex flex-col gap-[5px]`
- **Width x Height:** 6 x variable (3 lines)
- **Padding:** `p-2` (8px)
- **Z-index:** `z-[60]` (floats above menu overlay)
- **Three horizontal lines:**
  - Line 1: When menu open → `rotate-45 translate-y-[7px]`
  - Line 2: When menu open → `opacity-0`
  - Line 3: When menu open → `-rotate-45 -translate-y-[7px]`
  - All lines: `w-6 h-0.5 bg-[#3D3D3D]`
  - Transition: `transition-all duration-300`
- **ARIA attributes:**
  - `aria-label="Toggle menu"`
  - `aria-expanded={mobileMenuOpen}` (boolean)
  - `aria-controls="mobile-menu"`

**Mobile Menu Drawer (when open):**
- **Overlay:** `fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-300`
- **Drawer:** `fixed top-0 right-0 bottom-0 z-50 w-[280px] max-w-[85vw]`
- **Background:** `#FFFCF9`
- **Padding:** `px-6 pt-20 pb-6`
- **Layout:** `flex flex-col gap-2`
- **Animation:** `animate-in slide-in-from-right duration-300`
- **ARIA attributes:**
  - `role="dialog"`
  - `aria-modal="true"`
  - `id="mobile-menu"`

**Mobile Menu Links:**
- **Styling per link:**
  - Block element: `block px-4 py-4`
  - Color: `#3D3D3D`
  - Font: DM Sans, medium, base size
  - Border radius: `rounded-lg`
  - Hover: `bg-black/[0.04]`
  - Transition: `transition-colors`
- **Close on click:** `onClick={() => closeMenu()}`
- **Links (from content.ts):**
  1. "How it works" → `#how-it-works`
  2. "Trust & safety" → `#trust`

**Mobile Menu CTA:**
- **Position:** `mt-auto` (pushed to bottom)
- **Width:** `w-full`
- **Styling:** Same as desktop primary CTA but full-width
- **Text:** "Create a Free Dreamboard"
- **Link:** `/create`
- **Close on click:** `onClick={() => closeMenu()}`

**Menu keyboard navigation:**
- Escape key closes menu and returns focus to hamburger button
- Tab/Shift+Tab trapped within menu (focus cycling)
- First focusable element receives focus on open

---

### 2. Hero Section (LandingHero)

#### 2.1 Content

**Headline:**
- **Text:** "One dream gift. Everyone chips in."
- **First line:** "One dream gift."
- **Second line:** "Everyone chips in." (accent color applied)
- **Line break:** HTML `<br />`

**Subheading:**
- **Text:** "Friends and family each give a little. Your child gets the gift they've been dreaming of."
- **Character limit:** ~110 characters
- **Color:** `#666` (medium gray)

#### 2.2 Typography

**Headline (h1):**
- **Font family:** DM Serif Display
- **Font weight:** Medium (500)
- **Size (responsive):**
  - Mobile: 32px
  - Tablet: 42px
  - Desktop: 54px
- **Line height:** 1.15 (tight for impact)
- **Letter spacing:** -0.5px (optical adjustment for tightness)
- **Color:** `#2D2D2D` (dark gray)
- **Accent span color:** `#C4785A` (warm coral)
- **Margin bottom:**
  - Mobile: `mb-5` (20px)
  - Tablet: `mb-7` (28px)
  - Desktop: `mb-10` (40px)

**Subheading (p):**
- **Font family:** DM Sans
- **Font weight:** Regular (400)
- **Size (responsive):**
  - Mobile: 16px
  - Tablet: 17px
  - Desktop: 19px
- **Line height:** 1.8 (readable, open)
- **Color:** `#666` (medium gray)
- **Max width:** `max-w-[500px]` (readable line length)
- **Margin bottom:**
  - Mobile: `mb-0` (reset)
  - Desktop: `lg:mb-10` (40px spacing before stats)

#### 2.3 Animation

- **Class:** `animate-landing-fade-up`
- **Behavior:** Fade in + translate up from bottom
- **Duration:** 600ms
- **Easing:** ease-out
- **Delay:** 0ms (first in sequence)

#### 2.4 Container

- **Class:** `landing-hero-text animate-landing-fade-up`
- **Order (responsive):**
  - Mobile: `order-1` (first)
  - Tablet: Reordered via grid
  - Desktop: Follows natural DOM

---

### 3. Dreamboard Preview Card (LandingDreamBoard)

#### 3.1 Overview

This card animates to showcase what a filled-out Dreamboard looks like. It demonstrates:
- Child's profile + birthday info
- The "one big wish" gift item
- Progress bar with live funding indicator
- Contributor avatars with pulse animation
- Call-to-action button

#### 3.2 Container & Layout

**Outer container:**
- **Position:** `relative animate-landing-fade-up [animation-delay:150ms]`
- **Animation delay:** 150ms (staggered after hero)

**Card itself:**
- **Background:** White
- **Border radius:** `rounded-3xl` (mobile), `rounded-[28px]` (desktop)
- **Shadow:** `shadow-[0_16px_48px_rgba(0,0,0,0.08)]` (mobile), `shadow-[0_32px_80px_rgba(0,0,0,0.08)]` (desktop)
- **Overflow:** `overflow-hidden` (to clip rounded corners)
- **Max widths:**
  - Mobile: full-width (auto)
  - Tablet: `md:max-w-[420px] md:mx-auto` (420px centered)
  - Desktop: `lg:max-w-none` (full width in grid)
- **Desktop animation:** `lg:animate-landing-float` (subtle floating motion)
- **Overflow:** `overflow-hidden` (rounded corners)

#### 3.3 Header Section

**Background gradient:**
- **Gradient:** `bg-gradient-to-br from-[#E4F0E8] to-[#D5E8DC]`
- **Padding:** `px-5 py-6` (20px, 24px)
- **Text align:** center
- **Position:** `relative`

**Child avatar:**
- **Container:** `relative w-20 h-20 mx-auto mb-3` (80x80px, centered, 12px bottom margin)
- **Image element:**
  - **Source:** `/images/demo-child.png`
  - **Alt text:** "Mia" (matches child name in demo)
  - **Fill mode:** `fill` (Next.js Image optimization)
  - **Positioning:** `object-cover object-[center_20%]` (crop from center, 20% down)
  - **Border:** `border-[3px] border-white` (white ring)
  - **Border radius:** `rounded-full`
  - **Shadow:** `shadow-[0_8px_24px_rgba(252,182,159,0.3)]` (warm shadow)
  - **Priority:** `priority` (load without lazy)

**Child name (h3):**
- **Text:** "Mia's Dreamboard" (dynamic: `${childName}'s Dreamboard`)
- **Font family:** DM Serif Display
- **Font weight:** Medium (500)
- **Size:** 22px
- **Color:** `#2D2D2D`
- **Margin bottom:** `mb-1` (4px)

**Birthday info (p):**
- **Text:** "Turning 6 • March 28th"
- **Format:** `Turning ${age} • ${formattedDate}`
- **Font size:** 13px
- **Color:** `#999` (light gray)
- **Font weight:** Regular

#### 3.4 Gift Item Section

**Container:**
- **Background gradient:** `bg-gradient-to-br from-[#FFFBF7] to-[#FFF8F2]`
- **Border radius:** `rounded-2xl`
- **Padding:** `p-5` (20px)
- **Margin bottom:** `mb-6` (24px)
- **Border:** `border border-[rgba(200,160,100,0.1)]` (subtle tan border)

**Label:**
- **Text:** "✨ MIA'S ONE BIG WISH"
- **Format:** `✨ ${childName.toUpperCase()}'S ONE BIG WISH`
- **Font size:** 11px
- **Font weight:** semibold (600)
- **Color:** `#5A8E78` (teal accent)
- **Letter spacing:** `tracking-[1.2px]`
- **Margin bottom:** `mb-3.5` (14px)

**Gift item display:**
- **Layout:** `flex items-center gap-4`

**Gift emoji/icon:**
- **Container:** `w-16 h-16 rounded-[14px]` (64x64px)
- **Background gradient:** `bg-gradient-to-br from-[#FFF0F5] to-[#FFE4EC]` (soft pink)
- **Content:** Centered, 32px emoji (e.g., 🎀 for Ballet)
- **Display:** `flex items-center justify-center`

**Gift info:**
- **Title (h4):**
  - **Text:** "Ballet Starter Kit" (dynamic: `${giftName}`)
  - **Font family:** Fraunces (app display font for emphasis)
  - **Font size:** 18px
  - **Font weight:** Medium (500)
  - **Color:** `#2D2D2D`
  - **Margin bottom:** `mb-0.5` (2px)
- **Description (p):**
  - **Text:** "Shoes, tutu & dance bag" (dynamic: `${giftDescription}`)
  - **Font size:** 13px
  - **Color:** `#999`

#### 3.5 Progress Section

**Container:**
- **Margin bottom:** `mb-7` (28px)

**Progress header:**
- **Layout:** `flex justify-between mb-2.5`

**Funded amount:**
- **Number display:**
  - **Text:** Progress value (animated from 0 to 82%)
  - **Font family:** Fraunces (display)
  - **Font size:** 28px
  - **Font weight:** semibold (600)
  - **Color:** `#2D2D2D`
- **Label:**
  - **Text:** "funded"
  - **Font size:** small (14px)
  - **Color:** `#999`
  - **Margin left:** `ml-2` (8px)

**Days remaining (right side):**
- **Text:** "18 days left"
- **Font size:** small (14px)
- **Color:** `#999`
- **Alignment:** `self-end` (bottom-aligned)

**Progress bar:**
- **Background:** `h-2.5 bg-[#F5EFE8] rounded-[10px]` (light tan container)
- **Overflow:** `overflow-hidden relative`
- **Fill element:**
  - **Background gradient:** `bg-gradient-to-r from-[#6B9E88] to-[#5A8E78]`
  - **Border radius:** `rounded-[10px]`
  - **Height:** `h-full`
  - **Animation:** `transition-[width] duration-[1.5s] ease-out`
  - **Initial state:** `width: 0%`
  - **Final state:** `width: ${progress}%` (animated)

**Shine animation (on progress bar):**
- **Pseudo-element:** `absolute top-0 left-[-100%] w-full h-full`
- **Gradient:** `bg-gradient-to-r from-transparent via-white/30 to-transparent`
- **Animation:** `animate-landing-progress-shine` (loops across bar)

#### 3.6 Contributors Section

**Container:**
- **Background:** `#FDFBF9` (warm white)
- **Border radius:** `rounded-[14px]`
- **Padding:** `p-4` (16px)
- **Margin bottom:** `mb-5` (20px)

**Header:**
- **Layout:** `flex justify-between items-center mb-3`
- **Text:** "🎉 7 people have chipped in"
- **Font size:** xs (12px)
- **Font weight:** semibold (600)
- **Color:** `#666`

**Contributor avatars (flex wrap layout):**
- **Layout:** `flex items-center flex-wrap`
- **Avatar styling per contributor:**
  - **Width x Height:**
    - Mobile: `w-9 h-9` (36x36px)
    - Tablet/Desktop: `md:w-[42px] md:h-[42px]` (42x42px)
  - **Border radius:** `rounded-full`
  - **Display:** `flex items-center justify-center`
  - **Background color:** Dynamic from contributor color array:
    - `#F5C6AA` (warm peach)
    - `#A8D4E6` (soft blue)
    - `#B8E0B8` (mint green)
    - `#E6B8B8` (dusty rose)
    - `#F0E68C` (soft yellow)
    - `#B8D4E0` (powder blue)
    - `#D8B8E8` (soft lavender)
  - **Border:** `border-2 border-white` (white separator)
  - **Shadow:** `shadow-[0_2px_8px_rgba(0,0,0,0.06)]`
  - **Text (initials):**
    - **Font size:** xs (12px mobile), 13px (tablet/desktop)
    - **Font weight:** semibold (600)
    - **Color:** `#6B5B4F` (warm brown)
  - **Margin left:**
    - First avatar: `i > 0 ? -8 : 0` (stack with -8px overlap)
    - Creates overlapped avatar stack effect
  - **Z-index:** `zIndex: contributors.length - i` (proper stacking order)
  - **Pulse animation (on selected):**
    - Applied when `contributorPulse === i`
    - Animation: `'landing-soft-pulse 0.6s ease-out'`
    - Cycles through contributors every 800ms

**New contributor badge (after avatars):**
- **Container:** `ml-2.5 px-2.5 py-1.5`
- **Background gradient:** `bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]` (light green)
- **Border radius:** `rounded-[20px]` (pill shape)
- **Font size:** 11px
- **Font weight:** semibold (600)
- **Color:** `#4CAF50` (green)
- **Text:** "+3 today!" (dynamic: `+${newToday}`)

#### 3.7 Call-to-Action Button

**Container:**
- **Width:** `w-full`
- **Min height:** `min-h-[44px]` (touch target)
- **Background:** transparent
- **Border:** `border-2 border-[#5A8E78]`
- **Padding:** `px-3.5 py-3.5`
- **Border radius:** `rounded-xl`
- **Font weight:** semibold (600)
- **Font size:** 15px
- **Color:** `#5A8E78`
- **Cursor:** `cursor-default` (disabled/demo state on landing)
- **Opacity:** `opacity-80` (indicates non-interactive)

**Text:**
- **Content:** "Chip in for Mia" (dynamic: `Chip in for ${childName}`)
- **Icon:** 💝 (20px emoji)
- **Layout:** `flex items-center justify-center gap-2`

#### 3.8 State Management

**Progress animation:**
- Initial: `progress = 0`
- Triggered: 1000ms (`PROGRESS_DELAY`) after component mount
- Animation: Smoothly transitions to 82% over 1.5 seconds
- CSS: `transition-[width] duration-[1.5s] ease-out`

**Contributor pulse:**
- Cycles through 7 contributors
- Duration: 800ms per contributor (`CONTRIBUTOR_PULSE`)
- Animation: `landing-soft-pulse` keyframe
- Easing: ease-out

---

### 4. Stats Line (LandingStatsLine)

#### 4.1 Overview
A single-line stats callout displaying social proof. Appears inline on mobile, positioned in hero stack on desktop.

#### 4.2 Container

- **Display:** `flex items-center justify-center gap-2.5`
- **Padding:** `px-4 py-3.5` (16px, 14px)
- **Background:** White (`bg-white`)
- **Border radius:** `rounded-xl`
- **Shadow:** `shadow-[0_4px_16px_rgba(0,0,0,0.04)]`
- **Border:** `border border-black/[0.04]`
- **Width:** `w-fit` (content-based)
- **Alignment (responsive):**
  - Mobile: `mx-auto` (centered)
  - Desktop: `lg:mx-0 lg:my-6` (left-aligned, 24px vertical margin)
- **Font size:** small (14px)
- **Color:** `#666` (medium gray)

#### 4.3 Content

**Icon:**
- **Emoji:** 🎂
- **Font size:** large (18px)

**Text:**
- **Format:** "<strong>3,400+</strong> gifts funded this year"
- **Dynamic:** Replace 3,400 with actual stat from API
- **Strong number color:** `#3D3D3D` (dark gray)
- **Rest color:** `#666`

---

### 5. Testimonial Section (LandingTestimonial)

#### 5.1 Overview
Rotating testimonial card that cycles through 3 testimonials every 5 seconds. Provides social proof from real parent users.

#### 5.2 Container

- **Background:** White (`bg-white`)
- **Padding:** `p-5 md:p-7` (20px mobile, 28px tablet/desktop)
- **Border radius:** `rounded-2xl md:rounded-[20px]`
- **Shadow:** `shadow-[0_8px_32px_rgba(0,0,0,0.04)]`
- **Border:** `border border-black/[0.04]`

#### 5.3 Content Layout

**Inner flex:**
- **Layout:** `flex gap-4`

**Avatar circle:**
- **Container:** `w-11 h-11 rounded-full` (44x44px)
- **Background gradient:** `bg-gradient-to-br from-[#F2E6DC] to-[#E6DCD2]` (warm tan)
- **Content:** 💬 emoji (18px)
- **Alignment:** `flex items-center justify-center`
- **Flex shrink:** `flex-shrink-0` (prevents shrinking)

**Text container:**
- **Flex:** `flex-1 min-w-0` (grows to fill, allows text wrapping)

**Animated testimonial quote (div with key):**
- **Animation:** `animate-landing-testimonial-fade`
- **Key:** Updated per active testimonial to trigger re-animation

**Quote text (p):**
- **Font family:** DM Serif Display (elegant)
- **Font size:** 15px
- **Line height:** 1.65
- **Color:** `#444` (dark gray)
- **Style:** italic
- **Margin bottom:** `mb-3` (12px)
- **Content:** `"&ldquo;{quote}&rdquo;"` (smart quotes)

**Author attribution (p):**
- **Font size:** 13px
- **Color:** `#999`
- **Author name (strong):**
  - **Font weight:** bold
  - **Color:** `#666`
- **Format:** "**{author}** · {relation}"
- **Example:** "Rachel K. · Mom of Sophie, 8"

#### 5.4 Indicator Dots

**Container:**
- **Layout:** `flex gap-2 mt-4 ml-[60px]`
- **Margin top:** 16px (space from quote)
- **Margin left:** 60px (aligns below avatar)

**Each dot (per testimonial):**
- **Size:** `w-2 h-2` (8x8px)
- **Shape:** `rounded-full`
- **Transition:** `transition-colors duration-300`
- **Active color:** `#5A8E78` (teal)
- **Inactive color:** `#E8E0D8` (light tan)

#### 5.5 Animation & Rotation

**State management:**
- **Active index:** `activeTestimonial` (starts at 0)
- **Rotation trigger:** `useEffect` with interval
- **Interval duration:** 5000ms (`TESTIMONIAL_ROTATION`)
- **Rotation logic:** `(prev) => (prev + 1) % testimonials.length`

**Fade animation:**
- **Name:** `animate-landing-testimonial-fade`
- **Behavior:** Fade in/out when quote changes
- **Duration:** 300-400ms
- **Easing:** ease-in-out

---

### 6. CTA Section (LandingCTA)

#### 6.1 Overview
Flexible CTA section with primary action button used in the hero area. A separate closing CTA banner appears near the footer.

#### 6.2 Container

- **Display:** `flex flex-col gap-4` (mobile)
- **Responsive:** `md:flex-row md:items-center md:justify-center md:gap-6` (tablet: horizontal)
- **Desktop:** `lg:mt-8 lg:mb-12 lg:justify-start` (positioned in hero, left-aligned)
- **Margin bottom:** `mb-8` (32px)
- **Animation:** `animate-landing-fade-up` (fade in from below)

#### 6.3 Primary Button

- **Link:** `/create`
- **Background:** `gradient-to-br from-[#6B9E88] to-[#5A8E78]`
- **Padding:** `px-7 py-4 md:px-9 md:py-[18px]` (28/36px horizontal, 16/18px vertical)
- **Border radius:** `rounded-xl`
- **Font:** semibold, 15px (mobile), base (16px) tablet, 17px desktop
- **Color:** White
- **Text align:** center
- **Shadow:** `shadow-[0_4px_16px_rgba(107,158,136,0.3)]`
- **Min height:** `min-h-[44px]` (touch target)
- **Text:** "Create Your Free Dreamboard"
- **Hover state:**
  - Transform: `-translate-y-0.5` (subtle lift)
  - Shadow: `shadow-[0_6px_20px_rgba(107,158,136,0.4)]` (deeper)
- **Active state:**
  - Transform: `translate-y-0` (back to normal)
  - Shadow: `shadow-[0_2px_12px_rgba(107,158,136,0.3)]` (light)
- **Transition:** `transition-all` (200ms default)

---

### 7. How It Works Section (LandingHowItWorks)

#### 7.1 Section Container

- **Section ID:** `id="how-it-works"` (anchor link target)
- **Padding:** `px-6 pt-14 pb-10 md:px-10 md:pt-20 md:pb-14`
- **Max width:** `max-w-[1000px]`
- **Margin:** `mx-auto` (centered)
- **Position:** `relative z-[5]` (above gradients)
- **Background:** `bg-[#FAF7F2]` (warm linen band for section rhythm)

#### 7.2 Section Heading

- **Tag:** h2
- **Font family:** DM Serif Display
- **Font weight:** Medium (500)
- **Size:** 28px (mobile), 36px (desktop)
- **Color:** `#2D2D2D`
- **Text align:** center
- **Margin bottom:** `mb-10 md:mb-14` (40px/56px)
- **Text:** "How it works"

#### 7.3 Card Grid

- **Display:** `grid`
- **Grid columns:** `grid-cols-1 md:grid-cols-3` (1 col mobile, 3 col desktop)
- **Gap:** `gap-6 md:gap-8` (24px/32px)

#### 7.4 Individual Step Card

**Container:**
- **Background:** White
- **Border radius:** `rounded-[20px]`
- **Padding:** `px-6 py-7` (24px/28px)
- **Shadow:** `shadow-[0_2px_12px_rgba(0,0,0,0.04)]`
- **Border:** `border border-[rgba(0,0,0,0.03)]`
- **Text align:** center
- **Position:** `relative`

**Step number badge (top-left):**
- **Position:** `absolute top-4 left-4`
- **Size:** `w-7 h-7` (28x28px)
- **Background:** `gradient-to-br from-[#6B9E88] to-[#5A8E78]`
- **Border radius:** `rounded-full`
- **Color:** White
- **Font size:** small (14px)
- **Font weight:** semibold
- **Display:** `flex items-center justify-center`
- **Content:** Number (1, 2, or 3)

**Step icon/emoji:**
- **Emoji:** 36px size
- **Margin bottom:** `mb-4` (16px)
- **Content:**
  - Step 1: 🎁
  - Step 2: 📲
  - Step 3: 🎉

**Step title (h3):**
- **Font family:** DM Serif Display
- **Font size:** large (18px)
- **Font weight:** Medium (500)
- **Color:** `#2D2D2D`
- **Margin bottom:** `mb-2` (8px)

**Step description (p):**
- **Font size:** small (14px)
- **Color:** `#666`
- **Line height:** 1.6

#### 7.5 Step Content (from content.ts)

```typescript
[
  {
    number: '1',
    icon: '🎁',
    title: 'Create a Dreamboard',
    description: "Add your child's one big wish and set a goal.",
  },
  {
    number: '2',
    icon: '📲',
    title: 'Share your Dreamboard',
    description: 'Send via WhatsApp. Friends and family chip in any amount — even from afar.',
  },
  {
    number: '3',
    icon: '🎉',
    title: 'Gift funded',
    description: 'Funds go to your Karri Card. You buy the dream gift.',
  },
]
```

---

### 8. Bottom CTA (Full-width, above footer)

#### 8.1 Container

- **Tag:** `section`
- **Padding:** `px-6 py-14 md:px-10 md:py-20`
- **Purpose:** final conversion block with headline, support copy, and primary CTA

#### 8.2 Inner Banner

- **Width:** `max-w-[760px] mx-auto`
- **Shape:** `rounded-[28px]`
- **Border:** `border border-[rgba(107,158,136,0.14)]`
- **Background:** `bg-[linear-gradient(180deg,rgba(250,247,242,0.96)_0%,rgba(255,252,249,0.96)_100%)]`
- **Depth:** `shadow-[0_8px_28px_rgba(90,142,120,0.08)]`
- **Padding:** `px-6 py-10 md:px-10 md:py-14`
- **Alignment:** `text-center`

#### 8.3 Closing Copy + CTA

- **Headline (h2):** "Ready to make gift-giving magic?" with DM Serif display styling
- **Subtitle:** "It takes less than a minute. No app needed."
- **Primary CTA:**
  - **Link:** `/create`
  - **Text:** "Create Your Free Dreamboard"
  - **Class contract:** must retain exact `from-[#6B9E88] to-[#5A8E78]` substring
  - **Display:** `inline-block` for centered alignment

---

### 9. Footer (LandingFooter)

#### 9.1 Footer Container

- **Tag:** footer
- **Section ID:** `id="trust"` (anchor link target)
- **Position:** `relative`
- **Padding:** `px-5 py-10 md:px-10 md:py-12` (mobile/tablet)
- **Background gradient:** `bg-gradient-to-b from-transparent to-[rgba(255,252,249,0.95)]` (fade to warm white)
- **Display:** `flex flex-col items-center gap-6`

#### 9.2 Logo Block

**Container:**
- **Text align:** center

**Logo text:**
- **Display:** `flex items-center justify-center gap-2`
- **Margin bottom:** `mb-1.5` (6px)
- **Font family:** Nunito
- **Font size:** 22px
- **Font weight:** bold
- **Color:** `#3D3D3D`

**Logo emoji:**
- **Icon:** 🎁
- **Size:** xl (20px)

**Tagline:**
- **Text:** "Birthday gifting, simplified."
- **Font size:** 13px
- **Font weight:** medium
- **Color:** `#999`

#### 9.3 Social Links

**Container:**
- **Display:** `flex items-center gap-4`

**Each link (from content.ts):**
- **Target:** blank (new tab)
- **rel:** "noopener noreferrer"
- **Icon button:**
  - **Size:** `w-10 h-10` (40x40px)
  - **Border radius:** `rounded-full`
  - **Background:** `bg-black/[0.03]`
  - **Color:** `#888`
  - **Transition:** `transition-all`
  - **Hover:**
    - **Color:** `#5A8E78`
    - **Background:** `rgba(107,158,136,0.1)`
    - **Transform:** `-translate-y-0.5` (lift)
  - **Display:** `flex items-center justify-center`
- **ARIA label:** Social platform name
- **SVG icons:**
  - Instagram: Circle with dot + circle in center
  - Facebook: FB icon
  - LinkedIn: LI icon
  - TikTok: TikTok icon

#### 9.4 Trust Badges

**Container:**
- **Display:** `flex flex-wrap justify-center gap-4 md:gap-8`

**Each badge (from content.ts):**
- **Text:** "{icon} {text}"
- **Font size:** xs (12px) mobile, 13px (desktop)
- **Color:** `#AAA`
- **Whitespace:** `whitespace-nowrap` (prevent wrapping text)
- **Content:**
  1. 🏦 Payouts via Karri Card
  2. 🔒 Secure payments
  3. 📱 Share via WhatsApp

#### 9.5 Legal Links

**Container:**
- **Display:** `flex flex-wrap justify-center items-center gap-2`
- **Font size:** 13px

**Links:**
1. Privacy Policy → `/privacy`
2. Terms of Service → `/terms`
3. POPIA Notice → `/popia`
4. Contact Us → `/contact`

**Styling per link:**
- **Color:** `#999`
- **No underline:** `no-underline`
- **Hover:** `text-[#5A8E78]` with `transition-colors`

**Separators (·):**
- **Character:** · (middle dot)
- **Color:** `#CCC`

#### 9.6 Copyright

- **Text:** "© {year} Gifta (Pty) Ltd. All rights reserved."
- **Font size:** xs (12px)
- **Color:** `#BBB`
- **Text align:** center

---

## Component Tree

```
LandingPage
├── LandingNav
│   ├── Desktop nav container (hidden < lg)
│   │   ├── Logo + brand
│   │   ├── Nav links (how-it-works, trust-safety)
│   │   └── CTA buttons (Create, Login)
│   └── Mobile menu (hamburger + drawer)
│       ├── Hamburger button (3 lines)
│       ├── Overlay (black/50)
│       └── Drawer (fixed right)
│           ├── Nav links
│           └── CTA button
│
├── Main hero grid (flex/grid responsive)
│   │
│   ├── Left column (order-1, lg:order-none)
│   │   ├── LandingHero
│   │   │   ├── h1 (headline)
│   │   │   └── p (subheading)
│   │   │
│   │   ├── LandingStatsLine (order-3)
│   │   │   ├── Icon (emoji)
│   │   │   └── Text (stat)
│   │   │
│   │   ├── LandingTestimonial (order-4)
│   │   │   ├── Avatar circle
│   │   │   ├── Quote (animated)
│   │   │   ├── Author info
│   │   │   └── Indicator dots
│   │   │
│   │   └── LandingCTA (order-5)
│   │       └── CTA button
│   │
│   └── Right column (order-2, lg:order-none)
│       └── LandingDreamBoard
│           ├── Header
│           │   ├── Avatar image
│           │   ├── Child name (h3)
│           │   └── Birthday info (p)
│           │
│           ├── Gift section
│           │   ├── Label
│           │   ├── Gift emoji icon
│           │   ├── Gift title (h4)
│           │   └── Gift description (p)
│           │
│           ├── Progress section
│           │   ├── Progress value display
│           │   ├── Days remaining
│           │   ├── Progress bar
│           │   │   └── Shine animation
│           │   └── Progress label ("funded")
│           │
│           ├── Contributors section
│           │   ├── Header ("X people have chipped in")
│           │   ├── Avatar stack
│           │   │   ├── Multiple avatars (overlapped)
│           │   │   │   └── [Pulse animation on rotation]
│           │   │   └── New contributor badge
│           │   │
│           │   └── Button ("Chip in for Mia")
│           │
│           └── CTA button (disabled/demo)
│
├── LandingHowItWorks (section)
│   ├── Section heading (h2)
│   └── 3-card grid
│       ├── Card 1 (Create)
│       │   ├── Step badge (1)
│       │   ├── Icon (🎁)
│       │   ├── Title
│       │   └── Description
│       ├── Card 2 (Share)
│       │   ├── Step badge (2)
│       │   ├── Icon (📲)
│       │   ├── Title
│       │   └── Description
│       └── Card 3 (Receive)
│           ├── Step badge (3)
│           ├── Icon (🎉)
│           ├── Title
│           └── Description
│
├── Bottom CTA section
│   └── CTA button (Create)
│
└── LandingFooter (footer)
    ├── Logo + tagline
    ├── Social links (flex)
    │   ├── Instagram icon
    │   ├── Facebook icon
    │   ├── LinkedIn icon
    │   └── TikTok icon
    ├── Trust badges (flex-wrap)
    │   ├── Karri Card badge
    │   ├── Secure payments badge
    │   └── WhatsApp badge
    ├── Legal links (flex-wrap)
    │   ├── Privacy Policy
    │   ├── Terms of Service
    │   ├── POPIA Notice
    │   └── Contact Us
    └── Copyright text
```

---

## TypeScript Interfaces

```typescript
// Landing Page Props
interface LandingPageProps {}

// Landing Navigation Props
interface LandingNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// Navigation Link type
interface NavLink {
  label: string;
  href: string;
}

// Contributor type
interface Contributor {
  name: string;
  color: string;
}

// Testimonial type
interface Testimonial {
  quote: string;
  author: string;
  relation: string;
}

// Trust item type
interface TrustItem {
  icon: string;
  text: string;
}

// Social link type
interface SocialLink {
  name: string;
  url: string;
}

// How It Works step type
interface HowItWorksStep {
  number: string;
  icon: string;
  title: string;
  description: string;
}

// Dreamboard state type
interface DreamBoardState {
  progress: number;
  contributorPulse: number;
}

// Timing config
interface TimingConfig {
  TESTIMONIAL_ROTATION: number;
  CONTRIBUTOR_PULSE: number;
  PROGRESS_DELAY: number;
}

// Demo data config
interface DemoDataConfig {
  PROGRESS_TARGET: number;
}
```

---

## File Structure

```
src/
├── components/
│   └── landing/
│       ├── LandingPage.tsx          (main page component, layout orchestration)
│       ├── LandingNav.tsx           (navigation with mobile drawer)
│       ├── LandingHero.tsx          (headline + subhead)
│       ├── LandingDreamBoard.tsx    (animated preview card)
│       ├── LandingStatsLine.tsx     (social proof stats)
│       ├── LandingTestimonial.tsx   (rotating testimonials)
│       ├── LandingCTA.tsx           (call-to-action button)
│       ├── LandingHowItWorks.tsx    (3-step process)
│       ├── LandingFooter.tsx        (footer with social/trust/legal)
│       ├── content.ts              (static content: testimonials, steps, etc.)
│       └── index.ts                (export barrel for landing components)
│
├── app/
│   └── (landing)/
│       └── page.tsx                (route handler: "/" renders LandingPage)
│
├── lib/
│   └── animations/
│       └── landing.css             (CSS keyframes for landing animations)
│
└── styles/
    └── landing.module.css          (scoped styles if needed)

docs/UX/ui-specs/
└── 01-LANDING-PAGE.md             (THIS FILE)
```

---

## Responsive Behavior

### Mobile Breakpoint (< 768px)

**LandingNav:**
- Hamburger menu visible, desktop nav hidden
- Full-width drawer slides from right on menu toggle
- Drawer z-index: 50, overlay z-index: 40

**Main content grid:**
- Single column layout
- Order: Hero (1) → Dreamboard (2) → Stats (3) → Testimonial (4) → CTA (5)
- Dreamboard appears above stats on mobile (visual priority)
- All padding/gaps: `px-5`, `gap-8`

**Spacing adjustments:**
- Hero text: `text-[32px]`, `mb-5`
- Stats pill: centered with `mx-auto`
- Cards: full width or `max-w-none`

### Tablet Breakpoint (768px - 1023px)

**LandingNav:**
- Hamburger still visible, desktop nav still hidden
- Padding increases to `px-10 py-6`

**Main content grid:**
- 2-column layout with `md:px-10` padding
- Hero + stats/testimonial/CTA on left
- Dreamboard on right, `md:max-w-[420px] md:mx-auto`
- Dreamboard floats center-right (visual balance)
- Gap between columns: `gap-12`

**Typography:**
- Hero: `text-[42px]` (up from 32px)
- Hero subhead: `text-[17px]`

**How It Works section:**
- 3 cards still single column? No, `md:grid-cols-3` applies at tablet
- Cards arranged horizontally

### Desktop Breakpoint (1024px+)

**LandingNav:**
- Hamburger hidden, desktop nav + buttons visible
- Full horizontal layout with logo, links, and CTAs
- Padding: `px-16 py-7`

**Main content grid:**
- Full 2-column grid layout: `lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center`
- Left column (wider): Hero + stats + testimonial + CTA
- Right column (narrower): Dreamboard (sticky floating animation)
- Dreamboard desktop animation: `lg:animate-landing-float`

**Typography:**
- Hero: `text-[54px]`
- Hero subhead: `text-[19px]`
- Stats: left-aligned with `lg:mx-0 lg:my-6`

**How It Works:**
- 3 cards in row: `md:grid-cols-3`

---

## Animations

### 1. Fade Up Animation (Landing Fade-Up)

**Keyframes:**
```css
@keyframes landing-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Applied to:**
- LandingHero
- LandingCTA
- LandingDreamBoard

**Duration:** 600ms
**Easing:** ease-out
**Delay:** Staggered via `[animation-delay]` utility

### 2. Testimonial Fade Animation

**Keyframes:**
```css
@keyframes landing-testimonial-fade {
  from {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**Applied to:** Quote/author content in testimonial card
**Duration:** 300ms
**Trigger:** When `activeTestimonial` changes

### 3. Progress Bar Shine

**Keyframes:**
```css
@keyframes landing-progress-shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

**Applied to:** Pseudo-element overlay in progress bar
**Duration:** 2s
**Easing:** ease-in-out
**Iteration:** Infinite loop

### 4. Soft Pulse (Contributor Avatar)

**Keyframes:**
```css
@keyframes landing-soft-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
}
```

**Applied to:** Active contributor avatar
**Duration:** 600ms
**Easing:** ease-out

### 5. Float Animation (Desktop Dreamboard)

**Keyframes:**
```css
@keyframes landing-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}
```

**Applied to:** LandingDreamBoard on desktop
**Duration:** 6s
**Easing:** ease-in-out
**Iteration:** Infinite

---

## Accessibility

### ARIA Attributes

**Navigation:**
- Hamburger button: `aria-label="Toggle menu"`, `aria-expanded={boolean}`, `aria-controls="mobile-menu"`
- Mobile menu container: `role="dialog"`, `aria-modal="true"`, `id="mobile-menu"`

**Testimonial dots:**
- No explicit ARIA needed (decorative; text-based indicator)

**Dreamboard:**
- Image: `alt="Mia"` (child's name)
- Avatar initials: Semantic HTML (no role needed)

**Buttons:**
- All CTA buttons: `min-h-[44px]` touch target size
- Focus state: Visible outline on `:focus` (browser default or custom)

### Keyboard Navigation

**Mobile menu:**
- Tab/Shift+Tab: Focus trapped within drawer
- Escape: Close drawer, return focus to hamburger
- Arrow keys: Not used (linear navigation only)

**Links and buttons:**
- All interactive elements: Keyboard accessible via Tab order
- Focus outline: Default browser outline or custom (recommend `outline-2 outline-offset-2`)

**Anchor links:**
- `href="#how-it-works"` and `href="#trust"` scroll smoothly to sections
- Smooth scroll CSS: `scroll-behavior: smooth` on `html` element

### Screen Reader Requirements

**Semantic HTML:**
- Use `<header>` for nav, `<section>` for How It Works, `<footer>` for footer
- Headings: `<h1>` for hero headline, `<h2>` for section headings, `<h3>` for subsections
- Navigation: `<nav>` element with `<a>` links

**Skip links (optional but recommended):**
```html
<a href="#main-content" className="sr-only">
  Skip to main content
</a>
```

**Alt text:**
- All images: Descriptive `alt` attribute (e.g., "Mia, age 6" for avatar)
- Decorative images: Empty `alt=""` + `aria-hidden="true"`

**Lists:**
- Nav links: Grouped in `<ul>` if multiple
- Footer links: Grouped logically in semantic structure

**Labels:**
- Form inputs (if any): `<label for="...">` with matching `id`
- Buttons: Visible text content (no icon-only buttons without labels)

---

## SEO & Meta

### Open Graph Tags (in page `<head>`)

```html
<meta property="og:title" content="Gifta: Birthday Gifting Simplified" />
<meta property="og:description" content="Pool contributions from friends and family toward one meaningful birthday gift. Create a free Dreamboard in minutes." />
<meta property="og:image" content="https://gifta.co.za/og-image.png" />
<meta property="og:image:alt" content="Gifta Dreamboard preview with child avatar and gift item" />
<meta property="og:url" content="https://gifta.co.za/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Gifta" />
```

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Gifta: Birthday Gifting Simplified" />
<meta name="twitter:description" content="One dream gift. Everyone chips in." />
<meta name="twitter:image" content="https://gifta.co.za/og-image.png" />
<meta name="twitter:creator" content="@gifta_za" />
```

### Meta Tags

```html
<meta name="description" content="Pool contributions from friends and family toward one meaningful birthday gift. Create a free Dreamboard in minutes." />
<meta name="keywords" content="birthday gifts, gift pooling, family gifting, South Africa" />
<meta name="author" content="Gifta (Pty) Ltd" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Gifta",
  "description": "Birthday gift pooling platform for families and friends",
  "url": "https://gifta.co.za",
  "applicationCategory": "WebApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "ZAR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "450"
  }
}
```

### Canonical Tag

```html
<link rel="canonical" href="https://gifta.co.za/" />
```

---

## Performance

### Image Optimization

**Hero/DreamBoard images:**
- Use Next.js `<Image>` component with `priority` for above-fold
- Set explicit width/height to prevent layout shift
- Use `object-cover` and `object-position` for cropping without distortion

**Example:**
```tsx
<Image
  src="/images/demo-child.png"
  alt="Mia"
  width={80}
  height={80}
  priority
  className="rounded-full"
/>
```

**Ambient gradients (background):**
- Use CSS gradients (no image files) to minimize requests
- `radial-gradient()` and `linear-gradient()` render on-GPU

### Lazy Loading

**Below-fold sections:**
- LandingHowItWorks: Lazy load images if added
- Footer: No lazy loading needed (minimal content)

**DreamBoard card:**
- Eager load (above fold on desktop)
- Mark with `priority` in Image component

### Critical Render Path

1. **Render-blocking:** Navigation bar (header)
2. **High priority:** Hero section (headline + subhead) + DreamBoard preview
3. **Medium priority:** Stats, testimonials, CTA buttons
4. **Low priority:** How It Works section, footer

**CSS:** Inline critical above-fold CSS; defer non-critical

**JavaScript:** Load animations only for visible sections; defer How It Works JS

### Bundle Size Considerations

- **Landing Page component:** ~15-20KB (gzipped)
- **All landing sub-components:** ~30-40KB total
- **Animation library:** CSS-only (no libraries like Framer Motion for landing)

### Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

---

## Edge Cases

### 0 Data / Empty States

**Example scenario:** API fails to fetch stats

**Handling:**
```tsx
<LandingStatsLine
  stats={{
    count: 3400,
    text: "gifts funded this year"
  }}
/>
// If API fails, show fallback message
<p className="text-[#CCC]">Join thousands of happy families</p>
```

**Testimonials:**
- If only 1 testimonial: Dots still render; rotation disabled
- If 0 testimonials: Show placeholder quote

### Long Text Content

**Hero headline:**
- Max length: 60 characters (recommend breaking into 2 lines)
- Overflow: Responsive line-height ensures legibility
- Example long text: "One meaningful birthday gift that comes straight from the heart"
  - Layout: Wraps naturally, maintains visual hierarchy
  - Font size reduces on mobile to prevent overflow

**Social proof numbers:**
- "3,400+ gifts funded" fits on one line
- If number changes to "34,000+": Still fits; font size consistent

**Contributor names:**
- Name length: 1-3 letters shown (initials)
- "Christopher" → "C"
- Tooltips (optional): On hover, show full name in small popup

### Missing Images

**Dreamboard avatar:**
- If `/images/demo-child.png` 404s: Show placeholder avatar (emoji or generic silhouette)
- Fallback: `<div className="bg-gray-200">👧</div>`

**Social icons:**
- If SVG fails to render: Text fallback label in button title
- Example: `<a title="Instagram">📷</a>`

### Slow Network (3G/4G)

**Stagger animations:** Delay start of Dreamboard float until main content renders
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setAnimationComplete(true);
  }, 1000);
  return () => clearTimeout(timer);
}, []);
```

**Defer animations on slower devices:**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
className={prefersReducedMotion ? '' : 'animate-landing-float'}
```

### User Interactions

**Spamming CTA button:**
- Button navigates to `/create`, no API call
- Link behavior prevents double-submit
- No loading state needed

**Menu already open + click logo:**
- Menu closes (useEffect cleanup handles this)
- Navigation proceeds to home

**Tab through entire page:**
- All interactive elements: Visible focus ring
- Focus order: Logo → Nav links → Menu button → Hero CTA → Stats/Testimonial → How It Works → Bottom CTA → Footer links → Social icons
- Tab at end cycles back to top (browser native)

---

## Final Checklist

- [ ] All spacing values confirmed in design tokens doc
- [ ] Color hex values validated against brand palette
- [ ] Font families and weights align with system fonts (Nunito, DM Sans, DM Serif, Fraunces, Outfit)
- [ ] Responsive breakpoints tested: 375px, 768px, 1024px, 1440px, 1920px
- [ ] Animations smooth and performant (60fps target)
- [ ] WCAG 2.1 AA compliance verified (color contrast, touch targets, keyboard nav)
- [ ] All Links point to correct routes (/create, /sign-in, /sign-up, etc.)
- [ ] Images optimized and lazy-loaded where appropriate
- [ ] SEO meta tags and structured data in place
- [ ] Mobile menu accessibility (aria, focus trap, escape key)
- [ ] No console errors or warnings
- [ ] Tested on Chrome, Safari, Firefox, Edge

---

**End of 01-LANDING-PAGE.md**

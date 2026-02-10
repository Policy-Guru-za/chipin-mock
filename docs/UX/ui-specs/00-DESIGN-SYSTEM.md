# Gifta Design System v2.0
## Single Source of Truth for UX Specifications

**Document Version:** 2.0
**Last Updated:** February 2025
**Status:** Active / Implementation-Ready
**Target Audience:** AI coding agents, UI developers, design implementers

---

## Table of Contents
1. [Overview & Purpose](#overview--purpose)
2. [Color System](#color-system)
3. [Typography Scale](#typography-scale)
4. [Spacing System](#spacing-system)
5. [Shadow System](#shadow-system)
6. [Border & Radius System](#border--radius-system)
7. [Animation & Motion](#animation--motion)
8. [Component Token Reference](#component-token-reference)
9. [Icon Guidelines](#icon-guidelines)
10. [Responsive Breakpoints & Grid](#responsive-breakpoints--grid)
11. [Accessibility Standards](#accessibility-standards)
12. [Brand Voice & Copy Guidelines](#brand-voice--copy-guidelines)
13. [File & Import Conventions](#file--import-conventions)
14. [State Patterns](#state-patterns)

---

## Overview & Purpose

This document serves as the **single source of truth** for all Gifta v2 UI specifications. Every design decision, color token, component variant, and implementation detail is documented here with zero ambiguity.

### Design Principles
- **Warm & Celebratory:** Every interaction should feel joyful and genuine
- **Accessible by Default:** WCAG 2.1 AA compliance is non-negotiable
- **Motion with Purpose:** Every animation serves user comprehension
- **Component-Driven:** Consistency through reusable, well-tokenized components
- **Brand Coherence:** Product identity maintained across all contexts

### Key Brand Terminology
- **Product Name:** "Gifta" (proper noun, always capitalized)
- **Entity:** "Dreamboard" (one word, capitalized)
- **Action Verb:** "chip in" (lowercase, casual)
- **Never Use:** "ChipIn" (deprecated)

### Document Conventions
- CSS values shown in `monospace`
- Tailwind classes shown as `.class-name`
- Hex colors shown as `#XXXXXX`
- All pixel measurements use `rem`-based conversion (1rem = 16px base)
- Responsive patterns follow mobile-first design

---

## Color System

### Primary Palette: Teal (Default: #0D9488)

The primary color system drives the main UI interactions and brand identity.

| Shade | Value | Use Case | CSS Class |
|-------|-------|----------|-----------|
| 50 | `#F0FDFA` | Lightest backgrounds, hover states | `.bg-teal-50` |
| 100 | `#CCFBF1` | Light backgrounds, subtle accents | `.bg-teal-100` |
| 200 | `#99F6E4` | Secondary backgrounds | `.bg-teal-200` |
| 300 | `#5EEAD4` | Hover states for secondary elements | `.text-teal-300` |
| 400 | `#2DD4BF` | Interactive elements, links | `.text-teal-400` |
| 500 | `#14B8A6` | Primary brand color (lighter variant) | `.text-teal-500` |
| 600 | `#0D9488` | **DEFAULT primary** - buttons, focus states | `.bg-teal-600`, `.border-teal-600` |
| 700 | `#0F766E` | Dark hover states, pressed states | `.hover:bg-teal-700` |
| 800 | `#115E59` | Darkest interactive states | `.active:bg-teal-800` |
| 900 | `#134E4A` | Text contrast on light backgrounds | `.text-teal-900` |

**Primary Usage:**
- Call-to-action buttons
- Form focus indicators
- Link colors
- Brand accent elements
- Success indicators
- Navigation active states

**CSS Variable:**
```css
--color-teal-600: #0D9488;
--color-teal-400: #2DD4BF;
```

**Tailwind Integration:**
```js
// tailwind.config.ts
colors: {
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  }
}
```

---

### Accent Palette: Orange (Default: #F97316)

Secondary accent color for important secondary actions and warnings.

| Shade | Value | Use Case | CSS Class |
|-------|-------|----------|-----------|
| 50 | `#FFF7ED` | Very light backgrounds | `.bg-orange-50` |
| 100 | `#FFEDD5` | Light backgrounds | `.bg-orange-100` |
| 200 | `#FED7AA` | Secondary backgrounds | `.bg-orange-200` |
| 300 | `#FDBA74` | Hover states | `.text-orange-300` |
| 400 | `#FB923C` | Interactive secondary elements | `.text-orange-400` |
| 500 | `#F97316` | **DEFAULT accent** - secondary buttons | `.bg-orange-500` |
| 600 | `#EA580C` | Dark hover states | `.hover:bg-orange-600` |
| 700 | `#C2410C` | Darkest interactive states | `.active:bg-orange-700` |

**Secondary Usage:**
- Secondary action buttons
- Warning indicators (non-critical)
- Accent highlights
- Gradient combinations with primary
- Alternative CTAs

---

### Surface & Background Palette

Base colors for all container-level elements.

| Token | Value | Use Case | CSS Class |
|-------|-------|----------|-----------|
| **background** | `#FEFDFB` | Page background (app) | `.bg-background` |
| **background-subtle** | `#FDF8F3` | Subtle background layer | `.bg-background-subtle` |
| **background-muted** | `#FAF9F7` | Muted background, disabled states | `.bg-background-muted` |
| **surface** | `#FAFAF9` | Card surfaces, containers | `.bg-surface` |
| **surface-elevated** | `#FFFFFF` | Elevated cards, modals, popovers | `.bg-surface-elevated` |

**Context:**
- Main page bg: `#FEFDFB`
- Card containers: `#FAFAF9`
- Overlays/modals: `#FFFFFF`
- Disabled inputs: `#FAF9F7`

```css
:root {
  --color-background: #FEFDFB;
  --color-background-subtle: #FDF8F3;
  --color-background-muted: #FAF9F7;
  --color-surface: #FAFAF9;
  --color-surface-elevated: #FFFFFF;
}
```

---

### Text Color Palette

Semantic text colors for all content hierarchy.

| Token | Value | Use Case | CSS Class |
|-------|-------|----------|-----------|
| **text-default** | `#1C1917` | Primary body text, headings | `.text-text-default` |
| **text-secondary** | `#57534E` | Secondary content, descriptions | `.text-text-secondary` |
| **text-muted** | `#A8A29E` | Placeholder text, hints, disabled text | `.text-text-muted` |
| **text-inverted** | `#FFFFFF` | Text on dark backgrounds | `.text-white` |

**Hierarchy:**
- Primary content: `#1C1917` (text-default)
- Secondary info: `#57534E` (text-secondary)
- Tertiary hints: `#A8A29E` (text-muted)
- Interactive text: Use color tokens (teal-600 for links)

---

### Border Palette

Consistent border colors for UI consistency.

| Token | Value | Use Case | CSS Class |
|-------|-------|----------|-----------|
| **border-default** | `#E7E5E4` | Standard borders, dividers | `.border-border-default` |
| **border-strong** | `#D6D3D1` | Emphasized borders, focused inputs | `.border-border-strong` |

**Usage:**
- Input borders: `#E7E5E4`
- Focus state borders: `#D6D3D1`
- Divider lines: `#E7E5E4`

---

### Status & Semantic Colors

Fixed colors for status indicators.

| Status | Value | Use Case | CSS Class |
|--------|-------|----------|-----------|
| **success** | `#059669` | Success states, checkmarks, validated | `.text-success`, `.bg-success` |
| **warning** | `#D97706` | Warning states, cautions | `.text-warning`, `.bg-warning` |
| **error** | `#DC2626` | Error states, destructive actions | `.text-error`, `.bg-error` |
| **info** | `#0D9488` | Info states (maps to teal-600) | `.text-teal-600` |

**Implementation:**
- Success icon + message: `#059669`
- Warning banner: `#D97706` background with `#92400E` text
- Error input state: `#DC2626` border with `#991B1B` text
- Destructive buttons: `#DC2626` background

```typescript
type StatusColor = 'success' | 'warning' | 'error' | 'info';

const statusColorMap: Record<StatusColor, string> = {
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0D9488',
};
```

---

### Landing Page Color Extensions

The landing page uses a specialized palette for unique visual identity.

| Element | Palette | Usage |
|---------|---------|-------|
| **Page Background** | `#FFFCF9` | Full-page background |
| **Sage Gradient** | from `#6B9E88` to `#5A8E78` | Section backgrounds, hero transitions |
| **Hero Accent** | `#C4785A` | Decorative accents, feature highlights |
| **Dreamboard Header Gradient** | from `#E4F0E8` to `#D5E8DC` | Dreamboard feature section |
| **Warm Gold Label** | `#5A8E78` | "ONE BIG WISH" label text |
| **Gift Box Gradient** | from `#FFFBF7` to `#FFF8F2` | Gift box container backgrounds |

**Contributor Avatar Palette (7-color set):**
```
#F5C6AA, #A8D4E6, #B8E0B8, #E6B8B8, #F0E68C, #B8D4E0, #D8B8E8
```
Assigned cyclically to contributor avatars for visual differentiation.

---

## Typography Scale

### Font Families

All typography uses these system-optimized font stacks.

```css
/* Primary Font: Outfit (UI & Body Text) */
--font-primary: 'Outfit', system-ui, -apple-system, sans-serif;

/* Display Font: Fraunces (Headings h1-h3) */
--font-display: 'Fraunces', Georgia, serif;

/* Landing Body: DM Sans */
--font-dm-sans: 'DM Sans', -apple-system, sans-serif;

/* Landing Display: DM Serif Display */
--font-dm-serif: 'DM Serif Display', Georgia, serif;

/* Brand/Logo: Nunito */
--font-nunito: 'Nunito', sans-serif;
```

### Type Scale (Modular 1.125 ratio)

All font sizes follow a consistent modular scale for visual harmony.

| Scale | Size (rem/px) | Line Height | Use Case | CSS Class |
|-------|---------------|-------------|----------|-----------|
| **xs** | 0.75rem/12px | 1rem/16px | Captions, metadata | `.text-xs` |
| **sm** | 0.875rem/14px | 1.25rem/20px | Helper text, labels | `.text-sm` |
| **base** | 1rem/16px | 1.5rem/24px | Body text (default) | `.text-base` |
| **lg** | 1.125rem/18px | 1.75rem/28px | Large body, table text | `.text-lg` |
| **xl** | 1.25rem/20px | 1.75rem/28px | Card titles, subheadings | `.text-xl` |
| **2xl** | 1.5rem/24px | 2rem/32px | Section headings | `.text-2xl` |
| **3xl** | 1.875rem/30px | 2.25rem/36px | Page titles | `.text-3xl` |
| **4xl** | 2.25rem/36px | 2.5rem/40px | Hero headings | `.text-4xl` |
| **5xl** | 3rem/48px | 3.5rem/56px | Landing page hero | `.text-5xl` |
| **6xl** | 3.75rem/60px | 4rem/64px | Large landing blocks | `.text-6xl` |

### Heading Hierarchy

```html
<!-- h1: Use for main page titles, landing hero -->
<h1 class="text-5xl font-display font-bold leading-none">
  Your Big Wish
</h1>

<!-- h2: Use for section headings -->
<h2 class="text-4xl font-display font-semibold leading-tight">
  How Gifta Works
</h2>

<!-- h3: Use for subsection headings, card titles -->
<h3 class="text-2xl font-display font-semibold leading-snug">
  Share Your Dream
</h3>

<!-- h4: Use for component titles, table headers -->
<h4 class="text-xl font-primary font-semibold">
  Contributors
</h4>

<!-- h5/h6: Use for utility headings -->
<h5 class="text-lg font-primary font-semibold">
  Activity Feed
</h5>
```

### Body Text Specifications

```html
<!-- Default body copy (app context) -->
<p class="text-base font-primary leading-relaxed">
  Invite friends to chip in toward your big wish.
</p>

<!-- Secondary/tertiary text -->
<p class="text-sm font-primary text-text-secondary leading-relaxed">
  Last updated 2 hours ago
</p>

<!-- Large body (landing page) -->
<p class="text-lg font-dm-sans leading-relaxed">
  Gifta makes it easy to gather support for what matters most.
</p>

<!-- Caption/metadata -->
<span class="text-xs font-primary text-text-muted uppercase tracking-wider">
  Beta
</span>
```

### Letter Spacing (Tracking)

```css
/* Default: normal tracking */
.font-primary { letter-spacing: 0; }

/* Headings: slightly tighter */
.font-display { letter-spacing: -0.02em; }

/* Captions: wider tracking for readability */
.text-xs, .text-caption { letter-spacing: 0.05em; }

/* Labels: wider tracking for emphasis */
label { letter-spacing: 0.01em; }
```

### Font Weight Usage

```typescript
type FontWeight = 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold';

const fontWeightUsage = {
  light: 300,      // Subtle, secondary text
  normal: 400,     // Default body text
  semibold: 600,   // Section headings, strong emphasis
  bold: 700,       // Main headings, prominent text
  extrabold: 800,  // Hero text, brand statements
};
```

---

## Spacing System

### Modular Spacing Scale

All spacing follows an 8px base unit with a 1.25 ratio for consistency.

```typescript
type SpacingToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

const spacing = {
  'xs': '0.5rem',   // 8px
  'sm': '0.75rem',  // 12px
  'md': '1rem',     // 16px
  'lg': '1.5rem',   // 24px
  'xl': '2rem',     // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '5rem',    // 80px
};

// Tailwind mapping
// .p-2 = 0.5rem, .p-3 = 0.75rem, .p-4 = 1rem, .p-6 = 1.5rem, .p-8 = 2rem, etc.
```

### Component Internal Spacing

**Button Padding:**
```css
.btn-sm    { padding: 0.5rem 1rem; }     /* height 36px, icon-only 40px */
.btn-md    { padding: 0.75rem 1.5rem; }  /* height 44px, icon-only 40px */
.btn-lg    { padding: 1rem 1.75rem; }    /* height 56px, icon-only 44px */
.btn-icon  { width: 2.5rem; height: 2.5rem; } /* 40px square */
```

**Input Padding:**
```css
.input {
  padding: 0.75rem 1rem;  /* 44px height minimum */
  padding-left: 1rem;
  padding-right: 1rem;
}
```

**Card Padding Variants:**
```css
.card-none   { padding: 0; }
.card-sm     { padding: 1rem; }
.card-md     { padding: 1.5rem; }
.card-lg     { padding: 2rem; }
.card-xl     { padding: 2.5rem; }
```

### Layout Container Widths

```css
/* Page max-widths */
.container-landing { max-width: 88rem; }  /* 1400px - landing page */
.container-app     { max-width: 72rem; }  /* 1152px (6xl) - app pages */
.container-narrow  { max-width: 48rem; }  /* 768px - form layouts */
.container-full    { max-width: 100%; }   /* Full width with padding */
```

### Responsive Padding Scale

Follow mobile-first approach: mobile base → tablet adjustment → desktop maximum.

```css
/* Content padding */
@media (max-width: 768px) {
  .content-padding { padding: 0 1.25rem; }  /* px-5 on mobile */
}

@media (min-width: 768px) and (max-width: 1024px) {
  .content-padding { padding: 0 2.5rem; }   /* px-10 on tablet */
}

@media (min-width: 1024px) {
  .content-padding { padding: 0 5rem; }     /* px-20 on desktop */
}
```

### Section Spacing (Gap/Margin)

```css
/* Section-level gaps for component distribution */
@media (max-width: 768px) {
  .section-gap { gap: 2rem; }               /* gap-8 mobile */
  .section-margin { margin-bottom: 2rem; }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .section-gap { gap: 3rem; }               /* gap-12 tablet */
  .section-margin { margin-bottom: 3rem; }
}

@media (min-width: 1024px) {
  .section-gap { gap: 6.25rem; }            /* gap-[100px] desktop */
  .section-margin { margin-bottom: 6.25rem; }
}
```

### Common Spacing Patterns

```html
<!-- Stacked vertical spacing -->
<div class="flex flex-col gap-4">
  <h2>Title</h2>
  <p>Content</p>
</div>

<!-- Horizontal spacing -->
<div class="flex gap-3 items-center">
  <Icon />
  <span>Label</span>
</div>

<!-- Grid spacing -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- items -->
</div>

<!-- Card internal spacing -->
<div class="p-6 space-y-4">
  <div>Content row 1</div>
  <div>Content row 2</div>
</div>
```

---

## Shadow System

All shadows follow a subtle, elevation-based system for depth without visual clutter.

### Shadow Definitions

**Soft Shadow (UI elements, subtle elevation):**
```css
--shadow-soft:
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 4px 12px rgba(0, 0, 0, 0.04);

.shadow-soft {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.04);
}
```

**Lifted Shadow (elevated cards, containers):**
```css
--shadow-lifted:
  0 4px 8px rgba(0, 0, 0, 0.04),
  0 12px 24px rgba(0, 0, 0, 0.06);

.shadow-lifted {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06);
}
```

**Hero Shadow (modals, popovers, featured content):**
```css
--shadow-hero:
  0 8px 24px rgba(0, 0, 0, 0.08),
  0 2px 8px rgba(13, 148, 136, 0.15);

.shadow-hero {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(13, 148, 136, 0.15);
}
```

**Landing Page Card Shadow:**
```css
/* Mobile */
@media (max-width: 768px) {
  .card-landing {
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card-landing {
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08);
  }
}
```

### Shadow Usage Matrix

| Component | Shadow | Condition |
|-----------|--------|-----------|
| Button | none | default state |
| Button | soft | hover state |
| Input | none | default state |
| Input | lifted | focus state |
| Card | soft | default |
| Card (elevated) | lifted | hover/interactive |
| Modal/Dialog | hero | always |
| Popover | lifted | always |
| Navigation | soft | sticky/floating |
| Tooltip | hero | on appearance |

---

## Border & Radius System

### Border Radius Scale

```css
/* Border radius tokens */
:root {
  --radius-sm: 0.375rem;    /* 6px - small elements */
  --radius-md: 0.5rem;      /* 8px - standard radius */
  --radius-lg: 0.75rem;     /* 12px - buttons, inputs */
  --radius-xl: 1rem;        /* 16px - cards */
  --radius-2xl: 1.5rem;     /* 24px - feature cards, hero blocks */
  --radius-full: 9999px;    /* full - pills, circular */
}

/* Tailwind classes */
.rounded-sm     { border-radius: 0.375rem; }
.rounded-md     { border-radius: 0.5rem; }
.rounded-lg     { border-radius: 0.75rem; }
.rounded-xl     { border-radius: 1rem; }
.rounded-2xl    { border-radius: 1.5rem; }
.rounded-full   { border-radius: 9999px; }
```

### Component-Specific Border Radius

**Buttons:**
```css
.button {
  border-radius: 0.75rem;  /* .rounded-xl */
}

.button-icon {
  border-radius: 0.75rem;  /* circular appearance through sizing */
}

.button-pill {
  border-radius: 9999px;   /* .rounded-full */
}
```

**Input Fields:**
```css
.input, .input-addon {
  border-radius: 0.75rem;  /* .rounded-xl */
}

.input-group-left > .input {
  border-radius: 0.75rem 0 0 0.75rem;
}

.input-group-right > .input {
  border-radius: 0 0.75rem 0.75rem 0;
}
```

**Cards:**
```css
.card {
  border-radius: 1rem;      /* .rounded-xl */
}

.card-feature {
  border-radius: 1.5rem;    /* .rounded-2xl */
}
```

**Modals/Dialogs:**
```css
.modal, .dialog {
  border-radius: 1rem;      /* .rounded-xl */
}
```

### Border Width & Color

**Border Widths:**
```css
.border-0    { border-width: 0; }
.border      { border-width: 1px; }
.border-2    { border-width: 2px; }
.border-4    { border-width: 4px; }
```

**Border Color Usage:**
```css
/* Default borders */
.input, .card {
  border: 1px solid #E7E5E4;  /* border-default */
}

/* Focus/active borders */
.input:focus, .input-active {
  border-color: #D6D3D1;      /* border-strong */
  box-shadow: inset 0 0 0 1px #D6D3D1;
}

/* Disabled borders */
.input:disabled {
  border-color: #E7E5E4;
  opacity: 0.5;
}

/* Error state */
.input-error {
  border-color: #DC2626;
  box-shadow: inset 0 0 0 1px #DC2626;
}
```

---

## Animation & Motion

### Easing Functions

All animations use purpose-built cubic-bezier curves for natural motion.

```css
:root {
  /* Smooth entrance/exit */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* Smooth exit with deceleration */
  --ease-in-out: ease-in-out;

  /* Quick entrance */
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Landing page transitions */
  --ease-landing: cubic-bezier(0.165, 0.84, 0.44, 1);
}
```

### Animation Durations

**Predefined durations across the system:**

```typescript
type AnimationDuration = 'instant' | 'fast' | 'normal' | 'slow' | 'page';

const durations = {
  instant: '100ms',   /* Immediate response feedback */
  fast: '150ms',      /* Quick UI transitions */
  normal: '300ms',    /* Standard transitions */
  slow: '500ms',      /* Emphasis animations */
  page: '600ms',      /* Page transitions, hero animations */
};
```

### Keyframe Definitions

**Fade Up Animation (entrance):**
```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Shimmer Animation (loading):**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 1000px 100%;
}
```

**Subtle Bounce (floating elements):**
```css
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.75rem);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}
```

**Landing Page Fade Up:**
```css
@keyframes landing-fade-up {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-landing-fade-up {
  animation: landing-fade-up 0.7s ease-out;
}
```

**Landing Page Float:**
```css
@keyframes landing-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-1rem);
  }
}

.animate-landing-float {
  animation: landing-float 6s ease-in-out infinite;
}
```

### Component Interaction Animations

**Button States:**
```css
.button {
  transition: all 150ms ease-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.button:active {
  transform: scale(0.97);
  transition-duration: 100ms;
}
```

**Input Focus:**
```css
.input {
  transition: all 300ms ease-out;
  border-color: #E7E5E4;
}

.input:focus {
  border-color: #0D9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}
```

**Page Transitions:**
```css
.page-enter {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-exit {
  animation: fadeDown 0.4s ease-in;
}
```

### Motion Accessibility - Prefers Reduced Motion

**All animations must respect user accessibility preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Keep instant transitions but no animations */
  .button:hover {
    transform: none;
  }

  .animate-* {
    animation: none;
  }
}
```

**TypeScript Implementation:**
```typescript
function getAnimationDuration(
  duration: 'fast' | 'normal' | 'slow',
  respectReducedMotion: boolean = true
): string {
  if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return '0ms';
  }

  const map = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  };

  return map[duration];
}
```

---

## Component Token Reference

### Button Component

**Complete button implementation with all variants:**

```typescript
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}
```

**Primary Button (Teal Gradient):**
```css
.btn-primary {
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
  color: #FFFFFF;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  height: 2.75rem;
  transition: all 150ms ease-out;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #115E59 0%, #0F766E 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button (Orange Gradient):**
```css
.btn-secondary {
  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
  color: #FFFFFF;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  height: 2.75rem;
  transition: all 150ms ease-out;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #EA580C 0%, #D97706 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-secondary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Outline Button (Bordered, no fill):**
```css
.btn-outline {
  background: transparent;
  color: #0D9488;
  border: 1px solid #0D9488;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  height: 2.75rem;
  transition: all 150ms ease-out;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(13, 148, 136, 0.08);
  border-color: #115E59;
  color: #115E59;
}

.btn-outline:active:not(:disabled) {
  background: rgba(13, 148, 136, 0.12);
}

.btn-outline:disabled {
  border-color: #E7E5E4;
  color: #A8A29E;
}
```

**Ghost Button (No border/fill, text only):**
```css
.btn-ghost {
  background: transparent;
  color: #0D9488;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  height: 2.75rem;
  transition: all 150ms ease-out;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(13, 148, 136, 0.08);
  color: #115E59;
}

.btn-ghost:active:not(:disabled) {
  background: rgba(13, 148, 136, 0.12);
}

.btn-ghost:disabled {
  color: #A8A29E;
}
```

**Destructive Button (Red for dangerous actions):**
```css
.btn-destructive {
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  height: 2.75rem;
  transition: all 150ms ease-out;
}

.btn-destructive:hover:not(:disabled) {
  background: #991B1B;
  transform: translateY(-2px);
}

.btn-destructive:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-destructive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Link Button (Text with underline):**
```css
.btn-link {
  background: transparent;
  color: #0D9488;
  border: none;
  padding: 0;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.btn-link:hover:not(:disabled) {
  color: #115E59;
  text-decoration-thickness: 2px;
}

.btn-link:active:not(:disabled) {
  color: #0F766E;
}

.btn-link:disabled {
  color: #A8A29E;
  cursor: not-allowed;
}
```

**Button Sizes:**
```css
.btn-sm {
  height: 2.25rem;  /* 36px */
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  height: 2.75rem;  /* 44px */
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-lg {
  height: 3.5rem;   /* 56px */
  padding: 1rem 1.75rem;
  font-size: 1.125rem;
}

.btn-icon {
  width: 2.5rem;    /* 40px square */
  height: 2.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}
```

**Loading State:**
```css
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 1rem;
  height: 1rem;
  top: 50%;
  left: 50%;
  margin: -0.5rem 0 0 -0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #FFFFFF;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### Card Component

**Card variants and configuration:**

```typescript
type CardVariant =
  | 'default'
  | 'elevated'
  | 'tilted'
  | 'feature'
  | 'glass'
  | 'minimal';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}
```

**Default Card:**
```css
.card {
  background: #FAFAF9;
  border: 1px solid #E7E5E4;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 300ms ease-out;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06);
}
```

**Elevated Card:**
```css
.card-elevated {
  background: #FFFFFF;
  border: none;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06);
}

.card-elevated:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(13, 148, 136, 0.15);
}
```

**Tilted Card (rotated for visual interest):**
```css
.card-tilted {
  background: #FAFAF9;
  border: 1px solid #E7E5E4;
  border-radius: 1rem;
  padding: 1.5rem;
  transform: rotate(-1deg);
  transition: all 300ms ease-out;
}

.card-tilted:hover {
  transform: rotate(-0.5deg) translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06);
}
```

**Feature Card (large, prominent):**
```css
.card-feature {
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08);
  transition: all 300ms ease-out;
}

.card-feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(13, 148, 136, 0.15);
}
```

**Glass Card (frosted glass effect):**
```css
.card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.04);
}
```

**Minimal Card (border-only, no fill):**
```css
.card-minimal {
  background: transparent;
  border: 1px solid #E7E5E4;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: none;
  transition: border-color 300ms ease-out;
}

.card-minimal:hover {
  border-color: #0D9488;
}
```

**Card Sub-components:**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
    <p class="card-description">Optional subtitle</p>
  </div>
  <div class="card-content">
    Main content area
  </div>
  <div class="card-footer">
    Footer actions
  </div>
</div>
```

**Card Padding Variants:**
```css
.card-padding-none  { padding: 0; }
.card-padding-sm    { padding: 1rem; }
.card-padding-md    { padding: 1.5rem; }
.card-padding-lg    { padding: 2rem; }
```

---

### Input Component

**Form input with comprehensive styling:**

```typescript
type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'number'
  | 'search'
  | 'textarea';

type InputState = 'default' | 'focus' | 'error' | 'disabled' | 'success';

interface InputProps {
  type?: InputType;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  icon?: ReactNode;
  children: ReactNode;
}
```

**Base Input Styles:**
```css
.input {
  width: 100%;
  height: 2.75rem;  /* 44px minimum */
  padding: 0.75rem 1rem;
  font-family: var(--font-primary);
  font-size: 1rem;
  color: #1C1917;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 0.75rem;
  transition: all 300ms ease-out;
}

.input::placeholder {
  color: #A8A29E;
  font-weight: 400;
}
```

**Input Focus State:**
```css
.input:focus {
  outline: none;
  border-color: #0D9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1),
              inset 0 0 0 1px #0D9488;
  background: #F0FDFA;
}
```

**Input Error State:**
```css
.input-error {
  border-color: #DC2626;
  box-shadow: inset 0 0 0 1px #DC2626;
  background: rgba(220, 38, 38, 0.02);
}

.input-error:focus {
  border-color: #DC2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1),
              inset 0 0 0 1px #DC2626;
}

.input-error-message {
  color: #DC2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

**Input Success State:**
```css
.input-success {
  border-color: #059669;
  box-shadow: inset 0 0 0 1px #059669;
}

.input-success-message {
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
```

**Input Disabled State:**
```css
.input:disabled {
  background: #FAF9F7;
  color: #A8A29E;
  border-color: #E7E5E4;
  cursor: not-allowed;
  opacity: 1;
}

.input:disabled::placeholder {
  color: #A8A29E;
}
```

**Input with Icon:**
```css
.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #57534E;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon-left {
  padding-left: 2.75rem;  /* icon width + padding */
}

.input-icon-right {
  padding-right: 2.75rem;
}

.input-icon-right-placed {
  position: absolute;
  right: 1rem;
}
```

**Textarea:**
```css
.textarea {
  width: 100%;
  min-height: 6rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-primary);
  font-size: 1rem;
  color: #1C1917;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 0.75rem;
  resize: vertical;
  transition: all 300ms ease-out;
}

.textarea:focus {
  outline: none;
  border-color: #0D9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}
```

**Input Label:**
```css
.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1C1917;
  margin-bottom: 0.5rem;
}

.input-label-required::after {
  content: ' *';
  color: #DC2626;
}

.input-hint {
  font-size: 0.75rem;
  color: #A8A29E;
  margin-top: 0.25rem;
  display: block;
}
```

---

### Skeleton Component

**Loading state placeholders with shimmer animation:**

```typescript
type SkeletonShape = 'rectangle' | 'circle' | 'text' | 'custom';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  shape?: SkeletonShape;
  count?: number;
}
```

**Skeleton Styles:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border-radius: 0.75rem;
}

.skeleton-circle {
  border-radius: 9999px;
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
}

.skeleton-text:last-child {
  margin-bottom: 0;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

**Skeleton Wrapper (loading state container):**
```css
.skeleton-wrapper {
  role: status;
  aria-live: polite;
  aria-busy: true;
}

.skeleton-wrapper[aria-busy="false"] .skeleton {
  animation: none;
  background: transparent;
}
```

---

## Icon Guidelines

### Icon System Architecture

- **Icon Library:** Use system-provided icon set (SVG)
- **Sizes:** 16px (sm), 20px (md), 24px (lg), 32px (xl)
- **Stroke Width:** 2px (consistent)
- **Color:** Inherit text color or explicit color token
- **Accessibility:** Wrap in `<span aria-label="...">` when standalone

### Icon Implementation

```html
<!-- Icon with label (button/action) -->
<button class="flex items-center gap-2">
  <icon class="w-5 h-5" name="heart" />
  <span>Add to Wishlist</span>
</button>

<!-- Icon-only with aria-label (required) -->
<button aria-label="Close modal" class="btn-icon">
  <icon class="w-5 h-5" name="x" />
</button>

<!-- Inline icon with text -->
<p class="flex items-center gap-2">
  <icon class="w-4 h-4 text-success" name="check" />
  <span>Verified</span>
</p>
```

### Icon Color Inheritance

```css
.icon {
  width: 1.25rem;     /* default 20px */
  height: 1.25rem;
  color: currentColor;  /* inherits from parent */
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.icon-sm  { width: 1rem; height: 1rem; }      /* 16px */
.icon-md  { width: 1.25rem; height: 1.25rem; } /* 20px */
.icon-lg  { width: 1.5rem; height: 1.5rem; }   /* 24px */
.icon-xl  { width: 2rem; height: 2rem; }       /* 32px */

.icon-teal   { color: #0D9488; }
.icon-orange { color: #F97316; }
.icon-error  { color: #DC2626; }
.icon-success { color: #059669; }
```

---

## Responsive Breakpoints & Grid

### Tailwind Breakpoint Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   /* Small mobile */
      'md': '768px',   /* Tablet */
      'lg': '1024px',  /* Desktop */
      'xl': '1280px',  /* Large desktop */
      '2xl': '1536px', /* Extra large */
    },
  },
};
```

### Responsive Usage Pattern

```html
<!-- Mobile-first approach -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
</div>

<!-- Text sizing -->
<h1 class="text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

<!-- Padding -->
<div class="px-5 md:px-10 lg:px-20">
  Responsive padding
</div>

<!-- Display -->
<div class="hidden md:block">
  Only visible on tablet and up
</div>

<div class="block md:hidden">
  Only visible on mobile
</div>
```

### Grid Configuration

```css
/* Standard grid container */
.grid-container {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Responsive grid examples */
.grid-cols-1  { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3  { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media (max-width: 768px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

All components must meet or exceed WCAG 2.1 Level AA standards.

### Focus Management

**Focus Visible Indicator (all interactive elements):**
```css
:focus-visible {
  outline: 2px solid #0D9488;
  outline-offset: 2px;
}

/* Alternative box-shadow approach for consistent styling */
.focusable:focus {
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1),
              inset 0 0 0 2px #0D9488;
}
```

**Focus Order:**
- Logical tab order: left-to-right, top-to-bottom
- Never use `tabindex` > 0
- Use `tabindex="-1"` for programmatic focus only

### Touch Target Sizing

```css
/* Minimum 44x44px touch targets */
.button, .link-interactive {
  min-height: 2.75rem;  /* 44px */
  min-width: 2.75rem;
  padding: 0.75rem 1.5rem;
}

.icon-button {
  min-width: 2.75rem;   /* 44px square */
  min-height: 2.75rem;
}
```

### Color Contrast

**Text Contrast Requirements (WCAG AA):**
- Normal text: 4.5:1 ratio minimum
- Large text (18pt+): 3:1 ratio minimum

**Implementation:**
```css
/* Pass contrast ratio */
.text-on-light {
  color: #1C1917;  /* 4.5:1 on #FFFFFF */
}

.text-on-teal {
  color: #FFFFFF;  /* 5.5:1 on #0D9488 */
}

.text-secondary-on-light {
  color: #57534E;  /* 4.5:1 on #FFFFFF */
}
```

### Semantic HTML & ARIA

```html
<!-- Always use semantic HTML first -->
<button>Action</button>
<a href="#">Link</a>
<nav>Navigation</nav>
<main>Main content</main>
<article>Article</article>
<section>Section</section>

<!-- ARIA when semantic HTML insufficient -->
<div role="button" tabindex="0" @click="handleAction">
  Custom button
</div>

<!-- aria-label for icon-only buttons -->
<button aria-label="Close dialog">
  <icon name="x" />
</button>

<!-- aria-describedby for error messages -->
<input
  type="text"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<span id="email-error" role="alert">Invalid email</span>

<!-- aria-live for dynamic updates -->
<div aria-live="polite" aria-busy="true">
  Loading...
</div>
```

### Keyboard Navigation

```css
/* Ensure all interactive elements are keyboard accessible */
button, a, input, select, textarea {
  /* Already inherently keyboard accessible */
}

/* Custom interactive elements need keyboard support */
[role="button"] {
  outline: none;
  cursor: pointer;
}

[role="button"]:focus {
  outline: 2px solid #0D9488;
  outline-offset: 2px;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Brand Voice & Copy Guidelines

### Product & Entity Naming

| Term | Correct | Incorrect | Notes |
|------|---------|-----------|-------|
| Product | Gifta | ChipIn, gifta | Always capitalized |
| Verb | chip in | ChipIn, Chip In | Lowercase, two words |
| Entity | Dreamboard | Dreamboard, Dreamboard | One word, capitalized |
| Action | contribute | chip in, donate, fund | Primary action word |

### Tone Guidelines

**Always:**
- Use warm, celebratory language
- Focus on joy and connection
- Be genuine and human
- Acknowledge effort and generosity

**Never:**
- Use transactional language ("purchase", "transaction")
- Be overly formal or robotic
- Minimize the generosity of contribution
- Use "we" when not applicable (use "Gifta" instead)

### Copy Examples

**Good:**
- "Gather supporters for your big wish"
- "Friends chipped in toward your dream"
- "Let's make this happen together"
- "Add your touch to this wish"

**Avoid:**
- "Complete your purchase"
- "Submit payment"
- "Transaction successful"
- "Processing order"

### Error Message Tone

```typescript
// Friendly, helpful error messages
const errorMessages = {
  emailInvalid: "We didn't recognize this email. Check and try again?",
  passwordShort: "Password needs to be at least 8 characters",
  fieldRequired: "This field is required to move forward",
  networkError: "Connection hiccup. Please try again.",
  serverError: "Something went wrong. We're looking into it.",
};
```

---

## File & Import Conventions

### Component File Structure

```
components/
├── Button/
│   ├── Button.tsx          # Component implementation
│   ├── Button.types.ts     # TypeScript interfaces
│   ├── Button.styles.ts    # CSS-in-JS or Tailwind classes
│   ├── Button.stories.tsx  # Storybook documentation
│   └── index.ts            # Barrel export
├── Card/
│   ├── Card.tsx
│   ├── Card.types.ts
│   ├── CardHeader.tsx
│   ├── CardContent.tsx
│   ├── CardFooter.tsx
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.types.ts
│   └── index.ts
└── Skeleton/
    ├── Skeleton.tsx
    └── index.ts
```

### Import Patterns

```typescript
// ✓ Correct: Use barrel exports
import { Button, Card, Input } from '@/components';

// ✓ Correct: Specific imports for clarity
import { Button } from '@/components/Button';
import type { ButtonProps } from '@/components/Button';

// ✗ Avoid: Deep path imports
import Button from '@/components/Button/Button.tsx';

// ✓ Correct: Group related imports
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/Card';
```

### Design System Constants

```typescript
// lib/design-tokens.ts
export const colors = {
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    600: '#0D9488',
  },
  orange: {
    500: '#F97316',
  },
  text: {
    default: '#1C1917',
    secondary: '#57534E',
    muted: '#A8A29E',
  },
} as const;

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const durations = {
  instant: '100ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  page: '600ms',
} as const;

// Usage
import { colors, spacing, durations } from '@/lib/design-tokens';
```

---

## State Patterns

### Loading State

**Standard loading pattern for data-fetching scenarios:**

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingComponent {
  state: LoadingState;
  data?: unknown;
  error?: Error;
}

// Component implementation
function DataList() {
  const [state, setState] = useState<LoadingState>('idle');

  return (
    <div>
      {state === 'loading' && <LoadingSkeleton />}
      {state === 'success' && <ContentList />}
      {state === 'error' && <ErrorState />}
      {state === 'idle' && <EmptyState />}
    </div>
  );
}

// Loading skeleton appearance
<div class="space-y-4">
  <div class="skeleton h-12 w-full"></div>
  <div class="skeleton h-12 w-full"></div>
  <div class="skeleton h-12 w-3/4"></div>
</div>
```

### Empty State

**When no data/content exists:**

```tsx
function EmptyState() {
  return (
    <div class="flex flex-col items-center justify-center py-12 px-4">
      <div class="w-12 h-12 mb-4 text-text-muted">
        <icon name="inbox" />
      </div>
      <h3 class="text-xl font-semibold text-text-default mb-2">
        No dreams yet
      </h3>
      <p class="text-text-secondary text-center max-w-xs mb-6">
        Create your first wish to get started sharing with friends
      </p>
      <button class="btn-primary">
        Create Your First Dream
      </button>
    </div>
  );
}
```

### Error State

**When operation fails:**

```tsx
function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div class="bg-red-50 border border-error rounded-xl p-4 md:p-6">
      <div class="flex gap-3">
        <div class="flex-shrink-0">
          <icon class="w-5 h-5 text-error" name="alert-circle" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-text-default mb-1">
            Something went wrong
          </h3>
          <p class="text-text-secondary text-sm mb-4">
            {error?.message || 'Please try again'}
          </p>
          <button
            onClick={onRetry}
            class="btn-sm btn-outline text-error border-error"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Success State

**After successful operation:**

```tsx
function SuccessState({ message, action }: SuccessStateProps) {
  return (
    <div class="bg-green-50 border border-success rounded-xl p-4 flex items-center gap-3">
      <icon class="w-5 h-5 text-success flex-shrink-0" name="check-circle" />
      <div class="flex-1">
        <p class="text-success font-semibold">{message}</p>
      </div>
      {action && <button class="btn-sm btn-ghost">{action.label}</button>}
    </div>
  );
}
```

### Disabled/Inactive State

**When elements are unavailable:**

```css
.disabled-element {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.input:disabled {
  background: #FAF9F7;
  color: #A8A29E;
  border-color: #E7E5E4;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Validation States

**Form field validation feedback:**

```typescript
type ValidationState = 'pristine' | 'valid' | 'invalid' | 'pending';

interface FormField {
  value: string;
  state: ValidationState;
  error?: string;
}

// Implementation
function ValidatedInput({ state, error, ...props }: InputProps) {
  const stateClass = {
    pristine: '',
    valid: 'input-success',
    invalid: 'input-error',
    pending: 'input opacity-75',
  }[state];

  return (
    <>
      <input class={`input ${stateClass}`} {...props} />
      {state === 'invalid' && error && (
        <span class="input-error-message">
          <icon name="alert-circle" class="w-4 h-4" />
          {error}
        </span>
      )}
    </>
  );
}
```

---

## Implementation Checklist

Before implementing any UI component or page, verify:

- [ ] All color tokens are used from the palette (no custom colors)
- [ ] Typography uses defined font families and scales
- [ ] Spacing follows the modular scale
- [ ] Shadows match one of the defined shadow systems
- [ ] Border radius uses standard tokens (xl, 2xl, full)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Focus states include visible 2px outline
- [ ] Touch targets are minimum 44x44px
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Component variants match defined types
- [ ] Loading states use Skeleton component
- [ ] Error states follow the error pattern
- [ ] Responsive breakpoints follow mobile-first approach
- [ ] ARIA labels present for icon-only buttons
- [ ] Copy uses brand voice guidelines
- [ ] Imports use barrel exports pattern

---

**Document Complete**

This design system is the authoritative reference for all Gifta v2 UI implementations. All other specification documents reference this single source of truth. When ambiguity arises, this document provides the definitive answer.

**Last Updated:** February 2025
**Status:** Active / Implementation-Ready
**Maintenance:** Update this document whenever design tokens or component specifications change

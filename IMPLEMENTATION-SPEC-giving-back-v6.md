# Implementation Spec: Giving Back Section v6

> **Purpose:** This document provides every detail an AI coding agent needs to implement the redesigned "Giving Back" section of the Gifta landing page. The approved mockup is `mockup-giving-back-v6.html` in the project root. This spec replaces the previous `IMPLEMENTATION-SPEC-giving-back-section.md`.

---

## 1. Scope & Objective

Replace the current `LandingGivingBack` component (metric cards + letter-initial charity avatars) with a two-panel educational layout that shows visitors **how** the giving-back feature works, from the host's perspective (setting up the split) to the guest's perspective (seeing transparency on the shared Dreamboard).

### Files to modify (3 files only)

| File | Action |
|------|--------|
| `src/components/landing/LandingGivingBack.tsx` | **Complete rewrite** — replace all 201 lines |
| `src/components/landing/content.ts` | **Partial edit** — remove `givingBackMetrics` and `givingBackCharities`, add new exports |
| `src/app/globals.css` | **Append** — add 6 new `@keyframes` rules at the end |

### Files that must NOT be touched

- `src/components/landing/LandingPage.tsx` — already imports and renders `<LandingGivingBack />`
- `src/components/landing/index.ts` — already exports `LandingGivingBack`
- All other landing components
- `tailwind.config.ts`
- `next.config.ts` / `next.config.mjs`

---

## 2. Design Source of Truth

The approved mockup is **`mockup-giving-back-v6.html`** (1167 lines, in the project root). Every visual detail — colours, spacing, typography, animations, layout — must match this file. The spec below extracts all values from that mockup for easy reference.

---

## 3. Architecture & Patterns

The new component must follow the **exact same patterns** used by other landing components. Here are the patterns to replicate:

### 3.1 Client component directive
```tsx
'use client';
```

### 3.2 Imports
```tsx
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { givingBackCharities, givingBackDemo } from './content';
```

### 3.3 Animation helper (copy from LandingHowItWorks)
```tsx
const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

function fadeStyle(visible: boolean, delay: number, duration = 0.4) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity ${duration}s ${EASING} ${delay}s, transform ${duration}s ${EASING} ${delay}s`,
  } as const;
}
```

### 3.4 Scroll-reveal hook (copy from LandingHowItWorks)
```tsx
function useScrollReveal(prefersReducedMotion: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return { ref, visible };
}
```

### 3.5 Wavy underline (keep existing pattern)
```tsx
const wavyUnderlineStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: -6,
  left: 0,
  right: 0,
  height: 4,
  background:
    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 4"><path d="M 0 2 Q 5 0, 10 2 T 20 2 T 30 2 T 40 2 T 50 2 T 60 2 T 70 2 T 80 2 T 90 2 T 100 2 T 110 2 T 120 2 T 130 2 T 140 2 T 150 2 T 160 2 T 170 2 T 180 2 T 190 2 T 200 2 T 210 2 T 220 2 T 230 2 T 240 2 T 250 2 T 260 2 T 270 2 T 280 2 T 290 2 T 300 2" stroke="%237E6B9B" stroke-width="2.5" fill="none" opacity="0.25"/></svg>\') repeat-x',
  backgroundSize: '30px 4px',
};
```

### 3.6 Stagger delay constants
```tsx
const DELAYS = {
  eyebrow: 0,
  headline: 0.06,
  subheading: 0.12,
  twoPanel: 0.2,
  howStrip: 0.38,
  charities: 0.48,
  closing: 0.54,
} as const;
```

### 3.7 Font usage pattern
Headlines use: `style={{ fontFamily: 'var(--font-dm-serif)' }}`
Body text uses the default DM Sans (set via parent page `style={{ fontFamily: 'var(--font-dm-sans)' }}`)

### 3.8 Image usage pattern (from LandingDreamBoard)
```tsx
<Image
  src="/images/demo-child.png"
  alt="Mia"
  fill
  className="rounded-full object-cover object-[center_20%]"
/>
```
For the two-panel cards, use sized containers with `fill` + `object-cover object-[center_20%]`.

---

## 4. Content Data (content.ts changes)

### 4.1 Remove these exports
```tsx
// DELETE these two exports entirely:
export const givingBackMetrics = [ ... ];
export const givingBackCharities = [ ... ];
```

### 4.2 Add these new exports

```tsx
/* ------------------------------------------------------------------ */
/*  Giving Back — v6 redesign data                                     */
/* ------------------------------------------------------------------ */

export const givingBackCharities = [
  {
    name: 'Reach for a Dream',
    tag: 'Children with chronic illnesses',
    logoUrl: 'https://reachforadream.org.za/wp-content/uploads/2025/03/reach-for-a-dream-logo.svg',
    logoBg: '#f3eef9',
  },
  {
    name: 'CHOC',
    tag: 'Cancer research & support',
    logoUrl: 'https://choc.org.za/wp-content/uploads/2019/07/choc-logo-200px.png',
    logoBg: '#e8f1f9',
  },
  {
    name: 'Cotlands',
    tag: 'Early childhood development',
    logoUrl: 'https://cdn.brandfetch.io/idsAaqKEre/w/400/h/400/theme/dark/icon.jpeg',
    logoBg: '#fef4e8',
  },
  {
    name: 'Ladles of Love',
    tag: 'Feeding the hungry daily',
    logoUrl: 'https://ladlesoflove.org.za/wp-content/uploads/2022/03/LadlesOfLove-logofullcolour.png',
    logoBg: '#fdedef',
  },
  {
    name: 'Afrika Tikkun',
    tag: 'Youth development & education',
    logoUrl: 'https://afrikatikkun.com/wp-content/uploads/2024/01/Mian-Logo.png',
    logoBg: '#e8ecf9',
  },
  {
    name: 'DARG',
    tag: 'Domestic animal rescue',
    logoUrl: 'https://cdn.brandfetch.io/idgm5KhPzP/w/117/h/118/theme/dark/logo.png',
    logoBg: '#e8eff9',
  },
  {
    name: 'Cape SPCA',
    tag: 'Animal welfare & protection',
    logoUrl: 'https://capespca.co.za/wp-content/uploads/2024/06/Flat-design-logo.png',
    logoBg: '#e8f6f7',
  },
];

export const givingBackDemo = {
  childName: 'Mia',
  childAge: 'Turning 6',
  childDate: 'March 28th',
  setupStep: 'Setting up · Step 4 of 5',
  giftName: 'Ballet Starter Kit',
  giftDescription: 'Shoes, tutu & dance bag',
  giftEmoji: '🎀',
  selectedCharity: 'Reach for a Dream',
  selectedCharityTag: 'Children with chronic illnesses',
  selectedCharityLogo: 'https://reachforadream.org.za/wp-content/uploads/2025/03/reach-for-a-dream-logo.svg',
  percentageOptions: [5, 10, 15, 20],
  activePercentage: 20,
  exampleContribution: 200,
};

export const givingBackHowItWorks = [
  {
    emoji: '💜',
    title: 'Host decides',
    description: 'Pick a charity and choose what % of each contribution to share',
    bgClass: 'bg-[rgba(126,107,155,0.1)]',
  },
  {
    emoji: '🤝',
    title: 'Guests see it all',
    description: 'Full transparency — every rand accounted for before they chip in',
    bgClass: 'bg-[rgba(107,158,136,0.1)]',
  },
  {
    emoji: '🎉',
    title: 'Double the joy',
    description: 'A birthday gift and a good deed, all in one contribution',
    bgClass: 'bg-[rgba(196,120,90,0.08)]',
  },
];
```

### 4.3 TypeScript type for givingBackCharities

The agent should ensure the type is inferred naturally from the array. No explicit interface is needed — TypeScript will infer the shape. If preferred for documentation, add:

```tsx
export type GivingBackCharity = {
  name: string;
  tag: string;
  logoUrl: string;
  logoBg: string;
};
```

---

## 5. CSS Keyframe Animations (globals.css additions)

Append these keyframes at the very end of `src/app/globals.css`, **after** the existing `.hiw-card-circle` rule (line ~274):

```css
/* ================================================================== */
/*  Giving Back v6 – keyframe animations                               */
/* ================================================================== */

@keyframes givingBack-floatOrb1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 30px); }
}

@keyframes givingBack-floatOrb2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

@keyframes givingBack-heartGlow {
  0%, 100% { box-shadow: 0 3px 10px rgba(126,107,155,0.25); }
  50% { box-shadow: 0 3px 16px rgba(126,107,155,0.4); }
}

@keyframes givingBack-nudge-x {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}

@keyframes givingBack-nudge-y {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

@keyframes givingBack-barGrow80 {
  from { width: 0%; }
  to { width: 80%; }
}

@keyframes givingBack-barGrow20 {
  from { width: 0%; }
  to { width: 20%; }
}
```

**Why prefix with `givingBack-`?** To avoid collisions with existing keyframes in the global scope.

---

## 6. Component Structure (LandingGivingBack.tsx)

The component renders the following visual hierarchy. Each numbered item maps to a section in the mockup:

```
<section>                               ← full-width, gradient bg, floating orb pseudo-elements
  <div.max-w-[780px]>                   ← centred inner container
    1. EYEBROW                          ← "Giving Back"
    2. HEADLINE                         ← "Celebrate a birthday. / Change a life."
    3. SUBHEADING                       ← explanatory paragraph
    4. TWO-PANEL LAYOUT                 ← flex column→row at 720px
       4a. PANEL HOST                   ← label + card
           - Card header (plum gradient, child avatar, name, step meta)
           - Card body:
             - Toggle row (giving back on/off)
             - Charity selector (logo + name + check)
             - Percentage pills (5%, 10%, 15%, 20%)
       4b. TRANSITION ARROW             ← animated circle with → arrow
       4c. PANEL GUEST                  ← label + card
           - Dreamboard header (sage gradient, avatar, name, badge)
           - Dreamboard body:
             - Gift box (emoji + name + desc)
             - GIVING STORY BANNER (heart icon, message, charity row)
             - Split section (bar + destinations R160/R40)
             - CTA button
    5. HOW-IT-WORKS STRIP               ← 3 cards in a row
    6. CHARITY PARTNERS GRID            ← logo chips for all 7 charities
    7. CLOSING LINE                     ← italic tagline
  </div>
</section>
```

---

## 7. Complete Component Code

Below is the **full replacement** for `src/components/landing/LandingGivingBack.tsx`. The agent should write this file in its entirety.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  givingBackCharities,
  givingBackDemo,
  givingBackHowItWorks,
} from './content';

/* ------------------------------------------------------------------ */
/*  Animation helpers (match LandingHowItWorks pattern)                */
/* ------------------------------------------------------------------ */

const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

function fadeStyle(visible: boolean, delay: number, duration = 0.4) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity ${duration}s ${EASING} ${delay}s, transform ${duration}s ${EASING} ${delay}s`,
  } as const;
}

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook                                                 */
/* ------------------------------------------------------------------ */

function useScrollReveal(prefersReducedMotion: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Wavy underline decoration                                          */
/* ------------------------------------------------------------------ */

const wavyUnderlineStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: -6,
  left: 0,
  right: 0,
  height: 4,
  background:
    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 4"><path d="M 0 2 Q 5 0, 10 2 T 20 2 T 30 2 T 40 2 T 50 2 T 60 2 T 70 2 T 80 2 T 90 2 T 100 2 T 110 2 T 120 2 T 130 2 T 140 2 T 150 2 T 160 2 T 170 2 T 180 2 T 190 2 T 200 2 T 210 2 T 220 2 T 230 2 T 240 2 T 250 2 T 260 2 T 270 2 T 280 2 T 290 2 T 300 2" stroke="%237E6B9B" stroke-width="2.5" fill="none" opacity="0.25"/></svg>\') repeat-x',
  backgroundSize: '30px 4px',
};

/* ------------------------------------------------------------------ */
/*  Section background                                                 */
/* ------------------------------------------------------------------ */

const sectionBackground =
  'linear-gradient(180deg, #FAF7F2 0%, #F7F3FA 12%, #F1EDF7 40%, #F5F1F9 70%, #FAF7F2 100%)';

/* ------------------------------------------------------------------ */
/*  Stagger delays                                                     */
/* ------------------------------------------------------------------ */

const DELAYS = {
  eyebrow: 0,
  headline: 0.06,
  subheading: 0.12,
  twoPanel: 0.2,
  howStrip: 0.38,
  charities: 0.48,
  closing: 0.54,
} as const;

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[11px] h-[11px] text-white"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px] text-plum"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Derived demo values                                                */
/* ------------------------------------------------------------------ */

const demo = givingBackDemo;
const pct = demo.activePercentage;
const giftPct = 100 - pct;
const giftAmount = Math.round(demo.exampleContribution * (giftPct / 100));
const charityAmount = demo.exampleContribution - giftAmount;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LandingGivingBack() {
  const prefersReducedMotion = useReducedMotion();
  const { ref: sectionRef, visible } = useScrollReveal(prefersReducedMotion);
  const show = visible || prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      id="giving-back"
      className="px-6 py-14 md:px-10 md:py-20 relative overflow-hidden z-[5]"
      style={{ background: sectionBackground }}
    >
      {/* Floating orb decorations */}
      <div
        aria-hidden="true"
        className="absolute w-[500px] h-[500px] -top-[120px] -right-[180px] rounded-full pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(126,107,155,0.06) 0%, transparent 70%)',
          animation: prefersReducedMotion
            ? 'none'
            : 'givingBack-floatOrb1 12s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute w-[400px] h-[400px] -bottom-[100px] -left-[140px] rounded-full pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(107,158,136,0.05) 0%, transparent 70%)',
          animation: prefersReducedMotion
            ? 'none'
            : 'givingBack-floatOrb2 10s ease-in-out infinite',
        }}
      />

      <div className="max-w-[780px] mx-auto relative z-[2]">
        {/* ========== HEADER ========== */}

        {/* Eyebrow */}
        <p
          className="text-[11px] font-semibold tracking-[2.5px] uppercase text-plum text-center mb-4"
          style={fadeStyle(show, DELAYS.eyebrow)}
        >
          Giving Back
        </p>

        {/* Headline */}
        <h2
          className="text-[30px] md:text-[38px] font-normal leading-[1.2] text-[#2D2D2D] text-center mb-3"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            ...fadeStyle(show, DELAYS.headline),
          }}
        >
          Celebrate a birthday.
          <br />
          <span className="relative inline-block">
            <span>Change a life.</span>
            <span style={wavyUnderlineStyle} aria-hidden="true" />
          </span>
        </h2>

        {/* Subheading */}
        <p
          className="text-[15px] text-[#4A5D53] text-center max-w-[520px] mx-auto mb-[52px] leading-[1.65]"
          style={fadeStyle(show, DELAYS.subheading)}
        >
          When creating a Dreamboard, the host can enable giving back — choosing
          a charity and what percentage of every contribution supports it. Guests
          see full transparency before they chip in.
        </p>

        {/* ========== TWO-PANEL LAYOUT ========== */}
        <div
          className="flex flex-col items-center gap-6 min-[720px]:flex-row min-[720px]:items-stretch min-[720px]:gap-7"
          style={fadeStyle(show, DELAYS.twoPanel, 0.6)}
        >
          {/* ============================================ */}
          {/*  PANEL 1: HOST SETUP                          */}
          {/* ============================================ */}
          <div className="flex-1 min-w-0 flex flex-col max-w-[370px] min-[720px]:max-w-none">
            {/* Panel label */}
            <div className="flex items-center gap-2 mb-3 pl-1">
              <div className="w-7 h-7 rounded-lg bg-[rgba(126,107,155,0.1)] flex items-center justify-center text-[13px] shrink-0">
                👩‍💻
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-plum">
                  Host sets up
                </span>
                <span className="text-[11px] text-[#7A8D83] font-normal ml-0.5">
                  — during Dreamboard creation
                </span>
              </div>
            </div>

            {/* Setup card */}
            <div className="flex-1 bg-white rounded-[22px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.06),0_6px_18px_rgba(126,107,155,0.04),0_0_0_1px_rgba(126,107,155,0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(0,0,0,0.09),0_10px_28px_rgba(126,107,155,0.06),0_0_0_1px_rgba(126,107,155,0.05)]"
              style={{ transitionTimingFunction: EASING }}
            >
              {/* Card header */}
              <div className="bg-gradient-to-br from-[#F1EDF7] to-[#E8E0F2] px-[18px] py-5 flex items-center gap-3 border-b border-[rgba(126,107,155,0.06)]">
                <div className="relative w-12 h-12 shrink-0">
                  <Image
                    src="/images/demo-child.png"
                    alt={demo.childName}
                    fill
                    className="rounded-full object-cover object-[center_20%] border-[2.5px] border-white shadow-[0_4px_14px_rgba(252,182,159,0.2)]"
                  />
                </div>
                <div>
                  <div
                    className="text-[16px] text-[#2D2D2D] mb-px"
                    style={{ fontFamily: 'var(--font-dm-serif)' }}
                  >
                    {demo.childName}&apos;s Dreamboard
                  </div>
                  <div className="text-[11px] text-[#7A8D83]">
                    {demo.setupStep}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-[18px]">
                {/* Toggle row */}
                <div className="flex items-center justify-between gap-3 mb-[18px] px-[14px] py-3 bg-[#FFFCF9] rounded-[14px] border-[1.5px] border-[rgba(126,107,155,0.08)]">
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[18px]">💜</span>
                    <div>
                      <span className="text-[13px] font-semibold text-[#2D2D2D] block">
                        Enable giving back
                      </span>
                      <span className="text-[10px] text-[#7A8D83] block mt-px">
                        Share a portion with a charity
                      </span>
                    </div>
                  </div>
                  {/* Toggle switch (decorative — always "on") */}
                  <div
                    className="w-[42px] h-6 rounded-xl bg-plum relative shrink-0 shadow-[0_2px_6px_rgba(126,107,155,0.25)]"
                    role="img"
                    aria-label="Toggle enabled"
                  >
                    <div className="absolute top-[3px] right-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]" />
                  </div>
                </div>

                {/* Charity selector */}
                <div className="mb-4">
                  <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#7A8D83] mb-2">
                    Choose a charity
                  </div>
                  <div className="flex items-center gap-[10px] bg-white rounded-xl px-[14px] py-[10px] border-[1.5px] border-[rgba(126,107,155,0.12)]">
                    <div className="w-[30px] h-[30px] rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#f3eef9] p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={demo.selectedCharityLogo}
                        alt={demo.selectedCharity}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#2D2D2D]">
                        {demo.selectedCharity}
                      </div>
                      <div className="text-[10px] text-[#7A8D83]">
                        {demo.selectedCharityTag}
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#6B9E88] flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </div>
                  </div>
                </div>

                {/* Percentage pills */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold tracking-[1px] uppercase text-[#7A8D83] mb-2">
                    <span>Set the split</span>
                    <span className="font-normal tracking-normal normal-case italic text-[10px] text-[#7A8D83]">
                      % of each contribution
                    </span>
                  </div>
                  <div className="flex gap-[7px]">
                    {demo.percentageOptions.map((pctOption) => {
                      const isActive = pctOption === demo.activePercentage;
                      return (
                        <div
                          key={pctOption}
                          className={`flex-1 h-[38px] rounded-[11px] flex items-center justify-center text-[13px] font-semibold relative ${
                            isActive
                              ? 'bg-plum text-white border-[1.5px] border-plum shadow-[0_4px_14px_rgba(126,107,155,0.3)] scale-[1.03]'
                              : 'bg-white text-[#7A8D83] border-[1.5px] border-[rgba(126,107,155,0.1)]'
                          }`}
                        >
                          {pctOption}%
                          {isActive && (
                            <span
                              className="absolute inset-[-3px] rounded-[13px] border-2 border-[rgba(126,107,155,0.18)] pointer-events-none"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/*  TRANSITION ARROW                             */}
          {/* ============================================ */}
          <div className="flex items-center justify-center shrink-0 self-center">
            <div
              className="w-10 h-10 rounded-full bg-white border-[1.5px] border-[rgba(126,107,155,0.12)] shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-center"
              style={{
                animation: prefersReducedMotion
                  ? 'none'
                  : undefined,
              }}
            >
              <div className="min-[720px]:animate-[givingBack-nudge-x_2.5s_ease-in-out_infinite] max-[719px]:animate-[givingBack-nudge-y_2.5s_ease-in-out_infinite]">
                <div className="min-[720px]:rotate-0 max-[719px]:rotate-90">
                  <ArrowIcon />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/*  PANEL 2: GUEST VIEW                          */}
          {/* ============================================ */}
          <div className="flex-1 min-w-0 flex flex-col max-w-[370px] min-[720px]:max-w-none">
            {/* Panel label */}
            <div className="flex items-center gap-2 mb-3 pl-1">
              <div className="w-7 h-7 rounded-lg bg-[rgba(107,158,136,0.1)] flex items-center justify-center text-[13px] shrink-0">
                👀
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#5A8E78]">
                  Guest sees
                </span>
                <span className="text-[11px] text-[#7A8D83] font-normal ml-0.5">
                  — on the shared Dreamboard
                </span>
              </div>
            </div>

            {/* Dreamboard card */}
            <div className="flex-1 bg-white rounded-[22px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.06),0_6px_18px_rgba(126,107,155,0.04),0_0_0_1px_rgba(126,107,155,0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(0,0,0,0.09),0_10px_28px_rgba(126,107,155,0.06),0_0_0_1px_rgba(126,107,155,0.05)]"
              style={{ transitionTimingFunction: EASING }}
            >
              {/* Dreamboard header */}
              <div className="bg-gradient-to-br from-[#E4F0E8] to-[#D5E8DC] px-[18px] pt-[22px] pb-[18px] text-center relative">
                {/* Giving badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[rgba(126,107,155,0.14)] backdrop-blur-sm rounded-[20px] px-[9px] py-1 pl-[7px] text-[9px] font-semibold text-plum">
                  💜 Giving Back
                </div>

                <div className="relative w-16 h-16 mx-auto mb-2">
                  <Image
                    src="/images/demo-child.png"
                    alt={demo.childName}
                    fill
                    className="rounded-full object-cover object-[center_20%] border-[3px] border-white shadow-[0_6px_20px_rgba(252,182,159,0.25)]"
                  />
                </div>
                <div
                  className="text-[17px] text-[#2D2D2D] mb-0.5"
                  style={{ fontFamily: 'var(--font-dm-serif)' }}
                >
                  {demo.childName}&apos;s Dreamboard
                </div>
                <div className="text-[11px] text-[#999]">
                  {demo.childAge} · {demo.childDate}
                </div>
              </div>

              {/* Dreamboard body */}
              <div className="p-[18px]">
                {/* Gift box */}
                <div className="bg-gradient-to-br from-[#FFFBF7] to-[#FFF8F2] rounded-[14px] p-[14px] border border-[rgba(200,160,100,0.1)] mb-[14px] flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[11px] bg-gradient-to-br from-[#FFF0F5] to-[#FFE4EC] flex items-center justify-center text-[22px] shrink-0">
                    {demo.giftEmoji}
                  </div>
                  <div>
                    <div
                      className="text-[15px] text-[#2D2D2D] mb-0.5"
                      style={{ fontFamily: 'var(--font-dm-serif)' }}
                    >
                      {demo.giftName}
                    </div>
                    <div className="text-[11px] text-[#999]">
                      {demo.giftDescription}
                    </div>
                  </div>
                </div>

                {/* ============================================ */}
                {/*  GIVING STORY BANNER                          */}
                {/* ============================================ */}
                <div className="bg-gradient-to-br from-[#F7F2FC] via-[#F1EDF7] to-[#EDE6F5] rounded-[16px] p-[18px] px-4 mb-[14px] border border-[rgba(126,107,155,0.08)] relative overflow-hidden">
                  {/* Decorative corner flourishes */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-[30px] -right-[30px] w-[100px] h-[100px] rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(126,107,155,0.06) 0%, transparent 70%)',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-5 -left-5 w-[70px] h-[70px] rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(107,158,136,0.05) 0%, transparent 70%)',
                    }}
                  />

                  {/* Heart row */}
                  <div className="flex items-center gap-2 mb-3 relative z-[1]">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-plum to-[#9B85B8] flex items-center justify-center text-[15px] shrink-0 shadow-[0_3px_10px_rgba(126,107,155,0.25)]"
                      style={{
                        animation: prefersReducedMotion
                          ? 'none'
                          : 'givingBack-heartGlow 3s ease-in-out infinite',
                      }}
                    >
                      💜
                    </div>
                    <span className="text-[10px] font-semibold tracking-[1.2px] uppercase text-plum">
                      Giving Back Enabled
                    </span>
                  </div>

                  {/* Story message */}
                  <div className="relative z-[1] mb-[14px]">
                    <p className="text-[14px] leading-[1.55] text-[#2D2D2D]">
                      <span
                        className="text-plum"
                        style={{ fontFamily: 'var(--font-dm-serif)' }}
                      >
                        {demo.childName}
                      </span>{' '}
                      has chosen to support{' '}
                      <span className="font-bold text-plum">
                        {demo.selectedCharity}
                      </span>{' '}
                      with this Dreamboard.{' '}
                      <span className="inline-flex items-center justify-center bg-plum text-white text-[12px] font-bold px-2 py-0.5 rounded-md align-middle mx-0.5 leading-none shadow-[0_2px_6px_rgba(126,107,155,0.2)]">
                        {pct}%
                      </span>{' '}
                      of every contribution will go towards helping{' '}
                      {demo.selectedCharityTag.toLowerCase()}.
                    </p>
                  </div>

                  {/* Charity row */}
                  <div className="flex items-center gap-[10px] bg-white/70 backdrop-blur-sm rounded-xl px-3 py-[10px] border border-[rgba(126,107,155,0.06)] relative z-[1]">
                    <div className="w-[34px] h-[34px] rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#f3eef9] p-1 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={demo.selectedCharityLogo}
                        alt={demo.selectedCharity}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#2D2D2D]">
                        {demo.selectedCharity}
                      </div>
                      <div className="text-[10px] text-[#7A8D83]">
                        {demo.selectedCharityTag}
                      </div>
                    </div>
                    <span
                      className="text-[20px] text-plum shrink-0"
                      style={{ fontFamily: 'var(--font-dm-serif)' }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* ============================================ */}
                {/*  SPLIT BAR + DESTINATIONS                     */}
                {/* ============================================ */}
                <div className="mb-[14px]">
                  <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[#7A8D83] mb-2 flex items-center gap-[5px]">
                    When you chip in R{demo.exampleContribution}, here&apos;s
                    where it goes
                  </div>

                  {/* Animated split bar */}
                  <div className="h-[7px] rounded-full bg-[rgba(126,107,155,0.08)] overflow-hidden flex mb-1.5">
                    <div
                      className="h-full rounded-l-full"
                      style={{
                        background:
                          'linear-gradient(90deg, #6B9E88, #5A8E78)',
                        animation: show && !prefersReducedMotion
                          ? 'givingBack-barGrow80 1.2s cubic-bezier(0.23,1,0.32,1) 0.8s forwards'
                          : 'none',
                        width: show && prefersReducedMotion ? '80%' : show ? '0%' : '0%',
                      }}
                    />
                    <div
                      className="h-full rounded-r-full"
                      style={{
                        background:
                          'linear-gradient(90deg, #B19BCF, #7E6B9B)',
                        animation: show && !prefersReducedMotion
                          ? 'givingBack-barGrow20 0.8s cubic-bezier(0.23,1,0.32,1) 1.6s forwards'
                          : 'none',
                        width: show && prefersReducedMotion ? '20%' : show ? '0%' : '0%',
                      }}
                    />
                  </div>

                  {/* Bar labels */}
                  <div className="flex justify-between text-[10px] mb-[10px]">
                    <span className="text-[#5A8E78] font-semibold">
                      {giftPct}% → gift
                    </span>
                    <span className="text-plum font-semibold">
                      {pct}% → charity
                    </span>
                  </div>

                  {/* Destination cards */}
                  <div className="flex gap-2">
                    {/* Gift destination */}
                    <div className="flex-1 rounded-xl p-3 px-[10px] text-center relative overflow-hidden bg-[rgba(107,158,136,0.06)] border border-[rgba(107,158,136,0.08)]">
                      <div
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{
                          background:
                            'linear-gradient(90deg, #6B9E88, #5A8E78)',
                        }}
                        aria-hidden="true"
                      />
                      <div className="text-[18px] mb-1">🎁</div>
                      <div
                        className="text-[18px] leading-none text-[#5A8E78] mb-[3px]"
                        style={{ fontFamily: 'var(--font-dm-serif)' }}
                      >
                        R{giftAmount}
                      </div>
                      <div className="text-[10px] font-semibold text-[#2D2D2D] mb-px">
                        {demo.childName}&apos;s gift
                      </div>
                      <div className="text-[9px] text-[#7A8D83]">
                        {demo.giftName}
                      </div>
                    </div>

                    {/* Charity destination */}
                    <div className="flex-1 rounded-xl p-3 px-[10px] text-center relative overflow-hidden bg-[rgba(126,107,155,0.06)] border border-[rgba(126,107,155,0.08)]">
                      <div
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{
                          background:
                            'linear-gradient(90deg, #B19BCF, #7E6B9B)',
                        }}
                        aria-hidden="true"
                      />
                      <div className="text-[18px] mb-1">💜</div>
                      <div
                        className="text-[18px] leading-none text-plum mb-[3px]"
                        style={{ fontFamily: 'var(--font-dm-serif)' }}
                      >
                        R{charityAmount}
                      </div>
                      <div className="text-[10px] font-semibold text-[#2D2D2D] mb-px">
                        {demo.selectedCharity}
                      </div>
                      <div className="text-[9px] text-[#7A8D83]">
                        {demo.selectedCharityTag}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA button (decorative) */}
                <div className="flex items-center justify-center gap-2 w-full py-[13px] rounded-[14px] border-2 border-[#5A8E78] text-[#5A8E78] text-[14px] font-semibold opacity-85 mt-[14px]">
                  <span>Chip in for {demo.childName}</span>
                  <span>💝</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== HOW-IT-WORKS STRIP ========== */}
        <div
          className="flex justify-center"
          style={fadeStyle(show, DELAYS.howStrip)}
        >
          <div className="flex gap-4 mt-10 w-full max-w-[600px] max-[600px]:flex-col max-[600px]:gap-3">
            {givingBackHowItWorks.map((card) => (
              <div
                key={card.title}
                className="flex-1 bg-white rounded-[18px] px-4 py-5 text-center border border-black/[0.04] shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:-translate-y-0.5"
              >
                <div
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center text-[20px] mx-auto mb-[10px] ${card.bgClass}`}
                >
                  {card.emoji}
                </div>
                <div
                  className="text-[15px] text-[#2D2D2D] mb-1"
                  style={{ fontFamily: 'var(--font-dm-serif)' }}
                >
                  {card.title}
                </div>
                <div className="text-[12px] leading-[1.55] text-[#4A5D53]">
                  {card.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== CHARITY PARTNERS ========== */}
        <div
          className="mt-12 text-center"
          style={fadeStyle(show, DELAYS.charities)}
        >
          <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#7A8D83] mb-5">
            Our vetted charity partners
          </div>
          <div className="flex justify-center gap-3 flex-wrap max-w-[640px] mx-auto">
            {givingBackCharities.map((charity) => (
              <div
                key={charity.name}
                className="flex items-center gap-[10px] bg-white rounded-[30px] py-1.5 pl-1.5 pr-4 border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_6px_18px_rgba(0,0,0,0.07)] hover:-translate-y-0.5"
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center p-1"
                  style={{ background: charity.logoBg }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={charity.logoUrl}
                    alt={`${charity.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[12px] font-medium text-[#2D2D2D] whitespace-nowrap">
                  {charity.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== CLOSING ========== */}
        <p
          className="mt-9 text-center text-[14px] text-[#7A8D83] italic"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            ...fadeStyle(show, DELAYS.closing),
          }}
        >
          It&apos;s optional. It&apos;s transparent. And it makes every gift
          mean more.
        </p>
      </div>
    </section>
  );
}
```

---

## 8. Step-by-Step Execution Checklist

The AI coding agent should execute the following steps **in this exact order**:

### Step 1: Update `src/app/globals.css`

Append the CSS keyframes from Section 5 of this spec at the end of the file (after the `.hiw-card-circle` rule block). Do NOT modify or remove any existing CSS.

### Step 2: Update `src/components/landing/content.ts`

1. **Delete** the `givingBackMetrics` export entirely (lines 108–126 of the current file).
2. **Delete** the `givingBackCharities` export entirely (lines 128–159 of the current file).
3. **Add** the three new exports (`givingBackCharities`, `givingBackDemo`, `givingBackHowItWorks`) from Section 4.2 of this spec at the end of the file.

### Step 3: Replace `src/components/landing/LandingGivingBack.tsx`

Replace the entire file contents with the code from Section 7 of this spec.

### Step 4: Verify the build

Run:
```bash
npx tsc --noEmit
```

This should exit with 0 errors. If there are TypeScript errors, fix them before proceeding.

### Step 5: Visual verification

If a browser is available, run `npm run dev` and navigate to `http://localhost:3000` to scroll to the Giving Back section and verify:

1. Two-panel layout renders correctly (stacked on mobile, side-by-side at 720px+)
2. Transition arrow animates (horizontal nudge on desktop, vertical on mobile)
3. Demo child image loads from `/images/demo-child.png`
4. Charity logos load from external URLs
5. Split bar animates on scroll-reveal
6. Heart icon has subtle glow animation
7. How-it-works strip shows 3 cards
8. Charity partner chips show all 7 charities with real logos
9. Reduced motion: all animations are suppressed when `prefers-reduced-motion: reduce` is set

---

## 9. Design Token Reference

For quick reference, here are the colour values used throughout:

| Token | Hex | Usage |
|-------|-----|-------|
| plum | `#7E6B9B` | Primary accent, badges, pills, highlights |
| plum-wash | `#F1EDF7` | Light plum backgrounds |
| plum-soft | `#E4DDF0` | Medium plum backgrounds |
| sage | `#6B9E88` | Gift/green accent |
| sage-deep | `#5A8E78` | Deeper green for CTA, labels |
| coral | `#C4785A` | Warm accent (used in how-it-works card bg) |
| warm-bg | `#FFFCF9` | Toggle row background |
| warm-bg-alt | `#FAF7F2` | Section gradient endpoints |
| text-dark | `#2D2D2D` | Primary text |
| text-muted | `#4A5D53` | Secondary body text |
| text-light | `#7A8D83` | Tertiary/label text |
| lavender secondary | `#9B85B8` | Heart icon gradient end |
| bar-plum-start | `#B19BCF` | Split bar charity gradient start |

---

## 10. Responsive Breakpoints

| Breakpoint | Behaviour |
|-----------|-----------|
| Default (mobile) | Single column, panels stack vertically, arrow points down (rotated 90°), how-strip stacks |
| `min-width: 600px` | How-strip goes horizontal (3 cards in row) |
| `min-width: 720px` | Two-panel goes side-by-side, arrow points right, panels grow to fill |
| `min-width: 768px` | Section padding increases, headline grows to 38px |

---

## 11. Accessibility Checklist

- [x] `aria-hidden="true"` on all decorative elements (orbs, wavy underline, top bars)
- [x] `role="img" aria-label="Toggle enabled"` on decorative toggle switch
- [x] `alt` text on all `<Image>` and `<img>` tags
- [x] Meaningful section `id="giving-back"` for navigation
- [x] `prefers-reduced-motion: reduce` disables ALL animations via both CSS (globals.css) and JS (useReducedMotion hook)
- [x] Colour contrast: text colours meet WCAG AA against their backgrounds
- [x] No interactive elements that require click handling (all decorative/presentational)

---

## 12. External Image Dependencies

The charity logos are loaded from external URLs. These are the official websites of each charity:

| Charity | URL | Format |
|---------|-----|--------|
| Reach for a Dream | `https://reachforadream.org.za/wp-content/uploads/2025/03/reach-for-a-dream-logo.svg` | SVG |
| CHOC | `https://choc.org.za/wp-content/uploads/2019/07/choc-logo-200px.png` | PNG |
| Cotlands | `https://cdn.brandfetch.io/idsAaqKEre/w/400/h/400/theme/dark/icon.jpeg` | JPEG |
| Ladles of Love | `https://ladlesoflove.org.za/wp-content/uploads/2022/03/LadlesOfLove-logofullcolour.png` | PNG |
| Afrika Tikkun | `https://afrikatikkun.com/wp-content/uploads/2024/01/Mian-Logo.png` | PNG |
| DARG | `https://cdn.brandfetch.io/idgm5KhPzP/w/117/h/118/theme/dark/logo.png` | PNG |
| Cape SPCA | `https://capespca.co.za/wp-content/uploads/2024/06/Flat-design-logo.png` | PNG |

**Important:** These use `<img>` tags (not Next.js `<Image>`) because they are external URLs and don't need to be optimised through Next.js image pipeline. The `eslint-disable-next-line @next/next/no-img-element` comment is intentional.

If `next.config` has `images.remotePatterns` configured, the agent could switch to `<Image>` with `unoptimized` prop, but plain `<img>` is simpler and matches the mockup approach.

---

## 13. What NOT to Do

1. **Do NOT** add any new npm dependencies
2. **Do NOT** modify `tailwind.config.ts`
3. **Do NOT** modify `LandingPage.tsx`, `index.ts`, or any other landing component
4. **Do NOT** create any new files other than modifying the 3 specified files
5. **Do NOT** use fake/placeholder data for charity logos — use the exact URLs above
6. **Do NOT** add metric cards or statistics (R240,000+, etc.) — these were explicitly removed
7. **Do NOT** make the toggle, percentage pills, or CTA interactive — they are purely presentational
8. **Do NOT** import from `'next/image'` for external charity logo URLs — use plain `<img>` tags

---

## 14. Summary of Changes

| Before (current) | After (v6) |
|-------------------|------------|
| 3 metric cards with fake stats (R240k+, 5 partners, 100% SA) | Two-panel educational layout (host setup ↔ guest view) |
| Letter-initial charity avatars (RF, CH, CO, LL, AT) | Real charity logos from official websites |
| 5 charities | 7 charities (added DARG + Cape SPCA) |
| Single-column scrolling strip | Wrap-friendly grid of charity chips |
| No visual explanation of the feature | Full mockup Dreamboard with giving story banner |
| No split visualisation | Animated split bar with R160/R40 destination cards |
| Static content | Scroll-reveal + floating orbs + heart glow + bar grow animations |

---

*End of implementation spec.*

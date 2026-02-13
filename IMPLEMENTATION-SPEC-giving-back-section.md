# Implementation Spec: "Giving Back" Impact Showcase Section

> **For:** AI coding agent
> **Scope:** Add ONE new section to the Gifta marketing homepage
> **Critical constraint:** The existing homepage is production-complete and must NOT be modified in any way — no changes to existing components, styling, layout, content, animations, or behaviour. The only change is the surgical insertion of a single new section into the page flow.

---

## 1. What you are building

A new `LandingGivingBack` component — a full-width "Impact Showcase" section that introduces Gifta's charitable giving feature to homepage visitors. It sits between the existing `LandingHowItWorks` section and the existing closing CTA section.

The section uses a distinct plum-tinted colour palette to create a visual "moment" on the page that signals something special, while remaining harmonious with the warm sage/amber design language surrounding it.

### Visual reference

The approved mockup is at `mockup-variant-c.html` in the repo root. Open it in a browser and scroll to the section between the hero and the "How It Works" area — that is the section labelled "GIVING BACK" with the headline "Celebrate a birthday. Change a life." This is your pixel-perfect reference for what to build, but note the placement difference: in the final implementation it goes AFTER "How It Works", not before it.

---

## 2. Where it goes in the page flow

### Current flow (in `LandingPage.tsx`):

```
<LandingNav />
<spacer />
<Hero grid (LandingHero, LandingStatsLine, LandingTestimonial, LandingCTA, LandingDreamBoard)>
<LandingHowItWorks />
<Closing CTA section (inline in LandingPage.tsx, lines ~74-94)>
<LandingFooter />
```

### New flow — insert `LandingGivingBack` between `LandingHowItWorks` and the closing CTA:

```
<LandingNav />
<spacer />
<Hero grid>
<LandingHowItWorks />
<LandingGivingBack />          ← NEW
<Closing CTA section>
<LandingFooter />
```

### Why this placement works

`LandingHowItWorks` ends with a warm `#FAF7F2` background. The new section begins with a gradient that transitions FROM that warm tone INTO a plum-tinted wash, then transitions BACK to the warm/white tone before the closing CTA. This creates a seamless colour flow with zero jarring transitions.

---

## 3. Files to create

### 3a. `src/components/landing/LandingGivingBack.tsx`

This is the only new component file. It is a `'use client'` component (because it uses `IntersectionObserver` for scroll-reveal and the `useReducedMotion` hook).

### 3b. Update `src/components/landing/content.ts`

Add new exported data constants for the section's content (charities, metrics). This keeps content separated from presentation, following the established pattern.

### 3c. Update `src/components/landing/index.ts`

Add the barrel export for `LandingGivingBack`.

### 3d. Update `src/components/landing/LandingPage.tsx`

Import `LandingGivingBack` and insert it in the JSX between `<LandingHowItWorks />` and the closing CTA `<section>`. This is a single-line insertion.

### 3e. Update `src/app/globals.css`

Add one new keyframe animation (`landing-giving-back-fade-up`) and its utility class alongside the existing landing animation definitions.

---

## 4. Do NOT modify

- `LandingNav.tsx`
- `LandingHero.tsx`
- `LandingDreamBoard.tsx`
- `LandingStatsLine.tsx`
- `LandingTestimonial.tsx`
- `LandingCTA.tsx`
- `LandingHowItWorks.tsx`
- `LandingFooter.tsx`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- Any files outside the landing component directory (except `globals.css` for the animation keyframe)
- Any existing content in `content.ts` — only APPEND new exports

---

## 5. Exact content data (add to `content.ts`)

Append these exports to the bottom of the existing `content.ts` file. Do not modify any existing exports.

```typescript
export const givingBackMetrics = [
  {
    emoji: '💜',
    value: 'R240,000+',
    label: 'shared with charities',
  },
  {
    emoji: '🤝',
    value: '5',
    sublabel: 'partner charities',
    label: 'vetted & verified',
  },
  {
    emoji: '🇿🇦',
    value: '100%',
    sublabel: 'South African',
    label: 'supporting local causes',
  },
];

export const givingBackCharities = [
  {
    initials: 'RF',
    name: 'Reach for a Dream',
    tag: 'Children with chronic illnesses',
    color: '#7E6B9B', // plum
  },
  {
    initials: 'CH',
    name: 'CHOC Childhood Cancer',
    tag: 'Cancer research & support',
    color: '#C49A5C', // amber
  },
  {
    initials: 'CO',
    name: 'Cotlands',
    tag: 'Early childhood development',
    color: '#4A7E66', // sage
  },
  {
    initials: 'LL',
    name: 'Ladles of Love',
    tag: 'Feeding the hungry daily',
    color: '#D97706', // orange/warning
  },
  {
    initials: 'AT',
    name: 'Afrika Tikkun',
    tag: 'Youth development & education',
    color: '#2563EB', // blue
  },
];
```

---

## 6. The `LandingGivingBack` component — full specification

### 6a. Component structure

```
'use client'

<section>                              ← full-width background
  <div.container>                      ← max-width 760px, centered
    <p.eyebrow>                        ← "GIVING BACK"
    <h2.headline>                      ← "Celebrate a birthday." / "Change a life."
      <span.wavy-underline>            ← decorative SVG underline on "Change a life."
    <p.subheading>                     ← value proposition copy
    <div.metric-cards>                 ← 3-column grid (1-col mobile)
      <div.metric-card> × 3           ← emoji, value, optional sublabel, label
    <div.charity-strip>                ← horizontal scrollable row
      <div.charity-card> × 5          ← initials circle + name + tag
    <p.closing>                        ← italic closing line
  </div.container>
</section>
```

### 6b. Scroll-reveal animation

Follow the EXACT pattern from `LandingHowItWorks.tsx`:

1. Import `useReducedMotion` from `@/hooks/useReducedMotion`
2. Create a `ref` with `useRef<HTMLElement>(null)` for the section
3. Track `visible` state with `useState`, initialized to `prefersReducedMotion`
4. In a `useEffect`, create an `IntersectionObserver` with `{ threshold: 0.1, rootMargin: '0px 0px -60px 0px' }` — identical options to `LandingHowItWorks`
5. When visible, set state to true and unobserve
6. Build a `fadeStyle` helper function matching the one in `LandingHowItWorks`:
   ```typescript
   const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

   function fadeStyle(visible: boolean, delay: number, duration = 0.4) {
     return {
       opacity: visible ? 1 : 0,
       transform: visible ? 'translateY(0)' : 'translateY(16px)',
       transition: `opacity ${duration}s ${EASING} ${delay}s, transform ${duration}s ${EASING} ${delay}s`,
     } as const;
   }
   ```
7. Apply staggered delays:
   - Eyebrow: delay `0`
   - Headline: delay `0.06`
   - Subheading: delay `0.12`
   - Metric card 1: delay `0.18`
   - Metric card 2: delay `0.26`
   - Metric card 3: delay `0.34`
   - Charity strip: delay `0.4`
   - Closing line: delay `0.46`

### 6c. Section background

```
background: linear-gradient(180deg, #FAF7F2 0%, #F7F3FA 15%, #F1EDF7 45%, #F5F1F9 75%, #FAF7F2 100%)
```

This gradient:
- STARTS at `#FAF7F2` (the exact background of `LandingHowItWorks`) — creating a seamless edge
- Transitions INTO the plum-wash tones in the middle
- Transitions BACK to `#FAF7F2` at the bottom — creating a seamless edge into the closing CTA area

Padding: `py-20 md:py-24 px-6 md:px-10`

The section should NOT have any hard border or divider between it and `LandingHowItWorks` above. The gradient handles the visual transition.

### 6d. Container

```
max-w-[760px] mx-auto
```

This is wider than the `LandingHowItWorks` container (520px) but matches the closing CTA card width (760px). This slight width increase signals a shift in content type while maintaining visual harmony.

### 6e. Eyebrow label

```
text-[11px] font-semibold tracking-[2.5px] uppercase text-plum text-center mb-4
```

Content: `GIVING BACK`

This matches the exact typographic pattern of the `LandingHowItWorks` eyebrow ("HOW IT WORKS") — same size, weight, tracking, transform — but uses `text-plum` (#7E6B9B) instead of `text-[#6B9E88]` (sage) to signal the new theme.

### 6f. Headline

```html
<h2 style={{ fontFamily: 'var(--font-dm-serif)' }}
    className="text-[30px] md:text-[36px] font-bold leading-[1.2] text-[#2D2D2D] text-center mb-3">
  Celebrate a birthday.<br />
  <span className="relative inline-block">
    <span>Change a life.</span>
    <span className={wavy underline element} aria-hidden="true" />
  </span>
</h2>
```

The wavy underline is a purely decorative `<span>` positioned absolutely below "Change a life." using an inline SVG background:

```css
position: absolute;
bottom: -6px;
left: 0;
right: 0;
height: 4px;
background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 4"><path d="M 0 2 Q 5 0, 10 2 T 20 2 T 30 2 T 40 2 T 50 2 T 60 2 T 70 2 T 80 2 T 90 2 T 100 2 T 110 2 T 120 2 T 130 2 T 140 2 T 150 2 T 160 2 T 170 2 T 180 2 T 190 2 T 200 2 T 210 2 T 220 2 T 230 2 T 240 2 T 250 2 T 260 2 T 270 2 T 280 2 T 290 2 T 300 2" stroke="%237E6B9B" stroke-width="2.5" fill="none" opacity="0.25"/></svg>') repeat-x;
background-size: 30px 4px;
```

This should be applied via an inline `style` prop (since it's a one-off decorative element), not a Tailwind class.

### 6g. Subheading

```
text-[14px] md:text-[15px] text-[#4A5D53] text-center max-w-[520px] mx-auto mb-12 leading-[1.6]
```

Content: `Every Dreamboard can support a cause. Hosts choose a charity, set a split — and every contribution does double duty.`

### 6h. Metric cards grid

**Grid container:**
```
grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8
```

**Each metric card:**
```
bg-white rounded-[18px] p-7 md:p-7 shadow-[0_4px_12px_rgba(45,45,45,0.06)] border border-black/[0.04] border-l-[3px] border-l-plum/30 text-center
```

Key details:
- `border-l-[3px] border-l-plum/30` — the subtle plum left accent border. Use inline style `borderLeft: '3px solid rgba(126, 107, 155, 0.3)'` if the Tailwind shorthand doesn't compose cleanly with the general border.
- Padding: `28px 24px` (use `p-7` which is 28px, close enough, or use `px-6 py-7` for 24/28)

**Inside each card:**
```html
<span className="text-2xl mb-3 block">{emoji}</span>
<div className="text-[28px] font-bold text-plum mb-1" style={{ fontFamily: 'var(--font-dm-serif)' }}>
  {value}
</div>
{sublabel && (
  <div className="text-[13px] text-[#7A8D83] mb-0.5">{sublabel}</div>
)}
<div className="text-[13px] text-[#7A8D83]">{label}</div>
```

Map over the `givingBackMetrics` array to render these. Apply the `fadeStyle` with staggered delays per card.

### 6i. Charity strip

**Container:**
```
flex gap-4 overflow-x-auto pb-2 mb-7 snap-x snap-mandatory
```

Plus these styles to hide scrollbar:
```css
scrollbar-width: none;        /* Firefox */
-ms-overflow-style: none;     /* IE/Edge */
&::-webkit-scrollbar { display: none; }  /* Chrome/Safari */
```

Since Tailwind doesn't have a built-in scrollbar-hide utility, apply this via an inline `style` prop:
```typescript
style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
```

And add a `className` that includes a custom CSS class for the webkit part. Alternatively, use a `<style>` tag inside the component (but this is less clean). The simplest approach: add a one-line utility class in `globals.css`:

```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
```

**Each charity card:**
```
flex items-center gap-3 bg-white rounded-[14px] px-5 py-4 border border-black/[0.04] min-w-[200px] snap-start
transition-all duration-300 hover:shadow-[0_8px_20px_rgba(45,45,45,0.1)] hover:-translate-y-0.5
```

**Initials circle inside each card:**
```
w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
```

Background colour: set via inline `style={{ backgroundColor: charity.color }}`, reading from the data array.

**Text block inside each card:**
```html
<div className="flex flex-col gap-0.5">
  <span className="text-[13px] font-medium text-[#2D2D2D]">{name}</span>
  <span className="text-[11px] text-[#999]">{tag}</span>
</div>
```

Map over `givingBackCharities` to render.

### 6j. Closing line

```
text-[14px] text-[#7A8D83] text-center italic
```

With `style={{ fontFamily: 'var(--font-dm-serif)' }}` for the serif italic treatment.

Content: `It's optional. It's transparent. And it makes every gift mean more.`

---

## 7. CSS additions (in `globals.css`)

Add these AFTER the existing landing animation definitions (after the `.animate-landing-progress-shine` class, around line 257), alongside the existing landing animations:

```css
/* Giving Back section: scrollbar-hide utility */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
```

No new keyframes are needed — the scroll-reveal animation is handled entirely via the inline `fadeStyle` helper function (matching the `LandingHowItWorks` approach), not via CSS keyframe classes.

---

## 8. Integration into `LandingPage.tsx`

### 8a. Import

Add to the existing import block (line 8 of `LandingPage.tsx`):

```typescript
import {
  LandingNav,
  LandingHero,
  LandingDreamBoard,
  LandingStatsLine,
  LandingTestimonial,
  LandingCTA,
  LandingHowItWorks,
  LandingGivingBack,       // ← ADD THIS
  LandingFooter,
} from './index';
```

### 8b. JSX insertion

Insert `<LandingGivingBack />` on a new line directly after `<LandingHowItWorks />` (currently line 72) and before the closing CTA comment + `<section>` (currently lines 74-75):

```tsx
      <LandingHowItWorks />

      <LandingGivingBack />

      {/* Closing CTA — contract: copy-matrix-compliance + colour-contrast */}
      <section className="px-6 py-14 md:px-10 md:py-20">
```

That is the ONLY change to `LandingPage.tsx`. Do not modify any other line.

### 8c. Barrel export

Add to `src/components/landing/index.ts`:

```typescript
export { LandingGivingBack } from './LandingGivingBack';
```

Insert it after the `LandingHowItWorks` export and before the `LandingFooter` export (or before `LandingPage` if `LandingFooter` is the last component export). The goal is logical page-flow ordering.

---

## 9. Colour reference (for quick lookup)

These colours are already defined in `tailwind.config.ts` and can be used via Tailwind classes:

| Token | Hex | Tailwind class |
|-------|-----|----------------|
| Plum | `#7E6B9B` | `text-plum`, `bg-plum` |
| Plum wash | `#F1EDF7` | `bg-plum-wash` |
| Plum soft | `#E4DDF0` | `bg-plum-soft`, `border-plum-soft` |
| Sage | `#4A7E66` | `text-sage`, `bg-sage` |
| Amber | `#C49A5C` | `text-amber`, `bg-amber` |

Additional colours used (not in Tailwind config — use arbitrary values):

| Purpose | Hex | Usage |
|---------|-----|-------|
| Section gradient start/end | `#FAF7F2` | Inline style on section |
| Section gradient mid-light | `#F7F3FA` | Inline style on section |
| Section gradient mid | `#F1EDF7` | Inline style on section (same as plum-wash) |
| Section gradient mid-late | `#F5F1F9` | Inline style on section |
| Text body (green-grey) | `#4A5D53` | `text-[#4A5D53]` |
| Text muted | `#7A8D83` | `text-[#7A8D83]` |
| Text dark | `#2D2D2D` | `text-[#2D2D2D]` |
| Text light | `#999` | `text-[#999]` |
| Orange (Ladles of Love) | `#D97706` | Inline style |
| Blue (Afrika Tikkun) | `#2563EB` | Inline style |
| Card shadow | `rgba(45,45,45,0.06)` | Arbitrary shadow value |
| Plum border 30% | `rgba(126,107,155,0.3)` | Inline style |

---

## 10. Font usage

| Element | Font | How to apply |
|---------|------|-------------|
| Headline ("Celebrate a birthday…") | DM Serif Display | `style={{ fontFamily: 'var(--font-dm-serif)' }}` |
| Metric values ("R240,000+", "5", "100%") | DM Serif Display | `style={{ fontFamily: 'var(--font-dm-serif)' }}` |
| Closing italic line | DM Serif Display | `style={{ fontFamily: 'var(--font-dm-serif)' }}` |
| Everything else (eyebrow, subheading, labels, card text) | DM Sans | Inherited from page — no explicit font needed |

---

## 11. Responsive behaviour

| Breakpoint | Metric cards | Charity strip | Padding | Headline size |
|------------|-------------|---------------|---------|---------------|
| Mobile (<768px) | Single column stack | Horizontal scroll with snap | `py-14 px-6` | `30px` |
| Tablet/Desktop (≥768px) | 3-column grid | Flex row, all visible | `py-20 md:py-24 px-10` | `36px` |

The charity strip should use `snap-x snap-mandatory` on the container and `snap-start` on each card, so mobile users get a clean card-by-card horizontal scroll.

---

## 12. Accessibility requirements

1. The wavy underline `<span>` must have `aria-hidden="true"` (it's purely decorative)
2. The section should have an `id` attribute for potential anchor linking: `id="giving-back"`
3. Reduced motion: when `useReducedMotion()` returns true, all elements should render immediately (no staggered fade — this is already handled by initializing `visible` to `true` when `prefersReducedMotion` is true, matching `LandingHowItWorks`)
4. Charity initials circles must NOT have any interactive role — they're display-only
5. The horizontal scroll strip should not trap keyboard focus

---

## 13. What NOT to do

- Do NOT add this section's `id` to the `navLinks` array in `content.ts`. The nav already has "How it works" and "Trust & safety" — adding a third link would change the nav layout.
- Do NOT create a separate CSS module or styled-components file. The codebase uses Tailwind utility classes with inline styles for one-offs. Follow that pattern.
- Do NOT add any new dependencies or packages.
- Do NOT modify the closing CTA section's padding or margin. The gradient background of the new section handles the visual transition.
- Do NOT add any loading states, suspense boundaries, or data fetching. This is a static presentational component with hardcoded content.
- Do NOT use `Image` from `next/image` — there are no images in this section, only emoji and text.
- Do NOT modify the `LandingHowItWorks` section's bottom padding or background. The new section's gradient starting at `#FAF7F2` creates the seamless join.

---

## 14. Testing checklist

After implementation, verify:

- [ ] The section appears between "How It Works" and the closing CTA
- [ ] No visual change to any other section of the page
- [ ] Gradient transitions seamlessly from the warm bg of How It Works into plum wash and back
- [ ] Metric cards display in 3 columns on desktop, 1 column on mobile
- [ ] Charity strip scrolls horizontally on mobile with snap behaviour
- [ ] Charity strip shows all 5 cards in a row on desktop
- [ ] Scrollbar is hidden on the charity strip across browsers
- [ ] Scroll-reveal animation triggers when section enters viewport
- [ ] Staggered animation delays create a cascading reveal effect
- [ ] Wavy underline appears below "Change a life." and is visually subtle (0.25 opacity)
- [ ] All 5 charity names and tags match the spec exactly
- [ ] All 3 metric values match the spec exactly
- [ ] Reduced motion preference disables all animations (instant render)
- [ ] No TypeScript errors or build warnings
- [ ] The page renders correctly at 375px, 768px, and 1200px+ widths
- [ ] Plum left border accent is visible on metric cards
- [ ] Hover state on charity cards (subtle lift + shadow) works
- [ ] Closing italic line uses DM Serif Display font

---

## 15. Summary of all file changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/landing/LandingGivingBack.tsx` | **CREATE** | New component (~120-150 lines) |
| `src/components/landing/content.ts` | **APPEND** | Add `givingBackMetrics` and `givingBackCharities` exports |
| `src/components/landing/index.ts` | **ADD LINE** | Export `LandingGivingBack` |
| `src/components/landing/LandingPage.tsx` | **ADD LINE** | Import + render `<LandingGivingBack />` after `<LandingHowItWorks />` |
| `src/app/globals.css` | **ADD 2 LINES** | `.scrollbar-hide` utility class |

Total files changed: 5 (1 new, 4 modified with minimal additions)

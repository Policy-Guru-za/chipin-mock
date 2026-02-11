# Dreamboard Public Contributor UI Refactor Plan

## Overview

Refactor the public contributor page (`/[slug]`) from its current single-column stacked layout into the two-column "Warmth" design variant (variant-3b-warmth.html). This involves changes to layout structure, component design, color palette, typography, and several new UI elements.

## Locked Decisions (2026-02-11)

1. **Scope lock (main UI only):** This refactor only changes the public Dreamboard main content surface (`src/app/(guest)/[slug]/page.tsx` and Dreamboard-specific components). Shared app shell components (`src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`) are frozen in this phase.
2. **Location contract freeze:** The details card always renders location as **"Shared after you chip in"**. No schema/query/view-model/backend additions for location in this phase.
3. **State communication lock:** UX can change visually, but user-facing state meaning must stay explicit and deterministic across active/funded/closed/expired states.
4. **Strict verification required:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are required before handoff.
5. **Design baseline required:** A canonical reference artifact must be checked into the repo before implementation is considered complete.
6. **Footer ownership lock:** Shared layout footer remains canonical; page-local footer inside `src/app/(guest)/[slug]/page.tsx` is removed to avoid duplicate/competing footer surfaces.

---

## Current State vs Target Design

### Current
- **Layout:** Single-column, vertically stacked sections (`space-y-6`)
- **Hero:** Full-width green gradient banner with large 120px avatar, child name in large serif font, age line, party date
- **Gift:** Small card with 64/80px icon thumbnail + text beside it
- **Status badge:** Centered emoji + headline + time-remaining text
- **Contributors:** Plain text list of names
- **CTA:** Simple outlined button with PayFast note
- **Footer:** Inline links (Home / Need help?)

### Target (variant-3b-warmth)
- **Layout:** Two-column CSS Grid (1fr 1fr) at max-width 1000px, collapses to single column below 840px
- **Hero strip:** Compact full-width bar with 76px avatar + serif heading ("Max's Dreamboard") + age line
- **Left column — Gift Card:** Large card with purple gradient header containing a big emoji, gift name, eyebrow label, and a warm "message from child" box
- **Right column — Action Column (sticky):** CTA card (heading + subtitle + full-width sage-green button), Supporters card (circle avatar group), Details card (party date + location rows with icons)
- **Color palette:** Sage green, amber, plum — replacing teal/orange
- **Typography:** DM Sans (body) + Libre Baskerville (serif headings) — replacing Outfit/Fraunces
- **Nav/Footer shell:** Unchanged in this phase (frozen scope)

---

## Implementation Plan

### Phase 0: Reference Baseline (required)

Before implementation, check in the design reference artifact used for parity decisions.

**Files:**
- `docs/implementation-docs/references/dreamboard-warmth/variant-3b-warmth.html` (source HTML reference)
- `docs/implementation-docs/references/dreamboard-warmth/README.md` (source provenance + capture date)

**Acceptance criteria:**
- The reference artifact exists in-repo and is versioned.
- Reviewers can compare implementation against a fixed artifact, not an external/untracked file.

---

### Phase 1: Design Tokens & Typography

**Files to modify:**
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`

**Changes:**

1. **Add new fonts** to `layout.tsx`: Import `Libre_Baskerville` from `next/font/google` alongside the existing `DM_Sans`. Add CSS variables `--font-serif` and `--font-sans-new` (or repurpose existing `--font-dm-sans`).

2. **Extend Tailwind color palette** in `tailwind.config.ts`:
   ```
   sage:      { DEFAULT: '#4A7E66', deep: '#3B6B55', light: '#E9F3ED', wash: '#F1F7F4' }
   amber:     { DEFAULT: '#C49A5C', light: '#F7EFE2', glow: '#EBDCC8' }
   plum:      { DEFAULT: '#7E6B9B', wash: '#F1EDF7', soft: '#E4DDF0' }
   ink:       { DEFAULT: '#2C2520', mid: '#5C544C', soft: '#8A827A', faint: '#B5AEA5', ghost: '#D1CBC3' }
   ```
   Also add new background/border tokens:
   ```
   bg-warmth:       '#FBF8F3'
   border-warmth:   '#EDE7DE'
   border-soft:     '#F5F1EA'
   ```

3. **Add new font family entries** to Tailwind:
   ```
   serif: ['var(--font-serif)', 'Georgia', 'serif']   // Libre Baskerville
   sans:  ['var(--font-dm-sans)', '-apple-system', 'sans-serif']  // DM Sans
   ```

4. **Add new shadow and border-radius tokens**:
   ```
   shadow-card: '0 1px 2px rgba(44,37,32,0.03), 0 4px 12px rgba(44,37,32,0.04), 0 12px 36px rgba(44,37,32,0.04)'
   radius-lg: 28px (Tailwind: rounded-[28px])
   radius-md: 20px (Tailwind: rounded-[20px])
   radius-sm: 14px (Tailwind: rounded-[14px])
   ```

5. **Update CSS variables** in `globals.css` to add the new warmth palette as CSS custom properties, keeping existing variables intact for other pages.

---

### Phase 2: Layout Restructure — Page Component

**File to modify:**
- `src/app/(guest)/[slug]/page.tsx`

**Changes:**

1. **Replace the single-column layout** with a new structure:
   ```
   <HeroStrip />           ← Full-width compact bar
   <div class="dreamboard"> ← Two-column grid
     <GiftCard />           ← Left column
     <ActionColumn />       ← Right column (sticky)
   </div>
   ```

2. **Refactor `HeaderSection`** → **`HeroStrip`**: Compact horizontal bar with:
   - Subtle sage-wash gradient background + bottom border
   - 76px avatar (down from 120px) with sage-tinted ring shadow
   - Serif heading: `<em>Max's</em> Dreamboard` (italic child name in sage color)
   - Smaller 13.5px age line below

3. **Create `GiftCard` section** (left column): A single card containing:
   - **Gift image area:** Large purple-gradient header with centered gift emoji (76px)
   - **Gift body:** Eyebrow label ("✦ MAX'S ONE BIG WISH"), gift name in serif font (28px)
   - **Child message box:** Amber background block with chat icon, italic heading ("A message from Max:"), and the `view.message` text. Only shown when `view.message` is not null.

4. **Create `ActionColumn` section** (right column, `position: sticky; top: 32px`):
   - **CTA Card:** Centered heading ("Help make this wish come true"), subtitle, full-width sage-green button ("Chip in for Max 💝"), secure payment note with lock icon
   - **Supporters Card:** Label ("Friends and family chipping in"), circle avatar group showing contributor initials or empty placeholder circles with a "+" invite circle, message text
   - **Details Card:** Two rows with icons — Birthday Party date/time, and Location fixed to "Shared after you chip in"

5. **Remove page-local footer from `page.tsx`** and rely on the shared layout footer to avoid duplicate footer surfaces.

6. **Preserve existing logic contracts**: Data fetching, host-viewing-own-board detection, and contribution status logic remain unchanged. Visual/layout changes must preserve state semantics via the locked matrix below.

#### Locked State Matrix (must preserve meaning)

| Board state | Primary message intent | CTA behavior |
|-------------|------------------------|--------------|
| `active` with no contributors | invite first contribution | enabled |
| `active` with contributors | social proof + urgency/timing | enabled |
| `funded` | celebrate funded status while allowing further contributions | enabled |
| `closed` or `expired` | board closed to new contributions | disabled |

---

### Phase 3: Component Updates

#### 3a. New Component: `HeroStrip`
**File:** `src/app/(guest)/[slug]/page.tsx` (inline, or extracted to `src/components/dream-board/HeroStrip.tsx`)

- Accepts: `view: GuestViewModel`, `ageLine: string`
- Renders: Full-width sage gradient strip → inner container (max-w 1000px) → avatar + text
- Avatar: 76px circle with sage ring shadow
- Text: Serif h1 with italic child name in sage, age line in muted text

#### 3b. New Component: `GiftCard`
**File:** `src/app/(guest)/[slug]/page.tsx` (inline, or extracted)

- Accepts: `view: GuestViewModel`
- Renders: White card with rounded-[28px], shadow-card
- Gift image section: Purple gradient background, large emoji centered
- Gift body: Eyebrow, title, optional child message block
- Child message: Only shown if `view.message` exists; amber background with chat bubble icon

#### 3c. New Component: `CTACard`
**File:** `src/app/(guest)/[slug]/page.tsx` (inline, or extracted)

- Accepts: `slug: string`, `childName: string`, `disabled: boolean`
- Replaces current `GuestContributionBanner`
- Renders: White card with heading, subtitle, full-width sage button (links to `/${slug}/contribute`), secure payment note
- When disabled: Shows "This Dreamboard is closed" message instead

#### 3d. Refactored Component: `ContributorDisplay` → `SupportersCard`
**File:** `src/components/dream-board/ContributorDisplay.tsx`

- **Zero contributors:** Show placeholder circle avatars (2 empty + 1 invite/plus circle) with message "Be the first to contribute and start the celebration"
- **With contributors:** Show filled circle avatars with initials (styled like the design's overlapping circles with -8px margin-left), overflow indicator, and summary text
- Label: "FRIENDS AND FAMILY CHIPPING IN" (uppercase, small, faint)
- Circle styling: 40px circles, 2.5px white border, overlapping

#### 3e. New Component: `DetailsCard`
**File:** `src/app/(guest)/[slug]/page.tsx` (inline, or extracted)

- Accepts: `partyDateTimeLine: string | null`
- Renders: White card with icon rows
- Row 1: Calendar icon + "Birthday Party" label + formatted date/time
- Row 2: Map pin icon + "Location" label + "Shared after you chip in" (always in this phase)
- Row divider: soft border between rows

#### 3f. Existing Components — Adjustments

- **`DreamboardStatusBadge`**: This component's status/urgency information will be absorbed into the new layout (the CTA card subtitle can reflect urgency, and the supporters card handles the "be the first" messaging). The standalone badge section is **removed from the page** but the component file is kept for potential reuse elsewhere.

- **`CharitableGivingCard`**: Kept as-is in terms of logic, but its visual styling will be updated to use the new warmth palette (sage green tones instead of teal). Its position moves inside the left column, below the gift card, if charity is enabled.

- **`ParentBanner`**: Styling updated to warmth palette but otherwise unchanged.

---

### Phase 4: Header & Footer Updates

**Status:** Frozen for this phase.

No modifications to:
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/(guest)/layout.tsx`
- `src/app/(host)/layout.tsx`

Rationale: keep blast radius constrained to the Dreamboard content surface while still achieving the main UI redesign.

---

### Phase 5: Responsive Behavior

**Breakpoint:** 840px (matching the target design)

- **Above 840px:** Two-column grid, sticky right column
- **Below 840px:** Single-column stack, max-width 520px centered, action column loses sticky positioning
- **Hero strip:** Reduced padding on mobile (24px 32px)
- **Gift card emoji section:** Slightly reduced padding on mobile
- **Shell:** Existing header/footer/nav behavior remains unchanged

---

### Phase 6: SVG Icons

The target design uses inline SVG icons (Feather-style) in several places:
- Chat bubble icon in child message box
- Lock icon in secure payment note
- User silhouette icons in empty supporter circles
- Plus icon in invite circle
- Calendar icon in details card
- Map pin icon in details card

**Approach:** Create a small set of icon components or inline the SVGs directly in the JSX, matching the exact paths from the HTML reference. These are lightweight and don't warrant an icon library dependency.

**File:** `src/components/icons/dreamboard-icons.tsx` (new file for these specific SVGs)

---

### Phase 7: Testing & Verification

1. **Static quality gates (required):**
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
2. **Visual verification:** Compare against the in-repo reference artifact in `docs/implementation-docs/references/dreamboard-warmth/`
3. **Responsive check:** Verify the 840px breakpoint transition
4. **Data edge cases:**
   - Board with no child photo (initials fallback)
   - Board with no message (child message box hidden)
   - Board with 0 contributors (empty state)
   - Board with 1-6 contributors (circle avatars)
   - Board with 7+ contributors (overflow count)
   - Expired/closed board (disabled CTA)
   - Funded board (celebration copy/state still clear)
   - Board with charity enabled (charity card appears)
   - Host viewing own board (parent banner instead of CTA)
5. **State matrix verification:** Confirm all four locked states render the expected message intent + CTA behavior
6. **A11y smoke check:** Validate keyboard reachability + visible focus + semantic heading order for the redesigned page

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `tailwind.config.ts` | Modify | Add sage/amber/plum/ink colors, shadow-card, new font families |
| `src/app/globals.css` | Modify | Add warmth CSS variables, new font references |
| `src/app/layout.tsx` | Modify | Import Libre Baskerville font |
| `src/app/(guest)/[slug]/page.tsx` | **Major rewrite** | Two-column grid, HeroStrip, GiftCard, ActionColumn, CTACard, DetailsCard |
| `src/components/dream-board/ContributorDisplay.tsx` | **Major rewrite** | Circle avatar group style, new empty/populated states |
| `src/components/dream-board/CharitableGivingCard.tsx` | Modify | Update colors to warmth palette |
| `src/components/icons/dreamboard-icons.tsx` | **New file** | SVG icon components (chat, lock, user, plus, calendar, map-pin) |
| `docs/implementation-docs/references/dreamboard-warmth/variant-3b-warmth.html` | **New file** | Canonical visual baseline for parity review |

---

## Resolved Design Decisions

1. **Header/Footer:** unchanged in this phase.
2. **Component extraction:** extract new sections into `src/components/dream-board/` for maintainability.
3. **Font strategy:** keep existing global fonts; add Libre Baskerville usage for this surface only.
4. **Charity card placement:** render below gift card in left column when charity is enabled.
5. **Child message block:** hide entirely when `view.message` is null.
6. **Location row:** always show "Shared after you chip in" (no backend expansion).

---

## Execution Order

1. Phase 0 — Reference baseline (artifact lock)
2. Phase 1 — Design tokens & typography (foundation)
3. Phase 6 — SVG icons (needed by other phases)
4. Phase 2 — Page layout restructure (core change)
5. Phase 3 — Component updates (fills in the new layout)
6. Phase 4 — Header/footer freeze confirmation (no-op check)
7. Phase 5 — Responsive behavior (refinement)
8. Phase 7 — Testing & verification (strict validation)

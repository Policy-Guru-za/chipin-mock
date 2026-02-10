# Icon Library Refactor — Implementation Plan

## Purpose

Replace the Gemini Flash AI image generation system with a curated, static icon library for dreamboard gift imagery. This eliminates a third-party API dependency, removes the most fragile step in the dreamboard creation flow, and delivers a more consistent, premium visual experience.

This document is the single authoritative source for you, the implementing agent. Execute sequentially unless explicitly marked as parallelisable. Utilise multiple sub-agents acting in parallel wherever possible and more optimal.

## v2 Lock Amendments (2026-02-09)

- `giftIconId` is the trusted server input for creation. Do not trust client-provided `giftImageUrl`.
- API responses continue to return absolute `gift_image_url` values.
- Dynamic OG generation ships in this refactor and must be publicly accessible.
- Legacy non-icon imagery has no compatibility guarantees.

---

## Table of Contents

1. [Scope & Motivation](#1-scope--motivation)
2. [Decision Register](#2-decision-register)
3. [Icon Library — Asset Design & Creation](#3-icon-library--asset-design--creation)
4. [Icon Registry Module](#4-icon-registry-module)
5. [Age-Aware Smart Default Selection](#5-age-aware-smart-default-selection)
6. [Database Schema Migration](#6-database-schema-migration)
7. [Draft Persistence Changes](#7-draft-persistence-changes)
8. [Icon Picker Component](#8-icon-picker-component)
9. [Gift Creation Page Refactor](#9-gift-creation-page-refactor)
10. [Review Page Changes](#10-review-page-changes)
11. [Guest-Facing Dreamboard Page Changes](#11-guest-facing-dreamboard-page-changes)
12. [Dashboard & Admin View Changes](#12-dashboard--admin-view-changes)
13. [API Contract Changes](#13-api-contract-changes)
14. [OG Image Generation with @vercel/og](#14-og-image-generation-with-vercellog)
15. [Metadata Changes](#15-metadata-changes)
16. [View Model & Gift Info Changes](#16-view-model--gift-info-changes)
17. [Code Removal — Gemini Integration](#17-code-removal--gemini-integration)
18. [File-by-File Change Manifest](#18-file-by-file-change-manifest)
19. [Testing Strategy](#19-testing-strategy)
20. [Verification Checklist](#20-verification-checklist)

---

## 1. Scope & Motivation

### What is being replaced

The current system uses the Google Gemini 2.5 Flash Image model to generate whimsical watercolour-style artwork from a gift description string. This introduces:

- A mandatory third-party API call during creation (10+ second latency)
- Rate limiting (5 generations/hour per host, Redis-backed)
- Retry logic with exponential backoff (3 attempts)
- Vercel Blob upload as an additional storage dependency
- A hard validation gate — the user cannot proceed without a successful generation
- An environment variable dependency (`GEMINI_API_KEY`)

### What replaces it

A curated library of **60** pre-designed icon assets stored as static PNGs in `/public/icons/gifts/`. Each icon is a 3D-rendered, emoji-style illustration (sourced from Microsoft Fluent Emoji 3D, MIT licensed) on a harmonised pastel background, pre-composed at 2x resolution (320×320px) for retina displays. The library is organised into 6 gender-neutral categories (30 icons) plus 15 boy-centric and 15 girl-centric icons for comprehensive coverage. Users select an icon during creation via an inline picker component. An age-aware keyword-matching function pre-selects the most relevant icon as a smart default.

**Status: All 60 icon PNG assets have been created** and are present in `/public/icons/gifts/`. The implementing agent does NOT need to create these — they are ready to use.

### Backwards compatibility

Per product decision: **not required**. No migration of existing `giftImageUrl` data. The `giftImageUrl` and `giftImagePrompt` columns will be repurposed. Existing dreamboards that reference Vercel Blob URLs will break — this is accepted.

---

## 2. Decision Register

| ID | Decision | Rationale |
|---|---|---|
| ICON-01 | Replace Gemini AI generation with static icon library | Eliminates complexity, latency, and failure points from creation flow |
| ICON-02 | Icons stored as static PNGs in `/public/icons/gifts/` | Zero-latency serving via CDN, no Vercel Blob dependency |
| ICON-03 | 320×320px @2x resolution, pre-composed with pastel background | Crisp on retina at 80px–160px render size, no runtime composition needed |
| ICON-04 | Repurpose `giftImageUrl` column (store icon path, not Blob URL) | Avoids schema migration; column purpose changes from external URL to static asset path |
| ICON-05 | `giftImagePrompt` column becomes nullable/unused for new boards | Will store `null` for new icon-based boards. Column retained to avoid schema change. |
| ICON-06 | No backwards compatibility for existing boards | Product decision — accepted breakage for existing Vercel Blob image URLs |
| ICON-07 | Inline icon picker (not modal) | Keeps creation flow lightweight and single-step |
| ICON-08 | Age-aware smart default selection | Factors child age into keyword matching for better defaults |
| ICON-09 | @vercel/og for OG images | Runtime edge generation compositing child photo + icon + name for social sharing |
| ICON-10 | 60 icons across 6 categories + boy/girl-centric sets | Comprehensive coverage — 30 gender-neutral + 15 boy-centric + 15 girl-centric |
| ICON-11 | Icons sourced from Microsoft Fluent Emoji 3D (MIT licensed) | High-quality, consistent 3D style; legally clear for commercial use |

---

## 3. Icon Library — Asset Design & Creation

### 3.1 Categories & Icons

Each icon must be designed as a **3D-rendered, emoji-style illustration** centred on a **soft pastel background square** with generous padding. The visual style must match the pink bow icon shown in the design mockups — warm, rounded, slightly glossy, child-friendly.

### Gender-Neutral Icons (30)

**Category 1: Active & Outdoors** (background tint: `#E8F0E4` — soft sage green)

| Icon ID | Subject | Filename | Fluent Emoji Source |
|---|---|---|---|
| `bicycle` | Child's bicycle | `bicycle.png` | Bicycle |
| `scooter` | Kick scooter | `scooter.png` | Kick scooter |
| `soccer-ball` | Soccer ball | `soccer-ball.png` | Soccer ball |
| `skateboard` | Skateboard | `skateboard.png` | Skateboard |
| `swimming` | Swimming goggles | `swimming.png` | Goggles |

**Category 2: Creative & Performing Arts** (background tint: `#F8E8EE` — soft rose)

| Icon ID | Subject | Filename | Fluent Emoji Source |
|---|---|---|---|
| `ballet` | Ballet shoes with ribbon bow | `ballet.png` | Ballet shoes |
| `paint-palette` | Artist's paint palette | `paint-palette.png` | Artist palette |
| `guitar` | Acoustic guitar | `guitar.png` | Guitar |
| `microphone` | Microphone with sparkles | `microphone.png` | Microphone |
| `camera` | Camera | `camera.png` | Camera |

**Category 3: Learning & Discovery** (background tint: `#E8EAF6` — soft lavender)

| Icon ID | Subject | Filename | Fluent Emoji Source |
|---|---|---|---|
| `books` | Stack of colourful books | `books.png` | Books |
| `telescope` | Telescope | `telescope.png` | Telescope |
| `microscope` | Microscope | `microscope.png` | Microscope |
| `building-blocks` | Colourful building blocks | `building-blocks.png` | Brick |
| `globe` | Globe | `globe.png` | Globe showing americas |

**Category 4: Imaginative Play** (background tint: `#FFF3E0` — soft peach)

| Icon ID | Subject | Filename | Fluent Emoji Source |
|---|---|---|---|
| `teddy-bear` | Teddy bear | `teddy-bear.png` | Teddy bear |
| `dollhouse` | Dollhouse | `dollhouse.png` | House with garden |
| `superhero-cape` | Superhero cape | `superhero-cape.png` | Person superhero (Default) |
| `castle` | Toy castle | `castle.png` | Castle |
| `pirate-ship` | Pirate ship toy | `pirate-ship.png` | Sailboat |

**Category 5: Tech & Gaming** (background tint: `#E0F2F1` — soft teal)

| Icon ID | Subject | Filename | Fluent Emoji Source |
|---|---|---|---|
| `tablet` | Tablet / laptop device | `tablet.png` | Laptop |
| `game-controller` | Game controller | `game-controller.png` | Video game |
| `headphones` | Headphones | `headphones.png` | Headphone |
| `robot` | Toy robot | `robot.png` | Robot |
| `drone` | Small drone | `drone.png` | Helicopter |

**Category 6: Experiences** (background tint: `#FFF9E6` — soft buttercream)

| Icon ID | Subject | Filename | Fluent Emoji Source |
|---|---|---|---|
| `amusement-park` | Ferris wheel / amusement park | `amusement-park.png` | Ferris wheel |
| `camping` | Camping tent | `camping.png` | Camping |
| `plane-ticket` | Aeroplane | `plane-ticket.png` | Airplane |
| `zoo` | Zoo animals (lion) | `zoo.png` | Lion |
| `movie` | Movie clapperboard | `movie.png` | Clapper board |

### Boy-Centric Icons (15)

These use the same category background tints as the gender-neutral icons, assigned by best-fit category.

| Icon ID | Subject | Filename | Fluent Emoji Source | Background |
|---|---|---|---|---|
| `dinosaur` | T-Rex dinosaur | `dinosaur.png` | T-rex | `#E8F0E4` |
| `race-car` | Racing car | `race-car.png` | Racing car | `#E8F0E4` |
| `rocket` | Rocket ship | `rocket.png` | Rocket | `#E8EAF6` |
| `basketball` | Basketball | `basketball.png` | Basketball | `#E8F0E4` |
| `train` | Toy train / locomotive | `train.png` | Locomotive | `#FFF3E0` |
| `fishing` | Fishing rod | `fishing.png` | Fishing pole | `#E8F0E4` |
| `trophy` | Trophy / sports award | `trophy.png` | Trophy | `#FFF9E6` |
| `toolbox` | Tool set / building kit | `toolbox.png` | Toolbox | `#E8EAF6` |
| `cricket` | Cricket bat & ball | `cricket.png` | Cricket game | `#E8F0E4` |
| `rugby` | Rugby ball | `rugby.png` | Rugby football | `#E8F0E4` |
| `bow-and-arrow` | Bow and arrow / archery set | `bow-and-arrow.png` | Bow and arrow | `#E8F0E4` |
| `martial-arts` | Martial arts uniform | `martial-arts.png` | Martial arts uniform | `#E8F0E4` |
| `detective` | Spy / detective kit | `detective.png` | Detective (Default) | `#FFF3E0` |
| `compass` | Compass / explorer gear | `compass.png` | Compass | `#FFF9E6` |
| `joystick` | Retro joystick / arcade | `joystick.png` | Joystick | `#E0F2F1` |

### Girl-Centric Icons (15)

| Icon ID | Subject | Filename | Fluent Emoji Source | Background |
|---|---|---|---|---|
| `princess-crown` | Tiara / princess crown | `princess-crown.png` | Crown | `#FFF3E0` |
| `unicorn` | Unicorn toy | `unicorn.png` | Unicorn | `#FFF3E0` |
| `nail-polish` | Nail polish / beauty set | `nail-polish.png` | Nail polish (Default) | `#F8E8EE` |
| `butterfly` | Butterfly wings / costume | `butterfly.png` | Butterfly | `#F8E8EE` |
| `ribbon` | Hair ribbons / accessories | `ribbon.png` | Ribbon | `#F8E8EE` |
| `fairy` | Fairy costume / wand | `fairy.png` | Woman fairy (Default) | `#FFF3E0` |
| `ice-skates` | Ice skating shoes | `ice-skates.png` | Ice skate | `#E8F0E4` |
| `dress` | Dress / fashion outfit | `dress.png` | Dress | `#F8E8EE` |
| `rainbow` | Rainbow toy / decor | `rainbow.png` | Rainbow | `#FFF3E0` |
| `mermaid` | Mermaid costume / toy | `mermaid.png` | Person merpeople (Default) | `#E8EAF6` |
| `lipstick` | Play makeup set | `lipstick.png` | Lipstick | `#F8E8EE` |
| `handbag` | Fashion handbag | `handbag.png` | Handbag | `#FFF9E6` |
| `flower` | Flower bouquet / garden set | `flower.png` | Bouquet | `#FFF9E6` |
| `crystal-ball` | Crystal ball / jewellery kit | `crystal-ball.png` | Crystal ball | `#E8EAF6` |
| `cupcake` | Baking set / cupcake kit | `cupcake.png` | Cupcake | `#FFF9E6` |

**Total: 60 icons** (30 gender-neutral + 15 boy-centric + 15 girl-centric).

### 3.2 Asset Specifications

| Property | Value |
|---|---|
| Dimensions | 320 × 320 px (renders at 160×160 CSS px @2x) |
| Format | PNG-24 with alpha channel |
| Background | Rounded-rectangle (corner radius ~40px at 320px) filled with category tint colour |
| Icon area | Centred, occupying ~60–70% of the canvas |
| Style | 3D emoji-style, warm colours, slightly glossy, child-friendly |
| File size target | < 30 KB per icon (optimised with pngquant or similar) |
| Location | `/public/icons/gifts/{icon-id}.png` |

### 3.3 Asset Creation — COMPLETED

**All 60 icon PNG files have already been created** and are present in `/public/icons/gifts/`. The implementing agent does NOT need to create or modify these assets.

**Source**: Microsoft Fluent Emoji 3D (MIT licensed), composited onto category-coloured pastel rounded-rectangle backgrounds using a Python/Pillow pipeline. Oversized files were optimised with Pillow FASTOCTREE quantization. The generation script is at `scripts/generate-gift-icons.py` for reference.

**Verified statistics**:
- 60 files, all 320×320px
- All under 30KB (largest: 29.6KB, average: 13.7KB)
- Total library size: 824KB

**Optional further optimisation**: Run `pngquant` locally for an additional compression pass:

```bash
for f in public/icons/gifts/*.png; do pngquant --quality=65-80 --strip --force --ext .png "$f"; done
```

---

## 4. Icon Registry Module

Create a new TypeScript module that serves as the single source of truth for the icon library.

### File: `src/lib/icons/gift-icons.ts`

```typescript
/**
 * All 60 icons (including boy-centric and girl-centric) use these same
 * 6 category values, assigned by best-fit. There are no separate "boy"
 * or "girl" categories — gendered icons are slotted into the category
 * that matches their subject (e.g. `dinosaur` → 'active-outdoors',
 * `princess-crown` → 'imaginative-play').
 */
export type GiftIconCategory =
  | 'active-outdoors'
  | 'creative-arts'
  | 'learning-discovery'
  | 'imaginative-play'
  | 'tech-gaming'
  | 'experiences';

export type GiftIcon = {
  id: string;
  label: string;
  category: GiftIconCategory;
  src: string;           // e.g. '/icons/gifts/ballet.png'
  bgColor: string;       // e.g. '#F8E8EE'
  keywords: string[];    // for smart default matching
  ageRange: [number, number]; // inclusive [min, max] age affinity
};

export type GiftIconCategoryMeta = {
  id: GiftIconCategory;
  label: string;
  bgColor: string;
};
```

Define the full registry as a `const` array of all **60** `GiftIcon` objects (30 gender-neutral + 15 boy-centric + 15 girl-centric). Export helper functions:

```typescript
export const GIFT_ICONS: readonly GiftIcon[];
export const GIFT_ICON_CATEGORIES: readonly GiftIconCategoryMeta[];

/** Look up a single icon by ID. Returns undefined if not found. */
export const getGiftIconById: (id: string) => GiftIcon | undefined;

/** Get all icons in a category. */
export const getIconsByCategory: (category: GiftIconCategory) => GiftIcon[];

/** Validate that a string is a known icon ID. */
export const isValidGiftIconId: (id: string) => boolean;
```

### Icon Data Example

```typescript
{
  id: 'ballet',
  label: 'Ballet',
  category: 'creative-arts',
  src: '/icons/gifts/ballet.png',
  bgColor: '#F8E8EE',
  keywords: ['ballet', 'dance', 'tutu', 'shoes', 'ballerina', 'leotard', 'pointe'],
  ageRange: [3, 12],
}
```

### Keywords Specification

Each icon MUST have a comprehensive keyword list (8–15 keywords) covering:
- Direct nouns (e.g., `bicycle`, `bike`, `cycle`)
- Related activities (e.g., `riding`, `cycling`, `pedal`)
- Common gift names parents might type (e.g., `BMX`, `mountain bike`, `balance bike`)
- Brand-agnostic descriptors (e.g., `two wheels`, `outdoor`)

The keywords are critical for smart default matching (Section 5). Invest time in making these thorough.

---

## 5. Age-Aware Smart Default Selection

### File: `src/lib/icons/suggest-icon.ts`

Implement a function that suggests the best-matching icon based on gift name, gift description, and child age.

```typescript
export function suggestGiftIcon(params: {
  giftName: string;
  giftDescription?: string;
  childAge?: number;
}): GiftIcon;
```

### Algorithm

1. **Tokenise** the combined `giftName + ' ' + (giftDescription ?? '')` string. Lowercase, split on non-alphanumeric characters, deduplicate.

2. **Score each icon** by counting keyword matches against the token set. Each match = +1 point.

3. **Apply age affinity bonus**. If `childAge` is provided and falls within the icon's `ageRange`, add +0.5 points. If `childAge` is outside the range by more than 3 years, subtract 0.3 points.

4. **Return the icon with the highest score.** If all scores are 0 (no keyword matches), fall back to a sensible default icon:
   - Ages 1–4: `teddy-bear`
   - Ages 5–8: `building-blocks`
   - Ages 9–12: `game-controller`
   - Ages 13–18: `headphones`
   - No age provided: `teddy-bear`

5. **Tie-breaking**: If multiple icons tie on score, prefer the one whose `ageRange` midpoint is closest to `childAge`. If still tied, prefer the first in registry order.

### Usage

This function is called client-side in the icon picker component. When the user types a gift name or description, a debounced call (300ms) to `suggestGiftIcon()` updates the pre-selected icon. The user can always override the suggestion manually.

---

## 6. Database Schema Migration

### Strategy: Repurpose existing columns

Since backwards compatibility is not required, we repurpose the existing columns rather than adding new ones:

| Column | Current use | New use |
|---|---|---|
| `giftImageUrl` (text, NOT NULL) | Vercel Blob URL | Static icon path (e.g. `/icons/gifts/ballet.png`) |
| `giftImagePrompt` (text, nullable) | Gemini prompt string | `NULL` for all new boards (column unused but retained) |

### Migration Required

**No DDL migration is needed.** The column types and constraints remain identical. The `giftImageUrl` column is `text NOT NULL`, and icon paths like `/icons/gifts/ballet.png` are valid text values. The `giftImageUrl` column currently has no CHECK constraint limiting it to URLs.

### Drizzle Schema Update

**File: `src/lib/db/schema.ts`**

Update the comments only (no structural changes):

```typescript
// Lines 133-137: Update comments
// v4.0: Static gift icon (replaces AI artwork)
giftName: varchar('gift_name', { length: 200 }).notNull(),
giftDescription: text('gift_description'),
giftImageUrl: text('gift_image_url').notNull(), // Static icon path, e.g. '/icons/gifts/ballet.png'
giftImagePrompt: text('gift_image_prompt'),      // Deprecated — NULL for new boards
```

---

## 7. Draft Persistence Changes

### File: `src/lib/dream-boards/draft.ts`

Update the `DreamBoardDraftInput` and `DreamBoardDraft` types:

**Replace** `giftImageUrl` and `giftImagePrompt` fields:

```typescript
// Before:
giftImageUrl?: string;
giftImagePrompt?: string;

// After:
giftIconId?: string;        // Selected icon ID from the registry (e.g. 'ballet')
giftImageUrl?: string;      // Resolved icon path — set from giftIconId before submission
giftImagePrompt?: string;   // Deprecated — always undefined for new drafts
```

The `giftIconId` field is the user's selection. The `giftImageUrl` is derived from it (via `getGiftIconById(id).src`) at submission time. This way the draft stores the semantic selection (icon ID) while the database receives the resolved path.

### File: `src/lib/dream-boards/schema.ts`

Update the `dreamBoardDraftSchema`:

```typescript
// Replace:
giftImageUrl: z.string().url(),
giftImagePrompt: z.string().min(1).optional(),

// With:
giftImageUrl: z.string().min(1),  // Now a static path, not a URL — remove .url() validator
giftImagePrompt: z.string().optional(), // Deprecated, allow empty/undefined
```

Note: The `.url()` validator must be removed because icon paths like `/icons/gifts/ballet.png` are relative paths, not full URLs. Use `.min(1)` to ensure it's not empty.

---

## 8. Icon Picker Component

### File: `src/components/gift/GiftIconPicker.tsx` (NEW)

A client component that replaces `GiftArtworkGenerator`. Design requirements:

#### Layout

- **Inline grid** within the form (not a modal or drawer)
- **Category section headers** as subtle, uppercase labels (matching the existing `text-[11px] font-semibold uppercase tracking-[0.1em]` style used elsewhere)
- **5 columns** on mobile, **6–8 columns** on desktop (`grid-cols-5 sm:grid-cols-6 md:grid-cols-8`)
- Each icon cell: **56×56px** on mobile, **64×64px** on desktop (slightly smaller than original spec to accommodate 60 icons comfortably)
- **Max height with scroll**: Wrap the grid in a container with `max-h-[400px] overflow-y-auto` to prevent the picker from dominating the form. Add a subtle `shadow-inner` at top/bottom edges to hint at scrollability.

#### Icon Organisation

All 60 icons are displayed in a **single grid grouped by the 6 categories**. Boy-centric and girl-centric icons are slotted into their best-fit category alongside the gender-neutral icons — there are no separate "boy" or "girl" sections. For example, the "Active & Outdoors" category shows: bicycle, scooter, soccer-ball, skateboard, swimming, dinosaur, race-car, basketball, fishing, cricket, rugby, bow-and-arrow, martial-arts, ice-skates.

This approach avoids any awkward gendered grouping in the UI. The smart default (Section 5) handles surfacing the most relevant icon based on the gift description and child age.

#### Selection UX

- Selected icon: `ring-2 ring-primary ring-offset-2` highlight
- Unselected icons: `opacity-70 hover:opacity-100` transition
- On selection, a subtle scale animation (`scale-105` for 150ms)
- Below the grid, show the **selected icon name** as confirmation text: `"Selected: Ballet"` in `text-sm text-text-muted`

#### Props

```typescript
type GiftIconPickerProps = {
  selectedIconId: string;
  onSelect: (iconId: string) => void;
};
```

#### Hidden Form Fields

The component must render hidden inputs for form submission:

```html
<input type="hidden" name="giftIconId" value={selectedIconId} />
<input type="hidden" name="giftImageUrl" value={resolvedIconSrc} />
```

Where `resolvedIconSrc` is derived from `getGiftIconById(selectedIconId)?.src`.

#### Accessibility

- Each icon button: `role="radio"`, `aria-checked`, `aria-label="{icon.label}"`
- The grid container: `role="radiogroup"`, `aria-label="Choose a gift icon"`
- Keyboard navigation: arrow keys move between icons, Enter/Space selects

---

## 9. Gift Creation Page Refactor

### File: `src/app/(host)/create/gift/page.tsx`

#### Remove

- `GiftArtworkGenerator` component import and usage
- The artwork generation error messages (`'artwork'` error case)
- The `giftImagePrompt` hidden field requirement

#### Add

- `GiftIconPicker` component import
- Smart default integration: on page load, call `suggestGiftIcon()` with existing draft data to pre-select an icon

#### Updated Form Flow

1. User enters **Gift name** (unchanged)
2. User enters **Gift description** (unchanged — keep the textarea, but update helper text)
   - Old helper text: `"We'll use this to generate playful artwork."`
   - New helper text: `"Describe the gift so contributors know what they're chipping in for."`
3. **Icon picker grid** appears below description (replaces `GiftArtworkGenerator`)
   - Pre-selects a smart default based on gift name + description + child age from draft
   - User can tap a different icon to override
4. User enters **Goal amount** (unchanged)
5. **Continue** button submits

#### Updated Server Action: `saveManualGiftAction`

```typescript
// Remove:
if (!giftImageUrl || !giftImagePrompt) {
  redirect('/create/gift?error=artwork');
}

// Replace validation schema:
const manualGiftSchema = z.object({
  giftName: z.string().min(2).max(200),
  giftDescription: z.string().max(500).optional(), // Description now optional, min removed
  giftIconId: z.string().min(1),                   // NEW: icon ID
  giftImageUrl: z.string().min(1),                 // Resolved icon path
  goalAmount: z.coerce.number().int().min(20),
});
```

**Important change**: `giftDescription` is no longer required with a 10-char minimum. It was previously mandatory because it was the input to the AI image generation prompt. With icons, the description is purely informational for contributors. Make it optional (but keep the textarea visible and encouraged via placeholder text).

#### Updated Draft Persistence

After validation, save to draft:

```typescript
await updateDreamBoardDraft(session.hostId, {
  giftName: result.data.giftName.trim(),
  giftDescription: result.data.giftDescription?.trim() ?? undefined,
  giftIconId: result.data.giftIconId,
  giftImageUrl: result.data.giftImageUrl,        // e.g. '/icons/gifts/ballet.png'
  giftImagePrompt: undefined,                      // Deprecated
  goalCents,
});
```

---

## 10. Review Page Changes

### File: `src/app/(host)/create/review/ReviewClient.tsx`

Update the `PreviewCard` component's gift image rendering:

```typescript
// Before: Full-width landscape image preview
<div className="overflow-hidden rounded-xl border border-border bg-white">
  <Image
    src={draft.giftImageUrl}
    alt={draft.giftName}
    width={900}
    height={600}
    className="h-44 w-full object-cover sm:h-56"
  />
</div>

// After: Square icon preview (matching the dreamboard's "One Big Wish" style)
<div className="flex items-center gap-4">
  <div className="relative h-16 w-16 overflow-hidden rounded-xl sm:h-20 sm:w-20">
    <Image
      src={draft.giftImageUrl}
      alt={draft.giftName}
      fill
      sizes="80px"
      className="object-cover"
    />
  </div>
  <div className="space-y-1">
    <p className="text-sm font-semibold text-text">{draft.giftName}</p>
    <p className="text-xs text-text-muted">Goal: {formatRand(draft.goalCents)}</p>
  </div>
</div>
```

This matches the final dreamboard layout so the review step is a true WYSIWYG preview.

### File: `src/app/(host)/create/review/page.tsx`

No changes to the `publishDreamBoardAction` server action — it already reads `giftImageUrl` from the draft schema and inserts it into the database. The only change is that the value is now an icon path instead of a Blob URL.

**However**, verify that `dreamBoardDraftSchema` validation passes with the updated schema from Section 7. The `giftImageUrl` field must accept relative paths (not just URLs).

### `ReviewDraftData` Type Update

In `ReviewClient.tsx`, update:

```typescript
type ReviewDraftData = {
  // ... existing fields ...
  giftImageUrl: string;   // Now an icon path, not a URL
  // Remove: giftImagePrompt is not passed to ReviewClient (it wasn't before either)
};
```

---

## 11. Guest-Facing Dreamboard Page Changes

### File: `src/app/(guest)/[slug]/page.tsx`

#### `OneWishSection` Component

The icon is now a static asset. Update the image rendering to use the icon's paired background colour for a polished look:

```typescript
function OneWishSection({ view }: { view: GuestViewModel }) {
  const description = view.giftSubtitle?.slice(0, 100) ?? '';
  const iconMeta = getGiftIconById(extractIconIdFromPath(view.giftImage));
  const bgColor = iconMeta?.bgColor ?? '#F5F5F5';

  return (
    <section className="rounded-2xl bg-[#FDF8F3] p-5 shadow-soft sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C4956A]">
        ✨ {view.childName.toUpperCase()}&apos;S ONE BIG WISH
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative h-16 w-16 overflow-hidden rounded-xl sm:h-20 sm:w-20"
          style={{ backgroundColor: bgColor }}
        >
          <Image
            src={view.giftImage}
            alt={view.giftTitle}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-[20px] font-bold text-gray-900">{view.giftTitle}</h2>
          <p className="text-sm text-gray-500">{description}</p>
          <p className="text-sm font-semibold text-gray-700">Goal: {formatZar(view.goalCents)}</p>
        </div>
      </div>
    </section>
  );
}
```

**Key changes:**
- Import `getGiftIconById` from the icon registry
- Add a utility `extractIconIdFromPath` (e.g., `/icons/gifts/ballet.png` → `ballet`) — implement in `src/lib/icons/gift-icons.ts`
- Apply the icon's `bgColor` as an inline style on the container `div`
- Change `rounded-lg` to `rounded-xl` for consistency with the mockup

#### Next.js Image Configuration

Since icons are now in `/public/`, they're served as local static assets. **No changes needed** to `next.config.js` `remotePatterns` — Next.js Image serves local `/public/` files natively.

---

## 12. Dashboard & Admin View Changes

### File: `src/components/dream-board/DreamBoardImage.tsx`

This component is used on dashboard cards. Update it to handle icon paths gracefully:

```typescript
const defaultFallback = '/images/child-placeholder.svg';

export function DreamBoardImage({
  src,
  alt,
  fallbackSrc = defaultFallback,
  sizes = '(max-width: 768px) 100vw, 112px',
  priority = false,
  className,
  imageClassName,
}: DreamBoardImageProps) {
  const resolvedSrc = src?.trim().length ? src : fallbackSrc;
  const isIcon = resolvedSrc.startsWith('/icons/gifts/');
  const iconMeta = isIcon ? getGiftIconById(extractIconIdFromPath(resolvedSrc)) : null;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl bg-stone-100',
        isIcon ? 'aspect-square' : 'aspect-[3/2]',  // Square for icons, 3:2 for legacy
        className
      )}
      style={iconMeta ? { backgroundColor: iconMeta.bgColor } : undefined}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(isIcon ? 'object-contain' : 'object-cover', imageClassName)}
      />
    </div>
  );
}
```

**Key changes:**
- Detect icon paths via `startsWith('/icons/gifts/')`
- Use `aspect-square` for icons (they're 1:1), `aspect-[3/2]` for any legacy images
- Use `object-contain` for icons (don't crop), `object-cover` for legacy
- Apply the icon's background colour

### File: `src/components/dream-board/DreamBoardCard.tsx`

No changes needed — it delegates to `DreamBoardImage` which now handles icons.

### File: `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`

This component doesn't currently display the gift image. No changes needed.

---

## 13. API Contract Changes

### File: `src/app/api/v1/dream-boards/route.ts`

#### Create Schema Update

```typescript
// Before:
gift_image_url: z.string().url(),
gift_image_prompt: z.string().min(1).optional(),

// After:
gift_image_url: z.string().min(1),               // Now accepts icon paths (not just URLs)
gift_image_prompt: z.string().optional(),          // Fully optional, deprecated
```

The `insertDreamBoard` function already writes `gift_image_url` directly to the database — no changes needed there.

### File: `src/lib/api/gifts.ts`

```typescript
// Before:
export const serializeGiftData = (params: {
  giftName?: string | null;
  giftImageUrl?: string | null;
  giftImagePrompt?: string | null;
}) => {
  if (!params.giftName || !params.giftImageUrl) return null;
  return {
    gift_name: params.giftName,
    gift_image_url: params.giftImageUrl,
    gift_image_prompt: params.giftImagePrompt ?? null,
  };
};

// After:
export const serializeGiftData = (params: {
  giftName?: string | null;
  giftImageUrl?: string | null;
  giftImagePrompt?: string | null;
}) => {
  if (!params.giftName || !params.giftImageUrl) return null;
  return {
    gift_name: params.giftName,
    gift_image_url: params.giftImageUrl,
    gift_icon_id: extractIconIdFromPath(params.giftImageUrl ?? '') ?? null, // NEW field
    gift_image_prompt: params.giftImagePrompt ?? null, // Deprecated, will be null for new boards
  };
};
```

### File: `src/lib/api/openapi.ts`

Update the OpenAPI spec to reflect the new `gift_image_url` semantics and add `gift_icon_id` to the response schema. The `gift_image_url` property description should note it now contains a static icon path rather than a Blob URL.

### File: `src/lib/api/dream-boards.ts`

The `DreamBoardApiRecord` type: no changes needed (`giftImageUrl` is already typed as `string | null`).

---

## 14. OG Image Generation with @vercel/og

### Install dependency

```bash
pnpm add @vercel/og
```

### New API Route: `src/app/api/og/[slug]/route.tsx`

Create an Edge API route that generates Open Graph images on the fly:

```typescript
import { ImageResponse } from '@vercel/og';
```

#### OG Image Design

The OG image should be **1200×630px** (standard OG dimensions) and composite:

1. **Background**: Soft gradient matching the dreamboard header (`#E4F0E8` → `#D5E8DC`)
2. **Child's photo**: Circular, 180px diameter, white border, positioned left-centre
3. **Gift icon**: 120×120px, positioned right of centre
4. **Text**:
   - `"{childName}'s Dreamboard"` — large, bold, display font
   - `"Help {childName} get their dream {giftName}!"` — smaller subtitle
   - Gifta logo/wordmark in bottom corner
5. **Branding**: Subtle Gifta watermark

#### Implementation Notes

- Use `@vercel/og` `ImageResponse` with JSX (it supports basic HTML/CSS via Satori)
- Fetch the child photo and icon as `ArrayBuffer` for embedding
- Load the display font (if custom) via `fetch` as an `ArrayBuffer`
- Return with `Cache-Control: public, max-age=86400` (24-hour cache)
- Handle missing/invalid slugs with a 404 or generic fallback OG image

#### Route Handler Skeleton

```typescript
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { getGiftIconById, extractIconIdFromPath } from '@/lib/icons/gift-icons';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const board = await getCachedDreamBoardBySlug(slug);

  if (!board) {
    return new Response('Not found', { status: 404 });
  }

  const iconMeta = getGiftIconById(extractIconIdFromPath(board.giftImageUrl ?? ''));
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gifta.co';

  // Fetch child photo as ArrayBuffer for embedding
  const childPhotoData = await fetch(board.childPhotoUrl).then(r => r.arrayBuffer());

  // Fetch icon as ArrayBuffer
  const iconUrl = `${baseUrl}${iconMeta?.src ?? '/icons/gifts/teddy-bear.png'}`;
  const iconData = await fetch(iconUrl).then(r => r.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(180deg, #E4F0E8 0%, #D5E8DC 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        padding: '60px',
      }}>
        {/* Child Photo */}
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '6px solid white',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <img src={childPhotoData} width={180} height={180} style={{ objectFit: 'cover' }} />
        </div>

        {/* Text + Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a1a1a' }}>
            {board.childName}&apos;s Dreamboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={iconData} width={80} height={80} style={{ borderRadius: '16px' }} />
            <div style={{ fontSize: '28px', color: '#4a4a4a' }}>
              {board.giftName}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
```

**Important**: The above is a skeleton. The implementing agent should refine the layout, handle font loading, and ensure the Satori-compatible JSX produces a polished result. Test locally with `next dev` — the OG endpoint will render in-browser at `/api/og/{slug}`.

---

## 15. Metadata Changes

### File: `src/lib/dream-boards/metadata.ts`

Update `buildDreamBoardMetadata` to point OG images at the new `/api/og/[slug]` route instead of using the gift image directly:

```typescript
export const buildDreamBoardMetadata = (
  board: DreamBoardMetadataSource,
  options: MetadataOptions
): Metadata => {
  const { giftTitle, giftSubtitle } = getGiftInfo({
    giftName: board.giftName ?? null,
    giftDescription: null,
    giftImageUrl: board.giftImageUrl ?? null,
  });

  const title = `${board.childName}'s Dreamboard | Gifta`;
  const description = getMetadataDescription(board, giftTitle);
  const urlPath = options.path ?? `/${board.slug}`;
  const url = toAbsoluteUrl(urlPath, options.baseUrl);

  // OG image is now dynamically generated
  const ogImageUrl = toAbsoluteUrl(`/api/og/${board.slug}`, options.baseUrl);
  const altText = getAltText({ giftSubtitle, title });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: ogImageUrl, alt: altText, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
};
```

### `DreamBoardMetadataSource` Type

Add `slug` to the type (it's already present — verify).

---

## 16. View Model & Gift Info Changes

### File: `src/lib/dream-boards/gift-info.ts`

No structural changes needed. The function already returns `giftImage: params.giftImageUrl ?? ''`, which will now be an icon path. This flows through correctly.

### File: `src/lib/dream-boards/view-model.ts`

No structural changes needed. `buildGuestViewModel` calls `getGiftInfo` which returns the icon path as `giftImage`. The view model already exposes `giftImage` to the guest page.

**Verify**: The `GuestViewModel.giftImage` field correctly receives the icon path and surfaces it to `OneWishSection`.

---

## 17. Code Removal — Gemini Integration

### Files to DELETE entirely

| File | Lines | Purpose |
|---|---|---|
| `src/lib/integrations/image-generation.ts` | 154 | Gemini API client, prompt construction, retry logic |
| `src/app/api/internal/artwork/generate/route.ts` | 53 | Internal artwork generation endpoint |
| `src/components/gift/GiftArtworkGenerator.tsx` | 124 | Generate/preview artwork component |

**Total: ~331 lines removed.**

### Environment Variables to Remove

Remove from `.env.example` and any deployment configurations:

```
GEMINI_API_KEY=
GEMINI_IMAGE_MODEL=
```

### Redis Rate Limit Keys

The pattern `artwork:generate:{hostId}` in Redis KV is no longer written to. No cleanup action needed — keys will expire naturally (they have a 1-hour TTL).

### Imports to Clean Up

After deleting the above files, search for and remove any remaining imports:

```bash
grep -rn "image-generation" src/
grep -rn "GiftArtworkGenerator" src/
grep -rn "artwork/generate" src/
grep -rn "generateGiftArtwork" src/
```

Remove all matching import statements and references.

---

## 18. File-by-File Change Manifest

This is the complete list of files that must be created, modified, or deleted. Execute in this order.

### Phase 1: Icon Assets — ALREADY COMPLETED

All 60 icon PNG files already exist in `public/icons/gifts/`. No action required by the implementing agent. The full file list:

`amusement-park.png`, `ballet.png`, `basketball.png`, `bicycle.png`, `books.png`, `bow-and-arrow.png`, `building-blocks.png`, `butterfly.png`, `camera.png`, `camping.png`, `castle.png`, `compass.png`, `cricket.png`, `crystal-ball.png`, `cupcake.png`, `detective.png`, `dinosaur.png`, `dollhouse.png`, `dress.png`, `drone.png`, `fairy.png`, `fishing.png`, `flower.png`, `game-controller.png`, `globe.png`, `guitar.png`, `handbag.png`, `headphones.png`, `ice-skates.png`, `joystick.png`, `lipstick.png`, `martial-arts.png`, `mermaid.png`, `microphone.png`, `microscope.png`, `movie.png`, `nail-polish.png`, `paint-palette.png`, `pirate-ship.png`, `plane-ticket.png`, `princess-crown.png`, `race-car.png`, `rainbow.png`, `ribbon.png`, `robot.png`, `rocket.png`, `rugby.png`, `scooter.png`, `skateboard.png`, `soccer-ball.png`, `superhero-cape.png`, `swimming.png`, `tablet.png`, `teddy-bear.png`, `telescope.png`, `toolbox.png`, `train.png`, `trophy.png`, `unicorn.png`, `zoo.png`.

### Phase 2: Core Modules (sequential)

| Action | File |
|---|---|
| CREATE | `src/lib/icons/gift-icons.ts` |
| CREATE | `src/lib/icons/suggest-icon.ts` |

### Phase 3: Schema & Validation Updates (sequential)

| Action | File |
|---|---|
| MODIFY | `src/lib/db/schema.ts` (comments only) |
| MODIFY | `src/lib/dream-boards/schema.ts` (remove `.url()` on `giftImageUrl`, make `giftImagePrompt` fully optional) |
| MODIFY | `src/lib/dream-boards/draft.ts` (add `giftIconId` to types) |

### Phase 4: Component Changes (sequential)

| Action | File |
|---|---|
| CREATE | `src/components/gift/GiftIconPicker.tsx` |
| MODIFY | `src/app/(host)/create/gift/page.tsx` (replace `GiftArtworkGenerator` with `GiftIconPicker`) |
| MODIFY | `src/app/(host)/create/review/ReviewClient.tsx` (update image preview to icon style) |
| MODIFY | `src/app/(host)/create/review/page.tsx` (verify schema compatibility) |

### Phase 5: Display Changes (parallelisable)

| Action | File |
|---|---|
| MODIFY | `src/app/(guest)/[slug]/page.tsx` (update `OneWishSection` for icon background) |
| MODIFY | `src/components/dream-board/DreamBoardImage.tsx` (handle icon paths) |

### Phase 6: API Changes (sequential)

| Action | File |
|---|---|
| MODIFY | `src/app/api/v1/dream-boards/route.ts` (update `createSchema` validation) |
| MODIFY | `src/lib/api/gifts.ts` (add `gift_icon_id` to serialisation) |
| MODIFY | `src/lib/api/openapi.ts` (update schema docs) |

### Phase 7: OG Image (sequential)

| Action | File |
|---|---|
| CREATE | `src/app/api/og/[slug]/route.tsx` |
| MODIFY | `src/lib/dream-boards/metadata.ts` (point OG image to `/api/og/[slug]`) |

### Phase 8: Cleanup (sequential, last)

| Action | File |
|---|---|
| DELETE | `src/lib/integrations/image-generation.ts` |
| DELETE | `src/app/api/internal/artwork/generate/route.ts` |
| DELETE | `src/components/gift/GiftArtworkGenerator.tsx` |
| MODIFY | `.env.example` (remove `GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL`) |

---

## 19. Testing Strategy

### Unit Tests

| Test | File | What to verify |
|---|---|---|
| Icon registry completeness | `src/lib/icons/__tests__/gift-icons.test.ts` | All 60 icons exist, all have valid IDs, labels, categories, src paths, bgColor hex, keywords array, ageRange tuple |
| Icon registry lookups | Same file | `getGiftIconById` returns correct icon, returns undefined for invalid ID, `isValidGiftIconId` works |
| Smart default suggestion | `src/lib/icons/__tests__/suggest-icon.test.ts` | Returns correct icon for "ballet shoes" → `ballet`, "mountain bike" → `bicycle`, "PlayStation" → `game-controller` |
| Age-aware scoring | Same file | Younger child + "blocks" → `building-blocks`, older child + "blocks" → lower score for `building-blocks` |
| Fallback behaviour | Same file | Empty description + age 3 → `teddy-bear`, empty + age 15 → `headphones` |
| Draft schema validation | `src/lib/dream-boards/__tests__/schema.test.ts` | `giftImageUrl` accepts `/icons/gifts/ballet.png` (relative path), rejects empty string |
| Gift serialisation | `src/lib/api/__tests__/gifts.test.ts` | `serializeGiftData` includes `gift_icon_id` field, extracts ID correctly from path |

### Integration Tests

| Test | What to verify |
|---|---|
| Create flow E2E | Can complete full create flow (child → gift → dates → charity → payout → review → publish) with icon selection |
| Guest page rendering | Dreamboard page loads with icon displayed at correct dimensions, correct background colour |
| API create endpoint | `POST /api/v1/dream-boards` accepts `gift_image_url: '/icons/gifts/ballet.png'` |
| OG image generation | `GET /api/og/{slug}` returns a valid PNG image with 200 status |

### Visual Verification

After implementation, manually verify:

1. Icon picker grid renders correctly on mobile (375px) and desktop (1440px)
2. Selected icon highlight is clearly visible
3. Icons render at correct size in the "One Big Wish" section on the guest page
4. Icons render correctly on the dashboard card (`DreamBoardImage`)
5. OG image looks good when shared (use https://www.opengraph.xyz/ to test)
6. Review page shows the icon in the correct style (not stretched/cropped)

### Static Asset Verification

```bash
# Verify all 60 icons exist and are valid PNGs
echo "File count: $(ls public/icons/gifts/*.png | wc -l) (expected: 60)"
for f in public/icons/gifts/*.png; do
  identify "$f" 2>/dev/null | grep -q "320x320" && echo "OK: $f" || echo "FAIL: $f"
done

# Verify file sizes < 30KB
find public/icons/gifts/ -name "*.png" -size +30k -print
```

---

## 20. Verification Checklist

The implementing agent must verify each item before considering the task complete.

- [ ] All 60 icon PNG files exist in `/public/icons/gifts/` at 320×320px
- [ ] `src/lib/icons/gift-icons.ts` exports all 60 icons with complete metadata
- [ ] `src/lib/icons/suggest-icon.ts` correctly suggests icons for common gift descriptions
- [ ] `GiftArtworkGenerator.tsx` is deleted
- [ ] `image-generation.ts` is deleted
- [ ] `artwork/generate` API route is deleted
- [ ] No remaining imports reference deleted files (`grep -rn` clean)
- [ ] `GiftIconPicker` renders correctly with keyboard navigation
- [ ] Gift creation page uses `GiftIconPicker` and smart defaults
- [ ] `giftDescription` is no longer required (optional field)
- [ ] Draft persistence stores `giftIconId` and resolved `giftImageUrl`
- [ ] `dreamBoardDraftSchema` accepts icon paths (not just URLs)
- [ ] Review page shows icon in square format (not landscape)
- [ ] Guest dreamboard page shows icon with correct background colour
- [ ] `DreamBoardImage` component handles both icon paths and legacy URLs gracefully
- [ ] API create schema accepts icon paths for `gift_image_url`
- [ ] API serialisation includes `gift_icon_id` field
- [ ] OG image route exists at `/api/og/[slug]` and generates valid images
- [ ] Metadata points to `/api/og/[slug]` for OG images
- [ ] `.env.example` no longer references `GEMINI_API_KEY` or `GEMINI_IMAGE_MODEL`
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] Linting passes (`pnpm lint`)
- [ ] All unit tests pass (`pnpm test`)
- [ ] Application starts without errors (`pnpm dev`)

---

*End of implementation plan.*

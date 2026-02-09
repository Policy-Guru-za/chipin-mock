# C7 — Accessibility and Edge Cases

## Objective

Execute the platform accessibility plan to meet WCAG 2.1 AA
requirements, implement missing empty/loading/error states for
critical routes in guest/host/admin/marketing groups, and harden
edge-case pathways. Every interactive surface must be
keyboard-navigable, screen-reader-announced, and touch-target
compliant. Critical routes must gracefully handle loading, error,
and not-found states. Remaining leaf-route coverage is logged as
P2 backlog.

---

## Context & Constraints

- Read these docs in order **before coding**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/Platform-Spec-Docs/UX.md` — §Accessibility Checklist
     (**authoritative** a11y requirements)
  4. `docs/Platform-Spec-Docs/NFR-OPERATIONS.md` — performance and
     POPIA constraints
  5. `docs/napkin/napkin.md` (all learnings)
- Gate commands: `pnpm lint && pnpm typecheck && pnpm test`
- All gates **must pass** before marking C7 complete.
- Do NOT proceed to C8.
- Do NOT modify Phase B backend APIs (partner/public API routes
  under `src/app/api/v1/`), DB schema, migration files, or
  webhook handlers.
- Do NOT change fee calculation logic (`src/lib/payments/fees.ts`).
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF**.
- **Copy policy:** C7 does NOT edit existing product copy (C6
  handles copy). However, **new fallback-state copy is allowed**:
  error boundary messages, not-found page text, loading
  announcements, noscript warnings, and skip-link text are all in
  scope as new UI elements.
- **API contract strings are out of scope.** Do NOT change:
  - Webhook event names (`dreamboard.created`, `dreamboard.updated`)
  - API scope strings (`dreamboards:read`, `dreamboards:write`)
  - OpenAPI spec enum values
  - Database column names or enum values
  - Webhook header names (`X-ChipIn-Signature`, `X-ChipIn-Event-Id`)
  - URL slugs and route segments
  These are developer-facing contracts, not user-visible copy.
- **Scope boundary:** C7 is accessibility, error boundaries, and
  edge-case hardening. Do NOT refactor business logic, add features,
  or change existing user-facing copy. Every change must serve one
  of: WCAG 2.1 AA compliance, missing UI state coverage, or
  edge-case resilience.

---

## Sub-step 0: Scope Lock + Route Map

Before coding, build a complete route map so skip-link, error,
and loading coverage is verifiable. Run `find src/app -name
'layout.tsx' -o -name 'page.tsx' | sort` and confirm which route
groups exist.

**Known route groups (all must have skip-link target coverage):**

| Group | Layout | Key pages |
|-------|--------|-----------|
| Root | `src/app/layout.tsx` | — |
| `(guest)` | `src/app/(guest)/layout.tsx` | `[slug]`, `[slug]/contribute`, `[slug]/thanks` |
| `(host)` | `src/app/(host)/layout.tsx` | `create/*`, `dashboard/*` |
| `(admin)` | `src/app/(admin)/layout.tsx` | `admin/*`, legacy `payouts/*` |
| `(marketing)` | `src/app/(marketing)/layout.tsx` (if exists) | landing page |
| Auth | `src/app/sign-in/`, `src/app/sign-up/` | sign-in, sign-up |

**Skip-link strategy:** Use a **single global
`<main id="main-content">`** in the root layout
(`src/app/layout.tsx`) wrapping the children content. This
guarantees skip-link target coverage for ALL routes — including
auth, demo, health, and any future routes — without requiring
each route group to add its own target.

**Error/loading coverage scope (C7 = critical routes only):**

| Route group | error.tsx | loading.tsx | Notes |
|-------------|-----------|-------------|-------|
| Root (`src/app/`) | ✅ Create | — | Global fallback |
| `(guest)` | ✅ Create | ✅ `[slug]/loading.tsx` | Highest-traffic public route |
| `(host)` | ✅ Create | ✅ `dashboard/loading.tsx` | Host dashboard |
| `(admin)` | ✅ Create | ✅ `admin/loading.tsx` | Admin dashboard |
| `(marketing)` | Deferred P2 | Deferred P2 | Landing is static/fast |
| Auth | Deferred P2 | Deferred P2 | Clerk handles errors |

Remaining leaf routes (individual create steps, contribute
sub-pages, individual admin sub-pages) are deferred to P2. Log
them in the evidence file.

After this sub-step: no code changes yet; this is planning only.

---

## UX Spec Accessibility Checklist (reference)

From `docs/Platform-Spec-Docs/UX.md`:

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Alt text on all images | ✅ Already implemented |
| 2 | Form labels for all inputs | ⚠️ Gap: AmountSelector custom input |
| 3 | Colour contrast AA 4.5:1 | ⚠️ Multiple failures (see contrast audit below) |
| 4 | Focus indicators on interactive elements | ✅ `focus-visible:ring-2` globally |
| 5 | Keyboard navigation for all flows | ⚠️ Gap: no skip-to-content link |
| 6 | Screen reader announcements | ⚠️ Gap: missing `role="alert"` on some errors |
| 7 | `prefers-reduced-motion` support | ✅ Comprehensive (hook + CSS + per-component) |
| 8 | Touch targets ≥ 44×44 px | ⚠️ Gap: several undersized elements |

---

## Current State (audit findings)

### Critical — No skip-to-content link

**File:** `src/app/layout.tsx` (line 100)

The root layout has no skip link. Keyboard users must tab through
the entire nav on every page load. A skip-to-content link must be
the first focusable element in `<body>`.

### Critical — Missing `role="alert"` on error messages

| File | Line | Current | Fix |
|------|------|---------|-----|
| `src/components/contribute/ReminderModal.tsx` | 146 | `<p className="text-sm text-red-600">` | Add `role="alert"` |
| `src/components/admin/CharityFormModal.tsx` | 300 | `<p className="text-sm text-red-600">` | Add `role="alert"` |

**Note:** `src/components/forms/AmountSelector.tsx` line 140 already
has `role="alert"` — no change needed there.

### Critical — Missing `aria-label` on LandingNav mobile dialog

**File:** `src/components/landing/LandingNav.tsx` (lines 82–88)

The mobile menu drawer has `role="dialog"` and `aria-modal="true"`
but no `aria-label` or `aria-labelledby`. Screen readers cannot
announce the dialog purpose. This is a **separate component** from
`MobileNav.tsx` (used by `Header.tsx`), which already has
`aria-label="Navigation menu"` at line 127.

**Fix:** Add `aria-label="Navigation menu"` to the dialog `<div>`.

### Critical — AmountSelector custom input missing accessible label

**File:** `src/components/forms/AmountSelector.tsx` (lines 120–135)

The custom amount `<input>` has `placeholder="Custom amount"` but no
`<label>`, `aria-label`, or `aria-labelledby`. Placeholder text
alone does not satisfy WCAG 2.1 SC 1.3.1.

**Fix:** Add `aria-label="Custom amount"` to the `<input>`.

### Critical — Colour contrast failures

Verified programmatically using the WCAG relative luminance formula.
Multiple colour pairs fail AA 4.5:1 for normal text:

| Foreground | Background | Context | Ratio | Pass? |
|-----------|-----------|---------|-------|-------|
| `#777777` | `#FFFCF9` | LandingNav desktop links | 4.38:1 | ❌ FAIL |
| `#757575` | `#FFFCF9` | Corrected muted text | 4.51:1 | ✅ PASS |
| `#3D3D3D` | `#FFFCF9` | LandingNav brand text | 10.63:1 | ✅ PASS |
| `#FFFFFF` | `#6B9E88` | Landing CTA gradient start | 3.06:1 | ❌ FAIL |
| `#FFFFFF` | `#5A8E78` | Landing CTA gradient end | 3.77:1 | ❌ FAIL |
| `#FFFFFF` | `#0D9488` | Primary button gradient start (`primary`) | 3.74:1 | ❌ FAIL |
| `#FFFFFF` | `#0F766E` | Primary button gradient end (`primary-700`) | 5.47:1 | ✅ PASS |
| `#FFFFFF` | `#115E59` | `primary-800` (candidate replacement) | 7.58:1 | ✅ PASS |
| `#0D9488` | `#FFFFFF` | `text-primary` on white | 3.74:1 | ❌ FAIL |
| `#0F766E` | `#FFFFFF` | `text-primary-700` on white | 5.47:1 | ✅ PASS |
| `#A8A29E` | `#FEFDFB` | `text-text-muted` on `bg-surface` | 2.48:1 | ❌ FAIL (< 3:1) |

**Key implications:**

1. **Landing muted text** (`text-[#777]`): Change to `text-[#757575]`
   (minimum passing, 4.51:1) or `text-[#737373]` for margin (4.64:1).

2. **Landing CTA gradient** (`from-[#6B9E88] to-[#5A8E78]` with
   white text): **Both stops fail.** Must darken both stops. For
   gradients, evaluate the **worst (lightest) stop colour** — if it
   fails, the entire gradient fails. Maximum background luminance
   for 4.5:1 with white text = **0.1833**.

3. **Primary button gradient** (`from-primary to-primary-700` =
   `from-#0D9488 to-#0F766E` with white text): Start stop fails
   (3.74:1), end passes (5.47:1). Fix by changing button gradient
   stops — do NOT change the `primary` DEFAULT token in
   `tailwind.config.ts` (cascading design-system impact).

4. **`text-primary` on white** (3.74:1): Fails for normal-size text.
   Scan for `text-primary` usage; switch to `text-primary-700`
   (5.47:1) where text is normal size.

5. **`text-text-muted`** (#A8A29E, 2.48:1): Fails even 3:1.
   Acceptable ONLY for truly incidental/disabled text. Do NOT change
   the token in C7 (design-system cascade). Audit and document;
   defer token change to P2.

### High — Undersized touch targets (< 44×44 px)

WCAG 2.5.5 (AAA) recommends 44px; WCAG 2.5.8 (AA in 2.2)
mandates ≥ 24px with spacing. The UX spec explicitly requires
≥ 44×44 px.

| File | Line | Element | Current size | Fix |
|------|------|---------|-------------|-----|
| `src/components/ui/button.tsx` | 45 | `icon` size variant | `h-10 w-10` (40px) | → `h-11 w-11` (44px) |
| `src/components/layout/Header.tsx` | 69 | Hamburger button | `p-2` (40px total) | → add `min-h-[44px] min-w-[44px]` |
| `src/components/landing/LandingNav.tsx` | 149 | Hamburger button | `p-2` (40px total) | → add `min-h-[44px] min-w-[44px] items-center justify-center` |
| `src/components/admin/AdminPagination.tsx` | 95, 102, 110, 117 | Prev/Next links + disabled spans (4 elements) | `py-1.5` (~32px) | → `py-2.5` or `min-h-[44px] inline-flex items-center` |
| `src/components/forms/ContributionFormParts.tsx` | 70 | Copy ref button | `px-2 py-1` (~28px) | → `min-h-[44px] min-w-[44px]` |

### High — No error boundaries

No `error.tsx` files exist in the project. An unhandled runtime
error anywhere in the app shows the Next.js default error page with
no branding, no recovery action, and no navigation back to safety.

**Required files (C7 scope — critical routes):**

| File | Scope |
|------|-------|
| `src/app/error.tsx` | Global fallback for all routes |
| `src/app/(guest)/error.tsx` | Guest-facing error (public board, contribute, thanks) |
| `src/app/(host)/error.tsx` | Host-facing error (create, dashboard) |
| `src/app/(admin)/error.tsx` | Admin-facing error |

Each error boundary must:
- Be a `'use client'` component (Next.js requirement)
- Accept `{ error, reset }` props
- Display a branded, user-friendly message (state what failed,
  state what user can do, avoid jargon)
- Provide a "Try again" button wired to `reset()`
- Provide a "Go home" link (or "Go to dashboard" for admin)
- Log the error to console (Sentry integration is separate scope)
- Respect the design system (use `bg-surface`, `text-text`,
  `rounded-xl`, etc.)

### High — No custom not-found page

No `not-found.tsx` exists. Users hitting an invalid URL see the
Next.js default 404 with no branding.

**Required file:** `src/app/not-found.tsx`

Must display:
- Branded layout with Gifta logo/nav
- Friendly message: "We couldn't find that page."
- "Go home" link
- Design-system consistent styling

### Medium — No loading states

No `loading.tsx` files exist. Server-rendered pages show no visual
feedback during navigation.

**Required files (C7 scope — critical routes only):**

| File | Content |
|------|---------|
| `src/app/(guest)/[slug]/loading.tsx` | Skeleton for public Dream Board page |
| `src/app/(host)/dashboard/loading.tsx` | Skeleton for host dashboard listing |
| `src/app/(admin)/admin/loading.tsx` | Skeleton for admin dashboard |

Each loading file must:
- Export a default component with skeleton/pulse UI
- Use Tailwind `animate-pulse` on placeholder blocks
- Mirror the general structure of the page it covers (e.g.,
  header area + content blocks)
- Use the design system background (`bg-surface`) and border
  colours

### Medium — No `<noscript>` fallback

**File:** `src/app/layout.tsx` (line 100)

Add a `<noscript>` element inside `<body>` with a message like:
"JavaScript is required to use Gifta. Please enable JavaScript
in your browser settings."

### Low — Text overflow hardening

Several user-generated content areas (child name, gift description,
contributor name, message) lack explicit overflow handling. Long
strings could break layouts.

**Verify and add where missing:**
- `truncate` or `line-clamp-*` classes on child name displays
- `break-words` on contributor messages
- Input `maxLength` validation is already in place (server-side) —
  this is purely visual safety

---

## Build Sub-steps (execute in order)

### Sub-step 1: Skip-to-content Link

Add a visually-hidden, focus-visible skip link as the **first child**
inside `<body>` in `src/app/layout.tsx`.

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
>
  Skip to content
</a>
```

Then add a **single global `<main id="main-content">`** in the root
layout (`src/app/layout.tsx`) wrapping the content that currently
holds `{children}`. This guarantees the skip-link target exists on
every page — including auth, marketing, demo, and any future
routes — without relying on each route group to define it.

If route-group layouts (`(guest)`, `(host)`, `(admin)`,
`(marketing)`) already have their own `<main>` elements, remove
the `<main>` from those layouts to avoid nested `<main>` elements
(invalid HTML). The root layout's `<main>` becomes the single
semantic main landmark.

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 2: ARIA Roles and Labels

1. **`src/components/contribute/ReminderModal.tsx:146`**
   - Add `role="alert"` to the error `<p>` tag:
     `<p role="alert" className="text-sm text-red-600">`

2. **`src/components/admin/CharityFormModal.tsx:300`**
   - Add `role="alert"` to the error `<p>` tag:
     `<p role="alert" className="text-sm text-red-600">`

3. **`src/components/landing/LandingNav.tsx:82`**
   - Add `aria-label="Navigation menu"` to the mobile menu dialog
     `<div>` (the one with `role="dialog"`). This is a separate
     component from `MobileNav.tsx` (which already has the label).

4. **`src/components/forms/AmountSelector.tsx:120`**
   - Add `aria-label="Custom amount"` to the `<input>` element.

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 3: Touch Target Sizing

Ensure all interactive elements meet the 44×44 px minimum.
Use `min-h-[44px] min-w-[44px]` (preferred over padding changes
to guarantee size regardless of content).

1. **`src/components/ui/button.tsx:45`**
   - Change `icon: 'h-10 w-10'` → `icon: 'h-11 w-11'`

2. **`src/components/layout/Header.tsx:69`**
   - Add `min-h-[44px] min-w-[44px] inline-flex items-center
     justify-center` to the hamburger button className.

3. **`src/components/landing/LandingNav.tsx:149`**
   - Add `min-h-[44px] min-w-[44px] items-center justify-center`
     to the hamburger button className.

4. **`src/components/admin/AdminPagination.tsx`**
   - Update all **four** elements (Previous link at ~line 95,
     Previous disabled span at ~line 102, Next link at ~line 110,
     Next disabled span at ~line 117):
     Change `py-1.5` → `py-2.5` on each, or add
     `min-h-[44px] inline-flex items-center`.

5. **`src/components/forms/ContributionFormParts.tsx:70`**
   - Add `min-h-[44px] min-w-[44px] inline-flex items-center
     justify-center` to the copy reference button.

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 4: Colour Contrast Fixes

This is the most impactful sub-step. Fix all verified contrast
failures. For gradients, evaluate the **worst (lightest) stop
colour** — if it fails, the entire gradient fails.

#### 4a. Landing muted text

In `src/components/landing/LandingNav.tsx` (line 128) and any
other file in `src/components/landing/` using `text-[#777]`:
- Change `text-[#777]` → `text-[#757575]` (4.51:1 on `#FFFCF9`)
  or darker. Use `text-[#737373]` (4.64:1) for more margin.

#### 4b. Landing CTA gradient

Files: `src/components/landing/LandingNav.tsx` (lines 103, 135),
`src/components/landing/LandingCTA.tsx` (if applicable)

Current: `from-[#6B9E88] to-[#5A8E78]` with `text-white`.
Both stops fail AA: lighter stop = 3.06:1, darker stop = 3.77:1.

**Fix:** Darken both gradient stops so the **lighter stop**
(the `from-` value) passes 4.5:1 with white text. Maximum
background luminance for 4.5:1 with white = **0.1833**.

Compute replacement colours preserving the green hue. After
choosing values, verify both stops programmatically:
```ts
// Both must return true:
contrastRatio('#FFFFFF', newFromColour) >= 4.5
contrastRatio('#FFFFFF', newToColour) >= 4.5
```

#### 4c. Primary button gradient

**File:** `src/components/ui/button.tsx` (lines 17–23)

Current: `from-primary to-primary-700` = `from-#0D9488 to-#0F766E`.
Start fails (3.74:1), end passes (5.47:1).

**Recommended fix:** Change the gradient to use passing tokens:
`from-primary-700 to-primary-800`.
- White on `#0F766E` (primary-700) = 5.47:1 ✅
- White on `#115E59` (primary-800) = 7.58:1 ✅

**Do NOT change the `primary` DEFAULT token in
`tailwind.config.ts`** — that cascades through the entire design
system (focus rings, links, borders, etc.). Change only the
button gradient stops.

Also update the `shadow` and `hover:shadow` RGBA colours in the
primary button variant to match the new gradient base (e.g.,
change `rgba(13,148,136,...)` to the RGB values of the new
`from-` colour).

#### 4d. Secondary button check

Verify the `secondary` button variant (`from-accent to-accent-600`
= `from-#F97316 to-#EA580C` with white text). Compute contrast
and fix if needed.

#### 4e. `text-primary` usage scan

Scan the codebase for all `text-primary` usage on white/light
backgrounds:

- **Large text** (≥ 18pt regular or ≥ 14pt bold, roughly
  `text-lg font-bold` or `text-xl`+ in Tailwind) → 3:1 required
  → 3.74:1 passes → no change needed.
- **Normal-size text** → 4.5:1 required → 3.74:1 fails → change
  to `text-primary-700` (5.47:1).

Key file: `src/components/ui/button.tsx` — `link` variant uses
`text-primary`. Check if link-variant text is normal size.

#### 4f. `text-text-muted` audit (document only — no token change)

`text-text-muted` (#A8A29E) on `bg-surface` (#FEFDFB) = 2.48:1
(fails even 3:1). Scan for usage and classify each instance:
- **Incidental** (disabled, decorative, placeholder with visible
  label) → acceptable per WCAG 1.4.3 exemption → no change.
- **Essential** (helper text user must read, standalone labels,
  metadata) → flag as failing → fix that single instance with
  `text-text-secondary` (#57534E) if it blocks P0. Otherwise
  log for P2 design-system pass.

**Do NOT change the `text-text-muted` token** in
`tailwind.config.ts` in C7.

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 5: Error Boundaries

Create `error.tsx` files for each critical route group. All must
be `'use client'` components.

**Shared error UI helper (recommended):**
Create `src/components/ui/ErrorFallback.tsx`:

```tsx
'use client';

interface ErrorFallbackProps {
  heading?: string;
  message?: string;
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}

export function ErrorFallback({
  heading = 'Something went wrong',
  message = "We hit a snag loading this page. Please try again.",
  reset,
  homeHref = '/',
  homeLabel = 'Go home',
}: ErrorFallbackProps) {
  // Render branded error UI with reset + home link
}
```

Then create:

1. **`src/app/error.tsx`** — global fallback
   - Uses `ErrorFallback` with default props
2. **`src/app/(guest)/error.tsx`**
   - `homeHref="/"`, `homeLabel="Go home"`
3. **`src/app/(host)/error.tsx`**
   - `homeHref="/dashboard"`, `homeLabel="Go to dashboard"`
4. **`src/app/(admin)/error.tsx`**
   - `homeHref="/admin"`, `homeLabel="Go to admin dashboard"`

Each must:
- Accept `{ error, reset }` props (Next.js convention)
- `console.error(error)` on mount (via `useEffect`)
- Render the branded `ErrorFallback` component
- Use design-system classes (`bg-surface`, `text-text`,
  `rounded-xl`, button styles from `buttonVariants`)

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 6: Custom Not-Found Page

Create `src/app/not-found.tsx`:

- Display centred content with the Gifta brand mark (🎁 + "Gifta")
- Heading: "Page not found"
- Body: "We couldn't find the page you're looking for."
- CTA: Link to "/" with text "Go home" using `buttonVariants`
- Design-system styling: `bg-surface`, `text-text`,
  `min-h-screen flex items-center justify-center`

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 7: Loading States

Create skeleton loading components for critical routes only.

1. **`src/app/(guest)/[slug]/loading.tsx`**
   - Skeleton matching public Dream Board layout: hero image
     placeholder, title bar, progress bar, amount area
   - Use `animate-pulse` on `bg-gray-200 rounded-xl` blocks

2. **`src/app/(host)/dashboard/loading.tsx`**
   - Skeleton for dashboard listing: stats card row + Dream Board
     cards grid
   - Use `animate-pulse` on placeholder blocks

3. **`src/app/(admin)/admin/loading.tsx`**
   - Skeleton for admin dashboard: stats cards row + table rows
   - Use `animate-pulse` on placeholder blocks

Each loading component:
- Exports a default function (no `'use client'` needed — these
  are server components)
- Mirrors the approximate layout shape of the real page
- Uses design-system background and border colours
- Includes an accessible status: `<p className="sr-only">Loading…</p>`

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 8: Noscript Fallback & Text Overflow

1. **`src/app/layout.tsx`** — Add `<noscript>` inside `<body>`
   (after the skip link, before `<main>`):

   ```tsx
   <noscript>
     <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-center text-sm text-yellow-800">
       JavaScript is required to use Gifta. Please enable JavaScript in your browser settings.
     </div>
   </noscript>
   ```

2. **Text overflow hardening** — Search for user-generated content
   displays (child name, gift name, contributor name, message text)
   and ensure they have overflow protection:

   - Headings with child names: add `truncate` where single-line,
     or `line-clamp-2` where multi-line is acceptable
   - Contributor messages: add `break-words` (or `overflow-wrap:
     break-word` via `[overflow-wrap:break-word]`)
   - Gift descriptions: add `line-clamp-3` where appropriate

   **Key files to check:**
   - `src/app/(guest)/[slug]/page.tsx` — child name heading,
     gift description
   - `src/app/(host)/dashboard/[id]/` — board title, child name
   - `src/components/contribute/` — contributor display names
   - `src/components/admin/AdminDataTable.tsx` — table cell content

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 9: Tests

#### 9a. Update impacted existing tests (CRITICAL)

Adding a skip link, noscript element, `<main>` wrapper, and
error boundaries to root/group layouts **WILL** affect existing
layout snapshots, render tests, and any assertions checking DOM
structure. Removing `<main>` from route-group layouts (if they
had one) also impacts tests. Colour changes in button.tsx and
landing components may break snapshot/className assertions.

**Before writing new tests, search ALL test files for
assertions that may break due to:**
- New `<main id="main-content">` wrapper in root layout
- Skip link element in `<body>`
- Noscript element
- Button icon size change (`h-10 w-10` → `h-11 w-11`)
- Added `role="alert"` attributes
- Added `aria-label` attributes
- Changed gradient colours / shadow RGBA values in button variants
- Changed touch target sizing on pagination / hamburger / copy btn
- Changed landing page hex colours

**Fix ALL broken tests before writing new ones.** Run
`pnpm test` after fixes to confirm zero regressions.

#### 9b. New test file: `tests/unit/accessibility.test.ts`

Write tests covering (~15-20 assertions):

**Skip-to-content:**
- Root layout renders a skip link with `href="#main-content"`
- Skip link has class `sr-only` (hidden by default)
- Root layout contains `<main id="main-content">`

**ARIA roles:**
- ReminderModal error message has `role="alert"`
- CharityFormModal error message has `role="alert"`
- LandingNav mobile dialog has `aria-label`
- AmountSelector custom input has accessible label (`aria-label`)

**Touch targets:**
- Button `icon` variant produces `h-11 w-11` (not `h-10 w-10`)
- AdminPagination links have minimum height styling

**Error boundaries:**
- `src/app/error.tsx` exports a valid React component
- `src/app/not-found.tsx` exports a valid React component
- Error boundary renders "Try again" button
- Error boundary renders home link
- Not-found page renders "Go home" link

**Loading states:**
- Guest board loading skeleton renders pulse animation element
- Admin loading skeleton renders pulse animation element

**Noscript:**
- Root layout includes `<noscript>` element

#### 9c. New test file: `tests/unit/colour-contrast.test.ts`

Write a programmatic contrast ratio check (~5-8 assertions):

```ts
function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map(i =>
    parseInt(hex.slice(i, i + 2), 16) / 255
  ).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

Assertions:
- Landing muted text colour on `#FFFCF9` ≥ 4.5:1
- Landing brand text `#3D3D3D` on `#FFFCF9` ≥ 4.5:1
- Landing CTA gradient **lighter stop** with white text ≥ 4.5:1
- Primary button gradient **lighter stop** with white text ≥ 4.5:1
- `primary-700` on white ≥ 4.5:1 (for `text-primary-700` usage)

**Gradient rule:** For each gradient, extract the `from-` colour
(the lightest stop) and verify it against 4.5:1. This is the
worst-case colour in the gradient.

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 10: Gate & Evidence

1. Run `pnpm lint && pnpm typecheck && pnpm test`
2. All three must pass (0 errors; warnings OK)
3. Record: total test count, total test files, new C7-specific
   test count
4. Create evidence file at:
   `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C7-accessibility-and-edge-cases.md`
5. Evidence must contain:
   - Files created (new) vs modified (existing), with summary
   - A11y audit checklist (each UX spec item: requirement,
     status, file changed)
   - Error/loading/not-found state coverage table (route group →
     file → status)
   - Touch target audit table (element → old size → new size)
   - Colour contrast audit table (pair → old ratio → new ratio →
     pass/fail, including before/after hex values)
   - `text-primary` usage scan results (file, size, action taken)
   - `text-text-muted` usage scan results (file, context,
     essential/incidental classification)
   - **P2 backlog**: remaining leaf-route loading/error coverage,
     marketing/auth error boundaries, `text-text-muted` token
     darkening, Lighthouse ≥ 95, axe-core integration
   - Gate output (lint, typecheck, test)
   - Test count breakdown (total vs C7-new)
6. Append C7 learnings to `docs/napkin/napkin.md` under
   `## C7 Learnings (2026-02-09)`

---

## Acceptance Criteria

### P0 (blocks merge)
- Skip-to-content link present and keyboard-focusable
- Global `<main id="main-content">` exists in root layout
- All error messages have `role="alert"`
- All dialogs have `aria-label` or `aria-labelledby`
- All form inputs have accessible labels
- All touch targets ≥ 44×44 px
- Error boundary exists at global level (`src/app/error.tsx`)
- Custom not-found page exists (`src/app/not-found.tsx`)
- Landing CTA gradient passes AA 4.5:1 (worst stop) with white text
- Primary button gradient passes AA 4.5:1 (worst stop) with white text
- Landing muted text passes AA 4.5:1 on `#FFFCF9`
- All existing tests still pass (zero regressions)
- Gates pass

### P1 (blocks rollout)
- Error boundaries exist for all critical route groups (guest,
  host, admin)
- Loading skeletons exist for critical routes (3 files)
- `<noscript>` fallback present
- `text-primary` usage on normal-size text replaced with
  `text-primary-700` where needed
- Text overflow protection on user-generated content displays
- Accessibility test file passes (~15-20 assertions)
- Colour contrast test file passes (~5-8 assertions)

### P2 (defer with waiver — log in evidence)
- Remaining leaf-route error.tsx and loading.tsx files
- Marketing/auth route group error boundaries
- `text-text-muted` token darkening (design-system pass)
- Full Lighthouse accessibility audit score ≥ 95
- Automated axe-core integration tests
- ARIA live regions for real-time contribution updates
- High-contrast mode support

---

## Stop Conditions

- Any P0 gate failure → stop, fix, re-run
- Schema or migration file touched → STOP (Phase B is locked)
- Webhook handler modified → STOP
- Fee calculation logic modified → STOP
- API route logic changed → STOP
- Existing user-facing copy changed beyond what's needed for a11y
  attributes → STOP (C6 handles copy; new fallback-state copy OK)
- `primary` DEFAULT token in `tailwind.config.ts` changed → STOP
  (cascading design-system impact — adjust button gradient stops
  instead)
- Any test count regression → stop, investigate

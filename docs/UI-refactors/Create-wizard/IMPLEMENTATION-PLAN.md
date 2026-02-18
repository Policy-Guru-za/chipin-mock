# Create Wizard UI Refactor — Implementation Plan

> **Scope**: Pure UI/UX refactor of Steps 1–6 of the Dreamboard creation wizard.
> **Governing rules**: `docs/UI-refactors/AI-UI-REFACTOR-PLAYBOOK.md`
> **Design tokens**: `docs/UI-refactors/DESIGN-TOKENS.md`
> **Mobile UX assessment**: `docs/UI-refactors/Create-wizard/MOBILE-UX-ASSESSMENT.md`
> **Mobile interaction spec**: `docs/UI-refactors/Create-wizard/MOBILE-INTERACTION-SPEC.md`
> **Guide HTML files**: `docs/UI-refactors/Create-wizard/Step-1.html` through `Step-6.html`
> **No backend, DB, schema, auth, payment, or server-action behaviour changes.**
>
> **Review revision**: This plan incorporates all decisions from the architecture, code-quality, test, and performance review (Issues 1–16, all resolved Option A).

---

## 0. Current State vs Target State

### What exists today
| Concern | Current implementation |
|---|---|
| **Layout** | `CreateFlowShell` — single column, `max-w-5xl`, no split panels |
| **Stepper** | `WizardStepIndicator` — 40 px teal circles, `ring-4 ring-primary/20`, desktop ol + mobile progress bar |
| **Form fields** | Bare `<Input>` / `<Textarea>` from `components/ui/` with minimal styling |
| **Cards** | Generic `<Card>` wrapper with `CardHeader` / `CardContent` |
| **Preview panels** | None — Steps 3, 4, 5 have no live right-panel preview |
| **Typography** | System sans, Georgia display; no Libre Baskerville / DM Sans pairing |
| **Design tokens** | Tailwind config already has `sage`, `amber`, `plum`, `ink` palettes |
| **Animations** | `fade-up` utility exists in config (with `translateY(24px)`); not used in wizard |
| **Tests** | Zero test files in `src/app/(host)/create/` |

### What the target designs call for
| Concern | Target |
|---|---|
| **Layout** | Split-panel grid (Steps 1–5) and centered card (Step 6); `max-width: 940px` |
| **Stepper** | 32 px sage circles, SVG checkmarks, `box-shadow: 0 0 0 3px var(--sage-light)` active ring, flex-1 connecting lines |
| **Form fields** | Premium field pattern: `14px 18px` padding, `1.5px` border, `12px` radius, hover/focus/placeholder states, amber field-tip with icon |
| **Cards** | `border-radius: 28px`, `shadow-card`, `36px 32px` padding |
| **Preview panels** | Live right-panel previews on Steps 3 (timeline), 4 (impact chart), 5 (checklist) |
| **Typography** | Libre Baskerville serif headings + DM Sans body; eyebrow `11px / 600 / amber / 0.12em` |
| **Animations** | `wizard-fade-up 0.35s` stepper, `wizard-fade-up 0.45s 0.08s` content |
| **Responsive** | 800px breakpoint → single column, `column-reverse` CTAs |

---

## 1. Frozen Boundaries (Non-Negotiable)

These items are **read-only** throughout the entire refactor:

### Files NOT to modify
- `src/app/(host)/create/page.tsx` (entry redirect logic)
- `src/lib/host/create-view-model.ts` (step completion + redirect logic)
- `src/lib/dream-boards/draft.ts` (KV draft storage)
- `src/lib/dream-boards/schema.ts` (Zod validation schemas)
- `src/lib/dream-boards/validation.ts` (date/bank validators)
- `src/lib/ux-v2/decision-locks.ts` (feature gates)
- All `actions.ts` files (server actions — form handlers stay byte-identical)
- `src/lib/auth/clerk-wrappers.ts` (auth)
- `src/lib/integrations/blob.ts` (photo upload)
- `src/components/layout/Header.tsx` / `Footer.tsx` (app shell)
- Any DB schema, migration, or API route files

### Layout file exception
`src/app/layout.tsx` (root layout) is frozen **except** for adding `next/font/google` imports if Libre Baskerville and DM Sans are not already loaded. This is a styling-only prerequisite with no behavioral impact. See §3 for the font verification check.

### Contracts to preserve
- All `<form action={serverAction}>` bindings — same action targets
- All `<form encType="...">` attributes (notably `multipart/form-data` on the child page)
- All `<input name="...">` names — FormData contract unchanged
- All hidden inputs (`<input type="hidden">`) for conditional form states — must render with correct `name` and `value` in both toggled-on and toggled-off states
- All URL routes (`/create/child`, `/create/gift`, etc.) — unchanged
- All `redirect()` destinations inside server actions — unchanged
- All error code URL params (`?error=invalid`, etc.) — unchanged
- All `searchParams` parsing in page components — unchanged
- All conditional rendering driven by `draft` state — logic preserved, presentation changed
- Controlled vs uncontrolled input distinction — inputs using `value` + `onChange` stay controlled; inputs using `defaultValue` stay uncontrolled

---

## 2. Shared Foundation Components (Phase 0)

Before touching any step page, build the shared UI primitives that all 6 steps depend on. These go in a **new feature-local folder**: `src/components/create-wizard/`.

### 2.1 `WizardStepper`
**File**: `src/components/create-wizard/WizardStepper.tsx`
**Replaces**: The stepper currently rendered by `CreateFlowShell` → `WizardStepIndicator`

> **Mobile amendment (Risk 8)**: This component renders two distinct modes depending on viewport. Desktop (≥801px) shows the dot stepper. Mobile (≤800px) shows a compact progress bar + label. Both render from the same component using responsive CSS (hidden/shown), no JS viewport detection.

#### Desktop mode (≥ 801px)
- Container: `max-width: 940px`, `margin: 0 auto`, `padding: 0 48px`, `margin-top: 32px`, `margin-bottom: 36px`, `animation: wizard-fade-up 0.35s ease-out both`
- Dot: 32px circles, `font-size: 12px`, `font-weight: 600`
- Done state: `bg-sage text-white` with SVG checkmark (`<svg width="14" height="14" ...><polyline points="20 6 9 17 4 12"/></svg>`)
- Active state: `bg-sage text-white` + `box-shadow: 0 0 0 3px var(--sage-light)`
- Upcoming state: `bg-border-soft text-ink-ghost`
- Lines: `flex: 1`, `height: 2px`, `margin: 0 4px`; done = sage, default = border-soft

#### Mobile mode (≤ 800px)
- Container: `padding: 0 20px`, `margin-top: 20px`, `margin-bottom: 20px`
- Label: eyebrow text "Step N of 6 — {stepLabel}" using `WizardEyebrow` styling (11px, 600, amber, uppercase, 0.12em)
- Progress bar: `height: 4px; border-radius: 2px; background: var(--border-soft);` with filled portion `background: var(--sage); width: {(currentStep / totalSteps) * 100}%;` and `transition: width 0.3s ease;`
- The dot row is hidden on mobile via `hidden md:flex`
- The progress bar is hidden on desktop via `flex md:hidden`

#### Props and accessibility
- Props: `currentStep: number`, `totalSteps: number`, `stepLabel: string`
- Note: `stepLabel` is new — each page passes the human-readable step name ("The child", "The gift", "The dates", "Giving back", "Payout setup", "Review")
- Accessibility: `role="progressbar"`, `aria-valuenow={currentStep}`, `aria-valuemin={1}`, `aria-valuemax={totalSteps}`, `aria-label="Step {currentStep} of {totalSteps}: {stepLabel}"`

**Action**: Create new. Do NOT edit `WizardStepIndicator.tsx` (it is used elsewhere).

### 2.2 `WizardSplitLayout`
**File**: `src/components/create-wizard/WizardSplitLayout.tsx`

Layout wrapper for the split-panel pattern used in Steps 1–5:
- Container: `max-width: 940px`, `margin: 0 auto`, `padding: 0 48px`, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 28px`, `align-items: start`, `animation: wizard-fade-up 0.45s ease-out 0.08s both`
- Responsive (< 800px): `grid-template-columns: 1fr`, `padding: 0 20px`, `gap: 24px`
- Props: `left: ReactNode`, `right: ReactNode`, `mobileOrder?: 'left-first' | 'right-first'`

> **Mobile amendment (Risk 1 — panel ordering)**: On mobile (≤800px), some steps need to reverse the panel order so the form appears first and the visual panel (photo drop zone / icon grid) appears second. The `mobileOrder` prop controls this:
> - `'left-first'` (default): panels render in DOM order on mobile — left stacks above right. Used for Steps 3, 4, 5 where the left panel IS the form.
> - `'right-first'`: the right panel gets `order: -1` on mobile via CSS. Used for Steps 1 and 2 where the left panel is the visual element (photo/icons) and the right panel is the form.
> - Implementation: `.right-first-mobile > :last-child { @media (max-width: 800px) { order: -1; } }`

### 2.3 `WizardCenteredLayout`
**File**: `src/components/create-wizard/WizardCenteredLayout.tsx`

Layout wrapper for the centered card pattern used in Step 6:
- Outer: `max-width: 940px`, `margin: 0 auto`, `padding: 0 48px`, `animation: wizard-fade-up 0.45s ease-out 0.08s both`
- Card: `max-width: 600px`, `margin: 0 auto`, `bg-card`, `border-radius: 28px`, `shadow-card`, `padding: 40px 36px 36px`
- Responsive (< 800px): `padding: 0 20px`, card `padding: 28px 24px 24px`
- Props: `children: ReactNode`

### 2.4 `WizardEyebrow`
**File**: `src/components/create-wizard/WizardEyebrow.tsx`

Eyebrow text pattern used on every step:
- `font-size: 11px`, `font-weight: 600`, `color: amber`, `text-transform: uppercase`, `letter-spacing: 0.12em`, `margin-bottom: 8px`
- Props: `children: ReactNode` (e.g. "Step 1 of 6 — The child")

### 2.5 `WizardPanelTitle`
**File**: `src/components/create-wizard/WizardPanelTitle.tsx`

Serif heading used on every step:
- Left/form panels: `font-family: serif`, `font-size: 22px`
- Right/preview panels: `font-family: serif`, `font-size: 19px`
- Props: `children: ReactNode`, `variant?: 'form' | 'preview'`

### 2.6 Field Components (Typed Wrappers)

> **Decision (Issue 1)**: Instead of a single polymorphic `WizardField`, split into a styling-only container and thin typed wrappers. This keeps each wrapper narrow, type-safe, and DRY.

**Files**:
- `src/components/create-wizard/WizardFieldWrapper.tsx` — container with margin, label slot, tip slot
- `src/components/create-wizard/WizardTextInput.tsx` — styled `<Input>` for text/number/date/time/email
- `src/components/create-wizard/WizardTextarea.tsx` — styled `<Textarea>`
- `src/components/create-wizard/WizardSelect.tsx` — styled `<select>` (used in PayoutForm for bank dropdown)

**`WizardFieldWrapper`**: The outer container and label.
- Container: `margin-bottom: 24px`
- Label: `font-size: 13px`, `font-weight: 500`, `color: ink-mid`, `margin-bottom: 8px`
- Props: `label: string`, `htmlFor: string`, `tip?: ReactNode`, `children: ReactNode`

**`WizardTextInput`**: Styled wrapper around `<Input>`.
- `padding: 14px 18px`, `bg: bg`, `border: 1.5px solid border`, `border-radius: 12px`, `font-size: 15px`, `shadow-input`, `outline: none`, `transition: all 0.25s`
- `::placeholder`: `color: ink-ghost`, `font-weight: 300`
- `:hover`: `border-color: ink-ghost`
- `:focus`: `border-color: sage`, `box-shadow: 0 0 0 3px sage-light + shadow-input`, `bg: card`
- Passes through all standard `<Input>` props (`name`, `type`, `required`, `defaultValue`, `value`, `onChange`, etc.)

> **Mobile amendment (Ship-blocker #6 — keyboard types)**: WizardTextInput MUST pass through these HTML attributes to the underlying `<input>`:
> - `inputMode` — controls which virtual keyboard appears ("numeric", "tel", "email", "text", "decimal")
> - `autoCapitalize` — controls capitalisation ("words", "sentences", "none")
> - `enterKeyHint` — controls the Enter key label ("next", "done", "send", "go")
> - `autoComplete` — enables browser autofill ("email", "tel", "cc-number", "cc-name", etc.)
> - `pattern` — for iOS numeric keypad trigger (e.g., `"[0-9]*"`)
>
> Each step's page is responsible for setting these attributes per-field. See §4 phase sections for the per-field specifications. The component must NOT set defaults for these — they vary by field.

**`WizardTextarea`**: Same styling pattern as `WizardTextInput` but for `<Textarea>`.

**`WizardSelect`**: Same visual treatment for `<select>` elements. Applies the design-token border, radius, focus ring, and font styling. Passes through `name`, `id`, `defaultValue`, `value`, `onChange`, `children` (options).

Checkboxes, radios, and range inputs have unique semantics that don't benefit from shared abstraction — they stay styled inline in their respective forms.

### 2.7 `WizardFieldTip`
**File**: `src/components/create-wizard/WizardFieldTip.tsx`

Amber info-tip pattern:
- `background: amber-light`, `border-radius: 10px`, `padding: 10px 14px`, `display: flex`, `align-items: flex-start`, `gap: 8px`
- Icon: 16px SVG, `color: amber`
- Text: `font-size: 12px`, `color: ink-mid`, `line-height: 1.5`
- Props: `icon?: ReactNode`, `children: ReactNode`

### 2.8 `WizardCTA`
**File**: `src/components/create-wizard/WizardCTA.tsx`

CTA button row with sticky mobile footer and loading state:

#### Desktop (≥ 801px) — in-flow CTA
- Container: `margin-top: 32px`, `display: flex`, `gap: 12px`
- Back button: `flex: 1`, `14px 20px`, `transparent bg`, `1.5px solid border`, `14px radius`, `14px font`, `600 weight`, back-arrow SVG
- Primary CTA: `flex: 1`, `14px 20px`, `sage bg`, `14px radius`, `14px font`, `600 weight`, forward-arrow SVG (or star for Step 6)
- Both buttons: `min-height: 48px`

#### Mobile (≤ 800px) — sticky footer CTA
> **Mobile amendment (Risk 1 — sticky CTA)**: On mobile, the CTA bar becomes sticky at the bottom of the viewport so users never have to scroll to find "Continue."

- Outer wrapper: `position: sticky; bottom: 0; z-index: 10; background: var(--card); border-top: 1px solid var(--border); padding: 12px 20px; box-shadow: 0 -2px 8px rgba(0,0,0,0.04);`
- Inner layout: `flex-direction: column-reverse; gap: 8px;` (Continue button on top, Back button below)
- The desktop in-flow CTA is hidden on mobile (`hidden md:flex`), and the sticky version is shown (`flex md:hidden`)
- Safe-area support: add `padding-bottom: max(12px, env(safe-area-inset-bottom));` for iPhone notch

#### Error display in sticky footer
> **Mobile amendment (Risk 10)**: On mobile, `WizardAlertBanner` renders INSIDE the sticky footer, above the buttons. This ensures errors are always visible without scrolling.

- When `error` prop is set, render `<WizardAlertBanner variant="error">` inside the sticky wrapper, above the button row
- Error styling in footer context: `margin-bottom: 8px;`

#### Loading / pending state
> **Mobile amendment (Risk 5 — submission feedback)**: The `pending` prop now drives full loading UX, not just `disabled`.

- When `pending` is true:
  - Submit button: `aria-disabled="true"`, `pointer-events: none`, `opacity: 0.7`
  - Text swaps to `pendingLabel` (default: "Saving…")
  - A 16px CSS spinner renders inline (sage color, `animation: spin 0.6s linear infinite`, `border: 2px solid var(--sage-light)`, `border-top-color: var(--sage)`, `border-radius: 50%`)
  - Back button: also `pointer-events: none; opacity: 0.5;` to prevent navigation during save

#### Double-submit prevention
- Internally, `WizardCTA` uses a `useRef` flag set on first submit click. If the flag is true and `pending` is already true, the click handler returns early.
- The flag resets when `pending` transitions from `true` to `false`.

#### Props (updated)
- `backLabel?: string`, `backHref?: string`, `submitLabel: string`, `pendingLabel?: string` (default: "Saving…"), `submitIcon?: 'arrow' | 'star'`, `pending?: boolean`, `error?: string | null`
- IMPORTANT: The primary button must be `<button type="submit">` to preserve the form action contract. The back button is a link (`<a>` or Next.js `<Link>`), NOT a form submission.

### 2.9 `WizardFormCard`
**File**: `src/components/create-wizard/WizardFormCard.tsx`

Card wrapper for the left (form) panel:
- `bg: card`, `border-radius: 28px`, `shadow-card`, `padding: 36px 32px 32px`
- Responsive: `padding: 28px 24px 24px`
- Contains eyebrow + title + form content
- Props: `children: ReactNode`

### 2.10 `WizardPreviewPanel`
**File**: `src/components/create-wizard/WizardPreviewPanel.tsx`

Card wrapper for the right (preview) panel with mobile collapse:

#### Desktop (≥ 801px)
- `bg: card`, `border-radius: 28px`, `shadow-card`, `overflow: hidden`
- Header section: `padding: 32px 32px 0` with eyebrow + title (19px)
- Content section: `bg: bg`, `border: 1.5px solid border`, `border-radius: 20px`, `margin: 32px`, `padding: 32px 28px`
- Always expanded — no toggle

#### Mobile (≤ 800px)
> **Mobile amendment (Risk 6 — preview collapse)**: On mobile, preview panels collapse into an accordion to reduce scroll depth by 300-500px per step. Default: collapsed.

- Render as a `<details>` element (native HTML, zero JS) with styled `<summary>`
- `<summary>` styling: `background: var(--border-soft); border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; font-weight: 500; color: var(--ink-soft); cursor: pointer; display: flex; align-items: center; justify-content: space-between; list-style: none;`
- Summary text: `summaryLabel` prop (e.g., "Preview timeline ▸", "See impact breakdown ▸", "See payout summary ▸")
- Chevron: 16px SVG, rotates 90° when `[open]` via CSS: `details[open] .chevron { transform: rotate(90deg); }`
- When expanded: renders the full preview card content below the summary
- `<details>` wrapper has `md:contents` so on desktop it is transparent (children render as if `<details>` isn't there)

#### Props (updated)
- `eyebrow?: string`, `title: string`, `summaryLabel: string`, `children: ReactNode`

### 2.11 `WizardAlertBanner`
**File**: `src/components/create-wizard/WizardAlertBanner.tsx`

> **Decision (Issue 5)**: Extract the error/warning banner that is currently copy-pasted identically across all 6 pages.

Alert banner with variant support:
- `variant: 'error' | 'warning' | 'info'`
- Error: `background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA;`
- Warning: amber border/bg/text (used on giving-back "no charities" state)
- Info: sage border/bg/text
- Common: `rounded-xl`, `border`, `px-4 py-3`, `text-sm`, `font-weight: 500`
- Props: `variant: 'error' | 'warning' | 'info'`, `children: ReactNode`, `onRetry?: () => void`

> **Mobile amendment (Risk 10)**: The banner has two rendering contexts:
> - **Desktop / top-of-form**: renders at the top of the form card (default). Standard block layout.
> - **Mobile / sticky-footer**: rendered by `WizardCTA` inside its sticky wrapper when `error` prop is set. In this context the banner uses compact styling: `padding: 8px 12px; font-size: 12px; border-radius: 8px; margin-bottom: 8px;`
> - When `onRetry` is provided, renders a "Try again" button inline: `font-size: 12px; font-weight: 600; color: inherit; text-decoration: underline; margin-left: 8px; cursor: pointer;`

### 2.12 `resolveWizardError` utility
**File**: `src/components/create-wizard/resolveWizardError.ts`

> **Decision (Issue 7)**: Extract the error-message lookup function duplicated across 5 pages.

```ts
export function resolveWizardError(
  error: string | undefined,
  messages: Record<string, string>,
  aliases?: Record<string, string>
): string | null {
  if (!error) return null;
  if (aliases?.[error]) return aliases[error];
  return messages[error] ?? null;
}
```

Each page keeps its own `errorMessages` record (since error codes are step-specific) but uses this shared resolver. The `aliases` parameter handles special cases like the child page's `photo` → custom message mapping.

### 2.13 `WizardInlineError`
**File**: `src/components/create-wizard/WizardInlineError.tsx`

> **Mobile amendment (Ship-blocker #6 — validation display)**: Inline field-level error display component. Used by `WizardFieldWrapper` when a field validation fails.

- Container: `display: flex; align-items: center; gap: 4px; margin-top: 6px;`
- Icon: 12px warning triangle SVG, `color: #B91C1C`
- Text: `font-size: 12px; color: #B91C1C; font-weight: 400;`
- Copy tone: specific and human ("Please enter the child's name", not "Field is required")
- Props: `message: string | null`
- When `message` is null/empty, renders nothing

Also update `WizardFieldWrapper` props to include: `error?: string | null`. When set, it renders `<WizardInlineError message={error} />` below the input slot and adds `aria-describedby` linking the input to the error element.

### 2.14 `WizardSkeletonLoader`
**File**: `src/components/create-wizard/WizardSkeletonLoader.tsx`

> **Mobile amendment (Risk 5 — perceived latency)**: CSS-only skeleton screen shown during page transitions. Displayed by the receiving page while content hydrates.

- Full-width container mimicking the wizard layout:
  - Skeleton stepper bar (4px bar on mobile, dots on desktop)
  - Skeleton card with rounded rectangle placeholders for title, 3 field blocks, and CTA
- Shimmer animation: `background: linear-gradient(90deg, var(--border-soft) 25%, var(--bg) 50%, var(--border-soft) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite;`
- Add keyframe to Tailwind config: `shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } }`
- Props: `variant: 'split' | 'centered'` (split for Steps 1-5, centered for Step 6)
- `prefers-reduced-motion: reduce` → static grey blocks, no shimmer
- Usage: Each page.tsx wraps its content in `<Suspense fallback={<WizardSkeletonLoader variant="split" />}>` for the server component boundary

### 2.15 `useDraftPersistence` hook
**File**: `src/components/create-wizard/useDraftPersistence.ts`

> **Mobile amendment (Risk 2 — draft persistence via sessionStorage)**: Client-side hook that saves and restores form values from sessionStorage, protecting against data loss on mobile interruptions.

```ts
export function useDraftPersistence(stepKey: string, fieldNames: string[]) {
  // Returns: { restoreValues: () => Record<string, string>, persistValues: (formData: FormData) => void, clearDraft: () => void }
  // On mount: reads sessionStorage key `gifta-wizard-draft-${stepKey}` and returns stored values
  // On input change: debounced 500ms write to sessionStorage
  // On successful submission (server action resolves): clearDraft() removes the key
  // Storage format: JSON object { fieldName: value, ... }
}
```

- Step keys: `'child'`, `'gift'`, `'dates'`, `'giving-back'`, `'payout'`
- Each client component calls `useDraftPersistence` on mount and pre-populates form fields if server-draft values are empty but sessionStorage values exist
- Also registers a `visibilitychange` listener: on `hidden`, immediately persists current form values (no debounce)
- Storage limit: only stores string field values (not files — photo upload cannot be persisted client-side)

### 2.16 `trackWizardEvent` utility
**File**: `src/components/create-wizard/trackWizardEvent.ts`

> **Mobile amendment (Section E.4 — analytics)**: Lightweight analytics utility for funnel measurement.

```ts
type WizardEvent =
  | { name: 'wizard_step_viewed'; step: number; draftId?: string }
  | { name: 'wizard_step_completed'; step: number; draftId?: string; durationMs: number }
  | { name: 'wizard_step_error'; step: number; errorType: string }
  | { name: 'wizard_abandoned'; step: number; draftId?: string; durationMs: number; formDirty: boolean }
  | { name: 'wizard_published'; draftId: string; totalDurationMs: number };

export function trackWizardEvent(event: WizardEvent): void {
  // Development: console.log('[wizard-analytics]', event)
  // Production: no-op until analytics provider is wired up
  // The function signature is stable — swap implementation when a provider is chosen
}
```

- Each page.tsx fires `wizard_step_viewed` in a `useEffect` on mount
- Each successful server action fires `wizard_step_completed` with duration calculated from step mount time
- `wizard_abandoned` fires on `visibilitychange` (hidden) or `beforeunload` if step < 6 and form is dirty
- Step 6 fires `wizard_published` on successful publish action

### 2.17 Index barrel export
**File**: `src/components/create-wizard/index.ts`

Re-exports all components and utilities for clean imports.

### ~~2.11 `WizardFooter`~~ — REMOVED

> **Decision (Issue 3)**: The app shell `<Footer>` already renders below every page. Creating a second wizard-specific footer would cause a visual collision. The guide HTMLs show a footer because they are standalone pages, but in production the app shell footer is sufficient. No `WizardFooter` component will be created.

---

## 3. Tailwind & Font Configuration (Phase 0b)

Before building components, verify and extend `tailwind.config.ts`. Based on codebase analysis, the config already has `sage`, `amber`, `plum`, `ink` color palettes and `shadow-card`.

### Tokens to verify/add

- [ ] `shadow-input` utility: `0 1px 3px rgba(44,37,32,0.04)` — **not currently in config; must add**
- [ ] Radius tokens: `radius-lg: 28px`, `radius-md: 20px`, `radius-sm: 14px` — **not currently in config; add to `borderRadius.extend`**
- [ ] `--font-display` maps to `'Libre Baskerville', Georgia, serif` — **already configured as `font-display`**
- [ ] `--font-primary` maps to `'DM Sans', -apple-system, sans-serif` — **already configured as `font-sans`**
- [ ] `shadow-card` — **already configured**

### Wizard-specific animation (Issue 4)

> **Decision**: The existing `fadeUp` keyframe uses `translateY(24px)`. The wizard design requires `translateY(14px)`. Rather than modifying the global `fadeUp` (which would affect the review page's published state, dashboard, and other refactored pages), add a **wizard-specific** animation.

Add to `tailwind.config.ts`:
```ts
keyframes: {
  // ... existing keyframes unchanged ...
  wizardFadeUp: {
    '0%': { opacity: '0', transform: 'translateY(14px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  // ... existing animations unchanged ...
  'wizard-fade-up': 'wizardFadeUp 0.35s ease-out both',
  'wizard-fade-up-content': 'wizardFadeUp 0.45s ease-out 0.08s both',
},
```

All wizard components reference `animate-wizard-fade-up` or `animate-wizard-fade-up-content` — never the existing `animate-fade-up`.

### Shimmer skeleton animation (Risk 5)

Add to `tailwind.config.ts` alongside the wizard-fade-up keyframes:
```ts
keyframes: {
  // ... existing keyframes ...
  shimmer: {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
},
animation: {
  // ... existing animations ...
  'shimmer': 'shimmer 1.5s ease-in-out infinite',
  'wizard-spin': 'spin 0.6s linear infinite',
},
```

### Touch interaction (Risk 4)

Add a global utility class to `tailwind.config.ts` or the wizard's base styles:
```css
.wizard-interactive {
  touch-action: manipulation;  /* Eliminates 300ms tap delay on older WebViews */
}
```
Apply to all buttons, links, toggles, tabs, and tappable elements in the wizard.

### Viewport meta tag (Performance)

Verify that `src/app/layout.tsx` includes `viewport-fit=cover` in its viewport meta:
```ts
export const metadata = {
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
};
```
The `viewport-fit=cover` handles iPhone notch/safe-area, which is critical for the sticky CTA footer.

### Font loading verification (Issue 15)

> **Decision**: Before any component work, verify that Libre Baskerville and DM Sans are loaded via `next/font/google`.

Pre-implementation check:
1. Search the codebase for `next/font/google` imports of `Libre_Baskerville` and `DM_Sans`.
2. If already loaded and CSS variables (`--font-display`, `--font-primary` or equivalent) are connected in the root layout — no action needed.
3. If **not** loaded: add `next/font/google` imports with `display: 'swap'` and connect the CSS variables in the root layout's `className`. This is the only permitted edit to `layout.tsx` — it is a styling-only prerequisite justified by the same reasoning as Tailwind config changes.

---

## 4. Step-by-Step Refactors (Phases 1–6)

Each phase follows the same algorithm:
1. **Read** the guide HTML (`Step-N.html`) and current `page.tsx` / client component
2. **Map** guide sections to current component tree
3. **Build** step-specific UI components (or restyle in place if simpler and safer)
4. **Recompose** the `page.tsx` JSX — replacing `CreateFlowShell` + `Card` with new layout + components
5. **Preserve** every `<form action=...>`, `<input name=...>`, `encType`, hidden inputs, server-action binding, error-message display, and draft pre-population
6. **Test**: Write a UI test covering form contract assertions (see §5)
7. **Verify**: Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

---

### Phase 1: Step 1 — The Child
**Guide**: `Step-1.html` (Split panel: photo drop-zone left, form right)
**Route**: `/create/child`
**Files to modify**: `src/app/(host)/create/child/page.tsx`
**New files**: `src/components/create-wizard/ChildPhotoDropZone.tsx`

#### What changes (UI only)
- Replace `<CreateFlowShell>` + `<Card>` with `<WizardStepper stepLabel="The child">` + `<WizardSplitLayout mobileOrder="right-first">`
- **Left panel**: New `ChildPhotoDropZone` — drag-and-drop area with preview circle, camera icon placeholder, "Change photo" overlay on hover. This wraps the existing `<input type="file" name="photo">` element. The file input's `name`, `accept`, and `required` attributes are preserved exactly.
- **Right panel**: `<WizardFormCard>` containing eyebrow, title, `WizardFieldWrapper` + `WizardTextInput` for child name and age, `WizardFieldTip` for age explanation, `WizardCTA` with "Continue to gift"
- Error banner: Replace inline markup with `<WizardAlertBanner variant="error">`
- Error resolution: Replace `getChildErrorMessage` with `resolveWizardError(error, childErrorMessages, { photo: '...', empty_file: '...' })`
- Draft photo preview: Use `<Image fill sizes="(max-width: 800px) calc(100vw - 40px), 430px" className="object-cover" />` inside a positioned container within the drop-zone. Do NOT keep `width={96} height={96}`.
- **Suspense boundary**: Wrap main content in `<Suspense fallback={<WizardSkeletonLoader variant="split" />}>`
- **Analytics**: Fire `wizard_step_viewed` on mount, `wizard_step_completed` on successful save

#### Mobile-specific amendments
> **Panel ordering (Risk 1)**: `mobileOrder="right-first"` ensures the form panel (right on desktop) appears first on mobile. The photo drop zone stacks below.
>
> **Photo upload copy (Risk 9)**: `ChildPhotoDropZone` must render different content by viewport:
> - Desktop: "Drag a photo here, or **browse**"
> - Mobile: "Tap to choose a photo" with two CTA options — "Choose from gallery" (triggers `<input type="file" accept="image/*">`) and "Take a photo" (triggers `<input type="file" accept="image/*" capture="environment">`)
> - Both inputs share the same `name="photo"` attribute (only one is active at a time)
> - Client-side file size check: if `file.size > 5 * 1024 * 1024`, show inline error "Photo must be under 5MB" and prevent form submission
> - **Nice-to-have (item #14)**: Circular crop preview matching Dreamboard avatar display (CSS `border-radius: 50%; overflow: hidden;`)
>
> **Input keyboard types (Ship-blocker #6)**:
> - `childName`: `autoCapitalize="words"` `enterKeyHint="next"` `autoComplete="given-name"`
> - `childAge`: `inputMode="numeric"` `pattern="[0-9]*"` `enterKeyHint="done"` `min={1}` `max={18}`
>
> **Draft persistence**: Call `useDraftPersistence('child', ['childName', 'childAge'])` in the page component. Restore on mount if server draft is empty.

#### What stays frozen
- `saveChildDetailsAction` — not touched
- `childSchema` — not touched
- `childErrorMessages` record — not touched (but error resolution function replaced with shared utility)
- `searchParams` error handling — not touched
- `requireHostAuth()` call — not touched
- `getDreamBoardDraft()` call — not touched
- `<form encType="multipart/form-data">` — preserved exactly
- FormData field names: `childName`, `childAge`, `photo` — unchanged

---

### Phase 2: Step 2 — The Gift
**Guide**: `Step-2.html` (Split panel: icon picker left, form right)
**Route**: `/create/gift`
**Files to modify**: `src/app/(host)/create/gift/page.tsx`, `src/components/gift/GiftIconPicker.tsx` (CSS classes only)

> **Decision (Issue 6)**: Do NOT create a new `GiftIconGrid` component. Instead, restyle `GiftIconPicker` in place. It is 226 lines of interaction-heavy code with debounced auto-suggestion, keyboard roving, refs, and ARIA semantics. Rewriting this from scratch carries very high regression risk. Since it is already feature-local (imported in only one place), restyling its CSS classes is far safer.

> **Pre-requisite (Issue 11)**: Write `GiftIconPicker.test.tsx` BEFORE restyling. See §5.2 for required test cases.

#### What changes (UI only)
- Replace layout with `<WizardStepper stepLabel="The gift">` + `<WizardSplitLayout mobileOrder="right-first">`
- **Left panel**: Restyle `GiftIconPicker.tsx` — change `className` strings to match design tokens: 48px icon buttons, hover scale, selected glow ring with sage instead of primary/teal, category label styling to match eyebrow pattern. **All JS logic (debounce, keyboard roving, refs, ARIA) stays untouched.**
- **Right panel**: `<WizardFormCard>` with eyebrow, title, `WizardFieldWrapper` + `WizardTextInput` for gift name, `WizardTextarea` for description + optional message, section divider, `WizardCTA` with back link + "Continue to dates"
- Error banner: Replace inline markup with `<WizardAlertBanner variant="error">`
- Stepper: 1 done + 1 active + 4 upcoming
- **Suspense boundary**: Wrap in `<Suspense fallback={<WizardSkeletonLoader variant="split" />}>`
- **Analytics**: Fire `wizard_step_viewed` on mount

#### Mobile-specific amendments
> **Panel ordering (Risk 1)**: `mobileOrder="right-first"` ensures the form panel (gift name, description) appears first on mobile. The icon picker stacks below.
>
> **Icon grid scroll trap (Risk 3)**: On mobile (≤800px), the icon grid's `max-height` / `overflow-y: auto` must be removed. Instead, add a **category filter** — a horizontal pill row above the grid:
> - Pills: one per category ("Active", "Creative", "Learning", "Imaginative", "Tech", "Experiences")
> - Styling: `display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 0 0 12px;`
> - Each pill: `padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; white-space: nowrap; scroll-snap-align: start;`
> - Active pill: `background: var(--sage); color: #fff;` Inactive: `background: var(--border-soft); color: var(--ink-soft);`
> - Only the active category's icons are visible. Others get `display: none` on mobile.
> - On desktop (≥801px), the pill row is hidden and all categories display as before with the scrollable container.
> - Implementation: this is a CSS-class-only change to `GiftIconPicker.tsx` — the category data already exists in the component. Add a state variable `activeMobileCategory` and filter rendered categories accordingly on mobile.
> - NOTE: This is a JS logic change to GiftIconPicker, but it is strictly UI behaviour (which category to show). The core selection/keyboard/ARIA logic is untouched.
>
> **Input keyboard types (Ship-blocker #6)**:
> - `giftName`: `autoCapitalize="words"` `enterKeyHint="next"`
> - `giftDescription`: (textarea — no enterKeyHint, newlines valid) `maxLength={500}`
> - `giftMessage`: (textarea — optional) `maxLength={200}`
>
> **Draft persistence**: Call `useDraftPersistence('gift', ['giftName', 'giftDescription', 'giftIconId', 'message'])`

#### What stays frozen
- `saveManualGiftAction` — not touched
- `manualGiftSchema` — not touched
- `suggestGiftIcon()` logic — not touched
- All `GiftIconPicker` JS logic — not touched (CSS classes only)
- Icon validation: `isValidGiftIconId()` — not touched
- FormData field names: `giftName`, `giftDescription`, `giftIconId`, `message` — unchanged

---

### Phase 3: Step 3 — The Dates
**Guide**: `Step-3.html` (Split panel: form left, live preview right)
**Route**: `/create/dates`
**Files to modify**: `src/app/(host)/create/dates/page.tsx`, `src/app/(host)/create/dates/DatesForm.tsx`
**New files**: `src/components/create-wizard/DatesPreviewPanel.tsx`

> **Decision (Issue 2)**: `DatesForm` (the client component) owns both panels. It renders `<WizardSplitLayout left={<form>...</form>} right={<DatesPreviewPanel ... />}>` internally. The server page renders `<WizardStepper>` + `<DatesForm>`. This keeps state co-located — no context or prop-drilling needed.

> **Decision (Issue 13)**: `DatesPreviewPanel` must be wrapped in `React.memo` and accept only primitive props (strings, numbers, booleans). Any derived computation (countdown, timeline positioning) must use `useMemo`.

#### What changes (UI only)
- **Server page**: Replace `<CreateFlowShell>` + `<Card>` with `<WizardStepper>` + `<DatesForm>` (DatesForm now owns the split layout)
- **DatesForm left panel**: Restyle with `<WizardFormCard>`, `WizardFieldWrapper` + `WizardTextInput`, `WizardFieldTip`, `WizardCTA`
- **DatesForm right panel**: New `DatesPreviewPanel` — live preview showing child name circle icon, "Maya turns 7!" title, birthday date, party day (conditional), countdown badge, timeline visualization (Today → Birthday → Closes) with dots and connecting lines
- Error banner: Replace inline markup with `<WizardAlertBanner variant="error">`

#### Mobile-specific amendments
> **Preview panel collapse (Risk 6)**: `<WizardPreviewPanel summaryLabel="Preview timeline ▸">` wraps the `DatesPreviewPanel`. On mobile, collapsed by default. On desktop, always visible.
>
> **Stepper**: `<WizardStepper stepLabel="The dates">` — 2 done + 1 active + 3 upcoming
>
> **Date picker enhancements (Nice-to-have #13)**:
> - `birthdayDate`: add `min={todayISO}` attribute to prevent past-date selection
> - Format label overlay: absolutely positioned `"DD / MM / YYYY"` label in `var(--ink-ghost)` inside the field wrapper; hidden on `:focus` or when the input has a value (`:not(:placeholder-shown)`)
> - `partyDateTimeTime` (party time): on mobile (≤800px), replace `<input type="time">` with `<WizardSelect>` containing 30-minute interval options ("12:00 PM", "12:30 PM"…). On desktop, keep `<input type="time">`. Use a responsive swap: `<WizardSelect className="md:hidden">` + `<WizardTextInput type="time" className="hidden md:block">`
> - On iOS, add `-webkit-appearance: none;` to date/time inputs for consistent styling
>
> **Input keyboard types (Ship-blocker #6)**:
> - `birthdayDate`: native date picker — no inputMode needed
> - `partyDate`: native date picker — no inputMode needed
> - `partyDateTimeTime`: `inputMode="numeric"` on desktop `<input type="time">`; the mobile `<WizardSelect>` doesn't need it
>
> **Tap targets (Risk 4)**: Party date checkbox (`partyDateEnabled`): the `<label>` wrapper must have `min-height: 48px; display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer;` to ensure the entire row is tappable.
>
> **Draft persistence**: Call `useDraftPersistence('dates', ['birthdayDate', 'partyDate', 'partyDateEnabled', 'partyDateTimeDate', 'partyDateTimeTime'])` in `DatesForm`. Restore on mount if server draft values are empty.
>
> **Suspense boundary**: Wrap in `<Suspense fallback={<WizardSkeletonLoader variant="split" />}>`
>
> **Analytics**: Fire `wizard_step_viewed` on mount, `wizard_step_completed` on successful save

#### What stays frozen
- `saveDatesAction` — not touched
- All date validation functions — not touched
- `DatesForm` state management logic (useState, useMemo) — preserved; only JSX output changes
- FormData field names: `birthdayDate`, `partyDate`, `partyDateEnabled`, `campaignEndDate`, `partyDateTimeDate`, `partyDateTimeTime` — unchanged
- Hidden inputs when `partyDateEnabled` is false: `<input type="hidden" name="partyDate">` and `<input type="hidden" name="campaignEndDate">` — preserved exactly
- Conditional rendering logic for party date fields — logic stays, visual treatment changes

---

### Phase 4: Step 4 — Giving Back
**Guide**: `Step-4.html` (Split panel: config left, impact preview right)
**Route**: `/create/giving-back`
**Files to modify**: `src/app/(host)/create/giving-back/page.tsx`, `src/app/(host)/create/giving-back/GivingBackForm.tsx`
**New files**: `src/components/create-wizard/GivingBackPreviewPanel.tsx`

> **Architecture**: Same as Phase 3 — `GivingBackForm` owns both panels via `<WizardSplitLayout>`.
> **Performance**: `GivingBackPreviewPanel` must be `React.memo`'d with primitive props only.

#### What changes (UI only)
- **Server page**: Replace layout with `<WizardStepper>` + `<GivingBackForm>` (form owns the split layout)
- **GivingBackForm left panel**: Restyle — toggle switch for enable/disable, charity list items with initial-badges in colored circles, split mode tabs (Percentage vs Threshold), amount input, `WizardFieldTip`, `WizardCTA`
- **GivingBackForm right panel**: New `GivingBackPreviewPanel` — impact breakdown with stacked bar chart visualization, summary rows with color-coded dots, charity info card, per-R100 breakdown example
- Error banner: `<WizardAlertBanner variant="error">`. No-charities warning: `<WizardAlertBanner variant="warning">`

#### Mobile-specific amendments
> **Preview panel collapse (Risk 6)**: `<WizardPreviewPanel summaryLabel="See impact breakdown ▸">` wraps the `GivingBackPreviewPanel`. On mobile, collapsed by default.
>
> **Stepper**: `<WizardStepper stepLabel="Giving back">` — 3 done + 1 active + 2 upcoming
>
> **Tap targets (Risk 4 — critical for this step)**:
> - Toggle switch (charity enable/disable): increase to `48×28px` outer, `24×24px` knob. The full row must be tappable: `min-height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 14px 0;`
> - Split-mode tabs (Percentage / Threshold): `min-height: 48px; padding: 14px 16px;` — on mobile, make full-width stacked vertically: `flex-direction: column; gap: 8px;` instead of side-by-side
> - Charity list items: `min-height: 52px; padding: 14px 16px;` — ensure the entire card area is tappable (not just the radio dot)
> - All tappable elements: add `touch-action: manipulation` class
>
> **Input keyboard types (Ship-blocker #6)**:
> - `charityPercentage`: `inputMode="numeric"` `pattern="[0-9]*"` `enterKeyHint="done"` `min={1}` `max={100}`
> - `charityThresholdAmount`: `inputMode="decimal"` `pattern="[0-9.]*"` `enterKeyHint="done"` `min={1}`
>
> **Progressive disclosure**: When `charityEnabled` is false on mobile, render a simplified card: "Giving back is off. All contributions go to the gift." with the toggle. Hide the charity list, split tabs, and amount input entirely (not just visually — do not render them). This reduces mobile scroll depth when the feature is unused.
>
> **Draft persistence**: Call `useDraftPersistence('giving-back', ['charityEnabled', 'charityId', 'charitySplitType', 'charityPercentage', 'charityThresholdAmount'])` in `GivingBackForm`. Restore on mount.
>
> **Suspense boundary**: Wrap in `<Suspense fallback={<WizardSkeletonLoader variant="split" />}>`
>
> **Analytics**: Fire `wizard_step_viewed` on mount, `wizard_step_completed` on successful save

#### What stays frozen
- `saveGivingBackAction` — not touched
- `LOCKED_CHARITY_SPLIT_MODES` gate logic — not touched
- `listActiveCharities()` fetch — not touched
- Conditional rendering logic (charity on/off, split type) — logic stays, visual treatment changes
- FormData field names: `charityEnabled`, `charityId`, `charitySplitType`, `charityPercentage`, `charityThresholdAmount` — unchanged
- Hidden inputs when `charityEnabled` is false (4 hidden inputs: charityId, charitySplitType, charityPercentage, charityThresholdAmount) — preserved exactly
- Hidden inputs for inactive split type (charityThresholdAmount when percentage mode, charityPercentage when threshold mode) — preserved exactly

---

### Phase 5: Step 5 — Payout Setup
**Guide**: `Step-5.html` (Split panel: form left, security preview right)
**Route**: `/create/payout`
**Files to modify**: `src/app/(host)/create/payout/page.tsx`, `src/app/(host)/create/payout/PayoutForm.tsx`
**New files**: `src/components/create-wizard/PayoutPreviewPanel.tsx`

> **Architecture**: Same as Phases 3–4 — `PayoutForm` owns both panels via `<WizardSplitLayout>`.
> **Performance**: `PayoutPreviewPanel` must be `React.memo`'d with primitive props only.

#### What changes (UI only)
- **Server page**: Replace layout with `<WizardStepper>` + `<PayoutForm>` (form owns the split layout)
- **PayoutForm left panel**: Restyle — method tabs (Karri Card / Bank Transfer) with icons, conditional form sections, contact details section, security field-tip with shield icon, `WizardCTA` with "Continue to review"
- **PayoutForm left panel**: Use `<WizardSelect>` for the bank name dropdown (Issue 8) — applies the same premium field styling as text inputs
- **PayoutForm right panel**: New `PayoutPreviewPanel` — selected method card (sage-wash bg), interactive progress checklist with done/pending states that update as user fills fields, security badge ("256-bit encrypted")
- Error banner: `<WizardAlertBanner variant="error">`

#### Mobile-specific amendments
> **Preview panel collapse (Risk 6)**: `<WizardPreviewPanel summaryLabel="See payout summary ▸">` wraps the `PayoutPreviewPanel`. On mobile, collapsed by default.
>
> **Stepper**: `<WizardStepper stepLabel="Payout setup">` — 4 done + 1 active + 1 upcoming
>
> **Tap targets (Risk 4)**: Method tabs (Karri Card / Bank Transfer): `min-height: 48px; padding: 14px 16px;` with clear active state. On mobile, make full-width: `flex: 1;` per tab.
>
> **Input keyboard types (Ship-blocker #6)**:
> - `karriCardNumber`: `inputMode="numeric"` `pattern="[0-9 ]*"` `autoComplete="cc-number"` `enterKeyHint="next"`
> - `karriCardHolderName`: `autoCapitalize="words"` `autoComplete="cc-name"` `enterKeyHint="next"`
> - `bankName`: `<WizardSelect>` — no keyboard attributes needed
> - `bankBranchCode`: `inputMode="numeric"` `pattern="[0-9]*"` `maxLength={6}` `enterKeyHint="next"`
> - `bankAccountNumber`: `inputMode="numeric"` `pattern="[0-9]*"` `enterKeyHint="next"`
> - `bankAccountHolder`: `autoCapitalize="words"` `enterKeyHint="next"`
> - `payoutEmail`: `type="email"` `inputMode="email"` `autoComplete="email"` `enterKeyHint="next"`
> - `hostWhatsAppNumber`: `type="tel"` `inputMode="tel"` `autoComplete="tel"` `enterKeyHint="done"`
>
> **Draft persistence**: Call `useDraftPersistence('payout', ['payoutMethod', 'karriCardNumber', 'karriCardHolderName', 'bankName', 'bankBranchCode', 'bankAccountNumber', 'bankAccountHolder', 'payoutEmail', 'hostWhatsAppNumber'])` in `PayoutForm`. Restore on mount.
> NOTE: `karriCardNumber` and `bankAccountNumber` are sensitive. `useDraftPersistence` stores to `sessionStorage` only (not `localStorage`) and clears on successful submission. This is acceptable for a single-session draft recovery — sessionStorage is tab-scoped and non-persistent.
>
> **Suspense boundary**: Wrap in `<Suspense fallback={<WizardSkeletonLoader variant="split" />}>`
>
> **Analytics**: Fire `wizard_step_viewed` on mount, `wizard_step_completed` on successful save

#### What stays frozen
- `savePayoutAction` — not touched
- Karri card verification — not touched
- Bank validation — not touched
- Encryption logic — not touched
- `LOCKED_PAYOUT_METHODS` gate logic — not touched
- FormData field names: `payoutMethod`, `karriCardNumber`, `karriCardHolderName`, `bankName`, `bankBranchCode`, `bankAccountNumber`, `bankAccountHolder`, `payoutEmail`, `hostWhatsAppNumber` — unchanged
- Conditional rendering logic (Karri vs Bank) — logic stays, visual treatment changes

---

### Phase 6: Step 6 — Review & Publish
**Guide**: `Step-6.html` (Centered single-column review card)
**Route**: `/create/review`
**Files to modify**: `src/app/(host)/create/review/page.tsx`, `src/app/(host)/create/review/ReviewClient.tsx`
**New files**: None expected (reuse shared components)

#### What changes (UI only)
- Replace current `ReviewClient` layout with `<WizardStepper>` (5 done + 1 active, no upcoming) + `<WizardCenteredLayout>`
- Mini Dreamboard preview section (child photo + name + gift strip)
- Review detail rows with icons (gift, dates, campaign close, payout, giving back)
- Edit links section with per-step links back to each wizard step
- `WizardCTA` with "Create Dreamboard" star icon and back button
- Post-publish state: celebration view with confetti, share panel — restyle with new design tokens while preserving all `useActionState` logic, share URL generation, WhatsApp/email templates, and copy-to-clipboard functionality

#### Mobile-specific amendments
> **Stepper**: `<WizardStepper stepLabel="Review">` — 5 done + 1 active + 0 upcoming
>
> **Layout**: `<WizardCenteredLayout>` — no split panel, no preview panel collapse needed. This step is correct as-is for mobile.
>
> **Publish loading overlay (Risk 5)**: On submit, show a full-screen overlay:
> - Container: `position: fixed; inset: 0; z-index: 50; background: rgba(251,248,243,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center;`
> - Content: Gifta logo icon (or gift-box SVG), "Creating your Dreamboard…" text in serif, 24px CSS spinner (sage), fade-in animation
> - `prefers-reduced-motion: reduce` → static content, no spinner animation
> - On success: transition to celebration view
> - On failure: dismiss overlay, show `WizardAlertBanner` with error and retry
>
> **Publish error with step routing**: If server-side validation fails on publish, the error banner should include a specific routing hint: "Something needs fixing in Step N ({stepName}). [Go to Step N →]" where the link navigates to the appropriate step's route.
>
> **Analytics**: Fire `wizard_step_viewed` on mount, `wizard_published` on successful publish with `totalDurationMs` calculated from wizard start time
>
> **Suspense boundary**: Wrap in `<Suspense fallback={<WizardSkeletonLoader variant="centered" />}>`
>
> **Draft persistence**: Not needed on Step 6 (read-only review, no form inputs)

#### What stays frozen
- `publishDreamBoardAction` — not touched
- `dreamBoardDraftSchema.safeParse()` — not touched
- `useActionState` hook contract — not touched
- Share URL generation — not touched
- WhatsApp/email share templates — not touched
- All draft prop types and values — not touched

---

## 5. Testing Strategy

Currently there are **zero** test files for the wizard. As per the playbook, "omitting tests because 'UI only'" is an anti-pattern.

### 5.1 Shared Component Tests (Phase 0)

> **Decision (Issue 9)**: Test the 4 most critical shared components independently. Simpler components (eyebrow, panel title, layouts) are thin wrappers tested adequately via page-level tests.

Create `src/components/create-wizard/__tests__/` with:

**`WizardStepper.test.tsx`** (~10 assertions):
- Renders correct number of dots for `totalSteps`
- Marks correct dot as active with `aria-current="step"`
- Completed steps show SVG checkmark (not step number)
- Upcoming steps show step number with muted styling
- Container has `aria-label` describing current step
- Lines render between dots (n-1 lines for n dots)

**`WizardCTA.test.tsx`** (~8 assertions):
- Submit button has `type="submit"`
- Submit button is not `type="button"`
- Back button renders as `<a>` or `<Link>` with correct `href`
- Back button does NOT have `type="submit"`
- When `pending` is true, submit button is `disabled`
- When `backHref` is omitted, no back button renders
- Container renders with `gap: 12px` flex layout

**`WizardTextInput.test.tsx`** (~6 assertions):
- Passes through `name`, `type`, `required`, `defaultValue` to underlying `<input>`
- `placeholder` text renders
- Focus ring classes are applied on focus
- Preserves `value` + `onChange` passthrough (controlled mode)

**`WizardAlertBanner.test.tsx`** (~4 assertions):
- `variant="error"` renders with error color classes
- `variant="warning"` renders with warning color classes
- When `children` is null/undefined, component does not render (or renders empty)
- Content text is visible in the rendered output

### 5.2 GiftIconPicker Regression Tests (Before Phase 2)

> **Decision (Issue 11)**: Write tests for the existing `GiftIconPicker` BEFORE restyling it. This creates a safety net for the riskiest file modification in the refactor.

Create `src/components/gift/__tests__/GiftIconPicker.test.tsx` (~10 assertions):
- Renders with `role="radiogroup"`
- Selected icon has `aria-checked="true"`
- Clicking an icon updates the hidden `<input name="giftIconId">` value
- Keyboard ArrowRight moves focus to the next icon
- Keyboard ArrowLeft moves focus to the previous icon
- Keyboard Enter selects the focused icon
- Keyboard Space selects the focused icon
- Initial selection matches `selectedIconId` prop
- After manual selection, auto-suggestion stops updating selection
- All icons have `aria-label` attributes

### 5.3 Page-Level Tests (Per Phase)

For each step, create a test file at `src/app/(host)/create/<step>/__tests__/page.test.tsx`.

#### Form Contract Assertion Checklist (Mandatory)

> **Decision (Issue 10)**: Every page test MUST include these assertions to catch form contract drift — the exact class of bugs this refactor is most likely to introduce.

For EVERY page test:
1. **Form element**: `<form>` exists with a truthy `action` prop (function, not undefined)
2. **Submit button**: A `<button type="submit">` exists inside the `<form>`
3. **Input names**: Every expected `<input name="...">` is present in the DOM
4. **Hidden inputs (both toggle states)**: For steps with conditional fields (3, 4), render with toggle ON and toggle OFF, asserting hidden inputs appear with correct `name` and `value` in both states
5. **encType**: For child page, assert `<form>` has `encType="multipart/form-data"`
6. **Controlled vs uncontrolled**: For client components (steps 3, 4, 5), assert that controlled inputs have `value` (not `defaultValue`); for server components (steps 1, 2), assert uncontrolled inputs have `defaultValue`

Additional per-page assertions:
7. **Error display**: Error banner renders when `?error=` param is present
8. **Draft pre-population**: When draft data exists, form fields have correct initial values
9. **Stepper state**: Correct step is marked active
10. **Conditional rendering**: (Steps 3, 4, 5) Conditional fields show/hide correctly

#### Testing rules (from playbook pitfalls)
- Always add `afterEach(cleanup)` in new Testing Library suites
- Use role-based assertions first (`getByRole`), not `getByText` when labels appear in multiple locations
- Use `getAllByText` only when duplicate labels are intentional

### 5.4 Server Component Mocking Strategy

> **Decision (Issue 12)**: Document the mocking patterns explicitly so the implementing agent doesn't have to solve the App Router testing puzzle from scratch.

#### Mock setup template for server component page tests (Steps 1, 2, 3 page, 4 page, 5 page, 6 page):

```tsx
// Mock auth
jest.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: jest.fn().mockResolvedValue({ hostId: 'test-host-id' }),
}));

// Mock draft — return a controlled draft object
jest.mock('@/lib/dream-boards/draft', () => ({
  getDreamBoardDraft: jest.fn().mockResolvedValue({
    childName: 'Maya',
    childAge: 7,
    childPhotoUrl: 'https://example.com/photo.jpg',
    // ... step-specific fields
  }),
  saveDreamBoardDraft: jest.fn(),
}));

// Mock navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock view model
jest.mock('@/lib/host/create-view-model', () => ({
  buildCreateFlowViewModel: jest.fn().mockReturnValue({
    stepLabel: 'Step N of 6',
    title: 'Test Title',
    subtitle: 'Test subtitle',
    redirectTo: null,
  }),
}));

// Mock next/image (renders as plain <img>)
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));
```

#### For client component tests (DatesForm, GivingBackForm, PayoutForm, ReviewClient):
No mocking needed — render directly with props:
```tsx
render(<DatesForm action={mockAction} defaultBirthdayDate="2026-03-15" ... />);
```

#### For GiftIconPicker tests:
Mock the icon library and `next/image`:
```tsx
jest.mock('@/lib/icons/gift-icons', () => ({
  GIFT_ICON_CATEGORIES: [{ id: 'test-cat', label: 'Test' }],
  getIconsByCategory: () => [{ id: 'icon-1', label: 'Bike', src: '/bike.png', bgColor: '#fff' }],
  getGiftIconById: (id: string) => ({ id, label: 'Bike', src: '/bike.png', bgColor: '#fff' }),
  isValidGiftIconId: () => true,
}));
```

### 5.5 Mobile Interaction Tests

> **Mobile amendment**: Add test coverage for the mobile-specific components and behaviours introduced by the UX assessment.

**`WizardCTA.test.tsx`** (extend existing — add ~6 assertions):
- When rendered at mobile width, sticky footer wrapper is present
- When `pending` is true, submit button text changes to `pendingLabel` value
- When `pending` is true, submit button has `aria-disabled="true"` and spinner is visible
- When `error` is set, `WizardAlertBanner` renders inside the sticky footer
- Back button has `pointer-events: none` when `pending` is true
- Double-submit prevention: calling onClick twice synchronously only fires once

**`WizardPreviewPanel.test.tsx`** (~6 assertions):
- On mobile, renders as a `<details>` element
- `<summary>` contains the `summaryLabel` text
- Default state is collapsed (no `open` attribute)
- On desktop (`md:contents`), content renders without `<details>` wrapper
- Expanding `<details>` reveals children content
- Chevron rotates on open (CSS class assertion)

**`WizardStepper.test.tsx`** (extend existing — add ~4 assertions):
- On mobile, progress bar is visible and dot row is hidden
- Progress bar width matches `(currentStep / totalSteps) * 100%`
- `stepLabel` text renders in the mobile label
- Progress bar has `role="progressbar"` with correct `aria-valuenow`

**`useDraftPersistence.test.ts`** (~6 assertions):
- `persistValues` writes to `sessionStorage` with correct key
- `restoreValues` reads from `sessionStorage` and returns stored object
- `clearDraft` removes the `sessionStorage` key
- `visibilitychange` event triggers immediate persist (no debounce)
- Debounced write happens after 500ms of inactivity
- Returns empty object when no stored values exist

**Page-level mobile assertions** (add to each page test):
- `inputMode` attribute is set correctly on numeric/tel/email fields
- `autoCapitalize` attribute is set on name fields
- `enterKeyHint` attribute is set on text inputs
- `autoComplete` attribute is set on fields with browser autofill support

---

## 6. Execution Order

The recommended execution sequence balances dependency order, progressive delivery, and the TDD-lite approach:

```
Phase 0    → Tailwind config + font verification + viewport meta
Phase 0m   → Mobile foundation components: WizardSkeletonLoader, WizardInlineError,
             useDraftPersistence, trackWizardEvent, WizardPreviewPanel mobile mode
Phase 0c   → Remaining shared foundation components (all §2 items)
Phase 0t   → Shared component tests (WizardStepper, WizardCTA, WizardTextInput,
             WizardAlertBanner, WizardPreviewPanel, useDraftPersistence)
Phase 0v   → Verify: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Phase 1    → Step 1 (The Child) — simplest split layout, validates foundation
             Includes: mobileOrder, stepLabel, photo upload mobile CTAs, keyboard types,
             draft persistence, skeleton, analytics
Phase 1t   → Write + run page test for Step 1 (incl. mobile attribute assertions)
Phase 2pre → Write GiftIconPicker.test.tsx (BEFORE restyling)
Phase 2    → Step 2 (The Gift) — restyle GiftIconPicker, add mobile category filter
             Includes: mobileOrder, stepLabel, keyboard types, draft persistence, skeleton
Phase 2t   → Write + run page test for Step 2, re-run GiftIconPicker tests
Phase 3    → Step 3 (The Dates) — first live preview panel, DatesForm owns layout
             Includes: preview collapse, date picker enhancements, tap targets, draft persistence
Phase 3t   → Write + run page test for Step 3
Phase 4    → Step 4 (Giving Back) — second preview panel, GivingBackForm owns layout
             Includes: preview collapse, tap target fixes (toggle, tabs, charity items),
             progressive disclosure, draft persistence
Phase 4t   → Write + run page test for Step 4
Phase 5    → Step 5 (Payout Setup) — third preview panel, PayoutForm owns layout
             Includes: preview collapse, keyboard types for all payout fields, draft persistence
Phase 5t   → Write + run page test for Step 5
Phase 6    → Step 6 (Review) — centered layout, publish flow
             Includes: publish loading overlay, step-routing error, analytics
Phase 6t   → Write + run page test for Step 6
Phase 7m   → Mobile polish: test sticky CTA on real viewports, verify tap targets,
             test draft persistence across interruptions, verify no nested scroll traps
Phase 7d   → Desktop polish: responsive testing, animation timing, hover states, keyboard nav
Phase 8    → Full verification gates (including mobile-specific checks from §7)
```

After each phase, run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

---

## 7. Verification Gate Checklist (Per Step)

For each step refactor, before marking complete:

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes (including new tests)
- [ ] `pnpm build` passes
- [ ] Manual visual parity check — desktop (compare to Step-N.html in browser)
- [ ] Manual visual parity check — mobile (< 800px viewport)
- [ ] Keyboard navigation works (Tab through fields, Enter to submit)
- [ ] Focus states visible on all interactive elements
- [ ] Heading structure valid (h1 > h2 > h3, no skipped levels)
- [ ] Form submission works end-to-end (fill fields → submit → redirects to next step)
- [ ] Error states work (submit with missing fields → error banner appears)
- [ ] Draft pre-population works (go forward, come back → data persists)
- [ ] Shell boundaries untouched (header/footer unchanged)
- [ ] Form contract preserved (all `<input name>`, hidden inputs, encType, action, controlled/uncontrolled)

### Mobile-Specific Verification (Per Step)

- [ ] Sticky CTA footer visible on mobile (≤800px) without scrolling
- [ ] CTA buttons: Continue on top, Back below (column-reverse)
- [ ] All tap targets ≥ 44px (use browser DevTools "show element dimensions" to verify)
- [ ] No nested scroll containers (test by scrolling in an icon grid / charity list — page should scroll, not inner container)
- [ ] `inputMode` attributes set on all numeric/tel/email fields (inspect DOM)
- [ ] `autoCapitalize` set on all name fields
- [ ] `enterKeyHint` set on all text inputs
- [ ] `autoComplete` set on all fields with browser autofill support
- [ ] Preview panels collapsed by default on mobile
- [ ] Stepper shows progress bar (not dots) on mobile
- [ ] Draft persistence: fill fields → switch tabs → return → values restored
- [ ] Loading state: tap Continue → button shows "Saving…" + spinner → button is not tappable again
- [ ] Error state on mobile: error banner appears inside sticky footer (not at top of page)
- [ ] Photo upload (Step 1): no "drag" language on mobile; gallery + camera CTAs visible
- [ ] Icon grid (Step 2): category filter pills visible on mobile; no inner scroll container
- [ ] Viewport: `viewport-fit=cover` set in meta tag (verify via `document.querySelector('meta[name=viewport]')`)
- [ ] Safe-area: sticky footer respects `env(safe-area-inset-bottom)` on iPhone

---

## 8. Fidelity Scoring (Self-Check at End)

Apply the playbook rubric (0–5 per category, release target: no category < 4, average ≥ 4.5):

| Category | What to check |
|---|---|
| Layout parity | Section order, split-panel alignment, 940px width, card spacing |
| Visual hierarchy | Serif heading dominance, eyebrow treatment, CTA prominence, card layering |
| Spacing system | Consistent 28px gap, 24px field margins, 32px CTA margin, 48px padding |
| Typography parity | Libre Baskerville / DM Sans pairing, 22px/19px titles, 11px eyebrow, 13px labels |
| Interaction parity | Field hover/focus states, button hover, edit-link transitions, icon picker selection |
| Responsive parity | 800px breakpoint, single column collapse, column-reverse CTAs, 20px mobile padding |
| Accessibility parity | Semantic form markup, visible focus rings, ARIA labels, proper heading levels |

---

## 9. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| `CreateFlowShell` is imported by other features | Removing it could break other pages | Create new components; do NOT edit/delete `CreateFlowShell`. Each step page simply stops importing it. |
| `WizardStepIndicator` is used outside wizard | Breaking change if edited | Create new `WizardStepper`; do NOT edit existing. |
| Client component state hooks change signature | Server action contract breaks | Preserve all `useState` / `useActionState` hook shapes exactly; only change JSX return. |
| Guide HTML uses hardcoded demo data | Copy/paste would introduce fake content | Use guide for *structure and styling only*; keep all dynamic data from draft/server. |
| DatesForm / PayoutForm / GivingBackForm are complex client components | Refactoring JSX risks breaking conditional logic | Work incrementally — change one section at a time, test after each change. |
| No existing tests to catch regressions | Could silently break form contracts | Write tests for each step BEFORE refactoring the step (TDD-lite approach). Write GiftIconPicker tests before restyling. |
| Guide nav/footer differ from app shell | Could accidentally copy guide shell elements | Playbook rule: never import guide nav/footer implementations. No `WizardFooter` will be created. |
| Review page may already be partially refactored | Could conflict with new changes | Read current `ReviewClient.tsx` carefully before modifying; preserve any existing refactored patterns that align with the target. |
| Existing `fadeUp` keyframe differs from wizard spec | Modifying it would break other pages | Added `wizardFadeUp` with `translateY(14px)` alongside existing keyframe. Wizard components use `animate-wizard-fade-up`. |
| Preview panels re-render on every keystroke | Jank on form inputs in Steps 3, 4, 5 | All preview panels must be `React.memo`'d with primitive props only; derived computation must use `useMemo`. |
| Icon grid renders all icons eagerly | Potential performance concern if icon count grows | Acceptable for current count (~80). If icon library grows beyond 200, consider virtualization. |
| Fonts may not be loaded via `next/font` | FOUT, CLS, render-blocking if loaded via `<link>` | Phase 0 includes explicit font loading verification; use `next/font/google` with `display: 'swap'`. |
| Child photo `<Image>` may serve wrong size | Blurry photo in larger drop-zone container | Phase 1 specifies `<Image fill sizes="...">` with appropriate breakpoint sizing. |
| Draft data loss on mobile interruption | User fills 3 steps, switches to WhatsApp, returns to a blank form | `useDraftPersistence` hook saves to `sessionStorage` on input change (debounced) and on `visibilitychange`. Restores on mount. |
| Double form submission on slow mobile data | Server action fires twice, creating duplicate data or errors | `WizardCTA` uses `useRef` flag + `aria-disabled` + `pointer-events: none` on first submit. Flag resets when `pending` clears. |
| Nested scroll trap in icon grid (Step 2) | Mobile user gets stuck scrolling inside the icon container instead of the page | Mobile category filter shows one category at a time; no `max-height` / `overflow-y: auto` on mobile. |
| Android native date picker UX | `<input type="date">` shows raw `yyyy-mm-dd` before interaction; time picker clock face is confusing | Format label overlay (`DD / MM / YYYY`), `min` attribute for past-date prevention, `WizardSelect` with 30-min intervals for time on mobile. |
| Sticky CTA z-index collision with modals or header | Footer overlaps other UI layers | `z-index: 10` is below typical modal z-index (50+). Verify against header z-index. |
| `sessionStorage` quota exceeded on low-end devices | Draft persistence silently fails | Wrap `setItem` in try/catch; on quota error, log warning and continue without persistence. |

---

## 10. Deliverables Checklist

At the end of the full refactor:

- [ ] ~19 new components/utilities in `src/components/create-wizard/` (up from ~15 — added WizardInlineError, WizardSkeletonLoader, useDraftPersistence, trackWizardEvent)
- [ ] 6 recomposed page files (one per step)
- [ ] 3 restyled client components (`DatesForm`, `PayoutForm`, `GivingBackForm`) — each now owns its split layout
- [ ] 3 new preview panel components (Steps 3, 4, 5) — all `React.memo`'d
- [ ] 1 new photo drop-zone component (Step 1) — with mobile gallery/camera CTAs
- [ ] 1 restyled `GiftIconPicker` (Step 2) — CSS + mobile category filter state
- [ ] 6 shared component test files (up from 4 — added WizardPreviewPanel, useDraftPersistence)
- [ ] 1 GiftIconPicker regression test file
- [ ] 6 page-level test files (one per step) — all include Form Contract Assertion Checklist + mobile attribute assertions
- [ ] Tailwind config updates (shadow-input, radii, wizard-fade-up, shimmer, spin, touch-action utility)
- [ ] Viewport meta verified (`viewport-fit=cover`)
- [ ] Font loading verified/configured
- [ ] Zero changes to server actions, schemas, draft logic, auth, or DB
- [ ] All verification gates passing (including mobile-specific checks)
- [ ] Updated `AI-UI-REFACTOR-PLAYBOOK.md` with new pitfalls/lessons learned
- [ ] New `MOBILE-INTERACTION-SPEC.md` document with draft model, error/retry, back-button, and analytics specs

---

## 11. Summary File Map

```
NEW FILES:
  src/components/create-wizard/
    index.ts                          — Barrel export
    WizardStepper.tsx                 — Dual-mode stepper (desktop dots / mobile progress bar)
    WizardSplitLayout.tsx             — Split panel grid with mobileOrder prop
    WizardCenteredLayout.tsx          — Single-column centered card (Step 6)
    WizardEyebrow.tsx                 — Amber uppercase label
    WizardPanelTitle.tsx              — Serif heading (form/preview variants)
    WizardFieldWrapper.tsx            — Field container with label, error, and tip slots
    WizardTextInput.tsx               — Styled <input> with keyboard attribute passthrough
    WizardTextarea.tsx                — Styled <textarea>
    WizardSelect.tsx                  — Styled <select>
    WizardFieldTip.tsx                — Amber info-tip box
    WizardCTA.tsx                     — CTA row with sticky mobile footer, loading state, error display
    WizardFormCard.tsx                — Card wrapper for form panels
    WizardPreviewPanel.tsx            — Preview card with mobile <details>/<summary> collapse
    WizardAlertBanner.tsx             — Error/warning/info banner with onRetry support
    WizardInlineError.tsx             — Field-level inline error with icon
    WizardSkeletonLoader.tsx          — CSS-only shimmer skeleton (split/centered variants)
    resolveWizardError.ts             — Error code → message resolver
    useDraftPersistence.ts            — sessionStorage draft persistence hook
    trackWizardEvent.ts               — Analytics event utility (typed events)
    ChildPhotoDropZone.tsx            — Photo upload with mobile gallery/camera CTAs
    DatesPreviewPanel.tsx             — Timeline preview (React.memo)
    GivingBackPreviewPanel.tsx        — Impact breakdown preview (React.memo)
    PayoutPreviewPanel.tsx            — Payout summary preview (React.memo)
    __tests__/
      WizardStepper.test.tsx          — Desktop + mobile mode tests
      WizardCTA.test.tsx              — Submit contract + sticky footer + loading state
      WizardTextInput.test.tsx        — Prop passthrough + keyboard attributes
      WizardAlertBanner.test.tsx      — Variant rendering + retry button
      WizardPreviewPanel.test.tsx     — Mobile collapse + desktop transparency
      useDraftPersistence.test.ts     — Storage read/write/clear + visibilitychange

MODIFIED FILES (UI only):
  src/app/(host)/create/child/page.tsx
  src/app/(host)/create/gift/page.tsx
  src/app/(host)/create/dates/page.tsx
  src/app/(host)/create/dates/DatesForm.tsx
  src/app/(host)/create/giving-back/page.tsx
  src/app/(host)/create/giving-back/GivingBackForm.tsx
  src/app/(host)/create/payout/page.tsx
  src/app/(host)/create/payout/PayoutForm.tsx
  src/app/(host)/create/review/page.tsx
  src/app/(host)/create/review/ReviewClient.tsx
  src/components/gift/GiftIconPicker.tsx     (CSS + mobile category filter state)
  tailwind.config.ts                         (shadow-input, radii, wizard-fade-up, shimmer, spin, touch-action)
  src/app/layout.tsx                         (font imports + viewport-fit=cover — if not already present)

NEW TEST FILES:
  src/components/gift/__tests__/GiftIconPicker.test.tsx
  src/app/(host)/create/child/__tests__/page.test.tsx
  src/app/(host)/create/gift/__tests__/page.test.tsx
  src/app/(host)/create/dates/__tests__/page.test.tsx
  src/app/(host)/create/giving-back/__tests__/page.test.tsx
  src/app/(host)/create/payout/__tests__/page.test.tsx
  src/app/(host)/create/review/__tests__/page.test.tsx

NEW DOCUMENTATION:
  docs/UI-refactors/Create-wizard/MOBILE-INTERACTION-SPEC.md

FROZEN (read-only):
  src/app/(host)/create/page.tsx
  src/app/(host)/create/*/actions.ts     (all 5)
  src/lib/dream-boards/draft.ts
  src/lib/dream-boards/schema.ts
  src/lib/dream-boards/validation.ts
  src/lib/host/create-view-model.ts
  src/lib/ux-v2/decision-locks.ts
  src/lib/auth/clerk-wrappers.ts
  src/lib/integrations/blob.ts
  src/components/layout/*                (app shell — except font import in layout.tsx)
  src/components/ui/*                    (shared primitives)
```

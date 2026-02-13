# Create Wizard UI Refactor — Implementation Plan

> **Scope**: Pure UI/UX refactor of Steps 1–6 of the Dreamboard creation wizard.
> **Governing rules**: `docs/UI-refactors/AI-UI-REFACTOR-PLAYBOOK.md`
> **Guide HTML files**: `docs/UI-refactors/Create-wizard/Step-1.html` through `Step-6.html`
> **No backend, DB, schema, auth, payment, or server-action behaviour changes.**

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
| **Animations** | `fade-up` utility exists in config; not used in wizard |
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
| **Animations** | `fadeUp 0.35s` stepper, `fadeUp 0.45s 0.08s` content |
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
- `src/components/layout/Header.tsx` / `Footer.tsx` / root `layout.tsx` (app shell)
- Any DB schema, migration, or API route files

### Contracts to preserve
- All `<form action={serverAction}>` bindings — same action targets
- All `<input name="...">` names — FormData contract unchanged
- All URL routes (`/create/child`, `/create/gift`, etc.) — unchanged
- All `redirect()` destinations inside server actions — unchanged
- All error code URL params (`?error=invalid`, etc.) — unchanged
- All `searchParams` parsing in page components — unchanged
- All conditional rendering driven by `draft` state — logic preserved, presentation changed

---

## 2. Shared Foundation Components (Phase 0)

Before touching any step page, build the shared UI primitives that all 6 steps depend on. These go in a **new feature-local folder**: `src/components/create-wizard/`.

### 2.1 New `WizardStepper` component
**File**: `src/components/create-wizard/WizardStepper.tsx`
**Replaces**: The stepper currently rendered by `CreateFlowShell` → `WizardStepIndicator`

Design spec (from Step-1.html through Step-6.html):
- Container: `max-width: 940px`, `margin: 0 auto`, `padding: 0 48px`, `margin-top: 32px`, `margin-bottom: 36px`, `animation: fadeUp 0.35s ease-out both`
- Dot: 32px circles, `font-size: 12px`, `font-weight: 600`
- Done state: `bg-sage text-white` with SVG checkmark (`<svg width="14" height="14" ...><polyline points="20 6 9 17 4 12"/></svg>`)
- Active state: `bg-sage text-white` + `box-shadow: 0 0 0 3px var(--sage-light)`
- Upcoming state: `bg-border-soft text-ink-ghost`
- Lines: `flex: 1`, `height: 2px`, `margin: 0 4px`; done = sage, default = border-soft
- Mobile (< 800px): `padding: 0 20px`
- Props: `currentStep: number`, `totalSteps: number`
- Accessibility: Preserve `aria-label`, `aria-current="step"` from existing component

**Action**: Create new. Do NOT edit `WizardStepIndicator.tsx` (it may be used elsewhere).

### 2.2 New `WizardSplitLayout` component
**File**: `src/components/create-wizard/WizardSplitLayout.tsx`

Layout wrapper for the split-panel pattern used in Steps 1–5:
- Container: `max-width: 940px`, `margin: 0 auto`, `padding: 0 48px`, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 28px`, `align-items: start`, `animation: fadeUp 0.45s ease-out 0.08s both`
- Responsive (< 800px): `grid-template-columns: 1fr`, `padding: 0 20px`, `gap: 24px`
- Props: `left: ReactNode`, `right: ReactNode`

### 2.3 New `WizardCenteredLayout` component
**File**: `src/components/create-wizard/WizardCenteredLayout.tsx`

Layout wrapper for the centered card pattern used in Step 6:
- Outer: `max-width: 940px`, `margin: 0 auto`, `padding: 0 48px`, `animation: fadeUp 0.45s ease-out 0.08s both`
- Card: `max-width: 600px`, `margin: 0 auto`, `bg-card`, `border-radius: 28px`, `shadow-card`, `padding: 40px 36px 36px`
- Responsive (< 800px): `padding: 0 20px`, card `padding: 28px 24px 24px`
- Props: `children: ReactNode`

### 2.4 New `WizardEyebrow` component
**File**: `src/components/create-wizard/WizardEyebrow.tsx`

Eyebrow text pattern used on every step:
- `font-size: 11px`, `font-weight: 600`, `color: amber`, `text-transform: uppercase`, `letter-spacing: 0.12em`, `margin-bottom: 8px`
- Props: `children: ReactNode` (e.g. "Step 1 of 6 — The child")

### 2.5 New `WizardPanelTitle` component
**File**: `src/components/create-wizard/WizardPanelTitle.tsx`

Serif heading used on every step:
- Left/form panels: `font-family: serif`, `font-size: 22px`
- Right/preview panels: `font-family: serif`, `font-size: 19px`
- Props: `children: ReactNode`, `variant?: 'form' | 'preview'`

### 2.6 New `WizardField` / `WizardFieldLabel` / `WizardFieldInput` components
**File**: `src/components/create-wizard/WizardField.tsx`

Premium form field pattern:
- `.field`: `margin-bottom: 24px`
- `.field-label`: `font-size: 13px`, `font-weight: 500`, `color: ink-mid`, `margin-bottom: 8px`
- `.field-input`: `padding: 14px 18px`, `bg: bg`, `border: 1.5px solid border`, `border-radius: 12px`, `font-size: 15px`, `shadow-input`, `outline: none`, `transition: all 0.25s`
- `::placeholder`: `color: ink-ghost`, `font-weight: 300`
- `:hover`: `border-color: ink-ghost`
- `:focus`: `border-color: sage`, `box-shadow: 0 0 0 3px sage-light + shadow-input`, `bg: card`
- These wrap the existing `<Input>` / `<Textarea>` components with styling overrides — NOT replacing them, since the underlying `<input>` element's `name`, `type`, `required`, `defaultValue` props must stay identical.

### 2.7 New `WizardFieldTip` component
**File**: `src/components/create-wizard/WizardFieldTip.tsx`

Amber info-tip pattern:
- `background: amber-light`, `border-radius: 10px`, `padding: 10px 14px`, `display: flex`, `align-items: flex-start`, `gap: 8px`
- Icon: 16px SVG, `color: amber`
- Text: `font-size: 12px`, `color: ink-mid`, `line-height: 1.5`
- Props: `icon?: ReactNode`, `children: ReactNode`

### 2.8 New `WizardCTA` component
**File**: `src/components/create-wizard/WizardCTA.tsx`

CTA button row:
- Container: `margin-top: 32px`, `display: flex`, `gap: 12px`
- Back button: `flex: 1`, `14px 20px`, `transparent bg`, `1.5px solid border`, `14px radius`, `14px font`, `600 weight`, back-arrow SVG
- Primary CTA: `flex: 1`, `14px 20px`, `sage bg`, `14px radius`, `14px font`, `600 weight`, forward-arrow SVG (or star for Step 6)
- Responsive (< 800px): `flex-direction: column-reverse`
- Props: `backLabel?: string`, `backHref?: string`, `submitLabel: string`, `submitIcon?: 'arrow' | 'star'`, `pending?: boolean`
- IMPORTANT: The primary button must be `<button type="submit">` to preserve the form action contract. The back button is a link (`<a>` or Next.js `<Link>`), NOT a form submission.

### 2.9 New `WizardFormCard` component
**File**: `src/components/create-wizard/WizardFormCard.tsx`

Card wrapper for the left (form) panel:
- `bg: card`, `border-radius: 28px`, `shadow-card`, `padding: 36px 32px 32px`
- Responsive: `padding: 28px 24px 24px`
- Contains eyebrow + title + form content
- Props: `children: ReactNode`

### 2.10 New `WizardPreviewPanel` component
**File**: `src/components/create-wizard/WizardPreviewPanel.tsx`

Card wrapper for the right (preview) panel:
- `bg: card`, `border-radius: 28px`, `shadow-card`, `overflow: hidden`
- Header section: `padding: 32px 32px 0` with eyebrow + title (19px)
- Content section: `bg: bg`, `border: 1.5px solid border`, `border-radius: 20px`, `margin: 32px`, `padding: 32px 28px`
- Props: `eyebrow?: string`, `title: string`, `children: ReactNode`

### 2.11 New `WizardFooter` component
**File**: `src/components/create-wizard/WizardFooter.tsx`

Page footer (distinct from app shell footer):
- `max-width: 940px`, `margin: 56px auto 0`, `padding: 0 48px 40px`, `text-align: center`
- Text: `font-size: 11.5px`, `color: ink-ghost`
- No border-top
- NOTE: Only create this if the current app shell footer does not suffice visually. If the existing `<Footer>` renders below each page anyway, this may be unnecessary — check before building.

### 2.12 Index barrel export
**File**: `src/components/create-wizard/index.ts`

Re-exports all components for clean imports.

---

## 3. Tailwind Configuration Check (Phase 0b)

Before building components, verify the `tailwind.config.ts` already contains all needed tokens. Based on codebase analysis, the config already has `sage`, `amber`, `plum`, `ink` color palettes. Verify and add if missing:

- [ ] `--font-display` maps to `'Libre Baskerville', Georgia, serif`
- [ ] `--font-primary` maps to `'DM Sans', -apple-system, sans-serif`
- [ ] `shadow-card` utility: `0 1px 2px rgba(44,37,32,0.03), 0 4px 12px rgba(44,37,32,0.04), 0 12px 36px rgba(44,37,32,0.04)`
- [ ] `shadow-input` utility: `0 1px 3px rgba(44,37,32,0.04)`
- [ ] Radius tokens: `radius-lg: 28px`, `radius-md: 20px`, `radius-sm: 14px`
- [ ] Animation: `fadeUp` keyframe with `translateY(14px)` → `translateY(0)`

Any missing tokens get added to `tailwind.config.ts`. This is explicitly within scope as it is a styling-only change with no behavioral impact.

---

## 4. Step-by-Step Refactors (Phases 1–6)

Each phase follows the same algorithm:
1. **Read** the guide HTML (`Step-N.html`) and current `page.tsx` / client component
2. **Map** guide sections to current component tree
3. **Build** step-specific UI components in `src/components/create-wizard/` (or inline in page if simple)
4. **Recompose** the `page.tsx` JSX — replacing `CreateFlowShell` + `Card` with new layout + components
5. **Preserve** every `<form action=...>`, `<input name=...>`, server-action binding, error-message display, and draft pre-population
6. **Test**: Write a UI test covering key form rendering and submit contract
7. **Verify**: Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

---

### Phase 1: Step 1 — The Child
**Guide**: `Step-1.html` (Split panel: photo drop-zone left, form right)
**Route**: `/create/child`
**Files to modify**: `src/app/(host)/create/child/page.tsx`
**New files**: `src/components/create-wizard/ChildPhotoDropZone.tsx`

#### What changes (UI only)
- Replace `<CreateFlowShell>` + `<Card>` with `<WizardStepper>` + `<WizardSplitLayout>`
- **Left panel**: New `ChildPhotoDropZone` — drag-and-drop area with preview circle, camera icon placeholder, "Change photo" overlay on hover. This wraps the existing `<input type="file" name="photo">` element. The file input's `name`, `accept`, and `required` attributes are preserved exactly.
- **Right panel**: `<WizardFormCard>` containing eyebrow, title, `WizardField` for child name and age, `WizardFieldTip` for age explanation, `WizardCTA` with "Continue to gift"
- Error banner preserved: same `errorMessage` logic, styled with new design tokens
- Draft photo preview: `<Image>` component still used when `draft?.childPhotoUrl` exists, but placed inside the drop-zone circle instead of a separate row

#### What stays frozen
- `saveChildDetailsAction` — not touched
- `childSchema` — not touched
- `childErrorMessages` map — not touched
- `searchParams` error handling — not touched
- `requireHostAuth()` call — not touched
- `getDreamBoardDraft()` call — not touched
- FormData field names: `childName`, `childAge`, `photo` — unchanged

---

### Phase 2: Step 2 — The Gift
**Guide**: `Step-2.html` (Split panel: icon picker left, form right)
**Route**: `/create/gift`
**Files to modify**: `src/app/(host)/create/gift/page.tsx`
**New files**: `src/components/create-wizard/GiftIconGrid.tsx`

#### What changes (UI only)
- Replace layout with `<WizardStepper>` + `<WizardSplitLayout>`
- **Left panel**: New `GiftIconGrid` — scrollable icon grid with category tabs (Active & Outdoors, Creative, Learning, etc.), 48px icon buttons with hover scale and selected glow ring. This wraps the existing `<GiftIconPicker>` behavior — the same icons, same selection logic, same hidden `<input name="giftIconId">` contract.
- **Right panel**: `<WizardFormCard>` with eyebrow, title, `WizardField` for gift name + description textarea + optional message textarea, section divider, `WizardCTA` with back link + "Continue to dates"
- Stepper: 1 done + 1 active + 4 upcoming

#### What stays frozen
- `saveManualGiftAction` — not touched
- `manualGiftSchema` — not touched
- `suggestGiftIcon()` logic — not touched
- Icon validation: `isValidGiftIconId()` — not touched
- FormData field names: `giftName`, `giftDescription`, `giftIconId`, `message` — unchanged

---

### Phase 3: Step 3 — The Dates
**Guide**: `Step-3.html` (Split panel: form left, live preview right)
**Route**: `/create/dates`
**Files to modify**: `src/app/(host)/create/dates/page.tsx`, `src/app/(host)/create/dates/DatesForm.tsx`
**New files**: `src/components/create-wizard/DatesPreviewPanel.tsx`

#### What changes (UI only)
- Replace layout with `<WizardStepper>` + `<WizardSplitLayout>`
- **Left panel**: Restyle `DatesForm.tsx` — replace `<Card>` with `<WizardFormCard>`, replace bare `<Input>` with `<WizardField>`, add `WizardFieldTip`, `WizardCTA`
- **Right panel**: New `DatesPreviewPanel` — live preview showing child name circle icon, "Maya turns 7!" title, birthday date, party day (conditional), countdown badge, timeline visualization (Today → Birthday → Closes) with dots and connecting lines
- The preview panel reads from `DatesForm`'s local state (same `useState` hooks: `birthdayDate`, `partyDateEnabled`, `partyDate`). These state variables already exist in `DatesForm.tsx` — we are only changing how they render, not what they compute.

#### What stays frozen
- `saveDatesAction` — not touched
- All date validation functions — not touched
- `DatesForm` state management logic (useState, useMemo) — preserved; only JSX output changes
- FormData field names: `birthdayDate`, `partyDate`, `partyDateEnabled`, `campaignEndDate`, `partyDateTimeDate`, `partyDateTimeTime` — unchanged
- Conditional rendering logic for party date fields — logic stays, visual treatment changes

---

### Phase 4: Step 4 — Giving Back
**Guide**: `Step-4.html` (Split panel: config left, impact preview right)
**Route**: `/create/giving-back`
**Files to modify**: `src/app/(host)/create/giving-back/page.tsx`, `src/app/(host)/create/giving-back/GivingBackForm.tsx`
**New files**: `src/components/create-wizard/GivingBackPreviewPanel.tsx`

#### What changes (UI only)
- Replace layout with `<WizardStepper>` + `<WizardSplitLayout>`
- **Left panel**: Restyle `GivingBackForm.tsx` — toggle switch for enable/disable, charity list items with initial-badges in colored circles, split mode tabs (Percentage vs Threshold), amount input, `WizardFieldTip`, `WizardCTA`
- **Right panel**: New `GivingBackPreviewPanel` — impact breakdown with stacked bar chart visualization, summary rows with color-coded dots, charity info card, per-R100 breakdown example
- Preview panel reads from `GivingBackForm`'s local state (same hooks: `charityEnabled`, `selectedCharityId`, `splitType`, `percentage`, `thresholdAmount`). Logic preserved; presentation upgraded.

#### What stays frozen
- `saveGivingBackAction` — not touched
- `LOCKED_CHARITY_SPLIT_MODES` gate logic — not touched
- `listActiveCharities()` fetch — not touched
- Conditional rendering logic (charity on/off, split type) — logic stays, visual treatment changes
- FormData field names: `charityEnabled`, `charityId`, `charitySplitType`, `charityPercentage`, `charityThresholdAmount` — unchanged

---

### Phase 5: Step 5 — Payout Setup
**Guide**: `Step-5.html` (Split panel: form left, security preview right)
**Route**: `/create/payout`
**Files to modify**: `src/app/(host)/create/payout/page.tsx`, `src/app/(host)/create/payout/PayoutForm.tsx`
**New files**: `src/components/create-wizard/PayoutPreviewPanel.tsx`

#### What changes (UI only)
- Replace layout with `<WizardStepper>` + `<WizardSplitLayout>`
- **Left panel**: Restyle `PayoutForm.tsx` — method tabs (Karri Card / Bank Transfer) with icons, conditional form sections, contact details section, security field-tip with shield icon, `WizardCTA` with "Continue to review"
- **Right panel**: New `PayoutPreviewPanel` — selected method card (sage-wash bg), interactive progress checklist with done/pending states that update as user fills fields, security badge ("256-bit encrypted")
- Preview checklist reacts to `PayoutForm`'s local state — same hooks, only JSX changes.

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

### New test files to create
For each step, create a test file at `src/app/(host)/create/<step>/__tests__/page.test.tsx` covering:

1. **Rendering contract**: Form renders with correct `<input name="...">` elements
2. **Error display**: Error banner renders when `?error=` param is present
3. **Draft pre-population**: When draft data exists, form fields have correct `defaultValue`
4. **Submit button**: Submit button exists and is within a `<form>` with correct `action`
5. **Stepper state**: Correct step is marked active
6. **Conditional rendering**: (Steps 3, 4, 5) Conditional fields show/hide correctly

### Testing rules (from playbook pitfalls)
- Always add `afterEach(cleanup)` in new Testing Library suites
- Use role-based assertions first (`getByRole`), not `getByText` when labels appear in multiple locations
- Use `getAllByText` only when duplicate labels are intentional

---

## 6. Execution Order

The recommended execution sequence balances dependency order and progressive delivery:

```
Phase 0   → Shared foundation components + Tailwind config verification
Phase 0b  → Manual visual check of shared components in isolation (optional Storybook or test page)
Phase 1   → Step 1 (The Child) — simplest split layout, validates foundation
Phase 2   → Step 2 (The Gift) — icon picker complexity, validates GiftIconGrid
Phase 3   → Step 3 (The Dates) — first live preview panel
Phase 4   → Step 4 (Giving Back) — second preview panel (impact chart)
Phase 5   → Step 5 (Payout Setup) — third preview panel (checklist)
Phase 6   → Step 6 (Review) — centered layout, publish flow
Phase 7   → Cross-step polish: responsive testing, animation timing, a11y audit
Phase 8   → Full verification gates
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
| No existing tests to catch regressions | Could silently break form contracts | Write tests for each step BEFORE refactoring the step (TDD-lite approach). |
| Guide nav/footer differ from app shell | Could accidentally copy guide shell elements | Playbook rule: never import guide nav/footer implementations. |
| Review page may already be partially refactored | Could conflict with new changes | Read current `ReviewClient.tsx` carefully before modifying; preserve any existing refactored patterns that align with the target. |

---

## 10. Deliverables Checklist

At the end of the full refactor:

- [ ] 10–12 new components in `src/components/create-wizard/`
- [ ] 6 recomposed page files (one per step)
- [ ] 3 restyled client components (`DatesForm`, `PayoutForm`, `GivingBackForm`)
- [ ] 3 new preview panel components (Steps 3, 4, 5)
- [ ] 1 new photo drop-zone component (Step 1)
- [ ] 1 new icon grid component (Step 2)
- [ ] 6 new test files (one per step)
- [ ] Tailwind config updates (if needed)
- [ ] Zero changes to server actions, schemas, draft logic, auth, or DB
- [ ] All 4 verification gates passing
- [ ] Updated `AI-UI-REFACTOR-PLAYBOOK.md` with new pitfalls/lessons learned

---

## 11. Summary File Map

```
NEW FILES:
  src/components/create-wizard/
    index.ts
    WizardStepper.tsx
    WizardSplitLayout.tsx
    WizardCenteredLayout.tsx
    WizardEyebrow.tsx
    WizardPanelTitle.tsx
    WizardField.tsx
    WizardFieldTip.tsx
    WizardCTA.tsx
    WizardFormCard.tsx
    WizardPreviewPanel.tsx
    WizardFooter.tsx          (if needed)
    ChildPhotoDropZone.tsx
    GiftIconGrid.tsx
    DatesPreviewPanel.tsx
    GivingBackPreviewPanel.tsx
    PayoutPreviewPanel.tsx

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
  tailwind.config.ts          (token additions only, if needed)

NEW TEST FILES:
  src/app/(host)/create/child/__tests__/page.test.tsx
  src/app/(host)/create/gift/__tests__/page.test.tsx
  src/app/(host)/create/dates/__tests__/page.test.tsx
  src/app/(host)/create/giving-back/__tests__/page.test.tsx
  src/app/(host)/create/payout/__tests__/page.test.tsx
  src/app/(host)/create/review/__tests__/page.test.tsx

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
  src/components/layout/*                (app shell)
  src/components/ui/*                    (shared primitives)
```

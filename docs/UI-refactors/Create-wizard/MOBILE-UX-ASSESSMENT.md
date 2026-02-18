# Create Wizard — Adversarial Mobile UX Assessment

> **Date**: 2026-02-18
> **Assessor**: Automated adversarial review
> **Inputs**: Step-1.html through Step-6.html, IMPLEMENTATION-PLAN.md, DESIGN-TOKENS.md, AI-UI-REFACTOR-PLAYBOOK.md
> **Primary user**: South African parent (host), typically on mid-range Android phone, often on mobile data

---

## A) Verdict

**Not mobile-ready (Confidence: High).**

The plan delivers a polished desktop experience with a single `@media (max-width: 800px)` breakpoint that collapses a two-column grid to one column. But it treats mobile as a CSS afterthought — stacking desktop panels vertically without rethinking scroll depth, tap targets, input ergonomics, navigation persistence, or the critical absence of draft persistence. On a 360×640 Android device, Steps 2 and 4 will require 5+ screen-heights of scrolling. The CTA buttons are not sticky, so after filling a form users must scroll past the preview panel (which they didn't ask to see) to find "Continue." There is no loading state, no skeleton, no optimistic transition, and no draft/resume model. These are not polish issues — they are funnel killers.

---

## B) Top 10 Critical Mobile Risks (Ranked)

### Risk 1: CTA buttons buried below preview panels on mobile

**Why it breaks mobile**: On mobile the split layout collapses to a single column: form panel first, then preview panel below. But the Back/Continue buttons live inside the form panel's bottom. When the form panel is short (Steps 3, 4), users see the buttons — but the preview panel sits below, creating a confusing page structure. Worse, in Steps 1 and 2, the left panel (photo/icon) stacks *above* the form, so the CTA is pushed far down. Users have to scroll past content they can't interact with (the preview) or content they already handled (the photo drop zone) to reach the action.

**Fix**: Make the CTA footer **sticky on mobile**. On `≤800px`, render `<WizardStickyFooter>` — a fixed-bottom bar with `position: sticky; bottom: 0; z-index: 10; background: var(--card); border-top: 1px solid var(--border); padding: 12px 20px; box-shadow: 0 -2px 8px rgba(0,0,0,0.04);` containing the Back + Continue buttons. The in-flow CTA is hidden on mobile (or acts as a scroll sentinel). This ensures the primary action is always one thumb-tap away.

---

### Risk 2: No draft persistence — full data loss on refresh, back-button, or app switch

**Why it breaks mobile**: Mobile users are interrupted constantly (notifications, calls, app switches). The current wizard uses server actions on each step, but there is no client-side draft persistence. If a user fills Step 1-3, switches to WhatsApp to check a name, and returns — the browser may have purged the page. All progress is lost. The plan mentions no `sessionStorage`, `localStorage`, or server-side draft model.

**Fix**: Implement a lightweight draft model. On each step submission (server action success), persist the Dreamboard draft ID in a cookie or URL param. The server already creates/updates a Dreamboard row — ensure each step's `page.tsx` fetches and pre-populates from the existing draft on mount. This is a backend-adjacent concern but critical for mobile trust. As a UI-only fallback, persist form values to `sessionStorage` on input change (debounced, 500ms) and restore on mount. Add a `beforeunload` listener on desktop and `visibilitychange` on mobile to trigger save.

---

### Risk 3: Icon grid (Step 2) is a scroll trap on small screens

**Why it breaks mobile**: The icon grid has ~60 icons across 6 categories inside a scrollable container with `max-height: 280px` on mobile. Inside a page that is already scrollable, this creates a "scroll within scroll" trap. Touch users will try to scroll the page and get caught inside the icon grid. With 44×44px buttons and 8px gaps, only ~5-6 icons fit per row on a 320px-wide container, creating 10+ rows per category.

**Fix**: On mobile, remove the inner `max-height` / `overflow-y: auto` and let the icon grid flow naturally in the page. Add a category filter (horizontal pill row at top: "Active", "Creative", "Learning"…) that shows one category at a time. This eliminates nested scrolling and reduces cognitive load from 60 simultaneous options to ~10-14. Use `scroll-snap-type: x mandatory` on the pill row for smooth horizontal navigation. Each category section should be collapsible (accordion) as a fallback if the filter approach is rejected.

---

### Risk 4: Tap targets below minimum on key interactive elements

**Why it breaks mobile**: Multiple elements fail the 44×44px minimum:
- Stepper dots: 32×32px (below minimum, but not tappable — acceptable if truly non-interactive)
- Icon buttons (mobile): 44×44px — borderline, with 8px gap = 52px pitch. Acceptable but tight.
- Checkbox visual (Step 3): 20×20px tap target, rescued only by the `<label>` wrapper
- Toggle switch (Step 4): 44×24px — too short vertically
- Charity items (Step 4): padding 12px 14px on 13px text — total height ~44px. Borderline.
- Split-mode tabs (Step 4): padding 12px 16px — height ~40px. Below minimum.
- Timeline markers in preview (Step 3): 10px dots — not tappable, but visually confusing

**Fix**: Apply these minimum sizes:
- Toggle switch: increase to `48×28px`, with `::after` knob `24×24px`
- Split-mode tabs: `min-height: 48px; padding: 14px 16px;`
- Charity items: `min-height: 52px; padding: 14px 16px;`
- Checkbox wrapper: add `min-height: 44px;` to the `<label>` wrapper
- Add `touch-action: manipulation` to all interactive elements to eliminate 300ms delay on older WebViews

---

### Risk 5: No loading / submission feedback — "did my tap work?"

**Why it breaks mobile**: Every step submits via a server action. On mobile data (common in South Africa: 3G/LTE with 200-800ms RTT), there is no visual feedback between tapping "Continue" and the next page rendering. Users will double-tap, creating duplicate submissions. The plan mentions no loading state, no disabled-while-submitting pattern, no optimistic UI, and no skeleton for the next step.

**Fix**: On submit:
1. Immediately set `aria-disabled="true"` on the CTA button and swap text to "Saving…" with a subtle spinner (16px, sage color, CSS animation — no extra JS bundle).
2. Add `pointer-events: none; opacity: 0.7;` to the button.
3. On the incoming page, show a skeleton layout (stepper + card outline) for up to 300ms before content hydrates. Use a CSS-only skeleton: `background: linear-gradient(90deg, var(--border-soft) 25%, var(--bg) 50%, var(--border-soft) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;`
4. Prevent double submission: set a `useRef` flag on first submit, only allow re-submit after server action resolves or after a 10-second timeout (with error recovery).

---

### Risk 6: Preview panels add scroll depth with low mobile value

**Why it breaks mobile**: Steps 3, 4, and 5 show a preview panel (timeline, impact breakdown, payout summary). On desktop, these sit side-by-side — useful for live feedback. On mobile, they stack below the form, adding 300-500px of scroll depth. Most mobile users will never scroll down to see them. The preview content repeats what the user just entered, offering little value at the cost of making the page feel "endless."

**Fix**: On mobile (`≤800px`), collapse each preview panel into a `<details>` / `<summary>` element (or a controlled accordion) with summary text like "Preview timeline ▸". Default: **collapsed**. This preserves the preview for users who want it while eliminating 300-500px of mandatory scrolling. The `<summary>` should be styled as a small, rounded bar: `background: var(--border-soft); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: var(--ink-soft);`. On desktop, always show expanded (no `<details>` wrapper needed — just CSS: `@media (min-width: 801px) { .preview-collapse { display: block !important; } }`).

---

### Risk 7: Date/time pickers are OS-dependent and ugly on Android

**Why it breaks mobile**: Steps 3 uses `<input type="date">` and `<input type="time">`. On iOS, these render well. On Android (especially older Chrome WebViews), the native date picker is a calendar modal that can be confusing, and the time picker uses a clock face that many users find unintuitive. The `type="date"` input also renders differently (placeholder format varies by locale), and the input can show raw `yyyy-mm-dd` text before interaction — which looks broken.

**Fix**: Keep native `<input type="date">` and `<input type="time">` (they are accessible and performant), but add these UI enhancements:
1. Set `min` attribute to today's date to prevent past dates.
2. Add a visible placeholder label inside the field wrapper (absolutely positioned) that shows the expected format: "DD / MM / YYYY" in `var(--ink-ghost)`. Hide it on `:focus` or when the input has a value (using `:not(:placeholder-shown)` or a sibling selector).
3. For the time picker specifically, consider a custom `<select>` with 30-minute intervals ("12:00 PM", "12:30 PM"…) instead of the raw `<input type="time">`, which is more thumb-friendly and avoids the Android clock face. This can be the `WizardSelect` component already in the plan.
4. On iOS, add `-webkit-appearance: none;` and style the input consistently.

---

### Risk 8: Mobile stepper provides no progress context on narrow screens

**Why it breaks mobile**: The stepper is 6 dots × 32px + 5 connectors across the screen. On a 360px-wide device with 20px side padding, that's 320px available. 6×32=192px of dots + 5 × ~25px connectors = ~317px. It barely fits, with connectors squeezed to minimum width. The numbers (1-6) at 12px are hard to read. There is no step label — the user sees 6 circles but has no idea what each step represents without the eyebrow text inside the card below.

**Fix**: On mobile, replace the dot stepper with a **compact progress bar + label** pattern:
```
Step 3 of 6 — The dates
[████████░░░░░░░░]  50%
```
Implementation: a single horizontal bar (`height: 4px; border-radius: 2px; background: var(--border-soft);`) with a filled portion (`background: var(--sage);`), plus the eyebrow text above it. This takes up less vertical space, is easier to read, and scales perfectly to any width. On desktop (`>800px`), keep the dot stepper (it works well at that width). The component should accept both modes and switch via a Tailwind responsive class.

---

### Risk 9: Photo upload (Step 1) has no mobile-optimised capture flow

**Why it breaks mobile**: The photo drop zone says "Drag a photo here, or **browse**". Drag-and-drop doesn't exist on mobile. The `<input type="file" accept="image/*">` works, but the UX is suboptimal: the user taps, gets the OS file picker, and must navigate to their camera roll. There is no option to take a photo directly, and the visual language (drag, browse) is desktop-centric.

**Fix**: On mobile:
1. Change copy to "Tap to choose a photo" (no "drag" mention).
2. Add `capture="environment"` as an attribute on a second file input (or use `accept="image/*;capture=camera"`) to offer a "Take a photo" option. Render two CTAs inside the drop zone on mobile: a primary "Choose from gallery" button and a secondary "Take a photo" button. Each triggers a different `<input type="file">` with different `capture` attributes.
3. Show a circular crop preview (matching the Dreamboard's avatar display) instead of the rectangular `object-fit: cover` preview, so the user understands how their photo will appear.
4. Add a size check client-side: if `file.size > 5MB`, show an inline error immediately (don't submit and fail server-side).

---

### Risk 10: No error recovery model for mid-step API failures

**Why it breaks mobile**: On flaky mobile connections, server actions can fail silently. The plan mentions `WizardAlertBanner` for displaying errors, but there is no defined retry model, no offline detection, and no guidance on what happens when a submission fails after the user has already scrolled past the form. On mobile with a sticky footer, the error banner may appear at the top of the scrollable area — invisible to the user.

**Fix**: Define an explicit error model:
1. On server action failure, scroll to top and show `WizardAlertBanner` with: error message, a "Try again" button that re-submits the form, and a "Save for later" option that persists to draft.
2. Add `navigator.onLine` check before submission. If offline, show a toast: "You're offline. We'll save your progress and retry when you're back." (Requires the draft persistence from Risk 2.)
3. Position the error banner **inside the sticky footer on mobile** (not at the top of the page). On mobile, the footer is always visible — place a small red error bar above the buttons: `background: #FEE2E2; color: #991B1B; border-radius: 8px; padding: 8px 12px; font-size: 12px; margin-bottom: 8px;`
4. Add exponential backoff for retry: immediate, 2s, 5s, then show "Connection issue — please check your network."

---

## C) Step-by-Step Mobile Optimisation Checklist

### Step 1: Child Details

**Screen layout**: Single column. On mobile, reverse panel order: form panel first (name, age), photo panel second. Rationale: text fields are the minimum viable data; photo is optional. Users should not have to scroll past a large drop zone to reach the form.

**Input patterns**:
- `childName`: `type="text"`, `autocapitalize="words"`, `enterkeyhint="next"`, `inputmode="text"`
- `childAge`: `type="number"`, `inputmode="numeric"`, `pattern="[0-9]*"` (triggers numeric keypad on iOS), `min="1"`, `max="18"`, `enterkeyhint="done"`
- Photo: `accept="image/jpeg,image/png,image/webp"`, mobile: add `capture` attribute, client-side 5MB check

**Navigation**: Sticky footer with "Continue to gift →" (no back button on Step 1).

**Validation**:
- `childName`: required, min 1 char, max 50 chars. Validate on blur. Show inline error below field: red text `font-size: 12px; color: #B91C1C;` with icon.
- `childAge`: required, integer 1-18. Validate on blur. Show inline error if out of range.
- Photo: optional. No validation beyond file type and size (client-side).
- On submit: validate all fields. If invalid, focus first invalid field, scroll it into view with `scrollIntoView({ behavior: 'smooth', block: 'center' })`.

---

### Step 2: Gift Details

**Screen layout**: Single column on mobile. On mobile, form panel first (gift name, description, message), icon panel second. The icon panel should use the category-filter pattern (horizontal pill row) to avoid nested scroll.

**Input patterns**:
- `giftName`: `type="text"`, `autocapitalize="words"`, `enterkeyhint="next"`
- `giftDescription`: `<textarea>`, `rows="3"`, `enterkeyhint="done"` — or no enterkeyhint (newlines are valid in textarea). `maxlength="500"` with character counter.
- `giftMessage`: `<textarea>`, `rows="2"`, optional
- Icon picker: buttons with `role="radiogroup"`, roving tabindex. On mobile, 44×44px minimum. Show selected icon in a confirmation bar below the grid.

**Navigation**: Sticky footer with "← Back" + "Continue to dates →"

**Validation**:
- `giftName`: required, min 2 chars, max 100 chars. Inline on blur.
- `giftDescription`: required, min 10 chars, max 500 chars. Inline on blur.
- `giftIconId`: required. If missing on submit, scroll to icon picker and show "Please choose an icon" above the grid.
- `giftMessage`: optional, max 200 chars.

---

### Step 3: Dates

**Screen layout**: Single column on mobile. Form panel only. Preview panel collapsed into accordion ("Preview timeline ▸").

**Input patterns**:
- `birthdayDate`: `<input type="date">`, `min={today}`. On Android, consider a friendly label overlay.
- Party checkbox: large tap target (full row, min-height 48px).
- `partyDate` / `partyTime`: conditionally visible. `partyTime` should be a `<WizardSelect>` with 30-minute intervals on mobile. On desktop, keep `<input type="time">`.
- `campaignEndDate`: auto-calculated (= birthday date). Display as read-only information, not an input.

**Navigation**: Sticky footer with "← Back" + "Continue to giving back →"

**Validation**:
- `birthdayDate`: required, must be today or future. Inline on blur.
- `partyDate` (if enabled): required, must be ≥ today. Inline on blur.
- `partyTime` (if enabled): required if partyDate is set.
- Cross-field: if `partyDate` < `birthdayDate`, show warning (not error) — parties can be before birthdays.

---

### Step 4: Giving Back

**Screen layout**: Single column on mobile. Form panel only. Preview panel (impact breakdown) collapsed into accordion ("See impact breakdown ▸").

**Input patterns**:
- Toggle: large switch (`48×28px`), full-row tap target.
- Charity list: scrollable list of cards, `min-height: 52px` each, clear selected state.
- Split tabs: `min-height: 48px`, full-width on mobile (not side-by-side — stack vertically or keep side-by-side with larger padding).
- Amount input: `type="number"`, `inputmode="numeric"`, centered text, clear prefix/suffix.

**Navigation**: Sticky footer. If toggle is off, skip the charity/split fields entirely (progressive disclosure). Show a simplified card: "Giving back is off. All contributions go to the gift."

**Validation**:
- If giving enabled: charity required, amount required (1-100 for percentage, 1-999999 for threshold).
- Amount: inline on blur, with clear error for out-of-range.

---

### Step 5: Payout Setup

**Screen layout**: Single column on mobile. Form panel only. Preview panel (payout summary) collapsed into accordion ("See payout summary ▸").

**Input patterns**:
- Method tabs: `min-height: 48px`, clear active state.
- Card number: `inputmode="numeric"`, `pattern="[0-9 ]*"`, `autocomplete="cc-number"`. Auto-format with spaces every 4 digits (mask).
- Card holder name: `type="text"`, `autocomplete="cc-name"`, `autocapitalize="words"`.
- Bank name: use `WizardSelect` with predefined SA bank list (FNB, Standard Bank, Absa, Nedbank, Capitec, etc.) — not a free-text input.
- Account number: `inputmode="numeric"`, `pattern="[0-9]*"`.
- Branch code: `inputmode="numeric"`, `pattern="[0-9]*"`, `maxlength="6"`.
- Email: `type="email"`, `inputmode="email"`, `autocomplete="email"`.
- WhatsApp: `type="tel"`, `inputmode="tel"`, `autocomplete="tel"`. Pre-fill country code "+27" if user is in South Africa.

**Navigation**: Sticky footer with "← Back" + "Continue to review →"

**Validation**:
- Karri card: required card number (16 digits), required card holder name.
- Bank: required bank (from select), required account number, required branch code (6 digits).
- Email: required, valid email format.
- WhatsApp: optional, if provided must be valid phone format.
- All validation inline on blur.

---

### Step 6: Review

**Screen layout**: Single centered column (max-width 600px). No split layout. This is correct as-is.

**Input patterns**: None (read-only review). Edit links navigate back to specific steps.

**Navigation**: Sticky footer with "← Back" + "✨ Create Dreamboard". The Create button should have special emphasis: slightly larger, with a subtle animation on hover/focus. On submit, show a full-screen loading overlay with "Creating your Dreamboard…" and a progress animation.

**Validation**: None on this step. All validation happened on prior steps. If server-side validation fails on publish, show the error in a prominent banner and indicate which step needs correction: "Something needs fixing in Step 3 (Dates). [Go to Step 3]"

---

## D) Desktop Optimisations (Essential Differences vs Mobile)

1. **Keep the split layout**: The 1fr 1fr grid works well above 800px. Preview panels are always visible, not collapsed.

2. **Keep the dot stepper**: The 6-dot stepper with connectors works at desktop width. No need for the progress bar variant.

3. **No sticky footer**: On desktop, the form panel is shorter and the CTA is always visible within one scroll. Remove sticky behaviour above 800px.

4. **Keyboard navigation**: Add `tabindex` order that flows: form fields → CTA → preview panel (for screen readers). Add keyboard shortcuts: `Enter` to submit (already default for forms), `Escape` to go back (with confirmation if form is dirty). On Step 2, arrow-key navigation through icons (already planned via roving tabindex).

5. **Hover states**: Keep all hover effects (translateY, color transitions). These are already well-defined in the design tokens.

6. **Edit-back pattern on Step 6**: Desktop users can use edit links that open the target step in the same tab. Consider a side-drawer or inline-expand pattern on desktop (optional, "nice to have") for faster editing without full page navigation.

---

## E) Interaction Spec Additions Required

### E.1 State / Draft Model

**Current plan says**: Nothing. Each step submits a server action but there is no mention of draft persistence, partial saves, or recovery.

**Required spec**:
- Each step's server action creates or updates a `Dreamboard` record in `draft` status.
- The draft ID is stored in the URL (e.g., `/create/child?id=abc123`) and/or in a secure cookie.
- On page load, each step fetches the current draft and pre-populates form fields.
- If the user refreshes or returns, they resume from where they left off.
- As a UI-only enhancement: `sessionStorage` saves form values on input change (debounced 500ms). On mount, if the server draft is older than the sessionStorage values, prefer sessionStorage. Clear sessionStorage on successful submission.

### E.2 Error / Retry Behaviour

**Current plan says**: `WizardAlertBanner` exists for error display. No retry model.

**Required spec**:
- On server action failure: show `WizardAlertBanner` with error message + "Try again" button.
- "Try again" re-invokes the server action with the same form data. No re-validation needed (values haven't changed).
- If failure persists after 3 attempts: show "We're having trouble saving. Your progress has been saved locally. Please try again in a moment." Persist to sessionStorage.
- On network offline: intercept before submission. Show inline toast. Queue the submission. On `navigator.onLine` recovery, auto-retry once with user notification.

### E.3 Back Button + Refresh Behaviour

**Current plan says**: Nothing.

**Required spec**:
- Browser back button: navigates to previous step (standard Next.js routing). No confirmation dialog unless the form is dirty and unsaved.
- "Dirty form" detection: compare current form values to last-submitted values. If different, show a `beforeunload` prompt on desktop ("You have unsaved changes. Leave page?"). On mobile, rely on draft persistence instead of prompts (mobile prompts are unreliable).
- Browser refresh: restore from draft/sessionStorage (see E.1).
- Native swipe-back gesture (iOS Safari): same as back button — navigate to previous step.

### E.4 Analytics Events for Funnel + Drop-off

**Current plan says**: Nothing.

**Required spec (minimum viable)**:
- `wizard_step_viewed`: fired on each step mount. Payload: `{ step: 1-6, draftId, timestamp }`
- `wizard_step_completed`: fired on successful server action. Payload: `{ step: 1-6, draftId, durationMs, timestamp }`
- `wizard_step_error`: fired on server action failure. Payload: `{ step: 1-6, errorType, timestamp }`
- `wizard_abandoned`: fired on `visibilitychange` (hidden) or `beforeunload` if on a step other than 6. Payload: `{ step: 1-6, draftId, durationMs, formDirty: boolean }`
- `wizard_published`: fired on successful Dreamboard creation. Payload: `{ draftId, totalDurationMs }`
- Implementation: fire via a `trackWizardEvent(name, payload)` utility that delegates to whatever analytics provider is configured. For now, `console.log` in dev, no-op in production until a provider is wired up.

---

## F) Minimal Changes vs Optional Enhancements

### Must Change Now (Ship-Blockers)

1. **Sticky CTA footer on mobile** (Risk 1) — Without this, users cannot find the Continue button.
2. **Loading / disabled state on CTA buttons** (Risk 5) — Without this, users will double-submit on slow connections.
3. **Mobile panel ordering** (Risk 1) — Steps 1-2 must render form first, visual panel second on mobile.
4. **Tap target minimums** (Risk 4) — Toggle, tabs, and charity items must be at least 44px tall.
5. **Mobile photo upload copy** (Risk 9) — Remove "drag" language on mobile, add mobile-appropriate CTAs.
6. **Input keyboard types** (Section C) — Add `inputmode`, `autocapitalize`, `enterkeyhint`, and `autocomplete` attributes to every input.

### Should Change Soon

7. **Draft persistence via sessionStorage** (Risk 2) — Prevents data loss on the most common mobile interruption paths.
8. **Preview panel collapse on mobile** (Risk 6) — Reduces scroll depth by 300-500px per step.
9. **Error recovery model with retry** (Risk 10) — Prevents silent failures on flaky connections.
10. **Compact progress bar stepper on mobile** (Risk 8) — Replaces squeezed dot stepper with a cleaner, more informative progress indicator.
11. **Icon grid category filter on mobile** (Risk 3) — Eliminates nested scroll trap.
12. **Analytics events** (Section E.4) — Critical for measuring funnel drop-off and validating the refactor's impact.

### Nice to Have

13. **Date/time picker enhancements** (Risk 7) — Custom time select, format label overlay. Native pickers work; these are polish.
14. **Circular crop preview for photo** (Risk 9) — Helps user understand how their photo will display.
15. **Offline detection and queued submission** (Section E.2) — Full offline support is complex; sessionStorage covers most cases.
16. **Desktop keyboard shortcuts** (Section D) — Escape to go back, etc.
17. **Server-side draft model** (Section E.1) — The full server-draft implementation may be out of scope for a UI-only refactor; sessionStorage is the UI-only fallback.

---

## G) Gold Standard Micro-Spec: Create Wizard

### Layout Rules

| Rule | Spec |
|------|------|
| Max width | `940px` centered, `padding: 0 48px` desktop, `0 20px` mobile |
| Breakpoint | Single: `800px`. Below = mobile layout. |
| Desktop grid | `grid-template-columns: 1fr 1fr; gap: 28px;` |
| Mobile grid | `grid-template-columns: 1fr;` — form panel always first in DOM order on mobile |
| Card padding | Desktop: `36px 32px 32px`. Mobile: `28px 24px 24px`. |
| Step 6 | Centered single column, `max-width: 600px`. |
| Sticky CTA | Mobile only. `position: sticky; bottom: 0; padding: 12px 20px; background: var(--card); border-top: 1px solid var(--border); box-shadow: 0 -2px 8px rgba(0,0,0,0.04);` |
| Preview panels | Desktop: always visible. Mobile: collapsed accordion, default closed. |

### Component Rules

| Component | Spec |
|-----------|------|
| Stepper (desktop) | 32px sage dots, 2px connector lines, SVG checkmark for done, 3px sage-light ring on active |
| Stepper (mobile) | 4px progress bar + "Step N of 6 — {label}" text. No dots. |
| WizardFieldWrapper | `margin-bottom: 24px;` wrapper for label + input + error + tip |
| WizardTextInput | `padding: 14px 18px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 15px;` Focus: sage border + 3px sage-light ring |
| WizardTextarea | Same as TextInput + `resize: vertical; min-height: 88px;` |
| WizardSelect | Same as TextInput + custom chevron icon. `appearance: none;` |
| WizardAlertBanner | Desktop: top of form card. Mobile: inside sticky footer, above buttons. `background: #FEE2E2; color: #991B1B; border-radius: 8px; padding: 8px 12px;` |
| Back + Continue | `min-height: 48px; border-radius: 14px; font-size: 14px; font-weight: 600;` Desktop: `flex-direction: row;` Mobile: `flex-direction: column-reverse;` (Continue on top) |
| Loading state | On submit: `aria-disabled="true"; opacity: 0.7; pointer-events: none;` Text: "Saving…" with 16px CSS spinner |

### Copy Rules

| Context | Rule |
|---------|------|
| Step titles | Use serif font, warm/personal tone ("Who's the birthday star?", not "Enter child details") |
| Field labels | Sentence case, 13px, `var(--ink-mid)`. Never ALL CAPS. |
| Placeholders | Conversational examples: "e.g. Maya", "e.g. Red mountain bike" |
| Tips | Start with the benefit, not the instruction: "This will be shown on the Dreamboard as…" |
| Errors | Specific, human: "Please enter the child's name" (not "Field is required"). Never blame the user. |
| CTA text | Use "Continue to {next step name}" pattern. Final step: "Create Dreamboard" (not "Submit"). |
| Mobile photo | "Tap to choose a photo" (not "Drag a photo here, or browse") |

### Validation Rules

| Rule | Spec |
|------|------|
| Timing | Validate on blur for each field. Re-validate on change after first error. Validate all on submit. |
| Display | Inline below the field. Red text (`#B91C1C`), 12px, with a small ⚠ icon. |
| Focus management | On submit with errors: focus the first invalid field. `scrollIntoView({ behavior: 'smooth', block: 'center' })`. |
| Server errors | Show in `WizardAlertBanner` with retry button. Include specific field errors if the server returns them. |
| Cross-field | Validate on submit only (e.g., partyDate vs birthdayDate). |

### Performance Rules

| Rule | Spec |
|------|------|
| Font loading | Use `next/font/google` with `display: 'swap'` for DM Sans and Libre Baskerville. Verify in Phase 0. No external Google Fonts `<link>` tag in production. |
| Image sizing | Child photo: `<Image fill sizes="(max-width: 800px) 100vw, 50vw">`. Icon images: `width={32} height={32}` (or 28 on mobile). |
| Transition budget | Max 350ms for any animation. `prefers-reduced-motion: reduce` disables all `fadeUp` animations. |
| Skeleton loading | CSS-only shimmer. No JS dependency. `background-size: 200% 100%; animation: shimmer 1.5s infinite;` |
| Bundle impact | Zero new JS libraries. All new components are CSS + React primitives. `React.memo` on preview panels with primitive props. |
| Touch delay | `touch-action: manipulation` on all interactive elements. |
| Viewport | Ensure `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`. The `viewport-fit=cover` handles iPhone notch/safe area. |

---

## Assumptions Made

1. The primary mobile user is a South African parent on a mid-range Android device (Samsung Galaxy A-series equivalent), ~360-412px wide, on LTE or 3G.
2. The refactor is UI-only — but some "should change soon" items (draft persistence, error retry) require minimal backend awareness. I've separated these clearly.
3. The existing server actions already create/update a Dreamboard draft — the draft ID is available after Step 1 completes.
4. The existing Next.js App Router handles browser back/forward navigation correctly (no SPA router issues).
5. No offline-first requirement — but basic resilience to connection interruptions is expected.
6. The charity list (Step 4) is a fixed set of 5 charities, not dynamically loaded.
7. The icon set (Step 2, ~60 icons) is statically imported, not fetched from an API.

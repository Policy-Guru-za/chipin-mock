# Create Wizard — Mobile Interaction Spec

> **Purpose**: Defines the interaction behaviours that go beyond visual styling — draft persistence, error/retry model, back-button/refresh handling, and analytics events. These behaviours were identified as missing in the adversarial mobile UX assessment and are now required for implementation.
>
> **Cross-references**:
> - Visual tokens and CSS patterns: `docs/UI-refactors/DESIGN-TOKENS.md` §7
> - Component specs and per-step amendments: `docs/UI-refactors/Create-wizard/IMPLEMENTATION-PLAN.md` §2, §4
> - Assessment rationale: `docs/UI-refactors/Create-wizard/MOBILE-UX-ASSESSMENT.md`

---

## E.1 State / Draft Model

### Server-side draft (existing — read-only for this refactor)

The existing server actions (`saveDatesAction`, `saveChildDetailsAction`, etc.) already create or update a `DreamboardDraft` record in Vercel KV. The draft ID is available after Step 1 completes. Each step's `page.tsx` already fetches the current draft via `getDreamBoardDraft()` and pre-populates form fields from it. **This is unchanged by the refactor.**

### Client-side draft persistence (new — UI-only)

**Component**: `useDraftPersistence` hook (see `IMPLEMENTATION-PLAN.md` §2.15)

**Lifecycle**:

1. **On mount**: Read `sessionStorage` key `gifta-wizard-draft-{stepKey}`. If values exist and the corresponding server draft field is empty, pre-populate the form field from sessionStorage.

2. **On input change**: Debounced write (500ms) to sessionStorage. Format: `JSON.stringify({ fieldName: value, ... })`.

3. **On `visibilitychange` (hidden)**: Immediately persist current form values (no debounce). This covers the most common mobile interruption: user switches to another app.

4. **On successful submission**: Call `clearDraft()` to remove the sessionStorage key. The server now has the canonical data.

5. **On `beforeunload` (desktop only)**: Immediately persist current form values.

**Step keys**: `'child'`, `'gift'`, `'dates'`, `'giving-back'`, `'payout'`

**Scope**:
- Only stores string field values — no files (photo cannot be persisted client-side)
- `sessionStorage` is tab-scoped and non-persistent across browser restarts. This is acceptable for a single-session draft recovery model.
- Sensitive fields (`karriCardNumber`, `bankAccountNumber`) are stored in sessionStorage only. The hook clears these on successful submission. sessionStorage is tab-scoped and cleared when the tab closes.

**Error handling**:
- Wrap `sessionStorage.setItem` in try/catch. On `QuotaExceededError`, log a console warning and continue without persistence. Do not show a user-facing error.

**Not included (out of scope for UI-only refactor)**:
- Server-side draft model changes (the existing KV-based draft system is sufficient)
- Cross-device draft sync
- Draft expiry / cleanup

---

## E.2 Error / Retry Behaviour

### Error display

| Context | Location | Component |
|---------|----------|-----------|
| Desktop (≥ 801px) | Top of form card | `WizardAlertBanner` in standard layout |
| Mobile (≤ 800px) | Inside sticky CTA footer | `WizardAlertBanner` rendered by `WizardCTA` when `error` prop is set |

### Retry model

1. **On server action failure**: Show `WizardAlertBanner` with:
   - Error message (human-readable, from `resolveWizardError`)
   - "Try again" button (calls `onRetry` prop)

2. **"Try again" behaviour**: Re-invokes the form submission. The form data is still in the DOM (user hasn't navigated away). No re-validation needed — values haven't changed.

3. **Progressive backoff** (if retry fails repeatedly):
   - 1st retry: immediate
   - 2nd retry: 2-second delay (show "Retrying…" text)
   - 3rd retry: 5-second delay
   - After 3 failures: Show "We're having trouble saving. Your progress has been saved locally. Please try again in a moment." Persist to sessionStorage via `useDraftPersistence`.

4. **Reset**: When `pending` transitions from `true` to `false` without error, clear the retry counter.

### Offline detection (Nice-to-have #15)

> **Status**: Nice-to-have. Not required for initial launch.

If implemented:
- Check `navigator.onLine` before form submission
- If offline: show inline toast inside the sticky footer: "You're offline. We'll save your progress and retry when you're back."
- Persist form data to sessionStorage
- Register `online` event listener to auto-retry once when connectivity returns
- Show confirmation when auto-retry succeeds: "Saved! Your connection is back."

---

## E.3 Back Button + Refresh Behaviour

### Browser back button

Standard Next.js App Router navigation — navigates to the previous step. No custom interception needed. The existing routing handles this correctly.

### Form dirty detection

"Dirty" = current form values differ from the values that were loaded on mount (from server draft or sessionStorage).

**Desktop behaviour**:
- On `beforeunload`, if form is dirty: browser shows native "Leave page?" prompt
- This is automatic when a `beforeunload` listener is registered

**Mobile behaviour**:
- Do NOT rely on `beforeunload` prompts — they are unreliable on mobile browsers (especially iOS Safari)
- Instead, rely on draft persistence: `useDraftPersistence` saves on every input change (debounced) and on `visibilitychange`
- When the user returns (via back button, refresh, or app switch), form values are restored from sessionStorage

### Browser refresh (F5 / pull-to-refresh)

1. Page remounts → `page.tsx` fetches server draft → pre-populates from server data
2. `useDraftPersistence` hook runs on mount → checks sessionStorage for any values newer than server draft
3. If sessionStorage has values and server draft is empty for those fields → use sessionStorage values
4. This covers the case where a user filled fields but didn't submit before refreshing

### Native swipe-back gesture (iOS Safari)

Same as browser back button — Next.js handles this via standard history navigation. No special handling needed.

### Tab close / app kill

- sessionStorage is cleared when the tab closes (by browser design)
- This means truly killing the browser loses unsaved work. This is acceptable — the server draft has the last successfully submitted step.
- If the user returns later in a new tab, they resume from the last submitted step (server draft), not the last typed value.

---

## E.4 Analytics Events

### Event types

```typescript
type WizardEvent =
  | { name: 'wizard_step_viewed'; step: number; draftId?: string }
  | { name: 'wizard_step_completed'; step: number; draftId?: string; durationMs: number }
  | { name: 'wizard_step_error'; step: number; errorType: string }
  | { name: 'wizard_abandoned'; step: number; draftId?: string; durationMs: number; formDirty: boolean }
  | { name: 'wizard_published'; draftId: string; totalDurationMs: number };
```

### Firing rules

| Event | Trigger | Notes |
|-------|---------|-------|
| `wizard_step_viewed` | `useEffect` on page mount | Fires once per step visit. `step` is 1-6. |
| `wizard_step_completed` | Successful server action redirect | `durationMs` = time since `wizard_step_viewed` for this step. |
| `wizard_step_error` | Server action failure | `errorType` = the error code from the URL param (e.g., `"invalid"`, `"photo"`, `"empty_file"`) |
| `wizard_abandoned` | `visibilitychange` (hidden) OR `beforeunload` | Only fires if `step < 6`. `formDirty` = true if form has unsaved changes. Deduplicated: only fire once per step visit (use a ref flag). |
| `wizard_published` | Successful `publishDreamBoardAction` | `totalDurationMs` = time since first `wizard_step_viewed` (Step 1). Requires tracking wizard start time (store in sessionStorage or module-level variable). |

### Implementation

**Utility**: `trackWizardEvent(event: WizardEvent): void` (see `IMPLEMENTATION-PLAN.md` §2.16)

- **Development**: `console.log('[wizard-analytics]', event)` with JSON payload
- **Production**: No-op until an analytics provider (e.g., PostHog, Mixpanel, GA4) is wired up
- The function signature is stable — swap the implementation body when a provider is chosen

### Duration tracking

Each page stores its mount timestamp:
```typescript
const mountTime = useRef(Date.now());
```

On successful submission, calculate `durationMs = Date.now() - mountTime.current`.

For `wizard_published.totalDurationMs`, store the wizard start time in sessionStorage:
```typescript
// On Step 1 mount (only):
if (!sessionStorage.getItem('gifta-wizard-start-time')) {
  sessionStorage.setItem('gifta-wizard-start-time', String(Date.now()));
}
// On publish:
const startTime = Number(sessionStorage.getItem('gifta-wizard-start-time') || Date.now());
const totalDurationMs = Date.now() - startTime;
```

### Deduplication

- `wizard_abandoned`: Use a `useRef(false)` flag. Set to `true` on first fire. Reset if the step is successfully completed.
- `wizard_step_viewed`: Use React strict-mode-safe pattern — fire in `useEffect` with empty dependency array. Accept that strict mode will fire twice in development.

---

## Assumptions

1. The server actions already handle idempotent submissions (duplicate POSTs from double-tap don't create duplicate data). The client-side double-submit prevention is a UX improvement, not a data-safety requirement.
2. `sessionStorage` is available in all target browsers (Chrome, Safari, Samsung Internet on Android). No polyfill needed.
3. The analytics utility is a pure client-side fire-and-forget function. No server-side event collection is needed at this stage.
4. The `beforeunload` event is used for desktop dirty-form prompts only. Mobile relies entirely on draft persistence.
5. The charity list (Step 4) is a small, fixed set — no infinite scroll or virtualisation needed for mobile.

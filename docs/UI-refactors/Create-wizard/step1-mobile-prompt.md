# Step 1 Mobile Layout — Single-Card Compact Photo

> **Operating rules**: Follow the guardrails and verification gates in `docs/UI-refactors/AI-UI-REFACTOR-PLAYBOOK.md`. Use its §9 handoff template for your delivery notes.

## Goal

On mobile (<801px), Step 1 currently stacks two separate cards vertically — the photo drop zone card and the child details card — creating a disjointed experience where the CTA button appears before the photo upload area. Fix this by showing a **single card on mobile** containing child name, child age, a compact photo row, and the CTA, in that order. **Desktop (≥801px) must look and behave identically to today.**

## Architecture

One `WizardSplitLayout` wrapping one form. The left slot (desktop drop zone) is hidden on mobile via CSS. The right slot (form card) contains all fields plus a compact photo row visible only on mobile. No duplicate text inputs — one canonical set of fields.

### Layout structure

```
<form>
  ┌─ hidden file input (sr-only, id="photo") ──────────────┐
  │                                                         │
  │  WizardSplitLayout                                      │
  │  ├─ left: <div hidden on mobile>                        │
  │  │    └─ ChildPhotoDropZone (desktop-only visual)       │
  │  │         keeps <label htmlFor="photo"> semantics      │
  │  │                                                      │
  │  └─ right: WizardFormCard                               │
  │       ├─ title, subtitle                                 │
  │       ├─ childName input                                │
  │       ├─ childAge input + tip                           │
  │       ├─ ChildPhotoCompactRow (mobile-only visual)      │
  │       └─ WizardCTA                                      │
  └─────────────────────────────────────────────────────────┘
```

- **Desktop (≥801px)**: Two-column split — left shows full drop zone card, right shows form card. Compact photo row is `display: none`.
- **Mobile (<801px)**: Single column — left panel is `display: none`. Form card shows name, age, compact photo row, CTA.

### Shared file input, two visual triggers

- One `<input type="file" name="photo" id="photo">` rendered once inside the `<form>`, before `WizardSplitLayout`, with `className="sr-only"`. **No `required` attribute** — server-side validation already handles missing photos (redirects to `?error=photo`). Removing `required` avoids confusing native validation UX on a screen-reader-only element.
- Two visual components trigger that shared input:
  1. **Desktop**: `ChildPhotoDropZone` keeps its `<label htmlFor="photo">` wrapper — clicking anywhere on the label triggers the hidden file input via native label-input association. The label also gains `tabIndex={0}` and a keyboard handler so Tab → Enter/Space opens the file picker, with a visible focus ring. No accessibility regression.
  2. **Mobile**: `ChildPhotoCompactRow` triggers via `openFilePicker()` (calls `inputRef.current?.click()`).
- Both read from shared file-selection state to display the correct preview.
- This avoids duplicate `name="photo"` entries in FormData.

### State lifting via custom hook

Currently `ChildPhotoDropZone` owns the file input, preview URL state, and client-side validation internally. This state is **lifted into a `useChildPhoto` hook** so both visual components can share it.

### Server action extraction

The page currently contains an inline server action (`saveChildDetailsAction` with `'use server'`). Extract it to `actions.ts` to allow the page to delegate to a client component — matching the pattern used by every other step.

### No duplicate text inputs

Unlike previous iterations, this architecture renders **one set** of `childName` and `childAge` inputs inside the single `WizardFormCard`. They remain **uncontrolled** with `defaultValue`, matching the current server-rendered behaviour. No `useState` for text fields is needed.

---

## Files to create

### 1. `src/app/(host)/create/child/actions.ts`

Move `saveChildDetailsAction` (and its `childSchema`, and all imports it needs) verbatim from `page.tsx` into this file. Export the function. Add `'use server';` at the top. **Do not modify any logic** — validation, redirect paths, error codes, Sentry reporting, and photo upload/delete logic must be identical.

### 2. `src/components/create-wizard/useChildPhoto.ts`

A custom hook that extracts the file handling logic currently inside `ChildPhotoDropZone`.

```ts
export interface UseChildPhotoReturn {
  /** Ref to attach to the hidden <input type="file"> */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** The blob: URL for the newly selected file, or null */
  previewObjectUrl: string | null;
  /** Client-side validation error message, or null */
  errorMessage: string | null;
  /** Whether there is any preview to display (new selection OR existing URL) */
  hasPreview: boolean;
  /** Whether to show the existing server photo (no new selection yet) */
  displayExistingPhoto: boolean;
  /** Call when the hidden input fires onChange */
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Call when a file is dropped on the desktop drop zone */
  handleDrop: (event: React.DragEvent<HTMLElement>) => void;
  /** Trigger the hidden file input programmatically (for click handlers) */
  openFilePicker: () => void;
}

export function useChildPhoto(existingPhotoUrl: string | null): UseChildPhotoReturn
```

Move the following from `ChildPhotoDropZone` into this hook:
- `MAX_FILE_SIZE_BYTES` and `ACCEPTED_MIME_TYPES` constants
- `inputRef` (the ref for the hidden file input)
- `previewObjectUrl` state and `updatePreviewObjectUrl` (with `URL.revokeObjectURL` cleanup)
- `useEffect` cleanup on unmount
- `assignFileToInput` (syncs a dropped file to the input element via DataTransfer)
- `applyFile` (validation: MIME type check, 5MB size check, sets preview or error)
- `handleInputChange` (calls `applyFile` from input onChange)
- `handleDrop` — a slimmed-down version that only extracts the dropped file and calls `applyFile(droppedFile, true)`. It does **not** call `preventDefault`, does **not** call `setIsDragOver(false)`, and does **not** check `hasDraggedFiles` — all three are the caller's responsibility (see §6 `onDrop` handler below)
- Add `openFilePicker`: `() => inputRef.current?.click()`
- Compute and return `hasPreview` and `displayExistingPhoto`

**Do NOT move into this hook:** `isDragOver` state (it's a desktop-only visual concern, stays in `ChildPhotoDropZone`), `CameraIcon`, `hasDraggedFiles`.

### 3. `src/components/create-wizard/ChildPhotoCompactRow.tsx`

A mobile-only compact photo input row. Does **not** own a file input — triggers the shared hidden input via `openFilePicker`.

```ts
'use client';

interface ChildPhotoCompactRowProps {
  existingPhotoUrl: string | null;
  previewObjectUrl: string | null;
  hasPreview: boolean;
  displayExistingPhoto: boolean;
  errorMessage: string | null;
  openFilePicker: () => void;
}
```

**Empty state** (no photo selected, no existing photo):
- The entire row is a single `<button type="button" onClick={openFilePicker}>` — no nested interactive elements.
- Button styling: `wizard-interactive flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-border-soft px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- Left: 44×44 `rounded-full bg-white flex items-center justify-center` circle with a camera icon (import `CameraIcon` from `src/components/create-wizard/CameraIcon.tsx` — see below).
- Right: line 1 "Add a photo" (`text-[13px] font-medium text-ink-mid`), line 2 "Required · JPG, PNG or WebP" (`text-[11px] text-ink-ghost`).

**Selected state** (`hasPreview` is true):
- The entire row is also a single `<button type="button" onClick={openFilePicker}>` — full-row tap target in both states for consistent touch ergonomics (44px+ hit area).
- Button styling: `wizard-interactive flex w-full items-center gap-3 rounded-xl border border-solid border-primary bg-sage-wash px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- Left: 48×48 `rounded-full overflow-hidden flex-shrink-0` thumbnail. Use `<img>` for `previewObjectUrl`, `next/image` `<Image>` for `existingPhotoUrl` (when `displayExistingPhoto` is true). Apply `object-cover w-full h-full` on both.
- Right: line 1 "Photo added ✓" (`text-[13px] font-medium text-sage-deep`), line 2 `<span className="text-[12px] font-medium text-primary">Change</span>` — a visual hint, not a nested button.

**Error state** (`errorMessage` is non-null):
- Below the button (outside it): `<p className="mt-1.5 text-[12px] text-red-600">{errorMessage}</p>`.

### 4. `src/components/create-wizard/CameraIcon.tsx`

Extract the `CameraIcon` function component verbatim from `ChildPhotoDropZone.tsx` into its own file. Export it as a named export. This decouples the compact row from the drop zone's internal implementation. Both `ChildPhotoDropZone` and `ChildPhotoCompactRow` import from this shared file.

```tsx
export function CameraIcon() {
  // ... exact SVG from current ChildPhotoDropZone, unchanged
}
```

### 5. `src/app/(host)/create/child/ChildStepForm.tsx`

Client component that owns the form and responsive photo logic.

```ts
'use client';

type ChildStepFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  existingPhotoUrl: string | null;
  defaultChildName: string;
  defaultChildAge: string;
  error: string | null;
};
```

**State:**
```ts
const photo = useChildPhoto(existingPhotoUrl);
```

No `useState` for text fields — inputs are uncontrolled with `defaultValue`.

**Render structure:**

```tsx
<form action={action} encType="multipart/form-data">
  {/* ── Shared hidden file input (rendered once, outside layout) ── */}
  <input
    ref={photo.inputRef}
    type="file"
    id="photo"
    name="photo"
    accept="image/png,image/jpeg,image/webp"
    tabIndex={-1}
    className="sr-only"
    onChange={photo.handleInputChange}
    aria-label="Upload child photo"
  />

  <WizardSplitLayout
    mobileOrder="right-first"
    left={
      <div className="hidden min-[801px]:block">
        <ChildPhotoDropZone
          existingPhotoUrl={existingPhotoUrl}
          previewObjectUrl={photo.previewObjectUrl}
          hasPreview={photo.hasPreview}
          displayExistingPhoto={photo.displayExistingPhoto}
          errorMessage={photo.errorMessage}
          handleDrop={photo.handleDrop}
          openFilePicker={photo.openFilePicker}
        />
      </div>
    }
    right={
      <WizardFormCard>
        <WizardPanelTitle variant="form">About the birthday star</WizardPanelTitle>
        <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
          A few details to personalise their Dreamboard
        </p>

        <WizardFieldWrapper label="First name" htmlFor="childName">
          <WizardTextInput
            id="childName"
            name="childName"
            placeholder="e.g. Maya"
            required
            defaultValue={defaultChildName}
            autoCapitalize="words"
            enterKeyHint="next"
            autoComplete="given-name"
          />
        </WizardFieldWrapper>

        <WizardFieldWrapper
          label="Age they're turning"
          htmlFor="childAge"
          tip={
            <WizardFieldTip>
              {`Displayed as "${defaultChildName || 'Child'} turns ${defaultChildAge || '?'}!" on the Dreamboard.`}
            </WizardFieldTip>
          }
        >
          <WizardTextInput
            id="childAge"
            name="childAge"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={18}
            step={1}
            placeholder="e.g. 7"
            required
            defaultValue={defaultChildAge}
            enterKeyHint="done"
          />
        </WizardFieldWrapper>

        {/* ── Mobile-only compact photo row ── */}
        <div className="mb-6 min-[801px]:hidden">
          <ChildPhotoCompactRow
            existingPhotoUrl={existingPhotoUrl}
            previewObjectUrl={photo.previewObjectUrl}
            hasPreview={photo.hasPreview}
            displayExistingPhoto={photo.displayExistingPhoto}
            errorMessage={photo.errorMessage}
            openFilePicker={photo.openFilePicker}
          />
        </div>

        <WizardCTA submitLabel="Continue to gift" pending={false} error={error} />
      </WizardFormCard>
    }
  />
</form>
```

**Key points:**
1. One set of inputs with stable `id` attributes (`childName`, `childAge`) — no suffixes needed since there's no duplication.
2. The `<div className="hidden min-[801px]:block">` wrapper around the left slot ensures the desktop drop zone is hidden on mobile. On mobile, `WizardSplitLayout`'s grid collapses to one column and the hidden left cell takes no space.
3. The hidden file input has `id="photo"` to maintain the native label-input association with the desktop drop zone's `<label htmlFor="photo">`.
4. **Accepted tradeoff — static tip text**: The tip uses `defaultChildName` / `defaultChildAge` props (not live state). This means the tip does not update as the user types. This matches the current server-rendered behaviour exactly and is intentional — making it live would require controlled inputs and is out of scope for this layout restructure. Do not treat this as a bug during review.
5. `CameraIcon` lives in its own shared file (`src/components/create-wizard/CameraIcon.tsx`) — imported by both `ChildPhotoDropZone` and `ChildPhotoCompactRow`.

---

## Files to modify

### 6. `src/components/create-wizard/ChildPhotoDropZone.tsx`

Refactor to consume shared state via props instead of owning state internally.

**New props:**
```ts
export interface ChildPhotoDropZoneProps {
  existingPhotoUrl: string | null;
  previewObjectUrl: string | null;
  hasPreview: boolean;
  displayExistingPhoto: boolean;
  errorMessage: string | null;
  handleDrop: (event: React.DragEvent<HTMLElement>) => void;
  openFilePicker: () => void;
}
```

**Remove:**
- All internal state: `useState` for `previewObjectUrl`, `errorMessage`
- All hooks: `useCallback`/`useEffect` for file handling
- The `<input type="file">` element (now rendered by `ChildStepForm`)
- `inputRef`, `applyFile`, `assignFileToInput`, `handleInputChange`, `updatePreviewObjectUrl`
- `MAX_FILE_SIZE_BYTES` and `ACCEPTED_MIME_TYPES` constants

**Keep (unchanged unless noted):**
- `isDragOver` local state and `hasDraggedFiles` helper (desktop-only visual concern)
- **`CameraIcon` component** — move to a shared file `src/components/create-wizard/CameraIcon.tsx` (see §4 above). Import it from there instead of defining it inline
- The `<label htmlFor="photo">` wrapper — this is the accessible click target that triggers the hidden file input via native label association. **Do not change this to a div.** Because the hidden file input is now `sr-only` with `tabIndex={-1}` (removed from tab order), the label must become the keyboard target: add `tabIndex={0}` and `onKeyDown` that calls `openFilePicker()` on Enter or Space (with `e.preventDefault()` to suppress scroll). Also add a focus-visible ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`. This is why `openFilePicker` exists in the props — it provides the keyboard activation path.
- Title and subtitle header section (no step-indicator eyebrow — these have been removed from all wizard steps)
- `WizardInlineError` for desktop error display (now reads `errorMessage` from props)
- All CSS class names and visual styling, except for the required desktop and mobile `focus-visible` accessibility ring additions described above

**Change:**
- Remove the `<input>` element from inside the label (it's now at form level).
- Drag handlers stay as-is (`onDragEnter`, `onDragOver`, `onDragLeave`) — they set local `isDragOver` state.
- The `onDrop` handler on the label is now a local wrapper that: (1) calls `event.preventDefault()`, (2) calls `setIsDragOver(false)`, (3) guards with `if (!hasDraggedFiles(event)) return;`, then (4) calls the `handleDrop` prop (which only extracts the file and processes it). This keeps all drag-specific concerns local to the drop zone while the hook handles file validation.
- Image rendering reads from props (`previewObjectUrl`, `displayExistingPhoto`, `existingPhotoUrl`) instead of internal state.
- Computed `hasPreview` comes from props instead of local calculation.

### 7. `src/app/(host)/create/child/page.tsx`

Replace the current implementation with the thin server wrapper pattern (matching Steps 3–5).

```tsx
import { Suspense } from 'react';

import { saveChildDetailsAction } from '@/app/(host)/create/child/actions';
import { ChildStepForm } from '@/app/(host)/create/child/ChildStepForm';
import {
  WizardSkeletonLoader,
  WizardStepper,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const childErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
  invalid_type: 'Photos must be JPG, PNG, or WebP.',
  file_too_large: 'Photo must be under 5MB.',
  upload_failed: 'Upload failed. Please try again.',
};

export default async function CreateChildPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;
  const errorMessage = resolveWizardError(error, childErrorMessages, {
    photo: 'Please upload a photo of your child.',
    empty_file: 'Please upload a photo of your child.',
  });

  buildCreateFlowViewModel({ step: 'child', draft });

  return (
    <>
      <WizardStepper currentStep={1} totalSteps={6} stepLabel="The child" />
      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        <ChildStepForm
          action={saveChildDetailsAction}
          existingPhotoUrl={draft?.childPhotoUrl ?? null}
          defaultChildName={draft?.childName ?? ''}
          defaultChildAge={draft?.childAge?.toString() ?? ''}
          error={errorMessage}
        />
      </Suspense>
    </>
  );
}
```

---

## Existing test updates

### `tests/unit/create-child-page.test.tsx`

The page no longer renders the form directly — it delegates to `ChildStepForm`. Update:
- Add a mock for `ChildStepForm` (same pattern as the mocks for `DatesForm`, `GivingBackForm`, `PayoutForm` in their respective page tests).
- Remove the mock for `ChildPhotoDropZone` (no longer imported by `page.tsx`).
- Remove the `WizardSplitLayout` mock (no longer imported by `page.tsx`).
- Assertions should verify: stepper renders at step 1, `ChildStepForm` receives correct props (`action`, `existingPhotoUrl`, `defaultChildName`, `defaultChildAge`, `error`).
- Preserve all existing test intents — adapt assertions to the new component boundary.

### `tests/unit/child-photo-drop-zone.test.tsx`

`ChildPhotoDropZone` no longer owns the file input or internal state. Update:
- Render `ChildPhotoDropZone` with the new props interface (pass `previewObjectUrl`, `hasPreview`, etc.).
- Remove tests that exercise file selection via `fireEvent.change` on the input (the input no longer lives inside this component).
- Keep tests for: existing photo display, drag-over styling, visual states based on props.
- Remove `createObjectURL`/`revokeObjectURL` mocking (now the hook's responsibility).

**Do NOT create new test files in this prompt.** Test additions for `useChildPhoto`, `ChildPhotoCompactRow`, `CameraIcon`, and `ChildStepForm` **must follow immediately as the next prompt in this sequence** — do not proceed to other work until coverage for these new modules is in place.

---

## What must NOT change

- **Server action logic** — `saveChildDetailsAction` is moved verbatim to `actions.ts`, zero modifications.
- **No other step files** — this change is scoped entirely to Step 1.
- **Desktop visual appearance** — the split layout with the full photo drop zone on the left must look and behave identically to today. The `<label htmlFor="photo">` semantics, drag-and-drop, hover overlay, and all CSS remain unchanged.
- **FormData shape** — the server action receives the same field names: `childName`, `childAge`, `photo`.
- **Input behaviour** — text inputs remain uncontrolled with `defaultValue`, matching current server-rendered behaviour. The age tip uses default props, not live state.
- **`resolveWizardError.ts`** — never modified.
- **`src/components/create-wizard/index.ts`** — no changes needed. `ChildPhotoDropZone` and `ChildPhotoCompactRow` are imported by direct path (not from the barrel).

---

## Verification

After implementation:
1. `pnpm tsc --noEmit` — zero errors.
2. `pnpm lint` — zero errors (warnings acceptable).
3. `pnpm test` — all existing tests pass, zero regressions.
4. Visually: on a viewport ≥801px wide, Step 1 looks identical to before (split layout, full drop zone). On a viewport <801px wide, Step 1 shows a single card with name, age, compact photo row, CTA.
5. **Accessibility — ChildPhotoCompactRow** (mobile): The `<button>` element in both empty and selected states must have a discernible accessible name (via visible text content — "Add a photo" / "Photo added ✓ Change"), receive visible focus outline (`:focus-visible`), and respond to Enter and Space keypresses (native `<button>` behaviour — no additional `onKeyDown` handler needed).
6. **Accessibility — ChildPhotoDropZone** (desktop): Tab can reach the drop zone label, a visible focus ring appears, and pressing Enter or Space opens the file picker.

Use the handoff template from `docs/UI-refactors/AI-UI-REFACTOR-PLAYBOOK.md` §9 for your delivery notes.

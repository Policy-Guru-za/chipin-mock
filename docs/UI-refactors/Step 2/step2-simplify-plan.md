# Step 2 Refactor — Simplify Gift Step

## Context

Step 2 of the Dreamboard creation wizard is the clunkiest step in the flow. The form card is scroll-heavy: gift name, gift description textarea, a 60-icon categorised picker in a `max-h-[400px]` scrollable panel, a divider, and a message textarea. Meanwhile the preview panel shows only a floating icon — largely wasted space. The icon picker dominates attention and adds complexity without proportional value (most hosts would accept whatever icon is suggested).

**Decision**: Remove icon selection entirely. All Dreamboards will use one universal Gifta brand logo instead of per-gift curated icons. Remove the gift description field — it's redundant (the gift name *is* the description, and `giftDescription` is already hardcoded to `null` in the guest view model — guests have never seen it). The result is a clean, fast step: gift name, a personal message, and done.

**Logo choice**: Use `Gifta-logo-transparent.png` (the transparent-background variant). It composites cleanly on any surface — the review card's `bg-sage-light`, the OG image's green gradient, and the guest-facing `DreamBoardImage` component's `bg-stone-100` fallback. The white-background variant would show a visible white rectangle on non-white surfaces. The optimized file will be placed at `/public/icons/gifts/gifta-logo.png` to fit the existing icon path convention (`/icons/gifts/[id].png`).

---

## Scope boundaries

This refactor is **scoped to the host creation flow (Step 2 UI + its server action)**. Everything else gracefully handles whatever `giftImageUrl` is stored.

### What changes

| Area | Change |
|------|--------|
| Step 2 page (`gift/page.tsx`) | Remove split layout, icon preview, icon picker, description field. Switch to centred single-column layout. |
| Server action (`gift/actions.ts`) | Remove `giftDescription` and `giftIconId` from schema. Hardcode `giftImageUrl` to `/icons/gifts/gifta-logo.png`. |
| Icon registry (`lib/icons/gift-icons.ts`) | Add `gifta-logo` as supported system identity for lookup/validation while excluding it from curated category lists. |
| OG image route (`api/og/[slug]/route.tsx`) | Continue using standard lookup flow; `gifta-logo` now resolves without fallback substitution. |
| OpenAPI + API docs | Update `gift_icon_id` wording to include supported system identities (e.g. `gifta-logo`). |
| Logo asset | Generate optimized `gifta-logo.png` from `Gifta-logo-transparent.png` and place in `/public/icons/gifts/`. |
| Tests | Update Step 2 page/action tests and add/adjust icon-registry + API serialization + OG coverage for `gifta-logo`. |

### What does NOT change

| Area | Why |
|------|-----|
| Database schema (`lib/db/schema.ts`) | `giftDescription` column stays nullable — existing rows keep their data. `giftImageUrl` column is unchanged. |
| Dreamboard validation schema (`lib/dream-boards/schema.ts`) | Still accepts `giftDescription` and `giftIconId` as optional for API compatibility. |
| API route (`api/v1/dream-boards/route.ts`) | B2B partners may still send `gift_icon_id` or `gift_description`. No API-breaking changes. |
| Draft type (`lib/dream-boards/draft.ts`) | Type still includes optional `giftDescription`, `giftIconId`, `giftImageUrl` fields. |
| Guest display (`components/dream-board/GiftCard.tsx`) | Shows emoji based on icon category lookup; `gifta-logo` won't match any icon → falls back to `'🎁'`. Fine. |
| Guest image (`components/dream-board/DreamBoardImage.tsx`) | Renders whatever `giftImageUrl` points to. No `iconMeta` for `gifta-logo` → `bgColor` falls back to `bg-stone-100` via CSS. Fine. |
| OG image route (`api/og/[slug]/route.tsx`) | Existing resolution flow remains; `gifta-logo` is now in the icon registry so OG cards use the logo instead of fallback. |
| Review page (`create/review/ReviewClient.tsx`) | Receives `giftImageUrl` from draft and passes to `ReviewPreviewCard`. The logo renders correctly in the 64×64 preview slot. |
| View model (`lib/dream-boards/view-model.ts`) | Already hardcodes `giftDescription: null` — no change needed. |
| Gift info helper (`lib/dream-boards/gift-info.ts`) | `giftSubtitle` falls back to `'Dream gift'` when description is null. Fine. |
| `GiftIconPicker` and `GiftIconPreview` components | Not deleted — host Step 2 stops using them, but they remain available for dev tools/legacy scenarios. |
| Icon suggestion (`lib/icons/suggest-icon.ts`) | No longer called from Step 2, but stays intact for API/future use. |
| API route (`api/v1/dream-boards/route.ts`) | B2B partner writes remain backward-compatible (`gift_icon_id` / `gift_description` accepted). |

---

## Implementation steps

### Step 1: Add the logo asset

Generate optimized `public/icons/gifts/gifta-logo.png` from `public/Logos/Gifta-logo-transparent.png` (transparent background, icon-sized for web use).

This places the logo in the existing icon directory so downstream components (`DreamBoardImage`, `ReviewPreviewCard`, OG route) resolve it via the standard `/icons/gifts/[id].png` path convention. **Do not delete or modify the original file in `public/Logos/`.**

### Step 2: Simplify the server action

**File: `src/app/(host)/create/gift/actions.ts`**

Current schema:
```ts
const manualGiftSchema = z.object({
  giftName: z.string().min(2).max(200),
  giftDescription: z.string().max(500).optional(),
  giftIconId: z.string().min(1),
  message: z.string().max(280).optional(),
});
```

New schema:
```ts
const manualGiftSchema = z.object({
  giftName: z.string().min(2).max(200),
  message: z.string().max(280).optional(),
});
```

Changes to `saveManualGiftAction`:

1. Remove `giftDescription` extraction from FormData (line 39).
2. Remove `giftIconId` extraction from FormData (line 40).
3. Remove `getGiftIconById` lookup and its redirect guard (lines 49–52).
4. Remove `getGiftIconById` import.
5. Hardcode the draft update values:

```ts
await updateDreamBoardDraft(session.hostId, {
  giftName: result.data.giftName.trim(),
  giftDescription: undefined,
  giftIconId: undefined,
  giftImageUrl: '/icons/gifts/gifta-logo.png',
  giftImagePrompt: undefined,
  goalCents: 0,
  message: result.data.message,
});
```

Setting `giftDescription: undefined` and `giftIconId: undefined` ensures these draft fields are cleared (in case the host previously had values from an earlier session or API-created draft).

### Step 3: Refactor the Step 2 page

**File: `src/app/(host)/create/gift/page.tsx`**

The current page is a server component with an inline form using `WizardSplitLayout` (two-column). Replace with a single-column centred layout using `WizardCenteredLayout` (same pattern as Step 6 / ReviewClient).

**Remove:**
- `WizardSplitLayout` import and usage
- `WizardPreviewPanel` import and usage
- `GiftIconPreview` import and usage
- `GiftIconPicker` import and usage
- `WizardFieldTip` import and usage (no longer needed — the description tip is gone)
- `extractIconIdFromPath`, `isValidGiftIconId` imports
- `suggestGiftIcon` import
- `resolveDefaultGiftDescription` function
- `resolveDefaultIconId` function
- `defaultGiftDescription` variable
- `defaultIconId` variable
- Gift description `WizardFieldWrapper` + `WizardTextarea` (id="giftDescription")
- Gift icon `WizardFieldWrapper` + `GiftIconPicker`
- The `<div className="my-6 h-px bg-border-soft" />` divider

**Keep:**
- `WizardStepper` at step 2 of 6
- `Suspense` + `WizardSkeletonLoader` (change variant from `"split"` to `"centered"` — confirmed supported)
- `resolveDefaultGiftName` and `resolveDefaultMessage` functions
- `WizardCTA` with back="/create/child" and submitLabel="Continue to dates"
- `WizardPanelTitle` heading
- Gift name `WizardFieldWrapper` + `WizardTextInput`
- Message `WizardFieldWrapper` + `WizardTextarea`

**Add:**
- `WizardCenteredLayout` import (from `@/components/create-wizard`)
- A static decorative logo element above the heading (using `next/image`):
  ```tsx
  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
    <Image
      src="/icons/gifts/gifta-logo.png"
      alt=""
      width={80}
      height={80}
      className="h-20 w-20 object-contain"
      aria-hidden="true"
      priority
    />
  </div>
  ```
  The logo is decorative (not functional), so `alt=""` and `aria-hidden="true"` are correct. It sits above the title to give the page a visual anchor without being interactive.

**New layout structure:**
```tsx
<>
  <WizardStepper currentStep={2} totalSteps={6} stepLabel="The gift" />
  <Suspense fallback={<WizardSkeletonLoader variant="centered" />}>
    <form action={saveManualGiftAction}>
      <WizardCenteredLayout>
        {/* Decorative logo */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <Image
            src="/icons/gifts/gifta-logo.png"
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
            aria-hidden="true"
            priority
          />
        </div>

        <WizardPanelTitle variant="form">The dream gift</WizardPanelTitle>
        <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
          What's the one gift {messageAuthor} is dreaming of?
        </p>

        <WizardFieldWrapper label="Gift name" htmlFor="giftName">
          <WizardTextInput
            id="giftName"
            name="giftName"
            placeholder="e.g. LEGO Millennium Falcon"
            defaultValue={defaultGiftName}
            inputMode="text"
            autoComplete="off"
            enterKeyHint="next"
            required
          />
        </WizardFieldWrapper>

        <WizardFieldWrapper label={`A message from ${messageAuthor}`} htmlFor="message">
          <WizardTextarea
            id="message"
            name="message"
            maxLength={280}
            placeholder="E.g., Thank you for helping make this dream gift possible."
            defaultValue={defaultMessage}
            rows={3}
            enterKeyHint="done"
          />
          <p className="mt-1.5 text-xs text-ink-ghost">
            This note is saved with this Dreamboard and may appear on the public Dreamboard.
          </p>
        </WizardFieldWrapper>

        <WizardCTA
          backHref="/create/child"
          submitLabel="Continue to dates"
          pending={false}
          error={errorMessage}
        />
      </WizardCenteredLayout>
    </form>
  </Suspense>
</>
```

**Confirmed**: `WizardCenteredLayout` is exported from the barrel. `WizardSkeletonLoader` supports `variant="centered"`.

### Step 4: Update tests

#### 4a. `tests/unit/create-gift-page.test.tsx`

This file tests the server-rendered page output. Major changes:

**Remove mocks:**
- `extractIconIdFromPath` mock and `vi.mock('@/lib/icons/gift-icons', ...)`
- `isValidGiftIconId` mock
- `suggestGiftIcon` mock and `vi.mock('@/lib/icons/suggest-icon', ...)`
- `GiftIconPicker` mock (`vi.mock('@/components/gift/GiftIconPicker', ...)`)
- `GiftIconPreview` mock (`vi.mock('@/components/create-wizard/GiftIconPreview', ...)`)

**Remove from wizard component mock:**
- `WizardSplitLayout` mock
- `WizardPreviewPanel` mock
- `WizardFieldTip` mock

**Add to wizard component mock:**
- `WizardCenteredLayout: (props) => <div data-testid="centered-layout">{props.children}</div>`

**Update `beforeEach` default draft:**
- Remove `giftDescription`, `giftIconId`, `giftImageUrl` fields from the default mock draft (or keep them but they won't affect the page rendering).

**Update test cases:**

| Current test | Action |
|-------------|--------|
| `renders stepper at step 2 of 6` | Keep — unchanged |
| `renders split layout with preview panel and form card` | **Rewrite** → `renders centred layout with gift name and message fields`. Assert `data-testid="centered-layout"` present, `data-testid="field-giftName"` present, `data-testid="field-message"` present. Assert `data-testid="split-layout"` NOT present. Assert `data-testid="gift-icon-preview"` NOT present. Assert `data-testid="field-giftDescription"` NOT present. Assert `data-testid="field-giftIconId"` NOT present. |
| `prefills gift name from draft` | Keep — unchanged |
| `prefills gift description from draft` | **Delete** — field no longer exists |
| `passes selected icon to GiftIconPreview from draft` | **Delete** — preview no longer exists |
| `shows error message via WizardCTA` | Keep — unchanged |
| `does NOT pass error to individual field wrappers` | **Update** — remove `giftDescription` and `giftIconId` from the field ID list. New list: `['giftName', 'message']` |

**Add new test:**
- `renders decorative Gifta logo` — assert the page HTML contains `src="/icons/gifts/gifta-logo.png"` and `aria-hidden="true"`.

#### 4b. `tests/unit/create-step-gift.test.ts`

This file tests the `saveManualGiftAction` server action. Major changes:

**Update test: `saves gift fields + trimmed message and redirects to dates`**
- Remove `giftDescription` from FormData (`formData.set('giftDescription', ...)`)
- Remove `giftIconId` from FormData (`formData.set('giftIconId', ...)`)
- Update expected draft update call:
  ```ts
  expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
    giftName: 'PlayStation II',
    giftDescription: undefined,
    giftIconId: undefined,
    giftImageUrl: '/icons/gifts/gifta-logo.png',
    giftImagePrompt: undefined,
    goalCents: 0,
    message: 'Thanks for helping make this happen.',
  });
  ```

**Update test: `returns invalid when message exceeds 280 characters`**
- Remove `giftDescription` and `giftIconId` from FormData.

**Update test: `normalizes blank message to undefined`**
- Remove `giftDescription` and `giftIconId` from FormData.
- Update expected draft to match new hardcoded values.

**Update test: `redirects to child when prerequisite child step is incomplete`**
- Remove `giftIconId` from FormData.

**Update test in `CreateGiftPage` describe block: `renders existing draft message as default field value`**
- Remove `GiftIconPicker` mock (no longer imported by page).
- Keep assertion for `A message from Maya` and `Thanks everyone!`.

#### 4c. Tests NOT modified

These test files can remain unchanged:

- `tests/unit/gift-icon-picker.test.tsx` — tests the component itself (still exists, just unused in Step 2)
- `tests/unit/gift-icon-preview.test.tsx` — tests the component itself
- `tests/unit/icons-suggest-icon.test.ts` — tests the suggestion algorithm
- `tests/unit/dream-board-view-model.test.ts` — tests view model
- `tests/integration/api-dream-boards-list-create.test.ts` — tests API route
- `tests/integration/public-board-display.test.tsx` — tests guest display
- `tests/unit/create-review-page.test.tsx` — tests review page

The following files **must be updated** for this refactor:

- `tests/unit/icons-gift-icons.test.ts` — add `gifta-logo` lookup/validation assertions and ensure it is excluded from curated category listings.
- `tests/unit/api-gifts.test.ts` — add serialization assertion for `/icons/gifts/gifta-logo.png`.
- `tests/integration/api-og-route.test.ts` — add board fixture using `/icons/gifts/gifta-logo.png` and assert route still returns PNG successfully.

---

## Potential issues and mitigations

### 1. Existing drafts with icon data

A host who started a Dreamboard before this change may have `giftIconId: 'scooter'` and `giftImageUrl: '/icons/gifts/scooter.png'` in their draft. When they re-visit Step 2 and submit, the new action overwrites these with the Gifta logo. This is **intentional** — all new/re-saved boards get the universal logo. The page no longer reads or displays these draft fields, so there's no visual inconsistency.

### 2. `WizardCenteredLayout` and `WizardSkeletonLoader`

Both confirmed available: `WizardCenteredLayout` is exported from the barrel (`src/components/create-wizard/index.ts`, line 3), and `WizardSkeletonLoader` supports `variant="centered"` (line 4 of `WizardSkeletonLoader.tsx`).

### 4. OG image behavior for new boards

New boards with `giftImageUrl: '/icons/gifts/gifta-logo.png'` must render the Gifta logo in OG cards. This is achieved by adding `gifta-logo` to the icon registry lookup map, so the existing OG route resolution path remains unchanged and no teddy-bear fallback occurs for this case.

### 5. ReviewPreviewCard for new boards

The review page (Step 6) shows a 64×64 gift image via `ReviewPreviewCard`. It receives `giftImageUrl` from the draft and renders it with `<Image src={giftImageUrl} ... className="object-cover" />`. The Gifta logo at this size will be small but legible — the gift box icon is a simple, bold shape. The `object-cover` might crop the "Gifta" wordmark below the box, but the gift box itself will be visible. If the wordmark cropping is unacceptable, consider using `object-contain` — but that's a ReviewPreviewCard concern, not a Step 2 concern.

### 6. Guest-facing GiftCard emoji

`GiftCard.tsx` extracts icon metadata to pick a category emoji (⚽, 🎨, 🚀, etc.). For `gifta-logo`, no metadata exists, so `giftEmoji` falls back to `'🎁'` (gift box emoji). This is the perfect default — no issue.

---

## Verification

1. **TypeScript**: `pnpm tsc --noEmit` — zero errors.
2. **Lint**: `pnpm lint` — zero errors (warnings acceptable).
3. **Tests**: `pnpm test` — all tests pass, including updated Step 2 tests.
4. **Asset**: Verify `/public/icons/gifts/gifta-logo.png` exists and is the transparent-background variant.
5. **Visual — Step 2 desktop**: Single centred card with Gifta logo, gift name field, message textarea, and CTA. No icon picker, no description field, no preview panel.
6. **Visual — Step 2 mobile**: Same single card, responsive. Logo above heading.
7. **Visual — Step 6 review**: Gift image slot in ReviewPreviewCard shows the Gifta logo (small but recognisable).
8. **Flow**: Complete the full wizard end-to-end. Step 2 submits successfully, draft is saved with `giftImageUrl: '/icons/gifts/gifta-logo.png'`, `giftDescription: undefined`, `giftIconId: undefined`. Subsequent steps read the draft correctly.

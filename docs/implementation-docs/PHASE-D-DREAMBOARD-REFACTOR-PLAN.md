# Phase D — Dreamboard UX Refactor Plan

## Purpose

This document is an implementation-ready plan. It specifies seven refactors to the Gifta platform's Dreamboard UX, covering both documentation updates and codebase changes. Every file path, search string, replacement string, and acceptance criterion is explicit. Ambiguities that would block execution are locked in this document.

---

## Refactor Index

| ID | Summary | Scope |
|----|---------|-------|
| D1 | Terminology: "Dreamboard" → "Dreamboard" everywhere | Copy strings + Docs + artifact sync (see hard constraints) |
| D2 | Logo/branding parity: use homepage logo asset on all surfaces | Code |
| D3 | Birthday party date+time field in create flow and Dreamboard display | Code + Schema |
| D4 | Remove ReturnVisitBanner from public Dreamboard | Code + Docs |
| D5 | Gift section label: "The Gift" → "[CHILD'S NAME]'S ONE BIG WISH" | Code |
| D6 | Remove financial goal entirely (progress bar, goal input, percentage, amounts) | Code + Schema + Docs |
| D7 | Contributor list redesign: names list format, no avatars, "and X others" | Code |

---

## Pre-Implementation Checklist

Before starting any refactor, the agent MUST:

1. Run `git status --short --branch` and `git --no-pager diff --color=never` to record baseline state.
2. Run `pnpm lint` to confirm a clean baseline.
3. Run `pnpm typecheck` to confirm a clean baseline.
4. Run `pnpm test` to confirm existing tests pass.
5. Run `pnpm build` to confirm a clean production build.
6. Do all work on `main` (repo strategy), with small reviewable commits using Conventional Commits.

---

## D1 — Terminology: "Dreamboard" → "Dreamboard"

### Hard Constraints (D1 only)

D1 is a **copy-only** change. The following rules apply exclusively to this refactor:

1. **No API / interface / type / schema changes.** Do not modify any TypeScript types, Zod schemas, Drizzle columns, or API contracts.
2. **No route / key / identifier renames.** Database table names (`dream_boards`), API route segments (`/dream-boards/`), directory names (`src/components/dream-board/`), file names, variable names, import paths, and object keys all stay exactly as they are.
3. **No logic changes.** No conditionals, computations, or control flow may be altered.
4. **No backend / API contract changes.** No server action signatures, webhook payloads, or endpoint shapes change.
5. **No behavioral test rewrites.** Test logic must remain semantically equivalent; only literal-copy assertion updates are allowed when `"Dreamboard"` is asserted.
6. **No manual generated artifact edits.** If `src/lib/api/openapi.ts` text changes, regenerate with `pnpm openapi:generate`; do not hand-edit `public/v1/openapi.json`.

**The permitted code edit is replacing the literal user-visible string `"Dreamboard"` (two words) with `"Dreamboard"` (one word) inside user-facing string literals.** One explicit operational exception exists: OpenAPI artifact regeneration when `src/lib/api/openapi.ts` copy changes.

### Rule

The canonical product term is **"Dreamboard"** (one word, capital D). There must be zero instances of "Dreamboard" (two words) on any public-facing surface, any user-facing UI string, any documentation, or any code comment that leaks to users.

### Implementation approach

```bash
# 1. Find every occurrence in source files
rg -n "Dreamboard" src --glob "**/*.ts" --glob "**/*.tsx"

# 2. For each file, replace ONLY inside user-visible string literals.
#    Do NOT replace directory references, import paths, variable names, or comments.
```

### Files to update (Code — string literals only)

The table below lists files expected to contain the two-word string `"Dreamboard"` in a user-facing string literal. For each file, the only edit is the string replacement — no surrounding code changes.

| File | Current string (example) | Replacement |
|------|--------------------------|-------------|
| `src/app/(guest)/[slug]/page.tsx` | `'This Dreamboard is closed…'` | `'This Dreamboard is closed…'` |
| `src/app/(host)/create/review/page.tsx` | `"Create Dreamboard"` | `"Create Dreamboard"` |
| `src/app/(host)/create/review/ReviewClient.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(host)/dashboard/page.tsx` | `"Your Dreamboards"` | `"Your Dreamboards"` |
| `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(host)/dashboard/[id]/actions.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(guest)/[slug]/contribute/payment/page.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(guest)/[slug]/thanks/actions.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(guest)/error.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(host)/error.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/(admin)/admin/dream-boards/page.tsx` | Any `"Dreamboard"` display text | `"Dreamboard"` |
| `src/app/api/internal/downloads/birthday-messages/route.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/app/api/internal/contributions/create/route.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/components/dream-board/ReturnVisitBanner.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/components/host/EditDreamBoardModal.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/components/contribute/ReminderModal.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/components/layout/Header.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/components/layout/MobileNav.tsx` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/components/admin/AdminSidebar.tsx` | Any `"Dreamboard"` display labels | `"Dreamboard"` / `"Dreamboards"` |
| `src/components/ui/empty-state.tsx` | `"You haven't created a Dreamboard yet."` | `"You haven't created a Dreamboard yet."` |
| `src/lib/ui/copy.ts` | All `"Dreamboard"` strings | `"Dreamboard"` |
| `src/lib/reminders/templates.ts` | Subject/body text with `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/payouts/service.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/payouts/admin-copy.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/host/create-view-model.ts` | Step labels/titles with `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/host/dashboard-view-model.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/integrations/karri-batch.ts` | Any `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/dream-boards/metadata.ts` | OG/meta title/description with `"Dreamboard"` | `"Dreamboard"` |
| `src/lib/dream-boards/view-model.ts` | `'This Dreamboard is closed…'` | `'This Dreamboard is closed…'` *(already done by owner)* |
| `src/lib/api/openapi.ts` | API description text with `"Dreamboard"` | `"Dreamboard"` |

> **Note:** `view-model.ts` line 159 was already updated by the project owner. The agent should verify but not re-edit.

### Contract artifact sync (D1-B)

If D1 touches `src/lib/api/openapi.ts`, run:

```bash
pnpm openapi:generate
```

Reason: `tests/unit/openapi-spec.test.ts` asserts parity between source spec and generated artifact.

### Files to update (Documentation)

| File | Action |
|------|--------|
| `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md` | Replace ALL instances of `"Dreamboard"` with `"Dreamboard"` — terminology table, all copy tables, all prose. *(Partially done by owner; line 62 "Your Dreamboards" still needs updating.)* |
| All Phase C evidence files under `docs/implementation-docs/evidence/ux-v2/phase-c/*.md` | Replace `"Dreamboard"` with `"Dreamboard"` throughout |
| All Phase B evidence files under `docs/implementation-docs/evidence/ux-v2/phase-b/*.md` | Replace `"Dreamboard"` with `"Dreamboard"` throughout |
| Any other `.md` files in `docs/` containing `"Dreamboard"` | Replace with `"Dreamboard"` |

### Acceptance criteria

- `rg -n "Dreamboard" src --glob "**/*.ts" --glob "**/*.tsx"` returns zero results in user-facing copy paths.
- `rg -n "Dreamboard" docs` returns zero results.
- If `src/lib/api/openapi.ts` changed, `pnpm openapi:generate` was run and `tests/unit/openapi-spec.test.ts` passes.
- D1-related tests pass (copy-literal assertion updates allowed, no behavior changes).
- `pnpm build` succeeds (no types, schemas, or logic were modified).

---

## D2 — Logo/Branding Parity

### Rule

The Gifta logo rendering on ALL surfaces must be identical to the homepage landing page implementation. The homepage logo is defined in `src/components/landing/LandingNav.tsx` (lines 113–120):

```tsx
<Link href="/" className="flex items-center gap-2.5 no-underline" style={{ fontFamily: 'var(--font-nunito)' }}>
  <span className="text-[30px]">🎁</span>
  <span className="text-[28px] font-bold text-[#3D3D3D]">Gifta</span>
</Link>
```

The canonical logo is: **🎁 emoji (30px) + "Gifta" text (28px bold, #3D3D3D, Nunito font)**.

### Files to update

| File | Current rendering | Required change |
|------|-------------------|-----------------|
| `src/components/layout/Header.tsx` (line 33–35) | `<Link href="/" className="text-xl font-display text-text">Gifta</Link>` | Replace with homepage logo pattern: `<Link href="/" className="flex items-center gap-2.5 no-underline" style={{ fontFamily: 'var(--font-nunito)' }}><span className="text-[30px]">🎁</span><span className="text-[28px] font-bold text-[#3D3D3D]">Gifta</span></Link>` |
| `src/components/layout/Footer.tsx` (line 5–7) | `<span className="font-medium text-text">Gifta</span>` | Replace with footer-sized variant matching `LandingFooter.tsx` pattern: emoji + "Gifta" in Nunito, sized appropriately for footer context (use the exact treatment from `src/components/landing/LandingFooter.tsx` lines 90–96) |
| `src/components/layout/MobileNav.tsx` | Check if logo is rendered here; if so, update to match homepage pattern | Same emoji + Nunito treatment |

### Acceptance criteria

- The 🎁 emoji appears next to "Gifta" text in Nunito font on: the main app header, the main app footer, mobile navigation, and all admin/host layouts that render the header.
- Visual parity confirmed between landing page and inner-app pages.

---

## D3 — Birthday Party Date + Time Field

### Overview

Add an optional "Birthday party date and time" field to the Dreamboard creation flow. When populated, display a second line below the birthday subtitle on the public Dreamboard.

### Locked data contract (D3)

1. **DB storage:** `party_date_time` is `timestamp with time zone` (`withTimezone: true`) in Postgres.
2. **Persistence format:** store UTC timestamp values in DB; keep draft payload value as ISO string (`partyDateTime?: string`).
3. **Input semantics:** host enters date (`YYYY-MM-DD`) + time (`HH:mm`) in create flow; if date is present and time is blank, default to `12:00`.
4. **Publish mapping:** draft schema + publish insert must include `partyDateTime` so value survives `/create/review` publishing.
5. **Display semantics:** render on guest page using `en-ZA` locale and fixed `timeZone: 'Africa/Johannesburg'` to avoid viewer-timezone drift.

### Schema change

**File:** `src/lib/db/schema.ts`

Add a new column to the `dreamBoards` table:

```typescript
partyDateTime: timestamp('party_date_time', { withTimezone: true }),
```

This is a nullable `timestamp with time zone` column, separate from the existing `partyDate` (which is a `date` column used for campaign timing). The new `partyDateTime` captures the optional birthday party event date+time for display purposes only.

**Migration:** Generate and run a Drizzle migration:
```bash
pnpm drizzle:generate
pnpm drizzle:push
```

### Create flow changes

**File:** `src/app/(host)/create/dates/DatesForm.tsx`

Add a new optional section after the existing date fields:

```
Birthday party date & time (optional)
[Date picker] [Time picker]
```

- Label: `"Birthday party date & time (optional)"`
- Date input: `type="date"`, name `partyDateTimeDate`
- Time input: `type="time"`, name `partyDateTimeTime`
- If date is cleared, clear time as well.
- Validation: if provided, party date+time must be in the future and within 6 months

**File:** `src/app/(host)/create/dates/actions.ts`

Update `saveDatesAction` to:
1. Read `partyDateTimeDate` and `partyDateTimeTime` from FormData
2. If date is provided, combine date + time (or `12:00` fallback) into a timestamp interpreted in `Africa/Johannesburg`
   - Implementation format: `new Date(\`\${date}T\${timeOrDefault}:00+02:00\`).toISOString()`
3. If only date is provided, default time to `12:00`
4. Convert timestamp to ISO string and store in draft as `partyDateTime`
5. If neither date nor time is provided, store `null`
6. Persist to draft via `updateDreamBoardDraft`

**File:** `src/lib/dream-boards/draft.ts`

Add `partyDateTime` to the draft type and the `updateDreamBoardDraft` function parameters.

**File:** `src/lib/dream-boards/schema.ts`

Add `partyDateTime` to `dreamBoardDraftSchema` as optional nullable datetime string so `/create/review` parse succeeds.

### DB query changes

**Files:** `src/lib/db/queries.ts`, `src/lib/db/api-queries.ts`

Add `partyDateTime: dreamBoards.partyDateTime` to all relevant select objects that already include `partyDate`.

### View model changes

**File:** `src/lib/dream-boards/view-model.ts`

Add to the `GuestViewModel` type:
```typescript
partyDateTime: string | null;  // ISO string or null
```

In `buildGuestViewModel`, populate:
```typescript
partyDateTime: board.partyDateTime?.toISOString() ?? null,
```

### Public Dreamboard display

**File:** `src/app/(guest)/[slug]/page.tsx`

In the `HeaderSection` component, after the existing `ageLine` paragraph, add a conditional second line:

```tsx
{view.partyDateTime ? (
  <p className="font-primary text-base text-gray-600">
    Birthday Party · {new Date(view.partyDateTime).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      timeZone: 'Africa/Johannesburg',
    })}{', '}{new Date(view.partyDateTime).toLocaleTimeString('en-ZA', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Johannesburg',
    })}
  </p>
) : null}
```

This produces output like: **Birthday Party · 30 March, 2:00 PM**

The font, size, and color must be identical to the existing `ageLine` paragraph (`font-primary text-base text-gray-600`).

### Review step

**Files:** `src/app/(host)/create/review/ReviewClient.tsx`, `src/app/(host)/create/review/page.tsx`

1. Display the party date+time in review summary if set.
2. Ensure `publishDreamBoardAction` inserts `partyDateTime` into `dreamBoards`.
3. Ensure `CreateReviewPage` passes `partyDateTime` through draft props used by `ReviewClient`.

### Acceptance criteria

- New `party_date_time` column exists in DB schema.
- Create flow shows optional date+time picker.
- Draft schema accepts `partyDateTime` and publish path persists it.
- Public Dreamboard shows "Birthday Party · [Date], [Time]" below the birthday line when set.
- Public Dreamboard shows nothing extra when not set.
- Display is stable in `Africa/Johannesburg` timezone.
- Existing date fields continue to work unchanged.
- All tests pass.

---

## D4 — Remove ReturnVisitBanner

### Rule

The `ReturnVisitBanner` component and all references to it must be removed from the public Dreamboard entirely. No "welcome back" messaging should appear to returning visitors.

### Files to update

| File | Action |
|------|--------|
| `src/app/(guest)/[slug]/page.tsx` | Remove the import of `ReturnVisitBanner` (line 10). Remove the `<ReturnVisitBanner ... />` JSX block (lines 219–224). The `ParentBanner` should remain but the else branch that renders `ReturnVisitBanner` becomes unnecessary — replace with `null` or remove the ternary entirely if `ParentBanner` is the only remaining branch. |
| `src/components/dream-board/ReturnVisitBanner.tsx` | Delete this file entirely. |

### Spacing adjustment

After removing the banner, verify that the spacing between sections in the guest page layout (`space-y-6` on the parent `<section>`) still produces a visually balanced layout. No manual spacing changes should be needed since `space-y-6` handles gaps automatically, but visually confirm.

### Test changes

Any tests referencing `ReturnVisitBanner` must be updated:
- Search for `ReturnVisitBanner` or `return-visit` in `tests/` directory.
- Remove or update those test cases.

### Documentation update

| File | Action |
|------|--------|
| `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C2-public-dream-board-enhancements.md` | Add a note at the top: `> **Phase D update:** ReturnVisitBanner has been removed from the public Dreamboard per parent feedback.` Keep the original spec text for audit trail. |

### Acceptance criteria

- `ReturnVisitBanner.tsx` file does not exist.
- `rg -n "ReturnVisitBanner" src` returns zero results.
- Public Dreamboard renders without any "welcome back" banner.
- All tests pass.

---

## D5 — Gift Section Label: "[CHILD'S NAME]'S ONE BIG WISH"

### Rule

The gift section on the public Dreamboard currently uses the label "The Gift" (from Phase C spec). It must instead show **"✨ [CHILD'S NAME]'S ONE BIG WISH"** — exactly matching the homepage mock's treatment. The child's name must be uppercased.

### Current state

**File:** `src/app/(guest)/[slug]/page.tsx`, `OneWishSection` component (line 81–82):

```tsx
<p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C4956A]">
  ✨ {view.childName.toUpperCase()}&apos;S ONE BIG WISH
</p>
```

**This is already correct.** The current codebase already uses the dynamic `{view.childName.toUpperCase()}'S ONE BIG WISH` pattern.

### Verification

Confirm that this label is indeed rendered with the child's actual name, not a static "The Gift" string. If any other surface (dashboard, review, admin) shows "The Gift" as a section label for the same concept, update those too.

**Files to search:**
```bash
rg -n "The Gift" src --glob "**/*.ts" --glob "**/*.tsx"
```

Replace any user-facing occurrences with the dynamic pattern or with "One Big Wish" as appropriate for the context.

### Acceptance criteria

- Public Dreamboard gift section shows `✨ [CHILD NAME]'S ONE BIG WISH` with the actual child's name, uppercased.
- No public surface shows "The Gift" as a section label.

---

## D6 — Remove Financial Goal Entirely

### Overview

This is the most impactful refactor. The funding goal concept (`goalCents`, progress bar, percentage, "X of Y raised") must be removed from all public-facing surfaces and from the Dreamboard creation flow. Parent feedback indicates that showing a monetary goal is inappropriate.

### Locked status model (D6)

1. `funded` remains a valid board status in the schema and API.
2. For Phase D, **funded is not derived from `raisedCents >= goalCents` for new goal-less boards**.
3. New boards (`goalCents = 0`) must never auto-transition to `funded` on first contribution.
4. `markDreamBoardFundedIfNeeded` must guard for `goalCents > 0` before any funded transition.
5. Guest/host funded UI states must be based on `board.status === 'funded'`, not goal math.
6. For boards with `goalCents = 0`, `funded` is set only by explicit host completion flow (manual host action), never by contribution accumulation.

### What to remove

1. **Goal amount input** from the create flow
2. **ProgressBar component** from the public Dreamboard
3. **GoalProgressSection** from the public Dreamboard
4. **All percentage/amount displays** ("82% funded", "R820 of R1 000", "Goal: R1 000")
5. **Funded state banner** ("Goal reached! Extra contributions still help.")
6. **`isFunded` logic** that depends on `raisedCents >= goalCents` on guest/public surfaces

### What to KEEP

- The `goalCents` column in the database schema — do NOT drop it. Keep non-null, set default `0` for new boards. Existing boards retain historical values.
- The `raisedCents` column — this is needed for host dashboard and admin reporting.
- The `contributionCount` — this drives the contributor list.
- Backend financial calculations for payouts and charity splits — these operate on actual `raisedCents`, not goals.

### What to ADD as a replacement

Instead of the progress bar, add a new **status indicator** component that conveys warmth and activity without showing financial figures. Design specification:

**New component: `DreamboardStatusBadge`**

Location: `src/components/dream-board/DreamboardStatusBadge.tsx`

This is a simple, elegant status display that shows:

- **When contributions are open and the board has contributions:** A warm, animated badge: `"Contributions are coming in! 🎁"` — styled with the same warm green background (`bg-[#E4F0E8]`) and celebratory feel. Below it, the `TimeRemaining` component is inlined.
- **When contributions are open but no contributions yet:** `"Be the first to chip in! 🎁"` with the `TimeRemaining` component.
- **When the board is closed/expired:** `"This Dreamboard is closed to new contributions."` — subdued styling.
- **When the board is funded (host marked complete):** `"Gift funded — thank you, everyone! 🎉"` — celebration styling with confetti-like accent.

The visual treatment should be a soft, rounded card (matching the existing `rounded-2xl border border-border bg-white p-5` pattern) with:
- A centred emoji at the top
- The status message in `font-display text-lg text-gray-900`
- The time remaining underneath in muted text
- No financial figures whatsoever

### Critical dependency checklist (must all be updated together)

- `src/lib/host/create-view-model.ts` (gift-step completion currently requires `goalCents`)
- `src/lib/dream-boards/schema.ts` (`goalCents` currently required min 2000)
- `src/app/(host)/create/review/ReviewClient.tsx` (goal copy + share text currently references amount)
- `src/app/(host)/create/review/page.tsx` (publish payload currently expects `goalCents` in parsed draft)
- `src/lib/db/queries.ts` (`markDreamBoardFundedIfNeeded` currently compares raised vs goal)
- `src/app/api/webhooks/payfast/route.ts`, `src/app/api/webhooks/ozow/route.ts`, `src/app/api/webhooks/snapscan/route.ts` (funded event flow currently calls `markDreamBoardFundedIfNeeded`)

### Files to update

#### Create flow — remove goal input

**File:** `src/app/(host)/create/gift/page.tsx`

1. Remove the `goalAmount` field from `manualGiftSchema` (line 24): delete `goalAmount: z.coerce.number().int().min(20),`
2. Remove the "Goal amount (R)" label, input, and surrounding `<div>` (lines 194–207)
3. Remove `goalAmount` from `formData.get('goalAmount')` (line 81)
4. Remove `goalAmount` from the `result` parse (line 88)
5. Remove `const goalCents = Math.round(result.data.goalAmount * 100);` (line 100)
6. In the `updateDreamBoardDraft` call (line 102), set `goalCents: 0`
7. Remove `resolveDefaultGoal` function (lines 44–45)
8. Remove `defaultGoal` variable (line 133)
9. Update `CardDescription` from `"Describe the dream gift and the goal amount."` to `"Describe the dream gift."`
10. Update `CardTitle` from `"Dream gift"` to `"The dream gift"` (optional, for warmth)

**File:** `src/lib/dream-boards/draft.ts`

Make `goalCents` optional in the draft type. When publishing a draft to a live board, default to `0` if not set.

**File:** `src/lib/dream-boards/schema.ts` (validation)

Update any Zod schemas that require `goalCents` to make it optional with a default of `0`.

**File:** `src/lib/host/create-view-model.ts`

Update `isGiftComplete` so completion no longer depends on `draft.goalCents`.

**Files:** `src/app/(host)/create/review/ReviewClient.tsx`, `src/app/(host)/create/review/page.tsx`

1. Remove goal amount from review preview and share copy.
2. Persist `goalCents: 0` (or schema defaulted value) in publish insert path.

#### DB schema — make goal optional for new boards

**File:** `src/lib/db/schema.ts` (line 138)

Change:
```typescript
goalCents: integer('goal_cents').notNull(),
```
To:
```typescript
goalCents: integer('goal_cents').notNull().default(0),
```

Also update the check constraint (line 185):
```typescript
validGoal: check('valid_goal', sql`${table.goalCents} >= 2000`),
```
Change to:
```typescript
validGoal: check('valid_goal', sql`${table.goalCents} >= 0`),
```

Generate and run a migration for this change.

#### Funded transition logic — decouple from goal math for new boards

**File:** `src/lib/db/queries.ts` (`markDreamBoardFundedIfNeeded`)

1. Add guard: if `board.goalCents <= 0`, return `false` immediately.
2. Keep legacy funded transition behavior for historical boards where `goalCents > 0`.

**Files:** `src/app/api/webhooks/payfast/route.ts`, `src/app/api/webhooks/ozow/route.ts`, `src/app/api/webhooks/snapscan/route.ts`

Keep calling `markDreamBoardFundedIfNeeded`, but rely on guarded logic above so new goal-less boards do not emit `pot.funded` from contribution accumulation.
Add/adjust tests to assert payment webhooks do not emit `pot.funded` when `goalCents === 0`.

#### Public Dreamboard — remove progress section

**File:** `src/app/(guest)/[slug]/page.tsx`

1. Remove the import of `ProgressBar` (line 9)
2. Remove the entire `GoalProgressSection` function (lines 107–134)
3. Remove `<GoalProgressSection view={view} />` from the JSX (line 201)
4. Remove `Goal: {formatZar(view.goalCents)}` from `OneWishSection` (line 100)
5. Remove the `formatZar` import if no longer used (line 19)
6. Add the new `DreamboardStatusBadge` component in place of `GoalProgressSection`:
   ```tsx
   <DreamboardStatusBadge
     contributionCount={view.contributionCount}
     isActive={view.isActive}
     isClosed={view.isClosed}
     isExpired={view.isExpired}
     timeRemainingMessage={view.timeRemainingMessage}
     timeRemainingUrgency={view.timeRemainingUrgency}
     daysLeft={view.daysLeft}
   />
   ```

#### View model — remove goal-dependent fields from public view

**File:** `src/lib/dream-boards/view-model.ts`

1. Remove `percentage` from `GuestViewModel` type (line 43) and remove all guest-page usage.
2. Remove `goalCents` from `GuestViewModel` type (line 47) — it should not be exposed to the guest view at all.
3. Remove `raisedCents` from `GuestViewModel` type (line 46) — same reasoning.
4. Replace goal-based funded logic with status-based logic:
   - from: `const isFunded = board.raisedCents >= board.goalCents;`
   - to: `const isFunded = board.status === 'funded';`
5. Remove `funded` from the view model (line 282).
6. Remove goal-based percentage computation (line 284) to avoid divide-by-zero when `goalCents = 0`.
7. Remove the funded-state time remaining message that references goals.

**File:** `src/lib/dream-boards/view-model.ts` — `buildThankYouViewModel`

Remove the `percentage` computation on line 307–310 and remove `percentage` from `ThankYouViewModel` if no consumers remain.

#### ProgressBar component — deprecate

**File:** `src/components/dream-board/ProgressBar.tsx`

Do NOT delete this file. Mark it deprecated for public Dreamboard usage:
1. Add comment: `// DEPRECATED for public Dreamboard display (Phase D).`
2. Remove guest-page usage.
3. Host dashboard usage is also removed in D6 (below), but file remains available for future internal use.

#### Host dashboard — adjust financial display

**Files:** `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`, `src/app/(host)/dashboard/page.tsx`

Replace any "Goal: R1 000" or "X% funded" display with:
- "Total raised: R820" (neutral, no goal reference)
- Remove progress bar from host dashboard cards and detail view for Phase D

**File:** `src/lib/host/dashboard-view-model.ts`

Keep `raisedCents` and `goalCents` in the dashboard view model (host needs financial data), but remove any "percentage" or "funded" computations that reference goalCents for display purposes.

#### Admin — adjust displays

**File:** `src/app/(admin)/admin/dream-boards/page.tsx`

Keep goal data in admin tables (admin needs to see financial state), but note that new boards will have `goalCents: 0`. Admin displays should handle this gracefully (show "No goal set" or similar when `goalCents === 0`).

#### Landing page mock

**File:** `src/components/landing/LandingDreamBoard.tsx`

Remove the progress bar section (lines 71–93) from the homepage mock. Replace with something that conveys activity without a percentage — e.g., the contributor section can be moved up, or a simple "Contributions open 🎁" badge.

#### Tests

Search for all test files referencing `goalCents`, `ProgressBar`, `GoalProgressSection`, `percentage`, or `funded`:
```bash
rg -n "goalCents|ProgressBar|GoalProgressSection|percentage.*funded|isFunded|ReturnVisitBanner" tests
```

Update or remove affected test cases. Key changes:
- Remove tests that assert goal display on public Dreamboard.
- Update create flow tests to not require a goal amount.
- Update view model tests to not compute or assert percentages.
- Add tests for the new `DreamboardStatusBadge` component.

### Documentation update

| File | Action |
|------|--------|
| `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md` | Remove "Progress support text" (`[percentage]% funded`), "Funded state banner", and any goal-related copy entries. Add new status badge copy entries. |
| `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C2-public-dream-board-enhancements.md` | Add note: `> **Phase D update:** Financial goal display (ProgressBar, GoalProgressSection, percentage, amounts) removed from public Dreamboard per parent feedback. Replaced with DreamboardStatusBadge.` |
| `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C1-host-create-flow-restructure.md` | Add note: `> **Phase D update:** Goal amount input removed from gift step. goalCents defaults to 0 for new boards.` |

### Acceptance criteria

- No financial amounts, percentages, or goal references appear on the public Dreamboard.
- No goal amount input exists in the create flow.
- Host dashboard shows "Total raised" without goal reference or goal progress bars.
- Admin handles `goalCents: 0` gracefully.
- Landing page mock no longer shows a progress percentage.
- `DreamboardStatusBadge` component exists and renders status messages.
- `markDreamBoardFundedIfNeeded` does not auto-fund boards when `goalCents === 0`.
- Goal-less boards (`goalCents === 0`) do not emit `pot.funded` from payment webhook flows.
- All tests pass.
- `pnpm build` succeeds.

---

## D7 — Contributor List Redesign

### Rule

Replace the current avatar-chip-based `ContributorDisplay` with a text-based contributor list. The format for each contributor is:

```
[First name] [First letter of last name]. has chipped in!
```

Examples:
- `Katie M. has chipped in!`
- `Thabo N. has chipped in!`
- `Anonymous has chipped in!` (for anonymous contributors — no special callout, just list them as "Anonymous")

The list shows a **maximum of 6 names**. If there are more than 6 contributors, show the 6 most recent followed by:

```
and [X] others
```

Where X is the total contributor count minus 6.

### Implementation

**File:** `src/components/dream-board/ContributorDisplay.tsx`

Complete rewrite of this component. Replace the current avatar-chip display with:

```tsx
type ContributorItem = {
  name: string | null;
  isAnonymous: boolean;
  avatarColorIndex: number;  // kept for type compat but unused
};

type ContributorDisplayProps = {
  contributors: ContributorItem[];
  totalCount: number;
};

const formatContributorName = (contributor: ContributorItem): string => {
  if (contributor.isAnonymous || !contributor.name) {
    return 'Anonymous';
  }
  const parts = contributor.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Anonymous';
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? '';
  return `${firstName} ${lastInitial}.`;
};
```

The component renders:

```tsx
<section className="space-y-3 rounded-2xl border border-border bg-white p-5">
  <h2 className="font-display text-xl text-gray-900">
    <span aria-hidden="true" className="mr-2">{headingEmoji}</span>
    {headingText}
  </h2>

  <ul className="space-y-2">
    {displayContributors.map((contributor, index) => (
      <li key={index} className="text-sm text-gray-700">
        <span className="font-semibold">{formatContributorName(contributor)}</span>
        {' '}has chipped in!
      </li>
    ))}
  </ul>

  {overflowCount > 0 && (
    <p className="text-sm text-gray-500 italic">
      and {overflowCount} {overflowCount === 1 ? 'other' : 'others'}
    </p>
  )}
</section>
```

Where:
- `displayContributors = contributors.slice(0, 6)`
- `overflowCount = Math.max(0, totalCount - 6)`
- Heading uses same `getHeadingCopy` logic (count-based emoji and text)
- The modal/pagination system is **removed entirely** — no need for a full list view since we only show 6 + overflow count
- The `AVATAR_COLORS` array, `getInitials` function, and all avatar-rendering code are removed
- Anonymous contributors are mixed into the list as "Anonymous has chipped in!" — no separate callout

### Data query changes

**File:** `src/app/(guest)/[slug]/page.tsx`

Change the contributor query limit (line 181):
```typescript
// Before:
const contributorLimit = Math.max(20, board.contributionCount);
// After:
const contributorLimit = 6;  // Only need 6 for display
```

The `totalCount` prop still comes from `view.contributionCount` (which comes from the board aggregate), so the "and X others" count remains accurate even though we only fetch 6 contributor records.

### DB query

**File:** `src/lib/db/queries.ts` — `listRecentContributors`

Ensure this function also returns the `contributorName` field with both first and last name (or whatever is stored). Check the current schema:

The `contributions` table has `contributorName` as a `varchar(100)` field. This should contain the full name as entered by the contributor. The `formatContributorName` function handles parsing it into "[First] [Last initial]." format.

### Contributor name data availability

The contributor name field (from the contribute flow) is labelled "Your name (optional)". Contributors may enter:
- Full name: "Katie Miller" → "Katie M."
- First name only: "Katie" → "Katie"
- Nothing (anonymous): → "Anonymous"

The formatting function handles all these cases.

### Remove deprecated components

After the rewrite:
- Check if `ContributorChips.tsx` is still imported anywhere. If not, delete it.
- The `ContributorList.tsx` component (used for host dashboard) should remain as-is.

### Tests

Update contributor display tests:
- Remove tests for avatar rendering, modal, pagination.
- Add tests for name formatting: `"Katie Miller" → "Katie M."`, `"Thabo" → "Thabo"`, `null → "Anonymous"`, `"" → "Anonymous"`.
- Add tests for overflow: 3 contributors shows no "and X others", 8 contributors shows 6 names + "and 2 others".
- Add test for anonymous mixed in list.

### Acceptance criteria

- Public Dreamboard shows contributor names in "[First] [Last initial]. has chipped in!" format.
- Maximum 6 names displayed.
- Overflow shows "and X others" (singular/plural correct).
- No avatar circles anywhere on the public Dreamboard.
- Anonymous contributors listed as "Anonymous has chipped in!" within the main list.
- No separate "anonymous contributor" callout.
- All tests pass.

---

## Implementation Order

Execute refactors in this order to minimise conflicts:

1. **D1** (terminology) — pure string replacements, broad but safe
2. **D2** (logo) — isolated to layout components
3. **D4** (remove ReturnVisitBanner) — simple deletion
4. **D5** (gift label) — verify already correct, minor touchups
5. **D6** (remove goal) — largest change, affects schema/views/components
6. **D3** (party date+time) — new feature, builds on schema already modified in D6
7. **D7** (contributor redesign) — component rewrite, independent of other changes

After each refactor:
- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run `pnpm build`.
- If `src/lib/api/openapi.ts` changed in that refactor, run `pnpm openapi:generate` and rerun `pnpm test`.
- Commit using Conventional Commits (examples: `docs(phase-d): align D1 terminology plan`, `feat(phase-d): remove public goal display`).

---

## Post-Implementation Verification

After all seven refactors are complete:

1. Run lint: `pnpm lint`
2. Run typecheck: `pnpm typecheck`
3. Run full test suite: `pnpm test`
4. Run full build: `pnpm build`
5. If `src/lib/api/openapi.ts` changed, run `pnpm openapi:generate` and ensure `tests/unit/openapi-spec.test.ts` passes.
6. Verify zero "Dreamboard" (two words) in codebase: `rg -n "Dreamboard" src docs`
7. Verify zero `ReturnVisitBanner` references: `rg -n "ReturnVisitBanner" src`
8. Verify zero `goalCents` references in public guest pages: `rg -n "goalCents" 'src/app/(guest)'`
9. Verify zero `ProgressBar` references in public guest pages: `rg -n "ProgressBar" 'src/app/(guest)'`
10. Start dev server and visually inspect:
   - Landing page: logo renders with 🎁 emoji + Nunito font
   - Public Dreamboard: no progress bar, no goal, correct terminology, contributor list format, status badge
   - Create flow: no goal input, party date+time field works
   - Host dashboard: shows "Total raised" not "Goal"
11. Commit final state.

---

## Appendix A: UX UI-Spec Documentation Updates

The canonical UI spec layer lives at `docs/UX/ui-specs/` (23 files). These specs were **not included** in the original Phase C evidence files but define the authoritative visual/interaction contracts for every screen. The following files require updates for Phase D:

### D1 — Terminology (already correct in specs)

All 23 UI spec files already use "Dreamboard" (one word). No changes needed. Confirmed via: `rg -n "Dreamboard" docs/UX/ui-specs/` returns zero results.

### D4 — ReturnVisitBanner removal

| File | Lines | Action |
|------|-------|--------|
| `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md` | ~326–334 | Remove or annotate the "Returning Contributor" section (banner with "Thanks for chipping in, [Name]! 💝", localStorage detection logic, share CTA). Add Phase D note. |
| `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md` | ~588, 597 | Remove `ReturnVisitBanner.tsx` and `useReturnVisit.ts` from component tree listing. |
| `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md` | ~902 | Remove "Show return visit banner instead of CTA" from edge case/display rules. |
| `docs/UX/ui-specs/10-CONTRIBUTE-AMOUNT-DETAILS.md` | ~359 | Remove "Encourage return visits and gift follow-up" purpose statement if it references the banner. |

### D5 — Gift section label

| File | Lines | Action |
|------|-------|--------|
| `docs/UX/ui-specs/19-SHARED-COMPONENTS.md` | ~990 | Change `"Dream gift: [Gift name]"` card label to `"✨ [CHILD]'S ONE BIG WISH"` to match public Dreamboard pattern. |

### D6 — Remove financial goal

This is the most impactful spec change. Goal/progress references are spread across 10+ spec files:

| File | Section/Lines | Content to update | Action |
|------|---------------|-------------------|--------|
| `docs/UX/ui-specs/04-CREATE-STEP-2-THE-GIFT.md` | Field 4: Goal Amount (~391–455) | Entire goal amount field spec, validation, Zod schema, accessibility, component tree entries | **Remove entire section.** Update CardDescription, page title, server action spec, draft type. Remove `goalCents` from form submission flow. Add Phase D note. |
| `docs/UX/ui-specs/06-CREATE-STEP-4-GIVING-BACK.md` | "Percentage of goal" radio option (~376–490) | Split type radio, slider, `calculateSplit(goalCents...)`, preview text "Out of your R600 goal:" | **Rewrite** to remove goal-based language. The charity split still works (percentage of *contributions received*, not of a goal). Update preview text to: "X% of each contribution supports [Charity]". Remove `goalCents` parameter from `calculateSplit`. |
| `docs/UX/ui-specs/08-CREATE-CONFIRMATION.md` | Review preview (~626, 791) | `goalAmount={goalCents}`, draft fields list | Remove goal amount from review preview. Remove `goalCents` from draft field list. |
| `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md` | Data model (~468–469), OG metadata (~634) | `target_amount: number`, "R[dreamboard.total_raised] raised so far" | Remove `target_amount` from data model. Remove "raised so far" from OG meta description (replace with child/gift description). Remove any progress bar or percentage display specs. |
| `docs/UX/ui-specs/14-HOST-DASHBOARD-LIST.md` | Progress bar (~253–350), data model (~562–563) | `ProgressIndicator`, "0-100% progress", `progress_percentage`, `target_amount_cents` | Replace progress display with "Total raised: R[amount]" (no goal reference). Make `target_amount_cents` optional. Remove percentage calculation. |
| `docs/UX/ui-specs/15-HOST-DASHBOARD-DETAIL.md` | Data model (~628) | `target_amount_cents` | Make optional. Remove any "X% of goal" display. Replace with "Total raised". |
| `docs/UX/ui-specs/17-HOST-DASHBOARD-POST-CAMPAIGN.md` | Celebration heading (~41), progress percentage (~596) | "progress_percentage: number; // Will be 100%" | Remove progress_percentage. Replace with celebration without goal reference. |
| `docs/UX/ui-specs/19-SHARED-COMPONENTS.md` | ProgressBar component (~1113–1177), DreamboardCard (~1039–1040) | `targetAmount`, `currentAmount`, "75% funded", "R3,750 of R5,000", "Fully funded!" | **Deprecate ProgressBar section** for Phase D surfaces (guest + host dashboards). Keep component file documented as deprecated internal utility only. Remove `targetAmount` from DreamboardCard. Update "75% funded" label to remove from specs. |
| `docs/UX/ui-specs/20-COMMUNICATIONS.md` | Goal reached email trigger (~196) | "When total contributions reach or exceed goal amount" | Rewrite trigger: "Sent when the host marks the Dreamboard as complete" (or similar non-goal trigger). |
| `docs/UX/ui-specs/21-CELEBRATIONS-DELIGHT.md` | CountingNumber component (~434–507) | "75% funded", progress bar counting animation, `format: 'percentage'` | Remove percentage format option. Keep currency format for host dashboard "Total raised" display. Remove "funded" suffix examples. |

### D7 — Contributor list redesign

| File | Lines | Action |
|------|-------|--------|
| `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md` | ~201–209 | Replace avatar circle specs (36px, initials, color cycling, overlap stacking) with text list spec: `"[First] [Last initial]. has chipped in!"`, max 6, "and X others". Remove "💝 Anonymous contributor" callout — anonymous listed as "Anonymous has chipped in!" inline. |
| `docs/UX/ui-specs/19-SHARED-COMPONENTS.md` | ContributorChips (~1181–1232) | **Deprecate** this component section. Add note: "Replaced by text-based ContributorDisplay in Phase D." |
| `docs/UX/ui-specs/21-CELEBRATIONS-DELIGHT.md` | ContributorChips staggered animation | Remove avatar animation specs. Contributor list is now static text. |
| `docs/UX/ui-specs/01-LANDING-PAGE.md` | ~539–593 | Update landing page mock contributor section to match new text-based format (no avatars). |

### D3 — Birthday party date+time

| File | Lines | Action |
|------|-------|--------|
| `docs/UX/ui-specs/05-CREATE-STEP-3-THE-DATES.md` | After party date field (~286–320) | Add new optional section: "Birthday party date & time (optional)" with date picker + time picker. Validation: must be in future, within 6 months. Time defaults to 12:00 if only date provided. |
| `docs/UX/ui-specs/09-PUBLIC-DREAM-BOARD.md` | ~145–146 | Update display rules: when `partyDateTime` is set, show second line: "Birthday Party · [Date], [Time]" (same font/style as birthday line). Current spec already mentions conditional "Birthday party on [party date]" — extend to include time. |

---

## Appendix B: Files Inventory

Total files expected to be modified: ~55 (code: ~45, docs/UX/ui-specs: ~10)
Total files expected to be created: 2 (`DreamboardStatusBadge.tsx`, DB migration file)
Total files expected to be deleted: 1 (`ReturnVisitBanner.tsx`)

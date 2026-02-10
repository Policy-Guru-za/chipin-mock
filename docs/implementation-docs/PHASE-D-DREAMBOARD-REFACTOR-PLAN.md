# Phase D — Dreamboard UX Refactor Plan

## Purpose

This document is an implementation-ready plan for an AI coding agent. It specifies seven refactors to the Gifta platform's Dreamboard UX, covering both documentation updates and codebase changes. Every file path, search string, replacement string, and acceptance criterion is explicit. No further human input should be required.

---

## Refactor Index

| ID | Summary | Scope |
|----|---------|-------|
| D1 | Terminology: "Dream Board" → "Dreamboard" everywhere | Docs + Code |
| D2 | Logo/branding parity: use homepage logo asset on all surfaces | Code |
| D3 | Birthday party date+time field in create flow and Dreamboard display | Code + Schema |
| D4 | Remove ReturnVisitBanner from public Dreamboard | Code + Docs |
| D5 | Gift section label: "The Gift" → "[CHILD'S NAME]'S ONE BIG WISH" | Code |
| D6 | Remove financial goal entirely (progress bar, goal input, percentage, amounts) | Code + Schema + Docs |
| D7 | Contributor list redesign: names list format, no avatars, "and X others" | Code |

---

## Pre-Implementation Checklist

Before starting any refactor, the agent MUST:

1. Run `npm run build` to confirm a clean baseline.
2. Run `npm run test` (or equivalent) to confirm all existing tests pass.
3. Create a new git branch: `git checkout -b phase-d/dreamboard-refactor`.
4. Commit the clean baseline: `git commit --allow-empty -m "phase-d: branch baseline"`.

---

## D1 — Terminology: "Dream Board" → "Dreamboard"

### Rule

The canonical product term is **"Dreamboard"** (one word, capital D). There must be zero instances of "Dream Board" (two words) on any public-facing surface, any user-facing UI string, any documentation, or any code comment that leaks to users. Internal code identifiers (variable names, DB columns, API paths) may retain their existing casing for backward compatibility.

### What NOT to change

- Database column names (`dream_boards` table name, `dream-boards` in API routes) — these are internal and renaming them would require a migration with zero user-facing benefit.
- Webhook event names (`dreamboard.created`, `dreamboard.updated`) — already correct.
- API scope strings (`dreamboards:read`, `dreamboards:write`) — already correct.
- File/directory names under `src/components/dream-board/` — renaming directories is a separate concern; the component exports matter, not the folder names.

### Files to update (Code)

Search the entire `src/` directory for the regex pattern `Dream\s+Board` (case-sensitive) and replace with `Dreamboard`. Based on the codebase audit, the following 34 files contain this pattern and must be updated:

**UI Copy / User-facing strings:**

| File | Line(s) | Current | Replacement |
|------|---------|---------|-------------|
| `src/app/(guest)/[slug]/page.tsx` | 159 | `'This Dream Board is closed to new contributions.'` | `'This Dreamboard is closed to new contributions.'` |
| `src/app/(guest)/[slug]/page.tsx` | 161 | `'Dreamboard \| Gifta'` | Already correct — verify no "Dream Board" variant |
| `src/app/(guest)/error.tsx` | * | Any "Dream Board" string | "Dreamboard" |
| `src/app/(host)/error.tsx` | * | Any "Dream Board" string | "Dreamboard" |
| `src/app/(host)/create/review/page.tsx` | * | `"Create Dream Board"` | `"Create Dreamboard"` |
| `src/app/(host)/create/review/ReviewClient.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(host)/dashboard/page.tsx` | * | `"Your Dream Boards"` | `"Your Dreamboards"` |
| `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(host)/dashboard/[id]/actions.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(guest)/[slug]/contribute/payment/page.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(guest)/[slug]/thanks/actions.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/(admin)/admin/dream-boards/page.tsx` | * | Any "Dream Board" display text | "Dreamboard" |
| `src/app/api/internal/downloads/birthday-messages/route.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/app/api/internal/contributions/create/route.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/components/dream-board/ReturnVisitBanner.tsx` | * | Any "Dream Board" | "Dreamboard" (this file is being removed in D4, but update for completeness) |
| `src/components/host/EditDreamBoardModal.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/components/contribute/ReminderModal.tsx` | * | Reminder confirmation copy referencing "Dream Board" | "Dreamboard" |
| `src/components/layout/Header.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/components/layout/MobileNav.tsx` | * | Any "Dream Board" | "Dreamboard" |
| `src/components/admin/AdminSidebar.tsx` | * | Any "Dream Board" display labels | "Dreamboard" or "Dreamboards" |
| `src/components/ui/empty-state.tsx` | * | `"You haven't created a Dream Board yet."` | `"You haven't created a Dreamboard yet."` |
| `src/lib/ui/copy.ts` | * | All "Dream Board" strings | "Dreamboard" |
| `src/lib/reminders/templates.ts` | * | Subject/body text with "Dream Board" | "Dreamboard" |
| `src/lib/payouts/service.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/lib/payouts/admin-copy.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/lib/host/create-view-model.ts` | * | Step labels, titles with "Dream Board" | "Dreamboard" |
| `src/lib/host/dashboard-view-model.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/lib/integrations/karri-batch.ts` | * | Any "Dream Board" | "Dreamboard" |
| `src/lib/dream-boards/metadata.ts` | * | OG/meta title/description with "Dream Board" | "Dreamboard" |
| `src/lib/dream-boards/view-model.ts` | line 159 | `'This Dream Board is closed to new contributions.'` | `'This Dreamboard is closed to new contributions.'` |
| `src/lib/api/openapi.ts` | * | API description text with "Dream Board" | "Dreamboard" |

**Implementation approach:**

```bash
# Automated sweep — run from project root
grep -rn "Dream Board" src/ --include="*.ts" --include="*.tsx" -l | sort
# Then for each file, replace user-facing strings only.
# Use sed or targeted find-replace. Do NOT replace inside import paths or directory references.
```

### Files to update (Documentation)

| File | Action |
|------|--------|
| `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md` | Replace ALL instances of "Dream Board" with "Dreamboard" in the terminology table, all copy tables, and all prose |
| All Phase C evidence files under `docs/implementation-docs/evidence/ux-v2/phase-c/*.md` | Replace "Dream Board" with "Dreamboard" throughout |
| All Phase B evidence files under `docs/implementation-docs/evidence/ux-v2/phase-b/*.md` | Replace "Dream Board" with "Dreamboard" throughout |
| Any other `.md` files in `docs/` containing "Dream Board" | Replace with "Dreamboard" |

### Acceptance criteria

- `grep -rn "Dream Board" src/ --include="*.ts" --include="*.tsx"` returns zero results.
- `grep -rn "Dream Board" docs/` returns zero results.
- All tests pass.
- Build succeeds.

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

### Schema change

**File:** `src/lib/db/schema.ts`

Add a new column to the `dreamBoards` table:

```typescript
partyDateTime: timestamp('party_date_time', { withTimezone: true }),
```

This is a nullable `timestamp with time zone` column, separate from the existing `partyDate` (which is a `date` column used for campaign timing). The new `partyDateTime` captures the optional birthday party event date+time for display purposes only.

**Migration:** Generate and run a Drizzle migration:
```bash
npx drizzle-kit generate
npx drizzle-kit push  # or migrate, depending on the project's migration strategy
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
- Both fields appear/disappear together (if user enters a date, time becomes available; if user clears date, time clears too)
- Validation: if provided, party date+time must be in the future and within 6 months

**File:** `src/app/(host)/create/dates/actions.ts`

Update `saveDatesAction` to:
1. Read `partyDateTimeDate` and `partyDateTimeTime` from FormData
2. If both are provided, combine into a `Date` object and store as `partyDateTime`
3. If only date is provided, default time to `12:00`
4. If neither is provided, store `null`
5. Persist to draft via `updateDreamBoardDraft`

**File:** `src/lib/dream-boards/draft.ts`

Add `partyDateTime` to the draft type and the `updateDreamBoardDraft` function parameters.

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
    })}{', '}{new Date(view.partyDateTime).toLocaleTimeString('en-ZA', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}
  </p>
) : null}
```

This produces output like: **Birthday Party · 30 March, 2:00 PM**

The font, size, and color must be identical to the existing `ageLine` paragraph (`font-primary text-base text-gray-600`).

### Review step

**File:** `src/app/(host)/create/review/ReviewClient.tsx` (or `page.tsx`)

Display the party date+time in the review summary if set.

### Acceptance criteria

- New `party_date_time` column exists in DB schema.
- Create flow shows optional date+time picker.
- Public Dreamboard shows "Birthday Party · [Date], [Time]" below the birthday line when set.
- Public Dreamboard shows nothing extra when not set.
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
- `grep -rn "ReturnVisitBanner" src/` returns zero results.
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
grep -rn "The Gift" src/ --include="*.ts" --include="*.tsx"
```

Replace any user-facing occurrences with the dynamic pattern or with "One Big Wish" as appropriate for the context.

### Acceptance criteria

- Public Dreamboard gift section shows `✨ [CHILD NAME]'S ONE BIG WISH` with the actual child's name, uppercased.
- No public surface shows "The Gift" as a section label.

---

## D6 — Remove Financial Goal Entirely

### Overview

This is the most impactful refactor. The funding goal concept (`goalCents`, progress bar, percentage, "X of Y raised") must be removed from all public-facing surfaces and from the Dreamboard creation flow. Parent feedback indicates that showing a monetary goal is inappropriate.

### What to remove

1. **Goal amount input** from the create flow
2. **ProgressBar component** from the public Dreamboard
3. **GoalProgressSection** from the public Dreamboard
4. **All percentage/amount displays** ("82% funded", "R820 of R1 000", "Goal: R1 000")
5. **Funded state banner** ("Goal reached! Extra contributions still help.")
6. **`isFunded` logic** that depends on `raisedCents >= goalCents`

### What to KEEP

- The `goalCents` column in the database schema — do NOT drop it. Set it to nullable or give it a sensible default (e.g., `0`) for new boards. Existing boards retain their data.
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

### Files to update

#### Create flow — remove goal input

**File:** `src/app/(host)/create/gift/page.tsx`

1. Remove the `goalAmount` field from `manualGiftSchema` (line 24): delete `goalAmount: z.coerce.number().int().min(20),`
2. Remove the "Goal amount (R)" label, input, and surrounding `<div>` (lines 194–207)
3. Remove `goalAmount` from `formData.get('goalAmount')` (line 81)
4. Remove `goalAmount` from the `result` parse (line 88)
5. Remove `const goalCents = Math.round(result.data.goalAmount * 100);` (line 100)
6. In the `updateDreamBoardDraft` call (line 102), remove `goalCents` or set it to a default value (e.g., `goalCents: 0`)
7. Remove `resolveDefaultGoal` function (lines 44–45)
8. Remove `defaultGoal` variable (line 133)
9. Update `CardDescription` from `"Describe the dream gift and the goal amount."` to `"Describe the dream gift."`
10. Update `CardTitle` from `"Dream gift"` to `"The dream gift"` (optional, for warmth)

**File:** `src/lib/dream-boards/draft.ts`

Make `goalCents` optional in the draft type. When publishing a draft to a live board, default to `0` if not set.

**File:** `src/lib/dream-boards/schema.ts` (validation)

Update any Zod schemas that require `goalCents` to make it optional with a default of `0`.

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

Also update or remove the check constraint (line 185):
```typescript
validGoal: check('valid_goal', sql`${table.goalCents} >= 2000`),
```
Change to:
```typescript
validGoal: check('valid_goal', sql`${table.goalCents} >= 0`),
```

Generate and run a migration for this change.

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

1. Remove `percentage` from `GuestViewModel` type (line 43) — or keep it but stop computing it from goals. If other components still use it, keep the field but set to `0`.
2. Remove `goalCents` from `GuestViewModel` type (line 47) — it should not be exposed to the guest view at all.
3. Remove `raisedCents` from `GuestViewModel` type (line 46) — same reasoning.
4. Remove `isFunded` logic (line 247: `const isFunded = board.raisedCents >= board.goalCents;`) — replace with `const isFunded = false;` or derive from board status.
5. Remove `funded` from the view model (line 282).
6. Remove `percentage` computation (line 284).
7. Remove the funded-state time remaining message that references goals.

**File:** `src/lib/dream-boards/view-model.ts` — `buildThankYouViewModel`

Remove the `percentage` computation on line 307–310. Set `percentage: 0` or remove the field if nothing consumes it.

#### ProgressBar component — deprecate

**File:** `src/components/dream-board/ProgressBar.tsx`

Do NOT delete this file. It may still be used in the host dashboard for internal progress tracking. Instead:
1. Add a comment at the top: `// DEPRECATED for public Dreamboard display (Phase D). Used only in host dashboard.`
2. Verify whether the host dashboard still needs it:
   - `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx` (line ~165)
   - `src/app/(host)/dashboard/page.tsx` (line ~85)
   - If the host dashboard should also stop showing goal progress, remove those usages too and delete the component. **Decision: keep for host dashboard** — hosts may still want to see how much has been raised internally. But remove any user-facing "goal" language from the host dashboard and replace with neutral "Total raised" language.

#### Host dashboard — adjust financial display

**Files:** `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`, `src/app/(host)/dashboard/page.tsx`

Replace any "Goal: R1 000" or "X% funded" display with:
- "Total raised: R820" (neutral, no goal reference)
- Remove progress bar if present, or keep it as a visual indicator of "money raised" without a max/goal reference

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
grep -rn "goalCents\|ProgressBar\|GoalProgressSection\|percentage.*funded\|isFunded" tests/ --include="*.ts" --include="*.tsx"
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
- Host dashboard shows "Total raised" without goal reference.
- Admin handles `goalCents: 0` gracefully.
- Landing page mock no longer shows a progress percentage.
- `DreamboardStatusBadge` component exists and renders status messages.
- All tests pass.
- Build succeeds.

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
- Run `npm run build` to confirm no TypeScript errors.
- Run `npm run test` to confirm no test regressions.
- Commit with message format: `phase-d/D[X]: [summary]`.

---

## Post-Implementation Verification

After all seven refactors are complete:

1. Run full build: `npm run build`
2. Run full test suite: `npm run test`
3. Verify zero "Dream Board" (two words) in codebase: `grep -rn "Dream Board" src/ docs/`
4. Verify zero `ReturnVisitBanner` references: `grep -rn "ReturnVisitBanner" src/`
5. Verify zero `goalCents` in public-facing components (guest pages): `grep -rn "goalCents" src/app/\(guest\)/`
6. Verify zero `ProgressBar` in guest pages: `grep -rn "ProgressBar" src/app/\(guest\)/`
7. Start dev server and visually inspect:
   - Landing page: logo renders with 🎁 emoji + Nunito font
   - Public Dreamboard: no progress bar, no goal, correct terminology, contributor list format, status badge
   - Create flow: no goal input, party date+time field works
   - Host dashboard: shows "Total raised" not "Goal"
8. Commit final state.

---

## Appendix: Files Inventory

Total files expected to be modified: ~45
Total files expected to be created: 2 (`DreamboardStatusBadge.tsx`, migration file)
Total files expected to be deleted: 1 (`ReturnVisitBanner.tsx`)

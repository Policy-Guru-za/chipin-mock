# Phase C — Milestone C1: Host Creation Flow Restructure

## Context

Phase B is complete: all milestones B0–B9 green, GO decision
signed 2026-02-08, 429 tests passing across 106 files.
Phase C milestone C0 (UX Parity Baseline Capture) is complete
and approved: full route inventory, component dependency map,
risk register, and build sequence confirmed.

Production deploy strategy: Phase B and C deploy together
after Phase C completion. Write-path toggles remain OFF until
Phase C rollout decision.

You are now executing Milestone C1: Host Creation Flow
Restructure — the highest-risk, highest-value milestone in
Phase C. This milestone splits the monolithic `/create/details`
route into three dedicated routes, rewrites the review page as
a celebration experience, and updates the entire create flow
from 4 steps to 6 steps.

---

## Document Reading Order

Read these documents in this exact order before doing anything:

1. `docs/napkin/SKILL.md` (follow its instructions)
2. `docs/napkin/napkin.md` (apply everything silently)
3. `AGENTS.md` (repo conventions and commands)
4. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
   (hard constraints, stop conditions, rollback contract)
5. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
   (locked decisions D-001 through D-010)
6. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
   (your primary phase plan — milestones C0 through C9)
7. `docs/implementation-docs/GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md`
   (route-to-component delta map)
8. `docs/UX/ui-specs/00-DESIGN-SYSTEM.md` (design tokens)
9. `docs/UX/ui-specs/19-SHARED-COMPONENTS.md` (shared patterns
   — pay close attention to CreateFlowShell and
   WizardStepIndicator specs)
10. `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C0-ux-parity-baseline-capture.md`
    (C0 approved delta map and risk register)
11. `src/lib/ux-v2/decision-locks.ts` (typed enum constants —
    use as source of truth, not hardcoded values)
12. `src/lib/ux-v2/write-path-gates.ts` (toggle mechanism)

Then read these UX screen specs — they define the exact target
state for every create flow step:

13. `docs/UX/ui-specs/03-CREATE-STEP-1-THE-CHILD.md`
14. `docs/UX/ui-specs/04-CREATE-STEP-2-THE-GIFT.md`
15. `docs/UX/ui-specs/05-CREATE-STEP-3-THE-DATES.md`
16. `docs/UX/ui-specs/06-CREATE-STEP-4-GIVING-BACK.md`
17. `docs/UX/ui-specs/07-CREATE-STEP-5-PAYOUT-SETUP.md`
18. `docs/UX/ui-specs/08-CREATE-CONFIRMATION.md`

Finally, read the current source code you will be modifying:

19. `src/lib/host/create-view-model.ts` (current 4-step ViewModel)
20. `src/components/layout/CreateFlowShell.tsx` (current shell)
21. `src/app/(host)/create/child/page.tsx` (Step 1)
22. `src/app/(host)/create/gift/page.tsx` (Step 2)
23. `src/app/(host)/create/details/page.tsx` (monolithic Step 3
    — this is the file being split)
24. `src/app/(host)/create/review/page.tsx` (current Step 4)
25. `src/lib/dream-boards/draft.ts` (draft persistence)
26. `src/lib/dream-boards/schema.ts` (final draft validation)
27. `src/lib/dream-boards/validation.ts` (date/phone/bank rules)
28. `src/lib/utils/encryption.ts` (AES-256-GCM)
29. `src/lib/integrations/karri.ts` (Karri card verification)
30. `tests/unit/host-create-view-model.test.ts` (existing tests)

---

## C1 Scope Definition

**Current state (4 steps):**

```
/create         → auth gateway redirect
/create/child   → Step 1: child name, photo, age
/create/gift    → Step 2: gift name, description, artwork, goal
/create/details → Step 3: dates + charity + payout (MONOLITHIC, ~673 lines)
/create/review  → Step 4: simple form review + create action
```

**Target state (6 steps):**

```
/create              → auth gateway redirect (keep)
/create/child        → Step 1 of 6: child (modify — update indicator)
/create/gift         → Step 2 of 6: gift (modify — update indicator + redirect target)
/create/dates        → Step 3 of 6: dates (NEW — extracted from details)
/create/giving-back  → Step 4 of 6: charity (NEW — extracted from details)
/create/payout       → Step 5 of 6: payout (NEW — extracted from details)
/create/details      → REDIRECT to /create/dates (preserve bookmarks)
/create/review       → Step 6 of 6: celebration + publish (REWRITE)
```

**What is NOT in C1 scope:**
- No database schema changes
- No API endpoint changes
- No new backend services
- No changes to the draft KV persistence layer (the
  `DreamBoardDraft` type and `updateDreamBoardDraft` function
  remain unchanged — each new step writes its subset of fields
  to the same draft via merge)
- CVV and expiry date fields mentioned in the payout UX spec
  are NOT implemented in C1 — the backend Karri verification
  API does not accept these fields. Log this as a spec gap in
  the C1 evidence file.

---

## Build Sequence

Execute these sub-steps in order. Run `pnpm lint && pnpm typecheck`
after each sub-step to catch regressions early. Run the full
gate suite (`pnpm lint && pnpm typecheck && pnpm test`) after
completing all sub-steps and again after writing tests.

### Sub-step 1: Update the ViewModel

**File:** `src/lib/host/create-view-model.ts`

Expand from 4 steps to 6 steps:

```typescript
export type CreateFlowStep =
  | 'child'
  | 'gift'
  | 'dates'
  | 'giving-back'
  | 'payout'
  | 'review';
```

Update step labels to "Step N of 6" format.

Update titles per UX specs:
- child: "Who's the birthday star?"
- gift: "What's {childName}'s dream gift?"
- dates: "When's the big day?"
- giving-back: "Want to share the love? 💚"
  (subtitle: "Help a cause while celebrating {childName}.")
- payout: "How should we send your payout?"
- review: "Review your Dream Board"

Add completion validators:

```
isDatesComplete(draft):
  → birthdayDate AND partyDate AND campaignEndDate all present

isGivingBackComplete(draft):
  → charityEnabled === false (user chose no charity, step is
    complete)
  OR (charityEnabled === true AND charityId AND charitySplitType
    AND (charityPercentageBps OR charityThresholdCents) present)
  IF charityEnabled is undefined/null → step NOT complete
    (user hasn't visited yet)

isPayoutComplete(draft):
  → payoutEmail AND hostWhatsAppNumber present
  AND if payoutMethod === 'karri_card':
    karriCardNumberEncrypted AND karriCardHolderName present
  AND if payoutMethod === 'bank':
    bankName AND bankAccountNumberEncrypted AND bankAccountLast4
    AND bankBranchCode AND bankAccountHolder present
```

Update redirect rules (prerequisite chain):

```
child:        no prerequisites
gift:         requires isChildComplete
dates:        requires isGiftComplete
giving-back:  requires isDatesComplete
payout:       requires isGivingBackComplete
review:       requires isPayoutComplete
```

Remove the old `isDetailsComplete` function. Remove the
`'details'` step from the type.

### Sub-step 2: Update CreateFlowShell + Add WizardStepIndicator

**File:** `src/components/layout/CreateFlowShell.tsx`

Update the component to accept and render a visual step
indicator per the spec in `19-SHARED-COMPONENTS.md`:

Update props:

```typescript
type CreateFlowShellProps = {
  currentStep: number;     // 1-6
  totalSteps: number;      // 6
  stepLabel: string;       // "Step 1 of 6 — The Child"
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};
```

Add a `WizardStepIndicator` component (can be inline in
CreateFlowShell or a separate file in `src/components/ui/`):

- Desktop: Horizontal row of numbered circles connected by
  lines. Current step: filled primary with ring. Completed:
  filled with checkmark. Upcoming: hollow border-default.
- Mobile (< 640px): Progress bar showing percentage
  (currentStep / totalSteps × 100%).
- Use design system tokens: primary color (#0D9488), border
  colors, font sizes from 00-DESIGN-SYSTEM.md.
- Apply `aria-label="Step {n} of {total}"` and
  `aria-current="step"` on the current step for accessibility.

Update all 6 create flow pages to pass the new props (this
happens naturally as you build each step below).

### Sub-step 3: Create `/create/dates` (Step 3 of 6)

**New file:** `src/app/(host)/create/dates/page.tsx`

**Reference spec:** `05-CREATE-STEP-3-THE-DATES.md`

Extract date handling from the current `/create/details/page.tsx`.

**Server component (page):**
- Call `requireHostAuth()`
- Load draft via `getDreamBoardDraft(hostId)`
- Build ViewModel for step 'dates'; if `redirectTo` is set,
  redirect
- Render `CreateFlowShell` with currentStep=3, totalSteps=6,
  stepLabel="Step 3 of 6 — The Dates"
- Pass draft date values as defaults to the form

**Zod schema (define at top of file or in a shared location):**

```typescript
const datesSchema = z.object({
  birthdayDate: z.string().min(1, 'Birthday date is required'),
  partyDateEnabled: z.boolean().optional().default(false),
  partyDate: z.string().optional(),
  campaignEndDate: z.string().optional(),
}).superRefine((data, ctx) => {
  // If partyDateEnabled is false, default partyDate and
  // campaignEndDate to birthdayDate
  // Validate using existing helpers from validation.ts:
  //   isBirthdayDateValid, isPartyDateWithinRange,
  //   isCampaignEndDateValid
});
```

**Server action: `saveDatesAction`**
1. Authenticate + load draft
2. Parse and validate schema
3. Validate dates using existing helpers from
   `src/lib/dream-boards/validation.ts`
4. If partyDateEnabled is false, set partyDate and
   campaignEndDate equal to birthdayDate
5. Save to draft: `{ birthdayDate, partyDate, campaignEndDate }`
6. Redirect to `/create/giving-back`
7. Error codes: `invalid`, `birthday_date`, `party_date`,
   `campaign_end`, `birthday_order`

**Form UI:**
- Birthday date picker (required) — see spec for format rules
- "Party is on a different day" checkbox — reveals
  conditional party date + campaign end date fields
- Campaign duration display (read-only, calculated)
- Pre-populate from draft values

### Sub-step 4: Create `/create/giving-back` (Step 4 of 6)

**New file:** `src/app/(host)/create/giving-back/page.tsx`

**Reference spec:** `06-CREATE-STEP-4-GIVING-BACK.md`

Extract charity handling from the current `/create/details/page.tsx`.

**Server component (page):**
- Call `requireHostAuth()`
- Load draft via `getDreamBoardDraft(hostId)`
- Build ViewModel for step 'giving-back'; if `redirectTo`,
  redirect
- Fetch active charities from the database. Search for
  Phase B charity query functions — try these locations:
  `src/lib/db/queries.ts`, `src/lib/charities/`,
  `src/lib/db/api-queries.ts`. Look for `getActiveCharities`,
  `listCharities`, or similar. If no such function exists,
  query the `charities` table directly via Drizzle:
  `db.select().from(charities).where(eq(charities.isActive, true))`.
  The charity record shape should include at minimum:
  `{ id, name, description, category, logoUrl, isActive }`.
  The UX spec lists 6 example charities — these are
  illustrative. Render whatever charities exist in the
  database. If the charities table is empty or does not exist,
  log this as a blocker in the evidence file and stop.
- Render `CreateFlowShell` with currentStep=4, totalSteps=6
- Pass charities and draft values to a client component

**Client component: `GivingBackForm`**

Mark this as `'use client'`. This component needs client-side
interactivity for the toggle, charity selection, split type
switching, and split preview calculation.

Props:
```typescript
{
  charities: Array<{ id: string; name: string; description: string;
    category: string; logoUrl: string | null }>;
  defaultCharityEnabled?: boolean;
  defaultCharityId?: string;
  defaultSplitType?: 'percentage' | 'threshold';
  defaultPercentage?: number;    // 5-50 (UI value, not bps)
  defaultThresholdAmount?: number; // Rand value, not cents
  goalCents: number;             // for split preview calc
  childName?: string;            // for preview copy
}
```

UI elements:
- Toggle switch: "Share a portion with charity" (default OFF)
- When ON, reveal charity card grid (use accessible card-radio
  pattern from spec)
- Split type radio: "Percentage of goal" (default) vs
  "Fixed amount"
- Percentage: slider 5%–50%, step 1%, default 25%
- Fixed amount: currency input R50–R500
- Split preview: "Out of your R{goal} goal: R{charity} goes
  to {charityName}, R{gift} goes to {childName}'s gift"
  — update in real-time with `aria-live="polite"`

**Zod schema:**

```typescript
const givingBackSchema = z.object({
  charityEnabled: z.boolean(),
  charityId: z.string().uuid().optional(),
  charitySplitType: z.enum(['percentage', 'threshold']).optional(),
  charityPercentage: z.coerce.number().int().min(5).max(50).optional(),
  charityThresholdAmount: z.coerce.number().int().min(50).max(500).optional(),
}).superRefine((data, ctx) => {
  if (!data.charityEnabled) return; // all optional when disabled
  if (!data.charityId) ctx.addIssue({ code: 'custom',
    message: 'Please select a charity', path: ['charityId'] });
  if (!data.charitySplitType) ctx.addIssue({ code: 'custom',
    message: 'Please select how to split', path: ['charitySplitType'] });
  if (data.charitySplitType === 'percentage' && !data.charityPercentage)
    ctx.addIssue({ code: 'custom', path: ['charityPercentage'],
      message: 'Set a percentage between 5% and 50%' });
  if (data.charitySplitType === 'threshold' && !data.charityThresholdAmount)
    ctx.addIssue({ code: 'custom', path: ['charityThresholdAmount'],
      message: 'Set an amount between R50 and R500' });
});
```

**IMPORTANT — charitySplitType enum values:** The UX spec
labels the options "Percentage of goal" and "Fixed amount"
in the UI. However, per Decision Register D-003 (LOCKED),
the underlying enum values are `'percentage'` and
`'threshold'` — NOT `'fixed_amount'`. The UX spec's
`'fixed_amount'` label is a display label only. Always use
the enum values from `src/lib/ux-v2/decision-locks.ts` as
the source of truth. Map as follows:
- UI label "Percentage of goal" → enum `'percentage'`
- UI label "Fixed amount" → enum `'threshold'`

**Server action: `saveGivingBackAction`**
1. Authenticate + load draft
2. Parse schema
3. If charityEnabled is false: save
   `{ charityEnabled: false, charityId: null, charitySplitType: null, charityPercentageBps: null, charityThresholdCents: null }`
4. If charityEnabled is true: convert percentage to basis
   points (× 100) and threshold amount to cents (× 100),
   then save `{ charityEnabled: true, charityId, charitySplitType, charityPercentageBps, charityThresholdCents }`
5. Redirect to `/create/payout`
6. Error codes: `invalid`, `charity_required`,
   `split_required`, `percentage_range`, `threshold_range`

### Sub-step 5: Create `/create/payout` (Step 5 of 6)

**New file:** `src/app/(host)/create/payout/page.tsx`

**Reference spec:** `07-CREATE-STEP-5-PAYOUT-SETUP.md`

Extract payout handling from the current `/create/details/page.tsx`.
This is the most sensitive step — it handles encryption and
external API calls. Preserve the exact patterns from the
current `saveDetailsAction` for encryption and Karri verification.

**Server component (page):**
- Call `requireHostAuth()`
- Load draft + build ViewModel for 'payout'; redirect if needed
- Render `CreateFlowShell` with currentStep=5, totalSteps=6
- Pass draft payout values as defaults to a client component

**Client component: `PayoutForm`**

Mark as `'use client'`. Needs interactivity for conditional
field display based on payout method selection.

Props:
```typescript
{
  defaultPayoutMethod?: 'karri_card' | 'bank';
  defaultEmail?: string;
  defaultWhatsApp?: string;
  defaultKarriCardHolderName?: string;
  defaultBankName?: string;
  defaultBankBranchCode?: string;
  defaultBankAccountHolder?: string;
  defaultBankAccountLast4?: string; // for masked display
}
```

UI elements:
- Payout method card radio: Karri Card (with "RECOMMENDED"
  badge) vs Bank Transfer
- Karri fields (conditional): Card Number (formatted
  XXXX XXXX XXXX XXXX), Card Holder Name
- Bank fields (conditional): Bank Name (dropdown of SA banks),
  Account Number, Branch Code (6 digits), Account Holder Name
- Common fields: Payout Email, WhatsApp Number (SA format)
- Use the enum values from `decision-locks.ts` for payout
  method, not hardcoded strings

**Important:** Do NOT add CVV or expiry date fields. The
current Karri verification API does not accept them and the
database schema does not store them. This is a known spec gap
— log it in C1 evidence.

**Zod schema:**

```typescript
const payoutSchema = z.object({
  payoutEmail: z.string().email(),
  payoutMethod: z.enum(['karri_card', 'bank']),
  hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX),
  karriCardNumber: z.string().optional(),
  karriCardHolderName: z.string().min(2).max(100).optional(),
  bankName: z.string().min(2).max(120).optional(),
  bankAccountNumber: z.string().optional(),
  bankBranchCode: z.string().min(2).max(20).optional(),
  bankAccountHolder: z.string().min(2).max(120).optional(),
}).superRefine((data, ctx) => {
  // Conditional: if karri_card, require card number + holder
  // Conditional: if bank, require all bank fields
  // Use isBankAccountNumberValid() from validation.ts
});
```

**Server action: `savePayoutAction`**
1. Authenticate + load draft
2. Parse schema
3. Validate WhatsApp with `SA_MOBILE_REGEX`
4. If karri_card:
   - Extract raw card number (strip non-digits)
   - Encrypt via `encryptSensitiveValue()` from
     `src/lib/utils/encryption.ts`
   - If `KARRI_AUTOMATION_ENABLED === 'true'`, call
     `verifyKarriCard()` from `src/lib/integrations/karri.ts`
   - Save: `{ payoutMethod: 'karri_card', payoutEmail,
     hostWhatsAppNumber, karriCardNumberEncrypted,
     karriCardHolderName }`
   - Clear bank fields in draft: `{ bankName: null,
     bankAccountNumberEncrypted: null, bankAccountLast4: null,
     bankBranchCode: null, bankAccountHolder: null }`
5. If bank:
   - Validate account number with `isBankAccountNumberValid()`
   - Encrypt account number
   - Extract last 4 digits
   - Save: `{ payoutMethod: 'bank', payoutEmail,
     hostWhatsAppNumber, bankName,
     bankAccountNumberEncrypted, bankAccountLast4,
     bankBranchCode, bankAccountHolder }`
   - Clear karri fields: `{ karriCardNumberEncrypted: null,
     karriCardHolderName: null }`
6. Redirect to `/create/review`
7. Error codes: `invalid`, `whatsapp`, `karri`,
   `karri_invalid`, `karri_unavailable`, `bank`,
   `bank_account`, `secure`

Preserve the exact error handling and Sentry logging patterns
from the current `saveDetailsAction` in
`src/app/(host)/create/details/page.tsx`.

### Sub-step 6: Replace `/create/details` with Redirect

**File:** `src/app/(host)/create/details/page.tsx`

Replace the entire file content with a permanent redirect:

```typescript
import { redirect } from 'next/navigation';

export default function DetailsRedirect() {
  redirect('/create/dates');
}
```

This preserves any existing bookmarks or links.

### Sub-step 7: Update Existing Steps

**File: `src/app/(host)/create/child/page.tsx`**
- Update CreateFlowShell props: currentStep=1, totalSteps=6,
  stepLabel="Step 1 of 6 — The Child"

**File: `src/app/(host)/create/gift/page.tsx`**
- Update CreateFlowShell props: currentStep=2, totalSteps=6,
  stepLabel="Step 2 of 6 — The Gift"
- Change the success redirect in `saveManualGiftAction` from
  `/create/details` to `/create/dates`

### Sub-step 8: Rewrite `/create/review` as Celebration Page

**File:** `src/app/(host)/create/review/page.tsx`

**Reference spec:** `08-CREATE-CONFIRMATION.md`

This is a complete rewrite. The current simple review form
becomes a two-state celebration experience.

**Server component (page):**
- Call `requireHostAuth()`
- Load draft + build ViewModel for 'review'; redirect if
  `redirectTo` is set
- Validate all steps complete by checking the ViewModel
- Render `ReviewClient` client component with full draft data

**Client component: `ReviewClient`**

Mark as `'use client'`. This component manages two states:

**State 1 — Pre-publish (initial load):**
- Dream board preview card showing all captured data:
  child photo (circular, 120px mobile / 150px desktop),
  "{childName} turns {age}!", birthday date, gift name + image
  + goal amount, campaign close date, payout method summary,
  charity summary (if enabled)
- "Edit" links for each section back to the relevant step.
  Exact routing:
  - Child section (name, photo, age) → `/create/child`
  - Gift section (name, image, goal) → `/create/gift`
  - Dates section (birthday, party, campaign) → `/create/dates`
  - Charity section (if enabled) → `/create/giving-back`
  - Payout section (method, contact) → `/create/payout`
- Prominent "Publish Dream Board" button (primary, full-width
  on mobile)
- CreateFlowShell with currentStep=6, totalSteps=6

Use `useActionState` (React 19) or `useState` + manual
action invocation to manage the pre-publish → post-publish
transition. The state machine is:
```
'preview' → (user clicks Publish) → 'publishing' → (action succeeds) → 'published'
                                                  → (action fails) → 'preview' + error toast
```

**State 2 — Post-publish (after successful action):**
- Full-page celebration layout (NOT inside CreateFlowShell)
- Confetti animation (3-5 seconds, 50-100 particles, primary
  teal + accent orange + white, `aria-hidden="true"`,
  disabled for `prefers-reduced-motion`). Use a lightweight
  confetti library (e.g., `canvas-confetti`) or a CSS/canvas
  implementation — keep dependencies minimal.
- Celebration heading: "🎉 {childName}'s Dreamboard is ready!"
  (Fraunces font, text-4xl, fade-up animation)
- Dream board preview card (same as pre-publish but read-only,
  no edit links)
- Share link display: `https://gifta.co/{slug}` with copy
  button ("Copy" → "Copied! ✓" for 2 seconds)
- 4 share buttons in a 2×2 grid (mobile) / 4-column
  (desktop):
  1. WhatsApp (primary green) — open wa.me with pre-filled
     message per spec
  2. Email (secondary) — open mailto with subject + body
  3. Copy Link (outlined) — same copy-to-clipboard
  4. Go to Dashboard (secondary) — link to /dashboard
- Optional footer: "← Back to dashboard" subtle link

**Server action: `publishDreamBoardAction`**

Preserve the core logic from the current `createDreamBoardAction`
in the existing review page:
1. Load and validate draft against `dreamBoardDraftSchema`
   from `src/lib/dream-boards/schema.ts`
2. Generate slug via `generateSlug()`
3. Insert into `dreamBoards` table (same field mapping)
4. Send WhatsApp notification via `sendDreamBoardLink()`
5. Clear draft via `clearDreamBoardDraft()`
6. **Instead of redirecting**, return the created board data:
   `{ success: true, boardId, slug, shareUrl }` — the client
   component uses this to transition to State 2.

Use `useActionState` or `useState` + manual action invocation
to manage the pre-publish → post-publish transition without a
page redirect.

---

## Test Requirements

Write full test coverage for all new and modified code. Follow
existing patterns from `tests/unit/host-create-view-model.test.ts`
and `tests/integration/api-dream-boards-list-create.test.ts`.

Use Vitest. Use `vi.mock()` / `vi.doMock()` + `vi.resetModules()`
for mocking. Use factory functions with override patterns for
test data. Restore environment variables in `afterEach`.

### Unit Tests

**File: `tests/unit/host-create-view-model.test.ts` (UPDATE)**

Update all existing tests to reflect 6-step model. Add:
- Step label format: "Step N of 6 — {StepName}" for each step
- Redirect rules: gift requires child, dates requires gift,
  giving-back requires dates, payout requires giving-back,
  review requires payout
- `isDatesComplete`: present ↔ true, any field missing ↔ false
- `isGivingBackComplete`: charityEnabled=false ↔ true,
  charityEnabled=true with all fields ↔ true,
  charityEnabled=true missing fields ↔ false,
  charityEnabled=undefined ↔ false (not visited)
- `isPayoutComplete`: karri with all fields ↔ true, bank
  with all fields ↔ true, missing email ↔ false,
  missing method-specific fields ↔ false
- Step skip prevention: navigating to payout with incomplete
  giving-back → redirectTo giving-back

**File: `tests/unit/create-step-dates.test.ts` (NEW)**

Test `saveDatesAction` (or extracted validation logic):
- Valid dates → saves to draft, returns redirect to giving-back
- Birthday in past → birthday_date error
- Party date > 6 months out → party_date error
- Campaign end before party → campaign_end error
- Party date before birthday → birthday_order error
- partyDateEnabled=false → partyDate and campaignEndDate
  default to birthdayDate
- Schema validation failure → invalid error

Mock: `requireHostAuth`, `getDreamBoardDraft`,
`updateDreamBoardDraft`, `redirect` (from next/navigation).

**File: `tests/unit/create-step-giving-back.test.ts` (NEW)**

Test `saveGivingBackAction`:
- charityEnabled=false → saves disabled state, redirects to
  payout. Verify null charity fields in draft.
- charityEnabled=true + percentage → converts to bps, saves,
  redirects
- charityEnabled=true + threshold → converts to cents, saves,
  redirects
- charityEnabled=true + no charity selected → charity_required
- charityEnabled=true + no split type → split_required
- Percentage out of range (4% or 51%) → percentage_range
- Threshold out of range (R49 or R501) → threshold_range

Mock: `requireHostAuth`, `getDreamBoardDraft`,
`updateDreamBoardDraft`, `redirect`.

**File: `tests/unit/create-step-payout.test.ts` (NEW)**

Test `savePayoutAction`:
- Karri card → encrypts card number, saves to draft, redirects
  to review. Verify bank fields cleared to null.
- Bank → encrypts account, extracts last4, saves to draft,
  redirects. Verify karri fields cleared to null.
- Karri verification failure → karri_invalid error
- Karri API timeout → karri_unavailable error
- Invalid bank account format → bank_account error
- Missing email → invalid error
- Invalid WhatsApp (not SA format) → whatsapp error
- Encryption not configured → secure error

Mock: `requireHostAuth`, `getDreamBoardDraft`,
`updateDreamBoardDraft`, `redirect`, `encryptSensitiveValue`,
`verifyKarriCard`.

### Integration Tests

**File: `tests/integration/create-flow-steps.test.ts` (NEW)**

Test end-to-end draft state transitions across the 6-step flow:

- Full happy path (Karri, no charity): Simulate saving each
  step in sequence (child → gift → dates → giving-back(off) →
  payout(karri)). After each step, verify draft contains the
  expected cumulative fields. Verify ViewModel reports correct
  redirectTo at each point.
- Full happy path (Bank + charity percentage): Same flow but
  with charityEnabled=true and payoutMethod='bank'. Verify
  charity bps conversion and bank encryption in draft.
- Full happy path (Bank + charity threshold): Verify threshold
  cents conversion.
- Step skip prevention: Attempt to save payout before
  giving-back → verify ViewModel redirects to giving-back.
  Attempt to reach review before payout → redirects to payout.
- Draft persistence and recovery: Save child + gift, then
  reload dates page — verify draft values survive and
  pre-populate. Simulate browser back to gift after saving
  dates — verify dates remain in draft.
- Giving-back toggle: Save with charity on, then re-save
  with charity off — verify charity fields are nulled out.

Mock KV store for draft persistence. Use the same mock
patterns as `tests/unit/dream-board-cache.test.ts`.

---

## Gate Commands

Run after all code and tests are written:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

All three must pass with zero errors. The existing 429 tests
must continue passing alongside your new tests.

If lint or typecheck fails, fix the issues before proceeding.
If existing tests break, it means your refactoring introduced
a regression — fix it.

---

## C1 Acceptance Criteria

**P0 (blocks merge):**
- [ ] 6-step create flow compiles and routes correctly
- [ ] Step sequencing enforced: no step can be reached without
      completing its prerequisites
- [ ] Draft data integrity: every field saved by the old
      monolithic details page is saved by the new split steps
      with identical semantics
- [ ] Encryption: card and bank account numbers encrypted
      with same AES-256-GCM pattern
- [ ] Karri verification: called when enabled, errors handled
- [ ] Final publish action: creates dream board in database
      with correct field mapping (identical to current)
- [ ] No regressions: all pre-existing 429 tests pass
- [ ] New unit tests pass for dates, giving-back, payout
      server actions
- [ ] New integration tests pass for flow state transitions

**P1 (blocks rollout):**
- [ ] WizardStepIndicator renders correctly with 6 steps,
      shows progress, checkmarks on completed steps
- [ ] Celebration/publish page shows confetti, preview,
      share buttons per spec
- [ ] Copy matches UX specs (titles, labels, error messages,
      placeholder text)
- [ ] Responsive layout: mobile single-column, desktop
      multi-column per spec
- [ ] Client-side interactivity: charity toggle, split
      preview, payout method switching all work
- [ ] Charity cards rendered from database data, not hardcoded
- [ ] Share buttons functional (WhatsApp link, mailto, copy)

---

## Evidence

Write C1 evidence to:
```
docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C1-host-create-flow-restructure.md
```

Include:
1. Summary of what was implemented
2. Files created and modified (with paths)
3. Gate results (lint, typecheck, test — paste exact output)
4. Test coverage: list new test files and test counts
5. Spec gaps identified (CVV/expiry, any others found)
6. Any P2 items deferred
7. Screenshot or description of the 6-step flow working

Update `docs/napkin/napkin.md` with any corrections or
learnings discovered during C1 execution.

---

## Stop Conditions

Stop and report immediately if:
- Money-movement semantics change (fee, raised, funded
  calculations must not be altered)
- Encryption behavior differs from current implementation
- `dreamBoardDraftSchema` in `src/lib/dream-boards/schema.ts`
  needs modification (it should not — the draft shape is
  unchanged)
- More than 3 existing tests break simultaneously (indicates
  a fundamental regression, not incremental breakage)
- Any hard stop condition from the Agent Execution Contract

---

**Do not proceed to C2 until C1 evidence is written and the
gate suite passes clean.**

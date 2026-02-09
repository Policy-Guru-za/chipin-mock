# C6 — Comms and Content Alignment

## Objective

Align all user-visible UI copy, email templates, branding strings,
error messages, and product terminology to the canonical copy matrix.
Remove every legacy "ChipIn" reference from active UX surfaces, fix
all "Dreamboard" → "Dream Board" casing violations, and close the
gap between the copy matrix definitions and the implemented strings.

---

## Context & Constraints

- Read these docs in order **before coding**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md`
     (**authoritative source** for all user-facing text)
  4. `docs/napkin/napkin.md` (all learnings)
- Gate commands: `pnpm lint && pnpm typecheck && pnpm test`
- All gates **must pass** before marking C6 complete.
- Do NOT proceed to C7.
- Do NOT modify Phase B backend APIs (partner/public API routes
  under `src/app/api/v1/`), DB schema, migration files, or
  webhook handlers.
- Do NOT change fee calculation logic (`src/lib/payments/fees.ts`).
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF**.
- **Scope boundary:** C6 is copy-only. Do NOT refactor component
  structure, change layouts, add features, or modify business
  logic. Every change must be a string replacement or a constant
  update. If a code change is needed beyond string replacement
  (e.g., changing a `<Link>` href), document it and skip.
- **API contract strings are out of scope.** Do NOT change:
  - Webhook event names (`dreamboard.created`, `dreamboard.updated`)
  - API scope strings (`dreamboards:read`, `dreamboards:write`)
  - OpenAPI spec enum values
  - Database column names or enum values
  - Webhook header names (`X-ChipIn-Signature`, `X-ChipIn-Event-Id`)
  - URL slugs and route segments
  These are developer-facing contracts, not user-visible copy.
- **Seed data is out of scope.** Do NOT change `src/lib/db/seed.ts`.
- **Observability service names are out of scope.** Do NOT change
  `getServiceName()` in `src/lib/observability/otel.ts`.

---

## Copy Matrix Reference

### Brand Rules
- Brand name: `Gifta` (NOT `ChipIn`)
- Tone: warm, celebratory, clear, non-technical

### Global Terminology
| Term | Canonical | Wrong variants to find/fix |
|------|-----------|---------------------------|
| Dream Board | `Dream Board` (two words, both capitalised) | `Dreamboard`, `dreamboard`, `dream board` (lowercase) |
| Contribution verb | `chip in` (lowercase) | `contribute`, `donation`, `donate` when user-facing |
| Giving Back | `Gift That Gives Twice` | `giving back` in user-facing labels |
| Host/Parent | `Parent` in user-facing copy | `Host` in user-facing labels |

### Host Create Flow
| Location | Canonical copy |
|----------|---------------|
| Step intro | `"Who's the birthday star?"` |
| Gift step intro | `"What's the dream gift?"` (or `"What's {childName}'s dream gift?"`) |
| Giving back toggle | `"Enable giving back (optional)"` |
| Payout method label | `"How should we send your payout?"` |
| Review CTA | `"Create Dream Board"` |

### Public Dream Board
| Location | Canonical copy |
|----------|---------------|
| Hero title | `"Help make this gift happen"` |
| Progress text | `"{percentage}% funded"` |
| Closed state | `"This Dream Board is closed to new contributions."` |
| Funded banner | `"Goal reached! Extra contributions still help."` |

### Contribution Flow
| Location | Canonical copy |
|----------|---------------|
| CTA | `"Continue to payment"` |
| Name field | `"Your name (optional)"` |
| Message field | `"Message (optional)"` |
| Reminder prompt | `"Remind me later"` |
| Reminder confirmation | `"We'll send one reminder before this Dream Board closes."` |

### Host Dashboard
| Location | Canonical copy |
|----------|---------------|
| Title | `"Your Dream Boards"` |
| Empty state | `"You haven't created a Dream Board yet."` |
| Payout section | `"Payout details"` |
| Post-campaign | `"Campaign complete"` |

### Admin Copy
| Location | Canonical copy |
|----------|---------------|
| Queue title | `"Payout queue"` |
| Charity section | `"Charity management"` |
| Reports section | `"Financial reports"` |

### Error Copy Rules
- State what failed
- State what user can do next
- Avoid internal jargon (no "browser storage", "database",
  "server", "API", "null", "timeout")

### Email Subject Lines
| Template | Subject |
|----------|---------|
| Parent new contribution | `"🎉 New contribution for [Child]!"` |
| Parent campaign complete | `"🎉 [Child]'s Dream Board is complete"` |
| Contributor confirmation | `"💝 Thanks for chipping in for [Child]!"` |
| Contributor reminder | `"🔔 Reminder: chip in for [Child]'s gift"` |

---

## Current State (audit findings)

### Critical — Legacy "ChipIn" brand in user-visible locations

| File | Line(s) | Current string | Fix |
|------|---------|----------------|-----|
| `src/components/layout/Header.tsx` | 34 | `ChipIn` (logo text) | → `Gifta` |
| `src/components/layout/Footer.tsx` | 5 | `ChipIn` (brand) | → `Gifta` |
| `src/components/layout/Footer.tsx` | 7 | `© ... ChipIn. All rights reserved.` | → `© ... Gifta. All rights reserved.` |
| `src/lib/constants.ts` | 1 | `APP_NAME = 'ChipIn'` | → `APP_NAME = 'Gifta'` |
| `src/lib/integrations/email.ts` | 3 | `'noreply@chipin.co.za'` fallback | → `'noreply@gifta.co.za'` |
| `src/lib/integrations/email.ts` | 4 | `'ChipIn'` from-name fallback | → `'Gifta'` |
| `src/lib/payments/reconciliation-job.ts` | 355 | `'ChipIn reconciliation mismatches'` | → `'Gifta reconciliation mismatches'` |
| `src/lib/integrations/karri-batch.ts` | 123 | `'ChipIn Dream Board credit'` | → `'Gifta Dream Board credit'` |
| `src/lib/retention/retention.ts` | 13 | `'anonymized@chipin.co.za'` | → `'anonymized@gifta.co.za'` |
| `src/lib/api/openapi.ts` | 18 | `'https://api.chipin.co.za/v1'` | → `'https://api.gifta.co.za/v1'` |
| `src/lib/analytics/metrics.ts` | 2 | `ChipIn business KPIs` (comment) | → `Gifta business KPIs` |
| `src/app/layout.tsx` | 46 | `'Gifta - Everyone Chips In...'` | → `'Gifta — One Dream Gift, Together.'` (or approved tagline) |

### Critical — "Dreamboard" casing violations

Every `Dreamboard` or `dreamboard` in a **user-visible string**
must become `Dream Board`. Leave API scope strings, webhook event
names, and code variable names unchanged.

| File | Line(s) | Context |
|------|---------|---------|
| `src/app/(guest)/[slug]/page.tsx` | 63 | `{childName}'s Dreamboard` (heading) |
| `src/app/(guest)/[slug]/page.tsx` | 133 | `This is your Dreamboard` (host hint) |
| `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx` | 195 | `Contributing ... to {childName}'s Dreamboard` |
| `src/app/(guest)/[slug]/contribute/payment/page.tsx` | 32 | metadata description `...Dreamboard` |
| `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx` | 57 | `This Dreamboard has closed.` |
| `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx` | 80 | `Back to {childName}'s Dreamboard ←` |
| `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` | 48 | share title `{childName}'s Dreamboard` |
| `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` | 169 | `📤 Share This Dreamboard` |
| `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` | 181 | `← Back to Dreamboard` |
| `src/app/(host)/create/review/ReviewClient.tsx` | 186 | `{childName}'s Dreamboard is ready!` |
| `src/components/dream-board/ReturnVisitBanner.tsx` | 64 | share title `{childName}'s Dreamboard` |
| `src/components/dream-board/ReturnVisitBanner.tsx` | 90 | `Share this Dreamboard` |
| `src/components/dream-board/ReturnVisitBanner.tsx` | 103 | `This Dreamboard has closed` |
| `src/components/landing/LandingDreamBoard.tsx` | 43 | `Mia's Dreamboard` |
| `src/components/landing/LandingCTA.tsx` | 10 | `Create Your Free Dreamboard` |
| `src/components/landing/LandingPage.tsx` | 68 | `Create Your Free Dreamboard` |
| `src/components/landing/content.ts` | 57 | `Create a Dreamboard` |
| `src/components/landing/content.ts` | 63 | `Share your Dreamboard` |
| `src/components/landing/LandingNav.tsx` | 105 | `Create a Free Dreamboard` |
| `src/components/landing/LandingNav.tsx` | 137 | `Create a Free Dreamboard` |
| `src/lib/dream-boards/view-model.ts` | 159 | `This Dreamboard has closed...` |
| `src/app/layout.tsx` | 48, 54, 67 | `Create a Dreamboard for your child's birthday...` (meta) |

### High — Copy matrix mismatches

| File | Current | Matrix target |
|------|---------|---------------|
| `src/app/(host)/create/giving-back/GivingBackForm.tsx:77` | `"Share a portion with charity"` | `"Enable giving back (optional)"` |
| `src/app/(host)/create/review/ReviewClient.tsx:262` | `"Publish Dream Board"` | `"Create Dream Board"` |
| `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:183` | `"Your name (as it will appear)"` | `"Your name (optional)"` |
| `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:218` | `"Add a birthday message 🎂"` | `"Message (optional)"` |
| `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:260` | `"Remind me in 3 days 🔔"` | `"Remind me later"` |
| `src/components/contribute/ReminderModal.tsx:120` | `"We'll send you a reminder in 3 days so you can check on the progress."` | `"We'll send one reminder before this Dream Board closes."` |
| `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx:124` | `"Charity Donation"` | `"Charity contribution"` |
| `src/lib/dream-boards/view-model.ts:159` | `"This Dreamboard has closed. Thank you for..."` | `"This Dream Board is closed to new contributions."` |
| `src/app/(guest)/[slug]/page.tsx:123` | `"Goal reached! Extra contributions still help cover the dream gift."` | `"Goal reached! Extra contributions still help."` |

### Medium — Reminder email template terminology

| File | Current | Matrix target |
|------|---------|---------------|
| `src/lib/reminders/templates.ts:78` | `subject: 'Reminder: contribute to {childName}'s {giftName}'` | `"🔔 Reminder: chip in for {childName}'s gift"` |
| `src/lib/reminders/templates.ts:83` | `"Please contribute before..."` | `"Please chip in before..."` |
| `src/lib/reminders/templates.ts:84` | `"Contribute now"` link text | `"Chip in now"` |

### Medium — View model / metadata strings

| File | Current | Fix |
|------|---------|-----|
| `src/lib/dream-boards/view-model.ts:105` | `"Contribute to {childName}'s dream gift"` | → `"Chip in for {childName}'s dream gift"` |
| `src/lib/dream-boards/view-model.ts:110-116` | `"Your contribution is helping..."` | → `"Your chip-in is helping..."` (or rephrase) |
| `src/app/(host)/create/review/ReviewClient.tsx:175-177` | email body `"contributions"` / `"contribute here"` | → `"chip in"` / `"chip in here"` |

### Low — Error message jargon

| File | Current | Fix |
|------|---------|-----|
| `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:99` | `"Please enable browser storage and try again."` | → `"Please try again or use a different browser."` |

---

## Build Sub-steps (execute in order)

### Sub-step 1: Brand and Constants

Replace all legacy `ChipIn` references with `Gifta` in the files
listed in the "Critical — Legacy ChipIn" table above.

**Key files:**
- `src/lib/constants.ts` — `APP_NAME = 'Gifta'`
- `src/components/layout/Header.tsx` — logo text
- `src/components/layout/Footer.tsx` — brand + copyright
- `src/lib/integrations/email.ts` — from-name + from-email
  fallbacks
- `src/lib/payments/reconciliation-job.ts` — admin email subject
- `src/lib/integrations/karri-batch.ts` — transaction description
- `src/lib/retention/retention.ts` — anonymised email domain
- `src/lib/api/openapi.ts` — API base URL
- `src/lib/analytics/metrics.ts` — comment

**Do NOT change:**
- `src/lib/webhooks/signature.ts` (header names are API contracts)
- `src/lib/observability/otel.ts` (service name is infra)
- `src/lib/db/seed.ts` (demo data, out of scope)
- Webhook event names or API scope strings anywhere

**Metadata:**
- `src/app/layout.tsx` lines 46, 48, 54, 67 — update SEO title
  to `"Gifta — One Dream Gift, Together."` (or similar approved
  tagline). Replace `"Create a Dreamboard for your child's
  birthday..."` with `"Create a Dream Board for your child's
  birthday. Friends and family chip in toward one meaningful
  gift."`.

After this sub-step: run `pnpm lint && pnpm typecheck` to verify
no imports broke.

---

### Sub-step 2: Dream Board Casing

Replace every user-visible `Dreamboard` with `Dream Board` in the
files listed in the "Critical — Dreamboard casing" table above.

**Pattern:** Search for `Dreamboard` (case-sensitive) across all
`.tsx` and `.ts` files under `src/`. For each hit:
- If it's in a JSX string, React text node, `title` prop,
  `description`, metadata, or user-visible copy → replace with
  `Dream Board`
- If it's in an API scope string, webhook event name, URL slug,
  or code variable → leave unchanged

**Landing page strings** (`LandingCTA`, `LandingPage`,
`LandingNav`, `LandingDreamBoard`, `content.ts`):
- `"Create Your Free Dreamboard"` → `"Create your free Dream Board"`
  (sentence case per copy matrix rules)
- `"Create a Dreamboard"` → `"Create a Dream Board"`
- `"Share your Dreamboard"` → `"Share your Dream Board"`
- `"Mia's Dreamboard"` → `"Mia's Dream Board"`

After this sub-step: run `pnpm lint && pnpm typecheck`.

---

### Sub-step 3: Copy Matrix Mismatches — Host Create Flow

Fix the mismatches in the host creation flow:

1. **`src/app/(host)/create/giving-back/GivingBackForm.tsx:77`**
   - Current: `"Share a portion with charity"`
   - Change to: `"Enable giving back (optional)"`

2. **`src/app/(host)/create/review/ReviewClient.tsx:262`**
   - Current: `"Publish Dream Board"`
   - Change to: `"Create Dream Board"`
   - Also fix the pending state: `"Publishing..."` → `"Creating..."`

3. **`src/app/(host)/create/review/ReviewClient.tsx:186`**
   - Current: `"{childName}'s Dreamboard is ready!"`
   - Change to: `"🎉 {childName}'s Dream Board is ready!"`

4. **`src/app/(host)/create/review/ReviewClient.tsx:175-177`**
   - Email body: `"we're collecting contributions"` →
     `"we're collecting chips-in"` or rephrase to `"friends and
     family are chipping in"`
   - `"View and contribute here"` → `"View and chip in here"`

---

### Sub-step 4: Copy Matrix Mismatches — Contribution Flow

1. **`src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:183`**
   - Current: `"Your name (as it will appear)"`
   - Change to: `"Your name (optional)"`

2. **`src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:218`**
   - Current: `"Add a birthday message 🎂"` (button/label)
   - Change to: `"Message (optional)"`

3. **`src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:260`**
   - Current: `"Remind me in 3 days 🔔"`
   - Change to: `"Remind me later"`

4. **`src/components/contribute/ReminderModal.tsx:120`**
   - Current: `"We'll send you a reminder in 3 days so you can
     check on the progress."`
   - Change to: `"We'll send one reminder before this Dream Board
     closes."`

5. **`src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx:99`**
   - Current: `"...enable browser storage and try again."`
   - Change to: `"We couldn't save your details. Please try again
     or use a different browser."`

---

### Sub-step 5: Copy Matrix Mismatches — Public Board + Thank You

1. **`src/app/(guest)/[slug]/page.tsx:123`**
   - Current: `"Goal reached! Extra contributions still help
     cover the dream gift."`
   - Change to: `"Goal reached! Extra contributions still help."`

2. **`src/lib/dream-boards/view-model.ts:159`**
   - Current: `"This Dreamboard has closed. Thank you for helping
     make this birthday special! 💝"`
   - Change to: `"This Dream Board is closed to new contributions."`

3. **`src/lib/dream-boards/view-model.ts:105`**
   - Current: `"Contribute to {childName}'s dream gift"`
   - Change to: `"Chip in for {childName}'s dream gift"`

4. **`src/lib/dream-boards/view-model.ts:110-116`**
   - Any user-facing string using `"contribution"` as a noun →
     rephrase. E.g., `"Your contribution is helping..."` →
     `"You're helping {childName} get their dream gift."`

5. **`src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx:124`**
   - Current: `"Charity Donation"`
   - Change to: `"Charity contribution"`

---

### Sub-step 6: Reminder Email Template

Update `src/lib/reminders/templates.ts`:

1. **Subject line (line ~78):**
   - Current: `"Reminder: contribute to {childName}'s {giftName}"`
   - Change to: `"🔔 Reminder: chip in for {childName}'s gift"`

2. **Body text (lines ~81-84):**
   - `"Please contribute before {closeDate}."` →
     `"Please chip in before {closeDate}."`
   - `"Contribute now"` link text → `"Chip in now"`

3. **Leave WhatsApp template names unchanged** — those reference
   external Meta Business API templates, not user-visible strings
   in this codebase.

---

### Sub-step 7: Tests

Update any test assertions that reference old copy strings. Search
test files for:
- `"ChipIn"` — update to `"Gifta"`
- `"Dreamboard"` — update to `"Dream Board"`
- `"Publish Dream Board"` — update to `"Create Dream Board"`
- `"Share a portion"` — update to `"Enable giving back"`
- `"Remind me in 3 days"` — update to `"Remind me later"`
- Any other string that was changed in sub-steps 1–6

**New test file:** `tests/unit/copy-matrix-compliance.test.ts`
(~12 tests):

- Header renders `"Gifta"` not `"ChipIn"`
- Footer renders `"Gifta"` not `"ChipIn"`
- `APP_NAME` constant equals `"Gifta"`
- Email from-name fallback equals `"Gifta"`
- View model closed message contains `"Dream Board"` not
  `"Dreamboard"`
- View model contribution headline uses `"Chip in"` not
  `"Contribute"`
- Reminder email subject contains `"chip in"` not `"contribute"`
- Reminder email body contains `"Chip in now"` not
  `"Contribute now"`
- Landing page CTA contains `"Dream Board"` not `"Dreamboard"`
- Review CTA button text is `"Create Dream Board"` not
  `"Publish Dream Board"`
- Funded banner text matches matrix exactly
- Closed state text matches matrix exactly

These tests guard against future copy drift.

---

### Sub-step 8: Accessibility Pass

Verify that copy changes did not break accessibility:

- All `aria-label` values that referenced old strings are updated
- `<title>` and `<meta>` description values updated
- Screen reader text (`.sr-only` spans) uses canonical terms
- No empty strings introduced by string replacement

---

### Sub-step 9: Gate & Evidence

1. Run `pnpm lint && pnpm typecheck && pnpm test`
2. All three must pass (0 errors; warnings OK)
3. Record: total test count, total test files, new C6-specific
   test count
4. Create evidence file at:
   `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C6-comms-and-content-alignment.md`
5. Evidence must contain:
   - Files modified (with old → new string summary)
   - Gate output (lint, typecheck, test)
   - Test count breakdown (total vs C6-new)
   - Copy matrix compliance checklist (each row: location,
     matrix string, implemented string, status)
   - Any deferred items with milestone target
6. Append C6 learnings to `docs/napkin/napkin.md` under
   `## C6 Learnings (2026-02-09)`

---

## Acceptance Criteria

### P0 (blocks merge)
- Zero `ChipIn` references in user-visible UI surfaces
- Zero `Dreamboard` (one word) in user-visible strings
- `APP_NAME` constant is `Gifta`
- Email from-name fallback is `Gifta`
- Gates pass

### P1 (blocks rollout)
- All copy matrix entries implemented as specified
- Reminder email uses `"chip in"` terminology
- Review CTA is `"Create Dream Board"` (not `"Publish"`)
- Giving back toggle matches matrix
- Contribution flow field labels match matrix
- Closed/funded state messages match matrix
- Error messages use non-technical language
- Copy compliance test file passes

### P2 (defer with waiver)
- Landing page long-form copy refinements (beyond term
  replacement)
- Email HTML template visual redesign
- WhatsApp template content updates (requires Meta Business API
  changes — out of scope for code-only C6)

---

## Stop Conditions

- Any P0 gate failure → stop, fix, re-run
- Schema or migration file touched → STOP (Phase B is locked)
- Webhook handler modified → STOP
- Fee calculation logic modified → STOP
- API route logic changed (not just strings) → STOP
- Webhook event names or API scope strings changed → STOP
  (developer-facing contracts)
- Any test count regression → stop, investigate

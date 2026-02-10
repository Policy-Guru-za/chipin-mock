# C6 Evidence — Comms and Content Alignment

Date: 2026-02-09  
Milestone: Phase C / C6  
Scope: Copy/content alignment only (no behavior, schema, or API contract changes)

## 1) Changed File Inventory (C6 slice)

### Source/UI/Content
- `src/app/layout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/lib/constants.ts`
- `src/lib/integrations/email.ts`
- `src/lib/payments/reconciliation-job.ts`
- `src/lib/integrations/karri-batch.ts`
- `src/lib/retention/retention.ts`
- `src/lib/api/openapi.ts`
- `src/lib/analytics/metrics.ts`
- `src/app/(guest)/[slug]/page.tsx`
- `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx`
- `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx`
- `src/app/(guest)/[slug]/contribute/payment/page.tsx`
- `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx`
- `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx`
- `src/app/(host)/create/giving-back/GivingBackForm.tsx`
- `src/app/(host)/create/review/ReviewClient.tsx`
- `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx`
- `src/components/contribute/ReminderModal.tsx`
- `src/components/dream-board/ReturnVisitBanner.tsx`
- `src/components/landing/LandingCTA.tsx`
- `src/components/landing/LandingDreamBoard.tsx`
- `src/components/landing/LandingNav.tsx`
- `src/components/landing/LandingPage.tsx`
- `src/components/landing/content.ts`
- `src/lib/dream-boards/view-model.ts`
- `src/lib/reminders/templates.ts`

### Generated Contract Artifact
- `public/v1/openapi.json` (regenerated after OpenAPI server URL update)

### Tests
- `tests/unit/copy-matrix-compliance.test.ts` (new)
- `tests/unit/reminder-templates.test.ts`
- `tests/unit/contribute-details.test.tsx`
- `tests/unit/contribute-payment.test.tsx`
- `tests/unit/time-remaining.test.tsx`
- `tests/unit/guest-view-model.test.ts`
- `tests/unit/dream-board-view-model.test.ts`
- `tests/integration/public-board-display.test.tsx`

## 2) Old -> New String Summary (Representative)

- `ChipIn` -> `Gifta` in active branding surfaces and fallback comms strings.
- `Dreamboard` -> `Dreamboard` in user-visible UI copy.
- `Publish Dreamboard` -> `Create Dreamboard`.
- `Share a portion with charity` -> `Enable giving back (optional)`.
- `Your name (as it will appear)` -> `Your name (optional)`.
- `Add a birthday message 🎂` -> `Message (optional)`.
- `Remind me in 3 days 🔔` -> `Remind me later`.
- Reminder modal confirmation -> `We'll send one reminder before this Dreamboard closes.`
- Funded banner -> `Goal reached! Extra contributions still help.`
- Closed-state copy -> `This Dreamboard is closed to new contributions.`
- Reminder email subject/body/CTA moved from `contribute` phrasing to `chip in` phrasing per matrix.

## 3) Protected Contract Checks

Confirmed unchanged:
- Webhook headers: `X-ChipIn-Signature`, `X-ChipIn-Event-Id`
- Webhook event names: `dreamboard.created`, `dreamboard.updated`
- API scopes: `dreamboards:read`, `dreamboards:write`
- Route slugs/segments and DB schema/enums

## 4) Gate Output

| Command | Result |
|---|---|
| `pnpm lint` | PASS (warnings-only baseline unchanged for repo policy) |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS |
| `pnpm openapi:generate` | PASS |
| `pnpm test tests/unit/openapi-spec.test.ts` | PASS |

Final full test run: `138` test files passed, `627` tests passed.

## 5) C6-Specific Test Coverage

- New file: `tests/unit/copy-matrix-compliance.test.ts`
- New assertions: `11`
- Purpose: prevent drift on brand strings, Dreamboard terminology, matrix CTA/reminder text, and critical banner copy.

## 6) Copy Matrix Compliance Checklist

| Location | Matrix String | Implemented | Status |
|---|---|---|---|
| Header brand | `Gifta` | `Gifta` | PASS |
| Footer brand | `Gifta` | `Gifta` | PASS |
| Host create giving-back toggle | `Enable giving back (optional)` | exact | PASS |
| Host create review CTA | `Create Dreamboard` | exact | PASS |
| Public funded banner | `Goal reached! Extra contributions still help.` | exact | PASS |
| Public closed state | `This Dreamboard is closed to new contributions.` | exact | PASS |
| Contribution optional name | `Your name (optional)` | exact | PASS |
| Contribution optional message | `Message (optional)` | exact | PASS |
| Contribution reminder prompt | `Remind me later` | exact | PASS |
| Reminder confirmation | `We'll send one reminder before this Dreamboard closes.` | exact | PASS |
| Reminder email subject | `🔔 Reminder: chip in for [Child]'s gift` | exact shape | PASS |
| Reminder email CTA | `Chip in now` | exact | PASS |

## 7) Deferred Items (P2) and Target

Deferred (unchanged from plan scope):
1. Landing long-form narrative refinements beyond terminology alignment (target: C7+).
2. Email HTML visual redesign (target: C7+).
3. WhatsApp template content changes requiring external provider coordination (target: C7+/ops).


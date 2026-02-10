# C8 — E2E/UAT and Performance Sweep

## Objective

Execute comprehensive end-to-end UAT scenario coverage, verify
telemetry instrumentation completeness, run full regression and
build/static performance preflight checks, and produce a
release-readiness evidence package
that satisfies the Phase C GO/NO-GO pre-gates
(CG-02, CG-03, CG-04, CG-05) and feeds C9A pre-live readiness.
This is a validation milestone — no new features, no UI changes, no
business logic modifications except minimal blocker defect fixes.
Every output is a test, a verification, or an evidence artifact.

---

## Context & Constraints

- Read these docs in order **before any work**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_E2E_UAT_PLAN.md`
     (**authoritative** UAT scenario matrix and exit criteria)
  4. `docs/implementation-docs/GIFTA_UX_V2_ANALYTICS_TELEMETRY_SPEC.md`
     (**authoritative** event catalog and acceptance criteria)
  5. `docs/implementation-docs/GIFTA_UX_V2_ACCESSIBILITY_AND_EDGE_CASE_TEST_PLAN.md`
     (edge-case matrix EC-01 through EC-08)
  6. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`
     (gates CG-01 through CG-06 that C8 evidence must satisfy)
  7. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md`
     (pre-flight items C0-02, C0-03, C0-04 that depend on C8 outputs)
  8. `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md`
     (canonical copy strings for assertion targets)
  9. `docs/Platform-Spec-Docs/NFR-OPERATIONS.md`
     (performance targets: LCP < 2.5s, TTFB < 300ms, API p95 < 500ms)
  10. `docs/napkin/napkin.md` (all learnings — read fully)
  11. `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C7-accessibility-and-edge-cases.md`
      (current baseline: 145 test files, 656 tests, P2 deferrals)
- Required full-gate sequence for C8 completion:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm openapi:generate`
  - `pnpm vitest run tests/unit/openapi-spec.test.ts`
  - `pnpm build`
- All gates **must pass** before marking C8 complete.
- Do NOT proceed to C9A until C8 completion criteria pass.
- **Scope boundary — C8 is validation only.** Do NOT:
  - Modify any component, page, layout, or business logic file
  - Modify Phase B backend APIs, DB schema, migration files, or
    webhook handlers
  - Change fee calculation logic (`src/lib/payments/fees.ts`)
  - Change any user-facing copy (C6 handled copy)
  - Change any accessibility attributes (C7 handled a11y)
  - Add new features or UI elements
  - Change `tailwind.config.ts`, `next.config.js`, or
    `vitest.config.ts` (unless adjusting coverage thresholds
    documented in evidence)
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF** unless
  explicitly toggled within a test and restored after.
- **API contract strings are out of scope.** Do NOT change webhook
  event names, API scope strings, OpenAPI enum values, database
  column/enum names, webhook header names, or URL slugs.
- **Allowed file changes:** Test files (`tests/**/*.test.ts`,
  `tests/**/*.test.tsx`) and evidence documentation only. The sole
  exception is if a C8 test reveals a **blocker-severity defect**
  (money correctness, critical journey broken, severe a11y failure
  per defect severity rules in the E2E/UAT plan). In that case:
  document the defect, fix it minimally, record the fix in evidence,
  and re-run all gates.
- **Generated drift policy:** if gate commands create non-test source
  diffs that are not part of an approved blocker fix, STOP and mark C8
  as INCOMPLETE. Do not silently absorb drift.

---

## C8 Exit Contract for C9A

C8 is considered complete only when:

- CG-02 through CG-05 map to `PASS` in C8 evidence
- Full C8 gate sequence is green
- C8 evidence status is `COMPLETE` (not `INCOMPLETE`)
- Handoff capsule for C9A is populated with explicit status:
  - `READY_FOR_C9A`, or
  - `BLOCKED` (with blocker list)

If any condition is unmet, C8 output must state `INCOMPLETE` and
provide blocker details for remediation before C9A.

---

## Current Baseline (post-C7)

See `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C7-accessibility-and-edge-cases.md`
for full prior-state reference. C8 starts from that baseline.

- Historical C7 snapshot (from prior evidence): 145 test files,
  656 tests
- C8 baseline authority: capture fresh counts in Sub-step 0 and use
  those captured values for all C8 delta/regression assertions
- Gate status: `pnpm lint` PASS, `pnpm typecheck` PASS, `pnpm test` PASS
- `tests/e2e/` directory: exists but is empty (no E2E tests yet)
- Coverage thresholds: 60% lines/functions/branches/statements
- P2 deferrals from C7: marketing/auth error boundaries, leaf-route
  loading states, `text-text-muted` token, Lighthouse >= 95,
  axe-core automation, high-contrast mode

---

## UAT Scenario Matrix (from E2E/UAT Plan)

The E2E/UAT plan defines 12 scenarios. C8 must produce test coverage
for every P0 scenario and all P1 scenarios. Tests go in
`tests/e2e/` as integration-level end-to-end scenario tests.

| ID | Persona | Scenario | Priority |
|---|---|---|---|
| UAT-01 | Host | Create board with Karri payout | P0 |
| UAT-02 | Host | Create board with bank payout | P0 |
| UAT-03 | Host | Create board with charity percentage split | P0 |
| UAT-04 | Host | Create board with charity threshold split | P0 |
| UAT-05 | Guest | Contribute via PayFast | P0 |
| UAT-06 | Guest | Contribute via Ozow | P0 |
| UAT-07 | Guest | Contribute via SnapScan | P0 |
| UAT-08 | Guest | Request reminder | P1 |
| UAT-09 | Host | View dashboard progress and payout details | P0 |
| UAT-10 | Admin | Process payout review flow | P0 |
| UAT-11 | Admin | Charity management/report workflows | P1 |
| UAT-12 | Accessibility | Keyboard + screen reader on critical routes | P0 |

---

## Edge-Case Matrix (from Accessibility and Edge-Case Test Plan)

| ID | Scenario | Priority |
|---|---|---|
| EC-01 | No contributions by close | P0 |
| EC-02 | Duplicate contribution submit | P0 |
| EC-03 | Payment provider timeout | P0 |
| EC-04 | Reminder requested after close window | P0 |
| EC-05 | Payout fails | P0 |
| EC-06 | Charity disabled board with stale charity fields | P0 |
| EC-07 | Session expiry during create flow | P1 |
| EC-08 | Missing optional media/assets | P1 |

---

## Telemetry Event Catalog (from Analytics Spec)

### Host Journey Events
- `host_create_started`
- `host_create_step_completed` (with `step` property)
- `host_create_failed`
- `host_create_published`

### Guest/Contributor Journey Events
- `guest_view_loaded`
- `contribution_started`
- `contribution_redirect_started`
- `contribution_completed`
- `contribution_failed`
- `reminder_requested`

### Payout/Operations Events
- `payout_created`
- `payout_processing_started`
- `payout_completed`
- `payout_failed`
- `charity_payout_created`
- `reminder_dispatched`
- `reminder_failed`

---

## Build Sub-steps (execute in order)

### Sub-step 0: Baseline Verification

Before writing any tests, confirm the current baseline is clean.

1. Run `pnpm lint && pnpm typecheck && pnpm test`
2. Record exact test count and file count.
3. If baseline fails, STOP. Do not proceed until baseline is green.
   Record the failure in evidence and investigate.

After this sub-step: baseline gate must be green.

---

### Sub-step 1: UAT Scenario Tests — Host Journeys (UAT-01 through UAT-04)

Create `tests/e2e/uat-host-create.test.ts`.

Test the full host create flow for each payout/charity combination
using the existing server-action and draft-persistence patterns
already tested in `tests/integration/create-flow-steps.test.ts`.
These tests exercise the **complete** create journey from child
step through review/publish, not individual steps.

**UAT-01: Create board with Karri payout**
- Persist draft through all 6 steps (child → dates → gift →
  giving-back → payout → review)
- Payout method = `karri_card`, card number provided
- Charity disabled (`charityEnabled: false`)
- Assert: Dreamboard record created with correct status, slug
  generated, payout method persisted, charity fields null/false
- Assert: share URL construction uses correct slug format

**UAT-02: Create board with bank payout**
- Enable bank write path toggle within test, restore after
- Payout method = `bank`, bank details provided
- Assert: bank details encrypted and persisted
- Assert: payout method field is `bank`

**UAT-03: Create board with charity percentage split**
- Enable charity write path toggle within test, restore after
- `charityEnabled: true`, `charitySplitType: 'percentage'`,
  `charityPercentage: 10`, valid `charityId`
- Assert: charity config persisted correctly
- Assert: payout calculation includes charity allocation

**UAT-04: Create board with charity threshold split**
- Enable charity write path toggle within test, restore after
- `charityEnabled: true`, `charitySplitType: 'threshold'`,
  `charityThresholdCents: 50000`, valid `charityId`
- Assert: threshold config persisted correctly
- Assert: threshold behavior triggers only when raised >= threshold

**Telemetry emission assertions:**
Each UAT scenario must also verify that the expected analytics
events were emitted during the journey. Mock or spy on the
analytics tracking function (e.g., `src/lib/analytics/`) and
assert:
- UAT-01/02/03/04: `host_create_started` emitted at flow entry;
  `host_create_step_completed` emitted with correct `step` value
  at each step; `host_create_published` emitted at publish with
  `dream_board_id`, `payout_method`, and `charity_enabled`
  properties.

**Test infrastructure notes:**
- Mock Clerk auth using existing test patterns from
  `tests/integration/create-flow-steps.test.ts`
- Mock Karri verification to return valid response
- Use existing `dreamBoardDraftSchema` for draft payloads
- Restore all env toggles (`UX_V2_ENABLE_*`) in `afterEach`
  (napkin: cross-test gate leakage)

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 2: UAT Scenario Tests — Guest Contribution Journeys (UAT-05 through UAT-08)

Create `tests/e2e/uat-guest-contribute.test.ts`.

**UAT-05: Contribute via PayFast**
- Create a test Dreamboard (active, Karri payout)
- Submit contribution with `provider: 'payfast'`, valid amount
- Assert: contribution record created with `pending` status
- Assert: PayFast payment intent returns form data with valid
  signature
- Simulate webhook completion (PayFast ITN)
- Assert: contribution status updated to `completed`
- Assert: Dreamboard `raised_cents` updated correctly
- Assert: fee calculation matches `amount * 0.03` bounded to
  [R3, R500] (decision register D-004)

**UAT-06: Contribute via Ozow**
- Same board setup
- Submit contribution with `provider: 'ozow'`
- Assert: Ozow payment intent returns redirect URL
- Simulate webhook completion
- Assert: status + raised amount correct

**UAT-07: Contribute via SnapScan**
- Same board setup
- Submit contribution with `provider: 'snapscan'`
- Assert: SnapScan payment intent returns QR data
- Simulate webhook completion
- Assert: status + raised amount correct

**UAT-08: Request reminder (P1)**
- Create active Dreamboard with campaign_end_date in future
- Submit reminder request with valid email
- Assert: `contributionReminders` record created with
  `sent_at: null`
- Assert: duplicate reminder for same (dream_board_id, email)
  is rejected (idempotency per decision D-007)

**Telemetry emission assertions:**
Mock or spy on the analytics tracking function and assert:
- UAT-05/06/07: `contribution_started` emitted when form
  submitted; `contribution_redirect_started` emitted when
  redirect/QR flow begins; `contribution_completed` emitted on
  webhook success with `dream_board_id`, `payment_provider`, and
  `amount_cents`; `contribution_failed` emitted on webhook
  failure with `failure_code`.
- UAT-08: `reminder_requested` emitted when reminder scheduled.

**Test infrastructure notes:**
- Mock payment provider external calls (PayFast signature
  verification, Ozow OAuth token, SnapScan API)
- Use `NextRequest` for route tests that depend on `nextUrl`
  (napkin: avoid plain `Request`)
- Currency assertions must be locale-safe (napkin: use regex for
  `R 257,50` with NBSP/comma patterns)

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 3: UAT Scenario Tests — Dashboard and Admin (UAT-09 through UAT-11)

Create `tests/e2e/uat-dashboard-admin.test.ts`.

**UAT-09: Host dashboard progress and payout details**
- Create Dreamboard with 3 completed contributions
- Assert: dashboard list view returns board with correct
  `raisedCents`, `contributorCount`, percentage calculation
- Assert: detail view includes payout method label and status
- Assert: post-campaign view (closed board) shows download
  actions and payout summary

**UAT-10: Admin payout review flow**
- Create Dreamboard → fund to goal → close campaign
- Assert: payout record created with `pending` status
- Exercise admin confirm endpoint → assert status transitions
  to `completed`
- Exercise admin fail endpoint on separate payout → assert
  status transitions to `failed`
- Assert: audit log entries created for both transitions
- Assert: payout amounts reconcile (gross - fees - charity = net)

**UAT-11: Admin charity management/report workflows (P1)**
- Create charity record via admin
- Associate charity with Dreamboard
- Run charity reconciliation query
- Assert: report data includes correct allocation amounts
- Assert: charity list filtering by active/inactive works
- Assert: CSV export includes header row (napkin: header-only
  CSV for empty datasets)

**Telemetry emission assertions:**
Mock or spy on the analytics tracking function and assert:
- UAT-10: `payout_processing_started` emitted when payout begins;
  `payout_completed` emitted on confirm with `payout_id`,
  `payout_type`, `amount_cents`; `payout_failed` emitted on fail
  with `payout_id`, `failure_code`.

**Test infrastructure notes:**
- Stub `matchMedia` for tests rendering `ProgressBar` or
  motion-aware components (napkin: legacy + modern stubs)
- Admin auth mock must return valid session with admin email

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 4: Edge-Case Tests (EC-01 through EC-08)

Create `tests/e2e/uat-edge-cases.test.ts`.

**EC-01: No contributions by close**
- Create board → advance to close date → trigger close logic
- Assert: board status transitions to `closed`
- Assert: no payout record created (nothing to pay out)
- Assert: no errors thrown

**EC-02: Duplicate contribution submit**
- Create contribution with specific (provider, paymentRef)
- Attempt second contribution with same (provider, paymentRef)
- Assert: unique constraint prevents duplicate record
- Assert: error response is deterministic (not 500)

**EC-03: Payment provider timeout**
- Mock payment provider to return error/timeout
- Assert: contribution remains in `pending` or transitions to
  `failed`
- Assert: no partial state corruption
- Assert: Dreamboard `raised_cents` not incremented

**EC-04: Reminder requested after close window**
- Create board with `campaign_end_date` in the past
- Attempt to schedule reminder
- Assert: rejected deterministically (not silently accepted)

**EC-05: Payout fails**
- Create payout with `pending` status
- Simulate Karri top-up failure
- Assert: payout status transitions to `failed`
- Assert: retry path available (status can return to `processing`)
- Assert: clear error message stored

**EC-06: Charity disabled board with stale charity fields**
- Create board with `charityEnabled: false` but non-null
  `charityId` and `charityPercentage` in the payload
- Assert: validation rejects or ignores stale charity fields
- Assert: no charity allocation calculated at payout time

**EC-07: Session expiry during create flow (P1)**
- Create partial draft (steps 1-3 complete)
- Simulate session/auth loss
- Assert: draft data persists for recovery
- Assert: returning user is redirected appropriately

**EC-08: Missing optional media/assets (P1)**
- Create board with no child photo, no gift description
- Assert: public view renders gracefully with fallback display
- Assert: no runtime errors from null/undefined media fields

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 5: Telemetry Instrumentation Verification

Create `tests/e2e/uat-telemetry-verification.test.ts`.

This is an **emitter-level verification audit** — verify that every
event in the analytics spec is asserted via analytics emit spies in
journey tests, with required properties validated where applicable.
Do not rely on raw source-string scanning as the primary assertion
method.

**Approach:**
1. Spy/mock the analytics emitter used by runtime paths (for example,
   `trackEvent` or equivalent in `src/lib/analytics/*`).
2. Drive representative journey flows (host create, guest contribute,
   reminders, payout transitions) and assert emitted events.
3. For events with required properties, assert
   `expect.objectContaining(...)` includes required keys/values.
4. Maintain an event manifest in the test file listing all 17 catalog
   events and assert each is covered by at least one emission
   assertion in the suite.

**Implementation:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as analytics from '@/lib/analytics';

const emitSpy = vi.spyOn(analytics, 'trackEvent');

describe('Telemetry event instrumentation', () => {
  it('asserts required host-create event emissions', async () => {
    await runHostCreateJourney();
    expect(emitSpy).toHaveBeenCalledWith(
      'host_create_started',
      expect.any(Object)
    );
    expect(emitSpy).toHaveBeenCalledWith(
      'host_create_step_completed',
      expect.objectContaining({ step: expect.any(String) })
    );
    expect(emitSpy).toHaveBeenCalledWith(
      'host_create_published',
      expect.objectContaining({
        dream_board_id: expect.any(String),
        payout_method: expect.any(String),
        charity_enabled: expect.any(Boolean),
      })
    );
  });
});
```

**Required property verification** — for each event, check that
the emitted payload includes the required properties from the spec:

| Event | Required Properties |
|---|---|
| `host_create_step_completed` | `step` |
| `host_create_published` | `dream_board_id`, `payout_method`, `charity_enabled` |
| `contribution_completed` | `dream_board_id`, `payment_provider`, `amount_cents` |
| `contribution_failed` | `dream_board_id`, `failure_code` |
| `payout_completed` | `payout_id`, `payout_type`, `amount_cents` |
| `payout_failed` | `payout_id`, `failure_code` |

For each row, assert emitted payload objects include the required
property keys. If a required property is missing, the test fails.

**Telemetry P0 alert events** — the analytics spec requires P0
alerts for money-movement and critical-path failures. Verify that
`payout_failed` and `contribution_failed` events exist and include
`failure_code`.

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 6: Regression Sweep

This sub-step does not create new test files. It runs the full
existing suite and verifies zero regressions from the Sub-step 0
captured baseline.

1. Run `pnpm lint` — record output (0 errors, note warning count)
2. Run `pnpm typecheck` — record output (0 errors)
3. Run `pnpm test` — record total test count and file count
4. Run `pnpm test:coverage` — record coverage percentages for
   lines, functions, branches, statements
5. Run `pnpm openapi:generate` — verify OpenAPI spec regenerates
   without error (napkin: must run before OpenAPI test)
6. Run `pnpm vitest run tests/unit/openapi-spec.test.ts` — verify
   OpenAPI contract parity holds

**Regression checks:**
- Total test count must be >= Sub-step 0 baseline + new C8 tests
- No test file count regression
- Coverage must meet or exceed 60% thresholds
- OpenAPI enum parity must hold (decision register: runtime
  enums == OpenAPI enums)
- Zero `P0` or `P1` test failures

Record every command output in evidence.

After this sub-step: all gates must be green.

---

### Sub-step 7: Build and Performance Verification

Since this environment cannot run Lighthouse or access a staging
URL (per `docs/perf/guest-view.md` — blocked), C8 performance
verification focuses on build-time and static checks.

1. **Build verification:**
   - Run `pnpm build`
   - Assert: build completes without errors
   - Record: total build time, page count, route count

2. **Bundle analysis (from build output):**
   - Capture the Next.js build output showing route sizes
   - Identify any route exceeding 300kB (first-load JS)
   - Flag routes > 300kB as performance warnings in evidence

3. **Static performance checks:**
   - Verify `next.config.js` has image optimization configured
   - Verify critical guest routes (`/[slug]`, `/[slug]/contribute`)
     are not marked `'use client'` at the page level (should be
     server-rendered with client islands)
   - Verify no `getServerSideProps` blocking patterns on guest
     routes (App Router should use `async` server components or
     `cache()`)

4. **NFR target documentation:**
   - Record NFR targets from `docs/Platform-Spec-Docs/NFR-OPERATIONS.md`:
     - LCP < 2.5s (mobile 4G) — cannot measure, document as
       DEFERRED (staging URL required)
     - TTFB < 300ms (cached) — cannot measure, document as
       DEFERRED (staging URL required)
     - API p95 < 500ms — cannot measure, document as DEFERRED
       (requires production monitoring)
   - Record deferral with explicit owner and prerequisite
     (staging URL provision)

After this sub-step: build must succeed.

---

### Sub-step 8: Data Validation Checks

Create `tests/e2e/uat-data-validation.test.ts`.

Verify the four data-correctness areas specified in the E2E/UAT
plan:

**Goal progress math and funded status:**
- Create board with `goalCents: 100000` (R1,000)
- Add contributions totalling exactly R1,000
- Assert: `raised_cents == 100000`, percentage == 100%
- Assert: board status transitions to `funded`
- Add one more contribution (over-funded)
- Assert: `raised_cents > goalCents`, percentage > 100%
- Assert: board remains `funded` (not over-funded error)

**Payout totals and method labels:**
- For Karri payout: assert method label is `"Karri Card"`
- For bank payout: assert method label is `"Bank transfer"`
  (or equivalent canonical label)
- Assert: payout `grossCents` = total `raised_cents`
- Assert: payout `platformFeeCents` = bounded 3% of raised
- Assert: payout `netCents` = gross - fees - charity
- Assert: all amounts are non-negative integers

**Charity allocation and reporting consistency:**
- Percentage split: 10% of R1,000 raised = R100 charity
- Assert: `charityCents == 10000`
- Assert: `giftCents == grossCents - platformFeeCents - charityCents`
- Threshold split: threshold R500, raised R800
- Assert: charity allocation triggered (raised >= threshold)
- Threshold split: threshold R500, raised R300
- Assert: charity allocation NOT triggered (raised < threshold)

**Reminder schedule bounds:**
- Assert: reminder `remind_at` is within campaign window
  (not after `campaign_end_date`)
- Assert: reminder scheduling respects 14-day max window
  (decision register D-007)

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 9: Accessibility Regression (UAT-12)

Create `tests/e2e/uat-accessibility-regression.test.ts`.

This test file consolidates accessibility verification across
critical routes as a regression guard. It does NOT duplicate C7's
unit tests but adds journey-level a11y assertions.

**Keyboard navigation verification:**
- Assert: root layout contains skip-to-content link with
  `href="#main-content"`
- Assert: root layout contains `<main id="main-content">`
- Assert: all route-group error boundaries exist and export
  valid components
- Assert: all critical-route loading states exist

**Screen reader semantics verification:**
- Assert: `AmountSelector` input has `aria-label`
- Assert: `LandingNav` dialog has `aria-label`
- Assert: `ReminderModal` error has `role="alert"`
- Assert: `CharityFormModal` error has `role="alert"`

**Contrast regression guard:**
- Import and re-run the contrast ratio calculations from
  `tests/unit/colour-contrast.test.ts` programmatically
- Assert: all pairs still pass (guards against accidental
  revert of C7 contrast fixes)

**Touch target regression guard:**
- Assert: button icon variant is `h-11 w-11` (not `h-10 w-10`)
- Assert: pagination controls have minimum height styling

**Noscript and error states:**
- Assert: root layout includes `<noscript>` element
- Assert: `not-found.tsx` exists and exports default component

**Branding regression guard (decision register D-009):**
- Assert: `APP_NAME` constant in `src/lib/constants.ts` equals
  `"Gifta"` (not `"ChipIn"`)
- Assert: email from-name fallback in `src/lib/integrations/email.ts`
  equals `"Gifta"`
- Assert: Header component renders `"Gifta"` brand text
- Assert: Footer component renders `"Gifta"` in copyright line
- Assert: no source file under `src/components/` or `src/app/`
  contains the string `"ChipIn"` in a JSX text node or string
  literal (guard against branding drift reintroduction)

After this sub-step: run `pnpm lint && pnpm typecheck && pnpm test`.

---

### Sub-step 10: Device and Viewport Matrix Documentation

The E2E/UAT plan requires coverage across 4 viewport classes.
Since C8 runs in a headless environment without browser access,
this sub-step produces a **viewport verification checklist** for
manual sign-off during C9 rollout, and documents what CAN be
verified statically.

**Static verification (automated):**
- Scan all critical-path components for responsive Tailwind
  classes (`sm:`, `md:`, `lg:`)
- Assert: guest board page (`src/app/(guest)/[slug]/page.tsx`)
  uses responsive breakpoints
- Assert: host dashboard uses responsive breakpoints
- Assert: admin layout uses responsive breakpoints
- Assert: contribution form uses responsive breakpoints
- Record findings in evidence

**Manual verification checklist (for C9):**

| Viewport | Class | Routes to Test | Status |
|---|---|---|---|
| iPhone Safari (375×812) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) |
| Android Chrome (360×800) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) |
| Desktop Chrome (1440×900) | Desktop | All routes | PENDING (C9B) |
| Desktop Safari (1440×900) | Desktop | All routes | PENDING (C9B) |

Include this checklist in the evidence file for C9 to execute.

After this sub-step: no gate run needed (documentation only).

---

### Sub-step 11: Consolidated Gate and Evidence

1. Run full gate sequence:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm openapi:generate
   pnpm vitest run tests/unit/openapi-spec.test.ts
   pnpm build
   ```
2. All must pass (0 errors; warnings OK).
3. Record:
   - Total test files (expect baseline + 7 new C8 files)
   - Total tests (expect baseline + new C8 tests; record exact delta)
   - Lint warning count (compare to C7 baseline)
   - Coverage percentages from `pnpm test:coverage`
4. Create evidence file at:
   `docs/implementation-docs/evidence/ux-v2/phase-c/YYYYMMDD-C8-e2e-uat-and-performance-sweep.md`
   using:
   `docs/implementation-docs/evidence/ux-v2/phase-c/C8-EVIDENCE-TEMPLATE.md`
5. Evidence must contain all sections listed below.
6. Append C8 learnings to `docs/napkin/napkin.md` under
   `## C8 Learnings (YYYY-MM-DD)`
7. Set C8 status:
   - `COMPLETE` only if all P0/P1 criteria pass
   - `INCOMPLETE` if any gate/pre-gate remains failed
8. Populate C9A handoff capsule with `READY_FOR_C9A` or `BLOCKED`.

---

## Evidence File Structure

The C8 evidence file must contain these sections:

### 1) Baseline Verification
- Pre-C8 gate outputs (lint, typecheck, test counts)

### 2) UAT Scenario Results

| UAT ID | Scenario | Priority | Test File | Test Count | Status |
|---|---|---|---|---|---|
| UAT-01 | Host create with Karri | P0 | `tests/e2e/uat-host-create.test.ts` | N | PASS/FAIL |
| UAT-02 | Host create with bank | P0 | `tests/e2e/uat-host-create.test.ts` | N | PASS/FAIL |
| ... | ... | ... | ... | ... | ... |
| UAT-12 | A11y regression | P0 | `tests/e2e/uat-accessibility-regression.test.ts` | N | PASS/FAIL |

### 3) Edge-Case Results

| EC ID | Scenario | Priority | Test File | Status |
|---|---|---|---|---|
| EC-01 | No contributions by close | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL |
| ... | ... | ... | ... | ... |

### 4) Telemetry Instrumentation Audit

| Event | Assertion File(s) | Required Properties | Properties Present | Status |
|---|---|---|---|---|
| `host_create_started` | `tests/e2e/uat-host-create.test.ts` | — | — | PASS/FAIL |
| `contribution_completed` | `tests/e2e/uat-guest-contribute.test.ts` | `dream_board_id`, `payment_provider`, `amount_cents` | YES/NO | PASS/FAIL |
| ... | ... | ... | ... | ... |

### 5) Data Validation Results
- Goal progress math: PASS/FAIL
- Payout totals: PASS/FAIL
- Charity allocation: PASS/FAIL
- Reminder bounds: PASS/FAIL

### 6) Regression Sweep
- Lint: PASS (errors: 0, warnings: N)
- Typecheck: PASS
- Tests: PASS (N files, N tests)
- Coverage: lines N%, functions N%, branches N%, statements N%
- OpenAPI parity: PASS

### 7) Build and Performance
- Build: PASS/FAIL (time: Ns)
- Bundle warnings: (list any routes > 300kB)
- Static perf checks: (server rendering, image optimization)
- Deferred NFR measurements: LCP, TTFB, API p95 (staging URL required)

### 8) Accessibility Regression
- Skip-link: PASS
- Error boundaries: PASS
- Loading states: PASS
- ARIA attributes: PASS
- Contrast regression: PASS
- Touch targets: PASS

### 9) Device/Viewport Readiness
- Static responsive check: PASS/FAIL
- Manual viewport checklist: PENDING (for C9B)

### 10) New Test Inventory

| File | Test Count | Coverage Area |
|---|---|---|
| `tests/e2e/uat-host-create.test.ts` | N | UAT-01 through UAT-04 |
| `tests/e2e/uat-guest-contribute.test.ts` | N | UAT-05 through UAT-08 |
| `tests/e2e/uat-dashboard-admin.test.ts` | N | UAT-09 through UAT-11 |
| `tests/e2e/uat-edge-cases.test.ts` | N | EC-01 through EC-08 |
| `tests/e2e/uat-telemetry-verification.test.ts` | N | Telemetry catalog |
| `tests/e2e/uat-data-validation.test.ts` | N | Data correctness |
| `tests/e2e/uat-accessibility-regression.test.ts` | N | UAT-12 |

### 11) P2 Backlog / Waivers
- Lighthouse performance audit (staging URL required)
- Real-device viewport testing (manual, C9)
- Load testing (staging URL required)
- Axe-core automated scanning (deferred from C7)

### 12) GO/NO-GO Readiness Assessment
Map C8 evidence to Phase C GO/NO-GO pre-gates:

| Gate | Requirement | C8 Evidence | Status |
|---|---|---|---|
| CG-02 | Phase C P0 test gates pass | Gate outputs section | PASS/FAIL |
| CG-03 | Phase C P1 test gates pass | Gate outputs section | PASS/FAIL |
| CG-04 | UAT critical scenarios pass | UAT results section | PASS/FAIL |
| CG-05 | Accessibility P0 checks pass | A11y regression section | PASS/FAIL |

### 13) Gate Outputs
- `pnpm lint`: PASS/FAIL
- `pnpm typecheck`: PASS/FAIL
- `pnpm test`: PASS/FAIL (N files, N tests)
- `pnpm openapi:generate`: PASS/FAIL
- `pnpm vitest run tests/unit/openapi-spec.test.ts`: PASS/FAIL
- `pnpm build`: PASS/FAIL

### 14) Risk Assessment and Rollback Readiness
- Known risks with mitigation
- Rollback readiness statement for C9

### 15) C9A Handoff Capsule
- C8 milestone status: `COMPLETE` / `INCOMPLETE`
- C9A readiness: `READY_FOR_C9A` / `BLOCKED`
- Blockers (if any): list with owner and remediation milestone
- Recommended next action: exact command/doc step for operator

---

## Acceptance Criteria

### P0 (blocks C9A entry)
- All UAT P0 scenarios (UAT-01 through UAT-07, UAT-09, UAT-10,
  UAT-12) have passing tests
- All edge-case P0 scenarios (EC-01 through EC-06) have passing
  tests
- GO/NO-GO readiness assessment shows CG-02 through CG-05 all `PASS`
- All 17 telemetry events have verified emission assertions in tests
- Money-movement telemetry events (`payout_failed`,
  `contribution_failed`) include `failure_code` property
- Journey tests assert correct telemetry event emission with
  required properties (host create, guest contribute, payout
  flows)
- Branding regression guard passes: `APP_NAME == "Gifta"`, no
  `"ChipIn"` in UI source (decision register D-009)
- Data validation checks pass (goal math, payout totals,
  charity allocation)
- Full regression suite passes with zero P0/P1 failures
- `pnpm build` succeeds without errors
- OpenAPI contract parity holds
- Full gate sequence passes (`pnpm lint`, `pnpm typecheck`,
  `pnpm test`, `pnpm openapi:generate`,
  `pnpm vitest run tests/unit/openapi-spec.test.ts`, `pnpm build`)
- C8 evidence status is `COMPLETE` and C9A handoff capsule is populated

### P1 (blocks rollout)
- All UAT P1 scenarios (UAT-08, UAT-11) have passing tests
- All edge-case P1 scenarios (EC-07, EC-08) have passing tests
- Telemetry required-property coverage verified for all events
  with specified properties
- Coverage thresholds met (60% lines/functions/branches/
  statements)
- Accessibility regression guard tests pass
- Device/viewport manual checklist produced for C9
- GO/NO-GO readiness assessment maps evidence to all pre-gates

### P2 (defer with waiver — log in evidence)
- Lighthouse performance audit (requires staging URL)
- Real-device manual viewport testing (C9 operational scope)
- Load testing with concurrent sessions (requires staging infra)
- Axe-core automated integration
- Runtime telemetry delivery verification (requires live
  environment)
- Web Vitals measurement (LCP, TTFB targets from NFR spec)

---

## Stop Conditions

- Any P0 gate failure → stop, fix, re-run
- Any required full-gate command fails (`lint`, `typecheck`, `test`,
  `openapi:generate`, openapi parity test, `build`) → STOP
- Any non-test source file modified (beyond blocker defect fix) →
  STOP (C8 is validation only)
- Any generated non-test source drift without blocker classification →
  STOP and mark C8 `INCOMPLETE`
- Schema or migration file touched → STOP
- Webhook handler modified → STOP
- Fee calculation logic modified → STOP
- API route logic changed → STOP
- User-facing copy changed → STOP
- UI component modified → STOP
- Money correctness defect found → STOP, document, fix minimally,
  record in evidence, re-run all gates
- Contract drift between OpenAPI and runtime → STOP (hard-stop
  per execution contract)
- Test count regression (total < Sub-step 0 baseline + new C8
  tests) → STOP,
  investigate
- Any env toggle left in non-default state after test → STOP,
  fix `afterEach` cleanup
- Any CG-02/03/04/05 status unresolved or `FAIL` at closeout → STOP
  and mark C8 `INCOMPLETE` (do not proceed to C9A)
- Blocker-severity defect fix exception: if a money-correctness,
  critical-journey, or severe a11y blocker is found, minimal
  non-test code changes are allowed. Record the defect + fix in
  evidence and re-run full gates before continuing.

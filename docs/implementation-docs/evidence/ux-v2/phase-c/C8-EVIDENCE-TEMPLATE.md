# C8 Evidence — E2E/UAT and Performance Sweep

Date: `YYYY-MM-DD`  
Milestone: `C8`  
Status: `COMPLETE | INCOMPLETE`  
C9A Readiness: `READY_FOR_C9A | BLOCKED`

## 1) Baseline Verification

- Baseline gate snapshot (before C8 changes):
  - `pnpm lint`: `PASS/FAIL`
  - `pnpm typecheck`: `PASS/FAIL`
  - `pnpm test`: `PASS/FAIL` (`N` files, `N` tests)
- Baseline test counts captured in C8 Sub-step 0:
  - Test files: `N`
  - Tests: `N`
- Baseline note(s):
  - `...`

## 2) UAT Scenario Results

| UAT ID | Scenario | Priority | Test File | Test Count | Status | Evidence |
|---|---|---|---|---|---|---|
| UAT-01 | Host create with Karri payout | P0 | `tests/e2e/uat-host-create.test.ts` | N | PASS/FAIL | link |
| UAT-02 | Host create with bank payout | P0 | `tests/e2e/uat-host-create.test.ts` | N | PASS/FAIL | link |
| UAT-03 | Host create with charity percentage split | P0 | `tests/e2e/uat-host-create.test.ts` | N | PASS/FAIL | link |
| UAT-04 | Host create with charity threshold split | P0 | `tests/e2e/uat-host-create.test.ts` | N | PASS/FAIL | link |
| UAT-05 | Contribute via PayFast | P0 | `tests/e2e/uat-guest-contribute.test.ts` | N | PASS/FAIL | link |
| UAT-06 | Contribute via Ozow | P0 | `tests/e2e/uat-guest-contribute.test.ts` | N | PASS/FAIL | link |
| UAT-07 | Contribute via SnapScan | P0 | `tests/e2e/uat-guest-contribute.test.ts` | N | PASS/FAIL | link |
| UAT-08 | Reminder request | P1 | `tests/e2e/uat-guest-contribute.test.ts` | N | PASS/FAIL | link |
| UAT-09 | Host dashboard progress/payout details | P0 | `tests/e2e/uat-dashboard-admin.test.ts` | N | PASS/FAIL | link |
| UAT-10 | Admin payout review flow | P0 | `tests/e2e/uat-dashboard-admin.test.ts` | N | PASS/FAIL | link |
| UAT-11 | Admin charity/report workflows | P1 | `tests/e2e/uat-dashboard-admin.test.ts` | N | PASS/FAIL | link |
| UAT-12 | Accessibility regression journey checks | P0 | `tests/e2e/uat-accessibility-regression.test.ts` | N | PASS/FAIL | link |

## 3) Edge-Case Results

| EC ID | Scenario | Priority | Test File | Status | Evidence |
|---|---|---|---|---|---|
| EC-01 | No contributions by close | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-02 | Duplicate contribution submit | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-03 | Payment provider timeout | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-04 | Reminder requested after close window | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-05 | Payout fails | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-06 | Charity disabled with stale charity fields | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-07 | Session expiry during create flow | P1 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |
| EC-08 | Missing optional media/assets | P1 | `tests/e2e/uat-edge-cases.test.ts` | PASS/FAIL | link |

## 4) Telemetry Instrumentation Audit

| Event | Assertion File(s) | Required Properties | Properties Present | Status | Evidence |
|---|---|---|---|---|---|
| `host_create_started` | `tests/e2e/uat-host-create.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `host_create_step_completed` | `tests/e2e/uat-host-create.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | `step` | YES/NO | PASS/FAIL | link |
| `host_create_failed` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `host_create_published` | `tests/e2e/uat-host-create.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | `dream_board_id`, `payout_method`, `charity_enabled` | YES/NO | PASS/FAIL | link |
| `guest_view_loaded` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `contribution_started` | `tests/e2e/uat-guest-contribute.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `contribution_redirect_started` | `tests/e2e/uat-guest-contribute.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `contribution_completed` | `tests/e2e/uat-guest-contribute.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | `dream_board_id`, `payment_provider`, `amount_cents` | YES/NO | PASS/FAIL | link |
| `contribution_failed` | `tests/e2e/uat-guest-contribute.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | `dream_board_id`, `failure_code` | YES/NO | PASS/FAIL | link |
| `reminder_requested` | `tests/e2e/uat-guest-contribute.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `payout_created` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `payout_processing_started` | `tests/e2e/uat-dashboard-admin.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `payout_completed` | `tests/e2e/uat-dashboard-admin.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | `payout_id`, `payout_type`, `amount_cents` | YES/NO | PASS/FAIL | link |
| `payout_failed` | `tests/e2e/uat-dashboard-admin.test.ts`, `tests/e2e/uat-telemetry-verification.test.ts` | `payout_id`, `failure_code` | YES/NO | PASS/FAIL | link |
| `charity_payout_created` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `reminder_dispatched` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |
| `reminder_failed` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS/FAIL | link |

## 5) Data Validation Results

- Goal progress math: `PASS/FAIL` (evidence: `...`)
- Payout totals: `PASS/FAIL` (evidence: `...`)
- Charity allocation: `PASS/FAIL` (evidence: `...`)
- Reminder bounds: `PASS/FAIL` (evidence: `...`)

## 6) Regression Sweep

- `pnpm lint`: `PASS/FAIL` (errors: `N`, warnings: `N`)
- `pnpm typecheck`: `PASS/FAIL`
- `pnpm test`: `PASS/FAIL` (`N` files, `N` tests)
- `pnpm test:coverage`: lines `N%`, functions `N%`, branches `N%`, statements `N%`
- `pnpm openapi:generate`: `PASS/FAIL`
- `pnpm vitest run tests/unit/openapi-spec.test.ts`: `PASS/FAIL`
- Test-count delta vs baseline: `+N` tests, `+N` files

## 7) Build and Performance

- `pnpm build`: `PASS/FAIL` (time: `Ns`)
- Bundle warnings (`>300kB` first-load JS): `NONE | list`
- Static performance checks:
  - guest routes server-rendered: `PASS/FAIL`
  - image optimization config: `PASS/FAIL`
  - App Router non-blocking fetch pattern: `PASS/FAIL`
- Deferred runtime NFR checks (staging/prod required):
  - LCP `< 2.5s`: `DEFERRED`
  - TTFB `< 300ms`: `DEFERRED`
  - API p95 `< 500ms`: `DEFERRED`

## 8) Accessibility Regression

- Skip-link assertions: `PASS/FAIL`
- Error boundaries: `PASS/FAIL`
- Loading states: `PASS/FAIL`
- ARIA assertions: `PASS/FAIL`
- Contrast regression: `PASS/FAIL`
- Touch target regression: `PASS/FAIL`

## 9) Device/Viewport Readiness

- Static responsive check: `PASS/FAIL`
- Manual viewport checklist status: `PENDING (for C9B)`

| Viewport | Class | Routes to Test | Status | Evidence |
|---|---|---|---|---|
| iPhone Safari (375x812) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) | link |
| Android Chrome (360x800) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) | link |
| Desktop Chrome (1440x900) | Desktop | All routes | PENDING (C9B) | link |
| Desktop Safari (1440x900) | Desktop | All routes | PENDING (C9B) | link |

## 10) New Test Inventory

| File | Test Count | Coverage Area |
|---|---|---|
| `tests/e2e/uat-host-create.test.ts` | N | UAT-01 through UAT-04 |
| `tests/e2e/uat-guest-contribute.test.ts` | N | UAT-05 through UAT-08 |
| `tests/e2e/uat-dashboard-admin.test.ts` | N | UAT-09 through UAT-11 |
| `tests/e2e/uat-edge-cases.test.ts` | N | EC-01 through EC-08 |
| `tests/e2e/uat-telemetry-verification.test.ts` | N | Telemetry catalog |
| `tests/e2e/uat-data-validation.test.ts` | N | Data correctness |
| `tests/e2e/uat-accessibility-regression.test.ts` | N | UAT-12 |

## 11) P2 Backlog / Waivers

- Lighthouse performance audit (staging URL required)
- Real-device viewport testing (manual, C9B)
- Load testing (staging infra required)
- Axe-core automated scanning
- Runtime telemetry delivery confirmation (live environment)
- Web Vitals runtime measurement (live environment)

## 12) GO/NO-GO Readiness Assessment

| Gate | Requirement | C8 Evidence | Status |
|---|---|---|---|
| CG-02 | Phase C P0 test gates pass | Sections `2`, `3`, `6`, `13` | PASS/FAIL |
| CG-03 | Phase C P1 test gates pass | Sections `2`, `3`, `6`, `13` | PASS/FAIL |
| CG-04 | UAT critical scenarios pass | Sections `2`, `3` | PASS/FAIL |
| CG-05 | Accessibility P0 checks pass | Section `8` | PASS/FAIL |

## 13) Gate Outputs

- `pnpm lint`: `PASS/FAIL`
- `pnpm typecheck`: `PASS/FAIL`
- `pnpm test`: `PASS/FAIL` (`N` files, `N` tests)
- `pnpm openapi:generate`: `PASS/FAIL`
- `pnpm vitest run tests/unit/openapi-spec.test.ts`: `PASS/FAIL`
- `pnpm build`: `PASS/FAIL`
- Drift check after gates:
  - Non-test source drift: `YES/NO`
  - Drift disposition: `BLOCKED | ACCEPTED BLOCKER FIX`

## 14) Risk Assessment and Rollback Readiness

Known risks:
1. `...`
2. `...`

Mitigations:
1. `...`
2. `...`

Rollback readiness statement for C9:
- `READY | NOT READY` with rationale.

## 15) C9A Handoff Capsule

- C8 milestone status: `COMPLETE | INCOMPLETE`
- C9A readiness: `READY_FOR_C9A | BLOCKED`

| Blocker | Severity | Owner | Remediation Milestone | Evidence |
|---|---|---|---|---|
| `...` | P0/P1 | Name | C8/C9 remediation | link |

Recommended next action:
- `...`

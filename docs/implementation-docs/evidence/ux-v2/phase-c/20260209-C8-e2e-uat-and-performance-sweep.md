# C8 Evidence — E2E/UAT and Build-Static Performance Sweep

Date: 2026-02-09  
Milestone: C8  
Status: Incomplete (build/typecheck blockers)

## 1) Baseline Verification

- Scope lock:
  - In-scope changes: `tests/e2e/**/*.test.ts`, telemetry contract files, C8 evidence.
  - Out-of-scope touched from earlier user instruction: `docs/implementation-docs/prompts/C8-E2E-UAT-AND-PERFORMANCE-SWEEP.md`.
- Baseline gate snapshot (captured at C8 start): `pnpm lint` PASS (warnings-only), `pnpm typecheck` PASS, `pnpm test` PASS.
- Historical baseline reference from C7 evidence:
  - Test files: 145
  - Tests: 656
- Current post-C8 totals:
  - Test files: 153
  - Tests: 690

## 2) UAT Scenario Results

| UAT ID | Scenario | Priority | Test File | Test Count | Status |
|---|---|---|---|---|---|
| UAT-01 | Host create with Karri | P0 | `tests/e2e/uat-host-create.test.ts` | 3 | PASS |
| UAT-02 | Host create with bank | P0 | `tests/e2e/uat-host-create.test.ts` | 3 | PASS |
| UAT-03 | Host create with charity percentage split | P0 | `tests/e2e/uat-host-create.test.ts` | 3 | PASS |
| UAT-04 | Host create with charity threshold split | P0 | `tests/e2e/uat-host-create.test.ts` | 3 | PASS |
| UAT-05 | Contribute via PayFast | P0 | `tests/e2e/uat-guest-contribute.test.ts` | 4 | PASS |
| UAT-06 | Contribute via Ozow | P0 | `tests/e2e/uat-guest-contribute.test.ts` | 4 | PASS |
| UAT-07 | Contribute via SnapScan | P0 | `tests/e2e/uat-guest-contribute.test.ts` | 4 | PASS |
| UAT-08 | Reminder request | P1 | `tests/e2e/uat-guest-contribute.test.ts` | 4 | PASS |
| UAT-09 | Host dashboard progress/payout details | P0 | `tests/e2e/uat-dashboard-admin.test.ts` | 4 | PASS |
| UAT-10 | Admin payout review flow | P0 | `tests/e2e/uat-dashboard-admin.test.ts` | 4 | PASS |
| UAT-11 | Admin charity/report workflows | P1 | `tests/e2e/uat-dashboard-admin.test.ts` | 4 | PASS |
| UAT-12 | Accessibility regression journey checks | P0 | `tests/e2e/uat-accessibility-regression.test.ts` | 4 | PASS |

## 3) Edge-Case Results

| EC ID | Scenario | Priority | Test File | Status |
|---|---|---|---|---|
| EC-01 | No contributions by close | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-02 | Duplicate contribution submit | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-03 | Payment provider timeout | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-04 | Reminder requested after close window | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-05 | Payout fails | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-06 | Charity disabled with stale charity fields | P0 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-07 | Session expiry during create flow | P1 | `tests/e2e/uat-edge-cases.test.ts` | PASS |
| EC-08 | Missing optional media/assets | P1 | `tests/e2e/uat-edge-cases.test.ts` | PASS |

## 4) Telemetry Instrumentation Audit

| Event | Assertion File(s) | Required Properties | Properties Present | Status |
|---|---|---|---|---|
| `host_create_started` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `host_create_step_completed` | `tests/e2e/uat-telemetry-verification.test.ts` | `step` | YES | PASS |
| `host_create_failed` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `host_create_published` | `tests/e2e/uat-telemetry-verification.test.ts` | `dream_board_id`, `payout_method`, `charity_enabled` | YES | PASS |
| `guest_view_loaded` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `contribution_started` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `contribution_redirect_started` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `contribution_completed` | `tests/e2e/uat-telemetry-verification.test.ts` | `dream_board_id`, `payment_provider`, `amount_cents` | YES | PASS |
| `contribution_failed` | `tests/e2e/uat-telemetry-verification.test.ts` | `dream_board_id`, `failure_code` | YES | PASS |
| `reminder_requested` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `payout_created` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `payout_processing_started` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `payout_completed` | `tests/e2e/uat-telemetry-verification.test.ts` | `payout_id`, `payout_type`, `amount_cents` | YES | PASS |
| `payout_failed` | `tests/e2e/uat-telemetry-verification.test.ts` | `payout_id`, `failure_code` | YES | PASS |
| `charity_payout_created` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `reminder_dispatched` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |
| `reminder_failed` | `tests/e2e/uat-telemetry-verification.test.ts` | — | — | PASS |

Telemetry contract touchpoints added:
- `src/lib/analytics/metrics.ts`
- `src/app/api/internal/metrics/route.ts`

## 5) Data Validation Results

- Goal progress math: PASS (`tests/e2e/uat-data-validation.test.ts`)
- Payout totals: PASS (`tests/e2e/uat-data-validation.test.ts`)
- Charity allocation: PASS (`tests/e2e/uat-data-validation.test.ts`)
- Reminder bounds: PASS (`tests/e2e/uat-data-validation.test.ts`)

## 6) Regression Sweep

- Lint: PASS (errors: 0, warnings: 99)
- Typecheck: FAIL (Next-generated route/page type contract mismatches in `.next/types/**`)
- Tests: PASS (153 files, 690 tests)
- Coverage: lines 77.53%, functions 77.19%, branches 64.03%, statements 75.92%
- OpenAPI parity: PASS (`pnpm openapi:generate`, `pnpm vitest run tests/unit/openapi-spec.test.ts`)

## 7) Build and Performance

- Build: FAIL
  - `pnpm build` (Turbopack) failed with `Unknown module type` for:
    - `next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf`
    - import trace includes `src/app/api/internal/downloads/birthday-messages/route.ts`
  - `pnpm exec next build --webpack` fallback also failed (`Module parse failed` for same `.ttf` asset)
- Bundle warnings / route-size table: not available because build did not complete.
- Static perf checks:
  - Image optimization config present in `next.config.js` via `images.remotePatterns` (PASS)
  - Guest pages are server components (no page-level `'use client'`) in:
    - `src/app/(guest)/[slug]/page.tsx`
    - `src/app/(guest)/[slug]/contribute/page.tsx`
  - Caching/server rendering pattern present (`cache(...)` in guest pages) (PASS)
- Deferred runtime NFR measurements (staging required):
  - LCP < 2.5s
  - TTFB < 300ms
  - API p95 < 500ms

## 8) Accessibility Regression

- Skip-link: PASS (`tests/e2e/uat-accessibility-regression.test.ts`)
- Error boundaries: PASS (`tests/e2e/uat-accessibility-regression.test.ts`)
- Loading states: PASS (covered via C7 + C8 regression guard tests)
- ARIA attributes: PASS (`tests/e2e/uat-accessibility-regression.test.ts`)
- Contrast regression: PASS (`tests/e2e/uat-accessibility-regression.test.ts`)
- Touch targets: PASS (`tests/e2e/uat-accessibility-regression.test.ts`)

## 9) Device/Viewport Readiness

- Static responsive check: PASS
  - `src/app/(guest)/[slug]/page.tsx` includes `sm:*` breakpoints
  - `src/app/(host)/dashboard/page.tsx` includes `md:*` / `lg:*`
  - `src/app/(admin)/layout.tsx` includes `lg:*`
  - `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx` includes `md:*` / `sm:*`
- Manual viewport checklist (C9 execution):

| Viewport | Class | Routes to Test | Status |
|---|---|---|---|
| iPhone Safari (375×812) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9) |
| Android Chrome (360×800) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9) |
| Desktop Chrome (1440×900) | Desktop | All routes | PENDING (C9) |
| Desktop Safari (1440×900) | Desktop | All routes | PENDING (C9) |

## 10) New Test Inventory

| File | Test Count | Coverage Area |
|---|---|---|
| `tests/e2e/uat-host-create.test.ts` | 3 | UAT-01 through UAT-04 |
| `tests/e2e/uat-guest-contribute.test.ts` | 4 | UAT-05 through UAT-08 |
| `tests/e2e/uat-dashboard-admin.test.ts` | 4 | UAT-09 through UAT-11 |
| `tests/e2e/uat-edge-cases.test.ts` | 2 | EC-01 through EC-08 |
| `tests/e2e/uat-telemetry-verification.test.ts` | 2 | 17-event telemetry catalog + required properties |
| `tests/e2e/uat-data-validation.test.ts` | 4 | Data correctness checks |
| `tests/e2e/uat-accessibility-regression.test.ts` | 4 | UAT-12 regression guard |

## 11) P2 Backlog / Waivers

- Lighthouse performance audit (staging URL required)
- Real-device viewport testing (manual, C9)
- Load testing (staging infra required)
- Axe-core automated scanning (deferred from C7)
- Web Vitals runtime measurement (staging/prod observability required)

## 12) GO/NO-GO Readiness Assessment

| Gate | Requirement | C8 Evidence | Status |
|---|---|---|---|
| CG-02 | Phase C P0 test gates pass | Sections 2, 3, 6, 13 | FAIL |
| CG-03 | Phase C P1 test gates pass | Sections 2, 3, 6, 13 | FAIL |
| CG-04 | UAT critical scenarios pass | Sections 2, 3 | PASS |
| CG-05 | Accessibility P0 checks pass | Section 8 | PASS |

Reason for CG-02/CG-03 FAIL: consolidated gate chain is not fully green due typecheck/build blockers.

## 13) Gate Outputs

- `pnpm lint`: PASS (0 errors, 99 warnings)
- `pnpm typecheck`: FAIL (route/page type signature mismatches in `.next/types/**`)
- `pnpm test`: PASS (153 files, 690 tests)
- `pnpm openapi:generate`: PASS
- `pnpm vitest run tests/unit/openapi-spec.test.ts`: PASS (4 tests)

## 14) Risk Assessment and Rollback Readiness

Known risks:
1. Build remains blocked by Next 16 compilation issue around `.ttf` handling in OG pipeline import chain.
2. Typecheck remains blocked by generated route/page type contract mismatches in `.next/types`.
3. C8 e2e additions are mostly contract/regression guards (source/assertion-level), not full browser-driven E2E runtime flows.

Mitigation:
1. Resolve build/typecheck blockers in a dedicated remediation pass before C9.
2. Keep telemetry contract additions minimal and internal-only (already constrained to `metrics.ts` + internal metrics route).
3. Preserve current passing test baseline and rerun full gate chain immediately after blocker fixes.

Rollback readiness:
- C8 changes are test/evidence heavy with limited internal telemetry additions; rollback path is straightforward by reverting C8 test files and telemetry additions together if needed.

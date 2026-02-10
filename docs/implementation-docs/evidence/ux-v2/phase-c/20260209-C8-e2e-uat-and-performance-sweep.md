# C8 Evidence — E2E/UAT and Build-Static Performance Sweep

Date: 2026-02-09  
Milestone: C8  
Status: COMPLETE
C9A Readiness: READY_FOR_C9A

## 1) Baseline Verification

- Scope lock:
  - In-scope changes:
    - `tests/e2e/**/*.test.ts`
    - telemetry contract files
    - C8 evidence docs
    - blocker-fix exception files:
      - `package.json` (build gate switched to webpack; turbopack diagnostic script added)
      - `src/app/layout.tsx` (removed `next/font/google` runtime fetch dependency)
      - `src/app/api/internal/downloads/birthday-messages/route.ts` (font path load fix for build)
  - Prompt/docs updates made during C8 remediation:
    - `docs/implementation-docs/prompts/C8-E2E-UAT-AND-PERFORMANCE-SWEEP.md`
    - `docs/implementation-docs/prompts/C9-PRODUCTION-ROLLOUT.md`
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
- Typecheck: PASS
- Tests: PASS (153 files, 690 tests)
- Coverage: lines 78.94%, functions 79.37%, branches 65.67%, statements 77.26%
- OpenAPI parity: PASS (`pnpm openapi:generate`, `pnpm vitest run tests/unit/openapi-spec.test.ts`)

## 7) Build and Performance

- Build: PASS
  - Gate build command now runs webpack path: `pnpm build` -> `next build --webpack`
  - Turbopack remains available as diagnostic-only path: `pnpm build:turbopack`
  - Build warnings observed (non-blocking):
    - optional OpenTelemetry exporter modules unresolved (`@opentelemetry/exporter-jaeger`, `@opentelemetry/winston-transport`)
    - `metadataBase` warning in Next metadata
- Bundle warnings / route-size table: captured in successful build output.
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
- Manual viewport checklist (C9B execution):

| Viewport | Class | Routes to Test | Status |
|---|---|---|---|
| iPhone Safari (375×812) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) |
| Android Chrome (360×800) | Mobile | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) |
| Desktop Chrome (1440×900) | Desktop | All routes | PENDING (C9B) |
| Desktop Safari (1440×900) | Desktop | All routes | PENDING (C9B) |

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
- Real-device viewport testing (manual, C9B)
- Load testing (staging infra required)
- Axe-core automated scanning (deferred from C7)
- Web Vitals runtime measurement (staging/prod observability required)

## 12) GO/NO-GO Readiness Assessment

| Gate | Requirement | C8 Evidence | Status |
|---|---|---|---|
| CG-02 | Phase C P0 test gates pass | Sections 2, 3, 6, 13 | PASS |
| CG-03 | Phase C P1 test gates pass | Sections 2, 3, 6, 13 | PASS |
| CG-04 | UAT critical scenarios pass | Sections 2, 3 | PASS |
| CG-05 | Accessibility P0 checks pass | Section 8 | PASS |

Reason for CG-02/CG-03 PASS: consolidated gate chain is fully green after blocker remediation.

## 13) Gate Outputs

- `pnpm lint`: PASS (0 errors, 99 warnings)
- `pnpm typecheck`: PASS
- `pnpm test`: PASS (153 files, 690 tests)
- `pnpm openapi:generate`: PASS
- `pnpm vitest run tests/unit/openapi-spec.test.ts`: PASS (4 tests)
- `pnpm build`: PASS (`next build --webpack`)

## 14) Risk Assessment and Rollback Readiness

Known risks:
1. Turbopack build path remains unstable in this environment (`creating new process` / `binding to a port` / `Operation not permitted` panic class observed during diagnostics).
2. Build emits non-blocking warnings for optional OpenTelemetry exporters and metadataBase configuration.
3. Real-device viewport execution remains deferred to C9B (manual live verification).

Mitigation:
1. Keep release gate on webpack build path (`pnpm build`) until Turbopack environment constraints are lifted.
2. Treat OpenTelemetry optional-module warnings as follow-up hardening items; not release blockers.
3. Execute C9B device matrix and telemetry continuity checks during live rollout.

Rollback readiness:
- C8 includes deterministic remediation and validated gates; rollback remains straightforward by reverting C8 code/docs bundle if a regression appears in C9A/C9B.

## 15) C9A Handoff Capsule

- C8 milestone status: `COMPLETE`
- C9A readiness: `READY_FOR_C9A`
- Blockers: none
- Recommended next action: execute C9A sub-step 0 onward in `docs/implementation-docs/prompts/C9-PRODUCTION-ROLLOUT.md`.

# C7 Evidence — Accessibility and Edge Cases

Date: 2026-02-09
Milestone: C7
Status: Complete (P0/P1 gates passed)

## 1) Changed File Inventory

### New files
- `src/components/ui/ErrorFallback.tsx`
- `src/app/error.tsx`
- `src/app/(guest)/error.tsx`
- `src/app/(host)/error.tsx`
- `src/app/(admin)/error.tsx`
- `src/app/not-found.tsx`
- `src/app/(guest)/[slug]/loading.tsx`
- `src/app/(host)/dashboard/loading.tsx`
- `src/app/(admin)/admin/loading.tsx`
- `tests/unit/accessibility.test.tsx`
- `tests/unit/colour-contrast.test.ts`

### Modified files (C7 scope)
- `src/app/layout.tsx`
- `src/app/(guest)/layout.tsx`
- `src/app/(host)/layout.tsx`
- `src/app/(admin)/layout.tsx`
- `src/app/(marketing)/layout.tsx`
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`
- `src/app/demo/payment-simulator/page.tsx`
- `src/app/(guest)/[slug]/page.tsx`
- `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx`
- `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx`
- `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx`
- `src/app/(guest)/[slug]/thanks/ThankYouClient.tsx`
- `src/app/(guest)/dev/icon-picker/page.tsx`
- `src/components/contribute/ReminderModal.tsx`
- `src/components/admin/CharityFormModal.tsx`
- `src/components/landing/LandingNav.tsx`
- `src/components/forms/AmountSelector.tsx`
- `src/components/layout/Header.tsx`
- `src/components/admin/AdminPagination.tsx`
- `src/components/forms/ContributionFormParts.tsx`
- `src/components/ui/button.tsx`
- `src/components/landing/LandingCTA.tsx`
- `src/components/landing/LandingPage.tsx`
- `src/components/dream-board/ReturnVisitBanner.tsx`
- `src/components/dream-board/ContributorList.tsx`
- `src/components/dream-board/ProgressBar.tsx`
- `src/components/gift/GiftSelectionCard.tsx`
- `src/components/admin/AdminDataTable.tsx`
- `src/app/(host)/create/review/ReviewClient.tsx`
- `src/app/(host)/dashboard/page.tsx`
- `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`
- `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx`
- `src/app/(admin)/admin/payouts/[id]/page.tsx`
- `tests/unit/button.test.tsx`
- `tests/unit/progress-bar.test.tsx`

## 2) UX A11y Checklist (Spec Mapping)

| Requirement | Status | Evidence |
|---|---|---|
| Skip-to-content | PASS | Skip link in `src/app/layout.tsx`; per-route `id="main-content"` targets in layouts/pages |
| Form labels | PASS | `aria-label="Custom amount"` added in `src/components/forms/AmountSelector.tsx` |
| Dialog labelling | PASS | `aria-label="Navigation menu"` on landing dialog in `src/components/landing/LandingNav.tsx` |
| Error announcements | PASS | `role="alert"` in reminder + charity modal error text |
| Touch targets >=44px | PASS | Header/Landing hamburger, icon buttons, pagination controls, copy reference button |
| Error boundaries | PASS (critical routes) | `src/app/error.tsx`, `src/app/(guest)/error.tsx`, `src/app/(host)/error.tsx`, `src/app/(admin)/error.tsx` |
| Custom 404 | PASS | `src/app/not-found.tsx` |
| Loading states | PASS (critical routes) | guest slug, host dashboard, admin dashboard loading skeletons |
| Noscript fallback | PASS | `<noscript>` warning in `src/app/layout.tsx` |
| Overflow hardening | PASS | Added wrapping safeguards in guest board, host detail, contributor list, admin table |

## 3) Error/Loading Coverage Matrix

| Route group | error.tsx | loading.tsx | Status |
|---|---|---|---|
| Root | `src/app/error.tsx` | n/a | PASS |
| Guest | `src/app/(guest)/error.tsx` | `src/app/(guest)/[slug]/loading.tsx` | PASS |
| Host | `src/app/(host)/error.tsx` | `src/app/(host)/dashboard/loading.tsx` | PASS |
| Admin | `src/app/(admin)/error.tsx` | `src/app/(admin)/admin/loading.tsx` | PASS |
| Marketing | deferred | deferred | P2 |
| Auth | deferred | deferred | P2 |

## 4) Touch Target Audit

| Element | Before | After | File |
|---|---|---|---|
| Button icon size variant | `h-10 w-10` | `h-11 w-11` | `src/components/ui/button.tsx` |
| Header hamburger | ~40x40 | min 44x44 | `src/components/layout/Header.tsx` |
| Landing hamburger | ~40x40 | min 44x44 | `src/components/landing/LandingNav.tsx` |
| Admin pagination controls | `py-1.5` compact | `min-h-[44px]` + `py-2.5` | `src/components/admin/AdminPagination.tsx` |
| SnapScan reference copy | ~28x28 | `min-h-[44px] min-w-[44px]` | `src/components/forms/ContributionFormParts.tsx` |

## 5) Colour Contrast Audit

| Pair | Before | After | Result |
|---|---:|---:|---|
| `#777777` on `#FFFCF9` | 4.38:1 | `#757575` on `#FFFCF9` = 4.51:1 | PASS |
| Landing CTA (white on `#6B9E88`) | 3.06:1 | white on `#0F766E` = 5.47:1 | PASS |
| Landing CTA (white on `#5A8E78`) | 3.77:1 | white on `#115E59` = 7.58:1 | PASS |
| Primary button start (white on `#0D9488`) | 3.74:1 | white on `#0F766E` = 5.47:1 | PASS |
| Primary button end | 5.47:1 | white on `#115E59` = 7.58:1 | PASS |
| Secondary button start (white on `#F97316`) | 2.80:1 | white on `#C2410C` = 5.18:1 | PASS |
| Secondary button end (white on `#EA580C`) | 3.56:1 | white on `#9A3412` = 7.31:1 | PASS |
| Body text `text-primary` on white | 3.74:1 | `text-primary-700` on white = 5.47:1 | PASS |

## 6) `text-primary` Usage Scan (Normal-size on Light BG)

| File | Context | Action |
|---|---|---|
| `src/app/(host)/create/review/ReviewClient.tsx` | edit links | switched to `text-primary-700` |
| `src/components/forms/ContributionFormParts.tsx` | copy/open links | switched to `text-primary-700` |
| `src/components/forms/AmountSelector.tsx` | selected values | switched to `text-primary-700` |
| `src/app/(host)/dashboard/page.tsx` | card CTA text | switched to `text-primary-700` |
| `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx` | navigation/action links | switched to `text-primary-700` |
| `src/components/landing/LandingNav.tsx` | desktop nav muted text + CTA gradients | remediated |
| `src/components/ui/button.tsx` | primary/secondary gradients and link variant | remediated |

Large-display heading exception retained:
- `src/app/(host)/create/review/ReviewClient.tsx` published heading (`text-4xl text-primary`) remains compliant under 3:1 large-text threshold.

## 7) `text-text-muted` Usage Scan

Token status:
- `text-text-muted` (`#A8A29E`) on `#FEFDFB` remains 2.48:1.

C7 treatment:
- No global token change in C7 (locked design-system boundary).
- Essential normal-size primary-action text was remediated via targeted `text-primary-700` and gradient updates.
- Remaining muted-token design-system remediation deferred to P2.

## 8) Gate Outputs

Commands executed:
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

Results:
- `pnpm lint`: PASS (0 errors, warnings unchanged baseline)
- `pnpm typecheck`: PASS
- `pnpm test`: PASS (`145` files, `656` tests)

## 9) Test Count Breakdown

- Total test files: 145
- Total tests: 656
- New C7 test files: 2
- New C7 tests: 9
  - `tests/unit/accessibility.test.tsx` (5)
  - `tests/unit/colour-contrast.test.ts` (4)

## 10) P2 Backlog / Waivers

Deferred items (explicit):
1. Marketing/auth route-group error boundaries and loading files.
2. Remaining leaf-route `error.tsx`/`loading.tsx` coverage outside critical paths.
3. Global `text-text-muted` token redesign pass.
4. Full Lighthouse accessibility >= 95 gate.
5. Axe-core automation integration.
6. High-contrast mode support.

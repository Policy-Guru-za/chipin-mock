# 20260208-C4 Host Dashboard Expansion

## 1) Summary
Milestone C4 implemented.

Delivered host dashboard expansion across list/detail/post-campaign surfaces, host edit flow, internal download routes, middleware alignment, and new test coverage.

Locked behaviors implemented:
- Download route auth semantics: explicit `401` (unauth), `404` (board missing), `403` (wrong host).
- Date-only edit flow validation using `parseDateOnly` and forward-only constraints.
- Dashboard routing split: `closed|paid_out` render post-campaign; `funded` remains active/editable.
- Financial math alignment: raised totals from completed contributions and payout math `raised - fee - charity`.
- Middleware matcher includes `/api/internal/downloads(.*)` so route handlers can return explicit auth codes.

## 2) Scope Delivered
Created:
- `src/lib/host/queries.ts`
- `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`
- `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx`
- `src/app/(host)/dashboard/[id]/actions.ts`
- `src/app/api/internal/downloads/birthday-messages/route.ts`
- `src/app/api/internal/downloads/contributor-list/route.ts`
- `src/components/host/EditDreamBoardModal.tsx`
- `tests/unit/dashboard-list.test.tsx`
- `tests/unit/dashboard-detail.test.tsx`
- `tests/unit/dashboard-post-campaign.test.tsx`
- `tests/unit/dashboard-edit-modal.test.tsx`
- `tests/unit/dashboard-downloads.test.ts`
- `tests/integration/dashboard-host-flow.test.tsx`
- `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C4-host-dashboard-expansion.md`

Modified:
- `src/app/(host)/dashboard/page.tsx`
- `src/app/(host)/dashboard/[id]/page.tsx`
- `src/lib/host/dashboard-view-model.ts`
- `middleware.ts`
- `tests/unit/host-dashboard-view-model.test.ts`
- `tests/unit/middleware-public-routes.test.ts`

## 3) Test Coverage Added
- View-model rules: status mapping, percentage cap, time label variants, financial breakdown, funded/editable semantics.
- List page rendering: card/link/CTA and empty state.
- Detail route orchestration: active vs post-campaign component split.
- Post-campaign client: download button visibility and contributor CSV trigger.
- Edit modal: no-change disable, escape-close reset, date-forward validation, submit payload.
- Download API routes: `401/403/404`, PDF/CSV headers, CSV escaping.
- Integration flow: list-to-detail linkage, totals rendering, post-campaign download visibility.

## 4) Gate Results
Commands run (contract order):
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm openapi:generate`
- `pnpm test tests/unit/openapi-spec.test.ts`

Results:
- `pnpm lint`: pass, 0 errors, warnings present (existing repo-wide complexity/max-lines policy warnings).
- `pnpm typecheck`: pass.
- `pnpm test`: pass (`132` files, `598` tests).
- `pnpm openapi:generate`: pass; wrote `public/v1/openapi.json`.
- `pnpm test tests/unit/openapi-spec.test.ts`: pass (`4` tests).

## 5) Deviation / Environment Constraint
- Planned PDF stack was `pdf-lib`. Installing dependency failed in this environment:
  - `pnpm add pdf-lib` -> `ERR_PNPM_META_FETCH_FAIL` (`ENOTFOUND registry.npmjs.org`) and store mismatch warning.
- Implemented birthday-message PDF route with dynamic `pdf-lib` import path plus deterministic built-in PDF fallback so downloads function without dependency install.

## 6) Outcome
C4 host dashboard expansion is functionally implemented with passing contract gates and added regression coverage for routing, auth semantics, financial math, modal behavior, and download exports.

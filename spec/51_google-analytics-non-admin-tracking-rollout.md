# 51_google-analytics-non-admin-tracking-rollout

## Objective

- Add Google Analytics 4 to Gifta's non-admin web surfaces so the homepage, public Dreamboard journey, and host-authenticated journey emit safe pageview data plus a small set of host funnel events without leaking PII through raw paths, titles, or event payloads.

## In Scope

- Non-admin Google Analytics tag installation for marketing, guest, host, and auth pages
- Manual sanitized GA4 pageview tracking for App Router navigations
- Safe route/title normalization for dynamic Dreamboard and dashboard URLs
- A minimal host funnel event bridge for create-start, publish, and share actions
- Regression coverage for route exclusion, sanitization, and analytics wiring
- Full-path spec/progress/napkin updates required for this rollout

## Out Of Scope

- Admin analytics
- Consent mode implementation or cookie-banner UX
- Payment/contribution revenue analytics beyond the approved host funnel slice
- Google Tag Manager migration
- Search Console or SEO changes unrelated to GA instrumentation

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/app/layout.tsx`](../src/app/layout.tsx)
- `../src/app/(marketing)/layout.tsx`
- `../src/app/(guest)/layout.tsx`
- `../src/app/(host)/layout.tsx`
- [`../src/app/sign-in/[[...sign-in]]/page.tsx`](../src/app/sign-in/[[...sign-in]]/page.tsx)
- [`../src/app/sign-up/[[...sign-up]]/page.tsx`](../src/app/sign-up/[[...sign-up]]/page.tsx)
- `../src/app/(host)/create/review/ReviewClient.tsx`
- [`../src/components/create-review/ShareActionsPanel.tsx`](../src/components/create-review/ShareActionsPanel.tsx)
- Google Analytics pageview guidance: disable automatic `page_view` measurement when manual SPA pageviews are needed
- Google Analytics privacy guidance: page URLs/titles must not send PII

## Stage Plan

1. Stage 1 — Create the GA helper/component layer, disable automatic pageviews, and sanitize non-admin route/page-title reporting before mounting it on the approved layouts/pages.
2. Stage 2 — Wire the approved host funnel events (`host_create_started`, `host_create_published`, `share_link_clicked`) through a safe allowlist that strips IDs, slugs, names, emails, and query-string data.
3. Stage 3 — Add regression coverage, run the full verification gate, dogfood the non-admin surfaces locally, and close the spec with progress/napkin proof.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm docs:audit`
- localhost verification that the tag appears on `/`, `/sign-in`, `/create/child`, and `/dashboard`, is absent on `/admin`, and reports sanitized route templates instead of raw slugs/IDs/query params

## Exit Criteria

- The Google tag is installed once on all approved non-admin surfaces and excluded from admin routes.
- Automatic GA pageviews are disabled, and manual pageviews send sanitized route templates and generic safe titles.
- Dreamboard slugs, dashboard IDs, child names, emails, payment refs, and redirect query params are not forwarded to GA in pageviews or event payloads.
- The approved host funnel events fire with safe payloads only.
- Regression coverage plus local dogfood prove the contract before the spec is marked done.
- [`../progress.md`](../progress.md) records the active row, final green commands, dogfood evidence, and napkin evidence when the spec closes.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Shipped GA4 to the approved non-admin surfaces through a reusable tag component, disabled automatic pageviews, normalized dynamic routes/titles before sending pageviews, and wired the approved host funnel events with a strict safe-parameter allowlist.

## Stage Status

- Stage 1 complete: added `src/lib/analytics/google.ts` plus `src/components/analytics/GoogleAnalyticsTag.tsx`, mounted the tag on marketing/guest/host/auth surfaces, and locked the route-exclusion/sanitization contract with `tests/unit/google-analytics.test.ts` and `tests/unit/google-analytics-layout-wiring.test.ts`.
- Stage 2 complete: wired `host_create_started` from `src/app/(host)/create/child/ChildStepForm.tsx`, `host_create_published` from `src/app/(host)/create/review/ReviewClient.tsx`, and `share_link_clicked` from `src/components/create-review/ShareActionsPanel.tsx`, then added regression coverage in the updated child/review/share unit suites.
- Stage 3 complete: ran `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit -- --sync`, and `pnpm docs:audit`; attempted localhost dogfood with `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CRK4NXDF7J pnpm dev --hostname 127.0.0.1 --port 3002`, and recorded the browserless Clerk `dev-browser-missing` blocker after the direct `/` fetch.

## Dogfood Notes

- Local source-level and unit proof confirms the GA tag is wired into the approved non-admin layouts/pages and excluded from admin routes.
- Browserless localhost dogfood was attempted via `curl http://127.0.0.1:3002/` after starting `pnpm dev` with `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CRK4NXDF7J`, but the request still hit Clerk's existing `x-clerk-auth-reason: dev-browser-missing` middleware block in development, so final runtime proof fell back to the new sanitizer/wiring regression coverage plus the documented attempted fetch evidence.

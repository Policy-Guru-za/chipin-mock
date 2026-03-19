# 43_public-landing-responsiveness-audit

## Objective

- Audit the current public landing and guest-entry surfaces for responsive suitability across desktop, iPad, and mobile-phone form factors, then produce a severity-ranked remediation plan without changing runtime code in the audit pass.

## In Scope

- Public marketing landing surface at `../src/app/(marketing)/page.tsx` and its live shell/components in [`../src/components/landing/LandingPage.tsx`](../src/components/landing/LandingPage.tsx), [`../src/components/landing/LandingNav.tsx`](../src/components/landing/LandingNav.tsx), and [`../src/components/landing-exact/`](../src/components/landing-exact/).
- Public guest-entry routes under `../src/app/(guest)/[slug]/` including the main Dreamboard page, contribute flow, payment step, thank-you page, and payment-failed page.
- Public auth entry routes (`/sign-in`, `/sign-up`, `/auth/*`) for viewport and handoff assessment when they are user-facing in the local environment.
- Responsive shell review of shared guest layout components such as [`../src/components/layout/Header.tsx`](../src/components/layout/Header.tsx), [`../src/components/layout/MobileNav.tsx`](../src/components/layout/MobileNav.tsx), and [`../src/components/layout/Footer.tsx`](../src/components/layout/Footer.tsx).
- Screenshot evidence, route-by-route scorecard notes, and a remediation plan captured in this spec and the standard execution artifacts.

## Out Of Scope

- Any runtime copy, layout, style, or behavior fixes during the initial audit pass.
- Host/admin routes, internal tooling routes, or demo-only pages that are not part of the approved public-surface scope.
- Third-party vendor internals beyond noting public auth handoff/responsiveness issues that Gifta cannot directly fix in this repo.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../docs/napkin/napkin.md`](../docs/napkin/napkin.md)
- `../src/app/(marketing)/page.tsx`
- `../src/app/(guest)/layout.tsx`
- `../src/app/(guest)/[slug]/page.tsx`
- `../src/app/(guest)/[slug]/contribute/page.tsx`
- `../src/app/(guest)/[slug]/contribute/payment/page.tsx`
- `../src/app/(guest)/[slug]/thanks/page.tsx`
- `../src/app/(guest)/[slug]/payment-failed/page.tsx`
- [`../src/components/landing/LandingChrome.module.css`](../src/components/landing/LandingChrome.module.css)
- [`../src/components/landing-exact/LandingHeroExact.module.css`](../src/components/landing-exact/LandingHeroExact.module.css)
- [`../src/components/landing-exact/LandingTimelineExact.module.css`](../src/components/landing-exact/LandingTimelineExact.module.css)
- [`../src/components/landing-exact/LandingVoucherBandExact.module.css`](../src/components/landing-exact/LandingVoucherBandExact.module.css)

## Stage Plan

1. Stage 1 — Register the full-path audit, inventory the in-scope public routes and responsive shells, and lock the device + breakpoint matrix for inspection.
2. Stage 2 — Dogfood each in-scope route across desktop, iPad portrait/landscape, and mobile portrait/landscape, while checking breakpoint seams around `1100`, `1024`, `920`, `768`, `480`, and `375`.
3. Stage 3 — Consolidate the evidence into a route-by-route scorecard, severity-ranked findings list, and implementation-ready remediation plan, then close the spec with execution-artifact verification.

## Test Gate

- `pnpm docs:audit`
- Localhost browser dogfood covering `/`, a live public Dreamboard slug, its contribute/payment/thanks/payment-failed routes, and public auth entry routes when they render in the local environment.
- Screenshot evidence for desktop, iPad portrait/landscape, and mobile portrait/landscape states on each in-scope public surface.

## Exit Criteria

- Every in-scope public route has been assessed against the approved form factors and breakpoint seam checks.
- Findings clearly identify layout, overflow, navigation, typography, CTA, image/card scaling, form-viewport, and footer stability issues by route/device.
- The spec records a severity-ranked remediation plan with likely owning files/components so a follow-on implementation pass can start immediately.
- [`../progress.md`](../progress.md) and [`./00_overview.md`](./00_overview.md) reflect the audit session accurately, and `## Napkin Evidence` notes any durable learning before closure.

## Route Scorecard

| Route / Surface | Live Status | Responsive Assessment | Evidence |
| --- | --- | --- | --- |
| `/` marketing landing | Live | No horizontal overflow observed at `1440x900`, `820x1180`, `1180x820`, `390x844`, or `844x390`. Hero and payout band stay readable; the timeline needs in-view capture because its step cards are reveal-on-scroll rather than always visible in full-page screenshots. | `output/spec43-responsive/home-*.png`, `output/spec43-responsive/home-timeline-*.png`, `output/spec43-responsive/home-mobile-menu-open.png`, `output/spec43-responsive/home-ipad-menu-open.png`, `output/spec43-responsive/home-seam-980.png`, `output/spec43-responsive/home-seam-1030.png` |
| `/sign-in`, `/sign-up` | Live | Clerk auth cards fit cleanly on desktop and mobile with no clipping or overflow, but the mobile inputs/buttons render at roughly `30px` height, below a comfortable touch-target floor. | `output/spec43-responsive/signin-*.png`, `output/spec43-responsive/signup-*.png` |
| `/{slug}` public Dreamboard + downstream guest entry routes | Blocked live | The real guest content could not be audited because the current local runtime throws `DATABASE_URL is not set`, sending every DB-backed guest route into the shared guest error boundary. The fallback error state itself stays centered and unclipped across desktop, iPad, and mobile. | `output/spec43-responsive/board-*.png`, `output/spec43-responsive/contribute-*.png`, `output/spec43-responsive/guest-mobile-menu-open.png`, browser console trace from `/maya-birthday-demo` |

## Findings

1. **Critical — guest public routes are blocked before responsive content can be audited live.**
   - **Why it matters:** The main public Dreamboard page and its downstream contribution/checkout routes currently collapse into the guest error boundary, so there is no trustworthy live responsive sign-off for the actual guest journey.
   - **Evidence:** Opening `/maya-birthday-demo` in the browser console logs `Error: DATABASE_URL is not set`; the same DB-backed dependency pattern exists in `../src/app/(guest)/[slug]/page.tsx`, `../src/app/(guest)/[slug]/contribute/page.tsx`, `../src/app/(guest)/[slug]/contribute/payment/page.tsx`, `../src/app/(guest)/[slug]/thanks/page.tsx`, and `../src/app/(guest)/[slug]/payment-failed/page.tsx`.
   - **Likely owners:** guest route loaders and local runtime/env setup for DB-backed public pages.

2. **Medium — public breakpoint contracts diverge across the marketing and guest shells.**
   - **Why it matters:** The marketing shell keeps the hamburger/nav split at `1024px` while the exact-homepage content shifts at `920px` and `1100px`; the shared guest header flips to desktop nav at `768px`, and the guest board layout itself flips to a two-column/sticky rail at `840px`. The result is noticeably different navigation models on the same class of device: for example, the homepage uses a hamburger on iPad portrait while the guest shell already shows desktop nav buttons.
   - **Evidence:** [`../src/components/landing/LandingNav.tsx`](../src/components/landing/LandingNav.tsx) (`window.matchMedia('(min-width: 1024px)')`, `lg:flex`, `lg:hidden`), [`../src/components/landing/LandingChrome.module.css`](../src/components/landing/LandingChrome.module.css) (`1100px`, `480px`, `375px` nav offsets), [`../src/components/landing-exact/LandingHeroExact.module.css`](../src/components/landing-exact/LandingHeroExact.module.css) (`1100px`, `920px`, `768px`, `480px`, `375px`), [`../src/components/layout/Header.tsx`](../src/components/layout/Header.tsx) (`md:flex`, `md:hidden`), and `../src/app/(guest)/[slug]/page.tsx` (`min-[840px]` grid/sticky rail).
   - **Likely owners:** [`../src/components/landing/LandingNav.tsx`](../src/components/landing/LandingNav.tsx), [`../src/components/landing/LandingChrome.module.css`](../src/components/landing/LandingChrome.module.css), [`../src/components/layout/Header.tsx`](../src/components/layout/Header.tsx), [`../src/components/layout/MobileNav.tsx`](../src/components/layout/MobileNav.tsx), and the guest board page layout.

3. **Low — the homepage hamburger hit area is undersized on phones.**
   - **Why it matters:** At `390px` wide, the marketing hamburger button measures about `40x32`, which is below the common `44x44` touch-target guidance and noticeably smaller than the guest shell's mobile menu button.
   - **Evidence:** [`../src/components/landing/LandingNav.tsx`](../src/components/landing/LandingNav.tsx) uses `p-2` without a min-width/min-height on the hamburger button, while [`../src/components/layout/Header.tsx`](../src/components/layout/Header.tsx) explicitly uses `min-h-[44px] min-w-[44px]` for the guest-shell toggle.

4. **Low — the homepage footer's legal/contact links are visually and interactively small on mobile.**
   - **Why it matters:** The exact-homepage footer links render at `13px` with no extra touch padding, which leaves a roughly `20px`-tall target on phones.
   - **Evidence:** [`../src/components/landing-exact/LandingFooterExact.tsx`](../src/components/landing-exact/LandingFooterExact.tsx) renders inline footer links, and [`../src/components/landing-exact/LandingFooterExact.module.css`](../src/components/landing-exact/LandingFooterExact.module.css) sets `.footerLinks` to `font-size: 13px` with tight spacing/padding.

5. **Low — mobile Clerk auth controls are undersized even though the auth shell itself fits.**
   - **Why it matters:** The sign-in/sign-up cards center cleanly on `390px` mobile, but the actual Clerk-rendered Google button, email field, continue button, and password visibility control are smaller than ideal touch targets.
   - **Evidence:** Live mobile auth screenshots plus mobile metrics show the primary Clerk controls landing at about `30px` height. The local route wrappers in [`../src/app/sign-in/[[...sign-in]]/page.tsx`](../src/app/sign-in/[[...sign-in]]/page.tsx) and [`../src/app/sign-up/[[...sign-up]]/page.tsx`](../src/app/sign-up/[[...sign-up]]/page.tsx) only center the Clerk widgets; any sizing fix likely needs Clerk appearance/theme overrides rather than wrapper layout changes alone.

## Supporting Source Notes

- Even though the DB block prevented live guest-content screenshots, the downstream guest client components already show sane responsive intent in source:
  - `../src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx` uses a `grid-cols-2` amount grid that expands to `md:grid-cols-4`, keeps its primary CTA at `min-h-11`, and constrains long text inputs to `max-w-full`.
  - `../src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx` stacks provider cards until `sm:grid-cols-2` and keeps the submit CTA at `min-h-11`.
  - `../src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` and `../src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx` both stack their forms/actions on mobile and only switch to row layouts from `sm` upward.
- The shared guest error boundary in `../src/app/(guest)/error.tsx` degrades cleanly across the audited sizes, so the blocker is runtime data access rather than fallback layout quality.

## Remediation Plan

### P0 — restore guest-route auditability first

1. Ensure the local/public-route runtime actually receives `DATABASE_URL` before attempting any final responsive sign-off on the guest journey.
2. Once the DB-backed routes render real content again, rerun the live device matrix for `/{slug}`, `/contribute`, `/contribute/payment`, `/thanks`, and `/payment-failed`.
3. If local guest auditing must work without a real DB, consider adding an explicit local-safe fallback mode for public Dreamboard reads instead of silently falling through to the guest error boundary.

### P1 — unify the public breakpoint story

1. Pick a single public-shell tablet contract and align the marketing nav/header switch with the exact-homepage content breakpoints and the shared guest header.
2. Revisit the guest board's `min-[840px]` two-column threshold once the real route content loads, because it currently sits between the guest header's `768px` desktop-nav switch and the marketing shell's `1024px` desktop-nav switch.
3. Re-test the seam widths around `920`, `980`, `1024`, and `1100` after any alignment pass.

### P2 — tighten small-screen tap targets

1. Give the marketing hamburger a `44x44` minimum hit area to match the guest shell.
2. Add padding or chip-like wrappers for the exact-homepage footer links on mobile so the legal/contact actions are easier to tap.
3. Review Clerk appearance/theme overrides for mobile auth forms so the primary inputs and buttons reach at least a comfortable touch height.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Audited the live marketing landing plus public auth entry routes across desktop, iPad, and mobile orientations, captured screenshot evidence, and found no horizontal overflow on the live surfaces. The main blocker is that all DB-backed guest public routes currently fall into the guest error boundary because `DATABASE_URL` is missing at runtime; once that is fixed, the next pass should re-run the full guest route matrix before any final responsiveness sign-off.

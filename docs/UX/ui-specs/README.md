# Gifta UX v2 — UI Specification Suite

> **Version:** 2.1
> **Created:** February 6, 2026
> **Last Updated:** February 11, 2026
> **Total Documents:** 22
> **Total Lines:** 29,100
> **Purpose:** Screen-level UX specs with runtime alignment notes

---

## Overview

This folder contains the UX v2 screen specifications. Some documents now match runtime closely; others are still target-state and include runtime overrides.

For implementation, always verify against runtime in `src/app`, `src/components`, and `src/lib`.

### Runtime Source of Truth (for UI behavior)

- `src/app/(marketing)/page.tsx`
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`
- `src/app/(host)/create/*`
- `src/app/(guest)/[slug]/*`
- `src/app/(host)/dashboard/*`
- `src/app/(admin)/admin/*`
- `src/components/*`

---

## Runtime Alignment Snapshot (2026-02-11)

| Doc | Alignment | Notes |
|---|---|---|
| 00 | Partial | Token intent is useful; component/file inventory is stale in places. |
| 01 | Partial | Landing visuals align; auth redirect assumptions were outdated. |
| 02 | Partial | Clerk usage aligns; admin authorization model needed correction. |
| 03 | High | Matches current child step flow. |
| 04 | Low | Replaced AI image generation + goal input with static gift icon picker and no goal field in host UI. |
| 05 | Partial | Date logic updated for required `campaign_end_date` and optional `party_date_time`. |
| 06 | Partial | Giving-back flow aligns; legacy goal-based wording is now flagged as historical. |
| 07 | High | Payout setup broadly aligned (Karri + bank). |
| 08 | Partial | Publish flow corrected to preview-first, publish-on-submit, slug sharing URL. |
| 09 | High | Public Dreamboard largely aligned. |
| 10 | Partial | Reminder UI is email-only (3-day reminder). |
| 11 | Partial | Payment methods now include PayFast, Ozow, and SnapScan. |
| 12 | High | Thank-you flow + receipt capture aligns. |
| 13 | High | Failure-recovery flow aligns. |
| 14 | Partial | Dashboard list runtime aligns; legacy shared-header references are stale. |
| 15 | Partial | No host close action in runtime; detail and payouts are aligned otherwise. |
| 16 | High | Edit modal aligns with constrained fields. |
| 17 | High | Post-campaign view aligns. |
| 18 | Partial | Admin auth model corrected to email allowlist; no Clerk role-claim gate. |
| 19 | Low | Shared component inventory required runtime correction. |
| 20 | Low | Runtime templates are fewer than the full target matrix in spec. |
| 21 | Partial | Confetti + reduced-motion logic align; haptic/sound systems are not implemented. |

---

## Document Index

### Foundation

| # | Document | Lines | Purpose |
|---|----------|-------|---------|
| 00 | [Design System](./00-DESIGN-SYSTEM.md) | 2,206 | Master design tokens, component library, brand guidelines |

### Marketing & Auth

| # | Document | Lines | Route | Purpose |
|---|----------|-------|-------|---------|
| 01 | [Landing Page](./01-LANDING-PAGE.md) | 1,677 | `/` | Public homepage with hero, demo board, social proof |
| 02 | [Authentication](./02-AUTHENTICATION.md) | 1,484 | `/sign-in`, `/sign-up` | Clerk auth integration, route protection, session management |

### Host Create Flow (5 steps + confirmation)

| # | Document | Lines | Route | Purpose |
|---|----------|-------|-------|---------|
| 03 | [Step 1: The Child](./03-CREATE-STEP-1-THE-CHILD.md) | 1,327 | `/create/child` | Child name, photo upload, age selector |
| 04 | [Step 2: The Gift](./04-CREATE-STEP-2-THE-GIFT.md) | 1,513 | `/create/gift` | Gift name, description, static icon selection |
| 05 | [Step 3: The Dates](./05-CREATE-STEP-3-THE-DATES.md) | 1,296 | `/create/dates` | Birthday, party date, campaign end date, optional party time |
| 06 | [Step 4: Giving Back](./06-CREATE-STEP-4-GIVING-BACK.md) | 1,460 | `/create/giving-back` | Optional charity selection and split configuration |
| 07 | [Step 5: Payout Setup](./07-CREATE-STEP-5-PAYOUT-SETUP.md) | 1,598 | `/create/payout` | Karri Card or bank transfer payout method |
| 08 | [Confirmation & Share](./08-CREATE-CONFIRMATION.md) | 1,353 | `/create/review` | Celebration, share links, dashboard redirect |

### Public Dreamboard & Contributor Journey

| # | Document | Lines | Route | Purpose |
|---|----------|-------|-------|---------|
| 09 | [Public Dreamboard](./09-PUBLIC-DREAM-BOARD.md) | 981 | `/[slug]` | The WhatsApp-shared board contributors see |
| 10 | [Contribute: Amount & Details](./10-CONTRIBUTE-AMOUNT-DETAILS.md) | 1,105 | `/[slug]/contribute` | Amount selector, name, message, reminder |
| 11 | [Contribute: Payment](./11-CONTRIBUTE-PAYMENT.md) | 1,125 | `/[slug]/contribute/payment` | PayFast form, Ozow redirect, SnapScan QR |
| 12 | [Contribute: Thank You](./12-CONTRIBUTE-THANK-YOU.md) | 1,081 | `/[slug]/thanks` | Confetti celebration, receipt, share prompt |
| 13 | [Contribute: Payment Failed](./13-CONTRIBUTE-PAYMENT-FAILED.md) | 872 | `/[slug]/payment-failed` | Friendly error recovery with retry |

### Host Dashboard

| # | Document | Lines | Route | Purpose |
|---|----------|-------|-------|---------|
| 14 | [Dashboard: Board List](./14-HOST-DASHBOARD-LIST.md) | 1,122 | `/dashboard` | All parent's Dreamboards |
| 15 | [Dashboard: Board Detail](./15-HOST-DASHBOARD-DETAIL.md) | 1,212 | `/dashboard/[id]` | Contributions, messages, payout status |
| 16 | [Dashboard: Edit Modal](./16-HOST-DASHBOARD-EDIT.md) | 1,314 | `/dashboard/[id]` | Constrained editing with confirmation |
| 17 | [Dashboard: Post-Campaign](./17-HOST-DASHBOARD-POST-CAMPAIGN.md) | 1,128 | `/dashboard/[id]` | Financial breakdown, downloads after close |

### Administration

| # | Document | Lines | Route | Purpose |
|---|----------|-------|-------|---------|
| 18 | [Admin Panel](./18-ADMIN-PANEL.md) | 1,502 | `/admin/*` | All 7 admin sections in one document |

### Cross-Cutting Concerns

| # | Document | Lines | Purpose |
|---|----------|-------|---------|
| 19 | [Shared Components](./19-SHARED-COMPONENTS.md) | 1,349 | Headers, footers, loading/empty/error states, form components |
| 20 | [Communications](./20-COMMUNICATIONS.md) | 1,098 | Reminder + receipt emails, WhatsApp integration templates, delivery rules |
| 21 | [Celebrations & Delight](./21-CELEBRATIONS-DELIGHT.md) | 1,297 | Confetti and motion system (haptic/sound target-state noted) |

---

## Implementation Order

### Phase 1: Foundation & Core (implement first)
1. `00-DESIGN-SYSTEM.md` — Establish all tokens and base components
2. `19-SHARED-COMPONENTS.md` — Build shared UI primitives
3. `21-CELEBRATIONS-DELIGHT.md` — Confetti and animation utilities

### Phase 2: Marketing & Auth
4. `01-LANDING-PAGE.md` — Public homepage
5. `02-AUTHENTICATION.md` — Sign in/up with Clerk

### Phase 3: Host Create Flow
6. `03` through `08` — All six create flow screens in order

### Phase 4: Public & Contributor
7. `09-PUBLIC-DREAM-BOARD.md` — The critical WhatsApp-shared page
8. `10` through `13` — Contribution flow and outcomes

### Phase 5: Dashboard
9. `14` through `17` — All host dashboard screens

### Phase 6: Admin & Comms
10. `18-ADMIN-PANEL.md` — Full admin interface
11. `20-COMMUNICATIONS.md` — Email and WhatsApp templates

---

## How to Use These Specs

**For AI coding agents:** read `00-DESIGN-SYSTEM.md`, then the target screen doc, then verify behavior against runtime files listed above.

**For human developers:** use the spec for intent, and runtime files for current behavior where a runtime override is noted.

**For design review:** use wireframes/copy matrices for UX intent, and validate shipped behavior directly in route/component code.

---

## Key Conventions

- **Brand:** "Gifta" (not ChipIn), "Dreamboard" (one word), "chip in" (lowercase)
- **Colors:** Teal primary (#0D9488), sage CTAs (#6B9E88), warm surfaces (#FEFDFB)
- **Typography:** Outfit (body), Fraunces (display headings), Nunito (logo)
- **Accessibility:** WCAG 2.1 AA, 44px min touch targets, reduced motion support
- **Mobile-first:** All specs start at mobile, then layer tablet (md:768px) and desktop (lg:1024px)

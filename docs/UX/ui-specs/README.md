# Gifta UX v2 — UI Specification Suite

> **Version:** 2.0
> **Created:** February 6, 2026
> **Total Documents:** 22
> **Total Lines:** 29,100
> **Purpose:** Implementation-ready UI specifications for AI coding agents

---

## Overview

This folder contains the complete set of UI specification documents for Gifta's UX v2 redesign. Each document is a self-contained blueprint that provides an AI coding agent with everything needed to build that screen — visual layout, typography, colors, spacing, component trees, TypeScript interfaces, file paths, accessibility requirements, animations, error handling, and edge cases.

**All documents reference `00-DESIGN-SYSTEM.md` as the single source of truth for design tokens.** Read that document first before implementing any screen.

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
| 04 | [Step 2: The Gift](./04-CREATE-STEP-2-THE-GIFT.md) | 1,513 | `/create/gift` | Gift name, description, AI image generation |
| 05 | [Step 3: The Dates](./05-CREATE-STEP-3-THE-DATES.md) | 1,296 | `/create/dates` | Birthday, party date, campaign end date |
| 06 | [Step 4: Giving Back](./06-CREATE-STEP-4-GIVING-BACK.md) | 1,460 | `/create/giving-back` | Optional charity selection and split configuration |
| 07 | [Step 5: Payout Setup](./07-CREATE-STEP-5-PAYOUT-SETUP.md) | 1,598 | `/create/payout` | Karri Card or bank transfer payout method |
| 08 | [Confirmation & Share](./08-CREATE-CONFIRMATION.md) | 1,353 | `/create/review` | Celebration, share links, dashboard redirect |

### Public Dreamboard & Contributor Journey

| # | Document | Lines | Route | Purpose |
|---|----------|-------|-------|---------|
| 09 | [Public Dreamboard](./09-PUBLIC-DREAM-BOARD.md) | 981 | `/[slug]` | The WhatsApp-shared board contributors see |
| 10 | [Contribute: Amount & Details](./10-CONTRIBUTE-AMOUNT-DETAILS.md) | 1,105 | `/[slug]/contribute` | Amount selector, name, message, reminder |
| 11 | [Contribute: Payment](./11-CONTRIBUTE-PAYMENT.md) | 1,125 | `/[slug]/contribute` | PayFast card / SnapScan QR payment |
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
| 20 | [Communications](./20-COMMUNICATIONS.md) | 1,098 | Email templates (9), WhatsApp templates (3) |
| 21 | [Celebrations & Delight](./21-CELEBRATIONS-DELIGHT.md) | 1,297 | Confetti, animations, haptic feedback, sound effects |

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

**For AI coding agents:** Read `00-DESIGN-SYSTEM.md` first, then the specific screen spec. Each document contains everything you need — do not guess at values, every color, size, and behavior is specified.

**For human developers:** Use these as acceptance criteria. Every field, state, animation, and error message is defined.

**For design review:** ASCII wireframes show layout intent at each breakpoint. Copy matrices provide exact text.

---

## Key Conventions

- **Brand:** "Gifta" (not ChipIn), "Dreamboard" (one word), "chip in" (lowercase)
- **Colors:** Teal primary (#0D9488), sage CTAs (#6B9E88), warm surfaces (#FEFDFB)
- **Typography:** Outfit (body), Fraunces (display headings), Nunito (logo)
- **Accessibility:** WCAG 2.1 AA, 44px min touch targets, reduced motion support
- **Mobile-first:** All specs start at mobile, then layer tablet (md:768px) and desktop (lg:1024px)

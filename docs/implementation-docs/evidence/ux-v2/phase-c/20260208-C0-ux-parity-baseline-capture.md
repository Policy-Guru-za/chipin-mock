# C0 UX Parity Baseline Capture (Phase C)

Date (UTC): 2026-02-08T10:35:00Z
Milestone: C0 - UX Parity Baseline Capture
Status: COMPLETE (assessment-only, no UI code changes)

## 1) Gate Baseline (pre-C1)

Command run:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Contract parity gates also run:

```bash
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

Result:

- `pnpm lint`: PASS (`0` errors, `71` warnings)
- `pnpm typecheck`: PASS
- `pnpm test`: PASS (`106` files, `429` tests)
- `pnpm openapi:generate`: PASS
- `pnpm test tests/unit/openapi-spec.test.ts`: PASS (`1` file, `4` tests)

Notes:

- Existing lint warnings are pre-existing complexity/size warnings; no gate blockers.
- Write-path policy remains unchanged (`UX_V2_ENABLE_BANK_WRITE_PATH=false`, `UX_V2_ENABLE_CHARITY_WRITE_PATH=false` per B9 recommendation and current unset=disabled runtime behavior).

## 2) Route Inventory (Current vs UX v2 Target)

Legend:

- Delta classification: `keep | modify | replace | new`
- Risk: `high | medium | low`

| Route | Current file path (`src/app/...`) | Current components used | UX v2 target state (delta spec + UI spec) | Delta | Risk |
|---|---|---|---|---|---|
| `/` | `src/app/(marketing)/page.tsx` | `LandingPage` (`LandingNav`, `LandingHero`, `LandingDreamBoard`, `LandingStatsLine`, `LandingTestimonial`, `LandingCTA`, `LandingHowItWorks`, `LandingFooter`) | Confirm parity for hero/social/trust blocks, nav/auth states, CTA conversion flow per `01-LANDING-PAGE.md` + `19-SHARED-COMPONENTS.md`. | modify | medium |
| `/sign-in` | `src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk `SignIn` (no local wrapper component) | Branded Clerk auth screen, route protection UX, signed-in redirect behavior parity per `02-AUTHENTICATION.md`. | modify | medium |
| `/sign-up` | `src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk `SignUp` (no local wrapper component) | Branded Clerk sign-up UX/state parity and auth redirects per `02-AUTHENTICATION.md`. | modify | medium |
| `/create` | `src/app/(host)/create/page.tsx` | redirect-only route | Entry route remains redirect/gateway into first create step (host auth aware). | keep | low |
| `/create/child` | `src/app/(host)/create/child/page.tsx` | `CreateFlowShell`, `Card`, `Input`, `Button` | Step 1 of 6 with wizard indicator + polished child/photo capture per `03-CREATE-STEP-1-THE-CHILD.md`. | modify | medium |
| `/create/gift` | `src/app/(host)/create/gift/page.tsx` | `CreateFlowShell`, `GiftArtworkGenerator`, `Card`, `Input`, `Button` | Step 2 of 6 with gift details + artwork flow feeding new step-sequenced routes per `04-CREATE-STEP-2-THE-GIFT.md`. | modify | high |
| `/create/details` | `src/app/(host)/create/details/page.tsx` | `CreateFlowShell`, `Card`, `Input`, `Button` (monolithic dates + charity + payout form) | UX v2 splits this into three routes (`/create/dates`, `/create/giving-back`, `/create/payout`). Existing combined route conflicts with target architecture. | replace | high |
| `/create/dates` | not implemented | n/a | New step 3 route + date UX per `05-CREATE-STEP-3-THE-DATES.md`. | new | high |
| `/create/giving-back` | not implemented | n/a | New step 4 charity/giving-back route per `06-CREATE-STEP-4-GIVING-BACK.md`. | new | high |
| `/create/payout` | not implemented | n/a | New step 5 payout setup route per `07-CREATE-STEP-5-PAYOUT-SETUP.md`. | new | high |
| `/create/review` | `src/app/(host)/create/review/page.tsx` | `CreateFlowShell`, `Card`, `Button` | Final celebration/confirmation experience (confetti, share actions, preview emphasis) per `08-CREATE-CONFIRMATION.md`; no longer a simple form-review shell. | replace | high |
| `/[slug]` | `src/app/(guest)/[slug]/page.tsx` | `DreamBoardCard`, `ProgressBar`, `ContributorChips`, `Button` (+ guest layout `Header`, `Footer`) | Public board parity: emotional hero, contributor/social proof, urgency states, charity block, return states per `09-PUBLIC-DREAM-BOARD.md` + delta spec. | modify | medium |
| `/[slug]/contribute` | `src/app/(guest)/[slug]/contribute/page.tsx` | `DreamBoardCard`, `ContributionForm`, `StateCard` | Amount/details stage with anonymity + reminder entry point, then handoff to dedicated payment step per `10-CONTRIBUTE-AMOUNT-DETAILS.md`. | replace | high |
| `/[slug]/contribute/payment` | not implemented | n/a | New payment stage route (provider selection, processing, QR flow) per `11-CONTRIBUTE-PAYMENT.md`. | new | high |
| `/[slug]/thanks` | `src/app/(guest)/[slug]/thanks/page.tsx` | `ProgressBar`, `Button` | Celebratory post-payment UX: richer gratitude, optional receipt capture, charity impact messaging, share-forward actions per `12-CONTRIBUTE-THANK-YOU.md`. | modify | medium |
| `/[slug]/payment-failed` | `src/app/(guest)/[slug]/payment-failed/page.tsx` | `Button` | Empathetic recovery UX with retry + alternate payment options + support affordances per `13-CONTRIBUTE-PAYMENT-FAILED.md`. | modify | low |
| `/dashboard` | `src/app/(host)/dashboard/page.tsx` | `ProgressBar`, `Card`, `StateCard`, `Button` (+ host layout `Header`, `Footer`) | Dashboard list parity: richer card states/actions/summary presentation per `14-HOST-DASHBOARD-LIST.md`. | modify | medium |
| `/dashboard/[id]` | `src/app/(host)/dashboard/[id]/page.tsx` | `ProgressBar`, `ContributorList`, `Card`, `Button` (+ host layout `Header`, `Footer`) | Detail parity: sections for financial breakdown, contribution/message history, quick actions, payout details per `15-HOST-DASHBOARD-DETAIL.md` + delta spec. | modify | high |
| `/admin` | not implemented | n/a | New admin overview dashboard section per `18-ADMIN-PANEL.md`. | new | high |
| `/admin/dream-boards` | not implemented | n/a | New admin dreamboard management section per `18-ADMIN-PANEL.md`. | new | high |
| `/admin/contributions` | not implemented | n/a | New admin contributions management section per `18-ADMIN-PANEL.md`. | new | high |
| `/admin/payouts` | `src/app/(admin)/payouts/page.tsx` | `Card`, `Button` | Retain and expand payout section to full admin-panel parity (filters/search/status workflows) per delta spec + `18-ADMIN-PANEL.md`. | modify | medium |
| `/admin/payouts/[id]` | `src/app/(admin)/payouts/[id]/page.tsx` | `Card`, `Button`, `Input` (+ local `DocumentsCard`) | Keep payout-detail workflow, align visual/system parity with admin suite and expanded payout operations model. | modify | medium |
| `/admin/charities` | not implemented | n/a | New admin charities management section per `18-ADMIN-PANEL.md`. | new | high |
| `/admin/reports` | not implemented | n/a | New admin financial reports section per `18-ADMIN-PANEL.md`. | new | high |
| `/admin/settings` | not implemented | n/a | New admin platform settings section per `18-ADMIN-PANEL.md`. | new | high |

## 3) Component Dependency Map (Shared Reuse)

Route-level import frequency across scoped C0 routes:

| Shared component | Route usage count | Routes impacted |
|---|---:|---|
| `@/components/ui/button` | 12 | create steps, guest public/contribute/outcomes, dashboard list/detail, admin payouts routes |
| `@/components/ui/card` | 8 | create steps, dashboard list/detail, admin payouts routes |
| `@/components/ui/input` | 4 | create child/gift/details, admin payout detail |
| `@/components/layout/CreateFlowShell` | 4 | `/create/child`, `/create/gift`, `/create/details`, `/create/review` |
| `@/components/dream-board/ProgressBar` | 4 | `/[slug]`, `/[slug]/thanks`, `/dashboard`, `/dashboard/[id]` |
| `@/components/ui/state-card` | 2 | `/[slug]/contribute`, `/dashboard` |
| `@/components/layout/Header` + `Footer` | shared layouts | all guest routes (`/[slug]*`) + host routes (`/create/*`, `/dashboard*`) |
| `@/components/dream-board/DreamBoardCard` | 2 | `/[slug]`, `/[slug]/contribute` |

Build-order implication:

- Shared primitives (`Button`, `Card`, `Input`, `ProgressBar`, `StateCard`) should be stabilized before heavy route rewrites that depend on them.
- Layout-level branding/nav changes (`Header`, `Footer`) will cascade across guest + host surfaces and should be planned once to avoid repeated churn.
- `CreateFlowShell` changes are tightly coupled to C1 route split work.

## 4) Phase C Risk Register

### High-risk (structural restructuring)

- Create flow architecture mismatch:
  - Current monolith: `/create/details`
  - Target split routes: `/create/dates`, `/create/giving-back`, `/create/payout`
  - Impact: routing, draft persistence sequencing, validation boundaries, step indicator state.
- Contributor flow architecture mismatch:
  - Current combined contribute+payment in `/[slug]/contribute`
  - Target split with dedicated `/[slug]/contribute/payment`
  - Impact: state handoff, provider UX, reminder entrypoint placement, error recovery continuity.
- Host detail expansion (`/dashboard/[id]`):
  - Multiple new sections (messages, payout detail, post-campaign summaries) not represented in current page structure.
- Admin domain expansion (`/admin/*`):
  - Current implementation covers payouts only; target includes 7 sections (`/admin`, dream-boards, contributions, payouts, charities, reports, settings).

### Medium-risk (significant visual/interaction updates)

- Landing page parity and auth-state behavior tuning on `/`.
- Auth route polish and branded Clerk theming (`/sign-in`, `/sign-up`).
- Public Dreamboard (`/[slug]`) visual hierarchy + charity/return-state parity.
- Thank-you and dashboard list/detail visual/compositional parity.
- Existing admin payouts pages alignment to shared admin navigation/system.

### Low-risk (minor styling/copy and state framing)

- `/create` redirect gateway behavior (mostly stable).
- `/[slug]/payment-failed` (structure exists; mostly UX/copy/state enhancements).

### Spec coverage gaps identified

- **Code route with no direct UX v2 screen spec:** `/create/details` (must be decomposed/replaced).
- **Existing route only partially covered in spec:** `/admin/payouts/[id]` detail workflow (admin spec is section-level; no explicit dedicated detail screen contract).
- **Target spec routes currently missing in code:** `/create/dates`, `/create/giving-back`, `/create/payout`, `/[slug]/contribute/payment`, `/admin`, `/admin/dream-boards`, `/admin/contributions`, `/admin/charities`, `/admin/reports`, `/admin/settings`.

## 5) Build Sequence Recommendation (C1-C7)

Recommendation: **Keep Phase Plan ordering C1 -> C2 -> C3 -> C4 -> C5 -> C6 -> C7**, with explicit dependency guards.

Rationale by dependency:

1. **C1 Host Create Flow Restructure first**
   - Largest structural delta; unlocks correct route topology (`/create/dates`, `/create/giving-back`, `/create/payout`).
   - Reduces downstream rework for host/dashboard and copy/a11y passes.
2. **C2 Public Dreamboard before C3 Contributor Journey**
   - Stabilizes public board states/charity visibility and CTA context before payment-flow split.
3. **C3 Contributor Journey next**
   - Implements new `/[slug]/contribute/payment` architecture and reminder entrypoint after public board baseline is stable.
4. **C4 Host Dashboard after guest/contributor state model settles**
   - Reuses shared progress/contribution presentation patterns that will already be hardened in C2/C3.
5. **C5 Admin Expansion after host/guest critical paths**
   - Independent UI domain, but larger route creation footprint; execute after user-critical flows are stabilized.
6. **C6 Comms/Content Alignment near end (global sweep)**
   - Avoid repeated copy churn while core screen structure is still changing.
7. **C7 Accessibility + edge-case hardening last**
   - Best done on near-final UI surfaces to avoid regression churn.

Execution guardrails for C1 kickoff:

- Establish route skeletons for all new target routes before deep UI implementation.
- Freeze shared primitive API changes (`Button`, `Card`, `Input`, `ProgressBar`) per slice to prevent cross-route regressions.
- Maintain Phase B write-path toggles OFF until explicit Phase C rollout decision.

## 6) C0 Acceptance Check

- `P0`: Full route inventory documented - PASS
- `P1`: Delta map complete and ready for review - PASS

Do not proceed to C1 until this C0 baseline is reviewed and approved.

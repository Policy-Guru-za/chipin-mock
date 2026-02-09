# Gifta Canonical Spec (Source of Truth)

> **Version:** 2.0.0
> **Last Updated:** February 7, 2026
> **Status:** Authoritative
> **Supersedes:** v1.1.1 (January 21, 2026)

---

## Purpose

Resolve conflicts across docs. When anything disagrees, this file wins.

This document reflects both the current codebase state and the locked UX v2 decisions that are being implemented across Phase B (backend enablement) and Phase C (UI/UX rollout). Where current runtime behavior differs from the target state, both are noted explicitly.

---

## Change Log

| Version | Date | Summary |
|---------|------|---------|
| 2.0.0 | 2026-02-07 | Major update for UX v2: multi-payout (Karri + bank), charity domain, 5-step host flow, fee semantics clarification, new data model fields, payout engine architecture, reminder system. Aligned with Decision Register D-001 through D-010. |
| 1.1.1 | 2026-01-21 | Previous baseline (Karri-only, no charity, 4-step host flow). |

---

## Core Decisions

### Product Scope

- **Dream Board:** one manual gift goal (parent-written) with curated static icon imagery.
- **Guest flow:** mobile-web; single CTA ("Chip in"); no sign-in required.
- **Host flow:** Clerk authentication; 5-step creation wizard + review/confirmation.
  - Step 1: The Child (name, photo, age, birthday)
  - Step 2: The Gift (name, description, goal amount, icon selection)
  - Step 3: The Dates (birthday, party date, campaign end date)
  - Step 4: Giving Back (optional charity selection and split configuration)
  - Step 5: Payout Setup (Karri Card or bank transfer)
  - Confirmation: review, publish, share via WhatsApp
- **Contributor flow:** 4 steps (view board, amount/details, payment, thank you). No sign-in.

### Gift and Payout Model

- **Payout methods:** Karri Card (recommended) or bank transfer.
  - `payout_method` enum: `karri_card`, `bank` (Decision Register D-001, LOCKED).
  - Karri Card fields: `karri_card_number`, `karri_card_holder_name`.
  - Bank fields: `bank_name`, `bank_account_number_encrypted`, `bank_account_last4`, `bank_branch_code`, `bank_account_holder`.
  - Payout method is selected by the host during creation (Step 5) and determines which fields are required.
- **Payout types:** `karri_card`, `bank`, `charity` (Decision Register D-002, LOCKED).
  - A single Dream Board may produce multiple payout rows: one gift payout (type matches `payout_method`) and optionally one charity payout (type = `charity`).
  - Uniqueness constraint: one payout per `(dream_board_id, type)`.
  - Dream Board transitions to `paid_out` only when all required payout rows for that board are `completed`.
- **Current runtime state:** payout service implements `karri_card` only. Bank and charity payout processing are schema-ready but not yet wired in runtime (Phase B deliverable, gated by D-006).

### Charity Model

- **Optional feature:** hosts may enable charity giving during creation (Step 4: Giving Back).
- **When disabled:** `charity_enabled = false`; all charity config fields must be NULL.
- **When enabled:** host selects an active charity and configures a split mode.
- **Split modes** (Decision Register D-003, LOCKED):
  - `percentage`: a percentage (5%–50%, stored as basis points 500–5000 in `charity_percentage_bps`) of each contribution is allocated to charity.
  - `threshold`: a fixed total amount (minimum R50, stored in `charity_threshold_cents`) is allocated to charity; once the threshold is met, subsequent contributions go entirely to the gift.
- **Charity entity:** managed by admin; must be `is_active = true` to be selectable. Fields: name, description, category, logo, website, encrypted bank details, contact info.
- **Charity payout cadence:** monthly batch with per-charity reconciliation report (Decision Register D-008, LOCKED).
- **Validation:** incomplete charity configuration is rejected at both API and database constraint levels.

### Fee Semantics

Decision Register D-004 (LOCKED): transparent fee model.

- **Contributor chooses gift amount only.** Platform fee is calculated and shown separately at checkout.
- **Fee calculation:** 3% of gift amount, minimum R3 (300 cents), maximum R500 (50,000 cents).
- **Checkout display:** itemized as "R350 gift + R10.50 processing fee = R360.50 total".
- **`raised_cents` tracks gift amount only** (excludes platform fee). This prevents fee distortion in goal progress.
- **Funded condition** (Decision Register D-005, LOCKED): Dream Board is funded when `raised_cents >= goal_cents`, where `raised_cents` = `SUM(contributions.net_cents)` for completed contributions.
- **`contributions.net_cents`** is a generated column: `amount_cents - fee_cents`.
  - `amount_cents` = the gift amount the contributor chose.
  - `fee_cents` = the platform fee calculated on that amount.
  - `net_cents` = the amount that counts toward the gift goal.

Note: the current implementation stores `net_cents = amount_cents - fee_cents`, which means `raised_cents` sums the post-fee amount. This is consistent with D-004/D-005 because `amount_cents` represents the gift amount and the fee is added on top at checkout (guest is charged `amount_cents + fee_cents`).

### Public vs Private Display

- **Public guest view:** percentage and totals raised vs goal are displayed. Individual contribution amounts are not displayed publicly (only aggregate progress).
- **Host view:** exact amounts, contributor details, payout totals, charity allocation breakdown (if enabled).
- **Funded state:** guest view remains gift-focused. If charity is enabled, the public board shows the charity name and a brief description but does not expose split percentages or allocation details.
- **Closed state:** contributors see "This Dreamboard has closed" with a thank-you message. CTA is disabled.

### Payments

- **Inbound providers:** PayFast (card, primary), Ozow (EFT), SnapScan (QR).
- **PayFast ITN hardening required:** signature verification, source IP validation, amount check, PayFast server validation call, idempotency by `(payment_provider, payment_ref)`.
- **Stitch:** parked until float/settlement/compliance clarified; revisit in Phase 2.

### Auth and Session Storage

- Clerk handles host and admin authentication and session state.
- Guest/contributor routes are fully public (no auth required).
- No magic link tokens or session storage in Vercel KV.
- API key authentication (separate from Clerk) protects partner V1 API routes.
- Internal job routes are protected by `INTERNAL_JOB_SECRET` bearer token.

### Branding

- **Primary brand string:** `Gifta` (Decision Register D-009, LOCKED).
- **Product term:** `Dreamboard` (one word, capital D in UI).
- **Action term:** `chip in` (lowercase in body text).
- All user-facing strings must use canonical branding. No legacy names (e.g., "ChipIn") in active UX surfaces, templates, or metadata.

### Accessibility

- **Baseline:** WCAG 2.1 AA for all user-facing screens (Decision Register D-010, LOCKED).
- **Touch targets:** minimum 44px on mobile.
- **Reduced motion:** all animations must respect `prefers-reduced-motion` media query.
- **Mobile-first:** all specs start at mobile (375px), then layer tablet (768px) and desktop (1024px).

### Package Manager

- **pnpm only.** No npm or yarn.

---

## Data Model Canonical Fields

### dream_boards

Identity and content:
- `id` (UUID, PK), `slug` (unique, URL-friendly), `partner_id` (FK), `host_id` (FK)
- `child_name`, `child_photo_url`, `child_age` (nullable), `birthday_date` (nullable)
- `gift_name`, `gift_description` (nullable), `gift_image_url` (icon path), `gift_image_prompt` (nullable, deprecated legacy field)
- `goal_cents` (integer, minimum 2000 = R20)
- `message` (nullable, host message to contributors)

Dates:
- `party_date` (date, not null — pot close reference date)
- `campaign_end_date` (date, nullable — explicit campaign deadline)
- Constraint: `birthday_date <= party_date` and `campaign_end_date <= party_date` when set.

Payout:
- `payout_method` = `karri_card | bank` (enum, not null, default `karri_card`)
- `karri_card_number` (encrypted, nullable — required when method = karri_card)
- `karri_card_holder_name` (nullable — required when method = karri_card)
- `bank_name` (nullable — required when method = bank)
- `bank_account_number_encrypted` (encrypted, nullable — required when method = bank)
- `bank_account_last4` (nullable — display only)
- `bank_branch_code` (nullable — required when method = bank)
- `bank_account_holder` (nullable — required when method = bank)
- `payout_email` (not null)

Charity:
- `charity_enabled` (boolean, not null, default false)
- `charity_id` (FK to charities, nullable — required when enabled)
- `charity_split_type` = `percentage | threshold` (enum, nullable — required when enabled)
- `charity_percentage_bps` (integer 500–5000, nullable — required when split_type = percentage)
- `charity_threshold_cents` (integer >= 5000, nullable — required when split_type = threshold)
- Database constraint enforces: when disabled, all charity config fields must be NULL; when enabled, required fields must be present and valid.

Contact:
- `host_whatsapp_number` (not null)

Status:
- `status` = `draft | active | funded | closed | paid_out | expired | cancelled` (enum, default `draft`)

Timestamps:
- `created_at`, `updated_at`

### contributions

- `id` (UUID, PK), `partner_id` (FK), `dream_board_id` (FK)
- `contributor_name` (nullable), `contributor_email` (nullable), `is_anonymous` (boolean, default false)
- `message` (nullable)
- `amount_cents` (integer, not null, minimum 2000 = R20) — the gift amount chosen by the contributor.
- `fee_cents` (integer, not null) — platform fee calculated on the gift amount.
- `net_cents` (generated column: `amount_cents - fee_cents`) — amount counting toward the gift goal.
- `charity_cents` (integer, nullable) — portion allocated to charity from this contribution.
- `payment_provider` = `payfast | ozow | snapscan` (enum, not null)
- `payment_ref` (not null, unique with provider), `payment_status` = `pending | processing | completed | failed | refunded`
- `payment_error_message` (nullable)
- `ip_address` (inet, nullable), `user_agent` (nullable)
- `created_at`, `updated_at`

### payouts

- `id` (UUID, PK), `partner_id` (FK), `dream_board_id` (FK)
- `type` = `karri_card | bank | charity` (enum, not null)
- `gross_cents`, `fee_cents`, `charity_cents` (default 0), `net_cents` (all integer, not null)
- Constraint: `gross_cents >= net_cents`, `charity_cents >= 0`, `net_cents >= 0`
- `recipient_data` (JSONB, not null — payout-method-specific fields, encrypted where needed)
- `status` = `pending | processing | completed | failed` (enum, default `pending`)
- `external_ref` (nullable), `error_message` (nullable)
- `created_at`, `completed_at` (nullable)
- Unique constraint: `(dream_board_id, type)` — one payout row per type per board.

### payout_items

- `id` (UUID, PK), `payout_id` (FK), `dream_board_id` (FK)
- `type` = `gift | charity` (enum, not null)
- `amount_cents` (integer, not null, >= 0)
- `metadata` (JSONB, nullable)
- `created_at`

### charities

- `id` (UUID, PK), `name` (unique), `description`, `category`, `logo_url`, `website` (nullable)
- `bank_details_encrypted` (JSONB, not null)
- `contact_name`, `contact_email`
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

### contribution_reminders

- `id` (UUID, PK), `dream_board_id` (FK), `email`, `remind_at`
- `sent_at` (nullable — null until dispatched)
- Unique constraint: `(dream_board_id, email, remind_at)` — idempotent deduplication (Decision Register D-007).
- Reminder scheduling maximum: 14 days. Send pipeline retries with idempotent dedupe.

---

## Canonical Behavior

### Funding and Goal Progress

- **Funding phase:** gift progress advances as contributions complete; contributions can continue after goal is reached until the board is closed.
- **Raised calculations:** `raised_cents = SUM(contributions.net_cents WHERE payment_status = 'completed')`.
- **Funded condition:** `raised_cents >= goal_cents`. Fee amounts are excluded from goal progress.
- **Contributions continue past funded:** reaching the goal does not auto-close the board. The host or an explicit trigger closes it.

### Charity Allocation

- When `charity_enabled = true` and `charity_split_type = 'percentage'`: each completed contribution allocates `amount_cents * (charity_percentage_bps / 10000)` cents to charity.
- When `charity_enabled = true` and `charity_split_type = 'threshold'`: contributions allocate to charity until the cumulative charity total reaches `charity_threshold_cents`; subsequent contributions allocate nothing to charity.
- When `charity_enabled = false`: no charity allocation; all contribution value goes to the gift goal.

### Close Conditions

- **Explicit close:** `POST /v1/dream-boards/{id}/close` with reason (`manual`, `party_date_reached`, `goal_reached`).
- **Auto-close on `campaign_end_date`:** planned for Phase B (not yet implemented in runtime). There is currently no in-repo scheduler that auto-closes on `party_date` or `campaign_end_date`.
- **Manual close by host:** available via dashboard. Requires confirmation showing total raised and contributor count before irreversible action.
- **On close:** status transitions to `closed`; payout rows are created for the board.

### Payout Lifecycle

- On board close, the payout engine creates payout rows: one gift payout (type matches `payout_method`) and, if charity allocation > 0, one charity payout (type = `charity`).
- **Gift payout calculation:** `gross_cents = raised_cents`; `net_cents = gross_cents - charity_total_cents`.
- **Charity payout calculation:** `gross_cents = charity_total_cents`; `net_cents = charity_total_cents` (no additional fee on charity payouts).
- **Payout state machine:** `pending` → `processing` → `completed` or `failed`. Failed payouts may be retried (`failed` → `processing`).
- **Board `paid_out` transition:** the Dream Board status moves to `paid_out` only when all required payout rows for that board have status `completed`.
- **Current runtime:** only `karri_card` payouts are processed automatically via the Karri credit queue. Bank and charity payout processing will be enabled in Phase B (gated by Decision Register D-006).

### Reminder System

- Contributors may opt into a reminder when visiting a board.
- Reminders are scheduled with a maximum horizon of 14 days (Decision Register D-007).
- Deduplication is enforced by the unique constraint on `(dream_board_id, email, remind_at)`.
- The send pipeline must retry with idempotent dispatch to prevent duplicate notifications.

---

## Implementation Phase Context

UX v2 is being delivered in three phases:

- **Phase A (Schema):** completed. Database schema supports all UX v2 fields (bank, charity, reminders, expanded enums).
- **Phase B (Backend Enablement):** in progress. Enables multi-payout processing, charity domain services, reminder pipeline, and API contract parity. Bank and charity write paths are gated until B4 milestone passes (D-006).
- **Phase C (UI/UX Rollout):** pending Phase B completion. Full visual redesign of all screens per UI spec suite (`docs/UX/ui-specs/`).

Where this document describes behavior not yet live in runtime, it is noted with "Phase B deliverable" or similar. Once each phase completes and its GO decision is signed, those qualifiers should be removed.

---

## Documents Updated to Match

All docs in `docs/Platform-Spec-Docs/`, plus `README.md`, `AGENTS.md`, and `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`.

UI specification suite: `docs/UX/ui-specs/` (22 documents).

Implementation execution docs: `docs/implementation-docs/` (Phase B and C plans, domain specs, test matrices, rollout runbooks).

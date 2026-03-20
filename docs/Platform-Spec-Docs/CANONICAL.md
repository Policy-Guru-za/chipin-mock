# Gifta Canonical Spec (Source of Truth)

> **Version:** 2.0.11
> **Last Updated:** March 20, 2026
> **Status:** Authoritative
> **Supersedes:** v1.1.1 (January 21, 2026)

---

## Purpose

Resolve conflicts across docs. When anything disagrees, this file wins.

This document reflects the active product truth for Gifta surfaces, plus locked UX v2 decisions and explicit notes where historical/manual compatibility remains intentionally retained.

---

## Change Log

| Version | Date | Summary |
|---------|------|---------|
| 2.0.11 | 2026-03-20 | Review follow-up: active payout capture still requires `CARD_DATA_ENCRYPTION_KEY` readiness, while `KARRI_*` credentials remain automation-only, and the public Dreamboard create contract documents conditional bank/Karri payload branches accurately. |
| 2.0.10 | 2026-03-20 | Voucher runtime removal: active Dreamboard runtime/contracts now use bank with optional Karri only, `/create/payout` is the live host step, and partner/API payout writes no longer rely on legacy bank/Karri feature flags. |
| 2.0.9 | 2026-03-19 | Docs contract alignment: active product truth is now bank + optional Karri for payouts, Takealot vouchers are removed from the intended product story, and legacy voucher-era runtime drift is called out explicitly instead of treated as canonical. |
| 2.0.8 | 2026-03-19 | Payment runtime simplification: active guest contribution routes now stop at a public Stitch-coming-soon placeholder, PayFast/Ozow/SnapScan runtime surfaces are removed, and the active `payment_provider` enum/runtime truth is `stitch`. |
| 2.0.7 | 2026-03-13 | Charity product disablement: active Dreamboard host, guest, thank-you, dashboard, landing, admin navigation, and public Dreamboard API/OpenAPI surfaces no longer expose charity; historical charity data remains for ops/admin reconciliation only. |
| 2.0.6 | 2026-03-12 | Karri default-path decoupling: standard Dreamboard runtime no longer depends on Karri config, public API `karri_card` writes are gated by `UX_V2_ENABLE_KARRI_WRITE_PATH`, and readiness reports Karri as disabled unless write-path or automation mode is enabled. |
| 2.0.5 | 2026-03-12 | Dreamboard create-flow pivot: default host creation is now `child -> gift -> dates -> voucher -> review`, charity is removed from the active host path, and new host-created boards use `takealot_voucher` as the real payout-method runtime truth. |
| 2.0.4 | 2026-03-12 | Dreamboard fee removal: active checkout is now fee-free, contributor/admin/host fee copy removed from active surfaces, and fee-related contract fields are retained as deprecated compatibility fields only. |
| 2.0.3 | 2026-03-12 | Workspace-state documentation sync: confirmed generated OpenAPI host is `https://api.gifta.co.za/v1`, confirmed root request hook is `proxy.ts`, and aligned current doc governance to the March 12 workspace baseline. |
| 2.0.2 | 2026-02-13 | Charity onboarding simplification: create flow requires public-facing fields only (`name`, `description`, `category`, `logo_url`); operational fields (`website`, contacts, bank JSON) are optional and editable later. Added admin URL draft-autofill policy and clarified charity monthly settlement as manual reconciliation over close-created payout ledger rows. |
| 2.0.1 | 2026-02-11 | Runtime alignment pass: corrected goal/net semantics, close-path ownership, payout automation scope, reminder schema/dispatch details, and UI rollout status. |
| 2.0.0 | 2026-02-07 | Major update for UX v2: multi-payout (Karri + bank), charity domain, 5-step host flow, fee semantics clarification, new data model fields, payout engine architecture, reminder system. Aligned with Decision Register D-001 through D-010. |
| 1.1.1 | 2026-01-21 | Previous baseline (Karri-only, no charity, 4-step host flow). |

---

## Core Decisions

### Product Scope

- **Dreamboard:** one manual gift definition with curated static icon imagery.
- **Guest flow:** mobile-web; single CTA ("Chip in"); no sign-in required.
- **Host flow:** Clerk authentication; 5-step creation wizard + review/confirmation.
  - Step 1: The Child (name, photo, age, birthday)
  - Step 2: The Gift (name, description, icon selection; host UI does not collect goal amount)
  - Step 3: The Dates (birthday, party date, campaign end date)
  - Step 4: Payout Details (bank details plus optional Karri selection)
  - Step 5: Review
  - Confirmation: review, publish, share via WhatsApp
  - Current runtime uses `/create/payout`; legacy `/create/voucher` redirects there.
- **Contributor flow:** public Dreamboard view plus a Stitch-coming-soon contribution placeholder. Legacy `/{slug}/contribute/payment` and `/{slug}/payment-failed` routes redirect back to `/{slug}/contribute`; `/{slug}/thanks` can still render historical receipt state for stored `stitch` contribution refs. No sign-in.

### Gift and Payout Model

- **Payout methods:** bank transfer with an optional Karri Card path.
  - Intended active `payout_method` product contract: `karri_card`, `bank` (Decision Register D-001).
  - Karri Card fields: `karri_card_number`, `karri_card_holder_name`.
  - Bank fields: `bank_name`, `bank_account_number_encrypted`, `bank_account_last4`, `bank_branch_code`, `bank_account_holder`.
  - Host create flow writes bank payout details by default, with Karri available when selected.
  - Partner API payout writes accept both `karri_card` and `bank`.
- **Payout types:** intended active product contract `karri_card`, `bank`, `charity` (Decision Register D-002).
  - A single Dreamboard may produce multiple payout rows: one gift payout (type matches `payout_method`) and optionally one charity payout (type = `charity`).
  - Uniqueness constraint: one payout per `(dream_board_id, type)`.
  - Dreamboard transitions to `paid_out` only when all required payout rows for that board are `completed`.
- **Current product/runtime note:** active Dreamboard product flows create no new charity allocation. Historical boards can still carry existing charity totals, and payout planning can still create historical charity payout rows where those legacy allocations already exist. Automated execution is implemented for `karri_card` only (`KARRI_AUTOMATION_ENABLED`); bank and historical charity payouts currently require manual completion.
- **Public partner payout contract:** intended gift payout contract is `karri_card | bank`; charity payout rows are filtered out of public API responses.

### Charity Model

- **Active product state:** charity is disabled for the live Dreamboard product. Host create, public Dreamboard pages, thank-you pages, host dashboard views, landing pages, and the public Dreamboard API/OpenAPI do not expose charity.
- **Persistence policy:** new host-created Dreamboards publish with `charity_enabled = false`; active product writes clear all charity config fields to NULL.
- **Contribution policy:** active product contribution completion writes `charity_cents = null`, so no new charity allocation is created in the default environment.
- **Historical scope retained:** charity remains in the schema, ledger math, admin data, and payout engine so historical charity-enabled Dreamboards can still reconcile correctly.
- **Legacy split modes** (Decision Register D-003, LOCKED; historical/internal only):
  - `percentage`: a percentage (5%–50%, stored as basis points 500–5000 in `charity_percentage_bps`) of each contribution is allocated to charity.
  - `threshold`: a fixed total amount (minimum R50, stored in `charity_threshold_cents`) is allocated to charity; once the threshold is met, subsequent contributions go entirely to the gift.
- **Charity entity:** managed by admin; must be `is_active = true` to be selectable.
  - Create-time required fields: `name`, `description`, `category`, `logo_url`.
  - Optional operational fields (editable later): `website`, `contact_name`, `contact_email`, `bank_details_encrypted`.
- **Charity payout cadence:** close-based charity payout rows remain the accounting source; monthly settlement is a manual ops reconciliation/disbursement process over that ledger (Decision Register D-008, LOCKED).
- **Validation:** active Dreamboard public API request bodies reject charity fields entirely; database constraints still protect historical/internal charity configuration integrity.
- **Legacy flag note:** `UX_V2_ENABLE_CHARITY_WRITE_PATH` remains as legacy code-path configuration, but active Dreamboard public contract routes do not surface charity writes.

### Fee Semantics

Decision Register D-004 (LOCKED): fee-free contribution model with a current public placeholder runtime and legacy fee compatibility.

- **No live guest checkout is enabled right now.** Public contribution routes stop at the Stitch-coming-soon placeholder.
- **When contribution payments return, contributors choose gift amount only.** Active checkout total should equal the contribution amount with no additional Gifta platform fee.
- **`raised_cents` tracks gift amount only.** This remains the source for goal progress and funded checks.
- **Funded condition** (Decision Register D-005, LOCKED): Dreamboard is funded when `raised_cents >= goal_cents`, where `raised_cents` = `SUM(contributions.amount_cents)` for completed contributions.
- **Runtime rule for status transition:** auto-transition to `funded` is executed only when current status is `active` and `goal_cents > 0`.
- **Legacy compatibility fields remain:** `contributions.fee_cents`, `contributions.net_cents`, and `payouts.fee_cents` are still stored and serialized so historical records reconcile correctly.
  - New contribution rows write `fee_cents = 0`.
  - Contribution `net_cents` therefore matches `amount_cents` for new rows.
  - Historical payout math must continue using stored legacy fee values where present.

### Public vs Private Display

- **Public guest view:** percentage and totals raised vs goal are displayed. Individual contribution amounts are not displayed publicly (only aggregate progress).
- **Host view:** exact amounts, contributor details, and payout totals are displayed; active product host UI does not show charity allocation breakdown.
- **Funded state:** guest view remains gift-focused with no charity panel in active product.
- **Closed state:** contributors see "This Dreamboard has closed" with a thank-you message. CTA is disabled.

### Payments

- **No live inbound payment provider is active.** Public contribution routes now render a Stitch-coming-soon placeholder instead of a working checkout.
- **Removed runtime surfaces:** PayFast, Ozow, and SnapScan provider modules, inbound webhooks, mock/demo payment routes, and reconciliation routes are no longer part of the active runtime.
- **Future direction:** Stitch, but the integration is not implemented yet.
- **Current outbound partner webhook events:** `contribution.received`, `pot.funded`.
- **Unsupported outbound webhook subscriptions:** wildcard `*` and all non-emitted legacy event names are legacy data only and are normalized away at the webhook-endpoint boundary.

### Auth and Session Storage

- Clerk handles host and admin authentication and session state.
- Root request hook is `proxy.ts`; auth enforcement is handled in route/layout/server wrappers, not in the removed legacy root-middleware file.
- Guest/contributor routes are fully public (no auth required).
- No magic link tokens or session storage in Vercel KV.
- API key authentication (separate from Clerk) protects partner V1 API routes.
- Internal job routes are protected by `INTERNAL_JOB_SECRET` bearer token.
- `CARD_DATA_ENCRYPTION_KEY` is required at startup/readiness because active payout capture encrypts recipient data.
- Karri service credentials are required at startup/readiness only when `KARRI_AUTOMATION_ENABLED=true`, unless `MOCK_KARRI=true`.

### API Surface

- Generated OpenAPI host: `https://api.gifta.co.za/v1`
- Local OpenAPI host: `http://localhost:3000/v1`
- Active Dreamboard public contract omits charity fields from Dreamboard and contribution payloads, and filters charity payout rows from payout responses.
- Partner API key prefixes remain `cpk_live_` / `cpk_test_`
- Outgoing webhook signing headers remain `X-ChipIn-Signature` / `X-ChipIn-Event-Id`

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
- `goal_cents` (integer, minimum 0 in DB, default 0)
- `message` (nullable, host message to contributors)

Dates:
- `party_date` (date, not null — pot close reference date)
- `party_date_time` (timestamp with timezone, nullable)
- `campaign_end_date` (date, nullable — explicit campaign deadline)
- Constraint: `birthday_date <= party_date` and `campaign_end_date <= party_date` when set.

Payout:
- intended active product `payout_method` = `karri_card | bank`
- `karri_card_number` (encrypted, nullable — required when method = karri_card)
- `karri_card_holder_name` (nullable — required when method = karri_card)
- `bank_name` (nullable — required when method = bank)
- `bank_account_number_encrypted` (encrypted, nullable — required when method = bank)
- `bank_account_last4` (nullable — display only)
- `bank_branch_code` (nullable — required when method = bank)
- `bank_account_holder` (nullable — required when method = bank)
- `payout_email` (not null)

Charity:
- Schema retained for historical/internal use; active product writes clear these fields and public Dreamboard APIs omit them.
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
- `fee_cents` (integer, not null) — legacy compatibility field; new rows write `0`.
- `net_cents` (generated column: `amount_cents - fee_cents`) — legacy contribution compatibility field; equals `amount_cents` for new rows and does not drive goal progress.
- `charity_cents` (integer, nullable) — historical/internal charity allocation; active product writes `null`.
- `payment_provider` = `stitch` (enum, not null) — retained for historical/admin ledger compatibility while live guest checkout is disabled.
- `payment_ref` (not null, unique with provider), `payment_status` = `pending | processing | completed | failed | refunded`
- `payment_error_message` (nullable)
- `ip_address` (inet, nullable), `user_agent` (nullable)
- `created_at`, `updated_at`

### payouts

- `id` (UUID, PK), `partner_id` (FK), `dream_board_id` (FK)
- intended active product `type` = `karri_card | bank | charity`
- Public partner API serializes gift payout types only and filters out `charity` rows.
- `gross_cents`, `fee_cents`, `charity_cents` (default 0), `net_cents` (all integer, not null)
  - `fee_cents` remains available for historical payout rows; new fee-free contribution history will typically produce `0`.
- Constraint: `gross_cents >= net_cents`, `charity_cents >= 0`, `net_cents >= 0`
- `recipient_data` (JSONB, not null — payout-method-specific fields, encrypted where needed)
- `status` = `pending | processing | completed | failed` (enum, default `pending`)
- `external_ref` (nullable), `error_message` (nullable)
- `created_at`, `completed_at` (nullable)
- Unique constraint: `(dream_board_id, type)` — one payout row per type per board.

### payout_items

- `id` (UUID, PK), `payout_id` (FK), `dream_board_id` (FK)
- `type` = `gift | charity` (enum, not null)
- Historical/internal payout item typing remains unchanged even though active product hides charity.
- `amount_cents` (integer, not null, >= 0)
- `metadata` (JSONB, nullable)
- `created_at`

### charities

- `id` (UUID, PK), `name` (unique), `description`, `category`, `logo_url`, `website` (nullable)
- `bank_details_encrypted` (JSONB, nullable)
- `contact_name` (nullable), `contact_email` (nullable)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

### contribution_reminders

- Core fields: `id` (UUID, PK), `dream_board_id` (FK), `email`, `remind_at`, `sent_at` (nullable)
- Retry fields: `attempt_count`, `last_attempt_at`, `next_attempt_at` (not null)
- Email delivery fields: `email_sent_at`
- WhatsApp fields: `whatsapp_phone_e164`, `whatsapp_wa_id`, `whatsapp_opt_in_at`, `whatsapp_opt_out_at`, `whatsapp_sent_at`, `whatsapp_message_id`
- Unique constraint: `(dream_board_id, email, remind_at)` — idempotent deduplication (Decision Register D-007).
- Reminder scheduling maximum: 14 days. Send pipeline retries with idempotent dedupe and exponential backoff.

---

## Canonical Behavior

### Funding and Goal Progress

- **Funding phase:** gift progress advances as contributions complete; contributions can continue after goal is reached until the board is closed.
- **Raised calculations:** `raised_cents = SUM(contributions.amount_cents WHERE payment_status = 'completed')`.
- **Funded condition:** `raised_cents >= goal_cents` and `goal_cents > 0`. Fee amounts are excluded from goal progress.
- **Contributions continue past funded:** reaching the goal does not auto-close the board. The host or an explicit trigger closes it.

### Charity Allocation

- Historical legacy rule: when `charity_enabled = true` and `charity_split_type = 'percentage'`, each completed contribution allocates `amount_cents * (charity_percentage_bps / 10000)` cents to charity.
- Historical legacy rule: when `charity_enabled = true` and `charity_split_type = 'threshold'`, contributions allocate to charity until the cumulative charity total reaches `charity_threshold_cents`; subsequent contributions allocate nothing to charity.
- Active product rule: charity allocation is disabled, so all new contribution value goes to the gift goal.

### Close Conditions

- **Explicit close:** `POST /v1/dream-boards/{id}/close` with reason (`manual`, `party_date_reached`, `goal_reached`).
- **Auto-close on `campaign_end_date`:** not implemented in runtime. There is currently no in-repo scheduler that auto-closes on `party_date` or `campaign_end_date`.
- **Host/admin UI close control:** not currently exposed in dashboard/admin pages. Close is executed through partner API or direct operational tooling.
- **On close:** status transitions to `closed`; payout rows are created for the board.

### Payout Lifecycle

- On board close, the payout engine creates one gift payout row (type matches `payout_method`) and may create a historical charity payout row (type = `charity`) only when legacy charity allocation already exists.
- **Gift payout calculation:** `gross_cents = raised_cents`; `fee_cents = platform_fee_cents`; `net_cents = raised_cents - platform_fee_cents - charity_total_cents`.
  - `platform_fee_cents` may be non-zero for legacy contribution history but is `0` for newly created fee-free contributions.
- **Charity payout calculation:** `gross_cents = charity_total_cents`; `net_cents = charity_total_cents` (no additional fee on charity payouts).
- **Payout state machine:** `pending` → `processing` → `completed` or `failed`. Failed payouts may be retried (`failed` → `processing`).
- **Board `paid_out` transition:** the Dreamboard status moves to `paid_out` only when all required payout rows for that board have status `completed`.
- **Current runtime:** `karri_card` payouts can be processed automatically via Karri queue/automation. Bank and historical charity payout rows are created and tracked but not auto-executed.

### Reminder System

- Contributors may opt into a reminder when visiting a board.
- Reminders are scheduled with a maximum horizon of 14 days (Decision Register D-007).
- Deduplication is enforced by the unique constraint on `(dream_board_id, email, remind_at)`.
- Dispatch runs through `POST /api/internal/reminders/dispatch` (job-secret protected) and retries with backoff.
- Email reminder dispatch is active; WhatsApp reminder dispatch is feature-flagged (`UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH`).

---

## Implementation Phase Context

UX v2 delivery status in runtime:

- **Schema:** expanded schema is live (bank payout fields, charity split fields, reminder retry/WhatsApp fields, expanded enums).
- **Host UX flow:** 5-step create flow (`/create/child` → `/create/gift` → `/create/dates` → `/create/payout` → `/create/review`) and dashboard/admin surfaces are live.
- **Default host payout path:** new host Dreamboards use bank payout details with an optional Karri path.
- **Partner API payout contract:** `karri_card` and bank writes are active. Active Dreamboard public contract routes do not expose charity writes.
- **Payout execution:** automated execution is Karri-only; bank and historical charity payouts remain manual completion paths.

---

## Sync Rule

When code and docs diverge, update this file first, then sync supporting docs:

- `docs/Platform-Spec-Docs/` (cross-cutting platform guarantees)
- `docs/UX/ui-specs/` (screen-level UX specs and runtime overrides)
- `docs/implementation-docs/` (delivery plans and historical phase notes)

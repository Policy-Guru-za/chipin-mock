# Documentation Drift (docs vs code)

Last updated: 2026-02-05

Goal: identify every repo doc that is stale vs the current codebase, explain **why**, and state **exactly what to change**.

Primary source of truth for confirmed code reality: `docs/forensic-audit/STATE.md` (see Findings F-001..F-007).

## Blocking product decisions (need your input)

These 3 choices determine whether several docs are “wrong” vs “desired-but-not-implemented”:

1) Guest privacy: exact ZAR amounts visible to guests, or % only?
2) Pot closure: auto-close on `party_date` (via scheduler), or manual/partner-triggered only?
3) Fee semantics: fee add-on (payer pays amount+fee) or fee deducted (payer pays amount; net reduced)?

## Cross-cutting confirmed drift themes

- Guest display: docs say “% funded only”; guest UI shows ZAR totals (F-001).
- Pot auto-close: docs assert auto-close on party date; repo has no scheduler and close is API-driven (F-002).
- Webhook event catalog: docs suggest broad event emission; runtime emits only `contribution.received` + `pot.funded` (F-003).
- Karri batch retry: docs describe attempt increments; code resets attempts on `pending` (F-004).
- Fee/net accounting: code charges `amount+fee` but stores/aggregates `amount-fee` as net/raised (F-005).
- Seed/demo: seed data violates encryption + webhook type conventions (F-006).
- Branding: “ChipIn” vs “Gifta” inconsistent across docs and runtime metadata (F-007).
- Env vars: `.env.example` and `.env.demo` do not cover current runtime env usage (confirmed via `process.env.*` scan).

## Doc-by-doc update list

Legend:
- **Update required:** Yes/No
- **Why:** mismatch with current code or product reality
- **Change:** concrete edits to make

### `AGENTS.md` — Update required: Yes

- Why:
  - Claims “guests see % funded, not Rands” (line with “% funded, not Rands”) conflicts with guest UI amounts (F-001).
  - References historical stack defaults (e.g. NextAuth/magic links, DALL-E) that are not the repo reality (Clerk + Gemini).
- Change:
  - Align guest display policy with actual UX decision (see “Blocking product decisions”).
  - Replace AI image provider references with Gemini (or mark as “implementation-dependent”).
  - Add a short “Current stack (as implemented)” section: Next.js 16, React 19, Clerk, Gemini, Drizzle, Neon, KV/Blob, Resend.

### `README.md` — Update required: Yes

- Why:
  - “Guests see % funded, not Rands” (`README.md:27`, `README.md:107`) conflicts with guest UI (F-001).
  - AI images listed as OpenAI DALL-E (`README.md:94`) but code uses Gemini.
  - Tech stack says “Next.js 14+” (`README.md:83`) but `package.json` pins Next.js `16.1.4`.
  - Branding: header says ChipIn; runtime metadata says Gifta (F-007).
- Change:
  - Update guest display statement, AI provider, Next.js version, and product/brand naming.
  - Update “Getting Started” DB steps if `drizzle:generate/push` usage differs from intended workflow.

### `.env.example` — Update required: Yes

- Why:
  - Missing env vars used in code: `INTERNAL_JOB_SECRET`, `CARD_DATA_ENCRYPTION_KEY`, `KARRI_BASE_URL`, `KARRI_API_KEY`, `WHATSAPP_*`, `KARRI_*_ENABLED`, `RECONCILIATION_*`, `AXIOM_*`, `DEBUG_*`, etc.
  - Contains unused `CLERK_WEBHOOK_SIGNING_SECRET` (no reference in `src/`).
- Change:
  - Add all `process.env.*` keys used by code (grouped by subsystem).
  - Remove or clearly label unused vars as “future / not yet wired”.

### `.env.demo` — Update required: Yes

- Why:
  - Uses deprecated `DEMO_MODE` + `NEXT_PUBLIC_DEMO_MODE`; code uses `MOCK_*` feature flags instead.
  - Mentions Takealot/GivenGain automation flags that no longer exist in repo.
- Change:
  - Replace with `MOCK_PAYMENTS`, `MOCK_PAYMENT_WEBHOOKS`, `MOCK_KARRI`, `MOCK_SENTRY` and any other current sandbox toggles.

### `docs/Platform-Spec-Docs/CANONICAL.md` — Update required: Yes

- Why:
  - States “Public guest view: percentage only (no exact amounts)” (`CANONICAL.md:31`) conflicts with code (F-001).
  - Mentions close conditions “manual close or deadline” (`CANONICAL.md:74`); code has partner close endpoint but no “deadline auto-close” job (F-002).
  - “Raised calculations: net contributions” (`CANONICAL.md:73`) conflicts with current fee add-on checkout semantics (F-005).
- Change:
  - Decide guest display + fee semantics and update this file first (it claims authority).
  - If auto-close is intended: specify scheduler mechanism + endpoint used; otherwise remove “deadline/automatic” wording.

### `docs/Platform-Spec-Docs/SPEC.md` — Update required: Yes

- Why:
  - “Guest Contribution Flow … % funded (not Rands)” (`SPEC.md:90`) conflicts with guest UI (F-001).
  - Glossary: party date “automatic pot close date” (`SPEC.md:258`) conflicts with repo lack of scheduler (F-002).
  - Mentions “Pot Closure & Payout … Automatic on party date” (section around MVP features) conflicts with current implementation (F-002).
- Change:
  - Align guest display, pot closure semantics, and fee accounting with the implemented flow (or mark as planned).

### `docs/Platform-Spec-Docs/JOURNEYS.md` — Update required: Yes

- Why:
  - “Guests see % funded only (not Rand amounts)” (`JOURNEYS.md:21`) conflicts with guest UI (F-001).
  - Copy includes `chipin.co.za` URLs; runtime metadata is `gifta.co.za` (F-007).
  - References “store child details in session/draft” (`JOURNEYS.md:105–109`); code uses server actions + draft model (verify exact mechanism before editing copy).
- Change:
  - Update guest journey screens to match current UI fields and what is actually shown.
  - Confirm canonical domain/brand and update URLs and naming.

### `docs/Platform-Spec-Docs/UX.md` — Update required: Yes

- Why:
  - “Guests see % funded only (not Rand amounts)” (`UX.md:23`) conflicts with guest UI (F-001).
  - May still reference legacy “overflow/charity” behaviors present in older specs (needs sweep).
- Change:
  - Align public/private display rules with actual UI.
  - Remove/mark legacy concepts not present in code (overflow charity, hiding gift after funded, etc.) if still present.

### `docs/Platform-Spec-Docs/PAYMENTS.md` — Update required: Yes

- Why:
  - Example code shows provider payment amount = `input.amountCents` and `feeCents = calculateFee(input.amountCents)`; current implementation charges `total = contribution + fee` and stores `fee = total - contribution` (F-005).
  - Doc models “Net to ChipIn” but doesn’t map to DB `net_cents` usage (raised sums net) (F-005).
- Change:
  - Rewrite the payment lifecycle section to match actual endpoints, amount checks, and DB fields.
  - Explicitly define fee semantics and how `raised_cents` is calculated.

### `docs/Platform-Spec-Docs/DATA.md` — Update required: Yes

- Why:
  - Contains a “magic_links” section claiming KV storage (`DATA.md:627–631`); code uses Clerk and has no magic link system.
  - If fee semantics change, the meaning of `net_cents` / `raised_cents` sections must be updated (F-005).
- Change:
  - Remove or mark “magic_links” as legacy.
  - Align fee/raised definitions with current implementation intent.

### `docs/Platform-Spec-Docs/API.md` — Update required: Yes

- Why:
  - Uses `db_...` public IDs (`API.md:197`, `API.md:228`) but code uses UUIDs and/or slugs (validatePublicId accepts UUID-or-slug).
  - Response shapes include fields not present in DB (`gift_data`, `display_mode`) and may not match the generated OpenAPI used by the app.
  - Base URL uses `api.chipin.co.za`; runtime branding/domain likely shifting (F-007).
- Change:
  - Regenerate from the actual OpenAPI (`public/v1/openapi.json`) or update to match current route handlers.
  - Replace ID format guidance to match actual accepted identifiers.

### `docs/Platform-Spec-Docs/ARCHITECTURE.md` — Update required: Yes

- Why:
  - Shows an `e2e/` tests folder in repo layout; current `tests/` appears unit/integration only (verify before editing).
  - May contain legacy system components (e.g., old auth/session notes) that don’t match Clerk-only reality (needs sweep).
- Change:
  - Update repo tree snippet and test strategy section to match actual directories and scripts.
  - Confirm where scheduling happens (Vercel Cron vs external) and document it explicitly.

### `docs/Platform-Spec-Docs/INTEGRATIONS.md` — Update required: Maybe

- Why:
  - Generally aligned with Gemini/WhatsApp/Karri, but includes an internal route contract (`/api/internal/artwork/generate`) that must match code; keep synced.
  - Rate limiting for artwork generation is specified; verify implementation exists before calling it “required”.
- Change:
  - Verify artwork endpoint + rate limiting + logging behavior; update any sections that describe unimplemented controls as “planned”.

### `docs/Platform-Spec-Docs/KARRI.md` — Update required: Yes

- Why:
  - Claims “pot closes on party date” and “daily batch job (6 AM SAST)” but repo has no scheduler configuration (F-002).
  - Batch retry logic differs; code resets attempts on `pending` (F-004).
- Change:
  - Document actual invocation mechanism (internal job endpoint + external scheduler).
  - Fix retry/attempt semantics in doc to match corrected code (once bug fixed).

### `docs/Platform-Spec-Docs/SECURITY.md` — Update required: Yes

- Why:
  - Claims API keys are “hashed with bcrypt” (`SECURITY.md:97`); code hashes via SHA-256.
  - Public data list includes legacy “charity overflow” and “deadline” concepts not present in current implementation.
  - Mentions CAPTCHA; no evidence of CAPTCHA in `src/` (needs confirmation).
- Change:
  - Update API key hashing description to match code (or change code to match doc).
  - Remove/mark legacy features and security controls not implemented.

### `docs/Platform-Spec-Docs/NFR-OPERATIONS.md` — Update required: Maybe

- Why:
  - Ops/SLOs can drift quickly; verify against current monitoring/logging (Sentry/OTel/Axiom usage).
- Change:
  - Confirm alerting paths, runbooks, and current production topology (Vercel Cron?).

### `docs/MIGRATION.md` — Update required: Maybe

- Why:
  - If `DEMO_MODE → MOCK_*` migration is complete, the doc should be marked “completed/historical”; if not complete, it should reference current `.env.demo` reality (currently stale).
- Change:
  - Either mark as historical + link to updated `.env.demo`, or update steps to reflect current flags.

### `docs/demo_db_full_reset.md` — Update required: Yes

- Why:
  - Seed/demo expectations conflict with `src/lib/db/seed.ts` (raw card numbers; webhook event type string mismatch) (F-006).
  - If views/migrations changed (e.g., `0010_update_db_views.sql`), ensure the reset doc matches current SQL.
- Change:
  - Align seed/reset process with current scripts (`pnpm db:seed`, Drizzle migrations) and current view definitions.

### `docs/perf/guest-view.md` — Update required: Likely

- Why:
  - If it assumes guests see only % and no amounts, it’s stale (F-001).
- Change:
  - Align performance targets and UI payload expectations with actual guest page output.

### `docs/runbooks/*` — Update required: Maybe

- Why:
  - Runbooks must match actual job endpoints, secrets, and retry behavior; Karri/webhook changes affect them.
- Change:
  - Ensure referenced endpoints and env vars exist and match `src/app/api/internal/*`.

### `docs/Integration-docs/*` — Update required: Maybe

- Why:
  - These are integration guides; verify they reflect current Clerk/Resend usage and env vars.
- Change:
  - Update env var names and flows if they reference deprecated auth or email patterns.

### `docs/implementation-docs/*` — Update required: Maybe (labeling)

- Why:
  - Many of these are “plans” and can legitimately diverge from shipped code; they should be clearly labeled as **historical / execution plans** vs “current system behavior”.
- Change:
  - Add a short banner at the top of each plan: “Historical plan; may not match current implementation.”

### `docs/payment-docs/*` — Update required: No (as vendor references), unless they conflict with implemented mappings

- Why:
  - These look like provider references/open questions; treat as reference material.
- Change:
  - If any doc is used as normative spec for webhook parsing/signature rules, ensure it matches current code.

### `CHANGELOG.md`, `BACKLOG.md`, `TESTING.md` — Update required: Maybe

- Why:
  - `TESTING.md` should match actual `pnpm` scripts and existing suites.
  - `CHANGELOG.md` may not reflect current versioning.
- Change:
  - Verify and update only where they are actively used as canonical process docs.

## Appendix: full doc inventory (tracked files)

| File | Update required | Notes |
|---|---|---|
| `AGENTS.md` | Yes | Guest % vs amounts; stack drift (Clerk/Gemini); authoritative build guidance. |
| `README.md` | Yes | Guest display, AI provider, Next.js version, branding/domain. |
| `.env.example` | Yes | Missing many `process.env.*`; includes unused var. |
| `.env.demo` | Yes | Deprecated `DEMO_MODE`; legacy automation flags. |
| `TESTING.md` | Maybe | Verify scripts/suites match `package.json`. |
| `CHANGELOG.md` | Maybe | Ensure versioning reflects current releases. |
| `BACKLOG.md` | Maybe | Process doc only; update if workflow changed. |
| `docs/MIGRATION.md` | Maybe | Mark historical or update to match current `.env.demo`. |
| `docs/demo_db_full_reset.md` | Yes | Must align with current migrations/views + seed realities (F-006). |
| `docs/perf/guest-view.md` | Likely | If it assumes “% only”, it’s stale (F-001). |
| `docs/runbooks/payment-provider-outage.md` | Maybe | Verify endpoints/env vars referenced still exist. |
| `docs/runbooks/webhook-failure.md` | Maybe | Verify job secret, queue processor endpoint, event catalog. |
| `docs/Integration-docs/CLERK_INTEGRATION_GUIDE.md` | Maybe | Confirm matches current Clerk config/env vars and routes. |
| `docs/Integration-docs/RESEND_INTEGRATION_GUIDE.md` | Maybe | Confirm matches current email usage and env vars. |
| `docs/Platform-Spec-Docs/CANONICAL.md` | Yes | Guest privacy + close semantics + fee/raised semantics. |
| `docs/Platform-Spec-Docs/SPEC.md` | Yes | Guest privacy + party date auto-close. |
| `docs/Platform-Spec-Docs/JOURNEYS.md` | Yes | Guest privacy + domain/branding + flow details. |
| `docs/Platform-Spec-Docs/UX.md` | Yes | Guest privacy + legacy concepts sweep. |
| `docs/Platform-Spec-Docs/PAYMENTS.md` | Yes | Fee/amount semantics; endpoint contracts drift. |
| `docs/Platform-Spec-Docs/DATA.md` | Yes | Remove legacy magic_links; fee/raised semantics. |
| `docs/Platform-Spec-Docs/API.md` | Yes | ID formats + response shapes drift; align to OpenAPI/code. |
| `docs/Platform-Spec-Docs/ARCHITECTURE.md` | Yes | Repo layout/test tree drift; scheduler reality. |
| `docs/Platform-Spec-Docs/INTEGRATIONS.md` | Maybe | Generally aligned; verify stated controls exist. |
| `docs/Platform-Spec-Docs/KARRI.md` | Yes | Scheduler + retry behavior drift; pending-attempt bug. |
| `docs/Platform-Spec-Docs/SECURITY.md` | Yes | API key hashing drift; legacy features/controls drift. |
| `docs/Platform-Spec-Docs/NFR-OPERATIONS.md` | Maybe | Verify observability/ops reflect current stack. |
| `docs/implementation-docs/chipin-simplification-spec.md` | Yes | Guest privacy + auto-close + fee semantics mismatch vs current code. |
| `docs/implementation-docs/GEMINI_IMAGE_INTEGRATION.md` | Maybe | Confirm matches actual endpoint/env vars and model selection. |
| `docs/implementation-docs/SANDBOX_MODE_IMPLEMENTATION.md` | Maybe | Confirm flags match code (`MOCK_*`). |
| `docs/implementation-docs/CLERK_MIGRATION_PLAN.md` | Maybe | Likely historical; label as such if migration complete. |
| `docs/implementation-docs/CLERK_MIGRATION_EXECUTION_PLAN.md` | Maybe | Likely historical; label as such if migration complete. |
| `docs/implementation-docs/CLERK_MIGRATION_PHASE0_READINESS.md` | Maybe | Likely historical; label as such if migration complete. |
| `docs/implementation-docs/clerk-stage4-cutover.md` | Maybe | Likely historical; label as such if cutover done. |
| `docs/implementation-docs/ENTERPRISE_REMEDIATION_PLAN.md` | Maybe | Plan doc; label historical or update to current posture. |
| `docs/implementation-docs/ENTERPRISE_REMEDIATION_EXECUTION_PLAN.md` | Maybe | Plan doc; label historical or update to current posture. |
| `docs/payment-docs/STITCH.md` | No | Reference/open questions; keep unless used as normative. |
| `docs/payment-docs/payfast-developer-reference.md` | No | Reference; verify only if conflicts with implemented mapping. |
| `docs/payment-docs/payfast-open-questions.md` | No | Reference. |
| `docs/payment-docs/ozow-oneapi-developer-reference.md` | No | Reference. |
| `docs/payment-docs/ozow-oneapi-open-questions.md` | No | Reference. |
| `docs/payment-docs/snapscan-developer-reference.md` | No | Reference. |
| `docs/payment-docs/snapscan-open-questions.md` | No | Reference. |

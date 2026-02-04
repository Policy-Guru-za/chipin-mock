# ChipIn Enterprise Remediation Plan (2026-02-04)

Audience: GPT-5.2 Codex coding agent (main-only, pnpm-only).  
Goal: eliminate known correctness/security/ops/doc/tooling issues; align docs ↔ runtime; raise quality gates to “enterprise-grade”.

---

## 0) Operating Rules (Do Not Skip)

### Pre-flight: doc ingest (required)
Before implementing any change, read *all* docs under `docs/` (per `AGENTS.md`):
```bash
find docs -type f -maxdepth 6 -print
```
Then skim each file for:
- “Source of truth” claims (especially `docs/Platform-Spec-Docs/CANONICAL.md`)
- Phase gates / acceptance criteria (`docs/implementation-docs/chipin-simplification-spec.md`)
- Integration constraints (providers, Karri, Clerk)
- Security/POPIA requirements (`docs/Platform-Spec-Docs/SECURITY.md`)

### Repo policy
- Branch: `main` only (no feature branches).
- Safety: run `git status` + `git diff` before changes; never destructive ops unless explicitly requested.
- Package manager: `pnpm` only.
- Before every commit: ensure all deferrals captured in `BACKLOG.md` (owner/status/ETA).

### Stop conditions (ask 1–3 targeted questions; block execution)
If any are uncertain, stop and ask:
1) Canonical product direction: confirm “simplified Karri-only” is the current truth to encode in `docs/Platform-Spec-Docs/CANONICAL.md`.
2) Admin PII policy: confirm whether admins may ever reveal full Karri card numbers in UI (recommended: **never**; last-4 only).
3) Data retention: confirm target retention periods for (a) IP/user-agent, (b) WhatsApp number, (c) encrypted card payloads after payout.

---

## 1) Issue Register (What We Fix)

This plan addresses the following observed issues:

### Documentation / spec drift
- `docs/Platform-Spec-Docs/CANONICAL.md` describes Takealot/philanthropy/overflow + magic links, conflicting with:
  - `docs/implementation-docs/chipin-simplification-spec.md` (Karri-only, manual gift, WhatsApp notifications)
  - Runtime code (Clerk auth, Karri-only payout)
- `README.md` still claims “magic link authentication” in MVP scope; runtime is Clerk.

### Quality gate break
- `pnpm test:coverage` fails global branch threshold (58.93% < 60%).

### Tooling failure
- `pnpm knip` fails because `drizzle.config.ts` throws when `DATABASE_URL` is missing.

### Security / privacy risks
- Admin payout detail page decrypts and renders full card number:
  - `src/app/(admin)/payouts/[id]/page.tsx`
- Retention job scrubs only some PII (IP/user-agent, child name/photo, payout email, contribution name/message) but not all sensitive fields:
  - `src/app/api/internal/retention/run/route.ts`
  - Sensitive v2.0 fields live on `dream_boards`:
    - `karri_card_number` (encrypted payload in practice)
    - `karri_card_holder_name`
    - `host_whatsapp_number`

### Observability config mismatch
- `MOCK_SENTRY` exists and is documented, but Sentry init uses deprecated `isDemoMode()` (always false), so Sentry always initializes:
  - `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - `src/lib/config/feature-flags.ts` (`isMockSentry()` exists)
  - `docs/MIGRATION.md` recommends `MOCK_SENTRY=true`

### Payment creation orphan-risk
- Contribution record is inserted **after** external provider payment intent is created:
  - `src/app/api/internal/contributions/create/route.ts`
  - Risk: provider webhook arrives referencing `paymentRef`, but DB insert never happened (crash/timeout between calls).

### Distributed rate limiting gaps
- Some internal endpoints use process-local rate limiting (non-distributed), inconsistent across instances:
  - `src/app/api/internal/analytics/route.ts`
  - `src/app/api/internal/metrics/route.ts`

### Repo hygiene / legacy artifacts
- No `.gitignore`; many `.DS_Store` tracked/untracked candidates.
- Legacy Takealot-era artifacts remain (e.g., image allowlist in `next.config.js`, old scripts/docs).
- No `.env.example` present at repo root (docs reference it).
- No `.github/` CI workflow found.

---

## 2) Workstreams (Order Matters)

Execute in this order. Each workstream ends with explicit verification commands.

### Workstream A — “Truth Alignment” (Docs + repo contracts)

#### A1) Define canonical reality (v2.0 simplification)
1) Update `docs/Platform-Spec-Docs/CANONICAL.md`:
   - Remove Takealot/philanthropy/overflow logic.
   - Codify: one gift, manual definition, AI artwork, Karri-only payout.
   - Codify: Clerk auth (not magic links).
   - Codify: guest sees % only; host/admin sees amounts.
2) Update or annotate docs that conflict:
   - `docs/Platform-Spec-Docs/SPEC.md`
   - `docs/Platform-Spec-Docs/JOURNEYS.md`
   - `docs/Platform-Spec-Docs/DATA.md`
   - `docs/Platform-Spec-Docs/PAYMENTS.md`
   - `docs/Platform-Spec-Docs/INTEGRATIONS.md`
   - `docs/Platform-Spec-Docs/API.md`
   - `docs/Platform-Spec-Docs/UX.md`
3) Update `README.md`:
   - Replace “magic link auth” with Clerk.
   - Ensure MVP scope matches runtime.

Acceptance criteria
- No doc claims Takealot/philanthropy/overflow unless explicitly marked “deprecated / removed”.
- Docs explicitly point to `docs/implementation-docs/chipin-simplification-spec.md` for execution order and gates.

Verify
```bash
pnpm lint
pnpm typecheck
pnpm test
```

#### A2) Add repo-level environment contract
1) Create root `.env.example` (required; referenced in `README.md`).
2) Ensure `.env.example` includes:
   - DB: `DATABASE_URL`
   - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (+ any required by docs)
   - Internal job secret: `INTERNAL_JOB_SECRET`
   - Sandbox flags: `MOCK_PAYMENTS`, `MOCK_PAYMENT_WEBHOOKS`, `MOCK_KARRI`, `MOCK_SENTRY`
   - Providers: PayFast, Ozow, SnapScan
   - Karri: `KARRI_BASE_URL`, `KARRI_API_KEY`
   - Vercel KV/Blob
   - Resend, WhatsApp, Sentry, OTel

Use this baseline template (edit to match current runtime usage):
```bash
# Database
DATABASE_URL="postgresql://"

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# Internal job auth
INTERNAL_JOB_SECRET="generate-a-long-random-string"

# Sandbox flags
MOCK_PAYMENTS="false"
MOCK_PAYMENT_WEBHOOKS="false"
MOCK_KARRI="false"
MOCK_SENTRY="false"

# PayFast
PAYFAST_MERCHANT_ID=""
PAYFAST_MERCHANT_KEY=""
PAYFAST_PASSPHRASE=""
PAYFAST_SANDBOX="true"

# Ozow
OZOW_CLIENT_ID=""
OZOW_CLIENT_SECRET=""
OZOW_SITE_CODE=""
OZOW_BASE_URL="https://stagingone.ozow.com/v1"
OZOW_WEBHOOK_SECRET=""

# SnapScan
SNAPSCAN_SNAPCODE=""
SNAPSCAN_WEBHOOK_AUTH_KEY=""

# Karri
KARRI_BASE_URL=""
KARRI_API_KEY=""

# Email
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@chipin.co.za"
RESEND_FROM_NAME="ChipIn"

# WhatsApp
WHATSAPP_BUSINESS_API_URL=""
WHATSAPP_BUSINESS_API_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""

# Vercel KV
KV_REST_API_URL=""
KV_REST_API_TOKEN=""
KV_REST_API_READ_ONLY_TOKEN=""

# Vercel Blob
BLOB_READ_WRITE_TOKEN=""

# Sentry
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_ENVIRONMENT="development"
SENTRY_TRACES_SAMPLE_RATE="0.1"

# OTel
OTEL_EXPORTER_OTLP_ENDPOINT=""
OTEL_EXPORTER_OTLP_HEADERS=""
OTEL_SERVICE_NAME="chipin"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Encryption
CARD_DATA_ENCRYPTION_KEY="generate-a-long-random-string"
```

Acceptance criteria
- `README.md` setup instructions match actual files present.
- Local dev can run with `.env.local` copied from `.env.example` (even if integrations are mocked).

---

### Workstream B — Repo Hygiene + CI Gates

#### B1) Add `.gitignore` (and stop `.DS_Store` bleed)
1) Create `.gitignore` with at least:
```gitignore
.DS_Store
node_modules
.next
dist
coverage
.vercel
.turbo

.env
.env.*
!.env.example

*.log
pnpm-debug.log*
```
2) Remove existing `.DS_Store` files **only if explicitly requested** (otherwise: just ignore).
3) Optional (recommended): add a lightweight pre-commit guard via `lint-staged` (already present) + ensure Husky hooks exist and are documented.

Acceptance criteria
- New `.DS_Store` files don’t show in `git status`.

#### B2) Add GitHub Actions CI (missing)
1) Create `.github/workflows/ci.yml`:
   - Node 20
   - pnpm 10.14.0
   - Cache pnpm store
   - Run: `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm knip`, `pnpm build`
2) Ensure `DATABASE_URL` is not required for CI-only checks (see Workstream C).

Acceptance criteria
- CI enforces the same gates as local “full gate”.

Verify (locally)
```bash
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm knip
pnpm build
```

---

### Workstream C — Tooling Fixes (Knip + Drizzle Config)

#### C1) Make `pnpm knip` runnable without DATABASE_URL
Problem: `drizzle.config.ts` throws if `DATABASE_URL` missing.

Preferred solution (safe, explicit):
1) Update `drizzle.config.ts` to never throw at import-time.
2) Enforce `DATABASE_URL` only inside drizzle scripts in `package.json`.

Implementation sketch
```ts
// drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit will fail with a clear error when actually invoked, but knip can load the file.
    url: databaseUrl,
  },
});
```

Then hard-fail in scripts:
```jsonc
// package.json (scripts)
{
  "drizzle:generate": "node -e \"if(!process.env.DATABASE_URL){console.error('DATABASE_URL required');process.exit(1)}\" && drizzle-kit generate",
  "drizzle:push": "node -e \"if(!process.env.DATABASE_URL){console.error('DATABASE_URL required');process.exit(1)}\" && drizzle-kit push"
}
```

Acceptance criteria
- `pnpm knip` runs with no `.env.local` and produces actionable output (unused files/deps).
- `pnpm drizzle:push` still fails fast with clear error when `DATABASE_URL` is unset.

Verify
```bash
pnpm knip
```

---

### Workstream D — Observability Correctness (MOCK_SENTRY)

#### D1) Make `MOCK_SENTRY=true` actually suppress Sentry init
1) Update:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
2) Replace `isDemoMode()` checks with `isMockSentry()` (from `src/lib/demo/index.ts` or `src/lib/config/feature-flags.ts`).

Implementation sketch
```ts
import * as Sentry from '@sentry/nextjs';
import { isMockSentry } from '@/lib/demo';

if (!isMockSentry()) {
  Sentry.init({ /* ... */ });
}
```

Acceptance criteria
- With `MOCK_SENTRY=true`, Sentry does not initialize (no outbound reporting).
- Docs (`docs/MIGRATION.md`) match runtime behavior.

Verify
```bash
pnpm test
```
Add/adjust unit test if required (mock env + assert init not called).

---

### Workstream E — Payments Robustness + Accounting Correctness

#### E1) Eliminate “orphaned payment” window in contribution creation
Problem: provider payment intent created before DB insert.

Target behavior
- Always write DB row first (idempotency anchor).
- Then create provider intent.
- If provider intent fails:
  - Update contribution status to `failed` (or `cancelled`) + store error reason.
  - Return safe error to client.

Steps
1) Modify `src/app/api/internal/contributions/create/route.ts`:
   - Insert `contributions` row before `createPaymentIntent(...)`.
   - Wrap provider creation in `try/catch`.
2) Add a persisted error field (recommended) to contributions:
   - `paymentErrorMessage` (nullable text) OR structured `paymentErrorCode`.
   - Migration + schema update in `src/lib/db/schema.ts`.
3) Ensure webhooks handle:
   - PaymentRef exists but status already terminal → idempotent no-op.
   - PaymentRef missing (should be rare after this fix) → record as “unmatched webhook” for ops.

Implementation sketch (ordering)
```ts
await db.insert(contributions).values(payload.contribution);

let payment: PaymentIntent;
try {
  payment = await createPaymentIntent(provider, { /* ... */ });
} catch (e) {
  await db.update(contributions)
    .set({ paymentStatus: 'failed', paymentErrorMessage: /*...*/, updatedAt: new Date() })
    .where(eq(contributions.id, payload.contribution.id));
  throw e;
}

return NextResponse.json(payment);
```

Acceptance criteria
- Webhook can always find a contribution row for any initiated payment.
- Failure paths are visible in DB for support (status + error message).

Verify
```bash
pnpm test:payments
pnpm test:webhooks
```

#### E2) Harden webhook “missing contribution” handling
1) In each webhook route:
   - If `paymentRef` not found → persist an ops record.
2) Explicit webhook route files:
   - `src/app/api/webhooks/payfast/route.ts`
   - `src/app/api/webhooks/ozow/route.ts`
   - `src/app/api/webhooks/snapscan/route.ts`
2) Preferred persistence mechanism:
   - New table: `unmatched_provider_events` with:
     - provider, paymentRef, rawPayloadHash, receivedAt, requestId, decision, notes
   - OR reuse `audit_logs` with `targetType='unmatched_webhook'`.

Acceptance criteria
- No silent drop of provider webhooks.
- Ops can search unmatched events and reconcile manually.

#### E3) Reconciliation improvements
1) Ensure reconciliation job includes:
   - “unmatched events” triage
   - PayFast pending visibility (even if provider fetch isn’t available, produce a clear report)
2) Add a dry-run mode:
   - `?dryRun=1` or env toggle; returns what would be updated.

Acceptance criteria
- Reconcile job produces deterministic, auditable output.

---

### Workstream F — Privacy + Admin PII Redaction

#### F1) Remove full card number display from admin UI
Problem: `src/app/(admin)/payouts/[id]/page.tsx` decrypts and renders full card.

Target behavior (recommended)
- UI shows last 4 digits only.
- Never decrypt full card for display.
- If ops absolutely need full number, require out-of-band access (logs/secure vault), not UI.

Implementation sketch
```ts
const maskCard = (card: string) => {
  const last4 = card.slice(-4);
  return `**** **** **** ${last4}`;
};
```
Apply after decryption OR (preferred) store last4 separately and never decrypt in UI.

Acceptance criteria
- No full PAN appears in rendered HTML for admin pages.
- Audit trail unaffected.

Verify
```bash
pnpm test
pnpm lint
```

#### F1.5) (Recommended) Normalize naming for encrypted card fields
Problem: DB column is named `karri_card_number` but stores encrypted payload (per create flow); this is easy to misuse.

Preferred target state
- DB column renamed to `karri_card_number_encrypted` (migration).
- Store last-4 separately for display and debugging:
  - `karri_card_last4` (varchar(4), nullable)

Steps
1) Add new columns, backfill, then cut reads/writes:
   - Migration adds:
     - `dream_boards.karri_card_number_encrypted`
     - `dream_boards.karri_card_last4`
   - Backfill from existing `karri_card_number` by:
     - copying encrypted payload to `_encrypted`
     - decrypting once (migration script in Node) to compute last4 (do not store plaintext)
2) Update write paths:
   - `src/app/(host)/create/details/page.tsx`
   - `src/app/api/v1/dream-boards/route.ts`
3) Update read paths:
   - payout creation / Karri batch code paths (use encrypted column)
   - admin UI uses last4 only
4) Deprecate/remove old `karri_card_number` column in a later migration (after verification).

Acceptance criteria
- No code path can accidentally treat `karri_card_number` as plaintext PAN.

#### F2) Extend retention job to cover v2.0 sensitive fields
Current: scrubs IP/user-agent; anonymizes child and payoutEmail; clears contribution name/message.

Add v2.0 scrubs (subject to product/legal policy)
- `dream_boards.host_whatsapp_number`
- `dream_boards.karri_card_number`
- `dream_boards.karri_card_holder_name`
- Consider `dream_boards.gift_image_prompt` (can contain sensitive content)
- Consider `payouts.recipient_data` after completion (if it contains PAN-like values)

Steps
1) Update `src/app/api/internal/retention/run/route.ts`:
   - Extend `.set({ ... })` for eligible boards.
2) Update `src/lib/retention/retention.ts`:
   - Add constants for anonymized values.
   - Define cutoffs explicitly (boardCutoff should consider payout completion date if applicable).
3) Add tests:
   - Unit test: cutoff calculation
   - Integration test: eligible boards get scrubbed; ineligible do not

Acceptance criteria
- All high-risk PII fields are scrubbed per retention policy.
- Retention is idempotent and safe to rerun.

---

### Workstream G — Distributed Rate Limiting Consistency

Steps
1) Identify endpoints using in-memory maps for rate limiting.
   - Replace with `enforceRateLimit(...)` (KV-backed) where possible.
   - Known in-memory endpoints:
     - `src/app/api/internal/analytics/route.ts`
     - `src/app/api/internal/metrics/route.ts`
2) If KV is not configured in dev, ensure safe fallback behavior remains acceptable (dev-only).

Acceptance criteria
- Rate limiting behavior consistent across serverless instances.

---

### Workstream H — Complexity Reduction + Coverage Recovery

#### H1) Refactor complex webhook handlers
Goal: reduce ESLint complexity/max-lines hotspots; increase testability.

Steps (pattern)
1) For each webhook route:
   - Extract pure functions:
     - parseRawBody
     - verifySignature
     - validateAmount
     - mapProviderStatus → internal status
     - buildStateTransition
   - Keep route handler as orchestration only.
2) Add unit tests for pure functions:
   - signature mismatch
   - replay / timestamp out-of-range
   - amount mismatch
   - idempotent re-delivery

Acceptance criteria
- Lint warnings reduced (complexity, max-lines).
- Coverage increases above branch threshold.

Verify
```bash
pnpm lint
pnpm test:coverage
```

#### H2) Patch branch coverage gap (targeted)
Steps
1) Use coverage report to identify lowest-branch files (focus on:
   - webhook edge cases
   - payment creation failure path
   - retention eligibility logic
   - feature-flag branches)
2) Add tests that execute missing branches (do not add “meaningless” tests).

Acceptance criteria
- `pnpm test:coverage` passes all thresholds.

---

### Workstream I — Legacy Cleanup

Steps
1) Remove/adjust Takealot remnants:
   - `next.config.js` image allowlist entries for Takealot (if still present).
   - Old scripts/tests/docs referencing Takealot/philanthropy/overflow unless explicitly retained as “historical”.
2) Ensure OpenAPI and partner docs reflect current endpoints and auth.

Acceptance criteria
- No dead integration references remain in runtime config.
- `pnpm knip` reports reduced unused surface area.

---

## 3) Implementation Gate (Definition of Done)

The remediation cycle is “done” only when:
- `pnpm lint` passes (warnings acceptable only if explicitly justified in `BACKLOG.md`).
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm test:coverage` passes thresholds.
- `pnpm knip` runs and output is triaged (fix or record in `BACKLOG.md`).
- Sensitive data redaction verified (admin UI no full PAN; retention covers required fields).
- Docs reflect runtime (CANONICAL + README + Platform-Spec docs coherent).

Suggested final verification
```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm knip && pnpm build
```

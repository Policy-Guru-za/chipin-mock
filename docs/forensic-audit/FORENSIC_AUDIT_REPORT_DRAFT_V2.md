# FORENSIC CODEBASE AUDIT REPORT (Draft v2)

## Gifta Codex 5.3

Birthday gift crowdfunding platform.

Stack: Next.js 16.1.4, React 19.2.3, TypeScript, PostgreSQL, Drizzle ORM.

## Report Metadata

| Field | Value |
|---|---|
| Report date | February 6, 2026 |
| Draft version | v2 (revised for evidence rigor and severity accuracy) |
| Audit type | Comprehensive forensic code review (read-only) |
| Repository | `gifta-codex5.3` |
| Branch | `main` |
| Audited commit | `5b185ff1932a5a68b2537ee824cf1fd0e195d4b0` |
| Audit timestamp (UTC) | `2026-02-06T12:27:30Z` |
| Source files analyzed | 199 (`20,274` LOC) |
| Test files analyzed | 90 (`8,069` LOC) |
| SQL migrations analyzed | 13 |

## Finding Classification Standard

- `Validated`: confirmed with direct code evidence in this draft cycle.
- `Needs recheck`: inherited from prior report, plausible, but not re-verified line-by-line in this revision cycle.
- `Confidence`: 0.0 to 1.0 based on evidence strength.

## Executive Summary

Overall risk rating: **HIGH**.

The codebase shows strong engineering hygiene (strict TypeScript, broad validation, good CI gates, extensive testing). However, four issues remain materially high-impact and require immediate remediation:

1. Host identity reassignment can enable account takeover.
2. Webhook completion side effects can race and duplicate downstream partner event emission.
3. Contribution/fee/raised semantics are internally inconsistent and can distort funding and payout behavior.
4. Internal job secret comparison uses non-constant-time string equality.

This draft corrects overstatements from prior versions:

- Debug endpoint risk is real but was overstated as broad unauthenticated exposure.
- Ozow secret handling is fail-closed (not a direct signature bypass), but is still operationally weak.
- Charity FK deletion concern is more policy/data-governance than direct exploit.

---

## 1) Critical Findings (Validated)

### C1. Host Account Takeover via Clerk User Reassignment

- Severity: `CRITICAL`
- Status: `Validated`
- Confidence: `0.95`
- Primary evidence:
  - `src/lib/auth/host-mapping.ts:43`
  - `src/lib/auth/host-mapping.ts:48`
  - `src/lib/auth/host-mapping.ts:71`
  - `src/lib/auth/clerk-wrappers.ts:25`
- Exploitability conditions:
  - attacker can authenticate to Clerk with same normalized email as existing host
  - system auto-links by email and permits reassignment of `clerkUserId`
- Impact:
  - unauthorized access to host boards, payout controls, and related data
- Recommended remediation:
  1. block automatic reassignment when `hosts.clerk_user_id` already set
  2. require explicit ownership transfer workflow with audit trail
  3. require verified primary email and immutable host linkage policy
- Required regression tests:
  - `AUTH-RT-01`: existing host cannot be rebound to different Clerk user
  - `AUTH-RT-02`: first-time bind allowed only when `clerk_user_id` null
  - `AUTH-RT-03`: ownership transfer requires explicit privileged action

### C2. Webhook Idempotency Side-Effect Race (Duplicate Partner Events)

- Severity: `CRITICAL`
- Status: `Validated`
- Confidence: `0.90`
- Primary evidence:
  - `src/app/api/webhooks/payfast/route.ts:211`
  - `src/app/api/webhooks/payfast/route.ts:215`
  - `src/app/api/webhooks/ozow/route.ts:107`
  - `src/app/api/webhooks/ozow/route.ts:111`
  - `src/app/api/webhooks/snapscan/route.ts:167`
  - `src/app/api/webhooks/snapscan/route.ts:171`
  - `src/lib/db/queries.ts:326`
- Exploitability conditions:
  - concurrent webhook deliveries for same contribution during pending/processing window
  - both handlers proceed to side effects despite state transition race
- Impact:
  - duplicate partner webhook emissions (`contribution.received` / `pot.funded`)
  - downstream double-processing risk
- Correct remediation pattern (replacing prior flawed recommendation):
  1. make state transition atomic with a single guarded write (e.g., `UPDATE ... WHERE status != 'completed' RETURNING ...`)
  2. emit side effects only when transition row actually changed
  3. optionally add row-level locking in a transaction for stricter serialization
- Required regression tests:
  - `WH-RT-01`: concurrent duplicate webhook callbacks produce one downstream partner emission
  - `WH-RT-02`: idempotent repeat callback after completion is side-effect-free

### C3. Financial Semantics Mismatch (Contribution, Net, Raised)

- Severity: `CRITICAL`
- Status: `Validated`
- Confidence: `0.92`
- Primary evidence:
  - `src/lib/payments/fees.ts:10`
  - `src/app/api/internal/contributions/create/route.ts:92`
  - `src/lib/db/schema.ts:252`
  - `src/lib/db/queries.ts:101`
- Exploitability conditions:
  - current system computes checkout total as contribution plus fee
  - progress/raised values use `net_cents = amount - fee`
- Impact:
  - potential distortion in funded thresholds, reporting, and payout expectations
  - partner- and user-visible amount discrepancies
- Recommended remediation:
  1. lock single canonical money model in decision register and code constants
  2. align contribution write path, aggregate queries, funded transition logic, and payout calculations
  3. update API and UX copy to reflect exact semantics
- Required regression tests:
  - `MONEY-RT-01`: raised amount reflects chosen canonical semantics
  - `MONEY-RT-02`: funded transitions match same semantic model
  - `MONEY-RT-03`: payout totals reconcile against contribution ledger

### C4. Internal Job Secret Uses Non-Constant-Time Compare

- Severity: `CRITICAL`
- Status: `Validated`
- Confidence: `0.80`
- Primary evidence:
  - `src/lib/api/internal-auth.ts:13`
  - `src/lib/api/internal-auth.ts:14`
- Exploitability conditions:
  - attacker can repeatedly probe internal endpoints and measure response timing with enough precision
- Impact:
  - potential secret leakage over many probes in favorable network conditions
- Recommended remediation:
  1. use constant-time buffer comparison (`crypto.timingSafeEqual`)
  2. reject mismatched lengths safely before compare
  3. maintain uniform response behavior for auth failures
- Required regression tests:
  - `INTAUTH-RT-01`: valid secret accepted
  - `INTAUTH-RT-02`: invalid secret rejected with same failure shape
  - `INTAUTH-RT-03`: compare path uses constant-time helper

---

## 2) High Findings (Revised)

| ID | Finding | Severity | Status | Confidence | Evidence | Notes |
|---|---|---|---|---|---|---|
| H1 | Debug auth-events endpoint can be enabled in production; sensitive telemetry query surface exists | HIGH | Validated | 0.75 | `src/app/api/internal/debug/auth-events/route.ts:26`, `src/app/api/internal/debug/auth-events/route.ts:89` | Prior report overstated as broad unauth exposure. Actual model: requires app auth + debug key; still high-impact misconfig risk. |
| H2 | Karri credit queue FK has no explicit `onDelete` action | HIGH | Validated | 0.80 | `src/lib/db/schema.ts:478` | Data lifecycle integrity issue; orphan behavior should be made explicit (`cascade` or `restrict`) by policy. |
| H3 | Anonymous API auth-fail limiter set high (`1000`), IP-based only | HIGH | Validated | 0.78 | `src/lib/api/handler.ts:11` | Brute-force/noise resilience concern. |
| H4 | Clerk claim-derived email trusted before explicit user fetch | HIGH | Validated | 0.65 | `src/lib/auth/clerk.ts:47`, `src/lib/auth/clerk.ts:48` | Threat depends on trust boundary assumptions for Clerk session claims. |
| H5 | Admin allowlist parsing has no syntax validation | HIGH | Validated | 0.70 | `src/lib/auth/admin-allowlist.ts:1` | Misconfiguration hardening gap. |
| H6 | API key lookup lacks composite index on `(key_prefix, key_hash)` | HIGH | Validated | 0.82 | `src/lib/db/schema.ts:393`, `src/lib/api/auth.ts:76` | Primarily performance/reliability under load. |
| H7 | PayFast reconciliation lacks provider-side transaction verification | HIGH | Validated | 0.82 | `src/lib/payments/reconciliation-job.ts:137` | Reconciliation blind spot for PayFast. |
| H8 | Ozow secret-missing path fails closed but is operationally silent | HIGH | Validated | 0.73 | `src/lib/payments/ozow.ts:147`, `src/lib/payments/ozow.ts:149` | Corrected from prior “signature bypass” phrasing. |
| H9 | Cross-provider amount parsing paths are not normalized consistently | HIGH | Needs recheck | 0.55 | `src/lib/payments/ozow.ts:177` | Re-verify against full SnapScan and PayFast parser matrix. |
| H10 | `webhook_events` lacks direct `partner_id` column | HIGH | Needs recheck | 0.50 | `src/lib/db/schema.ts:426` | Could be acceptable via `api_key_id`; reclassify after data-access review. |

---

## 3) Medium Findings (Selected)

| ID | Finding | Status | Confidence | Evidence |
|---|---|---|---|---|
| M1 | Encryption key derivation is single-pass SHA-256, not KDF | Validated | 0.85 | `src/lib/utils/encryption.ts:11` |
| M2 | Pagination cursor is base64url-encoded, unsigned | Validated | 0.88 | `src/lib/api/pagination.ts:11` |
| M3 | Reconciliation external fetch calls generally lack explicit timeout wrappers | Validated | 0.72 | `src/lib/payments/reconciliation-job.ts:188`, `src/lib/payments/reconciliation-job.ts:264` |
| M4 | No explicit CSP policy configured in Next config | Validated | 0.84 | `next.config.js:3` |
| M5 | IPv6 not supported in IP range utility | Validated | 0.90 | `src/lib/utils/ip.ts:23` |

Other medium/low findings from prior report should be treated as `Needs recheck` unless revalidated line-by-line in this cycle.

---

## 4) Domain Assessment (Revised)

### Security/Auth

- Strength: Clerk middleware gate in place; non-public API routes require auth context.
- Critical gap: host remap logic permits account takeover path.
- Critical gap: internal job secret compare not constant-time.

### Payments/Webhooks

- Strength: signature checks and amount checks exist per provider flow.
- Critical gap: webhook side-effect idempotency race.
- Critical gap: money semantics mismatch can corrupt funded/payout truth.

### Data Layer

- Strength: strong schema constraints and generated columns.
- High gap: unresolved explicit deletion policy for Karri queue FK.
- High/medium gap: indexing improvements for auth and audit hot paths.

### Observability/Operations

- Strength: broad logs + Sentry hooks + internal job surfaces.
- High gap: debug endpoint operational risk when enabled in production.

---

## 5) Remediation Roadmap (Revised)

## Phase 1: Immediate (Before Production Traffic)

1. Fix host mapping reassignment vulnerability (`C1`).
2. Make webhook completion side effects atomically idempotent (`C2`).
3. Resolve and codify contribution/fee/raised semantics (`C3`).
4. Replace internal job auth compare with constant-time implementation (`C4`).

## Phase 2: Before Next Release

1. Restrict and harden production debug endpoint strategy (`H1`).
2. Define and enforce explicit Karri queue FK delete policy (`H2`).
3. Tighten anonymous auth-fail rate limits and abuse controls (`H3`).
4. Add admin allowlist validation and startup fail-fast (`H5`).
5. Add `(key_prefix, key_hash)` composite index and verify query plans (`H6`).
6. Expand PayFast reconciliation verification path (`H7`).

## Phase 3: Current Quarter

1. Upgrade encryption key derivation to KDF (scrypt/PBKDF2) with migration plan (`M1`).
2. Sign pagination cursors with HMAC (`M2`).
3. Add timeout + retry budget controls for reconciliation fetches (`M3`).
4. Add explicit CSP policy (`M4`).
5. Add IPv6 support in IP utilities (`M5`).

---

## 6) Regression Test Backlog (Mandatory)

| Test ID | Scope | Priority |
|---|---|---|
| AUTH-RT-01..03 | Host identity mapping and reassignment prevention | P0 |
| WH-RT-01..02 | Concurrent webhook idempotency and side-effect dedupe | P0 |
| MONEY-RT-01..03 | Money semantics consistency across create/funded/payout | P0 |
| INTAUTH-RT-01..03 | Internal job auth compare hardening | P0 |
| OPS-RT-01 | Debug endpoint disabled by default and inaccessible in production unless explicit secure mode | P1 |
| PERF-RT-01 | API key lookup query plan with composite index | P1 |

---

## 7) Notable Strengths (Retained)

- Strong TypeScript strictness and validation culture.
- Broad unit/integration test footprint.
- ORM-based query safety reducing SQL injection risk.
- Clear middleware and route partitioning strategy.
- Structured observability hooks and audit events.

---

## 8) Methodology and Limitations

This revision cycle focused on high-impact findings and accuracy corrections from the prior report.

What changed in this draft:

1. Added direct file-line evidence for revised top findings.
2. Added exploitability conditions and confidence scoring.
3. Corrected overstatement of debug endpoint exposure model.
4. Corrected webhook race remediation guidance.
5. Added missing critical money semantics inconsistency finding.
6. Split findings into `Validated` vs `Needs recheck` for audit integrity.

Recommended next step:

- produce a full revalidation pass for every non-validated medium/low item and lock final counts.

---

End of report (Draft v2).

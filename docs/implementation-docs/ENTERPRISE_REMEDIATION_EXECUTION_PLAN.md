# Enterprise Remediation Execution Plan (Sequenced)

> **Status note (2026-02-05):** execution plan. Use as reference; sequencing/decisions may not match the current shipped behavior.

Audience: Delivery team / coding agent on `main` (pnpm only).  
Scope: Implement workstreams **C → D → F → E → G → B2 → H**, then **A** last.  
Policy decisions confirmed:
- Canonical direction: **simplified Karri‑only + Clerk auth** (no Takealot/philanthropy/magic links).
- Admin PII: **never show full PAN** (last‑4 only).
- Retention: **extend current policy** to cover WhatsApp + card fields.

---

## Sequencing Rationale
1. **C** unblocks tooling (knip) and CI.
2. **D** correctness for observability flags.
3. **F** security/privacy fixes early (PII exposure).
4. **E** payment correctness (orphan prevention) before ops/CI.
5. **G** distributed rate limiting consistency.
6. **B2** CI once tooling is safe.
7. **H** coverage once correctness is stable.
8. **A last** to align docs with final code and confirmed policies.

---

## Workstream C — Knip/Drizzle Import Safety
**Goal:** `pnpm knip` runs without `DATABASE_URL` set.

**Tasks**
- Make `drizzle.config.ts` non‑throwing at import time.
- Move `DATABASE_URL required` guard into drizzle scripts in `package.json`.

**Acceptance**
- `pnpm knip` runs without `.env.local`.
- `pnpm drizzle:push` fails fast with a clear error when `DATABASE_URL` is missing.

**Verify**
```bash
pnpm knip
```

---

## Workstream D — MOCK_SENTRY Correctness
**Goal:** `MOCK_SENTRY=true` suppresses Sentry initialization.

**Tasks**
- Replace `isDemoMode()` checks with `isMockSentry()` in:
  - `sentry.client.config.ts`
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
- Add/adjust test to assert init skipped when mocked.

**Acceptance**
- No Sentry init when `MOCK_SENTRY=true`.

**Verify**
```bash
pnpm test
```

---

## Workstream F — Admin PII + Retention
**Goal:** No full PAN in UI; retention scrubs WhatsApp + card data.

**Tasks**
- Admin payouts page: show **last‑4 only** and avoid raw recipient data dumps.
- Extend retention job to scrub:
  - `host_whatsapp_number`
  - encrypted card payload
  - `karri_card_holder_name`
- Add tests for retention eligibility and scrubbed fields.

**Acceptance**
- Full PAN never rendered in admin UI.
- Retention covers WhatsApp + card fields per current policy.

**Verify**
```bash
pnpm lint
pnpm test
```

---

## Workstream E — Payment Creation Ordering + Failure Persistence
**Goal:** Eliminate orphaned payments; persist failures.

**Tasks**
- Insert contribution **before** creating provider intent.
- On intent creation failure, update contribution with failed status and error info.
- Ensure webhook handlers are idempotent if rows already terminal.

**Acceptance**
- Provider webhooks always find a contribution row.
- Failure states are persisted for support.

**Verify**
```bash
pnpm test
```

---

## Workstream G — Distributed Rate Limiting
**Goal:** Replace in‑memory limits with KV‑backed `enforceRateLimit`.

**Tasks**
- Update internal endpoints still using process‑local limits
  (e.g., `internal/analytics`, `internal/metrics`).
- Ensure dev fallback behavior remains acceptable when KV not configured.

**Acceptance**
- Rate limiting consistent across instances.

**Verify**
```bash
pnpm test
```

---

## Workstream B2 — CI Workflow
**Goal:** Add CI once tooling is safe.

**Tasks**
- Add `.github/workflows/ci.yml` with Node 20 + pnpm 10.14.0.
- Run: `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm knip`, `pnpm build`.

**Acceptance**
- CI mirrors local full gate without failing on missing `DATABASE_URL`.

**Verify**
```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm knip && pnpm build
```

---

## Workstream H — Coverage Recovery
**Goal:** Raise branch coverage above threshold (≥60%).

**Tasks**
- Use coverage report to target low‑branch areas:
  - webhooks edge cases
  - payment intent failure paths
  - retention eligibility
  - feature‑flag branches
- Add meaningful tests only (no dead/empty assertions).

**Acceptance**
- `pnpm test:coverage` passes all thresholds.

**Verify**
```bash
pnpm test:coverage
```

---

## Workstream A — Docs Truth Alignment (Last)
**Goal:** Align docs to the simplified Karri‑only + Clerk runtime.

**Tasks**
- Update `CANONICAL.md` and related Platform‑Spec docs to remove Takealot/magic links.
- Ensure docs point to `chipin-simplification-spec.md` for gates and flow.
- Update `README.md` to match runtime auth and env setup.
- Audit `.env.example` contents against runtime usage.

**Acceptance**
- No doc contradicts the simplified Karri‑only model.
- README + `.env.example` reflect actual runtime config.

**Verify**
```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

## Global Validation Gate (Final)
```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm knip && pnpm build
```

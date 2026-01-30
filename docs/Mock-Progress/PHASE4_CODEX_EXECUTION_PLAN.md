---
title: "ChipIn DEMO_MODE — Phase 4 Completion Execution Plan (GPT-5.2 Codex)"
owner: "Engineering"
date: "2026-01-30"
status: "Ready for implementation"
---

# ChipIn DEMO_MODE — Phase 4 Completion Execution Plan (GPT-5.2 Codex)

## Objective
Finish the remaining DEMO_MODE work with **enterprise-grade safety guarantees**:

1. **Zero real external API calls** in DEMO_MODE, even if internal jobs are triggered accidentally.
2. **Resettable, deterministic demo** (clear state + reseed) via UI and API.
3. Clear **visual indicators** and **operator affordances** in demo.
4. Health checks that are **demo-safe** (no direct `@vercel/kv` access).
5. Demo seed data aligned with the documented walkthrough personas.

This plan is written so an implementation agent can execute it end-to-end without additional context.

## Non-goals
- Changing production behavior beyond adding demo-only guards.
- Re-architecting the caching layer, payments abstraction, or auth.
- Introducing new external dependencies.

## Ground rules / invariants
- **DEMO_MODE must never call external services** (payments providers, KV, Blob, analytics, Sentry, OTEL, email). Demo mocks must preserve response *shape*.
- **Hard production DB guard** must remain intact (already implemented in `src/lib/demo/index.ts` and wired in `src/instrumentation.ts`).
- Dream Board invariant: **exactly one gift per board**.
- Prefer **server-side gating** (`notFound`/404) for demo-only pages/routes.
- Use existing utilities:
  - `isDemoMode()` from `src/lib/demo/index.ts`
  - `kvAdapter` from `src/lib/demo/kv-adapter.ts`
  - `demoKv.clear()` from `src/lib/demo/kv-mock.ts` (to be invoked by reset)
  - reconciliation helpers in `src/lib/payments/reconciliation-job.ts`

**Client-side demo detection requirement**
- Demo-only UI affordances (e.g. Header “Reset demo”) run in client components.
- Therefore `isDemoMode()` **must** read `process.env.NEXT_PUBLIC_DEMO_MODE` in addition to `process.env.DEMO_MODE`.
- Verify `src/lib/demo/index.ts` matches:
  ```ts
  export const isDemoMode = (): boolean =>
    process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  ```
  If it doesn’t, update it before implementing UI polish.

## Pre-flight checklist (do before coding)
1. `git status` is clean (ignore `tsconfig.tsbuildinfo` if it churns, but do not commit it).
2. Confirm scripts:
   - Lint: `pnpm lint`
   - Typecheck: `pnpm typecheck`
   - Tests: `pnpm test`
3. Identify baseline test count and ensure it remains stable after changes.

---

# Implementation order (strict)

## P0 — Reconciliation explicit no-op (safety guarantee)

### Why this is P0
The internal reconciliation endpoint (`/api/internal/payments/reconcile`) is designed to poll providers (Ozow/SnapScan). If invoked in DEMO_MODE, it must be a **hard no-op** to uphold the demo’s fundamental promise.

### Target behavior
When `isDemoMode()` is true:
- `/api/internal/payments/reconcile` returns HTTP 200 and a response matching the standard reconcile response shape.
- The handler must **not**:
  - query providers,
  - query DB for pending contributions,
  - send mismatch alert emails,
  - emit noisy logs.

### Files to modify
1. `src/app/api/internal/payments/reconcile/route.ts`
2. `src/lib/payments/reconciliation-job.ts`
3. Add/extend tests in `tests/integration/reconcile-payments.test.ts`

### Step-by-step implementation

#### 1) Guard the route handler (primary enforcement)
File: `src/app/api/internal/payments/reconcile/route.ts`

Add an early return near the start of `POST` **after authorization checks** (so the endpoint remains protected), but **before** any DB access.

Implementation outline:
- Import `isDemoMode`.
- If demo:
  - Build empty results using existing helpers:
    - `createEmptyReconciliationResult()`
    - `buildReconciliationResponse(...)`
    - `getReconciliationWindow(now)` and `getLongTailStart(now)`
  - Return `NextResponse.json(...)` with the same top-level response structure as normal.

Pseudo-code sketch (ensure imports match actual modules):
```ts
import { isDemoMode } from '@/lib/demo';

export async function POST(request: NextRequest) {
  // existing secret checks + isAuthorized(...)

  if (isDemoMode()) {
    const now = new Date();
    const { lookbackStart, cutoff } = getReconciliationWindow(now);
    const longTailStart = getLongTailStart(now);

    const empty = createEmptyReconciliationResult();
    return NextResponse.json(
      buildReconciliationResponse({
        primary: empty,
        longTail: empty,
        lookbackStart,
        cutoff,
        longTailStart,
      })
    );
  }

  // existing logic...
}
```

Notes:
- Keep response fields identical (updated/failed/mismatches/unresolved/window/longTail).
- Do **not** call `sendMismatchAlert()` in demo.
- Prefer to skip additional logging in demo to keep demo output clean.

#### 2) Guard the job function (defense-in-depth)
File: `src/lib/payments/reconciliation-job.ts`

Add an `isDemoMode()` guard at the start of `reconcilePending()`:
- If demo: return `createEmptyReconciliationResult()` immediately.

Pseudo-code:
```ts
import { isDemoMode } from '@/lib/demo';

export const reconcilePending = async (...) => {
  if (isDemoMode()) return createEmptyReconciliationResult();
  // existing logic...
}
```

Rationale:
- Prevent future regressions where another caller invokes `reconcilePending()` directly.

#### 3) Tests
File: `tests/integration/reconcile-payments.test.ts`

Add a new test block that:
- Sets `process.env.DEMO_MODE = 'true'` (or `NEXT_PUBLIC_DEMO_MODE = 'true'`).
- Ensures authorization is satisfied (`INTERNAL_JOB_SECRET`).
- Mocks provider modules and DB query modules with spies.
- Imports handler after env setup (`vi.resetModules()` then `import(...)`).
- Calls `POST`.

Assertions:
- Response `status === 200`.
- Response payload reflects empty results (`updated === 0`, `scanned === 0`, etc.).
- DB query functions (`listContributionsForReconciliation`, `listContributionsForLongTailReconciliation`) are **not called**.
- Provider list functions (`listOzowTransactionsPaged`, `listSnapScanPayments`) are **not called**.

Important testing detail:
- Because `isDemoMode()` reads `process.env`, you must set env vars **before** importing the handler module.

#### 4) Run validation
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

---

## P0 — Phase 4.10 Reset mechanism

### Target behavior
In DEMO_MODE:
- `/demo/reset` provides a simple UI to reset demo state.
- Clicking “Reset” triggers `POST /api/demo/reset`.
- Reset performs:
  1) best-effort clear of demo KV in-memory store,
  2) DB reseed to deterministic demo state,
  3) returns `{ ok: true, demo: true, ... }`.

Outside DEMO_MODE:
- `/demo/reset` is not accessible (`notFound`).
- `/api/demo/reset` returns 404.

### Files to create/modify
Create:
1. `src/app/api/demo/reset/route.ts`
2. `src/app/demo/reset/page.tsx`
3. (Optional but recommended) `src/app/demo/reset/ResetClient.tsx` (client component for button state)

Modify:
4. `src/lib/demo/kv-mock.ts` (only if needed to export an explicit `clearDemoKv()` helper; otherwise call `demoKv.clear()` directly)
5. Add tests under `tests/integration/` (recommended) and/or `tests/unit/`.

### Step-by-step implementation

#### 1) Introduce demo seed entrypoint used by reset (do this first)
Implement `seedDemoDatabase()` now (do not defer to P2). This avoids the “slug mismatch” footgun where reset UI links point at the wrong seeded board.

**Additionally:** export a canonical slug constant from the same module to keep UI and seed aligned:
```ts
export const DEMO_SEEDED_BOARD_SLUG = 'emma-birthday-demo';
```

#### 2) Implement `POST /api/demo/reset`
File: `src/app/api/demo/reset/route.ts`

Requirements:
- Only works in demo.
- Serializes concurrent resets within a single process.

Implementation details:
- Import:
  - `isDemoMode` from `@/lib/demo`
  - `demoKv` or a `clear()` helper from `@/lib/demo/kv-mock`
  - `seedDemoDatabase` (to be created) from `@/lib/db/seed-demo`
  - `NextResponse`
- Use a module-scoped promise lock:
  - `let resetPromise: Promise<unknown> | null = null;`
  - If a reset is already in progress, await it and return success.
  - Otherwise create one and clear it in `finally`.

Pseudo-code:
```ts
import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';
import { demoKv } from '@/lib/demo/kv-mock';
import { seedDemoDatabase } from '@/lib/db/seed-demo';

let resetPromise: Promise<void> | null = null;

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (!resetPromise) {
    resetPromise = (async () => {
      demoKv.clear();
      await seedDemoDatabase();
    })().finally(() => {
      resetPromise = null;
    });
  }

  await resetPromise;
  return NextResponse.json({ ok: true, demo: true });
}
```

#### 2a) Add a `GET` handler for `/api/demo/reset` (minor ergonomics)
Also export `GET` from the same route file to avoid confusing 404s when someone navigates directly to the API path.

Required behavior:
- In demo: respond with 405 and a small JSON body pointing to `/demo/reset`.
- Not in demo: same as other demo endpoints (404).

Example:
```ts
export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(
    { error: 'method_not_allowed', hint: 'Use POST or visit /demo/reset' },
    { status: 405 }
  );
}
```

Notes:
- `demoKv.clear()` is synchronous; call it before reseeding.
- Do not accept arbitrary parameters in reset route.
- Do not log sensitive env.

#### 3) Implement `/demo/reset` UI
File: `src/app/demo/reset/page.tsx`

Requirements:
- Server-side `notFound()` when not demo.
- Simple UI with a single reset CTA.

Implementation approach:
- Server page:
  - `if (!isDemoMode()) notFound();`
  - Render a card similar to `/demo/payment-simulator` styling.
  - Include a client component for calling reset (to manage loading/errors).

Client component responsibilities:
- Trigger `fetch('/api/demo/reset', { method: 'POST' })`.
- On success:
  - show “Reset complete”.
  - show links to `/create` and the canonical seeded board slug.

**Slug consistency requirement:**
- Do not hardcode the seeded slug in multiple places.
- Import `DEMO_SEEDED_BOARD_SLUG` from `src/lib/db/seed-demo.ts` in the server page, and pass it into the client component as a prop.

UI component guidance:
- Reuse existing button variants (`buttonVariants`) or shadcn `<Button />` depending on existing usage patterns in this codebase.
- Match current design tokens: `bg-surface`, `text-text`, `border-border`, `shadow-soft`.

#### 4) Tests for reset
Add integration tests under `tests/integration/` similar to other route tests.

Test cases:
1) **Not demo**: `POST /api/demo/reset` returns 404.
2) **Demo**: returns `{ ok: true }` and calls `seedDemoDatabase()`.
3) **KV cleared**: set a value in `demoKv`, call reset, then verify it is absent.
4) **GET semantics**: in demo, `GET /api/demo/reset` returns 405; outside demo returns 404.

Implementation strategy:
- Use `vi.resetModules()` between tests.
- For demo env: set `process.env.DEMO_MODE = 'true'` before importing the route module.
- Mock `seedDemoDatabase()` to avoid hitting the real DB in unit/integration tests.

#### 5) Run validation
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

---

## P1 — Phase 4.9 UI polish

### Target behavior
- In demo, the UI has an obvious “DEMO MODE” indicator.
- In demo, the header exposes a “Reset demo” affordance (links to `/demo/reset`).
- Outside demo, there is no banner and no reset link.

### Files to modify
1. `src/app/layout.tsx`
2. `src/components/layout/Header.tsx`

### Step-by-step implementation

#### 1) Add demo banner to root layout
File: `src/app/layout.tsx`

Implementation guidance:
- Root layout is a server component; it can safely call `isDemoMode()`.
- Render a compact banner at the top of `<body>` above `{children}`.
- Keep it visually distinct but aligned with the palette.

Example structure:
```tsx
{isDemoMode() ? (
  <div className="border-b border-border bg-accent/10 px-4 py-2 text-center text-xs font-semibold text-text">
    DEMO MODE — no real payments or external services
  </div>
) : null}
```

#### 2) Add “Reset demo” link/button to Header
File: `src/components/layout/Header.tsx` (client component)

Implementation guidance:
- Because this is client-rendered, the demo check must be client-safe.
- `isDemoMode()` must check `NEXT_PUBLIC_DEMO_MODE` (see “Client-side demo detection requirement” above). Next should inline public env vars at build time.
- Add an inline link/button in desktop nav and optionally in mobile nav.

Behavior:
- Only render the reset affordance when `isDemoMode()` is true.
- Link to `/demo/reset`.
- Avoid firing analytics in demo (analytics are already no-ops, but don’t add new tracking).

#### 3) Manual checks
- With `.env.demo`, confirm:
  - Banner visible.
  - Header shows reset link.
- With demo flags off, confirm neither appears.

#### 4) Run validation
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

---

## P1 — Health checks KV demo-safety

### Problem
`src/lib/health/checks.ts` directly imports `@vercel/kv`. In demo, this is unacceptable and can also break `/health/ready` when KV creds are intentionally unset.

### Target behavior
In DEMO_MODE:
- `checkKv()` returns `{ ok: true, detail: 'demo' }` (or equivalent) without requiring KV env vars.

Outside DEMO_MODE:
- Preserve current behavior:
  - if env missing → `{ ok: false, detail: '...' }`
  - else attempt a simple KV read.

### Files to modify
1. `src/lib/health/checks.ts`
2. Update/add tests in `tests/unit/health-checks.test.ts` and/or `tests/integration/health.test.ts`.

### Step-by-step implementation

#### 1) Replace direct KV import
File: `src/lib/health/checks.ts`

Changes:
- Remove `import { kv } from '@vercel/kv';`
- Import `isDemoMode` and `kvAdapter`.

Implementation:
- At the top of `checkKv()`:
  - if `isDemoMode()` return `{ ok: true, detail: 'demo' }`.
- Otherwise keep the existing env checks.
- Use `await kvAdapter.get('health:ping')` (instead of `kv.get`).

Pseudo-code:
```ts
import { isDemoMode } from '@/lib/demo';
import { kvAdapter } from '@/lib/demo/kv-adapter';

export const checkKv = async (): Promise<HealthCheckResult> => {
  if (isDemoMode()) return { ok: true, detail: 'demo' };
  // existing env guards...
  await kvAdapter.get('health:ping');
  return { ok: true };
};
```

Type note:
- `HealthCheckResult` in `src/lib/health/checks.ts` already includes `detail?: string`; keep that shape.

#### 2) Tests
Add unit test coverage for demo behavior:
- In `tests/unit/health-checks.test.ts`, add:
  - set `process.env.DEMO_MODE='true'`
  - delete KV env vars
  - call `checkKv()` and expect `{ ok: true, detail: 'demo' }`

If desired, add an integration-level assertion:
- In `tests/integration/health.test.ts`, set demo env and ensure `/health/ready` can still return 200 when adapters are mocked or when demo short-circuits.

#### 3) Run validation
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

---

## P2 — Seed-demo alignment

### Target behavior
- Provide a dedicated demo seed path that creates the **canonical walkthrough** state.
- Reset uses demo seed.
- Seed content respects the “single gift object” invariant.
- Prefer local/first-party asset URLs for demo visuals to avoid browser-side external fetches where feasible.

### Files to create/modify
Create:
1. `src/lib/db/seed-demo.ts`
2. `scripts/seed-demo.ts`

Modify:
3. `package.json` (optional but recommended): add `db:seed:demo` script.
4. `src/app/api/demo/reset/route.ts`: ensure it calls `seedDemoDatabase()` (if not already).

### Step-by-step implementation

**Note (avoid duplication):** `seedDemoDatabase()` is intentionally introduced in **P0 (Reset mechanism)** so reset can be correct and slug-consistent from day one. If that work was already completed during P0, the steps below should be treated as **refinement of demo seed content only** (personas, contributions, assets), not new plumbing.

#### 1) Create `seedDemoDatabase()`
File: `src/lib/db/seed-demo.ts`

Design:
- Mirror the deletion order used by `seedDatabase()` in `src/lib/db/seed.ts` to guarantee referential integrity.
- Insert deterministic demo objects:
  - Partner: default partner (reuse constants)
  - Host: `sarah@demo.chipin.co.za`, name `Sarah Thompson`
  - Dream board: slug `emma-birthday-demo`, child `Emma`
  - Gift: takealot product gift object (single object)
  - Contributions: include at least one completed contribution to demonstrate progress

Data requirements:
- Use deterministic IDs when possible only if schema allows; otherwise rely on DB-generated IDs but deterministic *slug*.
- Use `buildDemoAssetUrl()` for images:
  - child photo: e.g. `buildDemoAssetUrl('/images/child-placeholder.svg')`
  - product image: add a local placeholder or reuse existing (if only placeholder exists, reuse it)

Determinism clarification:
- The schema uses server-generated UUIDs (e.g. `defaultRandom()`), so **IDs may change on each reset**.
- This is acceptable. The stable identifier for demos is the **slug** (`DEMO_SEEDED_BOARD_SLUG`).
- Do not attempt to force deterministic UUIDs unless there is a clear upstream requirement.

Note on assets:
- Today `public/images/child-placeholder.svg` exists. If a product placeholder is needed, either reuse it or add a new SVG under `public/images/` (implementation agent may add the asset if required by UX).

#### 2) Add `scripts/seed-demo.ts`
File: `scripts/seed-demo.ts`

Pattern:
```ts
import { seedDemoDatabase } from '../src/lib/db/seed-demo';

async function main() {
  await seedDemoDatabase();
  console.log('Demo seed completed');
}

main().catch((error) => {
  console.error('Demo seed failed', error);
  process.exit(1);
});
```

#### 3) Wire package script (recommended)
File: `package.json`

Add:
```json
"db:seed:demo": "tsx scripts/seed-demo.ts"
```

#### 4) Ensure reset uses demo seed
File: `src/app/api/demo/reset/route.ts`

Confirm it calls `seedDemoDatabase()`.

#### 5) Validation
- Run demo seed locally:
  - `pnpm db:seed:demo` (or `pnpm tsx scripts/seed-demo.ts` if script not added)
- Start app in demo env and verify seeded slug is reachable:
  - `pnpm dev` with `.env.demo`
  - open `/emma-birthday-demo`

---

# Final verification checklist (must pass before declaring done)

## Automated
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Test file locations (verification)
These test files already exist in the repo and should be extended (not created from scratch):
- `tests/integration/reconcile-payments.test.ts`
- `tests/unit/health-checks.test.ts`
- `tests/integration/health.test.ts`

## Optional continuity
- If the team is maintaining `docs/Mock-Progress/PHASE3_IMPLEMENTATION_LOG.md` manually, append a brief entry when each section (P0/P1/P2) lands. (Do not block implementation on doc updates.)

## Rollback strategy
- Keep changes incremental and easy to revert.
- If an issue is discovered mid-flight:
  1) revert the most recent commit(s) affecting the broken subsystem,
  2) restore CI green (lint/typecheck/tests),
  3) re-apply with narrower diffs.

## Manual smoke (DEMO_MODE)
1. Start with `.env.demo`.
2. Confirm banner visible.
3. Confirm header shows “Reset demo”.
4. Visit `/demo/reset` → click reset → confirm success.
5. Visit `/emma-birthday-demo` and confirm board renders.
6. Trigger `/api/internal/payments/reconcile` with auth header:
   - Confirm it returns 200 with empty results.
   - Confirm no provider calls (check logs; should be silent/low noise).

## Safety assertions
- In demo, no outbound HTTP requests should occur from server integrations.
- In demo, health checks must not contact Vercel KV.

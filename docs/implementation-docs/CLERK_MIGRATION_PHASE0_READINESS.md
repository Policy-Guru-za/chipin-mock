# Clerk Migration — Phase 0 Readiness

## Scope
Phase 0 captures the current auth surface area, confirms `AUTH_CLERK_ENABLED` defaults, and defines QA checkpoints before any Clerk plumbing ships.

---

## Route Inventory (Current)

### Public (must remain accessible)
- Marketing: `/` → `src/app/(marketing)/page.tsx`
- Guest flows:
  - `/:slug` → `src/app/(guest)/[slug]/page.tsx`
  - `/:slug/contribute` → `src/app/(guest)/[slug]/contribute/page.tsx`
  - `/:slug/thanks` → `src/app/(guest)/[slug]/thanks/page.tsx`
  - `/:slug/payment-failed` → `src/app/(guest)/[slug]/payment-failed/page.tsx`
- Health:
  - `/health/live` → `src/app/health/live/route.ts`
  - `/health/ready` → `src/app/health/ready/route.ts`
  - `/api/health` → `src/app/api/health/route.ts`
- Public API (incl. `/v1/*` rewrite):
  - `/api/v1/*` → `src/app/api/v1/**/route.ts`
  - `/v1/*` (rewrite target to `/api/v1/*`)
- Payment webhooks:
  - `/api/webhooks/payfast` → `src/app/api/webhooks/payfast/route.ts`
  - `/api/webhooks/ozow` → `src/app/api/webhooks/ozow/route.ts`
  - `/api/webhooks/snapscan` → `src/app/api/webhooks/snapscan/route.ts`
- Internal allowlist (not Clerk‑protected):
  - `/api/internal/webhooks/process` → `src/app/api/internal/webhooks/process/route.ts`

### Protected (Clerk)
- Host flows:
  - `/create` → `src/app/(host)/create/page.tsx`
  - `/create/child` → `src/app/(host)/create/child/page.tsx`
  - `/create/gift` → `src/app/(host)/create/gift/page.tsx`
  - `/create/details` → `src/app/(host)/create/details/page.tsx`
  - `/create/review` → `src/app/(host)/create/review/page.tsx`
  - `/dashboard` → `src/app/(host)/dashboard/page.tsx`
  - `/dashboard/:id` → `src/app/(host)/dashboard/[id]/page.tsx`
- Admin flows:
  - `/admin/payouts` → `src/app/(admin)/payouts/page.tsx`
  - `/admin/payouts/:id` → `src/app/(admin)/payouts/[id]/page.tsx`
  - `/admin/payouts/export` → `src/app/(admin)/payouts/export/route.ts`
- Internal APIs (default protected):
  - `/api/internal/upload`
  - `/api/internal/artwork/generate`
  - `/api/internal/analytics`
  - `/api/internal/api-keys/*`
  - `/api/internal/retention/run`
  - `/api/internal/contributions/create`
  - `/api/internal/auth/*`
  - `/api/internal/debug/auth-events`
  - `/api/internal/metrics`
  - `/api/internal/karri/batch`
  - `/api/internal/payments/reconcile`
  - `/api/internal/payouts/:id/documents/:type`

### Demo/Dev (decision needed)
- `/demo/payment-simulator` → `src/app/demo/payment-simulator/page.tsx`
- `/api/demo/payment-complete` → `src/app/api/demo/payment-complete/route.ts`

**Phase 0 note:** add `payment-failed` to guest regex list in middleware (or explicitly document it as protected).

---

## Auth Touchpoints (Current)

### Magic Link + Session
- `src/lib/auth/magic-link.ts`
- `src/lib/auth/session.ts` (`chipin_session` cookie)
- Pages:
  - `src/app/auth/login/page.tsx`
  - `src/app/auth/verify/page.tsx`
  - `src/app/auth/logout/route.ts`
- Internal APIs:
  - `src/app/api/internal/auth/magic-link/route.ts`
  - `src/app/api/internal/auth/verify/route.ts`
  - `src/app/api/internal/auth/me/route.ts`
- Host routes using `requireSession`:
  - `src/app/(host)/create/child/page.tsx`
  - `src/app/(host)/create/gift/page.tsx`
  - `src/app/(host)/create/details/page.tsx`
  - `src/app/(host)/create/review/page.tsx`
  - `src/app/(host)/dashboard/page.tsx`
  - `src/app/(host)/dashboard/[id]/page.tsx`
- Admin routes using `requireAdminSession`:
  - `src/app/(admin)/layout.tsx`
  - `src/app/(admin)/payouts/page.tsx`
  - `src/app/(admin)/payouts/[id]/page.tsx`
  - `src/app/(admin)/payouts/export/route.ts`
  - `src/app/api/internal/payouts/[id]/documents/[type]/route.ts`
- Internal APIs using `getSession`:
  - `src/app/api/internal/upload/route.ts`
  - `src/app/api/internal/artwork/generate/route.ts`
  - `src/app/api/internal/auth/me/route.ts`

### Debug/Observability
- `src/app/api/internal/debug/auth-events/route.ts` (filters `auth.magic_link_*`)
- Tests referencing magic link events:
  - `tests/integration/internal-debug-auth-events.test.ts`
  - `tests/unit/magic-link.test.ts`
  - `tests/integration/internal-auth.test.ts`

---

## Feature Flag Defaults (Proposed)

| Stage | Dev | Preview | Prod |
| --- | --- | --- | --- |
| Stage 1 (plumbing) | `false` | `false` | `false` |
| Stage 2 (auth guards migrated) | `true` | `true` | `false` |
| Stage 3 (cutover) | `true` | `true` | `true` |

**Notes:**
- Keep Stage 1 `false` everywhere to prevent accidental protection until guards are migrated.
- Enable in preview first to validate middleware + Clerk session flows.

---

## QA Checklist (Phase 0 Sign‑off)

### Public/Guest
- `/:slug`, `/:slug/contribute`, `/:slug/thanks`, `/:slug/payment-failed` load without auth.
- `/api/v1/*` and `/v1/*` remain public.
- `/api/webhooks/*` still accept inbound requests.

### Host/Admin
- Host create flow pages require auth once Clerk is enabled.
- Admin payouts pages and exports require admin auth.
- Internal APIs reject requests without auth (except allowlist).

### Observability
- Auth event logging and debug endpoint will be migrated from `auth.magic_link_*` to `auth.clerk_*`.

---

## Phase 0 Outcome
Phase 0 is complete once this inventory is reviewed, defaults are confirmed, and QA checkpoints are accepted.

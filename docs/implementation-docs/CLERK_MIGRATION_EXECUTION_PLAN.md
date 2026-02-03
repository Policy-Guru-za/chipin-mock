# Clerk Migration Execution Plan (6 Stages)

## Purpose
Translate `CLERK_MIGRATION_PLAN.md` into an execution-ready, staged program with clear gates, rollback safety, and review checkpoints for a main-only repo.

## Guiding Principles
- **Main-only**: every stage is deployable and reversible.
- **Feature-flagged cutover**: `AUTH_CLERK_ENABLED` gates middleware + helpers + UI.
- **Zero downtime**: keep magic link functional until Clerk is verified.
- **Explicit public/protected routing**: guest routes and webhooks never accidentally blocked.

---

## Stage 1 — Pre‑flight & Readiness
**Objective:** reduce unknowns, confirm inventory, and finalize rollout gates.

**Deliverables**
- Updated route inventory and auth touchpoints list.
- Confirmed `AUTH_CLERK_ENABLED` staging: Stage 2–3 = false everywhere; Stage 4 = true in preview only first; production only after preview sign-off.
- QA checklist for guest, host, admin, and webhook flows.

**Exit Criteria**
- Risks documented and reviewed.
- All target routes and APIs identified with owners.

---

## Stage 2 — Clerk Plumbing (Flag OFF)
**Objective:** land Clerk infrastructure without changing behavior.

**Deliverables**
- `@clerk/nextjs` installed.
- `middleware.ts` wired with Edge‑safe request-id and the exact public/protected routing matrix from `CLERK_MIGRATION_PLAN.md` (incl. `/v1/*`, `/api/v1/*`, `/api/webhooks/*`, and allowlisting `/api/internal/webhooks/process`).
- Middleware must be no-op when `AUTH_CLERK_ENABLED=false` (no `auth().protect`), so Stage 2 cannot change behavior.
- `ClerkProvider` in root layout.
- `/sign-in` and `/sign-up` pages (prebuilt).
- Header updates gated by `AUTH_CLERK_ENABLED`.

**Exit Criteria**
- `AUTH_CLERK_ENABLED=false` everywhere.
- Magic-link/session flows still work end‑to‑end.
- Guest routes, `/v1/*`, and webhooks remain public.

---

## Stage 3 — Auth Guard Migration & Data Model
**Objective:** move host/admin/internal protection to Clerk while keeping flag‑off safety.

**Deliverables**
- `lib/auth/clerk.ts` helpers (`requireClerkUser`, `requireAdminClerkUser`).
- `hosts.clerkUserId` (nullable unique) + `ensureHostForClerkUser`.
- Introduce dual-mode auth wrappers (e.g. `requireHostAuth` / `requireAdminAuth` / `requireInternalAuth`) that use `chipin_session` when `AUTH_CLERK_ENABLED=false` and Clerk when `AUTH_CLERK_ENABLED=true`; migrate host/admin/internal routes to these wrappers.
- `/create` entry flow: when `AUTH_CLERK_ENABLED=true` and signed out → redirect to `/sign-in` (with `redirect_url`); when `AUTH_CLERK_ENABLED=false` → preserve current magic-link entry behavior.
- Legacy `chipin_session` cleanup on `/sign-in` or `/create`.

**Exit Criteria**
- All host/admin/internal routes use the dual-mode auth wrappers (legacy session when flag OFF; Clerk when flag ON).
- Tests updated with Clerk mocks (and coverage proving flag-OFF uses legacy session path).
- With `AUTH_CLERK_ENABLED=false`: magic-link/session flows still work end-to-end (including host/admin/internal).

---

## Stage 4 — Preview Validation → Production Cutover
**Objective:** enable Clerk in preview, then production.

**Deliverables**
- `AUTH_CLERK_ENABLED=true` in preview only.
- Manual QA for sign‑in, create flow, dashboard, admin, internal APIs.
- Telemetry checks for auth errors and redirect loops.

**Exit Criteria**
- Preview passes QA with no critical issues.
- Production enabled only after preview sign‑off.

---

## Stage 5 — Magic Link Removal & Legacy Cleanup
**Objective:** delete legacy auth after Clerk is proven.

**Deliverables**
- Remove magic‑link modules, routes, and tests.
- Remove magic‑link env vars and dashboard alerts.
- Add legacy redirects (`/auth/*` → Clerk).
- Update debug endpoint to `auth.clerk_*` or remove.

**Exit Criteria**
- No remaining magic‑link references in code or config.
- Production auth stable for a full release cycle.

---

## Stage 6 — Post‑Cutover Enhancements
**Objective:** add optional enterprise features after stabilization.

**Deliverables**
- Optional Clerk webhooks with idempotency (Clerk/Svix event ID).
- Optional Organizations enablement (explicit tenant mapping decision).
- Long‑term monitoring updates and runbooks.

**Exit Criteria**
- Webhook processing is idempotent and verified.
- Organization strategy finalized (or explicitly deferred).

---

## Validation Gates (Every Stage)
- `pnpm lint` (acknowledge existing warnings)
- `pnpm typecheck`
- `pnpm test`
- Manual QA checklist per stage

## Rollback Plan
- Toggle `AUTH_CLERK_ENABLED=false` to revert to legacy behavior during Stages 2–4 (requires Stage 3 dual-mode wrappers to be in place).
- Revert to last known-good commit if post-cutover issues arise.

# Clerk Migration Plan (Magic Link Removal)

> **Status note (2026-02-05):** historical migration plan. The shipped app uses Clerk (`@clerk/nextjs`) and does not ship magic-link authentication.

## Decisions Captured
- Auth system will be **fully replaced** by Clerk (no magic link flows remain).
- **Sign-in UX:** Clerk prebuilt pages at `/sign-in` and `/sign-up`.
- **User migration:** none; new Clerk auth only.
- **Organizations:** include both options (enabled vs. disabled).
- **Repo strategy:** main-only; rollout must be staged to avoid auth downtime.

## Goals
- Remove all magic link auth + session logic + endpoints.
- Implement Clerk with enterprise-grade configuration, routing, and observability.
- Replace all session-based authorization with Clerk user/organization context.

## Non-Goals
- No migration of existing users into Clerk.
- No new product features beyond auth replacement.

## Current Magic Link Surface Area (to remove)
- `src/lib/auth/magic-link.ts`
- `src/lib/auth/session.ts`
- `src/app/auth/verify/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/logout/route.ts`
- `src/app/api/internal/auth/magic-link/route.ts`
- `src/app/api/internal/auth/verify/route.ts`
- `src/app/api/internal/auth/me/route.ts`
- `src/app/(host)/create/page.tsx` (magic-link form)
- Tests: `tests/unit/magic-link.test.ts`, `tests/integration/internal-auth.test.ts`, `tests/integration/internal-debug-auth-events.test.ts`
- Debug endpoint coupling: `src/app/api/internal/debug/auth-events/route.ts`
- Env/config/monitoring: `.env*` magic-link vars, Vercel envs, alerts/dashboards querying `auth.magic_link_*`

---

## Step-by-Step Plan

### Phase 1 — Baseline & Dependency Setup
1. **Add Clerk SDKs**
   - `pnpm add @clerk/nextjs` (and `@clerk/backend` only if server-only usage is needed beyond `@clerk/nextjs/server`).
2. **Environment variables**
   - Add to `.env.example` and env management:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `CLERK_WEBHOOK_SIGNING_SECRET`
     - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
     - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
     - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/create/child`
     - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/create/child`
   - Remove magic-link envs (`MAGIC_LINK_RATE_LIMIT_*`).
3. **Clerk middleware integration in `middleware.ts` (or `src/middleware.ts`)**
   - `proxy.ts` is not guaranteed to run as Next middleware; implement Clerk in `middleware.ts`.
   - Merge request-id propagation into Clerk middleware.
   - Use `globalThis.crypto.randomUUID()` (Edge-safe) instead of `crypto.randomUUID()`.
   - Add `matcher` to cover app routes + API routes.
   - Configure protected vs. public routes (see Phase 2.5).

### Phase 2 — Clerk Provider & Auth Pages
4. **Add `ClerkProvider` in `src/app/layout.tsx`**
   - Wrap the app body with `ClerkProvider` and set `signInUrl`, `signUpUrl`, `afterSignInUrl`, `afterSignUpUrl`.
   - Optional: configure `appearance` to match Gifta design system.
5. **Create prebuilt auth pages**
   - Add `/sign-in/[[...sign-in]]/page.tsx` with `<SignIn />`.
   - Add `/sign-up/[[...sign-up]]/page.tsx` with `<SignUp />`.
6. **Header UX update**
   - Use `<SignedIn>` + `<UserButton>` for account actions.
   - Use `<SignedOut>` + link to `/sign-in` for login CTA.

### Phase 2.5 — Route Protection Matrix (Explicit)
7. **Implement route protection using explicit patterns**
**Public routes (must remain accessible):**
- Marketing: `/`
- Guest flows: `/(guest)/*` (e.g., `/:slug`, `/:slug/contribute`, `/:slug/thanks`)
- Health checks: `/health/live`, `/health/ready`
- Public API: `/api/v1/*` **and** `/v1/*` (explicitly public due to `next.config.js` rewrite)
- Payment webhooks: `/api/webhooks/*`
- Clerk webhooks: `/api/webhooks/clerk`
- Auth pages: `/sign-in(.*)`, `/sign-up(.*)`
- Static assets + Next internals

**Protected routes:**
- Host flows: `/(host)/*` (`/create/*`, `/dashboard/*`)
- Admin flows: `/(admin)/*`
- Internal APIs: `/api/internal/*` **by default**

**Internal API allowlist (explicit):**
- `/api/internal/webhooks/process` (secured by `INTERNAL_JOB_SECRET`, not Clerk)
- Any other internal endpoints explicitly documented as public

**Middleware example (explicit patterns):**
```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/health/live',
  '/health/ready',
  '/api/webhooks(.*)',
  '/api/v1(.*)',
  '/v1(.*)',
  '/api/internal/webhooks/process',
  // Guest pages (route groups are not in URL):
  /^\/(?!api|_next|sign-in|sign-up|create|dashboard|admin|health)([^/]+)$/,
  /^\/(?!api|_next|sign-in|sign-up|create|dashboard|admin|health)([^/]+)\/(contribute|thanks)$/,
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (process.env.AUTH_CLERK_ENABLED !== 'true') return;
  await auth().protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**Note:** If you add new guest subpaths, extend the guest regex list; otherwise new guest pages will become protected by default.

### Phase 3 — Replace Session-Based Authorization (incl. Admin)
8. **Introduce Clerk auth helpers**
   - New helper module (e.g., `lib/auth/clerk.ts`) exposing:
     - `requireClerkUser()` → enforces auth; returns user + email.
     - `requireHostForClerkUser()` → maps to `hosts` row (see Phase 4).
9. **Admin authorization policy (choose one)**
   - **Option A (parity, simplest):** keep `ADMIN_EMAIL_ALLOWLIST` and compare to `currentUser().primaryEmailAddress`.
   - **Option B (Clerk roles/permissions):** configure roles or custom claims and enforce with `auth().has()`.
   - Implement a single helper `requireAdminClerkUser()` and replace `requireAdminSession()` calls.
10. **Replace all `getSession/requireSession` usage**
   - Update host routes (create wizard + dashboard) to use `requireClerkUser`.
   - Update internal API routes (`/api/internal/upload`, `/api/internal/artwork/generate`, etc.) to use `auth()` and enforce 401 when `userId` is missing.
   - Update `api/internal/auth/me` to return Clerk user data or remove if unused.
11. **Replace `/create` entry flow**
   - Convert `/create` to a signed-in entry point:
     - If signed out → redirect to `/sign-in?redirect_url=/create/child`.
     - If signed in → proceed to `/create/child`.

### Phase 4 — Data Model Alignment (Host ↔ Clerk)
12. **Add Clerk user ID to hosts**
   - Schema change: add nullable `clerkUserId` column with unique index.
   - Keep `email` as required for business flows (e.g., payout email).
   - Drizzle migration + query updates.
13. **Update host resolution**
   - Add `ensureHostForClerkUser(userId, email)`:
     - Prefer `clerkUserId` mapping; fallback to email if missing.
     - Update stored email if Clerk email changes.
   - **Do not** replace `ensureHostForEmail` globally (e.g., keep `/api/v1/dream-boards` using payout email).

### Phase 5 — Remove Magic Link Functionality Completely
14. **Delete magic-link code + routes**
   - Remove `magic-link.ts`, `session.ts`, auth routes under `/auth`, and internal verify/magic-link endpoints.
15. **Remove magic-link logs and debug endpoint coupling**
   - Delete `auth.magic_link_*` logging.
   - Either remove `/api/internal/debug/auth-events` or repurpose to new `auth.clerk_*` events.
16. **Remove magic-link tests**
   - Delete unit/integration tests specific to magic link.
   - Replace with Clerk-based auth tests (Phase 7).
17. **Legacy route handling**
    - `/auth/login` → redirect to `/sign-in`.
    - `/auth/logout` → Clerk sign-out flow.
    - `/auth/verify` → friendly “link no longer valid” page or redirect to `/sign-in`.
18. **Legacy session cookie cleanup**
    - Delete `chipin_session` on `/sign-in`, `/create`, or a one-time migration route to avoid stale session UX.

### Phase 6 — User/Host Sync (Phased)
19. **Phase 6A: On-demand host sync (no webhooks)**
   - Ensure `ensureHostForClerkUser` is called in all authenticated host flows.
   - This avoids day-1 webhook complexity.
20. **Phase 6B (optional): Clerk webhooks for lifecycle sync**
   - Add `/api/webhooks/clerk` with `verifyWebhook`.
   - Use Node runtime, handle raw body correctly, and make DB upserts idempotent.
   - Use Clerk event id (or Svix message id) as an idempotency key for dedupe.
   - Handle `user.created/updated/deleted` (and org events if enabled).
21. **Auth event logging**
   - Add logs for sign-in/out and webhook events using existing logger.
   - If keeping debug endpoint, query `auth.clerk_*` instead of `auth.magic_link_*`.

### Phase 7 — Testing & Validation
22. **Update tests**
   - Add unit tests for `ensureHostForClerkUser` and auth guards.
   - For unit/integration tests: mock `@clerk/nextjs/server` (`auth()`, `currentUser()`).
   - Reserve Clerk testing tokens for E2E/Playwright only (if added).
   - Add regression tests to confirm public guest routes are accessible and host/admin routes redirect.
23. **Run validators**
   - `pnpm lint`, `pnpm typecheck`, `pnpm test` (plus any targeted suites that cover auth).

### Phase 8 — Deployment & Rollout (Main-Only Safe Cutover)
24. **Stage 1: add Clerk plumbing**
   - Ship middleware + provider + `/sign-in` + `/sign-up` while keeping magic link flows intact.
   - Keep `AUTH_CLERK_ENABLED=false` in **all** environments for Stage 1.
   - Stage 1 verification: existing magic-link/session flows still work (no redirect loops); guest routes + webhooks + `/v1/*` remain public.
25. **Stage 2: gated rollout**
   - **Feature flag spec:**
     - Name: `AUTH_CLERK_ENABLED` (string, `true`/`false`).
     - Gates:
       - Middleware protection rules.
       - Server helpers used by pages/API (session vs Clerk).
       - Header actions (session logout vs Clerk sign-out).
     - Recommended staging:
       - Stage 1 (plumbing only): `AUTH_CLERK_ENABLED=false` everywhere.
       - Stage 2 validation (after Phase 3 is deployed): enable in **preview only** first.
       - Production: enable only after preview validation passes.
   - Guardrail: never enable `AUTH_CLERK_ENABLED=true` until **all** host/admin routes and `/api/internal/*` auth checks have been migrated off `chipin_session` (Phase 3).
   - Verify sign-in, host flows, admin flows, and internal APIs.
26. **Stage 3: remove magic link**
   - Delete magic link modules/routes/tests and remove magic-link env vars.
   - Add legacy redirects for `/auth/*`.
27. **Clerk dashboard setup**
   - Configure redirect URLs, allowed origins, and sign-in/up URLs.
   - Enable desired auth factors (email/password, OAuth, MFA).
28. **Environment updates**
   - Add Clerk env vars to Vercel.
   - Remove magic-link env vars from all environments (`.env*`, Vercel).

---

## Organizations (Two Options)

### Option A — Enable Organizations (B2B)
1. Enable Organizations in Clerk dashboard (membership model chosen).
2. **Explicitly decide tenant mapping:**
   - Recommended: Clerk orgs = host workspaces (teams managing multiple boards).
   - If mapping orgs → `partners`, reconcile with existing partner API keys and partner-scoped API flows.
3. Add `organizations` (and membership) table or a mapping table if needed.
4. Add `OrganizationSwitcher` to dashboard layout.
5. Use `orgId`/`orgRole` to scope host resources.
6. Add webhook handlers for `organization.*` and `organizationMembership.*` events.
7. Enforce org permissions with `auth().has()` and `auth.protect()`.

### Option B — No Organizations (B2C)
1. Disable Organizations in Clerk.
2. Skip org tables/handlers.
3. Auth context uses only `userId` and email.

---

## Deliverables Checklist
- [ ] Magic link modules/routes/tests removed.
- [ ] Clerk middleware + provider + auth pages wired.
- [ ] Route-protection matrix applied and verified.
- [ ] All session-based guards replaced with Clerk auth.
- [ ] Hosts mapped to Clerk users with `clerkUserId`.
- [ ] Webhooks + auth logs updated.
- [ ] Validators passing.

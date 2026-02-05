# Clerk Stage 4 Cutover (Production Only)

> **Status note (2026-02-05):** historical cutover runbook. Current auth is Clerk-based; use this only as reference if reworking auth rollout.

## Purpose
Enable Clerk in **Production** (no Preview environment available) and validate end-to-end authentication, with clear rollback steps.

## Preconditions
- Stage 3 code merged to `main` and deployed.
- Production Clerk keys are set: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.

## Step 1 — Confirm Clerk keys in Production (Vercel)
1. Open Vercel dashboard → Project → **Settings** → **Environment Variables**.
2. Confirm the following are present in **Production**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Trigger a production redeploy (if any changes were made):
   - **Deployments** → latest production deploy → **Redeploy**.

## Step 2 — Manual QA Checklist (Production)

### Sign-in / Entry
- `/sign-in` loads Clerk UI.
- `/create` redirects to `/sign-in` with `redirect_url=/create/child`.
- Clerk sign-in returns to `/create/child`.

### Host Create Flow
- `/create/child` saves child details and advances.
- `/create/gift` saves gift name + artwork and advances.
- `/create/details` saves payout + WhatsApp details.
- `/create/review` creates a dream board successfully.

### Host Dashboard
- `/dashboard` loads list of boards.
- `/dashboard/[id]` loads detail view.

### Admin
- `/admin` and `/admin/payouts` load with Clerk admin email allowlist.
- `/admin/payouts/[id]` actions work (complete/fail/note).

### Internal APIs (Clerk-session)
- `/api/internal/auth/me` returns session payload when signed in.
- `/api/internal/upload` accepts upload when signed in.
- `/api/internal/artwork/generate` accepts request when signed in.

### Internal APIs (Job-secret)
Ensure job-secret endpoints still require `INTERNAL_JOB_SECRET`:
- `/api/internal/retention/run`
- `/api/internal/karri/batch`
- `/api/internal/payments/reconcile`
- `/api/internal/webhooks/process`
- `/api/internal/api-keys/*`

Example check (expect 401 without secret):
```
curl -i -X POST https://<prod-domain>/api/internal/retention/run
```

Example check (expect success with secret):
```
curl -i -X POST https://<prod-domain>/api/internal/retention/run \
  -H "Authorization: Bearer $INTERNAL_JOB_SECRET"
```

## Step 3 — Telemetry Checks (Vercel Logs)
Review Production logs for the QA window:
- Look for auth errors or redirect loops: `unauthorized`, `redirect`, `auth().protect` failures.
- Track Clerk mismatch warnings: `auth.clerk_user_mismatch`.
- Confirm no spikes in 401/403 responses on host/admin/internal routes.

## Rollback Plan (If Needed)
1. Revert to the last known good production deployment.
2. Redeploy production.
3. Re-run a minimal smoke check of `/create`, `/dashboard`, `/admin`.

## Sign-off Notes
- Date/time:
- Tester:
- Result (pass/fail):
- Issues found:

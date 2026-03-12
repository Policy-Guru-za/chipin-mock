# Codebase and Documentation Report

Last updated: March 12, 2026

## Executive Summary

This repository is in a good execution state and a mixed documentation state.

- Runtime health at baseline is strong:
  - `pnpm typecheck`: pass
  - `pnpm test`: pass (`192` files / `978` tests)
  - `pnpm lint`: pass with existing warnings only
- The biggest current risk is not failing code gates; it is agents or humans following stale documentation.
- The repo now needs explicit document governance because it contains a mix of:
  - current runtime/product docs
  - active operational docs
  - historical plans
  - historical evidence
  - non-authoritative design/reference artifacts

## Current Architecture Snapshot

### Application shape

- Single Next.js App Router app
- Route groups:
  - `(marketing)`
  - `(guest)`
  - `(host)`
  - `(admin)`
- Public API surfaced through `/v1/*` rewrite to `/api/v1/*`
- Internal job/utility routes under `/api/internal/*`

### Auth and access control

- Clerk is the host/admin auth system.
- Host/admin shells enforce auth through server-side wrappers and layout-level checks.
- Root request hook is [`proxy.ts`](../../proxy.ts); it adds request IDs and does not enforce auth by itself.
- Admin access uses Clerk plus `ADMIN_EMAIL_ALLOWLIST`.

### Payments and payouts

- Incoming payments: PayFast, Ozow, SnapScan
- Fee model: contributor pays `amount + fee`; goal progress uses `amount_cents`
- Gift payout methods: `karri_card`, `bank`
- Optional charity payout rows when charity is enabled
- Close path is explicit via `POST /api/v1/dream-boards/[id]/close`
- No in-repo auto-close scheduler exists

## Documentation Assessment

### Before this sync

- root docs contained missing links
- platform docs mixed current runtime facts with stale hosts/domains and stale auth-entrypoint references
- forensic docs still described the removed root-middleware file
- Tier 2 plan/evidence/reference docs had no durable status system

### After this sync target

- Tier 1 docs describe current workspace truth
- Tier 2 docs are explicitly labeled when non-authoritative
- control matrix records every repo-owned markdown file
- `pnpm docs:audit` enforces link integrity, stale-token checks, and control-matrix completeness

## Key Risks Still Open

1. Karri pending retry bookkeeping still needs a code fix.
2. Historical/reference docs will keep accumulating unless `pnpm docs:audit` remains part of the normal gate set.
3. UX/UI plan artifacts can drift quickly because the repo intentionally preserves earlier design work for reference.

## Recommended Operating Rule

Treat this order as mandatory:

1. [`docs/DOCUMENT_CONTROL_MATRIX.md`](../DOCUMENT_CONTROL_MATRIX.md)
2. [`docs/Platform-Spec-Docs/CANONICAL.md`](../Platform-Spec-Docs/CANONICAL.md)
3. current code and generated OpenAPI
4. this report and the workspace baseline

Anything else is reference material unless the control matrix says otherwise.

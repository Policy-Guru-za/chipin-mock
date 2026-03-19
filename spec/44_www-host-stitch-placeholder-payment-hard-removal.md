# 44_www-host-stitch-placeholder-payment-hard-removal

## Objective

- Remove PayFast, Ozow, and SnapScan from the active Gifta product and codebase, replace the public contribution journey with a clear Stitch-coming-soon placeholder, and align all public URL generation to `https://www.gifta.co.za`.

## In Scope

- Public URL/canonical-host normalization for marketing, guest, host-share, reminder, receipt, webhook-payload, payout, and analytics-origin surfaces that currently depend on `NEXT_PUBLIC_APP_URL` or hardcoded non-`www` hosts.
- Hard removal of active payment-provider runtime, routes, config branches, demo/simulator flows, reconciliation jobs, and payment-specific scripts tied to PayFast, Ozow, or SnapScan.
- Guest contribution UX changes so `/{slug}`, `/{slug}/contribute`, `/{slug}/contribute/payment`, and `/{slug}/payment-failed` no longer imply live payments and instead point users to a public Stitch placeholder.
- Schema, type, seed, admin-filter, telemetry, and test updates needed so the runtime and validators no longer mention PayFast, Ozow, or SnapScan.
- Full-path execution artifacts for this slice: this spec, [`../progress.md`](../progress.md), and [`./00_overview.md`](./00_overview.md).

## Out Of Scope

- Implementing real Stitch payment creation, OAuth, GraphQL requests, redirects, or webhooks.
- Removing or changing Karri payout behavior.
- Updating broad platform/reference docs beyond the required execution artifacts.
- Preserving old payment-provider compatibility paths for historical users or live traffic.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../docs/napkin/napkin.md`](../docs/napkin/napkin.md)
- `../src/app/layout.tsx`
- `../src/lib/utils/request.ts`
- `../src/lib/payments/`
- `../src/app/api/internal/contributions/create/route.ts`
- `../src/app/api/internal/payments/reconcile/route.ts`
- `../src/app/api/webhooks/`
- `../src/app/(guest)/[slug]/contribute/`
- `../src/app/(guest)/[slug]/payment-failed/`
- `../src/lib/config/feature-flags.ts`
- `../src/lib/db/schema.ts`
- `../src/lib/admin/`
- `../tests/`

## Stage Plan

1. Stage 1 — Register the full-path execution artifacts, add the canonical public-host helper/path updates for `https://www.gifta.co.za`, and lock the Stitch-coming-soon placeholder contract for the public guest journey.
2. Stage 2 — Hard-remove PayFast, Ozow, and SnapScan runtime/config/demo/reconciliation surfaces, then simplify guest and admin runtime code so no active payment-provider logic remains.
3. Stage 3 — Update schema/types/tests to match the non-operational payment state, run the full gate, dogfood the changed public routes, and close the spec with handoff evidence.

## Test Gate

- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Dogfood the public guest flow on localhost for `/`, `/{slug}`, `/{slug}/contribute`, and redirects away from `/{slug}/contribute/payment` plus `/{slug}/payment-failed`.

## Exit Criteria

- The runtime codebase no longer contains active PayFast, Ozow, or SnapScan payment routes, provider selection logic, mock payment flows, or payment-partner copy.
- The public contribution flow clearly communicates that payments are not live yet and that Stitch integration is coming later, without implying that checkout currently works.
- All public URL emitters and canonical metadata align to `https://www.gifta.co.za`.
- Schema/types/admin/test surfaces are updated so validators pass without legacy payment-provider branches.
- [`../progress.md`](../progress.md) and [`./00_overview.md`](./00_overview.md) accurately track this spec during execution, and `## Napkin Evidence` is updated before closure if any durable learning emerges.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Canonical public URLs now resolve to `https://www.gifta.co.za`, the legacy payment-provider runtime has been hard-removed in favor of a public Stitch-coming-soon placeholder, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` all passed, and localhost dogfood verified the legacy payment/failure-route redirects before the existing guest-route `DATABASE_URL is not set` environment blocker surfaced.

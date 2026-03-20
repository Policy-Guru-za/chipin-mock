# 50_legacy_voucher_compatibility_cleanup

## Objective

- Defensively contain any stray legacy voucher payout data without restoring voucher runtime support by blocking unsupported close-path payout creation, filtering voucher rows from public payout surfaces, and labeling preserved voucher data explicitly on the host dashboard.

## In Scope

- Close-path and payout-service guards for unsupported legacy voucher payout methods
- Public payout/close API filtering for legacy voucher payout rows
- Host dashboard payout labeling for preserved legacy voucher data
- Regression coverage for the guard, API filtering, and dashboard rendering contracts
- Full-path spec/progress/napkin updates required for this follow-up

## Out Of Scope

- Reintroducing `takealot_voucher` as an active runtime, API, or host-create option
- Additional migration changes beyond the already-hardened `0021` replay path
- Tier 1 doc rewrites unless runtime truth changes require them

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/app/api/v1/dream-boards/[id]/close/route.ts`](../src/app/api/v1/dream-boards/[id]/close/route.ts)
- [`../src/lib/payouts/service.ts`](../src/lib/payouts/service.ts)
- [`../src/lib/db/api-queries.ts`](../src/lib/db/api-queries.ts)
- [`../src/lib/api/payouts.ts`](../src/lib/api/payouts.ts)
- [`../src/lib/host/dashboard-view-model.ts`](../src/lib/host/dashboard-view-model.ts)
- [`../tests/integration/api-dream-boards-close.test.ts`](../tests/integration/api-dream-boards-close.test.ts)
- [`../tests/integration/api-payouts-voucher.test.ts`](../tests/integration/api-payouts-voucher.test.ts)
- [`../tests/integration/dashboard-host-flow.test.tsx`](../tests/integration/dashboard-host-flow.test.tsx)

## Stage Plan

1. Stage 1 — Add legacy voucher guards so unsupported payout methods fail before the close path mutates board state, and lock that behavior with regression coverage.
2. Stage 2 — Filter legacy voucher payout rows from the public payout/close API surfaces and add regression coverage that proves they no longer leak through serialized responses.
3. Stage 3 — Label preserved legacy voucher data explicitly on host dashboard surfaces, run the full verification gate, dogfood the changed compatibility paths, and close the spec with proof.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`

## Exit Criteria

- Closing a Dreamboard with a preserved legacy voucher payout method fails cleanly without first mutating the board into `closed`.
- Public payout API surfaces no longer return legacy voucher payout rows, even if such rows still exist in storage.
- Host dashboard surfaces label preserved voucher data explicitly instead of rendering it as Karri/bank copy.
- Regression coverage plus dogfood evidence prove the compatibility cleanup before the spec is marked done.
- [`../progress.md`](../progress.md) records the final green commands, dogfood evidence, and napkin evidence when the spec closes.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Defensive cleanup after voucher runtime removal. The close path now rejects unsupported legacy voucher methods before mutating Dreamboard state, public payout APIs filter voucher rows via both query and serializer guards, and host dashboard surfaces label preserved voucher data explicitly.

## Stage Status

- Stage 1 complete: added a legacy voucher guard to `src/app/api/v1/dream-boards/[id]/close/route.ts`, introduced `UnsupportedGiftPayoutMethodError` in `src/lib/payouts/service.ts`, and locked the no-mutation contract with `tests/integration/api-dream-boards-close.test.ts` plus `tests/unit/payout-service-create.test.ts`.
- Stage 2 complete: filtered public payout rows to a positive bank/Karri allowlist in `src/lib/db/api-queries.ts`, added serializer-level fallback filtering in `src/lib/api/payouts.ts`, and covered the regression with `tests/integration/api-payouts-voucher.test.ts` plus the close-route payout filtering assertions.
- Stage 3 complete: widened host dashboard compatibility read models, added explicit voucher labeling in `src/lib/dream-boards/payout-methods.ts`, `src/lib/host/dashboard-view-model.ts`, and `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`, then verified with the focused voucher suites, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit -- --sync`, and `pnpm docs:audit`.

## Dogfood Notes

- Live dogfood against preserved voucher boards/payouts was intentionally not repeated because the main DB cleanup from specs 48-49 removed the last known voucher rows.
- Fallback dogfood exercised the close route, payout API, and host dashboard compatibility surfaces through `pnpm exec vitest run tests/unit/payout-service-create.test.ts tests/integration/api-dream-boards-close.test.ts tests/integration/api-payouts-voucher.test.ts tests/unit/host-dashboard-view-model.test.ts tests/integration/dashboard-host-flow.test.tsx`, which now proves unsupported voucher closes fail before mutation, public payout responses hide voucher rows, and dashboard rendering uses explicit `Takealot Voucher` labeling.

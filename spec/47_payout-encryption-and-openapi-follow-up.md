# 47_payout-encryption-and-openapi-follow-up

## Objective

- Fix the review follow-up regressions from the voucher-runtime removal slice so active payout writes still require encryption readiness and the public Dreamboard create contract matches runtime validation.

## In Scope

- Startup/readiness enforcement for `CARD_DATA_ENCRYPTION_KEY` on active payout write paths.
- Public health payload updates needed to reflect payout-encryption readiness separately from Karri automation.
- `DreamBoardCreateRequest` OpenAPI modeling and generated spec output.
- Focused current-reference docs and regression tests for the above.

## Out Of Scope

- Reintroducing bank/Karri write-path feature gating.
- Broad payout-flow UX changes unrelated to the two review findings.
- New payout providers or guest checkout work.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/lib/ux-v2/write-path-gates.ts`](../src/lib/ux-v2/write-path-gates.ts)
- [`../src/lib/config/feature-flags.ts`](../src/lib/config/feature-flags.ts)
- [`../src/lib/health/checks.ts`](../src/lib/health/checks.ts)
- [`../src/app/health/ready/route.ts`](../src/app/health/ready/route.ts)
- [`../src/lib/api/openapi.ts`](../src/lib/api/openapi.ts)

## Stage Plan

1. Stage 1 — Restore payout-encryption readiness checks without changing always-on payout write behavior.
2. Stage 2 — Refactor the create-request OpenAPI contract to accurately represent bank-default and Karri request branches.
3. Stage 3 — Sync focused docs/tests, run the gate, and close with proof.

## Test Gate

- `pnpm openapi:generate`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`

## Exit Criteria

- Production startup/readiness fail when active payout writes would break due to a missing `CARD_DATA_ENCRYPTION_KEY`.
- Karri service credentials remain automation-only requirements.
- `DreamBoardCreateRequest` no longer advertises a bank-default create path that omits required bank details.
- Generated contracts, focused docs, and regression coverage are in sync with runtime truth.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Review-follow-up repair for the spec 46 payout/runtime removal slice. Startup/readiness once again enforce payout-encryption readiness, the public create contract now models bank and Karri branches correctly, and the slice closed with a green gate plus direct `/health/ready` dogfood proof.

## Stage Status

- Stage 1 complete: added a dedicated payout-encryption requirement signal, restored `CARD_DATA_ENCRYPTION_KEY` enforcement in startup validation, and exposed `payoutEncryption` as a separate readiness check while keeping Karri service credentials automation-only.
- Stage 2 complete: refactored `DreamBoardCreateRequest` in OpenAPI to a `oneOf` union backed by explicit bank-default and Karri request schemas, then regenerated `public/v1/openapi.json`.
- Stage 3 complete: synced current-reference docs and regression coverage, then verified with `pnpm openapi:generate`, `pnpm lint` (warnings-only baseline), `pnpm typecheck`, `pnpm test`, `pnpm docs:audit -- --sync`, and `pnpm docs:audit`.

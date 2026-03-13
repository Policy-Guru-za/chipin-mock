# 12_karri-config-readiness-alignment

## Objective

- Align Karri startup validation and readiness behavior with the gated write-path contract.

## In Scope

- startup validation for Karri write-path prerequisites
- readiness behavior for mocked Karri environments
- regression coverage for the two review findings
- execution artifact updates for this bounded fix

## Out Of Scope

- broader payout-path policy changes
- OpenAPI or product-copy changes unrelated to the two review findings
- unrelated cleanup in the existing Karri decoupling session files

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/lib/config/feature-flags.ts`](../src/lib/config/feature-flags.ts)
- [`../src/lib/health/checks.ts`](../src/lib/health/checks.ts)
- [`../tests/unit/startup-config.test.ts`](../tests/unit/startup-config.test.ts)
- [`../tests/unit/health-checks.test.ts`](../tests/unit/health-checks.test.ts)

## Stage Plan

1. Stage 1 — update the execution ledger, then patch startup validation to fail fast when the Karri write path is enabled without required encryption/config.
2. Stage 2 — patch readiness so mocked Karri can report healthy under the gated write path, then add regression coverage.
3. Stage 3 — run focused verification, dogfood the config scenarios via tests, and hand off with the next placeholder active.

## Test Gate

- `pnpm exec vitest run tests/unit/startup-config.test.ts tests/unit/health-checks.test.ts`
- `pnpm typecheck`

## Exit Criteria

- `assertStartupConfig()` rejects incomplete Karri write-path configs before runtime writes can fail
- `/health/ready` treats mocked Karri as healthy when the write path is enabled without live credentials
- regression tests cover both reviewed failure modes
- this spec closes with the next numbered placeholder active in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md)

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Patched startup validation to require `CARD_DATA_ENCRYPTION_KEY` when the Karri write path is enabled, taught readiness to short-circuit to mock mode under `MOCK_KARRI=true`, added regression coverage for both review findings, and closed with [`./13_charity-product-disablement.md`](./13_charity-product-disablement.md) active for the next bounded session.

# 11_openapi-contract-determinism

## Objective

- Remove environment-sensitive branching from the OpenAPI builder so the checked-in public contract stays deterministic across local, CI, and flag-enabled environments.

## In Scope

- patching [`../src/lib/api/openapi.ts`](../src/lib/api/openapi.ts) to use static contract copy
- adding regression coverage for write-path-flag independence in [`../tests/unit/openapi-spec.test.ts`](../tests/unit/openapi-spec.test.ts)
- regenerating [`../public/v1/openapi.json`](../public/v1/openapi.json) and updating session evidence
- keeping execution artifacts current for this bounded fix

## Out Of Scope

- expanding Karri, bank, or charity runtime gating behavior
- broader API contract rewrites outside the deterministic-description fix
- unrelated doc-governance cleanup beyond required session artifacts

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../src/lib/api/openapi.ts`](../src/lib/api/openapi.ts)
- [`../public/v1/openapi.json`](../public/v1/openapi.json)
- [`../tests/unit/openapi-spec.test.ts`](../tests/unit/openapi-spec.test.ts)

## Stage Plan

1. Stage 1 — update the session ledger for this concrete spec and patch deterministic OpenAPI descriptions.
2. Stage 2 — add regression coverage, regenerate the committed OpenAPI artifact, and verify the finding scenario stays green.
3. Stage 3 — hand off with the next numbered placeholder active and proof synced in [`../progress.md`](../progress.md).

## Test Gate

- `pnpm openapi:generate`
- `pnpm exec vitest run tests/unit/openapi-spec.test.ts`
- `UX_V2_ENABLE_KARRI_WRITE_PATH=true pnpm exec vitest run tests/unit/openapi-spec.test.ts`

## Exit Criteria

- `openApiSpec` no longer varies with write-path env flags
- [`../public/v1/openapi.json`](../public/v1/openapi.json) remains identical to the runtime builder under default and flag-enabled environments
- regression coverage proves the contract stays deterministic when `UX_V2_ENABLE_KARRI_WRITE_PATH=true`
- this spec closes with the next numbered placeholder active in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md)

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed env-sensitive write-path branching from the OpenAPI builder, added a regression that reloads the spec under enabled write-path flags, regenerated [`../public/v1/openapi.json`](../public/v1/openapi.json), and handed off into the successor slot later realized as [`./12_karri-config-readiness-alignment.md`](./12_karri-config-readiness-alignment.md).

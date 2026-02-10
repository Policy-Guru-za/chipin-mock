# Gifta UX v2 Phase B Test Matrix

## Purpose

Define mandatory backend test coverage and release gates for Phase B.

## Test Layers

- unit tests: validation, calculation, serialization
- integration tests: API + DB behavior
- contract tests: OpenAPI/runtime parity
- smoke tests: critical path production-safe checks

## Coverage Matrix

| Test ID | Area | Type | Priority | Required Assertion |
|---|---|---|---|---|
| B-T01 | Dreamboard create validation | Unit | P0 | payout/charity conditional rules enforced |
| B-T02 | Bank account validation + encryption | Unit | P0 | invalid account rejected; encrypted persistence only |
| B-T03 | Charity split config validation | Unit | P0 | percentage/threshold exclusivity enforced |
| B-T04 | Fee + raised semantics | Unit | P0 | calculations match decision register |
| B-T05 | Payout plan generation | Unit | P0 | correct payout types and amounts produced |
| B-T06 | Payout state transitions | Unit | P0 | invalid transitions blocked |
| B-T07 | Dreamboard API create/list | Integration | P0 | response contract and persistence correct |
| B-T08 | Payout pending API | Integration | P0 | supports required payout types + filters |
| B-T09 | Reminder schedule API | Integration | P0 | dedupe + window rules correct |
| B-T10 | Charity activation rules | Integration | P0 | inactive charity blocked for new associations |
| B-T11 | Reminder dispatch job | Integration | P1 | due reminders sent and marked sent |
| B-T12 | OpenAPI enum parity | Contract | P0 | runtime enums == OpenAPI enums |
| B-T13 | OpenAPI schema parity | Contract | P0 | request/response fields match runtime |
| B-T14 | Legacy Karri flow regression | Integration | P0 | existing Karri path still green |
| B-T15 | Admin payout datasets | Integration | P1 | datasets satisfy Phase C admin dependencies |
| B-T16 | Reconciliation totals | Integration | P1 | payout/report totals reconcile |

## Mandatory Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

Optional targeted examples (adapt to repo test file names):

```bash
pnpm test tests/unit/payouts
pnpm test tests/integration/api
pnpm test tests/integration/reminders
```

## Gate Policy

- `P0` failures: immediate stop, no rollout.
- `P1` failures: no full release; fix or approved temporary containment plan.
- `P2` failures: may defer with documented waiver.

## Evidence Required

For each test execution:

- command
- pass/fail result
- failing test IDs (if any)
- linked fix commit/change set

## Exit Criteria

- all `P0` tests passing
- all `P1` tests passing
- no unresolved contract parity defects

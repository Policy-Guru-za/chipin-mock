# Gifta UX v2 Agent Execution Contract

## Purpose

Machine-operable contract for AI coding agents implementing UX v2. Defines required sequence, quality bar, evidence requirements, and hard-stop conditions.

## Operating Principles

- Deterministic execution over improvisation.
- Backward-safe changes first; behavior expansion behind explicit gates.
- No hidden assumptions. Every material decision recorded.
- No phase overlap without explicit gate pass.

## Non-Negotiable Constraints

- Package manager: `pnpm` only.
- No destructive git/file operations unless explicitly required by runbook and pre-approved.
- No bypass of required gates (`lint`, `typecheck`, `test`, contract tests, rollout gates).
- No undocumented behavior changes.

## Mandatory Execution Order

1. Read index and decision register.
2. Validate Phase A completion evidence.
3. Execute Phase B plan and tests.
4. Execute Phase B rollout docs and GO decision.
5. Execute Phase C plan and tests.
6. Execute Phase C rollout docs and GO decision.
7. Perform closeout and doc sync.

## Phase Gate Policy (P0/P1/P2)

- `P0`: correctness/safety critical; block merge/deploy.
- `P1`: release readiness critical; block full rollout.
- `P2`: quality/polish; may defer only with logged waiver.

Waivers allowed only for `P2`, with expiration date and explicit rationale.

## Required Command Gates

Run at each major milestone and pre-rollout:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

If any command fails, stop phase progression.

## Required Verification Types

- Unit tests for business rules and validation.
- Integration tests for API + DB invariants.
- Contract tests for OpenAPI/runtime alignment.
- E2E tests for host/guest/admin critical journeys.
- Accessibility checks per WCAG criteria in plan.

## Required Evidence per Milestone

- command transcript summary
- changed file list
- gate status table (P0/P1/P2)
- known risks + mitigation
- rollback readiness statement

## Hard Stop Conditions

Stop immediately and mark NO-GO if any of these occur:

- money movement mismatch or payout miscalculation
- contract drift between OpenAPI and runtime responses
- critical create/contribute/payout path regression
- sustained production error spike during hold points
- unapproved decision conflicts with decision register

## Rollback Contract

- Roll back application behavior before database rollback.
- Keep additive schema changes unless dedicated rollback script is pre-reviewed.
- Preserve logs and evidence before rollback actions.

## Documentation Contract

Every behavioral change must update all affected docs in same delivery slice:

- canonical/platform docs
- API docs/OpenAPI
- rollout docs and test matrices
- decision register (if applicable)

## Completion Criteria (100%)

1. Phase B + Phase C `P0/P1` gates pass.
2. GO decisions signed for both phases.
3. Evidence archived for both phases.
4. No unresolved `P0/P1` defects.
5. Remaining `P2` items explicitly logged with owner and due date.

## Agent Handoff Payload (Required Output)

At final handoff, provide:

- execution summary by phase
- gate pass/fail matrix
- production rollout status
- unresolved risk register
- exact next-step list if any open items remain

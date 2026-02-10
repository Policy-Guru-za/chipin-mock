# Forensic Remediation Execution Roadmap (P0/P1/P2)

> **Status:** Execution plan (active)  
> **Date:** 2026-02-06  
> **Owner:** Codex (sole implementer)  
> **Branch policy:** `main` only  
> **Package manager:** `pnpm` only

---

## Objective

Execute a full forensic remediation program that fixes correctness risks, removes product/spec drift, and hardens the codebase for reliable iteration.

---

## Scope

### In scope
- Money/accounting correctness (fee, raised, funded, payout totals).
- Karri batch retry correctness.
- Dreamboard lifecycle transition consistency.
- Webhook contract/runtime alignment.
- Payout-method coherence in runtime/API/docs (`karri_card` + `bank`), including removal of half-supported branches.
- Route-policy hardening in middleware.
- Brand/domain consistency (Gifta vs ChipIn).
- Docs/API truth-sync and runbook accuracy.
- Large-module decomposition and test hardening.

### Out of scope
- New payment provider integrations.

---

## Baseline Assumptions (used to unblock execution)

If these are later changed, update this roadmap and re-run impacted phases.

1. Runtime payout surface currently includes `karri_card` and `bank`; remediation must make this coherent end-to-end (or explicitly deprecate one path with migration + docs sync).
2. Public guest page keeps showing `% funded` plus `raised/goal` totals.
3. Fee model is add-on: contributor pays `amount + fee`; board progress should reflect gift contribution amount, not fee-deducted value.

---

## Phase Map (strict sequence)

1. **P0:** Correctness + financial trust + contract integrity.
2. **P1:** Hardening + docs/API/ops truth alignment.
3. **P2:** Structural refactor + long-term maintainability.

No P1 work starts until P0 exit gate passes.  
No P2 work starts until P1 exit gate passes.

---

## P0 — Correctness and Trust (highest priority)

## P0.1 Baseline Lock and Guardrails
**Goal:** Freeze a known baseline and prevent silent regressions during fixes.

**Tasks**
- Record baseline behavior from key paths:
  - contribution create route
  - provider webhooks
  - funded transition logic
  - payout creation and Karri batch paths
- Add temporary forensic checklist to PR workflow notes.
- Ensure local gate command is standardized for all phases.

**Deliverables**
- Baseline notes in `docs/forensic-audit/STATE.md` (updated with final pre-fix snapshot).
- A reproducible verification command set in this roadmap and final report.

**Acceptance checks**
- Baseline checklist covers all confirmed findings (`F-001` to `F-007`).
- Verification command list exists and is executable in a fully provisioned env.

---

## P0.2 Financial Semantics Unification (critical)
**Goal:** One unambiguous accounting model across checkout, DB views, funded logic, and payouts.

**Tasks**
- Create canonical accounting definitions in one module (single source of truth).
- Replace ambiguous `net` usage where it conflicts with add-on fee semantics.
- Update all `raised` calculations to match canonical contribution semantics.
- Align `markDreamBoardFundedIfNeeded` with canonical `raised` semantics.
- Align payout total derivation with canonical semantics.
- Add DB migration(s) if required to correct derived fields/views.

**Primary code surfaces**
- `src/lib/payments/fees.ts`
- `src/app/api/internal/contributions/create/route.ts`
- `src/lib/db/schema.ts`
- `src/lib/db/queries.ts`
- `src/lib/db/views.ts`
- `src/lib/payouts/queries.ts`
- `src/lib/payouts/calculation.ts`

**Deliverables**
- Canonical accounting module.
- Updated queries/views/migrations.
- Tests proving funded and payout behavior.

**Acceptance checks**
- For completed contributions: board `raised_cents` equals sum of intended gift contribution amounts.
- Funded transition occurs exactly when canonical raised >= goal.
- Payout totals match canonical raised semantics.
- No route or serializer uses conflicting definitions.

**Verify**
```bash
pnpm typecheck
pnpm test tests/unit/payment-fees.test.ts tests/unit/payout-calculation.test.ts tests/unit/payout-queries.test.ts
pnpm test tests/integration/api-contributions.test.ts tests/integration/payfast-webhook.test.ts tests/integration/ozow-webhook.test.ts tests/integration/snapscan-webhook.test.ts
```

---

## P0.3 Karri Pending-Retry Attempt Fix
**Goal:** Remove retry-count regression that can mask stuck payouts.

**Tasks**
- Fix pending path attempt handling in Karri batch processor.
- Ensure retries advance attempts deterministically.
- Ensure max-attempt fail path is reachable and audited.
- Validate pending backoff behavior under repeated pending responses.

**Primary code surfaces**
- `src/lib/integrations/karri-batch.ts`
- `tests/unit/karri-batch.test.ts`
- `tests/unit/karri-batch-backoff.test.ts`

**Deliverables**
- Correct attempt progression.
- Regression tests covering pending->pending->failed lifecycle.

**Acceptance checks**
- `attempts` increments for every processing attempt including `pending` outcomes.
- Entry transitions to `failed` once max attempts reached.
- Related payout transitions to failed when queue exhausts retries.

**Verify**
```bash
pnpm test tests/unit/karri-batch.test.ts tests/unit/karri-batch-backoff.test.ts tests/unit/payout-automation.test.ts
```

---

## P0.4 Lifecycle State Machine Consolidation
**Goal:** Centralize Dreamboard and payout state transitions to eliminate scattered rules.

**Tasks**
- Introduce lifecycle transition module(s) for Dreamboard and payout status rules.
- Replace route-local transition checks with centralized validators.
- Ensure close/funded/paid_out flows use shared transition API.
- Add negative tests for invalid transitions.

**Primary code surfaces**
- `src/app/api/v1/dream-boards/[id]/route.ts`
- `src/app/api/v1/dream-boards/[id]/close/route.ts`
- `src/lib/db/queries.ts`
- `src/lib/payouts/service.ts`

**Deliverables**
- Central lifecycle module.
- Updated route/service usage.
- Transition test matrix.

**Acceptance checks**
- No status mutation bypasses lifecycle module.
- Invalid transitions return deterministic `409` conflict responses.
- `paid_out` only reached after all associated payouts complete.

**Verify**
```bash
pnpm test tests/integration/api-dream-boards-update.test.ts tests/integration/api-dream-boards-close.test.ts tests/unit/payout-service.test.ts tests/unit/payout-service-create.test.ts
```

---

## P0.5 Webhook Contract and Emission Alignment
**Goal:** Ensure declared webhook events and emitted runtime events match.

**Tasks**
- Define single authoritative event catalog constant.
- Reuse same catalog for:
  - runtime emitters
  - webhook management endpoint validation
  - OpenAPI schema generation
- Implement missing high-value lifecycle emissions or narrow catalog accordingly.
- Add event-level tests for contribution/funded/close/payout outcomes.

**Primary code surfaces**
- `src/lib/webhooks/types.ts`
- `src/app/api/v1/webhooks/route.ts`
- `src/app/api/webhooks/payfast/route.ts`
- `src/app/api/webhooks/ozow/route.ts`
- `src/app/api/webhooks/snapscan/route.ts`
- `src/lib/payouts/service.ts`
- `src/lib/webhooks/dispatcher.ts`

**Deliverables**
- Single source event catalog.
- Runtime/catalog parity.
- Event emission contract tests.

**Acceptance checks**
- Every subscribed event type is either emitted by runtime or removed from catalog/docs.
- No route defines its own independent event enum.
- Webhook queue receives expected events for core lifecycle transitions.

**Verify**
```bash
pnpm test tests/unit/webhook-dispatcher.test.ts tests/integration/api-webhooks.test.ts tests/integration/webhook-process.test.ts
```

---

## P0.6 Payout-Method Coherence (runtime and API)
**Goal:** Eliminate contradiction between dual-method schema (`karri_card` + `bank`) and Karri-centric payout execution paths.

**Tasks**
- Decide and codify final payout-method contract: fully support both methods end-to-end, or explicitly deprecate one path with migration and docs sync.
- Align host creation UX and partner create/update validation with the finalized payout-method contract.
- Align payout orchestration and readiness logic with payout method (`createPayoutsForDreamBoard`, ready-board query, pending payout API filters, recipient serialization, admin labels/actions).
- Remove method-mismatch checks that currently hard-fail or skip non-Karri boards.
- Ensure serializers, OpenAPI, and docs describe supported methods and method-specific constraints.
- Preserve legacy DB columns only where explicitly required and documented.

**Primary code surfaces**
- `src/app/(host)/create/details/page.tsx`
- `src/app/api/v1/dream-boards/route.ts`
- `src/lib/payouts/service.ts`
- `src/lib/payouts/queries.ts`
- `src/lib/payouts/automation.ts`
- `src/app/api/v1/payouts/pending/route.ts`
- `src/lib/api/payouts.ts`
- `src/lib/db/schema.ts` (constraint review)
- `src/lib/api/openapi.ts`

**Deliverables**
- Method-coherent payout flow across create/close/payout/admin surfaces.
- Updated API validation, serializers, and examples.
- Explicit automation policy by payout type.

**Acceptance checks**
- Supported payout methods can be created and closed without method-mismatch skip/error behavior.
- Ready-for-payout queries and pending payout API behavior match the finalized payout-method contract.
- Admin/API confirm/fail/automation behavior is deterministic per payout type.
- Canonical docs and OpenAPI accurately describe supported payout methods.

**Verify**
```bash
pnpm test tests/integration/api-dream-boards-list-create.test.ts tests/integration/api-dream-boards-update.test.ts tests/integration/api-payouts.test.ts tests/integration/payout-actions.test.ts tests/unit/payout-service-create.test.ts tests/unit/payout-queries.test.ts tests/unit/payout-automation.test.ts tests/unit/openapi-spec.test.ts
```

---

## P0.7 Contract-Test Safety Net
**Goal:** Codify forensic findings as automated regression contracts.

**Tasks**
- Add high-signal integration contracts for:
  - contribution amount/fee/raised consistency
  - funded threshold behavior
  - close->payout generation behavior
  - Karri retry/attempt semantics
  - webhook event emission matrix
- Add unit-level invariants for accounting and lifecycle helpers.

**Deliverables**
- New contract test suite and fixtures.

**Acceptance checks**
- Each prior forensic finding has at least one durable regression test.
- Tests fail on reintroduction of P0 defects.

**Verify**
```bash
pnpm test
```

---

## P0 Exit Gate (must pass before P1)
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
```

Gate criteria:
- No failing tests.
- Coverage threshold maintained or improved.
- P0 acceptance checks all satisfied.

---

## P1 — Hardening, Truth Sync, and Operational Reliability

## P1.1 Middleware Route Policy Centralization
**Goal:** Prevent auth/public-route drift by moving route policy to one tested config.

**Tasks**
- Extract public/bypass/job-secret route policy to dedicated module.
- Consume same policy in middleware and middleware tests.
- Add tests for route exposure regressions.

**Primary code surfaces**
- `middleware.ts`
- `src/lib/auth/*` (policy module)
- middleware test files under `tests/unit`

**Acceptance checks**
- No hard-coded route policy duplication in middleware.
- Public/protected behavior remains stable under test matrix.

**Verify**
```bash
pnpm test tests/unit/middleware-public-routes.test.ts tests/unit/middleware-clerk-protect.test.ts tests/unit/middleware-auth-unavailable.test.ts
```

---

## P1.2 Docs/OpenAPI Canonical Truth Sync
**Goal:** Align code, OpenAPI, and platform docs so no contradictory guarantees remain.

**Tasks**
- Update canonical/spec docs for finalized P0 behavior.
- Regenerate OpenAPI from code and ensure schema parity.
- Update README and AGENTS-local project section for current runtime reality.
- Mark historical implementation docs where appropriate.

**Primary docs to update**
- `docs/Platform-Spec-Docs/CANONICAL.md`
- `docs/Platform-Spec-Docs/SPEC.md`
- `docs/Platform-Spec-Docs/PAYMENTS.md`
- `docs/Platform-Spec-Docs/DATA.md`
- `docs/Platform-Spec-Docs/API.md`
- `docs/Platform-Spec-Docs/SECURITY.md`
- `README.md`

**Acceptance checks**
- No known contradiction between docs and runtime for P0 areas.
- OpenAPI endpoints and payloads match live route behavior.

**Verify**
```bash
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

---

## P1.3 Brand/Domain Consistency Cleanup
**Goal:** Normalize user-facing product naming and metadata.

**Tasks**
- Replace remaining public UI/product strings that still say ChipIn where Gifta is canonical.
- Align metadata/title/footer/header and default copy.
- Keep explicit legacy names only where technically required (API key prefix/domain migration notes).

**Primary code surfaces**
- `src/app/layout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/lib/constants.ts`
- `src/lib/dream-boards/metadata.ts`
- `src/lib/api/openapi.ts`

**Acceptance checks**
- User-facing UI strings are consistently Gifta.
- Legacy naming appears only in explicitly documented compatibility surfaces.

**Verify**
```bash
pnpm test tests/unit/ui-copy.test.ts tests/unit/openapi-spec.test.ts
```

---

## P1.4 Internal Jobs and Scheduler Runbook Hardening
**Goal:** Make operations explicit and deterministic for webhook processing, reconciliation, retention, and Karri batch.

**Tasks**
- Add concrete runbook commands for all internal job endpoints with auth headers.
- Document expected cadence, retry behavior, and alert triggers.
- Ensure health/readiness docs reflect required environment contract.

**Primary docs/surfaces**
- `docs/runbooks/webhook-failure.md`
- `docs/runbooks/payment-provider-outage.md`
- `docs/Platform-Spec-Docs/ARCHITECTURE.md`
- `docs/Platform-Spec-Docs/KARRI.md`

**Acceptance checks**
- Runbooks provide complete executable command examples.
- Scheduler dependency is explicit and non-ambiguous.

---

## P1.5 Seed, Demo, and Security-Contract Alignment
**Goal:** Remove misleading demo data behavior and tighten security fidelity.

**Tasks**
- Fix seed data to avoid raw sensitive card values.
- Align seeded webhook event names with runtime event catalog.
- Align security docs with real API key hashing and controls.

**Primary code/doc surfaces**
- `src/lib/db/seed.ts`
- `docs/demo_db_full_reset.md`
- `docs/Platform-Spec-Docs/SECURITY.md`

**Acceptance checks**
- Seed does not persist plaintext sensitive values where runtime requires encryption.
- Seeded webhook examples match runtime event types.

**Verify**
```bash
pnpm test tests/unit/encryption.test.ts tests/unit/api-auth.test.ts
pnpm db:seed
```

---

## P1 Exit Gate (must pass before P2)
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm openapi:generate
```

Gate criteria:
- P1 acceptance checks complete.
- Docs/API/runtime aligned for all P0 and P1 scope.

---

## P2 — Structural Refactor and Maintainability

## P2.1 Decompose Oversized Modules
**Goal:** Improve readability/testability by splitting high-complexity files.

**Priority targets**
- `src/lib/api/openapi.ts`
- `src/app/(host)/create/details/page.tsx`
- `src/lib/payouts/service.ts`
- `src/lib/payments/reconciliation-job.ts`
- `src/app/api/v1/dream-boards/route.ts`
- `src/components/forms/ContributionForm.tsx`

**Tasks**
- Split by domain/use-case boundaries, not arbitrary line counts.
- Move validation/serialization/business logic into pure modules.
- Keep route handlers thin and orchestration-focused.

**Acceptance checks**
- Target files reduced to manageable size and complexity.
- Behavior unchanged under existing tests.

---

## P2.2 Service Boundary Consolidation
**Goal:** Eliminate duplicated logic between routes/services/serializers.

**Tasks**
- Introduce clear domain service boundaries:
  - accounting
  - lifecycle
  - payout orchestration
  - webhook emission
- Remove repeated transform logic across API serializers.
- Standardize error mapping for internal and public APIs.

**Acceptance checks**
- Shared logic imported from single domain modules.
- Duplicate logic removed from route handlers.

---

## P2.3 Test Architecture Upgrade
**Goal:** Improve signal, speed, and maintenance of test suite.

**Tasks**
- Add reusable factories/fixtures for Dreamboard, contribution, payout, webhook event.
- Standardize integration test harness setup.
- Expand branch coverage on critical domain modules (accounting/lifecycle/webhooks).

**Acceptance checks**
- Higher confidence with fewer brittle test patterns.
- Coverage remains above threshold with stronger branch depth in critical modules.

---

## P2.4 Quality Gate Tightening
**Goal:** Keep complexity from regressing.

**Tasks**
- Tighten lint constraints gradually after decomposition.
- Ensure CI enforces lint/typecheck/tests/coverage/build consistently.
- Add static checks for route policy drift and event-catalog drift where possible.

**Acceptance checks**
- CI catches structural regressions before merge.

---

## P2 Exit Gate (program completion)
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm knip
pnpm openapi:generate
pnpm build
```

Gate criteria:
- No failing checks.
- All P0/P1/P2 acceptance checks passed.
- Forensic findings closed or explicitly documented with rationale.

---

## Rollout and Risk Control

### Delivery strategy
- Small, reviewable commits grouped by workstream.
- Migrations shipped with backward-compatible app logic first where required.
- Tests added before high-risk behavior changes where feasible.

### Rollback strategy
- Keep each workstream independently revertible.
- For schema/view changes: pair forward migration with safe rollback notes.
- For contract changes (webhooks/API): preserve compatibility windows where possible.

### High-risk areas (extra caution)
- Accounting and funded-state semantics.
- Payout queue/retry behavior.
- Webhook contract changes for partners.
- Any DB generated-column or view semantic changes.

---

## Definition of Done

The forensic remediation program is complete when:
- Financial semantics are internally consistent and regression-tested.
- Lifecycle/status transitions are centralized and enforced.
- Webhook catalog matches runtime emissions and partner contract docs.
- Karri retry behavior is deterministic and auditable.
- Product scope is coherent (payout-method contract enforced consistently across runtime/API/docs).
- Route auth policy is centralized and test-locked.
- Docs/OpenAPI/README reflect real behavior.
- Brand naming is consistent in user-facing surfaces.
- Key large modules are decomposed and easier to maintain.

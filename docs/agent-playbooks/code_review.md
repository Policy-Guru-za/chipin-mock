# Code Review Playbook

> **Status:** Current operational guide  
> **Last reviewed:** March 12, 2026

## Use This For

Use this file when the user asks for a review, audit, assessment, or critique of code, docs, or recent work in this repo.

## Mandatory Read Order

Before a substantial review, read in this order:

1. [`../../AGENTS.md`](../../AGENTS.md)
2. [`../../progress.md`](../../progress.md)
3. [`../../spec/00_overview.md`](../../spec/00_overview.md)
4. resolve the review target spec from [`../../progress.md`](../../progress.md): use `Current Spec` unless it is `NN_session-placeholder`, then use `Last Session Spec`
5. [`../DOCUMENT_CONTROL_MATRIX.md`](../DOCUMENT_CONTROL_MATRIX.md)
6. [`../Platform-Spec-Docs/CANONICAL.md`](../Platform-Spec-Docs/CANONICAL.md)
7. [`../forensic-audit/REPORT.md`](../forensic-audit/REPORT.md)
8. [`../../TESTING.md`](../../TESTING.md)
9. this file

Then read only the current subsystem docs that match the review scope. Do not default to historical plans, evidence packs, or reference-only vendor docs unless they are needed for provenance.

If the current session lacks an active spec or current progress ledger, report that as operational drift.

If `Current Spec` is `NN_session-placeholder`, treat it as a valid successor placeholder only when `Last Session Spec` cleanly owns the most recent closed session and `Last Completed Spec` still owns the latest `Done` proof. Report drift when placeholder rollover lacks valid terminal-spec linkage.

## Review Defaults

- Findings first. No summary before the findings.
- Trust current code and generated artifacts over stale prose.
- Prioritize user-facing breakage, security risk, permissioning mistakes, data correctness, contract drift, and execution-process gaps over style.
- Use file references for every material finding.
- If no findings are discovered, say so explicitly and note residual risks or test gaps.

## Severity Model

- `P0`: security exposure, destructive data risk, payout/payment correctness failure, privilege escalation, or production outage risk
- `P1`: correctness bug, permissioning gap, contract mismatch, broken user flow, or significant regression risk
- `P2`: partial regression, missing edge-case handling, missing proof on a risky path, or operational/documentation drift likely to mislead future work
- `P3`: low-risk maintainability or clarity issue that should not block the change

## Required Checklist

Review the relevant parts of this checklist for the scope. Do not claim a subsystem is healthy unless you inspected it.

### Execution Hygiene

- active numbered spec exists for the current session
- [`progress.md`](../../progress.md) identifies current spec, current stage, blockers, next step, last session spec, last completed spec, last green commands, and dogfood evidence
- the resolved review target spec’s exit criteria and actual verification evidence line up

### Auth, Roles, Permissioning

- Clerk host/admin auth wiring
- host record mapping and admin allowlist behavior
- API key auth and scope enforcement
- internal-job secret enforcement
- route/layout/server-handler access boundaries

### Security and Privacy

- input validation and trusted-host assumptions
- encryption of card, bank, and webhook secret data
- sensitive data exposure in logs, exports, responses, or admin views
- webhook verification and signature handling
- rate limiting and abuse boundaries
- retention or anonymization behavior when relevant

### Database and State

- schema constraints and migration compatibility
- create -> contribute -> close -> payout lifecycle
- enum/status transitions
- idempotency, retries, and reconciliation behavior
- query/view assumptions that can drift from runtime logic

### Payments, Payouts, Webhooks

- contribution creation and provider handoff
- PayFast, Ozow, SnapScan webhook handling
- Karri flow, bank payout flow, and charity ledger row behavior
- fee semantics, payout readiness, retry handling, and reconciliation
- public API and outgoing webhook contract drift

### UX and UI

- guest, host, admin, and payment-flow regressions
- loading, error, and empty states
- mobile flow integrity
- accessibility and semantics on touched surfaces
- user-facing copy or routing promises that backend/runtime do not honor

### Operations and Quality

- health checks, observability hooks, feature flags, mock flags
- docs drift on touched behavior
- relevant automated coverage and verification evidence

## Expected Output

Use this structure:

1. `Findings`
2. `Open Questions / Assumptions`
3. `Change Summary`
4. `Verification / Gaps`

Rules:

- `Findings` must come first and be sorted by severity.
- Each finding must include the risk, the reason it matters, and at least one file reference.
- `Open Questions / Assumptions` only after findings.
- `Change Summary` is secondary; keep it brief.
- `Verification / Gaps` must state what was run, what was inspected manually, and what was not verified.

## Verification Expectations

- Inspect `git status --short` before drawing conclusions from current uncommitted work.
- Compare current verification evidence against the resolved review target spec’s `Test Gate` and `Exit Criteria`.
- Run the smallest useful checks first, then the full repo gates when the task warrants them.
- Standard gate set for substantial review:

```bash
pnpm docs:audit
pnpm lint
pnpm typecheck
pnpm test
```

- If OpenAPI or agent-doc surfaces changed, include:

```bash
pnpm openapi:generate
pnpm docs:audit -- --sync
```

- If you could not run a check, say exactly why.

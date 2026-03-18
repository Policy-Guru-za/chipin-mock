# Code Review Playbook

> **Status:** Current operational guide  
> **Last reviewed:** March 18, 2026

## Use This For

Use this file when the user asks for a review, audit, assessment, or critique of code, docs, or recent work in this repo.

## Mandatory Read Order

Before a substantial review, follow the AGENTS startup contract first, then extend it with the review-specific docs below.

Read in this order:

1. [`../../.agents/skills/napkin/SKILL.md`](../../.agents/skills/napkin/SKILL.md)
2. [`../../docs/napkin/napkin.md`](../../docs/napkin/napkin.md)
3. [`../../AGENTS.md`](../../AGENTS.md)
4. [`../../progress.md`](../../progress.md)
5. [`../DOCUMENT_CONTROL_MATRIX.md`](../DOCUMENT_CONTROL_MATRIX.md)
6. [`../Platform-Spec-Docs/CANONICAL.md`](../Platform-Spec-Docs/CANONICAL.md)
7. [`../forensic-audit/REPORT.md`](../forensic-audit/REPORT.md)
8. [`../../TESTING.md`](../../TESTING.md)
9. this file

Then resolve the review target in this order:
1. explicit user-specified spec or files
2. matching row in `## Active Full Specs` inside [`../../progress.md`](../../progress.md)
3. newest item in `## Recently Closed Specs`
4. [`../../progress.md`](../../progress.md) `## Last Completed Spec`

Read only the current subsystem docs that match the review scope. Do not default to historical plans, evidence packs, or reference-only vendor docs unless they are needed for provenance.

## Review Defaults

- Findings first. No summary before the findings.
- Trust current code and generated artifacts over stale prose.
- Prioritize user-facing breakage, security risk, permissioning mistakes, data correctness, contract drift, and workflow-system gaps over style.
- Use file references for every material finding.
- If no findings are discovered, say so explicitly and note residual risks or test gaps.

## Severity Model

- `P0`: security exposure, destructive data risk, payout/payment correctness failure, privilege escalation, or production outage risk
- `P1`: correctness bug, permissioning gap, contract mismatch, broken user flow, or significant regression risk
- `P2`: partial regression, missing edge-case handling, missing proof on a risky path, or operational/documentation drift likely to mislead future work
- `P3`: low-risk maintainability or clarity issue that should not block the change

## Required Checklist

Review the relevant parts of this checklist for the scope.

### Execution Hygiene
- active full-path rows and quick-task rows in [`../../progress.md`](../../progress.md) match the actual work in flight
- [`../../spec/00_overview.md`](../../spec/00_overview.md) matches numbered spec final states
- finished full-path specs line up with latest proof in `Last Completed Spec`, `Last Green Commands`, `Dogfood Evidence`, and `Napkin Evidence`

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

## Verification Expectations

- Inspect `git status --short` before drawing conclusions from current uncommitted work.
- Compare current verification evidence against the resolved target’s `Test Gate` and `Exit Criteria` when a numbered spec exists.
- Run the smallest useful checks first, then the full repo gates when the task warrants them.

Standard gate set for substantial review:

```bash
pnpm docs:audit
pnpm lint
pnpm typecheck
pnpm test
```

If OpenAPI or docs-governance surfaces changed, include:

```bash
pnpm openapi:generate
pnpm docs:audit -- --sync
```

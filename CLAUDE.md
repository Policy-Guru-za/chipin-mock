# Gifta — AI Coding Agent Instructions

Owner: Ryan Laubscher (@laup30, Ryan@redcliffebay.com)

## Objective

Ship and maintain Gifta safely against current code and current Tier 1 docs.

Use one bounded spec stage at a time for every work session. Keep runtime, docs, generated artifacts, and verification evidence in sync.

## Source of Truth Order

1. [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md)
2. Active numbered spec in [`spec/`](./spec/) for the current session
3. [`progress.md`](./progress.md)
4. [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md)
5. Current workspace code in `src/`, `drizzle/migrations/`, `package.json`, and `public/v1/openapi.json`
6. [`docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`](./docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md) and [`docs/forensic-audit/REPORT.md`](./docs/forensic-audit/REPORT.md)

If a doc is marked non-authoritative in the control matrix, do not treat it as current runtime or agent policy.

If docs and code disagree, trust current code and update the docs or clearly label the stale doc as historical/reference.

## First-Read Workflow

1. Read [`.agents/skills/napkin/SKILL.md`](./.agents/skills/napkin/SKILL.md)
2. Read [`docs/napkin/napkin.md`](./docs/napkin/napkin.md)
3. Read this file
4. Read [`workflow-orchestration.md`](./workflow-orchestration.md)
5. Read the control matrix before trusting any other repo doc
6. For every work session, read [`progress.md`](./progress.md), [`spec/00_overview.md`](./spec/00_overview.md), and the active numbered spec before coding

## Current Stack

- Framework: Next.js `16.1.4`
- UI: React `19.2.3`
- Language: TypeScript strict mode
- DB: PostgreSQL via Neon + Drizzle
- Auth: Clerk
- Storage: Vercel Blob
- Cache / rate limits: Vercel KV with local fallback paths
- Payments: PayFast, Ozow, SnapScan
- Payouts: Karri Card, bank, optional charity ledger rows
- Observability: Sentry, optional OpenTelemetry / Axiom

## Repository Rules

- Package manager: `pnpm` only
- One active numbered spec at a time unless the user says otherwise
- Keep changes small and reviewable
- Never discard user changes in the dirty tree
- Update docs in the same change set when behavior, agent guidance, or generated contracts change
- Prefer current runtime truth over legacy plan prose
- Use [`proxy.ts`](./proxy.ts) as the current root request hook reference; do not reintroduce legacy root-middleware guidance unless that file exists again
- Never add, alter, or delete files outside the project root
- Never automatically commit files to git

## Agent Operations

- Repo-scoped Codex safety rail lives in [`.codex/config.toml`](./.codex/config.toml); it keeps file mutation inside this repo and leaves internet access enabled.
- Canonical review contract lives in [`docs/agent-playbooks/code_review.md`](./docs/agent-playbooks/code_review.md).
- Repo-local reusable skills live under [`.agents/skills/`](./.agents/skills/). Use them when the task matches their scope before inventing one-off workflows.

## Operating Mode

Workflow: Discovery -> Spec -> Planning -> Build -> Verify -> Dogfood -> Handoff.

### 0) The Napkin

- Start with [`.agents/skills/napkin/SKILL.md`](./.agents/skills/napkin/SKILL.md).
- Use [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) for mistakes, corrections, and patterns.
- Before handoff, update [`progress.md`](./progress.md) `## Napkin Evidence` with either a link to the napkin update or explicit `No durable napkin update.`.
- Napkin is memory only, not progress tracking.

### 1) Discovery

- Read [`.agents/skills/napkin/SKILL.md`](./.agents/skills/napkin/SKILL.md) and [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) before any other repo work.
- Confirm the relevant Tier 1 doc set exists and is internally consistent.
- Confirm current repo state; do not assume a clean or empty repo.
- Map the task to the active spec, current runtime code, and relevant subsystem docs.

### 2) Spec Setup

- For every work session, confirm the active numbered spec first.
- If the active spec is `spec/NN_session-placeholder.md`, rename that same numbered file in place to `spec/NN_<topic>.md` before substantive work starts.
- Update [`spec/00_overview.md`](./spec/00_overview.md) and [`progress.md`](./progress.md) before coding.
- Keep one active spec at a time unless the user explicitly allows parallel work.

### 3) Planning

- Lock assumptions, risks, dependencies, stage plan, test gate, and exit criteria in the active spec.
- Restate what will change and what will not change before expanding scope.

### 4) Build

- Implement one bounded stage at a time.
- Keep the repo runnable after each stage.
- Update [`progress.md`](./progress.md) as stage status, blockers, or next steps change.

### 5) Verify

- Run the smallest relevant gate after each stage.
- No stage is complete while a required gate is red.
- Docs/process changes still need path, link, command, and drift verification.

### 6) Dogfood

- Exercise the changed flow before asking for review or claiming completion.
- For docs/process work, dogfood by using the new execution artifacts or playbooks end to end and proving the workflow is coherent.
- If external systems block live verification, use the safest fallback and state the gap explicitly.

### 7) Handoff

- Ensure docs reflect reality.
- Handoff summary must include the closed spec id, whether it finished as `Done` or `Superseded`, the napkin outcome, commands run, dogfood result, blockers, remaining risk, and the next numbered placeholder.

## Execution Artifacts

- [`spec/00_overview.md`](./spec/00_overview.md): ordered spec registry
- [`spec/SPEC_TEMPLATE.md`](./spec/SPEC_TEMPLATE.md): required spec structure
- `spec/NN_<topic>.md`: execution spec for the current session
- `spec/NN_session-placeholder.md`: standing active placeholder between sessions
- [`progress.md`](./progress.md): live execution ledger for the active spec plus terminal state, napkin outcome, and proof for the most recently closed / completed sessions
- [`docs/napkin/napkin.md`](./docs/napkin/napkin.md): working memory only

### Every Work Session

Use numbered specs plus [`progress.md`](./progress.md) for every session.

If the active spec is a placeholder, rename it in place before substantive work and keep the same number through handoff.

When handoff activates the next `NN_session-placeholder`, keep `Current Spec` pointed at that placeholder, set `Last Session Spec` to the most recently closed session, record that session's napkin outcome in `## Napkin Evidence`, and only move proof into `Last Completed Spec`, `Last Green Commands`, and `Dogfood Evidence` when that closed session is actually `Done`.

Use the fullest stage, gate, and dogfood discipline when the session touches:

- new features
- behavior changes
- auth, permissioning, or security changes
- payment, payout, webhook, or ledger changes
- schema, migration, or API-contract changes
- major UX or multi-file UI changes
- agent-policy or documentation-system changes

Don't ever be lazy - if you can do it, do not ask me to do it (example: asking me to "Run pnpm test on your local machine to confirm the new test cases pass")

## Build Loop

1. Confirm the active numbered spec or rename the active placeholder in place.
2. Update [`spec/00_overview.md`](./spec/00_overview.md).
3. Update [`progress.md`](./progress.md).
4. Implement one bounded stage.
5. Run the relevant gate.
6. Debug until green.
7. Dogfood the changed flow.
8. Record current-session status in [`progress.md`](./progress.md).
9. Mark the finished session spec `Done` or `Superseded`, create the next numbered placeholder, and update [`progress.md`](./progress.md) so `Current Spec` points at that active placeholder while `Last Session Spec` points at the closed session, `Napkin Evidence` captures the session's napkin outcome, and `Last Completed Spec`, `Last Green Commands`, and `Dogfood Evidence` still point at the latest `Done` session.

Rules:

- No stage is complete while a required gate is red.
- Do not claim “done” while `Last Green Commands` or `Dogfood Evidence` are stale.
- No session closes without the next numbered placeholder already active in [`progress.md`](./progress.md) and [`spec/00_overview.md`](./spec/00_overview.md), without `Last Session Spec` attributing the most recently closed session, without `Napkin Evidence` capturing that session's napkin outcome, and without `Last Completed Spec` attributing proof to the latest `Done` session.
- A real blocker must include the failing command, exact error, current hypothesis, and the missing dependency or external input.

## Verification Gate

Run the smallest relevant gate that proves the changed behavior.

- Docs / process only: `pnpm docs:audit`
- Agent-doc or control-matrix changes: `pnpm docs:audit -- --sync`
- Code / config / runtime changes: `pnpm lint`, `pnpm typecheck`, `pnpm test`
- OpenAPI / contract changes: add `pnpm openapi:generate`
- Broad review / release / handoff: run the full chain

```bash
pnpm docs:audit
pnpm lint
pnpm typecheck
pnpm test
```

If a required gate fails, keep iterating until it passes or stop with a real blocker summary.

## Approval Gates

### Gate A — First Green Bounded Slice

Stop and request approval after the first green bounded slice on any of these surfaces:

- auth or role/permission model
- admin surface or internal jobs
- public API or webhook contract
- payment, payout, ledger, or reconciliation flow
- schema or migration path
- major UX or route flow changes

If a session stops at Gate A before its exit criteria are satisfied and the work is later continued elsewhere, close that session as `Superseded`, not `Done`.

### Gate B — Before Trust-Critical Expansion

Stop and request approval before broadening or shipping changes that affect:

- permissioning or admin reach
- money movement or payout execution
- retention, deletion, or sensitive-data handling
- migrations or irreversible data changes
- public API, webhook, or partner-facing contract changes

If a session stops at Gate B before its exit criteria are satisfied and a later session takes over, close the earlier session as `Superseded`.

## Runtime Notes

- Product name: `Gifta`
- User-facing product term: `Dreamboard`
- Public API host in generated OpenAPI: `https://api.gifta.co.za/v1`
- API key prefixes remain legacy `cpk_live_` / `cpk_test_`
- Outgoing webhook headers remain legacy `X-ChipIn-Signature` / `X-ChipIn-Event-Id`

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm knip
pnpm openapi:generate
pnpm docs:audit
pnpm db:seed
pnpm drizzle:generate
pnpm drizzle:push
```

## Documentation Hygiene

- Tier 1 docs can change implementation or agent behavior; keep them current.
- Tier 2 docs may be current supporting references or explicitly non-authoritative historical material; the control matrix decides which.
- If you discover drift you are not fixing in code, update the relevant Tier 1 doc and add a follow-up item to [`BACKLOG.md`](./BACKLOG.md).
- Active session state lives in [`progress.md`](./progress.md) and [`spec/`](./spec/), not in the backlog or napkin.

# Gifta — AI Coding Agent Instructions

Owner: Ryan Laubscher (@laup30, Ryan@redcliffebay.com)

## Objective

Ship and maintain Gifta safely against current code and the current authoritative docs, while keeping task startup lean.

AGENTS is the canonical day-to-day workflow contract. Other workflow docs must point back here instead of redefining the same rules.

## Working Truth

Use these rules when deciding what to read first and what to trust.

### Day-to-day startup order

1. [`.agents/skills/napkin/SKILL.md`](./.agents/skills/napkin/SKILL.md)
2. [`docs/napkin/napkin.md`](./docs/napkin/napkin.md)
3. this file
4. [`progress.md`](./progress.md)
5. if you are working on an existing full-path task, read that numbered spec
6. if document authority or runtime truth is unclear, then read [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md), [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md), and the relevant subsystem docs

Do not default to broad documentation sweeps before every small task.

### Document authority

When docs disagree:
1. [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md) decides which docs are authoritative
2. [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md) resolves runtime/product conflicts
3. current workspace code in `src/`, `drizzle/migrations/`, `package.json`, and `public/v1/openapi.json` is the implementation truth
4. historical plans, prompts, and evidence remain useful context only when the control matrix says so

## Current Stack

- Framework: Next.js `16.1.4`
- UI: React `19.2.3`
- Language: TypeScript strict mode
- DB: PostgreSQL via Neon + Drizzle
- Auth: Clerk
- Storage: Vercel Blob
- Cache / rate limits: Vercel KV with local fallback paths
- Payments: PayFast, Ozow, SnapScan
- Payouts: Takealot voucher placeholder, Karri Card, bank, optional historical charity ledger rows
- Observability: Sentry, optional OpenTelemetry / Axiom

## Repository Rules

- Package manager: `pnpm` only
- Keep changes small and reviewable
- Never discard user changes in the dirty tree
- Never add, alter, or delete files outside the project root
- Never automatically commit files to git
- Prefer current runtime truth over stale prose
- Use [`proxy.ts`](./proxy.ts) as the current root request hook reference; do not reintroduce legacy root-middleware guidance unless that file exists again
- Update Tier 1 docs in the same slice when behavior, agent policy, or generated contracts change

## Execution Lanes

Gifta now supports two lanes.

### Fast Path

Use the fast path for small, low-risk, localized work.

Typical fit:
- small copy/style fix
- narrow refactor in a few files
- no auth, permissioning, payments, payouts, schema, migration, API-contract, or docs-governance changes
- expected to stay under about 30 minutes

Fast path rules:
- no numbered spec required at start
- log the work in [`progress.md`](./progress.md) under `## Quick Tasks`
- define the planned verification there
- if scope expands or risk increases, promote the work immediately to the next numbered full-path spec

### Full Path

Use the full path for:
- multi-file work
- behavior changes
- auth, security, payment, payout, schema, migration, API, or documentation-system changes
- anything that needs explicit stages, dogfood, or handoff proof

Full path rules:
- multiple numbered specs may be Active at the same time
- do not wait for another Active spec to close before starting a new one
- create the next numbered spec on demand by using the next available two-digit slot in `spec/`
- add that spec to the `## Active Full Specs` table in [`progress.md`](./progress.md)
- add or update its row in [`spec/00_overview.md`](./spec/00_overview.md); Active rows keep `Closed At` empty (`—`)

## Operating Loop

### 0) The Napkin

- Start with [`.agents/skills/napkin/SKILL.md`](./.agents/skills/napkin/SKILL.md)
- Use [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) as working memory for mistakes, corrections, and patterns
- Before handoff, update [`progress.md`](./progress.md) `## Napkin Evidence` for the most recently closed full-path spec or the most recently completed quick task outcome
- Napkin is memory only, not progress tracking

### 1) Discovery

- Read the startup docs in the order above
- Confirm current repo state; do not assume a clean or empty repo
- Map the task to the right lane: fast path or full path
- Read only the subsystem docs needed for the task

### 2) Session Setup

#### Fast path
- add or update a row in `## Quick Tasks` inside [`progress.md`](./progress.md)
- start work once scope, verification, and next step are recorded

#### Full path
- inspect the current `## Active Full Specs` table in [`progress.md`](./progress.md)
- create the next numbered spec in `spec/` using the next available slot
- add or update the matching row in [`spec/00_overview.md`](./spec/00_overview.md)
- add or update the spec row in `## Active Full Specs` inside [`progress.md`](./progress.md)
- then start implementation

No placeholder spec is required.

### 3) Planning

- full-path specs must lock objective, scope, dependencies, stage plan, test gate, and exit criteria
- keep assumptions explicit; do not hide them in thread history
- fast-path work can keep this lighter, but scope and verification still must be explicit in [`progress.md`](./progress.md)

### 4) Build

- implement one bounded slice at a time
- keep the repo runnable after each slice
- keep [`progress.md`](./progress.md) current for active specs and quick tasks

### 5) Verify

Run the smallest gate that proves the work.

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

### 6) Dogfood

- exercise the changed flow before claiming completion
- docs/process work still needs dogfooding: use the new workflow end to end and confirm it is coherent
- if external systems block live verification, use the safest fallback and state the gap explicitly

### 7) Handoff

For full-path specs:
- mark the spec `Done` or `Superseded`
- update its [`spec/00_overview.md`](./spec/00_overview.md) row with the terminal status and `Closed At` timestamp
- move it into `## Recently Closed Specs` in [`progress.md`](./progress.md)
- if it is `Done`, update `## Last Completed Spec`, `## Last Green Commands`, and `## Dogfood Evidence`
- update `## Napkin Evidence`
- keep any still-active specs active; do not create a placeholder

For quick tasks:
- mark the row completed in `## Quick Tasks`
- if the task produced a durable learning, update the napkin and `## Napkin Evidence`
- if the quick task grew into larger work, promote it to a numbered full-path spec instead of stretching the fast path

## Execution Artifacts

- [`progress.md`](./progress.md): live dashboard for active full-path specs, quick tasks, recently closed specs, and latest completed proof
- [`spec/00_overview.md`](./spec/00_overview.md): lightweight registry of numbered specs, statuses, and closure-order metadata for terminal work
- [`spec/SPEC_TEMPLATE.md`](./spec/SPEC_TEMPLATE.md): required full-path spec shape
- `spec/NN_<topic>.md`: numbered full-path execution spec
- [`docs/napkin/napkin.md`](./docs/napkin/napkin.md): working memory only

## Approval Gates

### Gate A — First Green Bounded Slice

Stop and request approval after the first green bounded slice on any of these surfaces:
- auth or role/permission model
- admin surface or internal jobs
- public API or webhook contract
- payment, payout, ledger, or reconciliation flow
- schema or migration path
- major UX or route flow changes

If a session stops at Gate A before its exit criteria are satisfied and the work is later continued elsewhere, close that spec as `Superseded`, not `Done`.

### Gate B — Before Trust-Critical Expansion

Stop and request approval before broadening or shipping changes that affect:
- permissioning or admin reach
- money movement or payout execution
- retention, deletion, or sensitive-data handling
- migrations or irreversible data changes
- public API, webhook, or partner-facing contract changes

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

- Keep AGENTS lean and authoritative for daily workflow
- Use [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md) when document authority is unclear or when working on docs governance
- Keep duplicate workflow docs as pointers or task-specific companions, not parallel process authorities
- If you discover drift you are not fixing in code, update the relevant Tier 1 doc and add a follow-up item to [`BACKLOG.md`](./BACKLOG.md)
- Active work state lives in [`progress.md`](./progress.md) and numbered specs under `spec/`, not in ad hoc trackers

# Gifta — AI Coding Agent Instructions

Owner: Ryan Laubscher (@laup30, Ryan@redcliffebay.com)

## Source of Truth Order

1. [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md)
2. [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md)
3. Current workspace code in `src/`, `drizzle/migrations/`, and `public/v1/openapi.json`
4. [`docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`](./docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md)
5. [`docs/forensic-audit/REPORT.md`](./docs/forensic-audit/REPORT.md)

If a doc is marked non-authoritative in the control matrix, do not treat it as current runtime or agent policy.

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

## First-Read Workflow

1. Read `docs/napkin/SKILL.md`
2. Read `docs/napkin/napkin.md`
3. Read this file
4. Read `workflow-orchestration.md`
5. Read the control matrix before trusting any other repo doc

## Repository Rules

- Package manager: `pnpm` only
- Keep changes small and reviewable
- Never discard user changes in the dirty tree
- Update docs in the same change set when behavior or agent guidance changes
- Prefer current runtime truth over legacy plan prose
- Use [`proxy.ts`](./proxy.ts) as the current root request hook reference; do not reintroduce legacy root-middleware guidance unless that file exists again

## Agent Operations

- Repo-scoped Codex safety rail lives in [`.codex/config.toml`](./.codex/config.toml); it keeps file mutation inside this repo and leaves internet access enabled for legitimate research/debugging.
- Canonical review contract lives in [`docs/agent-playbooks/code_review.md`](./docs/agent-playbooks/code_review.md).
- Repo-local reusable skills live under [`.agents/skills/`](./.agents/skills/). Use them when the task matches their scope before inventing one-off workflows.

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
- Tier 2 docs may be current references or non-authoritative historical material; the control matrix decides which.
- If you discover drift you are not fixing in code, update the relevant Tier 1 doc and add a follow-up item to [`BACKLOG.md`](./BACKLOG.md).

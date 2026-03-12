# Gifta

> **Status:** Current workspace reference  
> **Last reviewed:** March 12, 2026  
> **Scope:** As-built repo state, including current uncommitted documentation work

## Start Here

Read in this order:

1. [`AGENTS.md`](./AGENTS.md)
2. [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md)
3. [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md)
4. [`docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`](./docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md)
5. [`docs/forensic-audit/REPORT.md`](./docs/forensic-audit/REPORT.md)
6. [`docs/agent-playbooks/code_review.md`](./docs/agent-playbooks/code_review.md) when the task is a review or audit

If docs disagree, use the current workspace code plus [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md). Historical and reference-only docs are labeled in the control matrix and, where required, inside the files themselves.

## Product Summary

Gifta is a Next.js application for birthday gifting around a single Dreamboard:

- Host creates a Dreamboard for one child and one gift.
- Guests chip in through a public mobile-web flow.
- Payments use PayFast, Ozow, or SnapScan.
- Gift payout supports Karri Card and bank transfer; charity payouts are tracked separately when enabled.
- Host/admin auth uses Clerk.

## Current Stack

| Layer | Current implementation |
| --- | --- |
| Framework | Next.js `16.1.4` |
| UI | React `19.2.3` |
| Language | TypeScript strict mode |
| Database | PostgreSQL on Neon via Drizzle |
| Auth | Clerk |
| Storage | Vercel Blob |
| Cache / rate limits | Vercel KV with local fallback in some paths |
| Payments | PayFast, Ozow, SnapScan |
| Payouts | Karri Card, bank, charity ledger rows |
| Observability | Sentry, optional OpenTelemetry, optional Axiom wiring |

## Workspace Facts That Matter

- Public OpenAPI host: `https://api.gifta.co.za/v1`
- API keys still use the legacy `cpk_live_` / `cpk_test_` prefixes
- Webhook signing headers still use the legacy `X-ChipIn-*` names
- Root edge hook is [`proxy.ts`](./proxy.ts), not the removed legacy root-middleware file
- Current workspace baseline includes user WIP under `docs/UI-refactors/Avatar-refactor/` and `docs/Demo-Mode/screenshots/`

## Key Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm docs:audit
```

## Documentation Map

### Tier 1

- [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md): current runtime/product authority
- [`docs/Platform-Spec-Docs/API.md`](./docs/Platform-Spec-Docs/API.md): human API companion to OpenAPI
- [`docs/forensic-audit/REPORT.md`](./docs/forensic-audit/REPORT.md): current-state assessment
- [`docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md`](./docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md): current UX v2 control doc
- [`docs/agent-playbooks/code_review.md`](./docs/agent-playbooks/code_review.md): canonical review contract for this repo

### Tier 2

Tier 2 docs remain useful, but many are non-authoritative plans, evidence packs, vendor references, or design artifacts. Use the control matrix before treating any of them as current implementation truth.

## Agent Operations

- Repo-scoped Codex config lives at [`.codex/config.toml`](./.codex/config.toml); it narrows file mutation to this repo while keeping network access enabled.
- Repo-local reusable skills live under [`.agents/skills/`](./.agents/skills/).

## Verification Baseline

Verified on March 12, 2026:

- `pnpm lint`: pass with existing warnings only
- `pnpm typecheck`: pass
- `pnpm test`: pass (`192` files / `978` tests)

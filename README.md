# Gifta

> **Status:** Current workspace reference  
> **Last reviewed:** March 18, 2026  
> **Scope:** As-built repo state and the current workflow system

## Start Here

For day-to-day work, keep startup lean but start with the napkin-first contract:

1. [`.agents/skills/napkin/SKILL.md`](./.agents/skills/napkin/SKILL.md)
2. [`docs/napkin/napkin.md`](./docs/napkin/napkin.md)
3. [`AGENTS.md`](./AGENTS.md) for the exact day-to-day workflow rules
4. [`progress.md`](./progress.md)
5. the numbered spec you are working on, if the task is on the full path

Read these only when needed:
- [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md) when document authority is unclear or the task touches docs governance
- [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md) when runtime/product truth is in question
- [`docs/agent-playbooks/code_review.md`](./docs/agent-playbooks/code_review.md) for review/audit work
- [`TESTING.md`](./TESTING.md) when verification expectations are unclear

## Product Summary

Gifta is a Next.js application for one-child, one-gift Dreamboards:
- Hosts create Dreamboards
- Guests chip in through a public mobile-web flow
- Payments use PayFast, Ozow, or SnapScan
- Standard payout uses a Takealot voucher placeholder; Karri Card and bank remain gated legacy or partner paths
- Host/admin auth uses Clerk

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
| Payouts | Takealot voucher placeholder, Karri Card, bank, historical charity ledger rows |
| Observability | Sentry, optional OpenTelemetry, optional Axiom wiring |

## Active Work System

- [`AGENTS.md`](./AGENTS.md): canonical workflow rules
- [`progress.md`](./progress.md): live dashboard for active full specs, quick tasks, recently closed specs, and latest completed proof
- [`spec/00_overview.md`](./spec/00_overview.md): registry of numbered specs, statuses, and terminal `Closed At` ordering metadata
- [`spec/SPEC_TEMPLATE.md`](./spec/SPEC_TEMPLATE.md): full-path spec template
- `spec/NN_<topic>.md`: numbered full-path spec created on demand
- no standing placeholder spec is required

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

### Workflow / operations
- [`AGENTS.md`](./AGENTS.md)
- [`progress.md`](./progress.md)
- [`spec/00_overview.md`](./spec/00_overview.md)
- [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md)

### Runtime / product truth
- [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md)
- current code in `src/`, `drizzle/migrations/`, `package.json`, and `public/v1/openapi.json`

### Reviews / verification
- [`docs/agent-playbooks/code_review.md`](./docs/agent-playbooks/code_review.md)
- [`TESTING.md`](./TESTING.md)

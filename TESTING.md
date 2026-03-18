# Testing

> **Status:** Current verification guide  
> **Last reviewed:** March 18, 2026

## Standard Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm docs:audit
```

## Additional Useful Commands

```bash
pnpm test:coverage
pnpm knip
pnpm test:payments
pnpm test:webhooks
pnpm test:payouts
```

## Evidence Discipline

- Keep [`progress.md`](./progress.md) current for active full specs and quick tasks.
- Full-path work should map verification back to the numbered spec’s `Test Gate` and `Exit Criteria`.
- Fast-path work should record planned verification in the `## Quick Tasks` table before implementation and the outcome before handoff.
- Keep [`spec/00_overview.md`](./spec/00_overview.md) aligned with numbered spec statuses, and add terminal `Closed At` metadata when slot 40+ specs close.
- When a full-path spec finishes as `Done`, update `## Last Completed Spec`, `## Last Green Commands`, and `## Dogfood Evidence` in [`progress.md`](./progress.md).
- When a full-path spec finishes as `Superseded`, move it into `## Recently Closed Specs` and keep the latest `Done` proof owner unchanged.
- Docs/process changes still need `pnpm docs:audit` and explicit link/path/command verification.
- If OpenAPI or docs-governance surfaces changed, include `pnpm openapi:generate` and `pnpm docs:audit -- --sync` where relevant.

## Coverage Notes

- Vitest enforces global coverage thresholds from `vitest.config.ts`.
- `src/lib/db/schema.ts` and `src/lib/db/queries.ts` stay excluded because they are declarative or integration-heavy surfaces.
- If pure logic is added beside query builders, move it into a helper module and cover it directly.

## Notes

- `pnpm test -- <path>` still executes the full Vitest suite in this repo; do not assume file-level isolation.
- Regenerate OpenAPI before verifying spec-contract tests when `src/lib/api/openapi.ts` changes.

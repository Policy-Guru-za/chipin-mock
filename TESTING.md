# Testing

> **Status:** Current operational guide  
> **Last reviewed:** March 12, 2026

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

- For every work session, keep `Current Spec`, `Current Stage`, `Status`, `Blockers`, and `Next Step` current in [`progress.md`](./progress.md).
- At handoff, record the finished spec in `Last Completed Spec` and attach `Last Green Commands` plus `Dogfood Evidence` to that completed spec.
- Substantial work should map verification back to the active spec’s `Test Gate` and `Exit Criteria`.
- If `Current Spec` is a successor placeholder, use `Last Completed Spec` when you need the proof for the session that just finished.
- Docs/process changes still need `pnpm docs:audit` and explicit link/path/command verification.
- If OpenAPI or agent-doc surfaces changed, include `pnpm openapi:generate` and `pnpm docs:audit -- --sync` where relevant.

## Coverage Notes

- Vitest enforces global coverage thresholds from `vitest.config.ts`.
- `src/lib/db/schema.ts` and `src/lib/db/queries.ts` stay excluded because they are declarative or integration-heavy surfaces.
- If pure logic is added beside query builders, move it into a helper module and cover it directly.

## Current Baseline

Verified on March 12, 2026:

- `pnpm lint`: pass with existing warnings only
- `pnpm typecheck`: pass
- `pnpm test`: pass (`192` files / `978` tests)

## Notes

- `pnpm test -- <path>` still executes the full Vitest suite in this repo; do not assume file-level isolation.
- Regenerate OpenAPI before verifying spec-contract tests when `src/lib/api/openapi.ts` changes.

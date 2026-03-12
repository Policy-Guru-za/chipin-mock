# Forensic Audit State

Last updated: March 12, 2026

## Purpose

Single operational state file for the current documentation and workspace audit.

Read with:

1. [`docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`](./WORKSPACE_BASELINE_2026-03-12.md)
2. [`docs/forensic-audit/DOC-DRIFT.md`](./DOC-DRIFT.md)
3. [`docs/forensic-audit/REPORT.md`](./REPORT.md)

## Baseline

- Workspace truth = current files on disk, not committed `main` only
- Branch = `main`
- HEAD = `9699e62`
- Current gate status:
  - `pnpm lint`: pass with existing warnings only
  - `pnpm typecheck`: pass
  - `pnpm test`: pass (`192` files / `978` tests)

## Confirmed Runtime Facts

- Root request hook is [`proxy.ts`](../../proxy.ts); it adds `x-request-id` and is not the auth gate.
- Host and admin auth are handled through Clerk wrappers and layout / route-level guards.
- Public OpenAPI host is `https://api.gifta.co.za/v1`.
- API keys still use `cpk_live_` / `cpk_test_`.
- Outgoing webhook headers still use `X-ChipIn-*`.
- Guest progress surfaces show percentage plus Rand totals; individual contribution amounts stay private.
- Dreamboards close explicitly through the partner API; no in-repo auto-close scheduler exists.

## Findings Register

| ID | Status | Area | Summary | Primary evidence |
| --- | --- | --- | --- | --- |
| F-001 | current | Documentation drift | Root and platform docs had stale links, stale API/domain references, and stale auth-entrypoint references | [`README.md`](../../README.md), [`docs/Platform-Spec-Docs/API.md`](../Platform-Spec-Docs/API.md), [`docs/Platform-Spec-Docs/ARCHITECTURE.md`](../Platform-Spec-Docs/ARCHITECTURE.md) |
| F-002 | current | Auth / routing docs | Older forensic docs still described the removed root-middleware file; runtime now uses [`proxy.ts`](../../proxy.ts) and route/layout guards | [`proxy.ts`](../../proxy.ts), `src/app/(admin)/layout.tsx` |
| F-003 | current | Doc governance gap | Repo lacked a durable control matrix and repeatable doc-audit command | [`docs/DOCUMENT_CONTROL_MATRIX.md`](../DOCUMENT_CONTROL_MATRIX.md), [`scripts/docs/audit.mjs`](../../scripts/docs/audit.mjs) |
| F-004 | known issue | Karri automation | Pending Karri responses still reset the queue attempt counter to the prior value | [`src/lib/integrations/karri-batch.ts`](../../src/lib/integrations/karri-batch.ts) |

## Current Audit Focus

1. Keep Tier 1 docs aligned with runtime and OpenAPI.
2. Mark non-authoritative Tier 2 docs explicitly.
3. Keep link integrity and stale-token checks enforced through `pnpm docs:audit`.

## Next Actions

1. Finish the Tier 1 rewrite pass.
2. Sync status banners and generate the control matrix.
3. Run `pnpm openapi:generate`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

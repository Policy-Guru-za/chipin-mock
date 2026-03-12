# Gifta UX v2 Master Implementation Index

> **Status:** Current operational guide  
> **Last reviewed:** March 12, 2026

## Read Order

1. [`docs/DOCUMENT_CONTROL_MATRIX.md`](../DOCUMENT_CONTROL_MATRIX.md)
2. [`docs/Platform-Spec-Docs/CANONICAL.md`](../Platform-Spec-Docs/CANONICAL.md)
3. [`docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`](../forensic-audit/WORKSPACE_BASELINE_2026-03-12.md)
4. [`GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`](./GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md)
5. [`GIFTA_UX_V2_DECISION_REGISTER.md`](./GIFTA_UX_V2_DECISION_REGISTER.md)

## Current Rule

Treat older execution plans, prompts, and evidence packs in this directory as non-authoritative unless the control matrix explicitly marks them current.

## Current Operational Docs

- [`GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`](./GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md)
- [`GIFTA_UX_V2_DECISION_REGISTER.md`](./GIFTA_UX_V2_DECISION_REGISTER.md)
- [`docs/Platform-Spec-Docs/CANONICAL.md`](../Platform-Spec-Docs/CANONICAL.md)
- generated OpenAPI in [`public/v1/openapi.json`](../../public/v1/openapi.json)

## Required Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm docs:audit
```

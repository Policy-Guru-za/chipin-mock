# Gifta UX v2 Agent Execution Contract

> **Status:** Current operational guide  
> **Last reviewed:** March 12, 2026

## Non-Negotiables

- `pnpm` only
- no destructive git/file actions without explicit approval
- do not treat non-authoritative docs as current instructions
- update Tier 1 docs in the same slice as behavior-changing code

## Mandatory Read Order

1. [`docs/napkin/SKILL.md`](../napkin/SKILL.md)
2. [`docs/napkin/napkin.md`](../napkin/napkin.md)
3. [`docs/DOCUMENT_CONTROL_MATRIX.md`](../DOCUMENT_CONTROL_MATRIX.md)
4. [`docs/Platform-Spec-Docs/CANONICAL.md`](../Platform-Spec-Docs/CANONICAL.md)
5. [`GIFTA_UX_V2_DECISION_REGISTER.md`](./GIFTA_UX_V2_DECISION_REGISTER.md)

## Required Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm docs:audit
```

## Documentation Contract

- Current operational or authoritative docs must stay aligned with workspace truth.
- Historical plans, prompts, and evidence stay preserved but must remain clearly labeled non-authoritative.
- If generated OpenAPI changes, regenerate `public/v1/openapi.json` before handoff.

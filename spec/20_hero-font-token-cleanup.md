# 20_hero-font-token-cleanup

## Objective

- Restore the reviewed homepage Hero typography contract by separating display and editorial font tokens, wiring the current homepage Hero to the editorial token used in the prototype, and preserving consistent serif semantics across the app.

## In Scope

- Font-token plumbing in `src/app/layout.tsx`, `src/app/globals.css`, and `tailwind.config.ts` needed to restore the prototype token model.
- Homepage Hero typography updates in the active below-nav homepage replica components.
- Cleanup of the legacy landing Hero token usage so future comparisons do not point at the wrong serif face.
- Focused regression coverage for the homepage font-token contract and the shared display-token semantics.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Reworking homepage layout, copy, spacing, or motion beyond typography-token parity.
- Broad redesign of guest, host, admin, or dashboard typography unrelated to the shared display/editorial token cleanup.
- New font families, self-hosted local font files, or non-Google-font substitutions.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Prototype homepage font contract in `../tmp/gifta-react/index.html` and `../tmp/gifta-react/src/styles.css`
- Current homepage replica runtime in `../src/components/landing-exact/`
- Current global font wiring in `../src/app/layout.tsx`, `../src/app/globals.css`, and `../tailwind.config.ts`

## Stage Plan

1. Stage 1 — Restore the prototype font-token semantics in app globals and Tailwind, including a dedicated editorial token for Fraunces and shared display token semantics for DM Serif Display.
2. Stage 2 — Rewire the active homepage Hero (and legacy landing Hero cleanup path) to use the editorial token where the reviewed design does, then add focused regression coverage.
3. Stage 3 — Run the verification gate, dogfood the homepage Hero typography against the reviewed local design source, and hand off into `21_session-placeholder`.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual dogfood of `/` focused on the Hero headline/editorial serif rendering versus the reviewed prototype source under `tmp/gifta-react/`.

## Exit Criteria

- The app restores separate display/editorial font semantics matching the reviewed prototype: shared display surfaces resolve to DM Serif Display while the homepage Hero editorial surfaces resolve to Fraunces.
- The active homepage Hero no longer depends on the overloaded `--font-display` token for the editorial headline.
- The legacy landing Hero no longer advertises the wrong serif token for this design.
- Focused regression coverage proves the shared font-token contract plus the homepage Hero editorial token usage.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records Hero typography verification against the reviewed prototype source.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Restored separate display/editorial font semantics, rewired the active homepage Hero and legacy landing Hero to the editorial token where required, added focused regression coverage, and verified with docs audit, lint, typecheck, and test; live localhost Hero dogfood was unavailable because neither the prototype nor app server was running in this workspace, so the session used source-level prototype comparison as the explicit fallback proof.

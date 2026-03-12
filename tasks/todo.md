# Task Todo

## Plan (Codex Guardrails, Review Playbook, and Repo-Local Skills)
- [x] Add repo-scoped `.codex/config.toml` with repo-only write guardrails and network access enabled.
- [x] Add Tier 1 review playbook at `docs/agent-playbooks/code_review.md`.
- [x] Add repo-local skills under `.agents/skills/` for review, docs sync, payments/webhooks debugging, and release verification.
- [x] Update agent onboarding docs and control-matrix rules for the new artifacts.
- [x] Run docs sync and full verification gates.

## Review (Codex Guardrails, Review Playbook, and Repo-Local Skills)
- Added repo-scoped Codex config in `.codex/config.toml` with:
- `sandbox_mode = "workspace-write"`
- `network_access = true`
- no extra writable roots
- `exclude_slash_tmp = true`
- `exclude_tmpdir_env_var = true`
- tmp exclusions enabled so writes stay inside the repo context
- Added current operational review contract at `docs/agent-playbooks/code_review.md`.
- Added repo-local skills:
- `.agents/skills/review-flow/SKILL.md`
- `.agents/skills/docs-sync/SKILL.md`
- `.agents/skills/payments-webhooks-debug/SKILL.md`
- `.agents/skills/release-verification/SKILL.md`
- Updated `.agents/skills/review-flow/SKILL.md` so its read order mirrors the canonical review playbook and its workflow allows current-reference subsystem docs when they are the active scope references.
- Updated `AGENTS.md`, `README.md`, and `scripts/docs/control-matrix.mjs` so the new artifacts are discoverable and governed by `pnpm docs:audit`.
- Verification:
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual Codex Mac app verification of repo-scoped sandbox behavior and skill discovery still needs to be done in the app itself.

## Plan (Workspace-State Documentation Audit and Sync)
- [x] Add document governance scaffolding (`docs/DOCUMENT_CONTROL_MATRIX.md`, `scripts/docs/audit.mjs`, `pnpm docs:audit`).
- [x] Freeze the March 12, 2026 workspace baseline in forensic docs.
- [x] Refresh Tier 1 docs to current workspace truth.
- [x] Label non-authoritative Tier 2 docs and fix repo-owned markdown navigation.
- [x] Regenerate OpenAPI artifact and run verification gates.
- [x] Capture review notes and remaining risks.

## Review (Workspace-State Documentation Audit and Sync)
- Added shared doc-governance tooling:
- `scripts/docs/control-matrix.mjs`
- `scripts/docs/audit.mjs`
- `pnpm docs:audit`
- Generated `docs/DOCUMENT_CONTROL_MATRIX.md` for all `143` repo-owned markdown files.
- Added non-authoritative status banners across Tier 2 reference, historical-plan, and historical-evidence docs.
- Added current baseline capture in `docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`.
- Rewrote Tier 1 root docs and core platform/forensic/control docs to align with current workspace truth.
- Regenerated `public/v1/openapi.json` from `src/lib/api/openapi.ts`.
- Verification:
- `pnpm openapi:generate` (pass)
- `pnpm docs:audit` (pass)
- `pnpm lint` (pass; existing warnings only)
- `pnpm typecheck` (pass)
- `pnpm test` (pass; `192` files / `978` tests)
- Remaining known runtime risk:
- Karri pending retry bookkeeping bug in `src/lib/integrations/karri-batch.ts` remains tracked in `BACKLOG.md`.

## Plan (Host Validation Fix)
- [x] Add shared runtime base URL resolver with trusted host/protocol validation.
- [x] Replace duplicated base URL logic in guest metadata pages and OG route.
- [x] Update/add tests for preview-host behavior and untrusted-host fallback.
- [x] Run targeted tests and record results.

## Review (Host Validation Fix)
- Added `resolveRuntimeBaseUrl` in `src/lib/utils/request.ts` with:
- strict host sanitization (`/`, `\\`, whitespace, `@`, query/fragment chars rejected),
- trusted-host allowlist (`NEXT_PUBLIC_APP_URL` host + `VERCEL_URL` host + localhost variants),
- protocol normalization (`http|https` only, local fallback to `http`),
- safe fallback to configured app URL.
- Replaced duplicate header parsing in:
- `src/app/(guest)/[slug]/page.tsx`
- `src/app/(guest)/[slug]/contribute/page.tsx`
- `src/app/api/og/[slug]/route.tsx`
- Added coverage:
- `tests/unit/request-base-url.test.ts`
- expanded `tests/integration/api-og-route.test.ts` for trusted preview host and untrusted forwarded-host rejection.
- Verification:
- `pnpm test tests/integration/api-og-route.test.ts tests/unit/dream-board-metadata.test.ts tests/unit/request-base-url.test.ts` (pass)
- `pnpm typecheck` (pass)
- `pnpm exec eslint 'src/lib/utils/request.ts' 'src/app/api/og/[slug]/route.tsx' 'src/app/(guest)/[slug]/page.tsx' 'src/app/(guest)/[slug]/contribute/page.tsx' 'tests/integration/api-og-route.test.ts' 'tests/unit/request-base-url.test.ts'` (0 errors, existing complexity warning only)

## Plan
- [x] Fix draft persistence unmount flush in `useDraftPersistence`.
- [x] Fix inline error id uniqueness in `WizardInlineError`.
- [x] Run gate checks (`pnpm lint`, `pnpm typecheck`, `pnpm test`).
- [x] Add review notes.

## Review
- Implemented cleanup flush for pending debounced draft writes before unmount timer clear.
- Added unique scope support for inline error IDs (`idScope` + `useId()` fallback) to avoid duplicate DOM ids.
- Verification: `pnpm lint` (warnings-only, no errors), `pnpm typecheck` (pass), `pnpm test` (168 files, 752 tests passed).

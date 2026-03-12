# Workspace Baseline — March 12, 2026

## Scope

- Baseline type: current workspace state
- Review date: March 12, 2026
- Branch: `main`
- HEAD: `9699e62`
- Source of truth for this audit: current files on disk, including uncommitted documentation work

## Frozen Git Baseline

### `git status --short`

```text
 D docs/UI-refactors/user-avatar-simplify.md
?? docs/Demo-Mode/screenshots/
?? docs/UI-refactors/Avatar-refactor/user-avatar-simplify.md
?? docs/UI-refactors/Avatar-refactor/user-avatar-variant3-instructions.md
```

### Recent commit trend (`git log --oneline --decorate -n 25`)

Recent work is concentrated in:

- avatar/header polish
- host dashboard refactor
- create-flow step splits
- public Dreamboard and OG updates
- payout and giving-back flow refinement

Notable commits in review scope:

- `9699e62` refactor: global CSS cleanup and avatar/signet ordering
- `f1acb8e` refactor: avatar selector specificity cleanup
- `f4717d1` fix: avatar tweaks
- `833c600` fix: avatar unicode + birthday party detail cleanup
- `1402b2a` feat: Host Dashboard UI Refactor
- `0cfc3f3` feat: payout UX refactor
- `e0322ec` feat: giving-back form/preview improvements

## Current Gate Results

Baseline gate run completed on March 12, 2026:

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm lint` | PASS with warnings | `130` existing warnings, `0` errors |
| `pnpm typecheck` | PASS | no type errors |
| `pnpm test` | PASS | `192` files, `978` tests |

## Recent Work to Documentation Impact Map

### Avatar / header work

- Affects: `README.md`, `AGENTS.md`, `docs/UI-refactors/Avatar-refactor/*`, any current UX copy or agent guidance that still references the pre-move avatar docs.
- Baseline rule: include both the deleted legacy path and the new uncommitted `Avatar-refactor` paths in the audit.

### Host dashboard refactor

- Affects: `docs/Platform-Spec-Docs/UX.md`, `docs/Platform-Spec-Docs/JOURNEYS.md`, `docs/UX/ui-specs/14-HOST-DASHBOARD-LIST.md`, `docs/UX/ui-specs/15-HOST-DASHBOARD-DETAIL.md`, implementation-control docs that still describe payouts-only admin/dashboard surfaces.

### Create-flow split and review updates

- Affects: `docs/Platform-Spec-Docs/CANONICAL.md`, `docs/Platform-Spec-Docs/SPEC.md`, `docs/Platform-Spec-Docs/JOURNEYS.md`, create-wizard refactor docs, UX v2 execution/control docs.

### Public Dreamboard / contributor flow updates

- Affects: `docs/Platform-Spec-Docs/CANONICAL.md`, `docs/Platform-Spec-Docs/PAYMENTS.md`, `docs/Platform-Spec-Docs/JOURNEYS.md`, `docs/Platform-Spec-Docs/UX.md`, `docs/perf/guest-view.md`.

### API / auth / observability drift

- Affects: `docs/Platform-Spec-Docs/API.md`, `docs/Platform-Spec-Docs/ARCHITECTURE.md`, `docs/Platform-Spec-Docs/SECURITY.md`, `docs/forensic-audit/*`, `README.md`, `AGENTS.md`.
- Confirmed runtime facts at baseline:
  - public API host in OpenAPI = `https://api.gifta.co.za/v1`
  - API key prefix remains `cpk_live_` / `cpk_test_`
  - webhook signature headers remain `X-ChipIn-*`
  - root request hook is [proxy.ts](/Users/ryanlaubscher/Projects/gifta-codex-5.3/proxy.ts), not the removed legacy root-middleware file

## Baseline Conclusions

- The codebase is test-green and type-green at the start of the documentation sync.
- The main audit risk is documentation drift, not immediate runtime breakage.
- The documentation review must treat current workspace files, not committed `main`, as authoritative for recent UI/doc work.

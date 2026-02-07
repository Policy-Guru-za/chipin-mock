# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-07 | self | Assumed `rg` was available for repo search commands | Use `find` + `grep` fallback immediately in this environment |
| 2026-02-07 | self | Probed `src/lib/fees.ts` path that does not exist | Use `src/lib/payments/fees.ts` for fee semantics checks |
| 2026-02-07 | self | Assumed dependency install would unblock lint in-place | Confirm network reachability first; when DNS is blocked, report gate as environment-blocked with exact error |
| 2026-02-07 | self | Treated missing eslint as hard repo issue before checking user-side install path | If user installs tooling manually, rerun exact gate chain and refresh evidence from latest run |
| 2026-02-07 | self | Ran full test suite before OpenAPI regeneration after metadata edits | Run `pnpm openapi:generate` before `tests/unit/openapi-spec.test.ts` when OpenAPI source changes |
| 2026-02-07 | self | `pnpm openapi:generate` failed in sandbox due tsx IPC pipe EPERM | Rerun with escalated permissions when tsx pipe creation is sandbox-blocked |
| 2026-02-07 | self | Imported decision-lock enums from `@/lib/dream-boards/validation` during B1 patching | Use `@/lib/ux-v2/decision-locks` as single enum source for UX v2 locks |
| 2026-02-07 | self | Made serializer contract fields required, which risked breaking non-API callers (webhooks/views) | Keep serializer input fields optional + normalize defaults; enforce strictness at API query layer |
| 2026-02-07 | self | Assumed `pnpm test -- <file>` would run only targeted tests | In this repo it still runs the full Vitest suite; use command expectations accordingly when planning verification time |
| 2026-02-07 | self | Added `getActiveCharityById` into runtime paths without updating older `db/queries` mocks | When adding query dependencies, centralize mock builders in integration tests and update all call sites immediately |

## User Preferences
- Start with required doc read order before implementation.
- Use `pnpm` for all script gates.

## Patterns That Work
- Follow milestone sequence strictly; no progression when gate fails.
- Use `nl -ba` + `sed -n` for line-precise evidence extraction in milestone audits.
- Capture milestone evidence in `docs/implementation-docs/evidence/ux-v2/...` during execution, not after.
- Bind runtime schemas and OpenAPI enums to `decision-locks.ts`, then assert parity in unit tests.
- Restore env toggles (`UX_V2_ENABLE_*`) after each test to prevent cross-test gate leakage.

## Patterns That Don't Work
- Skipping preflight docs causes rework and misalignment.

## Domain Notes
- Gifta UX v2 rollout is milestone-driven (Phase A complete, executing Phase B).

# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-07 | self | Assumed `rg` was available for repo search commands | Use `find` + `grep` fallback immediately in this environment |
| 2026-02-07 | self | Probed `src/lib/fees.ts` path that does not exist | Use `src/lib/payments/fees.ts` for fee semantics checks |
| 2026-02-07 | self | Assumed dependency install would unblock lint in-place | Confirm network reachability first; when DNS is blocked, report gate as environment-blocked with exact error |

## User Preferences
- Start with required doc read order before implementation.
- Use `pnpm` for all script gates.

## Patterns That Work
- Follow milestone sequence strictly; no progression when gate fails.
- Use `nl -ba` + `sed -n` for line-precise evidence extraction in milestone audits.
- Capture milestone evidence in `docs/implementation-docs/evidence/ux-v2/...` during execution, not after.

## Patterns That Don't Work
- Skipping preflight docs causes rework and misalignment.

## Domain Notes
- Gifta UX v2 rollout is milestone-driven (Phase A complete, executing Phase B).

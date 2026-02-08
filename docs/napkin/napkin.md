# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-08 | self | In create giving-back step, hid the form when no active charities existed, which left `charityEnabled` unset and blocked progression (`/create/payout` redirected back) | Keep a fallback submit path on no-charity states that persists `charityEnabled=false` and allows moving to payout |
| 2026-02-08 | self | Put `redirect('/...karri_invalid')` inside `try` and then caught the redirect in the `catch`, which downgraded to `karri_unavailable` | In verification helpers, return status (`valid|invalid|unavailable`) and redirect in caller after helper resolves |
| 2026-02-08 | self | Typed server form actions to return custom state objects, which broke `<form action={...}>` typing in client components | Keep server form actions as redirecting `Promise<void>` handlers; reserve state return shapes for `useActionState` actions only |
| 2026-02-08 | self | Ran route-discovery commands with `rg` even though this repo environment lacks `rg` | Default immediately to `find` + `grep` fallback for file and text discovery in this workspace |
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
| 2026-02-07 | self | Followed phase command `pnpm test tests/unit/payouts` expecting coverage, but repo has no matching directory | Run the milestone command for evidence, then run concrete payout unit files explicitly to validate behavior |
| 2026-02-07 | self | In charity threshold resolver, queried historical allocations before idempotency short-circuit | Return existing `charity_cents` first for already-completed contributions; only query historical totals when a fresh threshold allocation is needed |
| 2026-02-08 | self | Let full-suite timeouts block gates while single-file runs were green | Treat as deterministic test infra pressure; remove expensive per-test module reloads and set explicit Vitest `testTimeout` for this repo |
| 2026-02-08 | self | Passed `$skill-name` inside double quotes to a shell command; shell expanded `$...` and corrupted generated prompt text | Use single quotes or escape `$` when passing literal skill tokens in CLI interface strings |
| 2026-02-08 | self | Updated payout math but left one queue assertion on old pre-fee amount | When changing monetary semantics, immediately sweep payout service tests for queued amount expectations and ledger formulas |
| 2026-02-08 | self | Used `apply_patch` through `exec_command` despite tool constraint warning | Use the dedicated `apply_patch` tool directly for file edits |
| 2026-02-08 | self | Repeated `apply_patch` via `exec_command` after prior correction during payout remediation | When editing files, call `functions.apply_patch` directly; never shell-wrap patch operations |
| 2026-02-08 | self | Unquoted bracketed route paths in zsh (for example `[id]`) and command failed with glob expansion | Quote bracketed paths in shell commands (`'src/.../[id]/route.ts'`) |
| 2026-02-08 | self | B8 matrix check initially relied on partial historical coverage assumptions | For matrix milestones, build explicit test-ID -> file assertions and patch missing IDs before final gates |

## User Preferences
- Start with required doc read order before implementation.
- Use `pnpm` for all script gates.

## Patterns That Work
- Follow milestone sequence strictly; no progression when gate fails.
- Use `nl -ba` + `sed -n` for line-precise evidence extraction in milestone audits.
- Capture milestone evidence in `docs/implementation-docs/evidence/ux-v2/...` during execution, not after.
- Bind runtime schemas and OpenAPI enums to `decision-locks.ts`, then assert parity in unit tests.
- Restore env toggles (`UX_V2_ENABLE_*`) after each test to prevent cross-test gate leakage.
- Keep payout readiness predicates aligned with `calculatePayoutTotals` (bounded charity + `giftCents > 0`) to avoid permanent false-ready boards.
- For threshold charity completion paths, serialize per `dream_board_id` (transaction + advisory lock) and persist `charity_cents` with `payment_status='completed'` in the same transaction.
- For reminder dispatch, use advisory-lock-per-reminder + provider idempotency key; keep retryable failures with `sent_at=NULL` and mark >48h overdue reminders terminal via `sent_at` + explicit expiry logs.
- For reminder scheduler idempotency, lock on `(dream_board_id,email)` and check existing pending reminder before insert; timestamp-based conflict keys drift on retried requests.
- For WhatsApp webhooks, STOP must update both `whatsapp_contacts.opt_out_at` and pending `contribution_reminders.whatsapp_opt_out_at`; never clear opt-out on non-STOP inbound messages.
- For startup validation parity, legacy WhatsApp config requires all three keys (`WHATSAPP_BUSINESS_API_URL`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_API_TOKEN`) or dispatch can fail after boot.
- For admin dataset services under strict TypeScript, `COALESCE` nullable SQL fields (for example `hostEmail`, `netCents`) at select-time to keep DTOs stable and avoid mapper null-guards everywhere.
- For rollout-decision milestones, keep one canonical milestone evidence file plus supporting artifacts (runbook execution, checklist, GO/NO-GO, exit memo) and mark live-prod steps as manual rather than guessing outcomes.

## Patterns That Don't Work
- Skipping preflight docs causes rework and misalignment.

## Domain Notes
- Gifta UX v2 rollout is milestone-driven (Phase A complete, executing Phase B).
- Phase C C0 baseline: current create flow has monolithic `/create/details`; UX v2 target requires split routes (`/create/dates`, `/create/giving-back`, `/create/payout`) and `/create/review` celebration rewrite.
- Phase C C0 baseline: admin UI currently implements payouts only; UX v2 target includes `/admin`, `/admin/dream-boards`, `/admin/contributions`, `/admin/charities`, `/admin/reports`, `/admin/settings`.

## C1 Learnings (2026-02-08)
- Split-step extraction pattern worked: keep each new route responsible for a narrow draft subset, rely on `updateDreamBoardDraft` merge semantics, avoid touching `dreamBoardDraftSchema`.
- `useActionState` fit only for review publish transition where server action returns state. For standard wizard submit routes, server actions should stay redirect-driven and typed as `Promise<void>`.
- Next.js `redirect()` inside a `try` can be swallowed by broad `catch` and remapped to wrong error. Return verification status from helper and redirect in caller.
- Preserve payout semantics by copying encryption and Karri verification flow exactly from legacy details action before refactor.
- C1 introduced additional complexity/line-count lint warnings in new files; lint still passes (warnings-only policy), but C2 should include extraction/refactor passes if warning budget needs reduction.

# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-13 | self | In `listAdminCharities`, correlated SQL subqueries compared against `${charities.id}` and Neon/Postgres raised `42702 column reference "id" is ambiguous` on `/admin/charities` | In raw correlated subqueries, use an explicit qualified outer reference (`sql.raw('"charities"."id"')`) and reuse it across all subquery predicates |
| 2026-02-11 | self | Wired `/create` fresh-start logic to `getDreamBoardDraft` without handling KV read failures, which can block hosts from entering create flow during transient KV outages | For entry-route hygiene, treat draft reads as best-effort: catch/log read errors, continue with clear + redirect path |
| 2026-02-11 | self | Deleted draft photo before confirming `clearDreamBoardDraft` success, which can orphan stale draft references on clear failures | Sequence destructive side-effects after primary state-clear succeeds; when clear fails, do not delete related assets |
| 2026-02-11 | self | Exported `publishDreamBoardAction` directly from `src/app/(host)/create/review/page.tsx`, which broke Next generated type checks because page modules only allow specific exports | Keep server actions in sibling `actions.ts` modules and import them into `page.tsx`; do not add extra named exports to route page files |
| 2026-02-11 | self | Used `getByText('Funded!')` in a timeline test where that label intentionally appears in multiple places (node label + card status), causing false failures | Prefer role/href assertions for structure and use `getAllByText` when duplicate label rendering is expected |
| 2026-02-11 | self | Used `first:`/`last:` row spacing utilities while each row was wrapped in its own border container | For utility-driven list spacing, keep row items as direct siblings and move separators onto row root via non-last-child selectors |
| 2026-02-11 | self | Added new jsdom tests without `afterEach(cleanup)`, causing duplicate elements across test cases and false failures | In this repo, always include explicit `afterEach(cleanup)` in new Testing Library suites, even for small files |
| 2026-02-11 | self | Wrote UI test expecting a "Shareable link" label before adding that label to the component | Align tests to explicit UX copy requirements first, then verify component emits that copy |
| 2026-02-11 | self | Applied a partial patch while rewriting `ContributorDisplay` and accidentally left duplicate legacy JSX + misplaced import ordering | For full component redesigns, replace the file in one pass (or verify tail of file immediately) instead of incremental hunks that can leave old blocks behind |
| 2026-02-11 | self | Ran `rg` with a pattern containing backticks and zsh performed command substitution (`command not found`) | For grep/search patterns that include backticks, wrap the pattern in single quotes and escape/avoid literal backticks |
| 2026-02-10 | self | Fired an Axiom APL curl with bracket-heavy JSON inline and zsh interpreted parts as shell patterns (`bad pattern`) | For complex APL payloads with brackets/quotes, write JSON to a temp file and send via `--data-binary @file` to avoid shell glob/quote breakage |
| 2026-02-10 | self | Moved `middleware.ts` to `src/middleware.ts` but forgot middleware-focused tests read/import the root file directly, causing immediate suite failures | After relocating framework entrypoints, run `rg` for path-based test references (imports + `readFileSync`) and patch them in the same change |
| 2026-02-10 | self | Built one-off curl command using inline env assignment and then expanded `$AXIOM_*` in the same shell line; headers were empty and Axiom returned missing org error | For ad-hoc authenticated curl calls, either export vars first or inject literal header values in that command to avoid pre-expansion bugs |
| 2026-02-10 | self | Assumed debug auth-events endpoint would immediately return logs once `x-debug-key` was valid; endpoint can still fail if deployment `AXIOM_API_TOKEN` lacks query read permission | If `/api/internal/debug/auth-events` returns `axiom_query_failed` 403 (`query with action: read`), rotate/provide an Axiom token with dataset read/query scope before further log triage |
| 2026-02-10 | self | Assumed `/sign-up` health meant auth routes were generally healthy while `/sign-in` has a unique server `auth()` call and can fail independently | For auth incident triage, probe `/sign-in`, `/sign-up`, `/create`, and `/create/child` separately before concluding root cause |
| 2026-02-10 | self | Tried `vercel` commands directly in this workspace where binary is absent and credential state is unknown | Use `pnpm dlx vercel ...` in this repo; if `No existing credentials found`, require `vercel login` or `VERCEL_TOKEN` before attempting deployment logs |
| 2026-02-10 | self | Ran `rg` over route-group/bracket paths without quotes (`(host)`, `[slug]`) and triggered `zsh: no matches found` before inspection | Treat all App Router grouped/dynamic paths as shell-globs by default and always single-quote these path arguments in `rg/sed/nl/cat` commands |
| 2026-02-10 | self | Refactored public Dreamboard sections and removed the non-host contribute CTA block, leaving no direct path to `/{slug}/contribute` from the main page | In guest-page UI simplifications, keep an explicit non-host CTA/link to the contribute route and verify it in integration coverage |
| 2026-02-10 | self | Added multiple `render(...)` calls in `ContributorDisplay` unit tests without cleanup, so stale DOM from earlier cases caused false failures on later assertions | In jsdom component suites that render multiple cases in one file, include `afterEach(cleanup)` to isolate each test reliably |
| 2026-02-10 | self | Tried to stop a dev server started under escalation with plain sandbox `kill`; received `operation not permitted` | When a process is launched with escalated permissions, stop it with an escalated `kill` command and include the short approval justification |
| 2026-02-10 | self | Ran `sed` against `src/app/(host)/create/payout/actions.ts` without quoting parentheses and hit `zsh: no matches found` again | Quote any path containing route-group parentheses every time (`'src/app/(host)/...'`) and copy the quoted pattern from prior commands |
| 2026-02-10 | self | Used `rg -ho ...` expecting grep-style hidden no-filename behavior; `-h` in `rg` prints help, so key extraction command failed | Use `rg -o --no-filename ...` (or `-I`) for match-only extraction; avoid mixing grep short flags with ripgrep |
| 2026-02-10 | self | Homepage parity run restored `next/font/google`; `pnpm build` failed in sandbox with `ENOTFOUND fonts.googleapis.com` and can look like implementation drift | For design-parity restorations that explicitly require Google fonts, keep the imports intact and report build as environment-blocked with exact DNS error instead of swapping to offline font fallbacks |
| 2026-02-09 | self | C9A sub-step 0 drift checks can be misread as "any dirty tree means stop" even when diffs predate gates | Capture pre/post `git status --short` and treat only newly introduced non-doc diffs as gate drift; list carryover non-doc diffs separately in evidence |
| 2026-02-09 | self | Started command verification in this session before re-reading napkin docs | Always read `docs/napkin/SKILL.md` and `docs/napkin/napkin.md` first at turn start, then run any diagnostic/gate commands |
| 2026-02-09 | self | Kept retrying `pnpm build` Turbopack runs that appeared frozen at `Creating an optimized production build ...` without extracting a low-level panic signature | For Turbopack stalls, run a single isolated `pnpm build:turbopack` check and capture `/tmp/next-panic-*.log`; if panic shows `creating new process -> binding to a port -> Operation not permitted`, switch build gate to Webpack in sandboxed environments |
| 2026-02-09 | self | Assumed font fetch was the only blocker after seeing `ENOTFOUND fonts.googleapis.com`; Turbopack still stalled even after removing Google font imports | Treat network font fetch errors and Turbopack process-binding panics as separate failure classes; remove `next/font/google` for offline-safe builds and keep Turbopack isolated from release gate when sandbox EPERM is present |
| 2026-02-09 | self | Split create/thanks server actions into `actions.ts` for tests but left duplicate page-local handlers wired in runtime | After extracting action modules, delete page-local copies and import the shared action so tests and production execute identical code |
| 2026-02-09 | self | Replaced Unicode PDF font loading with Helvetica-only fallback, causing non-ASCII birthday messages to degrade to `?` | Keep Unicode-capable font embedding (`fontkit` + Noto bytes) with Helvetica only as fallback when embed fails |
| 2026-02-09 | self | Updated C8 to require full gate chain but initially left `pnpm build` out of the Sub-step 11 command block | After doc-wide command-list changes, sweep all repeated command blocks to keep gate definitions consistent |
| 2026-02-09 | self | Imported `normalizeEmail` into `thanks/page.tsx` and broke unit tests because mocked `@/lib/db/queries` exports in `tests/unit/receipt-action.test.ts` did not include it | When expanding imports from heavily mocked modules, either update the module mock in the same patch or keep normalization inline to preserve existing mock contracts |
| 2026-02-09 | self | Started final verification before re-reading napkin notes for the session | Read `docs/napkin/SKILL.md` and `docs/napkin/napkin.md` first in every new session before any gate or edit command |
| 2026-02-09 | self | Declared Gemini cleanup done while `docs/Platform-Spec-Docs/ARCHITECTURE.md` still contained active Gemini references | After deprecating an integration, run targeted `rg` sweeps across `docs/Platform-Spec-Docs` and patch remaining active references before handoff |
| 2026-02-09 | self | Deleted an API route and immediately ran `pnpm typecheck`; stale `.next/types` still referenced removed file and failed | After route add/delete, run `pnpm exec next typegen` before `pnpm typecheck` to refresh generated route validators |
| 2026-02-09 | self | Tried `pnpm dev` in sandbox to refresh route types; Next failed with `listen EPERM 0.0.0.0:3000` | In sandbox, use `pnpm exec next typegen` for route-type refresh instead of binding a dev server port |
| 2026-02-09 | self | Added an admin integration assertion by extending one `describe` callback past lint `max-lines-per-function`, increasing warning count | When adding tests in this repo, split long suites into multiple `describe` blocks early to avoid warning regressions |
| 2026-02-09 | self | Read `src/app/(admin)/layout.tsx` without quoting parentheses in zsh, command failed with `no matches found` | Quote path arguments that include route-group parentheses, e.g. `'src/app/(admin)/layout.tsx'` |
| 2026-02-09 | self | Assumed admin route-group layout auth covered route handlers; legacy `/payouts/export` redirect initially had no auth check | For `route.ts` handlers under admin route groups, call `requireAdminAuth()` explicitly before redirect or response |
| 2026-02-09 | self | Closed mobile admin drawer on pathname change with `setState` inside `useEffect`; lint failed (`react-hooks/set-state-in-effect`) | Model drawer-open state keyed by pathname instead of effect-driven synchronous state updates |
| 2026-02-09 | self | Attempted to install `pdf-lib` mid-milestone without confirming registry access; install failed with `ENOTFOUND registry.npmjs.org` | Verify network/package registry reachability first; if blocked, ship fallback behavior and record explicit dependency deviation in evidence |
| 2026-02-09 | self | Wrote API route tests with `Request`, but handlers read `request.nextUrl.searchParams` and failed outside the unauthenticated branch | Use `NextRequest` in route tests whenever handlers depend on `nextUrl` |
| 2026-02-09 | self | Added new host dashboard integration test without stubbing `matchMedia`, causing `useReducedMotion` failures | Stub both legacy and modern `matchMedia` methods in jsdom tests that render `ProgressBar` or motion-aware components |
| 2026-02-09 | self | Assumed `pnpm add` fully failed after `ENOTFOUND`, but dependency was still linked from local pnpm store | After network-related install errors, verify `package.json`, lockfile, and `require.resolve(...)` before deciding whether dependency is unavailable |
| 2026-02-09 | self | Updated contribution name label to `(optional)` while non-anonymous path still requires 2-50 characters | Keep form labels aligned with validation gates; if logic is required, copy must not imply optional |
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
| 2026-02-09 | self | C7 prompt still had global root-main strategy while latest locked clarification switched to per-group main targets | Treat latest user clarification as override, and explicitly call out stale prompt lines in execution evidence before editing |
| 2026-02-09 | self | Updated contrast-related utility classes without immediately updating coupled unit assertions (`button.test`, `progress-bar.test`) | After design-token/class changes, run and patch directly coupled component tests before the full-suite run to avoid avoidable red gate loops |
| 2026-02-09 | self | Added global skip link but left root `error.tsx`/`not-found.tsx` without `id="main-content"` target and used low-contrast focus background | When adding skip-link patterns, validate target presence across fallback routes and use AA-compliant focus tokens (`primary-700`+) |

## User Preferences
- Start with required doc read order before implementation.
- Use `pnpm` for all script gates.
- For current Dreamboard refactor work, prioritize main `/{slug}` content UI changes; keep shared header/footer unchanged unless explicitly requested.
- For UI refactors, keep scope to main user-facing content and maintain a reusable AI playbook under `docs/UI-refactors/` that can drive future refactors from HTML + screenshot + URL inputs.

## Patterns That Work
- Follow milestone sequence strictly; no progression when gate fails.
- Use `nl -ba` + `sed -n` for line-precise evidence extraction in milestone audits.
- Capture milestone evidence in `docs/implementation-docs/evidence/ux-v2/...` during execution, not after.
- For auth UI parity across route groups, pass `isClerkEnabled` from server page into client landing nav and reuse a shared `UserAvatarMenu` (`UserButton.MenuItems`) across header/mobile/landing.
- For rollout milestones, split agent-prep (documentation and pre-gates) from human-live execution (deploy, smoke, GO sign-off) so acceptance criteria stay satisfiable.
- For milestone evidence docs, provide a fixed section-locked template file to reduce status drift and missing-gate omissions during handoff.
- For auth-free UI QA, gate public preview routes behind `DEV_PREVIEW=true` and pair with Playwright CLI screenshot scripts under `scripts/visual/` writing to `output/playwright/`.
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
- For C9 pre-flight rollback validation (C0-05), always include three explicit confirmations in evidence: Vercel rollback location path, exact UX toggle-off vars, and pre-rollback evidence capture list.
- For admin CSV exports, use shared header lists and always emit header-only CSV for empty datasets to keep download behavior deterministic.
- For implementation-plan docs, lock repo execution constraints up front (`pnpm`, main-only strategy, Conventional Commits) and explicitly include generated-artifact sync rules when source contracts (like `src/lib/api/openapi.ts`) are edited.

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

## C2 Learnings (2026-02-08)
- `react-hooks/set-state-in-effect` is enforced in this repo. For client components reading browser storage, use lazy `useState` initializers or event-driven state updates instead of synchronous `setState` in `useEffect`.
- Reusing one card component for board + thank-you variants can duplicate copy if both `allocationLabel` and `impactCopy` carry the same string. Add a `showDescription` guard when values match.
- When adding aggregate + joined fields in Drizzle (`dreamBoards` + `charities` + `SUM/COUNT`), include joined table keys in `groupBy` (`charities.id`) to keep SQL valid and deterministic.
- Contributor modal pagination requires loaded contributor records, not just total count. Avoid using `totalCount` as page source unless query fetch limit matches intended modal depth.
- New jsdom tests need explicit `cleanup()` in `afterEach` in this workspace to prevent cross-test DOM bleed and false duplicate-element failures.
- Keep funded-status eligibility consistent across guest UI and contribution API: `funded` remains open for contribute/retry paths.
- Thank-you charity impact must use persisted `contributions.charity_cents`; never recompute threshold impact from board-level config on read paths.
- Thank-you client copy should derive from view-model state; show celebration/receipt/persistence side effects only for confirmed completed contributions.
- For modal a11y in this repo, prefer `aria-labelledby` wired to visible heading text over standalone `aria-label` when a heading already exists.
- Defensively validate localStorage payload field types before using string methods in UI components (`trim`, etc.).

## C3 Learnings (2026-02-08)
- New payment-step tests that render `PaymentOverlay` must stub both legacy and modern media APIs (`matchMedia.addListener/removeListener` and `addEventListener/removeEventListener`) or `framer-motion` throws unhandled jsdom errors.
- Currency assertions in tests must be locale-safe (`R 257,50` with NBSP/comma appears in this workspace), so avoid strict `R257.50` string matching; use regex that accepts spacing and both separators.
- Payment-step integration assertions should not assume a single `fetch` call when analytics side effects are active; assert by endpoint/payload (`/api/internal/contributions/create`) instead of total call count.
- C3 storage handoff stays reliable when Step 2 redirects immediately on missing/expired flow payload; this prevents stale direct-entry payment attempts and keeps route behavior deterministic.
- `pnpm openapi:generate` can still hit `tsx` IPC `EPERM` under sandbox capture; rerun with escalated permissions for deterministic contract gate completion.

## C4 Learnings (2026-02-08)
- Host dashboard post-campaign routing should be keyed off `closed|paid_out` only; keep `funded` in the active/editable surface.
- Internal host download routes need explicit middleware public matching so requests reach handlers, then route-level auth must enforce `401/403/404` semantics.
- Download route tests must exercise `NextRequest` paths and CSV escaping for commas/quotes/newlines to protect export integrity.
- Dashboard/client integration tests that render `ProgressBar` require `matchMedia` stubs to avoid motion hook failures.

## C5 Learnings (2026-02-09)
- Canonical admin route normalization must include explicit auth on redirecting `route.ts` handlers; route-group layout auth does not protect API handlers.
- Admin modal a11y requires full trap pattern (`Escape` close + `Tab` loop + focus restore) rather than only `aria-modal`.
- Charity edit flows must not surface encrypted bank payloads; keep masked placeholder and only submit bank JSON on explicit change.
- Admin export handlers should standardize on `NextRequest` + `request.nextUrl.searchParams` and shared CSV helpers for consistent parser/test behavior.

## C6 Learnings (2026-02-09)
- Copy-only milestones still need explicit contract guardrails. Keep webhook headers, event names, scopes, and route slugs on a denylist before broad text replacement.
- Matrix compliance is easiest to keep stable with a dedicated drift test file (`tests/unit/copy-matrix-compliance.test.ts`) that checks exact canonical strings and absence of legacy variants in key sources.
- If `src/lib/api/openapi.ts` copy-level fields change, regenerate `public/v1/openapi.json` immediately; otherwise `tests/unit/openapi-spec.test.ts` fails even when runtime code is correct.

## C7 Learnings (2026-02-09)
- Skip-link architecture decisions must be locked once: mixing global-root-main and per-group-main strategies in a single milestone creates semantic conflicts and nested-main risk.
- Accessibility hardening in this repo is fastest when done as a phased bundle: landmarks first, then ARIA/touch, then contrast tokens, then fallback states and tests.
- Contrast remediations on shared button variants have broad test-coupling impact; adjust both variant tests and any component tests that assert old `text-primary` classes in the same pass.
- Source-based drift tests are effective for route-state coverage (`error.tsx`, `loading.tsx`, `not-found.tsx`) and a11y attributes when full render wiring is expensive.

## C8 Learnings (2026-02-09)
- `next build` can appear stalled while holding `.next/lock`; verify lock holder via `lsof .next/lock` before retrying to avoid false parallel-build failures.
- Escalated build runs can expose different failure classes than sandbox runs (fonts DNS/network vs Turbopack/Webpack asset-loader errors); capture both in evidence to avoid misdiagnosis.
- `pnpm typecheck` reliability in this repo depends on Next-generated route types; `pnpm exec next typegen` helps refresh generated files but does not resolve real page/route signature drift.
- C8 telemetry contract expansion is safest when constrained to internal analytics surfaces (`src/lib/analytics/metrics.ts`, `src/app/api/internal/metrics/route.ts`) with no public API changes.

## C9 Learnings (2026-02-09)
- For C9A completion, treat checklist/template population as first-class deliverables: update both authoritative docs and mirror the same evidence mapping in C9 evidence to avoid drift.
- Pre-GO gates should be marked PASS only after direct linkage to C8 Section 12/13 and C9 Section 2 gate outputs; avoid generic "report link" placeholders.
- C-R2/C-R3/C-R4 prep quality depends on concrete healthy/unhealthy definitions and threshold values in the checklist itself, not only in the runbook/prompt.
- C9A handoff payload is strongest when it includes exact C9B operator steps, rollback triggers, and explicit pending sections for human-run fields.
- C9B live deploy/smoke cannot be executed from this workspace if `vercel` CLI is missing; record blocker explicitly in C9 evidence instead of implying execution happened.

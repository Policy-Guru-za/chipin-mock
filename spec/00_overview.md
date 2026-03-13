# Spec Overview

Use one numbered spec for every work session.

One active spec at a time unless the user says otherwise.

Use `NN_session-placeholder` between sessions and rename that same numbered file in place when the next session topic is known.

Status values: `Active`, `Done`, `Superseded`.

| Spec | Title | Status | Owner | Depends On | Notes |
| --- | --- | --- | --- | --- | --- |
| `01_agent-execution-system-import` | Import DadPad-style execution system into Gifta | Done | Codex | None | Added `progress.md`, numbered specs, approval gates, harmonized agent docs, and audit enforcement |
| `02_always-active-spec-invariant` | Enforce always-active spec invariant | Done | Codex | `01_agent-execution-system-import` | Tightened current-spec validation, switched overview statuses to `Active`/`Done`, and rewrote execution guidance around every-session specs |
| `03_placeholder-handoff-proof-model` | Fix placeholder handoff proof model | Done | Codex | `02_always-active-spec-invariant` | Separated current-session state from completed-session proof, then made review and release verification placeholder-aware |
| `04_contract-truth-and-payfast-recovery` | Contract truth, guest-flow correctness, and PayFast recovery hardening | Superseded | Codex | `03_placeholder-handoff-proof-model` | Stage 1 completed, then the unfinished session was superseded at Gate A and its follow-on work moved into spec 05 |
| `05_platform-fee-removal` | Remove platform fees from active Dreamboard flows | Done | Codex | `04_contract-truth-and-payfast-recovery` | Removed fee charging/copy from active product flows, preserved legacy ledger compatibility, and synced docs/OpenAPI/tests |
| `06_execution-ledger-hardening` | Harden execution-ledger terminal states and placeholder proof ownership | Done | Codex | `05_platform-fee-removal` | Added `Superseded`, `Last Session Spec`, and audit enforcement for terminal session metadata |
| `07_napkin-enforcement` | Enforce napkin startup and handoff proof | Done | Codex | `06_execution-ledger-hardening` | Registered the repo-local napkin skill, required `Napkin Evidence`, and added audit/test enforcement |
| `08_dreamboard-create-voucher-flow` | Refactor default Dreamboard create flow to voucher placeholder with no active charity step | Done | Codex | `07_napkin-enforcement` | Introduced `takealot_voucher`, removed `giving-back` from the active host flow, reindexed the create journey to 5 steps, and synced docs/contracts/tests |
| `09_voucher-payout-api-contract-fix` | Fix voucher payout API recipient contract | Done | Codex | `08_dreamboard-create-voucher-flow` | Exposed voucher fulfilment contact data through payout APIs/OpenAPI and added payout read-path regression coverage |
| `10_karri-default-path-decoupling` | Remove Karri from the default Dreamboard product path while preserving gated legacy support | Done | Codex | `09_voucher-payout-api-contract-fix` | Added Karri write-path gating, removed default-path Karri UX/copy, synced docs/OpenAPI, and verified with full gate plus fallback dogfood evidence |
| `11_openapi-contract-determinism` | Remove env-sensitive branching from the committed OpenAPI contract | Done | Codex | `10_karri-default-path-decoupling` | Removed env-sensitive OpenAPI description branching, added flag-on regression coverage, and re-synced the committed contract artifact |
| `12_karri-config-readiness-alignment` | Align Karri startup validation and readiness with the gated write path | Done | Codex | `11_openapi-contract-determinism` | Fixed the two Karri gating review findings, added regression coverage, and handed off into spec 13 placeholder |
| `13_session-placeholder` | Placeholder for the next bounded session | Active | Codex | `12_karri-config-readiness-alignment` | Rename this file in place when the next session topic is known |

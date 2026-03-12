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
| `08_session-placeholder` | Placeholder for the next bounded work session | Active | Codex | `07_napkin-enforcement` | Rename in place before substantive work begins |

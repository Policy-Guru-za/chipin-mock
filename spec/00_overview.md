# Spec Overview

Use one numbered spec for every work session.

One active spec at a time unless the user says otherwise.

Use `NN_session-placeholder` between sessions and rename that same numbered file in place when the next session topic is known.

| Spec | Title | Status | Owner | Depends On | Notes |
| --- | --- | --- | --- | --- | --- |
| `01_agent-execution-system-import` | Import DadPad-style execution system into Gifta | Done | Codex | None | Added `progress.md`, numbered specs, approval gates, harmonized agent docs, and audit enforcement |
| `02_always-active-spec-invariant` | Enforce always-active spec invariant | Done | Codex | `01_agent-execution-system-import` | Tightened current-spec validation, switched overview statuses to `Active`/`Done`, and rewrote execution guidance around every-session specs |
| `03_placeholder-handoff-proof-model` | Fix placeholder handoff proof model | Done | Codex | `02_always-active-spec-invariant` | Separated current-session state from completed-session proof, then made review and release verification placeholder-aware |
| `04_contract-truth-and-payfast-recovery` | Contract truth, guest-flow correctness, and PayFast recovery hardening | Active | Codex | `03_placeholder-handoff-proof-model` | Implements webhook contract narrowing, rollback tooling, guest message-limit alignment, PayFast reconciliation hardening, and payout-doc surface removal |

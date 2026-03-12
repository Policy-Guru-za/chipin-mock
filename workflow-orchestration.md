## Workflow Orchestration

### Operating Loop

1. **Discovery**
- confirm source-of-truth docs and current repo state
- inspect [`progress.md`](./progress.md), [`spec/00_overview.md`](./spec/00_overview.md), and the active numbered spec for the current session
- map the task to the relevant runtime surfaces before changing code or docs

2. **Spec**
- confirm the active numbered spec in [`spec/`](./spec/)
- if it is `spec/NN_session-placeholder.md`, rename that same numbered file in place to `spec/NN_<topic>.md` before substantive work starts
- update [`spec/00_overview.md`](./spec/00_overview.md) and [`progress.md`](./progress.md) before coding
- keep one active spec at a time unless the user says otherwise

3. **Planning**
- lock objective, scope, dependencies, stage plan, test gate, and exit criteria in the active spec
- keep assumptions explicit; do not let them hide in thread history

4. **Build**
- implement one bounded stage at a time
- keep the repo runnable after each stage
- update [`progress.md`](./progress.md) as status, blockers, and next step change

5. **Verify**
- run the smallest gate that proves the stage
- no red gate means no completed stage
- for docs/process work, verify links, commands, control-matrix classification, and agent guidance drift

6. **Dogfood**
- exercise the changed flow before claiming completion
- docs/process work still needs dogfooding: use the new execution flow or playbook end to end and confirm it makes sense in practice

7. **Handoff**
- docs reflect reality
- summary includes the completed spec id, commands run, dogfood result, blockers, remaining risk, and the next numbered placeholder

### Artifact Rules

- [`progress.md`](./progress.md) is the live ledger for the active spec and the proof ledger for the most recently completed spec
- [`spec/00_overview.md`](./spec/00_overview.md) is the ordered registry of numbered specs
- [`spec/SPEC_TEMPLATE.md`](./spec/SPEC_TEMPLATE.md) defines the required spec structure
- `spec/NN_<topic>.md` is the active execution spec for the current session
- `spec/NN_session-placeholder.md` is the standing active placeholder between sessions
- [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) is memory only

When `Current Spec` is a successor placeholder, use `Last Completed Spec` as the owner of `Last Green Commands` and `Dogfood Evidence`.

### Definition Of Done

- relevant gate is green
- dogfood is complete or clearly blocked with explicit evidence
- [`progress.md`](./progress.md) contains current active-session state and correctly attributed completed-session proof
- the next numbered placeholder is already active before the finished session is closed
- relevant Tier 1 docs and generated artifacts reflect the shipped state

### Default Heuristics

Every work session uses the spec/progress system.

Apply the fullest stage and gate discipline when the session touches:

- multi-file work
- behavior changes
- auth, security, payment, payout, schema, or API-contract changes
- major UX or routing changes
- agent-policy or documentation-system changes
- anything expected to take more than about 30 minutes

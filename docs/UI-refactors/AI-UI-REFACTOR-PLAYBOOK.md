# AI UI Refactor Playbook (Main-Content Safe Mode)

## 1. Purpose and Operating Model
- Goal: deliver high-fidelity UI/UX refactors for the main user-facing area of an existing screen.
- Safety guarantee: preserve shell + product contracts while improving only the core interaction surface.
- Default mode: replicate high fidelity design intent from supplied guide HTML and screenshot, not literal source duplication.
- Required quality bar: "looks intentional, feels premium, behavior unchanged unless explicitly requested."

## 2. Non-Negotiable Guardrails
- Freeze shared shell:
  - Do not edit header/footer components.
  - Do not edit shared layout wrappers.
- Freeze backend contracts:
  - No API route changes.
  - No server action behavior changes unless explicitly approved.
  - No DB/schema/migration changes.
  - No auth/payment/integration behavior changes.
- Terminology guardrail:
  - Keep canonical product terms unchanged (for this repo: `Dreamboard` as one word).
- If a requested visual requires contract changes, stop and flag as out-of-scope.

## 3. Required Inputs Contract
- Input A: guideline HTML document (target design direction).
- Input B: screenshot(s) of current UI (baseline state).
- Input C: target URL/route to refactor.
- Input D: this playbook.

If any input is missing, inform the user and ask whether to proceed with available inputs, or to stop and get further instructions. Keep contract boundaries frozen.

## 4. Refactor Execution Algorithm
1. Discovery:
   - Locate route entrypoint and rendered client component(s).
   - Locate shared shell boundaries (layout/header/footer) and mark read-only.
   - Locate tests currently guarding copy/flow/contract behavior.
   - Ask the user any clarifying questions at this point, if necessary.
2. Visual mapping:
   - Decompose guide HTML into sections: hierarchy, spacing, typography, cards, controls, motion.
   - Map sections to current component tree and identify extraction boundaries.
3. UI extraction:
   - Build new UI-only components under feature-local folder (for example `src/components/<feature>/`).
   - Keep business logic in existing route/client container unless extraction is clearly safe.
4. Composition rewrite:
   - Recompose main content with new components.
   - Preserve existing state semantics, action targets, and URLs.
5. Polish:
   - Responsive behavior first.
   - Focus visibility and keyboard flow.
   - Motion only where meaningful and non-blocking.
6. Verification:
   - Run strict gates.
   - Perform manual visual parity checks against HTML + screenshot.
   - Confirm shell/backend boundaries untouched.

## 5. Fidelity Scoring Rubric (Self-Check Before Handoff)
- Layout parity (0-5): section order, alignment, width rhythm.
- Visual hierarchy (0-5): heading dominance, card priority, CTA prominence.
- Spacing system (0-5): consistent vertical rhythm and padding scale.
- Typography parity (0-5): family, size, weight, line-height intent.
- Interaction parity (0-5): CTA behavior, copy actions, links, hover/focus.
- Responsive parity (0-5): desktop/mobile transitions and tap ergonomics.
- Accessibility parity (0-5): semantics, focus states, labels, contrast intent.

Release target: no category below `4`, overall average `>= 4.5`.

## 6. Decision Rules When Guide HTML Is "Wrong" for Production
- Keep guide intent, reject guide literals that break production contracts.
- Never copy hardcoded demo data paths (for example local avatar image paths).
- Never import guide nav/footer implementations into app shell.
- If guide conflicts with current business behavior:
  - Keep business behavior.
  - Adapt visual treatment only.
- If guide copy conflicts with product copy matrix:
  - Keep canonical product copy.
  - Apply styling/structure only.

## 7. Implementation Boundaries Checklist
- Allowed:
  - Main-content JSX/TSX structure.
  - Feature-local UI components and style classes.
  - UI-focused tests and snapshots/assertions.
- Not allowed (unless explicitly approved):
  - Shared layout/shell files.
  - API/server contracts.
  - DB schema/migrations.
  - Auth/payment behavior.
  - Cross-feature copy rewrites.

## 8. Verification Gate Checklist (Mandatory)
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. Manual visual parity check:
   - Desktop view.
   - Mobile view (tablet and mobile phone).
   - Compare against provided HTML + screenshot.
6. A11y smoke:
   - Keyboard navigation.
   - Focus states visible.
   - Heading structure valid.

If a gate fails:
- Fix forward within scope.
- If blocked by environment/tooling, report exact command + exact error + impact.

## 9. Evidence and Handoff Template
Use this exact structure in delivery notes:

```md
## Refactor Outcome
- Route:
- Main-content changes:
- Out-of-scope protections honored:

## Files Changed
- (list)

## Behavior Integrity
- Server actions:
- Routes/API:
- DB/contracts:
- Auth/payment:

## Verification
- pnpm lint:
- pnpm typecheck:
- pnpm test:
- pnpm build:
- Manual parity desktop/mobile:
- A11y smoke:

## Risks / Follow-ups
- (if any)
```

## 10. Copy-Paste Briefing Template for Future AI Agents
```md
Task: Refactor main user-facing content for [URL] using:
1) guideline HTML: [path]
2) existing UI screenshot: [attachment/path]
3) this playbook: /Users/ryanlaubscher/Projects/gifta-codex-5.3/docs/UI-refactors/AI-UI-REFACTOR-PLAYBOOK.md

Constraints:
- Main-content only.
- Do not change header/footer/layout shell.
- Do not change routes/API/server actions/DB/contracts/auth/payment behavior.
- Keep canonical product terminology.

Deliver:
- Refactored UI components + recomposed page.
- Updated tests for UI/state regressions.
- Full verification gates + manual parity notes.
- Update the playbook with any new lessons learned.
```

## 11. Pitfalls and Anti-Patterns Log Structure
Track mistakes and fixes in this table after each refactor:

| Date | Route | Pitfall | Impact | Corrective Rule |
|------|-------|---------|--------|-----------------|
| YYYY-MM-DD | /example | Example issue | Example impact | Example prevention |
| 2026-02-11 | /create/review | New jsdom tests omitted cleanup between cases | Duplicate element matches and false negatives | Always add `afterEach(cleanup)` in new Testing Library suites |
| 2026-02-11 | /create/review | Applied `first:` and `last:` spacing utilities to rows that were each wrapped in their own border container | Pseudo-class logic collapsed row padding and created inconsistent vertical rhythm | Keep rows as direct siblings and apply separators on row root with non-last-child utility selectors |
| 2026-02-11 | /dashboard | Built timeline card tests with `getByText` for status labels that appear in multiple locations inside one node | False-negative unit failures during gate runs | Use role-based assertions first (`link` with aria-label/href), and use `getAllByText` only when duplicate labels are intentional |
| 2026-02-11 | /dashboard | Timeline refactor risked hiding boards when introducing hero treatment | Missing board visibility and behavior drift risk | Partition boards into explicit live/archived buckets and render all boards (hero = first live only, never a filter) |

Anti-patterns to avoid:
- Copying guide HTML wholesale into production route file.
- Editing shell files to fake parity.
- Changing data contracts to match guide demo content.
- Omitting tests because "UI only."

## 12. Change Log (Continuous Learning)
| Date | Refactor Target | What Improved in This Playbook | Author |
|------|------------------|--------------------------------|--------|
| 2026-02-11 | /create/review | Initial version: guardrails, algorithm, fidelity rubric, handoff template | Codex |
| 2026-02-11 | /create/review | Added real pitfall pattern for test isolation (`afterEach(cleanup)`) based on implementation feedback loop | Codex |
| 2026-02-11 | /create/review | Added spacing-rhythm safeguard: avoid wrapper containers that break `first`/`last` row utility behavior | Codex |
| 2026-02-11 | /dashboard | Added timeline-mode guidance: preserve board completeness via live/archived bucketing and first-live hero treatment only | Codex |
| 2026-02-11 | /dashboard | Added testing guardrail for duplicated status copy in timeline nodes (`getAllByText` + role/href checks) | Codex |

## Mandatory Post-Refactor Update Rule
After each successful UI refactor, you must update this playbook with new constraints, pitfalls, fidelity lessons, and verification improvements before closing the task.

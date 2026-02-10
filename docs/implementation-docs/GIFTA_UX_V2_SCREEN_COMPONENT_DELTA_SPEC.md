# Gifta UX v2 Screen and Component Delta Spec

## Purpose

Map UX v2 architecture requirements to concrete route/component deltas in current codebase.

## Coverage Principle

Each architecture section must map to:

- target route(s)
- target component(s)
- delta type (`add`, `change`, `remove`)
- acceptance checks

## Route-Level Delta Map

| Area | Current Route | Target Delta | Components |
|---|---|---|---|
| Landing/onboarding | `/` | confirm parity with architecture hero/social/trust blocks | marketing page components |
| Auth | `/sign-in`, `/sign-up` | confirm Clerk UX states and redirects | auth wrappers, header auth state |
| Public Dreamboard | `/(guest)/[slug]` | add/align charity display block, contributor display rules, return states | `DreamBoardCard`, progress, contributor chips |
| Contribution page | `/(guest)/[slug]/contribute` | align 4-step architecture intent with current flow UX; add remind-me entry point | `ContributionForm*` components |
| Thank-you | `/(guest)/[slug]/thanks` | charity visibility + post-contribution messaging parity | thank-you components/view model |
| Host create flow | `/(host)/create/*` | restructure to architecture-aligned step model; ensure giving-back + payout UX clarity | create pages, flow shell, draft logic |
| Host dashboard list | `/(host)/dashboard` | expand cards/states/actions parity | dashboard list components |
| Host dashboard detail | `/(host)/dashboard/[id]` | add sections: payout details, post-campaign summary, messages/actions parity | dashboard detail components |
| Dreamboard editing | host edit surfaces | add architecture-defined editable fields and confirmations | edit modals/forms |
| Admin payouts | `/(admin)/payouts*` | retain + expand to full admin domain parity | admin cards/tables |
| Admin other sections | new/expanded admin routes | implement dreamboards/contributions/charities/users/reports/settings as scoped | admin modules |

## Component Delta Backlog (Priority)

### P0 Components

- create-flow step orchestration and validation wrappers
- payout summary panels (host/admin)
- public progress/closed/funded state blocks
- provider payment interaction components regression-safe updates

### P1 Components

- charity display and split explanation modules
- reminder UX widgets and status hints
- admin domain tables and filter bars

### P2 Components

- celebration/delight interactions
- micro-animation refinements

## Data Binding Requirements

- all payout/charity fields sourced from Phase B-ready APIs
- no UI-only assumptions that bypass backend validation
- all enums rendered from canonical enum mappings

## UX State Requirements

Implement and test all states:

- loading
- empty
- validation error
- network error
- closed/funded branches
- partial capability disabled states

## Acceptance Criteria

- `P0`: all critical routes compile and pass journey tests
- `P1`: architecture parity achieved for committed route map
- `P1`: no orphan UX architecture sections without implementation mapping

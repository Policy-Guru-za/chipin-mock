# Documentation Drift Register

Last updated: March 12, 2026

## Purpose

Track the specific drift classes this repo now audits automatically and the Tier 1 areas that required a current-state rewrite.

## High-Signal Drift Classes

### 1. Missing or moved doc targets

Examples found in the workspace before this sync:

- removed implementation-spec links from [`README.md`](../../README.md)
- removed sandbox-implementation links from [`README.md`](../../README.md)
- stale legacy root-middleware references after the repo moved to [`proxy.ts`](../../proxy.ts)

### 2. Stale current-doc markers

Current docs must not keep stale removed-link targets, removed auth-flag names, legacy root-middleware references, or the old public API host unless they are explicitly documenting a protocol detail that is still live.

### 3. Non-authoritative docs without labels

Tier 2 references, historical plans, and evidence packs must carry a status banner so agents do not mistake them for current instructions.

## Tier 1 Rewrite Targets Completed in This Pass

- Root entry docs:
  - [`AGENTS.md`](../../AGENTS.md)
  - [`README.md`](../../README.md)
  - [`TESTING.md`](../../TESTING.md)
  - [`BACKLOG.md`](../../BACKLOG.md)
  - [`CHANGELOG.md`](../../CHANGELOG.md)
- Platform docs:
  - [`docs/Platform-Spec-Docs/API.md`](../Platform-Spec-Docs/API.md)
  - [`docs/Platform-Spec-Docs/ARCHITECTURE.md`](../Platform-Spec-Docs/ARCHITECTURE.md)
  - [`docs/Platform-Spec-Docs/DATA.md`](../Platform-Spec-Docs/DATA.md)
  - [`docs/Platform-Spec-Docs/INTEGRATIONS.md`](../Platform-Spec-Docs/INTEGRATIONS.md)
  - [`docs/Platform-Spec-Docs/JOURNEYS.md`](../Platform-Spec-Docs/JOURNEYS.md)
  - [`docs/Platform-Spec-Docs/KARRI.md`](../Platform-Spec-Docs/KARRI.md)
  - [`docs/Platform-Spec-Docs/NFR-OPERATIONS.md`](../Platform-Spec-Docs/NFR-OPERATIONS.md)
  - [`docs/Platform-Spec-Docs/PAYMENTS.md`](../Platform-Spec-Docs/PAYMENTS.md)
  - [`docs/Platform-Spec-Docs/SECURITY.md`](../Platform-Spec-Docs/SECURITY.md)
  - [`docs/Platform-Spec-Docs/SPEC.md`](../Platform-Spec-Docs/SPEC.md)
  - [`docs/Platform-Spec-Docs/UX.md`](../Platform-Spec-Docs/UX.md)
- Forensic / control docs:
  - [`docs/forensic-audit/STATE.md`](./STATE.md)
  - [`docs/forensic-audit/REPORT.md`](./REPORT.md)
  - [`docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md`](../implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md)
  - [`docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`](../implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md)

## Remaining Known Risk

- The Karri pending-attempt bug is still runtime debt. Docs now describe it honestly and the backlog tracks the fix.

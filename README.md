# Gifta Technical Documentation

> **Version:** 2.0.0  
> **Last Updated:** February 2026  
> **Status:** Platform Simplification In Progress

---

## Quick Start for AI Coding Agents

**Read [`AGENTS.md`](./AGENTS.md) first.** It contains:
- Build order and phased implementation
- Code standards and patterns
- Key implementation details
- File structure requirements
- Frontend aesthetics guidelines (NO "AI slop")

**Read [`docs/implementation-docs/chipin-simplification-spec.md`](./docs/implementation-docs/chipin-simplification-spec.md)** for the current implementation specification.

---

## What We're Building

**Gifta** is a social coordination tool for birthday gifting where:
1. Parent creates a "Dream Board" describing ONE dream gift (AI generates artwork)
2. Shares link with party guests via WhatsApp
3. Guests contribute money toward the gift (see % funded + totals raised vs goal)
4. When pot closes, funds are credited to the parent's Karri Card

**Tagline:** *Friends chip in together to turn birthday clutter into one dream gift.*

**Branding note:** the product/app is **Gifta**. Some partner-facing technical surfaces still use legacy naming (e.g. `api.chipin.co.za`, `cpk_*` API keys) until cutover.

**Core Philosophy:**
- We are in the **pooling business**, not the fulfillment business
- Money flows from contributors to Karri Card — we never hold funds
- Immediate debit from contributor, daily batch credit to host

---

## Documentation Index

### Core Documents

| Document | Description | Read When |
|----------|-------------|-----------|
| [`docs/Platform-Spec-Docs/CANONICAL.md`](./docs/Platform-Spec-Docs/CANONICAL.md) | Source of truth (resolves conflicts) | **Read first after AGENTS** |
| [`docs/Platform-Spec-Docs/SPEC.md`](./docs/Platform-Spec-Docs/SPEC.md) | Product requirements, features, non-features | Understanding what to build |
| [`docs/Platform-Spec-Docs/ARCHITECTURE.md`](./docs/Platform-Spec-Docs/ARCHITECTURE.md) | System design, tech stack, deployment | Planning infrastructure |
| [`docs/Platform-Spec-Docs/JOURNEYS.md`](./docs/Platform-Spec-Docs/JOURNEYS.md) | User flows with screen mockups | Building UI flows |
| [`docs/Platform-Spec-Docs/DATA.md`](./docs/Platform-Spec-Docs/DATA.md) | Database schema, Drizzle models | Setting up database |
| [`docs/Platform-Spec-Docs/API.md`](./docs/Platform-Spec-Docs/API.md) | Public API specification | Building API endpoints |
| [`docs/Platform-Spec-Docs/PAYMENTS.md`](./docs/Platform-Spec-Docs/PAYMENTS.md) | Payment provider integration | Integrating PayFast/Ozow/SnapScan |
| [`docs/Platform-Spec-Docs/INTEGRATIONS.md`](./docs/Platform-Spec-Docs/INTEGRATIONS.md) | Third-party services overview | External integrations |
| [`docs/Platform-Spec-Docs/UX.md`](./docs/Platform-Spec-Docs/UX.md) | Design system, components, screens | Building UI |
| [`docs/Platform-Spec-Docs/SECURITY.md`](./docs/Platform-Spec-Docs/SECURITY.md) | Security & POPIA requirements | Security implementation |
| [`docs/Platform-Spec-Docs/NFR-OPERATIONS.md`](./docs/Platform-Spec-Docs/NFR-OPERATIONS.md) | Non-functional requirements | SLOs + ops |
| [`AGENTS.md`](./AGENTS.md) | AI coding agent instructions | **READ FIRST** |

### OpenAPI

- File: `public/v1/openapi.json`
- Local: `http://localhost:3000/v1/openapi.json`
- Production: `https://api.chipin.co.za/v1/openapi.json`

### Integration Specs

| Document | Status | Description |
|----------|--------|-------------|
| [`docs/Platform-Spec-Docs/KARRI.md`](./docs/Platform-Spec-Docs/KARRI.md) | P0 - Core | Karri Card payout (sole payout method) |

### Implementation Docs

| Document | Description |
| --- | --- |
| [`docs/implementation-docs/SANDBOX_MODE_IMPLEMENTATION.md`](./docs/implementation-docs/SANDBOX_MODE_IMPLEMENTATION.md) | Sandbox mode feature flag spec and rollout plan. |
| [`docs/MIGRATION.md`](./docs/MIGRATION.md) | Migration guide for `DEMO_MODE` → `MOCK_*` flags. |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.4 (App Router) |
| UI | React 19.2.3 |
| Language | TypeScript (strict) |
| Database | Neon (PostgreSQL) |
| ORM | Drizzle |
| Styling | Tailwind CSS (customized) |
| Components | shadcn/ui (customized) |
| Hosting | Vercel |
| Payments (Inbound) | PayFast, Ozow, SnapScan |
| Payout | Karri Card (sole method) |
| Email | Resend |
| Notifications | WhatsApp Business API |
| AI Image Generation | Google Gemini (image generation via Generative Language API) |
| Storage | Vercel Blob |
| Cache | Vercel KV |

---

## MVP Scope

### In Scope
- ✅ Dream Board creation with manual gift name + AI-generated artwork
- ✅ Clerk authentication (prebuilt sign-in/sign-up)
- ✅ Guest contribution via PayFast, Ozow (EFT), SnapScan (QR)
- ✅ Karri Card as sole payout method
- ✅ Progress tracking (% + totals for guests; host sees full details)
- ✅ WhatsApp notifications (contribution alerts, payout confirmation)
- ✅ Email notifications
- ✅ Daily batch Karri Card credits
- ✅ Public Partner API (API keys, scopes, rate limiting)

### Out of Scope (Post-MVP)
- ❌ Multiple gifts per Dream Board
- ❌ Native mobile apps
- ❌ Desktop-optimized layouts (mobile-first serves all)

---

## Key Design Decisions

1. **One gift, not a registry** — Simplicity over flexibility
2. **Mobile web, not native app** — Zero download friction for guests
3. **Manual gift definition + AI artwork** — Parent describes gift, AI illustrates
4. **Karri Card only** — Single payout method, no fulfillment complexity
5. **We expose APIs** — Partners integrate with us, not reverse
6. **Immediate debit, daily batch credit** — We never hold funds
7. **No "AI slop" UI** — Distinctive, opinionated design

---

## Getting Started

```bash
# 1. Clone and install
git clone <repo>
cd chipin
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Fill in environment variables

# 3. Set up database
pnpm drizzle:generate
pnpm drizzle:push

# 4. Run development server
pnpm dev
```

## Useful Commands

```bash
# Lint / types / tests
pnpm lint
pnpm typecheck
pnpm test

# Load testing
pnpm test:load
```

---

## Questions?

If requirements are unclear:
1. Check the specific document
2. Follow the principle of simplicity
3. When in doubt, implement the minimal version

**Goal:** Working MVP, not perfect system. Ship, then iterate.

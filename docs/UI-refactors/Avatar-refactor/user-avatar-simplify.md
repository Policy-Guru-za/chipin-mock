> **Document Status:** Reference only. Reviewed March 12, 2026.
> Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.
> Canonical replacement: `docs/Platform-Spec-Docs/UX.md`.
# UI Item: Simplify User Avatar to Initials-Only Circle

## Status

Logged — no implementation started.

## Problem

The current `UserAvatarMenu` renders Clerk's `<UserButton>` as a bordered pill containing: a 34×34 sage-gradient initials circle, a "Ryan" name label, a dropdown chevron, a green online-status dot, and a shimmer hover animation. On mobile, the `compact` variant reduces this to just the circle.

On the wizard pages (and across all host-authenticated surfaces), the pill variant is the heaviest visual element in the header. It draws more attention than the Gifta logo, introduces a SaaS-toolkit aesthetic that conflicts with Gifta's warm editorial tone, and displays information the host already knows (their own name, that they're signed in). The checkmark/chevron adds ambiguity — is it "verified"? "selected"? — without communicating anything useful.

## Decision

Replace the desktop `pill` variant with the `compact` (initials-only circle) variant across all authenticated surfaces. The circle remains the Clerk `<UserButton>` trigger — tapping it still opens the dropdown with Dashboard, Create Dreamboard, Manage Account, and Sign Out. No functionality changes. This is a presentation-only adjustment.

## What changes

### 1. `UserAvatarMenu.tsx`

**Current:** The `Header.tsx` renders `<UserAvatarMenu afterSignOutUrl="/" />` with no `variant` prop, which defaults to `'pill'`.

**Change:** Default the `variant` prop to `'compact'` instead of `'pill'`, or — simpler — remove the `pill` variant entirely and always render compact. The component becomes:

- No `showName` prop on `<UserButton>` (or `showName={false}`).
- The `gifta-soft-signet-trigger` class always uses the compact padding (`padding: 4px`), no right-side padding for text.
- The `gifta-soft-signet-identifier` element is always hidden (it already is in compact mode).

The `pill` variant is not used anywhere other than the desktop Header. The mobile nav already uses `compact`. If there's no future need for the pill, remove it entirely to reduce dead code.

### 2. `globals.css` — Soft Signet section (lines 319–496)

**Remove or simplify:**

- `.gifta-soft-signet-trigger` — drop the `gap: 8px` and `padding: 4px 14px 4px 4px` (pill-specific spacing). Use `padding: 4px` only. Drop the `border` entirely — the circle itself has its own sage border; the outer pill border is what creates the "widget" feel.
- `.gifta-soft-signet-trigger::after` (shimmer effect) — remove. It's a nice touch on a large interactive surface but feels excessive on a small circle.
- `.gifta-soft-signet-trigger:hover` — simplify. Instead of amber glow + elevated shadow + translateY, use a subtle scale (`transform: scale(1.05)`) and a soft sage shadow. The hover should whisper, not shout.
- `.gifta-soft-signet-identifier`, `.gifta-soft-signet-identifier::before`, `.gifta-soft-signet-identifier::after` — remove entirely (name text, chevron, and all their hover/open states). Dead CSS once the pill is gone.
- `.gifta-soft-signet--pill` — remove.
- `.gifta-soft-signet-avatar::after` (green status dot) — remove. The "online" indicator is a real-time presence pattern that has no meaning in Gifta's context. The host is always "online" when they're looking at the screen.

**Keep:**

- `.gifta-soft-signet-avatar` — the 34×34 sage-gradient circle with initials via `::before`. This is the core visual element and it already looks good.
- `.gifta-soft-signet-avatar-image` `display: none` — keeps Clerk's default profile photo hidden in favour of the custom initials.
- `.gifta-soft-signet-trigger:focus-visible` — accessibility ring.
- `.gifta-soft-signet-avatar-open` — the slightly darker state when the dropdown is active.

**Net result:** The ~180 lines of Soft Signet CSS reduce to roughly 40–50 lines.

### 3. `Header.tsx`

No structural changes. The `<UserAvatarMenu afterSignOutUrl="/" />` call stays the same. If the default variant changes to `compact` in the component, the Header doesn't need updating.

### 4. `MobileNav.tsx`

Already uses `variant="compact"`. No changes needed. If the `variant` prop is removed from `UserAvatarMenu` entirely (because compact is now the only mode), remove the prop from the MobileNav call as well.

### 5. `LandingNav.tsx`

Check which variant the landing nav uses. If it uses `pill`, update to match the new default. If it already uses `compact`, no change.

## Visual target

The header should look like:

```
┌──────────────────────────────────────────────┐
│  🎁 Gifta          [nav links]        (RL)   │
│                                        ↑      │
│                                   34px sage   │
│                                   circle,     │
│                                   no border   │
│                                   pill, no    │
│                                   name, no    │
│                                   chevron     │
└──────────────────────────────────────────────┘
```

The circle should feel like it belongs to the same design system as the contributor avatars on the guest Dreamboard page (`ContributorDisplay`). Those are 40×40 sage circles with white text initials — the host avatar should be their quieter sibling.

## Files to modify

| File | Change |
|------|--------|
| `src/components/auth/UserAvatarMenu.tsx` | Remove `pill` variant; always render compact. Remove `showName`. Simplify appearance classes. |
| `src/app/globals.css` (lines 319–496) | Remove pill-specific CSS, shimmer, identifier/chevron styles, status dot. Keep circle + focus + open state. |
| `src/components/layout/Header.tsx` | No change (or remove `variant` prop if no longer needed). |
| `src/components/layout/MobileNav.tsx` | Remove explicit `variant="compact"` prop if the variant prop is removed from the component. |
| `src/components/landing/LandingNav.tsx` | Check and align if it uses `pill` variant. |

## What does NOT change

- The Clerk `<UserButton>` dropdown menu (Dashboard, Create Dreamboard, Manage Account, Sign Out).
- The `deriveInitials` and `deriveFirstName` utility functions (initials still needed for the `::before` content).
- The `--gifta-soft-signet-initials` CSS variable mechanism.
- Any auth logic, middleware, or Clerk configuration.

## Verification

- Desktop: header shows logo left, sage initials circle right (no pill, no name, no chevron, no status dot).
- Tapping the circle opens Clerk dropdown with all 4 menu items.
- Hover: subtle scale or shadow only.
- Focus-visible: accessibility ring present.
- Mobile: unchanged (already compact).
- No TypeScript errors (`pnpm tsc --noEmit`).
- Visual regression: no other components affected (the Soft Signet CSS classes are scoped and not used elsewhere).

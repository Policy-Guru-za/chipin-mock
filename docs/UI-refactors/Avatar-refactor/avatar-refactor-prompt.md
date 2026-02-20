# Avatar Refactor: "Soft Signet" Design

## Objective

Replace the default Clerk `<UserButton>` avatar in the Gifta app's navigation with a custom "Soft Signet" avatar component — a pill-shaped capsule containing a sage-green initials circle, the user's first name, and a dropdown chevron. The Clerk `<UserButton>` dropdown menu and all its menu items must be preserved exactly as-is; only the visual trigger element (the avatar) changes.

## Current State

**Component:** `src/components/auth/UserAvatarMenu.tsx`
**Used in:** `src/components/layout/Header.tsx` (line 65), `src/components/layout/MobileNav.tsx` (line 183), `src/components/landing/LandingNav.tsx` (line 179)

The current implementation renders Clerk's default `<UserButton>` with custom menu items (Dashboard, Create Dreamboard, manageAccount, signOut). The avatar is Clerk's default circular purple avatar with no custom styling.

```tsx
// Current implementation (src/components/auth/UserAvatarMenu.tsx)
'use client';
import { UserButton } from '@clerk/nextjs';
import { DashboardIcon, GiftIcon } from '@/components/icons';

interface UserAvatarMenuProps {
  afterSignOutUrl?: string;
}

export function UserAvatarMenu({ afterSignOutUrl = '/' }: UserAvatarMenuProps) {
  return (
    <UserButton afterSignOutUrl={afterSignOutUrl}>
      <UserButton.MenuItems>
        <UserButton.Link label="Dashboard" href="/dashboard" labelIcon={<DashboardIcon size="sm" className="text-text-muted" />} />
        <UserButton.Link label="Create Dreamboard" href="/create/child" labelIcon={<GiftIcon size="sm" className="text-text-muted" />} />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
```

## Target Design (Soft Signet)

A reference HTML file with the exact design is at: `/docs/UI-refactors/Avatar-refactor/nav-avatar-variant-3.html`. Open it in a browser to see the target. Below is the complete specification.

### Visual Structure

```
┌─────────────────────────────────┐
│  ┌────┐                        │
│  │ RL │  Ryan  ▾               │
│  └────┘                        │
└─────────────────────────────────┘
  pill    circle   name  chevron
```

- **Pill container:** `border-radius: 999px`, `padding: 4px 14px 4px 4px`, `background: var(--color-bg-subtle)` (`#FDF8F3`), `border: 1.5px solid var(--color-border-warmth)` (`#EDE7DE`).
- **Initials circle:** `width: 34px`, `height: 34px`, `border-radius: 50%`, `background: linear-gradient(150deg, var(--color-sage-light) 0%, #c8dfd2 50%, var(--color-sage-light) 100%)`, `border: 1.5px solid var(--color-sage)` (`#4A7E66`). Font: Fraunces, 13px, weight 700, color `var(--color-sage-deep)` (`#3B6B55`). Inner box-shadow: `inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 4px rgba(74,126,102,0.1)`.
- **Online status dot:** `width: 10px`, `height: 10px`, positioned absolute `bottom: -1px`, `right: -1px` on the circle, `background: var(--color-success)` (`#059669`), `border: 2px solid var(--color-bg-subtle)`, `border-radius: 50%`.
- **Name text:** User's first name only. Font: DM Sans (`font-warmth-sans`), 13px, weight 600, color `var(--color-text)` (`#1C1917`).
- **Chevron:** A small SVG downward chevron, 12×12px, `stroke: currentColor`, color `var(--color-text-muted)` (`#A8A29E`), `stroke-width: 1.5`, `stroke-linecap: round`, `stroke-linejoin: round`. Path: `M3 4.5L6 7.5L9 4.5`.

### Hover State

On hover, the pill should transition (300ms, `cubic-bezier(0.16, 1, 0.3, 1)`) to:
- `border-color: var(--color-amber-glow)` (`#EBDCC8`)
- `background: white`
- `box-shadow: 0 2px 8px rgba(196,154,92,0.1), 0 0 0 3px rgba(196,154,92,0.06)`
- `transform: translateY(-1px)`
- The initials circle gains: `border-color: var(--color-sage-deep)`, enhanced shadow `0 2px 8px rgba(74,126,102,0.15), 0 0 0 2px rgba(74,126,102,0.08)`
- Name text color shifts to `var(--color-sage-deep)`
- Chevron shifts down 1px and changes color to `var(--color-sage)` (`#4A7E66`)
- A shimmer effect sweeps across the pill: a `::after` pseudo-element with `background: linear-gradient(90deg, transparent, rgba(196,154,92,0.08), transparent)` animates `left: -100%` to `left: 100%` over 600ms.

### Data Source

- **Initials:** Derive from Clerk's `user.firstName` and `user.lastName` (e.g., "Ryan Laubscher" → "RL"). Fall back to first two characters of email if names are absent.
- **First name:** `user.firstName`. Fall back to "User" if absent.
- Use `useUser()` from `@clerk/nextjs` to access user data.

## Implementation Approach

### Option A — Clerk `<UserButton>` with Appearance Overrides (Preferred)

Use `<UserButton>` as the interaction/menu engine and style the trigger via `appearance.elements` + `showName`. This preserves built-in menu/session behavior and keeps existing `<UserButton.MenuItems>` unchanged.

```tsx
<UserButton
  afterSignOutUrl={afterSignOutUrl}
  showName={variant === 'pill'}
  appearance={{ elements: {/* userButtonTrigger/userButtonAvatarBox/etc */} }}
>
  <UserButton.MenuItems>
    {/* Existing menu items unchanged */}
  </UserButton.MenuItems>
</UserButton>
```

Implementation constraint: do **not** use `<UserButton.Trigger>` for this repo's installed Clerk package; use the stable appearance-based path.

### Option B — Alternative Fallback (Only if appearance path proves insufficient)

If appearance overrides cannot fully achieve the design, evaluate a controlled fallback that still keeps Clerk semantics intact. Avoid unsupported programmatic menu-open patterns unless strictly necessary.

### Mobile Consideration (Locked)

Use a variant prop with explicit mapping:
- `variant="pill"` (desktop header + desktop landing navbar)
- `variant="compact"` (mobile drawer + landing mobile menu)

Both variants must open the same Clerk menu.

## Files to Modify

1. **`src/components/auth/UserAvatarMenu.tsx`** — Primary change. Refactor to use appearance-driven Soft Signet trigger styling.
2. **`src/app/globals.css`** — Add any keyframe animations needed (the shimmer sweep) if not using Tailwind's arbitrary animation syntax. The design tokens (CSS variables) already exist in this file.
3. **`src/components/layout/Header.tsx`** — No changes expected if the component API stays the same. Verify it still works with default `pill`.
4. **`src/components/layout/MobileNav.tsx`** — Pass `variant="compact"` for the mobile drawer avatar.
5. **`src/components/landing/LandingNav.tsx`** — Desktop avatar stays `pill` default, mobile menu avatar uses `compact`.
6. **`tests/unit/auth-nav-user-menu.test.ts`** — Update source assertions for new variant callsites.
7. **`tests/unit/user-avatar-menu.test.tsx`** — Add rendering-level tests for variant mapping, appearance contract, and name/initial fallbacks.

## Files NOT to Modify

Everything else. This is a scoped visual refactor of one component's trigger element. Do not change routing, menu items, auth logic, analytics, or any other component.

## Design Tokens (already defined in globals.css)

All of these CSS variables already exist in the codebase. Use them — do not hardcode hex values.

```
--color-sage: #4A7E66
--color-sage-deep: #3B6B55
--color-sage-light: #E9F3ED
--color-amber-glow: #EBDCC8
--color-bg-subtle: #FDF8F3
--color-border-warmth: #EDE7DE
--color-text: #1C1917
--color-text-muted: #A8A29E
--color-success: #059669
```

Font variables: `--font-display` (Fraunces), DM Sans is available via `--font-dm-sans` / Tailwind `font-warmth-sans`.

## Acceptance Criteria

1. The avatar renders as the Soft Signet pill on desktop (Header.tsx).
2. The avatar renders as a compact circle (no name, no chevron) on mobile nav contexts.
3. Clicking the avatar opens the Clerk user menu with all four existing items (Dashboard, Create Dreamboard, Manage Account, Sign Out).
4. Hover state matches the specification (warm glow, lift, shimmer, color shifts).
5. The user's real initials and first name are displayed from Clerk user data.
6. The online status dot is visible on the circle.
7. All existing tests in `tests/unit/auth-nav-user-menu.test.ts` continue to pass.
8. Add rendering-level regression tests in `tests/unit/user-avatar-menu.test.tsx` for variant behavior and fallback derivation.
9. No regressions in Header, MobileNav, or LandingNav rendering.

## Reference File

Open `/docs/UI-refactors/Avatar-refactor/nav-avatar-variant-3.html` in a browser to see the exact target design at nav-bar scale and enlarged. All CSS values in that file match the specification above.

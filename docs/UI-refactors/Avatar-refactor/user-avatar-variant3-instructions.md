> **Document Status:** Reference only. Reviewed March 12, 2026.
> Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.
> Canonical replacement: `docs/Platform-Spec-Docs/UX.md`.
# User Avatar: Variant 3 Implementation Instructions

## Task

Convert the current `UserAvatarMenu` into a pixel-perfect clone of "Nav Avatar Variant 3". Revert recent simplification tweaks (hidden name, squashed chevron) and ensure colors/spacing explicitly match. Implement a robust fallback for missing user names using normalised email prefixes, backed by strong CSS layout safety nets.

## Blast radius

This refactor touches three files and affects three surfaces:

| File | Change scope |
|------|-------------|
| `src/app/globals.css` | New token, gradient tweak, identifier gap/truncation, delete pill override + chevron-only rules |
| `src/components/auth/UserAvatarMenu.tsx` | `deriveFirstName` email fallback, export utilities, revert identifier class logic |
| `tests/unit/user-avatar-menu.test.tsx` | Remove `pill-chevron-only` assertions, add email prefix fallback tests |

**Surfaces affected:**

- `Header.tsx` — renders `<UserAvatarMenu afterSignOutUrl="/" />` (default `pill` variant). The revert restores Variant 3 pill with full name + standard chevron.
- `LandingNav.tsx` — also renders `UserAvatarMenu` with default `pill` variant. Same Variant 3 visual propagates here. This is intentional.
- `MobileNav.tsx` — renders `variant="compact"`. The compact path is untouched by this refactor. No visual change.

---

## Step 1: Edit `src/app/globals.css` (Design Tokens & Layout Safety)

### 1a. New design token

In the `:root` block, locate the `--color-sage-wash` variable. Immediately below it, define:

```css
--color-sage-wash-mid: #c8dfd2;
```

### 1b. Apply token to avatar gradient

Locate `.gifta-soft-signet-avatar`. Update the background `linear-gradient` to use the new token for the 50% colour stop:

```css
background: linear-gradient(
  150deg,
  var(--color-sage-light) 0%,
  var(--color-sage-wash-mid) 50%,
  var(--color-sage-light) 100%
);
```

### 1c. Update identifier gap

Locate `.gifta-soft-signet-identifier`. Update `gap` from `6px` to `8px`.

### 1d. Add truncation safety to identifier name

In the `.gifta-soft-signet-identifier::before` rule, add the following properties. **`display: inline-block` is required** — without it, `max-width` and `text-overflow` are silently ignored on pseudo-elements:

```css
display: inline-block;
max-width: 120px;
overflow: hidden;
text-overflow: ellipsis;
vertical-align: middle;
```

### 1e. Delete pill override block

Locate the `.gifta-soft-signet--pill .gifta-soft-signet-trigger` rule block (currently at approximately lines 410–413). It overrides the base trigger with `gap: 6px; padding: 4px 10px 4px 4px;`.

**Before deleting**, verify that the base `.gifta-soft-signet-trigger` rule (approximately lines 332–343) defines `padding: 4px 14px 4px 4px;` and `gap: 8px;`. These are the Variant 3 values. Once confirmed, delete the override block entirely.

### 1f. Delete all `pill-chevron-only` rules

Delete every CSS rule relating to `.gifta-soft-signet-identifier--pill-chevron-only`, including:

- `.gifta-soft-signet-identifier--pill-chevron-only` (base)
- `.gifta-soft-signet-identifier.gifta-soft-signet-identifier--pill-chevron-only::before`
- `.gifta-soft-signet-identifier.gifta-soft-signet-identifier--pill-chevron-only::after`
- `.gifta-soft-signet-trigger:hover .gifta-soft-signet-identifier.gifta-soft-signet-identifier--pill-chevron-only::after` and its sibling `.gifta-soft-signet-identifier-open.gifta-soft-signet-identifier--pill-chevron-only::after`

This restores First Name visibility and the standard 12×12 chevron size in the pill variant.

---

## Step 2: Edit `src/components/auth/UserAvatarMenu.tsx` (Component Logic)

### 2a. Update `deriveFirstName` to accept email fallback

Change the function signature to:

```typescript
const deriveFirstName = (
  firstName: string | null | undefined,
  emailAddress: string | null | undefined
): string => {
```

Update the function body:

```typescript
const deriveFirstName = (
  firstName: string | null | undefined,
  emailAddress: string | null | undefined
): string => {
  const normalized = firstName?.trim();
  if (normalized) return normalized;

  // Fallback: extract first segment of email local part, capitalised.
  const localPart = emailAddress?.split('@')[0];
  if (localPart) {
    const segments = localPart.split(/[._\-+]/).filter(Boolean);
    const first = segments[0];
    if (first) {
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
  }

  return 'User';
};
```

### 2b. Export `deriveFirstName` and `deriveInitials`

Both functions should be exported so tests can assert against them directly:

```typescript
export const deriveInitials = ( ... ) => { ... };
export const deriveFirstName = ( ... ) => { ... };
```

Keep `toAlphaNumericChars` and `encodeCssContent` as unexported module-private utilities — they are internal helpers with no independent testing value.

### 2c. Update the `deriveFirstName` call site

In the `UserAvatarMenu` component body, change:

```typescript
const firstNameDisplay = deriveFirstName(user?.firstName);
```

to:

```typescript
const firstNameDisplay = deriveFirstName(
  user?.firstName,
  user?.primaryEmailAddress?.emailAddress
);
```

### 2d. Remove `identifierVariantClass` and revert identifier class injection

Delete these lines:

```typescript
const identifierVariantClass = isCompact
  ? 'gifta-soft-signet-identifier--compact'
  : 'gifta-soft-signet-identifier--pill-chevron-only';
```

And revert the `userButtonOuterIdentifier` value in the `appearance.elements` object to:

```typescript
userButtonOuterIdentifier: `gifta-soft-signet-identifier ${isCompact ? 'gifta-soft-signet-identifier--compact' : ''}`.trim(),
```

---

## Step 3: Update tests `tests/unit/user-avatar-menu.test.tsx` (Validation)

The existing tests use component rendering with a mocked `useUser()` and assert against CSS custom properties (`--gifta-soft-signet-name`, `--gifta-soft-signet-initials`) on the wrapper `div`. Some tests also assert specific CSS class strings passed to the `<UserButton>` via `captureUserButtonProps`.

### 3a. Remove `pill-chevron-only` assertions

In the pill variant test (`'uses pill variant defaults...'`), remove:

```typescript
expect(props.appearance.elements.userButtonOuterIdentifier).toContain(
  'gifta-soft-signet-identifier--pill-chevron-only'
);
```

Replace with an assertion that the pill variant uses the base identifier class without any variant suffix:

```typescript
expect(props.appearance.elements.userButtonOuterIdentifier).toBe(
  'gifta-soft-signet-identifier'
);
```

In the compact variant test (`'uses compact variant without name display'`), remove:

```typescript
expect(props.appearance.elements.userButtonOuterIdentifier).not.toContain(
  'gifta-soft-signet-identifier--pill-chevron-only'
);
```

(This is now redundant — the class no longer exists.)

### 3b. Update the name fallback test

The existing test `'falls back to email local-part initials and default name when user names are missing'` currently asserts:

```typescript
expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-name')).toBe('"User"');
```

Update this to assert the new email prefix behaviour. The mock user has `emailAddress: 'alpha.beta+1@example.com'`, so the expected first name is `"Alpha"` (first segment of `alpha.beta+1`, capitalised):

```typescript
expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-name')).toBe('"Alpha"');
```

### 3c. Add new `deriveFirstName` unit tests

Since `deriveFirstName` is now exported, add a dedicated `describe` block with direct unit assertions:

```typescript
import { deriveFirstName } from '@/components/auth/UserAvatarMenu';

describe('deriveFirstName', () => {
  it('returns first name when present', () => {
    expect(deriveFirstName('Ryan', null)).toBe('Ryan');
  });

  it('extracts capitalised first segment from dotted email', () => {
    expect(deriveFirstName(null, 'ryan.laubscher@domain.com')).toBe('Ryan');
  });

  it('extracts capitalised first segment from underscored email', () => {
    expect(deriveFirstName(null, 'ryan_l@domain.com')).toBe('Ryan');
  });

  it('extracts capitalised first segment from hyphenated email', () => {
    expect(deriveFirstName(null, 'ryan-l@domain.com')).toBe('Ryan');
  });

  it('filters leading separators and extracts first valid segment', () => {
    expect(deriveFirstName(null, '_admin@domain.com')).toBe('Admin');
  });

  it('handles unseparated long email prefix', () => {
    expect(deriveFirstName(null, 'christopher123@domain.com')).toBe('Christopher123');
  });

  it('falls back to User when both name and email are missing', () => {
    expect(deriveFirstName(null, null)).toBe('User');
  });

  it('falls back to User when email has no usable prefix', () => {
    expect(deriveFirstName(null, '@domain.com')).toBe('User');
  });

  it('prefers first name over email when both are provided', () => {
    expect(deriveFirstName('Ryan', 'different@domain.com')).toBe('Ryan');
  });

  it('trims whitespace-only first names and falls back to email', () => {
    expect(deriveFirstName('  ', 'ryan@domain.com')).toBe('Ryan');
  });
});
```

### 3d. Optionally add `deriveInitials` direct tests

If `deriveInitials` is not already tested directly in a separate describe block, consider adding one for consistency. The existing component-level tests already cover it indirectly via `--gifta-soft-signet-initials`, so this is optional but recommended for parity with the new `deriveFirstName` block. The function is now exported (Step 2b), so direct imports will work.

---

## Step 4: Verify

Run all three checks — all must pass:

```bash
pnpm run typecheck
pnpm run lint
pnpm test
```

If any `pill-chevron-only` references remain in test assertions or source files, the typecheck/lint/test run will catch them as the CSS class and component logic no longer exist.

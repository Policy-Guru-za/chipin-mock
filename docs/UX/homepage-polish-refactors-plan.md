# Homepage Polish Refactors — Implementation Plan

> **Purpose:** Three targeted refactors to improve the visual rhythm, card definition, and conversion impact of the Gifta landing page.
>
> **Scope:** CSS-level and light JSX changes only — no new components, no layout rewrites, no data-model changes.
>
> **Guardrail contracts that MUST be preserved:**
>
> | Test file | Assertion target | Required string |
> |---|---|---|
> | `tests/unit/copy-matrix-compliance.test.ts` (line 122) | `LandingPage.tsx` source | `'Create Your Free Dreamboard'` |
> | `tests/unit/colour-contrast.test.ts` (line 35) | `LandingPage.tsx` source | `'from-[#6B9E88] to-[#5A8E78]'` |
>
> Both tests use `readFileSync` to scan raw source text. Any refactor to `LandingPage.tsx` **must** keep these exact strings present in the file.

---

## Refactor 1 — Card Edge Definition on How It Works Story Cards

### Problem

The story cards' white body sections (`bg-white`) are nearly invisible against the `#FFFCF9` cream page background. The gradient headers appear to float above orphaned description text rather than sitting atop cohesive card units.

### Solution

Add a subtle `box-shadow` and hairline border to the outer card container so each card reads as a single, premium object.

### File: `src/components/landing/LandingHowItWorks.tsx`

**Target:** `StoryCard` sub-component, line 99 — the outer `<div>`.

**Current value:**

```tsx
<div className="rounded-[22px] overflow-hidden" style={fadeStyle(show, CARD_DELAYS[idx], 0.45)}>
```

**Replace with:**

```tsx
<div className="rounded-[22px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.03)]" style={fadeStyle(show, CARD_DELAYS[idx], 0.45)}>
```

**What changes:**

| Property | Before | After |
|---|---|---|
| `box-shadow` | none | `0 2px 12px rgba(0,0,0,0.04)` — barely-there depth |
| `border` | none | `1px solid rgba(0,0,0,0.03)` — hairline edge definition |

**Design intent:** The shadow and border must be extremely subtle — the goal is to define the card boundary without making it look "boxy" or heavy. The values above are deliberately understated; err on the side of too-subtle rather than too-visible.

---

## Refactor 2 — Background Shift on How It Works Section

### Problem

From hero to footer, every section sits on the same `#FFFCF9` cream. The eye has no visual landmarks — the page scrolls as one undifferentiated vertical strip with no sense of editorial rhythm or section delineation.

### Solution

Apply a soft warm-linen background to the How It Works `<section>` element, creating a natural visual break without hard borders or dividers. Extend padding so the tinted band has room to breathe.

### File: `src/components/landing/LandingHowItWorks.tsx`

**Target:** `<section>` element at line 149.

**Current value:**

```tsx
<section ref={sectionRef} id="how-it-works" className="px-6 pt-12 pb-6 md:px-10 md:pt-16 md:pb-8 relative z-[5]">
```

**Replace with:**

```tsx
<section ref={sectionRef} id="how-it-works" className="px-6 pt-14 pb-10 md:px-10 md:pt-20 md:pb-14 relative z-[5] bg-[#FAF7F2]">
```

**What changes:**

| Property | Before | After |
|---|---|---|
| `background` | inherited `#FFFCF9` | `#FAF7F2` — warmer linen tone, 1–2 shades darker |
| `padding-top` | `pt-12` / `md:pt-16` | `pt-14` / `md:pt-20` — more breathing room above |
| `padding-bottom` | `pb-6` / `md:pb-8` | `pb-10` / `md:pb-14` — more breathing room below |

**Design intent:** The background shift should be perceptible but gentle — a warm "band" that the user scrolls into and out of. `#FAF7F2` is close to the existing `#FFFCF9` but a touch warmer and darker. The increased vertical padding ensures the tinted band doesn't feel cramped around the cards.

**Colour note for the implementing agent:** If `#FAF7F2` feels too strong when viewed in the browser, try `#FBF8F4` as a softer alternative. The key constraint is that it must be noticeably different from `#FFFCF9` when scrolling but not so dark that the white card bodies look stark against it.

### Consequential adjustment — SocialProof background

The `SocialProof` sub-component (line 126) currently uses `bg-white`. With the section background shifting to `#FAF7F2`, lock the border alpha at `0.12` for reliable edge definition against the warm band.

**Use (line 126):**

```
border-[1.5px] border-[rgba(107,158,136,0.12)]
```

---

## Refactor 3 — Closing Section to Replace Naked CTA

### Problem

The green "Create Your Free Dreamboard" button between How It Works and the footer sits in a bare `<div>` with no headline, no supporting text, and no visual container. It's the page's final conversion moment but has the weakest visual treatment of any section.

### Solution

Replace the bare wrapper `<div>` with a proper closing section containing an inner banner: subtle warm tint, soft border, soft shadow, short headline, supporting subtitle, and the existing green CTA button. The `Link` element and its className must remain unchanged to satisfy guardrail tests.

### File: `src/components/landing/LandingPage.tsx`

**Target:** Lines 63–71 — the page-level CTA block.

**Current value:**

```tsx
      {/* Page-level CTA — contract: copy-matrix-compliance + colour-contrast */}
      <div className="flex justify-center px-5 py-10 md:py-14">
        <Link
          href="/create"
          className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-9 py-[18px] rounded-xl font-semibold text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(107,158,136,0.3)]"
        >
          Create Your Free Dreamboard
        </Link>
      </div>
```

**Replace with:**

```tsx
      {/* Closing CTA — contract: copy-matrix-compliance + colour-contrast */}
      <section className="px-6 py-14 md:px-10 md:py-20">
        <div className="max-w-[760px] mx-auto rounded-[28px] border border-[rgba(107,158,136,0.14)] bg-[linear-gradient(180deg,rgba(250,247,242,0.96)_0%,rgba(255,252,249,0.96)_100%)] shadow-[0_8px_28px_rgba(90,142,120,0.08)] px-6 py-10 md:px-10 md:py-14 text-center">
          <h2
            className="text-[24px] md:text-[32px] font-bold leading-[1.2] text-[#2D2D2D] mb-2"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            Ready to make gift-giving magic?
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#7A8D83] mb-8">
            It takes less than a minute. No app needed.
          </p>
          <Link
            href="/create"
            className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-9 py-[18px] rounded-xl font-semibold text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(107,158,136,0.3)] inline-block"
          >
            Create Your Free Dreamboard
          </Link>
        </div>
      </section>
```

**What changes:**

| Element | Before | After |
|---|---|---|
| Wrapper | bare `<div>` with flex centering | `<section>` with generous vertical padding and a centered contained banner |
| Headline | none | `<h2>` "Ready to make gift-giving magic?" in DM Serif Display |
| Subtitle | none | `<p>` "It takes less than a minute. No app needed." in muted sage |
| CTA Link className | unchanged | **identical** plus `inline-block` (needed for `text-center` to work) |
| CTA Link text | `Create Your Free Dreamboard` | **identical** (guardrail contract) |
| CTA Link href | `/create` | **identical** |

### CRITICAL — Guardrail preservation

The `<Link>` element's `className` **must** still contain the exact string `from-[#6B9E88] to-[#5A8E78]` and the link text **must** still be exactly `Create Your Free Dreamboard`. The replacement above preserves both. Do not modify, reformat, or line-break the className string in a way that would break these substring matches.

### File: `src/components/landing/content.ts`

**No changes required.** The headline and subtitle for the closing section are simple one-off strings and do not need to be extracted to the content module. If a future copy-matrix test is added for this section, extraction can happen then.

---

## Files Modified (Summary)

| # | File | Change type | Lines affected |
|---|---|---|---|
| 1 | `src/components/landing/LandingHowItWorks.tsx` | Edit className | Line 99 (StoryCard outer div) |
| 2 | `src/components/landing/LandingHowItWorks.tsx` | Edit className | Line 149 (section element) |
| 3 | `src/components/landing/LandingPage.tsx` | Replace JSX block | Lines 63–71 |

**No new files.** No changes to `content.ts`, `globals.css`, or test files.

---

## Verification Checklist

After implementing all three refactors, the agent must verify each of the following:

### 1. Guardrail tests

Run the two source-based contract tests:

```bash
pnpm vitest run tests/unit/copy-matrix-compliance.test.ts tests/unit/colour-contrast.test.ts
```

Both must pass. If the test runner is unavailable, verify manually:

```bash
# Must output 1
grep -c "Create Your Free Dreamboard" src/components/landing/LandingPage.tsx

# Must output 0
grep -c "Create your free Dream Board" src/components/landing/LandingPage.tsx

# Must output 1
grep -c "from-\[#6B9E88\] to-\[#5A8E78\]" src/components/landing/LandingPage.tsx
```

### 2. Linting

```bash
pnpm exec eslint src/components/landing/LandingHowItWorks.tsx src/components/landing/LandingPage.tsx
```

Must pass with zero warnings or errors.

### 3. TypeScript

```bash
pnpm typecheck
```

Must pass with zero errors.

### 4. Visual verification

If a browser is available, check:

- [ ] Story cards have a visible but subtle boundary separating them from the page background
- [ ] The How It Works section has a perceptibly different (warmer) background tone from the hero section above and footer below
- [ ] The closing section has a headline, subtitle, and the green CTA button centred
- [ ] Scroll transitions between sections feel smooth — no jarring colour jumps
- [ ] The social proof bar's white background contrasts cleanly against the new section background

### 5. Build

```bash
pnpm build
```

Must complete without errors.

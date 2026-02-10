# Homepage Font & Design Restoration Plan

**Date:** 2026-02-10
**Author:** Ryan Laubscher (via Claude analysis)
**Reference repo:** https://github.com/Policy-Guru-za/chipin-mock.git (the "original")
**Target repo:** gifta-codex-5.3 (the "current")

---

## Background

The current Gifta homepage has diverged from the original design in two categories:

1. **Font loading is broken.** The `next/font/google` imports were removed from `layout.tsx`, so all five Google Fonts (Outfit, Fraunces, DM Sans, DM Serif Display, Nunito) are never loaded. Every text element on the homepage falls back to generic system fonts (e.g. `system-ui`, `Georgia`).
2. **Minor color, text, and structural differences** were introduced across several landing components.

This plan restores the current repo to match the original in all respects. No files need to be created or deleted; all changes are edits to existing files.

---

## Files requiring changes

| # | File path | Change type |
|---|-----------|-------------|
| 1 | `src/app/layout.tsx` | Restore font imports, font constants, `<html>` className, metadata strings, remove added elements |
| 2 | `src/components/landing/LandingNav.tsx` | Restore colors, text, remove added attribute, revert hamburger button classes |
| 3 | `src/components/landing/LandingDreamBoard.tsx` | Restore text content |
| 4 | `src/components/landing/LandingPage.tsx` | Restore button color and text |
| 5 | `src/components/landing/LandingCTA.tsx` | Restore button color and text |

**Files confirmed identical (no changes needed):** `globals.css`, `tailwind.config.ts`, `LandingHero.tsx`, `LandingTestimonial.tsx`, `LandingHowItWorks.tsx`, `LandingFooter.tsx`, `LandingStatsLine.tsx`.

---

## Change 1: `src/app/layout.tsx`

This is the most critical change. The entire file should be replaced with the content below. The key differences from the current version are:

- **Add** the `next/font/google` import for all five fonts
- **Add** the five font constant declarations
- **Add** font variable CSS classes to the `<html>` element
- **Restore** the original metadata title and description strings
- **Remove** the `<a href="#main-content">` skip-to-content link (not in original)
- **Remove** the `<noscript>` block (not in original)

### Target content (complete file)

```tsx
import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display, Fraunces, Nunito, Outfit } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

import {
  isMockKarri,
  isMockPaymentWebhooks,
  isMockPayments,
  isMockSentry,
} from '@/lib/config/feature-flags';
import { getClerkConfigStatus, getClerkUrls } from '@/lib/auth/clerk-config';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gifta - Everyone Chips In. One Perfect Gift.',
  description:
    'Create a Dreamboard for your child\'s birthday. Friends and family chip in toward one meaningful gift — no more gift piles, no more guesswork.',
  openGraph: {
    type: 'website',
    url: 'https://gifta.co.za',
    title: 'Gifta',
    description:
      'Create a Dreamboard for your child\'s birthday. Friends and family chip in toward one meaningful gift — no more gift piles, no more guesswork.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gifta',
    description:
      'Create a Dreamboard for your child\'s birthday. Friends and family chip in toward one meaningful gift — no more gift piles, no more guesswork.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const activeMocks = [
    { label: 'payments', enabled: isMockPayments() },
    { label: 'payment webhooks', enabled: isMockPaymentWebhooks() },
    { label: 'karri', enabled: isMockKarri() },
    { label: 'sentry', enabled: isMockSentry() },
  ]
    .filter((mock) => mock.enabled)
    .map((mock) => mock.label);
  const bannerText =
    activeMocks.length > 0 ? `SANDBOX MODE — mock ${activeMocks.join(', ')}` : null;
  const clerkConfig = getClerkConfigStatus();
  const { signInUrl, signUpUrl, signInFallbackRedirectUrl, signUpFallbackRedirectUrl } =
    getClerkUrls();

  const layoutContent = (
    <>
      {bannerText ? (
        <div className="border-b border-border bg-accent/10 px-4 py-2 text-center text-xs font-semibold text-text">
          {bannerText}
        </div>
      ) : null}
      {children}
    </>
  );

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} ${dmSans.variable} ${dmSerifDisplay.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-surface text-text">
        {clerkConfig.isEnabled ? (
          <ClerkProvider
            publishableKey={clerkConfig.publishableKey ?? ''}
            signInUrl={signInUrl}
            signUpUrl={signUpUrl}
            signInFallbackRedirectUrl={signInFallbackRedirectUrl}
            signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
          >
            {layoutContent}
          </ClerkProvider>
        ) : (
          layoutContent
        )}
      </body>
    </html>
  );
}
```

---

## Change 2: `src/components/landing/LandingNav.tsx`

Seven discrete edits. Apply each one precisely using find-and-replace.

### 2a. Remove `aria-label="Navigation menu"` from mobile menu drawer

**Find (line 87):**
```
            aria-label="Navigation menu"
```

**Action:** Delete this entire line. The mobile menu `<div>` should go directly from `aria-modal="true"` to `ref={menuRef}`.

### 2b. Restore mobile CTA button gradient color

**Find (line 104):**
```
              className="mt-auto w-full bg-gradient-to-br from-primary-700 to-primary-800 text-white border-none px-6 py-4 rounded-[10px] font-semibold text-[15px] text-center"
```

**Replace with:**
```
              className="mt-auto w-full bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-6 py-4 rounded-[10px] font-semibold text-[15px] text-center"
```

### 2c. Restore mobile CTA button text

**Find (line 106):**
```
              Create a free Dreamboard
```

**Replace with:**
```
              Create a Free Dreamboard
```

### 2d. Restore desktop nav link color

**Find (line 129):**
```
              className="text-[#757575] no-underline font-medium text-[15px] hover:text-[#3D3D3D] transition-colors"
```

**Replace with:**
```
              className="text-[#777] no-underline font-medium text-[15px] hover:text-[#3D3D3D] transition-colors"
```

### 2e. Restore desktop primary CTA button gradient and shadow

**Find (line 136):**
```
            className="bg-gradient-to-br from-primary-700 to-primary-800 text-white border-none px-7 py-3.5 rounded-[10px] font-semibold text-[15px] shadow-[0_4px_16px_rgba(15,118,110,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,118,110,0.4)] active:translate-y-0"
```

**Replace with:**
```
            className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-7 py-3.5 rounded-[10px] font-semibold text-[15px] shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0"
```

### 2f. Restore desktop primary CTA button text

**Find (line 138):**
```
            Create a free Dreamboard
```

**Replace with:**
```
            Create a Free Dreamboard
```

### 2g. Restore desktop secondary (Login) button colors

**Find (line 142):**
```
            className="bg-transparent text-[#0F766E] border-2 border-[#0F766E] px-6 py-3 rounded-[10px] font-semibold text-[15px] transition-all hover:bg-[#0F766E] hover:text-white"
```

**Replace with:**
```
            className="bg-transparent text-[#5A8E78] border-2 border-[#5A8E78] px-6 py-3 rounded-[10px] font-semibold text-[15px] transition-all hover:bg-[#5A8E78] hover:text-white"
```

### 2h. Restore hamburger button classes

**Find (line 150):**
```
          className="lg:hidden z-[60] flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-[5px] border-none bg-transparent p-2"
```

**Replace with:**
```
          className="lg:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2 z-[60]"
```

---

## Change 3: `src/components/landing/LandingDreamBoard.tsx`

One edit.

### 3a. Restore "Dreamboard" text (single word)

**Find (line 43):**
```
            Mia&apos;s Dreamboard
```

**Replace with:**
```
            Mia&apos;s Dreamboard
```

---

## Change 4: `src/components/landing/LandingPage.tsx`

Two edits.

### 4a. Restore bottom-of-page CTA button gradient and shadow

**Find (line 66):**
```
          className="bg-gradient-to-br from-primary-700 to-primary-800 text-white border-none px-7 py-4 md:px-9 md:py-[18px] rounded-xl font-semibold text-[15px] md:text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(15,118,110,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,118,110,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(15,118,110,0.3)]"
```

**Replace with:**
```
          className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-7 py-4 md:px-9 md:py-[18px] rounded-xl font-semibold text-[15px] md:text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(107,158,136,0.3)]"
```

### 4b. Restore bottom-of-page CTA button text

**Find (line 68):**
```
          Create your free Dreamboard
```

**Replace with:**
```
          Create Your Free Dreamboard
```

---

## Change 5: `src/components/landing/LandingCTA.tsx`

Two edits.

### 5a. Restore CTA button gradient and shadow

**Find (line 8):**
```
        className="bg-gradient-to-br from-primary-700 to-primary-800 text-white border-none px-7 py-4 md:px-9 md:py-[18px] rounded-xl font-semibold text-[15px] md:text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(15,118,110,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,118,110,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(15,118,110,0.3)]"
```

**Replace with:**
```
        className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-7 py-4 md:px-9 md:py-[18px] rounded-xl font-semibold text-[15px] md:text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(107,158,136,0.3)]"
```

### 5b. Restore CTA button text

**Find (line 10):**
```
        Create your free Dreamboard
```

**Replace with:**
```
        Create Your Free Dreamboard
```

---

## Verification checklist

After all edits are applied, verify:

- [ ] `next/font/google` import is present in `layout.tsx`
- [ ] All five font constants (`outfit`, `fraunces`, `dmSans`, `dmSerifDisplay`, `nunito`) are declared
- [ ] `<html>` tag includes the className with all five font variables
- [ ] No `<a href="#main-content">` skip-to-content link in `layout.tsx`
- [ ] No `<noscript>` block in `layout.tsx`
- [ ] Metadata title reads "Gifta - Everyone Chips In. One Perfect Gift."
- [ ] Metadata description uses "Dreamboard" (one word) and includes the longer text with em-dash
- [ ] All CTA buttons use `from-[#6B9E88] to-[#5A8E78]` gradients (not `from-primary-700 to-primary-800`)
- [ ] All CTA button shadow rgba values use `107,158,136` (not `15,118,110`)
- [ ] Login button uses `#5A8E78` for text, border, and hover bg (not `#0F766E`)
- [ ] Nav link color is `#777` (not `#757575`)
- [ ] All button text reads "Dreamboard" (one word, capital D)
- [ ] "Create a Free Dreamboard" uses capital F in "Free" and capital D in "Dreamboard"
- [ ] "Create Your Free Dreamboard" uses capital Y, F, D
- [ ] Hamburger button class includes `cursor-pointer` and does NOT include `min-h-[44px] min-w-[44px] items-center justify-center`
- [ ] No `aria-label="Navigation menu"` on the mobile menu drawer div
- [ ] The project builds successfully with `npm run build` (or equivalent)
- [ ] Homepage renders in a browser with all fonts visibly loading (Outfit for body, DM Serif Display for headings, Nunito for logo, etc.)

---

## Color mapping summary (quick reference)

| Element | Current (wrong) | Original (correct) |
|---------|-----------------|---------------------|
| CTA button gradient from | `from-primary-700` | `from-[#6B9E88]` |
| CTA button gradient to | `to-primary-800` | `to-[#5A8E78]` |
| CTA shadow base rgba | `15,118,110` | `107,158,136` |
| Login button text/border | `#0F766E` | `#5A8E78` |
| Nav link color | `#757575` | `#777` |

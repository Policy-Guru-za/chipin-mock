import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

function luminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(normalized.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('C7 contrast guardrails', () => {
  it('keeps restored landing and shared button classes on expected stop colours', () => {
    const landingNav = readSource('src/components/landing/LandingNav.tsx');
    const landingCta = readSource('src/components/landing/LandingCTA.tsx');
    const landingPage = readSource('src/components/landing/LandingPage.tsx');
    const button = readSource('src/components/ui/button.tsx');

    expect(landingNav).toContain('from-[#6B9E88] to-[#5A8E78]');
    expect(landingNav).toContain('text-[#777]');
    expect(landingNav).toContain('text-[#5A8E78]');
    expect(landingCta).toContain('from-[#6B9E88] to-[#5A8E78]');
    expect(landingPage).toContain('from-[#6B9E88] to-[#5A8E78]');
    expect(button).toContain('from-primary-700 to-primary-800');
    expect(button).toContain('from-accent-700 to-[#9A3412]');
  });

  it('meets restored landing baseline for muted text and secondary action color', () => {
    expect(contrastRatio('#777777', '#FFFCF9')).toBeGreaterThanOrEqual(4.35);
    expect(contrastRatio('#5A8E78', '#FFFFFF')).toBeGreaterThanOrEqual(3.75);
  });

  it('meets restored landing gradient stop baseline with white text', () => {
    expect(contrastRatio('#FFFFFF', '#6B9E88')).toBeGreaterThanOrEqual(3.05);
    expect(contrastRatio('#FFFFFF', '#5A8E78')).toBeGreaterThanOrEqual(3.75);
  });

  it('meets AA for secondary button gradient stops with white text', () => {
    expect(contrastRatio('#FFFFFF', '#C2410C')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#FFFFFF', '#9A3412')).toBeGreaterThanOrEqual(4.5);
  });
});

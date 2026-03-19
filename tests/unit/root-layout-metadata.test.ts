import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('root layout metadata', () => {
  it('uses the uploaded gift icon for the root favicon', () => {
    const layout = readSource('src/app/layout.tsx');
    const faviconPath = resolve(process.cwd(), 'public/Logos/Gifta-favicon.png');

    expect(layout).toContain('icons: {');
    expect(layout).toContain("icon: '/Logos/Gifta-favicon.png'");
    expect(layout).toContain("shortcut: '/Logos/Gifta-favicon.png'");
    expect(layout).not.toContain('Untitled.png');
    expect(existsSync(faviconPath)).toBe(true);
    expect(statSync(faviconPath).size).toBeGreaterThan(0);
  });

  it('defines the homepage social metadata contract and generated share images', () => {
    const layout = readSource('src/app/layout.tsx');
    const opengraphImagePath = resolve(process.cwd(), 'src/app/opengraph-image.tsx');
    const twitterImagePath = resolve(process.cwd(), 'src/app/twitter-image.tsx');
    const imageHelper = readSource('src/lib/metadata/homepage-social-image.tsx');

    expect(layout).toContain("title: 'Gifta'");
    expect(layout).toContain("description: 'Birthday gifting, simplified.'");
    expect(layout).toContain("siteName: 'Gifta'");
    expect(layout).not.toContain('/og-image.png');
    expect(existsSync(opengraphImagePath)).toBe(true);
    expect(existsSync(twitterImagePath)).toBe(true);
    expect(imageHelper).toContain("export const HOMEPAGE_SOCIAL_IMAGE_ALT = 'Gifta social share preview'");
    expect(imageHelper).toContain('width: 1200');
    expect(imageHelper).toContain('height: 630');
  });
});

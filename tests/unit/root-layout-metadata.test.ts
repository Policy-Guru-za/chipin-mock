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
});

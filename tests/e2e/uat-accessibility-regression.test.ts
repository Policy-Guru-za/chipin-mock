import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const collectSourceFiles = (rootPath: string): string[] => {
  const results: string[] = [];
  for (const entry of readdirSync(rootPath)) {
    const fullPath = join(rootPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
};

describe('UAT accessibility regression (UAT-12)', () => {
  it('keeps root main landmarks in app layout baseline', () => {
    const layout = readSource('src/app/layout.tsx');
    const guestLayout = readSource('src/app/(guest)/layout.tsx');
    const hostLayout = readSource('src/app/(host)/layout.tsx');
    const adminLayout = readSource('src/app/(admin)/layout.tsx');

    expect(layout).not.toContain('href="#main-content"');
    expect(layout).not.toContain('<noscript>');
    expect(guestLayout).toContain('id="main-content"');
    expect(hostLayout).toContain('id="main-content"');
    expect(adminLayout).toContain('id="main-content"');
  });

  it('keeps fallback route surfaces present', () => {
    const appError = readSource('src/app/error.tsx');
    const notFound = readSource('src/app/not-found.tsx');
    const guestError = readSource('src/app/(guest)/error.tsx');
    const hostError = readSource('src/app/(host)/error.tsx');
    const adminError = readSource('src/app/(admin)/error.tsx');

    expect(appError).toContain('export default');
    expect(notFound).toContain('export default');
    expect(guestError).toContain('export default');
    expect(hostError).toContain('export default');
    expect(adminError).toContain('export default');
  });

  it('keeps critical a11y unit guards for aria, touch targets, and contrast', () => {
    const a11y = readSource('tests/unit/accessibility.test.tsx');
    const contrast = readSource('tests/unit/colour-contrast.test.ts');
    const button = readSource('tests/unit/button.test.tsx');

    expect(a11y).toContain('aria-label');
    expect(a11y).toContain('role="alert"');
    expect(contrast).toContain('contrast');
    expect(button).toContain('h-11');
  });

  it('keeps Gifta brand constants and blocks legacy ChipIn copy drift', () => {
    const constants = readSource('src/lib/constants.ts');
    const email = readSource('src/lib/integrations/email.ts');
    expect(constants).toContain('APP_NAME');
    expect(constants).toContain('Gifta');
    expect(email).toContain('Gifta');

    const uiRoots = ['src/components', 'src/app'].map((path) => join(process.cwd(), path));
    const allFiles = uiRoots.flatMap((path) => collectSourceFiles(path));
    const offenders = allFiles.filter((path) => readFileSync(path, 'utf8').includes('ChipIn'));
    expect(offenders).toEqual([]);
  });
});

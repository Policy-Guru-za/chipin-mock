import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('google analytics layout wiring', () => {
  it('mounts the GA tag on the approved non-admin route surfaces', () => {
    const marketingLayout = readSource('src/app/(marketing)/layout.tsx');
    const guestLayout = readSource('src/app/(guest)/layout.tsx');
    const hostLayout = readSource('src/app/(host)/layout.tsx');
    const signInPage = readSource('src/app/sign-in/[[...sign-in]]/page.tsx');
    const signUpPage = readSource('src/app/sign-up/[[...sign-up]]/page.tsx');

    expect(marketingLayout).toContain('GoogleAnalyticsTag');
    expect(guestLayout).toContain('GoogleAnalyticsTag');
    expect(hostLayout).toContain('GoogleAnalyticsTag');
    expect(signInPage).toContain('GoogleAnalyticsTag');
    expect(signUpPage).toContain('GoogleAnalyticsTag');
  });

  it('keeps admin layout free of the GA tag mount', () => {
    const adminLayout = readSource('src/app/(admin)/layout.tsx');

    expect(adminLayout).not.toContain('GoogleAnalyticsTag');
  });
});

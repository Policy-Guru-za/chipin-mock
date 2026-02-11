import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('auth-aware navigation and user avatar menu', () => {
  it('renders auth-aware controls on landing navigation', () => {
    const landingNav = readSource('src/components/landing/LandingNav.tsx');
    const marketingPage = readSource('src/app/(marketing)/page.tsx');

    expect(marketingPage).toContain('getClerkConfigStatus().isEnabled');
    expect(marketingPage).toContain('<LandingPage isClerkEnabled={isClerkEnabled} />');
    expect(landingNav).toContain('SignedOut');
    expect(landingNav).toContain('SignedIn');
    expect(landingNav).toContain('href="/sign-in"');
    expect(landingNav).not.toContain('Login');
  });

  it('uses shared avatar menu in shared and landing navs', () => {
    const header = readSource('src/components/layout/Header.tsx');
    const mobileNav = readSource('src/components/layout/MobileNav.tsx');
    const landingNav = readSource('src/components/landing/LandingNav.tsx');

    expect(header).toContain('<UserAvatarMenu afterSignOutUrl="/" />');
    expect(mobileNav).toContain('<UserAvatarMenu afterSignOutUrl="/" />');
    expect(landingNav).toContain('<UserAvatarMenu afterSignOutUrl="/" />');
  });

  it('includes logical options in the user avatar menu', () => {
    const userAvatarMenu = readSource('src/components/auth/UserAvatarMenu.tsx');

    expect(userAvatarMenu).toContain('label="Dashboard"');
    expect(userAvatarMenu).toContain('href="/dashboard"');
    expect(userAvatarMenu).toContain('label="Create Dreamboard"');
    expect(userAvatarMenu).toContain('href="/create/child"');
    expect(userAvatarMenu).toContain('label="manageAccount"');
    expect(userAvatarMenu).toContain('label="signOut"');
  });
});

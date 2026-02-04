import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getClerkConfigStatus, getClerkUrls } from '../../src/lib/auth/clerk-config';

const ORIGINAL_ENV = { ...process.env };

describe('clerk config helpers', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('marks Clerk as enabled when both keys are present', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test';
    process.env.CLERK_SECRET_KEY = 'sk_test';

    expect(getClerkConfigStatus()).toEqual({
      hasPublishableKey: true,
      hasSecretKey: true,
      isEnabled: true,
      publishableKey: 'pk_test',
    });
  });

  it('treats blank keys as missing', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '   ';
    process.env.CLERK_SECRET_KEY = '';

    expect(getClerkConfigStatus()).toEqual({
      hasPublishableKey: false,
      hasSecretKey: false,
      isEnabled: false,
      publishableKey: '   ',
    });
  });

  it('returns default URLs when env vars are not set', () => {
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL;
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL;

    expect(getClerkUrls()).toEqual({
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      signInFallbackRedirectUrl: '/create/child',
      signUpFallbackRedirectUrl: '/create/child',
    });
  });

  it('returns custom URLs when env vars are provided', () => {
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/custom/sign-in';
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = '/custom/sign-up';
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL = '/welcome';
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL = '/welcome';

    expect(getClerkUrls()).toEqual({
      signInUrl: '/custom/sign-in',
      signUpUrl: '/custom/sign-up',
      signInFallbackRedirectUrl: '/welcome',
      signUpFallbackRedirectUrl: '/welcome',
    });
  });
});

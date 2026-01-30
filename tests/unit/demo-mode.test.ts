import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = {
  DEMO_MODE: process.env.DEMO_MODE,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
};

const restoreEnv = () => {
  if (ORIGINAL_ENV.DEMO_MODE === undefined) {
    delete process.env.DEMO_MODE;
  } else {
    process.env.DEMO_MODE = ORIGINAL_ENV.DEMO_MODE;
  }

  if (ORIGINAL_ENV.NEXT_PUBLIC_DEMO_MODE === undefined) {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
  } else {
    process.env.NEXT_PUBLIC_DEMO_MODE = ORIGINAL_ENV.NEXT_PUBLIC_DEMO_MODE;
  }
};

afterEach(() => {
  restoreEnv();
  vi.resetModules();
});

describe('isDemoMode', () => {
  it('returns true when NEXT_PUBLIC_DEMO_MODE is true', async () => {
    delete process.env.DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

    const { isDemoMode } = await import('../../src/lib/demo/index');

    expect(isDemoMode()).toBe(true);
  });

  it('returns false when demo flags are false', async () => {
    process.env.DEMO_MODE = 'false';
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

    const { isDemoMode } = await import('../../src/lib/demo/index');

    expect(isDemoMode()).toBe(false);
  });
});

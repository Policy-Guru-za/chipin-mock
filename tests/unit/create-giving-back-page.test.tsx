/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

describe('Create Giving Back Page', () => {
  it('redirects the legacy giving-back route to /create/voucher', async () => {
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    const Page = (await import('@/app/(host)/create/giving-back/page')).default;

    expect(() => Page()).toThrow('REDIRECT:/create/voucher');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/voucher');
  });
});

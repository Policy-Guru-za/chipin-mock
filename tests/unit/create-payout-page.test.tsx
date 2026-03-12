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

describe('Create Payout Page', () => {
  it('redirects the legacy payout route to /create/voucher', async () => {
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    const Page = (await import('@/app/(host)/create/payout/page')).default;

    expect(() => Page()).toThrow('REDIRECT:/create/voucher');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/voucher');
  });
});

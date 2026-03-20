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

describe('Create Voucher Page', () => {
  it('redirects the legacy voucher route to /create/payout', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('REDIRECT:/create/payout');
    });

    const Page = (await import('@/app/(host)/create/voucher/page')).default;

    expect(() => Page()).toThrow('REDIRECT:/create/payout');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/payout');
  });
});

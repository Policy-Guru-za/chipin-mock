import { afterEach, describe, expect, it, vi } from 'vitest';

const loadModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/giving-back/actions');
};

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('saveGivingBackAction', () => {
  it('clears charity state and redirects legacy submissions to payout setup', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      updateDreamBoardDraft,
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');

    await expect(saveGivingBackAction(formData)).rejects.toThrow('REDIRECT:/create/payout');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      charityEnabled: false,
      charityId: undefined,
      charitySplitType: undefined,
      charityPercentageBps: undefined,
      charityThresholdCents: undefined,
    });
  });
});

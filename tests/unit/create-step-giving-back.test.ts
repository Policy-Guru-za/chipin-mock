import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const loadModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/giving-back/actions');
};

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  goalCents: 50000,
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  campaignEndDate: '2026-06-12',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.unmock('@/lib/charities');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('saveGivingBackAction', () => {
  it('saves disabled state and redirects to payout', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft,
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();

    await expect(saveGivingBackAction(formData)).rejects.toThrow('REDIRECT:/create/payout');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      charityEnabled: false,
      charityId: undefined,
      charitySplitType: undefined,
      charityPercentageBps: undefined,
      charityThresholdCents: undefined,
    });
  });

  it('saves percentage split as basis points and redirects', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft,
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');
    formData.set('charitySplitType', 'percentage');
    formData.set('charityPercentage', '25');

    await expect(saveGivingBackAction(formData)).rejects.toThrow('REDIRECT:/create/payout');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      charityEnabled: true,
      charityId: '00000000-0000-4000-8000-000000000001',
      charitySplitType: 'percentage',
      charityPercentageBps: 2500,
      charityThresholdCents: undefined,
    });
  });

  it('saves threshold split as cents and redirects', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft,
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');
    formData.set('charitySplitType', 'threshold');
    formData.set('charityThresholdAmount', '150');

    await expect(saveGivingBackAction(formData)).rejects.toThrow('REDIRECT:/create/payout');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      charityEnabled: true,
      charityId: '00000000-0000-4000-8000-000000000001',
      charitySplitType: 'threshold',
      charityPercentageBps: undefined,
      charityThresholdCents: 15000,
    });
  });

  it('returns charity_required when enabled and charity is missing', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charitySplitType', 'percentage');
    formData.set('charityPercentage', '25');

    await expect(saveGivingBackAction(formData)).rejects.toThrow(
      'REDIRECT:/create/giving-back?error=charity_required'
    );
  });

  it('returns split_required when enabled and split type is missing', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');

    await expect(saveGivingBackAction(formData)).rejects.toThrow(
      'REDIRECT:/create/giving-back?error=split_required'
    );
  });

  it('returns percentage_range when percentage is out of range', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');
    formData.set('charitySplitType', 'percentage');
    formData.set('charityPercentage', '4');

    await expect(saveGivingBackAction(formData)).rejects.toThrow(
      'REDIRECT:/create/giving-back?error=percentage_range'
    );
  });

  it('returns threshold_range when threshold is out of range', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveGivingBackAction } = await loadModule();
    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');
    formData.set('charitySplitType', 'threshold');
    formData.set('charityThresholdAmount', '49');

    await expect(saveGivingBackAction(formData)).rejects.toThrow(
      'REDIRECT:/create/giving-back?error=threshold_range'
    );
  });

  it('renders fallback continue form when no active charities exist', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/charities', () => ({
      listActiveCharities: vi.fn(async () => []),
    }));

    const givingBackPageModule = await import('@/app/(host)/create/giving-back/page');
    const element = await givingBackPageModule.default({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('No active charities are configured.');
    expect(html).toContain('Continue to payout setup');
  });
});

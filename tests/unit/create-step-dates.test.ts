import { afterEach, describe, expect, it, vi } from 'vitest';

const loadModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/dates/actions');
};

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const toJohannesburgIso = (date: string, time = '12:00') =>
  new Date(`${date}T${time}:00+02:00`).toISOString();

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  goalCents: 50000,
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('saveDatesAction', () => {
  it('saves valid dates and redirects to giving-back', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const requireHostAuth = vi.fn(async () => ({ hostId: 'host-1' }));
    const getDreamBoardDraft = vi.fn(async () => makeDraft());
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth }));
    vi.doMock('@/lib/dream-boards/draft', () => ({ getDreamBoardDraft, updateDreamBoardDraft }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(22));
    formData.set('campaignEndDate', addDays(22));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/giving-back');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      birthdayDate: addDays(20),
      partyDate: addDays(22),
      campaignEndDate: addDays(22),
      partyDateTime: null,
    });
  });

  it('returns birthday_date when birthday is in the past', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(-1));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(2));
    formData.set('campaignEndDate', addDays(2));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/dates?error=birthday_date');
  });

  it('returns party_date when party date is out of range', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(220));
    formData.set('campaignEndDate', addDays(220));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/dates?error=party_date');
  });

  it('returns campaign_end when campaign end is after party', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(25));
    formData.set('campaignEndDate', addDays(26));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/dates?error=campaign_end');
  });

  it('returns birthday_order when party date is before birthday', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(19));
    formData.set('campaignEndDate', addDays(19));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/dates?error=birthday_order');
  });

  it('defaults party and campaign dates to birthday when partyDateEnabled is false', async () => {
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

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/giving-back');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      birthdayDate: addDays(20),
      partyDate: addDays(20),
      campaignEndDate: addDays(20),
      partyDateTime: null,
    });
  });

  it('stores partyDateTime with noon fallback when party date is set without time', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);
    const partyDateTimeDate = addDays(30);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft,
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(22));
    formData.set('campaignEndDate', addDays(22));
    formData.set('partyDateTimeDate', partyDateTimeDate);

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/giving-back');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      birthdayDate: addDays(20),
      partyDate: addDays(22),
      campaignEndDate: addDays(22),
      partyDateTime: toJohannesburgIso(partyDateTimeDate),
    });
  });

  it('returns party_datetime_range when party date-time is outside 6 months', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('birthdayDate', addDays(20));
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(22));
    formData.set('campaignEndDate', addDays(22));
    formData.set('partyDateTimeDate', addDays(220));
    formData.set('partyDateTimeTime', '14:30');

    await expect(saveDatesAction(formData)).rejects.toThrow(
      'REDIRECT:/create/dates?error=party_datetime_range'
    );
  });

  it('returns invalid on schema validation failure', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { saveDatesAction } = await loadModule();
    const formData = new FormData();
    formData.set('partyDateEnabled', 'on');
    formData.set('partyDate', addDays(2));
    formData.set('campaignEndDate', addDays(2));

    await expect(saveDatesAction(formData)).rejects.toThrow('REDIRECT:/create/dates?error=invalid');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const cacheMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
}));

const queryMocks = vi.hoisted(() => ({
  getDashboardDetailExpanded: vi.fn(),
  updateDreamBoardForHost: vi.fn(),
}));

const blobMocks = vi.hoisted(() => {
  class MockUploadChildPhotoError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
    }
  }

  return {
    uploadChildPhoto: vi.fn(),
    deleteChildPhoto: vi.fn(),
    UploadChildPhotoError: MockUploadChildPhotoError,
  };
});

vi.mock('next/cache', () => cacheMocks);
vi.mock('@/lib/auth/clerk-wrappers', () => authMocks);
vi.mock('@/lib/host/queries', () => queryMocks);
vi.mock('@/lib/integrations/blob', () => blobMocks);

import { updateDreamBoard } from '@/app/(host)/dashboard/[id]/actions';

const BOARD_ID = '00000000-0000-4000-8000-000000000001';

const makeBoard = (
  status: string,
  overrides: Partial<{
    partyDate: string;
    partyDateTime: Date | null;
    campaignEndDate: string | null;
  }> = {}
) => ({
  id: BOARD_ID,
  hostId: 'host-1',
  slug: 'maya-birthday',
  childName: 'Maya',
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/gift.jpg',
  partyDate: '2099-06-12',
  partyDateTime: new Date('2099-06-12T07:30:00.000Z'),
  campaignEndDate: '2099-06-10',
  message: 'Hello',
  status,
  goalCents: 50000,
  payoutMethod: 'karri_card' as const,
  karriCardHolderName: 'Parent',
  bankAccountHolder: null,
  payoutEmail: 'parent@example.com',
  charityEnabled: false,
  charityName: null,
  totalRaisedCents: 0,
  totalFeeCents: 0,
  totalCharityCents: 0,
  contributionCount: 0,
  messageCount: 0,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
});

describe('updateDreamBoard action', () => {
  it('rejects edits for non-editable board statuses', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue(makeBoard('closed'));

    const formData = new FormData();
    formData.set('boardId', BOARD_ID);
    formData.set('childName', 'Maya Updated');

    const result = await updateDreamBoard(formData);

    expect(result).toEqual({
      success: false,
      error: 'This Dreamboard can no longer be edited.',
    });
    expect(queryMocks.updateDreamBoardForHost).not.toHaveBeenCalled();
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('allows edits for funded boards', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue(makeBoard('funded'));
    queryMocks.updateDreamBoardForHost.mockResolvedValue(true);

    const formData = new FormData();
    formData.set('boardId', BOARD_ID);
    formData.set('childName', 'Maya Updated');

    const result = await updateDreamBoard(formData);

    expect(result).toEqual({ success: true });
    expect(queryMocks.updateDreamBoardForHost).toHaveBeenCalledWith(
      BOARD_ID,
      'host-1',
      expect.objectContaining({
        childName: 'Maya Updated',
      })
    );
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith(`/dashboard/${BOARD_ID}`);
  });

  it('rebases existing partyDateTime when partyDate moves forward', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue(makeBoard('funded'));
    queryMocks.updateDreamBoardForHost.mockResolvedValue(true);

    const formData = new FormData();
    formData.set('boardId', BOARD_ID);
    formData.set('partyDate', '2099-06-20');

    const result = await updateDreamBoard(formData);

    expect(result).toEqual({ success: true });
    expect(queryMocks.updateDreamBoardForHost).toHaveBeenCalledWith(
      BOARD_ID,
      'host-1',
      expect.objectContaining({
        partyDate: '2099-06-20',
        partyDateTime: '2099-06-20T07:30:00.000Z',
      })
    );
  });

  it('does not mutate partyDateTime when partyDate is unchanged', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue(makeBoard('funded'));
    queryMocks.updateDreamBoardForHost.mockResolvedValue(true);

    const formData = new FormData();
    formData.set('boardId', BOARD_ID);
    formData.set('childName', 'Maya Updated');

    const result = await updateDreamBoard(formData);

    expect(result).toEqual({ success: true });
    expect(queryMocks.updateDreamBoardForHost).toHaveBeenCalledTimes(1);
    expect(queryMocks.updateDreamBoardForHost.mock.calls[0]?.[2]).not.toHaveProperty(
      'partyDateTime'
    );
  });

  it('keeps partyDateTime null when partyDate changes without an existing time', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue(
      makeBoard('funded', { partyDateTime: null })
    );
    queryMocks.updateDreamBoardForHost.mockResolvedValue(true);

    const formData = new FormData();
    formData.set('boardId', BOARD_ID);
    formData.set('partyDate', '2099-06-20');

    const result = await updateDreamBoard(formData);

    expect(result).toEqual({ success: true });
    expect(queryMocks.updateDreamBoardForHost).toHaveBeenCalledWith(
      BOARD_ID,
      'host-1',
      expect.objectContaining({
        partyDate: '2099-06-20',
        partyDateTime: null,
      })
    );
  });
});

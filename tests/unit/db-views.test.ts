import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

import { getDreamBoardWithTotals, getExpiringDreamBoards } from '@/lib/db/views';

describe('db views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns board row when dream board exists', async () => {
    const row = {
      id: 'db_1',
      slug: 'maya-board',
      childName: 'Maya',
      childPhotoUrl: 'https://example.com/maya.jpg',
      partyDate: new Date('2026-05-10T00:00:00.000Z'),
      giftName: 'Bike',
      giftImageUrl: 'https://example.com/bike.jpg',
      giftImagePrompt: null,
      payoutMethod: 'karri_card' as const,
      goalCents: 200000,
      payoutEmail: 'host@example.com',
      message: null,
      status: 'active',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      raisedCents: 50000,
      contributionCount: 3,
    };

    dbMock.execute.mockResolvedValueOnce({ rows: [row] });

    const result = await getDreamBoardWithTotals('db_1');

    expect(result).toEqual(row);
    expect(dbMock.execute).toHaveBeenCalledTimes(1);
  });

  it('returns null when dream board view has no rows', async () => {
    dbMock.execute.mockResolvedValueOnce({ rows: [] });

    const result = await getDreamBoardWithTotals('missing');

    expect(result).toBeNull();
  });

  it('fetches expiring dream boards using default limit', async () => {
    const rows = [
      {
        id: 'db_2',
        slug: 'liam-board',
        childName: 'Liam',
        partyDate: new Date('2026-06-01T00:00:00.000Z'),
        status: 'active',
      },
    ];

    dbMock.execute.mockResolvedValueOnce({ rows });

    const result = await getExpiringDreamBoards();

    expect(result).toEqual(rows);
    expect(dbMock.execute).toHaveBeenCalledTimes(1);
  });
});

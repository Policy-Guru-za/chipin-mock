import { kvAdapter } from '@/lib/demo/kv-adapter';

import { getDreamBoardBySlug, getDreamBoardSlugById } from '@/lib/db/queries';

const DREAM_BOARD_CACHE_TTL_SECONDS = 5 * 60;

const dreamBoardCacheKey = (slug: string) => `dream-board:${slug}`;

type DreamBoardRecord = Awaited<ReturnType<typeof getDreamBoardBySlug>>;
type HydratedDreamBoardRecord = DreamBoardRecord extends null
  ? null
  : Omit<NonNullable<DreamBoardRecord>, 'createdAt' | 'updatedAt'> & {
      createdAt: Date;
      updatedAt: Date;
    };

const hydrateDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const hydrateDreamBoard = (board: DreamBoardRecord): HydratedDreamBoardRecord => {
  if (!board) return board;

  return {
    ...board,
    createdAt: hydrateDate(board.createdAt),
    updatedAt: hydrateDate(board.updatedAt),
  };
};

export const getCachedDreamBoardBySlug = async (
  slug: string
): Promise<HydratedDreamBoardRecord> => {
  const cached = await kvAdapter.get<DreamBoardRecord>(dreamBoardCacheKey(slug));
  if (cached) {
    return hydrateDreamBoard(cached);
  }

  const board = await getDreamBoardBySlug(slug);
  if (board) {
    await kvAdapter.set(dreamBoardCacheKey(slug), board, { ex: DREAM_BOARD_CACHE_TTL_SECONDS });
  }

  return hydrateDreamBoard(board);
};

export const invalidateDreamBoardCacheBySlug = async (slug: string) => {
  await kvAdapter.del(dreamBoardCacheKey(slug));
};

export const invalidateDreamBoardCacheById = async (dreamBoardId: string) => {
  const slug = await getDreamBoardSlugById(dreamBoardId);
  if (!slug) return;

  await invalidateDreamBoardCacheBySlug(slug);
};

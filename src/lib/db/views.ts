import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

export type DreamBoardWithTotals = {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  partyDate: Date;
  giftName: string;
  giftImageUrl: string;
  giftImagePrompt: string | null;
  payoutMethod: 'karri_card' | 'bank';
  goalCents: number;
  payoutEmail: string;
  message: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  raisedCents: number;
  contributionCount: number;
};

export type ExpiringDreamBoard = {
  id: string;
  slug: string;
  childName: string;
  partyDate: Date;
  status: string;
};

export const getDreamBoardWithTotals = async (id: string): Promise<DreamBoardWithTotals | null> => {
  const result = await db.execute<DreamBoardWithTotals>(sql`
    SELECT
      id,
      slug,
      child_name as "childName",
      child_photo_url as "childPhotoUrl",
      party_date as "partyDate",
      gift_name as "giftName",
      gift_image_url as "giftImageUrl",
      gift_image_prompt as "giftImagePrompt",
      payout_method as "payoutMethod",
      goal_cents as "goalCents",
      payout_email as "payoutEmail",
      message,
      status,
      created_at as "createdAt",
      updated_at as "updatedAt",
      raised_cents as "raisedCents",
      contribution_count as "contributionCount"
    FROM dream_boards_with_totals
    WHERE id = ${id}
    LIMIT 1
  `);

  return result.rows[0] ?? null;
};

export const getExpiringDreamBoards = async (limit = 6): Promise<ExpiringDreamBoard[]> => {
  const result = await db.execute<ExpiringDreamBoard>(sql`
    SELECT
      id,
      slug,
      child_name as "childName",
      party_date as "partyDate",
      status
    FROM expiring_dream_boards
    ORDER BY party_date ASC
    LIMIT ${limit}
  `);

  return result.rows;
};

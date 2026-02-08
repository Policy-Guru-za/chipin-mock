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
      db.id,
      db.slug,
      db.child_name as "childName",
      db.child_photo_url as "childPhotoUrl",
      db.party_date as "partyDate",
      db.gift_name as "giftName",
      db.gift_image_url as "giftImageUrl",
      db.gift_image_prompt as "giftImagePrompt",
      db.payout_method as "payoutMethod",
      db.goal_cents as "goalCents",
      db.payout_email as "payoutEmail",
      db.message,
      db.status,
      db.created_at as "createdAt",
      db.updated_at as "updatedAt",
      COALESCE(SUM(c.amount_cents) FILTER (WHERE c.payment_status = 'completed'), 0) as "raisedCents",
      COUNT(c.id) FILTER (WHERE c.payment_status = 'completed') as "contributionCount"
    FROM dream_boards db
    LEFT JOIN contributions c ON c.dream_board_id = db.id
    WHERE db.id = ${id}
    GROUP BY db.id
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

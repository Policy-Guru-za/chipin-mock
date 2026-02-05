import { serializeGiftData } from '@/lib/api/gifts';

type DreamBoardApiRecord = {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  partyDate: Date | string | null;
  giftName: string | null;
  giftImageUrl: string | null;
  giftImagePrompt: string | null;
  payoutMethod: 'karri_card' | 'bank';
  goalCents: number;
  raisedCents: number;
  message: string | null;
  status: string;
  contributionCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const toDateOnly = (value: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().split('T')[0];
};

const toIsoString = (value: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
};

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

/** Serialize a dream board record into the public API response shape. */
export const serializeDreamBoard = (board: DreamBoardApiRecord, baseUrl: string) => {
  const giftData = serializeGiftData({
    giftName: board.giftName,
    giftImageUrl: board.giftImageUrl,
    giftImagePrompt: board.giftImagePrompt,
  });
  if (!giftData) return null;

  const publicUrl = `${ensureTrailingSlash(baseUrl)}${board.slug}`;

  return {
    id: board.id,
    slug: board.slug,
    child_name: board.childName,
    child_photo_url: board.childPhotoUrl,
    party_date: toDateOnly(board.partyDate),
    gift_data: giftData,
    payout_method: board.payoutMethod,
    goal_cents: board.goalCents,
    raised_cents: board.raisedCents,
    message: board.message,
    status: board.status,
    display_mode: 'gift',
    contribution_count: board.contributionCount,
    public_url: publicUrl,
    created_at: toIsoString(board.createdAt),
    updated_at: toIsoString(board.updatedAt),
  };
};

import { serializeGiftData, serializeOverflowGiftData } from '@/lib/api/gifts';
import { getOverflowState } from '@/lib/dream-boards/overflow';

type DreamBoardApiRecord = {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  birthdayDate: Date | string | null; // v2.0: nullable during migration
  giftType: 'takealot_product' | 'philanthropy' | null; // v2.0: nullable during migration
  giftData: unknown;
  payoutMethod: 'takealot_gift_card' | 'karri_card_topup' | 'philanthropy_donation' | 'karri_card';
  overflowGiftData: unknown | null;
  goalCents: number;
  raisedCents: number;
  message: string | null;
  deadline: Date | string | null; // v2.0: nullable during migration
  status: string;
  contributionCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  // v2.0 fields (optional during migration)
  partyDate?: Date | string | null;
  giftName?: string | null;
  giftImageUrl?: string | null;
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
  const giftData = serializeGiftData({ giftType: board.giftType, giftData: board.giftData });
  if (!giftData) return null;

  const overflowGiftData = serializeOverflowGiftData(board.overflowGiftData);
  const { showCharityOverflow } = getOverflowState({
    raisedCents: board.raisedCents,
    goalCents: board.goalCents,
    giftType: board.giftType,
    overflowGiftData: overflowGiftData
      ? {
          causeId: overflowGiftData.cause_id,
          causeName: overflowGiftData.cause_name,
          impactDescription: overflowGiftData.impact_description,
        }
      : null,
  });

  const publicUrl = `${ensureTrailingSlash(baseUrl)}${board.slug}`;
  const overflowCents = Math.max(0, board.raisedCents - board.goalCents);

  return {
    id: board.id,
    slug: board.slug,
    child_name: board.childName,
    child_photo_url: board.childPhotoUrl,
    birthday_date: toDateOnly(board.birthdayDate),
    gift_type: board.giftType,
    gift_data: giftData,
    payout_method: board.payoutMethod,
    overflow_gift_data: overflowGiftData,
    goal_cents: board.goalCents,
    raised_cents: board.raisedCents,
    overflow_cents: overflowCents,
    message: board.message,
    deadline: toIsoString(board.deadline),
    status: board.status,
    display_mode: showCharityOverflow ? 'charity' : 'gift',
    contribution_count: board.contributionCount,
    public_url: publicUrl,
    created_at: toIsoString(board.createdAt),
    updated_at: toIsoString(board.updatedAt),
  };
};

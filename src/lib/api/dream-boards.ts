import { serializeGiftData } from '@/lib/api/gifts';

type DreamBoardApiRecord = {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  childAge?: number | null;
  birthdayDate?: Date | string | null;
  partyDate: Date | string | null;
  campaignEndDate?: Date | string | null;
  giftName: string | null;
  giftDescription?: string | null;
  giftImageUrl: string | null;
  giftImagePrompt: string | null;
  payoutMethod: 'karri_card' | 'bank';
  karriCardHolderName?: string | null;
  bankName?: string | null;
  bankAccountLast4?: string | null;
  bankBranchCode?: string | null;
  bankAccountHolder?: string | null;
  payoutEmail?: string | null;
  charityEnabled?: boolean | null;
  charityId?: string | null;
  charitySplitType?: 'percentage' | 'threshold' | null;
  charityPercentageBps?: number | null;
  charityThresholdCents?: number | null;
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
    child_age: board.childAge ?? null,
    birthday_date: toDateOnly(board.birthdayDate ?? null),
    party_date: toDateOnly(board.partyDate),
    campaign_end_date: toDateOnly(board.campaignEndDate ?? null),
    gift_data: giftData,
    gift_description: board.giftDescription ?? null,
    payout_method: board.payoutMethod,
    karri_card_holder_name: board.karriCardHolderName ?? null,
    bank_name: board.bankName ?? null,
    bank_account_last4: board.bankAccountLast4 ?? null,
    bank_branch_code: board.bankBranchCode ?? null,
    bank_account_holder: board.bankAccountHolder ?? null,
    payout_email: board.payoutEmail ?? '',
    charity_enabled: board.charityEnabled ?? false,
    charity_id: board.charityId ?? null,
    charity_split_type: board.charitySplitType ?? null,
    charity_percentage_bps: board.charityPercentageBps ?? null,
    charity_threshold_cents: board.charityThresholdCents ?? null,
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

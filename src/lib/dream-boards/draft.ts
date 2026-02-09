import { kvAdapter } from '@/lib/demo/kv-adapter';

const DRAFT_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

export type DreamBoardDraftInput = {
  childName?: string;
  childAge?: number;
  birthdayDate?: string;
  partyDate?: string;
  campaignEndDate?: string;
  childPhotoUrl?: string;
  photoFilename?: string;
  giftName?: string;
  giftDescription?: string;
  giftIconId?: string;
  giftImageUrl?: string;
  giftImagePrompt?: string;
  goalCents?: number;
  payoutMethod?: 'karri_card' | 'bank';
  payoutEmail?: string;
  karriCardNumberEncrypted?: string;
  karriCardHolderName?: string;
  bankName?: string;
  bankAccountNumberEncrypted?: string;
  bankAccountLast4?: string;
  bankBranchCode?: string;
  bankAccountHolder?: string;
  charityEnabled?: boolean;
  charityId?: string;
  charitySplitType?: 'percentage' | 'threshold';
  charityPercentageBps?: number;
  charityThresholdCents?: number;
  hostWhatsAppNumber?: string;
  message?: string;
};

export type DreamBoardDraft = {
  childName?: string;
  childAge?: number;
  birthdayDate?: string;
  partyDate?: string;
  campaignEndDate?: string;
  childPhotoUrl?: string;
  photoFilename?: string;
  giftName?: string;
  giftDescription?: string;
  giftIconId?: string;
  giftImageUrl?: string;
  giftImagePrompt?: string;
  goalCents?: number;
  payoutMethod?: 'karri_card' | 'bank';
  payoutEmail?: string;
  karriCardNumberEncrypted?: string;
  karriCardHolderName?: string;
  bankName?: string;
  bankAccountNumberEncrypted?: string;
  bankAccountLast4?: string;
  bankBranchCode?: string;
  bankAccountHolder?: string;
  charityEnabled?: boolean;
  charityId?: string;
  charitySplitType?: 'percentage' | 'threshold';
  charityPercentageBps?: number;
  charityThresholdCents?: number;
  hostWhatsAppNumber?: string;
  message?: string;
  updatedAt: string;
};

const draftKey = (hostId: string) => `draft:host:${hostId}`;

export async function updateDreamBoardDraft(hostId: string, draft: DreamBoardDraftInput) {
  const existing = await getDreamBoardDraft(hostId);
  const payload: DreamBoardDraft = {
    ...(existing ?? {}),
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  await kvAdapter.set(draftKey(hostId), payload, { ex: DRAFT_EXPIRY_SECONDS });
  return payload;
}

export async function saveDreamBoardDraft(hostId: string, draft: DreamBoardDraftInput) {
  return updateDreamBoardDraft(hostId, draft);
}

export async function getDreamBoardDraft(hostId: string) {
  return kvAdapter.get<DreamBoardDraft>(draftKey(hostId));
}

export async function clearDreamBoardDraft(hostId: string) {
  await kvAdapter.del(draftKey(hostId));
}

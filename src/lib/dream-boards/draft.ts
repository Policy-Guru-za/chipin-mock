import { kvAdapter } from '@/lib/demo/kv-adapter';
import {
  DEFAULT_HOST_CREATE_PAYOUT_METHOD,
  type DreamBoardGiftPayoutMethod,
} from '@/lib/dream-boards/payout-methods';

const DRAFT_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

export type DreamBoardDraftInput = {
  childName?: string;
  childAge?: number;
  birthdayDate?: string;
  partyDate?: string;
  partyDateTime?: string | null;
  campaignEndDate?: string;
  childPhotoUrl?: string;
  photoFilename?: string;
  giftName?: string;
  giftDescription?: string;
  giftIconId?: string;
  giftImageUrl?: string;
  giftImagePrompt?: string;
  goalCents?: number;
  payoutMethod?: DreamBoardGiftPayoutMethod;
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
  partyDateTime?: string | null;
  campaignEndDate?: string;
  childPhotoUrl?: string;
  photoFilename?: string;
  giftName?: string;
  giftDescription?: string;
  giftIconId?: string;
  giftImageUrl?: string;
  giftImagePrompt?: string;
  goalCents?: number;
  payoutMethod?: DreamBoardGiftPayoutMethod;
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

export type HostCreateDreamBoardDraftInput = {
  childName?: string;
  childAge?: number;
  birthdayDate?: string;
  partyDate?: string;
  partyDateTime?: string | null;
  campaignEndDate?: string;
  childPhotoUrl?: string;
  photoFilename?: string;
  giftName?: string;
  giftDescription?: string;
  giftIconId?: string;
  giftImageUrl?: string;
  giftImagePrompt?: string;
  goalCents?: number;
  payoutMethod?: typeof DEFAULT_HOST_CREATE_PAYOUT_METHOD;
  payoutEmail?: string;
  hostWhatsAppNumber?: string;
  message?: string;
};

export type HostCreateDreamBoardDraft = {
  childName?: string;
  childAge?: number;
  birthdayDate?: string;
  partyDate?: string;
  partyDateTime?: string | null;
  campaignEndDate?: string;
  childPhotoUrl?: string;
  photoFilename?: string;
  giftName?: string;
  giftDescription?: string;
  giftIconId?: string;
  giftImageUrl?: string;
  giftImagePrompt?: string;
  goalCents?: number;
  payoutMethod: typeof DEFAULT_HOST_CREATE_PAYOUT_METHOD;
  payoutEmail?: string;
  hostWhatsAppNumber?: string;
  message?: string;
  updatedAt: string;
};

const draftKey = (hostId: string) => `draft:host:${hostId}`;

const normalizeDreamBoardDraftPayload = (draft: DreamBoardDraft): DreamBoardDraft => ({
  ...draft,
  payoutMethod: DEFAULT_HOST_CREATE_PAYOUT_METHOD,
  karriCardNumberEncrypted: undefined,
  karriCardHolderName: undefined,
  bankName: undefined,
  bankAccountNumberEncrypted: undefined,
  bankAccountLast4: undefined,
  bankBranchCode: undefined,
  bankAccountHolder: undefined,
  charityEnabled: false,
  charityId: undefined,
  charitySplitType: undefined,
  charityPercentageBps: undefined,
  charityThresholdCents: undefined,
});

export const normalizeDreamBoardDraft = (draft?: DreamBoardDraft | null): DreamBoardDraft | null => {
  if (!draft) return null;

  return normalizeDreamBoardDraftPayload({
    ...draft,
    updatedAt:
      typeof draft.updatedAt === 'string' && draft.updatedAt.length
        ? draft.updatedAt
        : new Date().toISOString(),
  });
};

const toHostCreateDreamBoardDraft = (
  draft?: DreamBoardDraft | null
): HostCreateDreamBoardDraft | null => {
  if (!draft) return null;

  return {
    childName: draft.childName,
    childAge: draft.childAge,
    birthdayDate: draft.birthdayDate,
    partyDate: draft.partyDate,
    partyDateTime: draft.partyDateTime,
    campaignEndDate: draft.campaignEndDate,
    childPhotoUrl: draft.childPhotoUrl,
    photoFilename: draft.photoFilename,
    giftName: draft.giftName,
    giftDescription: draft.giftDescription,
    giftIconId: draft.giftIconId,
    giftImageUrl: draft.giftImageUrl,
    giftImagePrompt: draft.giftImagePrompt,
    goalCents: draft.goalCents,
    payoutMethod: DEFAULT_HOST_CREATE_PAYOUT_METHOD,
    payoutEmail: draft.payoutEmail,
    hostWhatsAppNumber: draft.hostWhatsAppNumber,
    message: draft.message,
    updatedAt: draft.updatedAt,
  };
};

export async function updateDreamBoardDraft(hostId: string, draft: DreamBoardDraftInput) {
  const existing = await getDreamBoardDraft(hostId);
  const payload = normalizeDreamBoardDraftPayload({
    ...(existing ?? {}),
    ...draft,
    updatedAt: new Date().toISOString(),
  });

  await kvAdapter.set(draftKey(hostId), payload, { ex: DRAFT_EXPIRY_SECONDS });
  return payload;
}

export async function saveDreamBoardDraft(hostId: string, draft: DreamBoardDraftInput) {
  return updateDreamBoardDraft(hostId, draft);
}

export async function updateHostCreateDreamBoardDraft(
  hostId: string,
  draft: HostCreateDreamBoardDraftInput
) {
  const updated = await updateDreamBoardDraft(hostId, {
    ...draft,
    payoutMethod: DEFAULT_HOST_CREATE_PAYOUT_METHOD,
  });

  return toHostCreateDreamBoardDraft(updated);
}

export async function saveHostCreateDreamBoardDraft(
  hostId: string,
  draft: HostCreateDreamBoardDraftInput
) {
  return updateHostCreateDreamBoardDraft(hostId, draft);
}

export async function getDreamBoardDraft(hostId: string) {
  const draft = await kvAdapter.get<DreamBoardDraft>(draftKey(hostId));
  const normalized = normalizeDreamBoardDraft(draft);

  if (!draft || !normalized) {
    return normalized;
  }

  if (JSON.stringify(draft) !== JSON.stringify(normalized)) {
    await kvAdapter.set(draftKey(hostId), normalized, { ex: DRAFT_EXPIRY_SECONDS });
  }

  return normalized;
}

export async function getHostCreateDreamBoardDraft(hostId: string) {
  const draft = await getDreamBoardDraft(hostId);
  return toHostCreateDreamBoardDraft(draft);
}

export async function clearDreamBoardDraft(hostId: string) {
  await kvAdapter.del(draftKey(hostId));
}

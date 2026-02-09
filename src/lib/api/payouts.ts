import { decryptSensitiveValue } from '@/lib/utils/encryption';
import { serializeGiftData } from '@/lib/api/gifts';

type PayoutApiRecord = {
  id: string;
  dreamBoardId: string;
  type: string;
  grossCents: number;
  feeCents: number;
  charityCents?: number;
  netCents: number;
  recipientData: unknown;
  status: string;
  externalRef: string | null;
  errorMessage: string | null;
  createdAt: Date | string;
  completedAt: Date | string | null;
};

const toIsoString = (value: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
};

const getCardLast4 = (encrypted?: string | null) => {
  if (!encrypted) return null;
  try {
    const decrypted = decryptSensitiveValue(encrypted);
    return decrypted.slice(-4);
  } catch {
    return null;
  }
};

const serializeRecipientBasics = (record: Record<string, unknown>) => {
  const payload: Record<string, unknown> = {};
  if (typeof record.email === 'string') payload.email = record.email;
  if (typeof record.childName === 'string') payload.child_name = record.childName;
  if (typeof record.payoutMethod === 'string') payload.payout_method = record.payoutMethod;
  if (typeof record.karriCardHolderName === 'string') {
    payload.karri_card_holder_name = record.karriCardHolderName;
  }
  if (typeof record.bankName === 'string') payload.bank_name = record.bankName;
  if (typeof record.bankAccountLast4 === 'string') payload.bank_account_last4 = record.bankAccountLast4;
  if (typeof record.bankBranchCode === 'string') payload.bank_branch_code = record.bankBranchCode;
  if (typeof record.bankAccountHolder === 'string') {
    payload.bank_account_holder = record.bankAccountHolder;
  }
  if (typeof record.charityId === 'string') payload.charity_id = record.charityId;
  if (typeof record.charityName === 'string') payload.charity_name = record.charityName;
  if (typeof record.charitySplitType === 'string') payload.charity_split_type = record.charitySplitType;
  if (typeof record.charityPercentageBps === 'number') {
    payload.charity_percentage_bps = record.charityPercentageBps;
  }
  if (typeof record.charityThresholdCents === 'number') {
    payload.charity_threshold_cents = record.charityThresholdCents;
  }
  return payload;
};

const serializeRecipientGiftData = (record: Record<string, unknown>) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    gift_data: serializeGiftData({
      giftName: typeof record.giftName === 'string' ? record.giftName : null,
      giftImageUrl: typeof record.giftImageUrl === 'string' ? record.giftImageUrl : null,
      giftImagePrompt:
        typeof record.giftImagePrompt === 'string' ? record.giftImagePrompt : null,
      baseUrl,
    }),
  };
};

const serializeRecipientCardData = (record: Record<string, unknown>) => {
  if (typeof record.cardNumberEncrypted !== 'string') return {};
  const last4 = getCardLast4(record.cardNumberEncrypted);
  return {
    card_number_last4: last4,
    card_number_masked: last4 ? `****${last4}` : null,
  };
};

const serializeRecipientData = (recipientData: unknown) => {
  if (!recipientData || typeof recipientData !== 'object') return null;
  const record = recipientData as Record<string, unknown>;
  return {
    ...serializeRecipientBasics(record),
    ...serializeRecipientGiftData(record),
    ...serializeRecipientCardData(record),
  };
};

export const serializePayout = (record: PayoutApiRecord) => ({
  id: record.id,
  dream_board_id: record.dreamBoardId,
  type: record.type,
  gross_cents: record.grossCents,
  fee_cents: record.feeCents,
  charity_cents: record.charityCents ?? 0,
  net_cents: record.netCents,
  recipient_data: serializeRecipientData(record.recipientData),
  status: record.status,
  external_ref: record.externalRef,
  error_message: record.errorMessage,
  created_at: toIsoString(record.createdAt),
  completed_at: toIsoString(record.completedAt),
});

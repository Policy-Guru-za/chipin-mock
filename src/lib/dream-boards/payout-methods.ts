export const HOST_CREATE_PAYOUT_METHODS = ['bank', 'karri_card'] as const;

export const LEGACY_VOUCHER_PAYOUT_METHOD = 'takealot_voucher' as const;

export const DREAMBOARD_GIFT_PAYOUT_METHODS = ['karri_card', 'bank'] as const;

export type DreamBoardGiftPayoutMethod = (typeof DREAMBOARD_GIFT_PAYOUT_METHODS)[number];

export const DREAMBOARD_PAYOUT_TYPES = [
  ...DREAMBOARD_GIFT_PAYOUT_METHODS,
  'charity',
] as const;

export type DreamBoardPayoutType = (typeof DREAMBOARD_PAYOUT_TYPES)[number];

export type HostCreatePayoutMethod = (typeof HOST_CREATE_PAYOUT_METHODS)[number];

export const DEFAULT_HOST_CREATE_PAYOUT_METHOD = 'bank' as const;

export const isDreamBoardGiftPayoutMethod = (
  value: unknown
): value is DreamBoardGiftPayoutMethod =>
  typeof value === 'string' &&
  (DREAMBOARD_GIFT_PAYOUT_METHODS as readonly string[]).includes(value);

export const isLegacyVoucherPayoutMethod = (
  value: unknown
): value is typeof LEGACY_VOUCHER_PAYOUT_METHOD => value === LEGACY_VOUCHER_PAYOUT_METHOD;

export const getDreamBoardGiftPayoutLabel = (method: string) => {
  if (method === 'bank') return 'Bank Transfer';
  if (method === LEGACY_VOUCHER_PAYOUT_METHOD) return 'Takealot Voucher';
  if (!isDreamBoardGiftPayoutMethod(method)) return 'Legacy Payout';
  return 'Karri Card';
};

export const getDreamBoardPayoutTypeLabel = (type: string) => {
  if (type === 'charity') return 'Charity Payout';
  if (type === LEGACY_VOUCHER_PAYOUT_METHOD) return 'Takealot Voucher';
  if (!isDreamBoardGiftPayoutMethod(type)) return 'Legacy Payout';
  return 'Gift Payout';
};

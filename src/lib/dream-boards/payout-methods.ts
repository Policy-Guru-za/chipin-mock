export const DREAMBOARD_GIFT_PAYOUT_METHODS = [
  'karri_card',
  'bank',
  'takealot_voucher',
] as const;

export type DreamBoardGiftPayoutMethod = (typeof DREAMBOARD_GIFT_PAYOUT_METHODS)[number];

export const DREAMBOARD_PAYOUT_TYPES = [
  ...DREAMBOARD_GIFT_PAYOUT_METHODS,
  'charity',
] as const;

export type DreamBoardPayoutType = (typeof DREAMBOARD_PAYOUT_TYPES)[number];

export const DEFAULT_HOST_CREATE_PAYOUT_METHOD = 'takealot_voucher' as const;

export const isDreamBoardGiftPayoutMethod = (
  value: unknown
): value is DreamBoardGiftPayoutMethod =>
  typeof value === 'string' &&
  (DREAMBOARD_GIFT_PAYOUT_METHODS as readonly string[]).includes(value);

export const getDreamBoardGiftPayoutLabel = (method: DreamBoardGiftPayoutMethod) => {
  if (method === 'bank') return 'Bank Transfer';
  if (method === 'takealot_voucher') return 'Takealot Voucher';
  return 'Karri Card';
};

export const getDreamBoardPayoutTypeLabel = (type: DreamBoardPayoutType) => {
  if (type === 'charity') return 'Charity Payout';
  if (type === 'takealot_voucher') return 'Voucher Payout';
  return 'Gift Payout';
};

export const PAYMENT_PROVIDER = 'stitch' as const;
export const PAYMENT_PROVIDERS = [PAYMENT_PROVIDER] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const isContributionPaymentsLive = () => false;

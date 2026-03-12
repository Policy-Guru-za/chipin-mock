export const PLATFORM_FEE_PERCENTAGE = 0;
export const MIN_FEE_CENTS = 0;
export const MAX_FEE_CENTS = 0;

export function calculateFee(_amountCents: number) {
  return 0;
}

export function calculateTotalWithFee(amountCents: number) {
  return amountCents + calculateFee(amountCents);
}

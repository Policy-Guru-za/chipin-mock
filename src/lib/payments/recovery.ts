export type PaymentAttemptData = {
  amountCents: number;
  displayName: string | null;
  message: string | null;
  isAnonymous: boolean;
  attemptedMethod: string | null;
  reason: string | null;
  timestamp?: number;
};

const PAYMENT_FAILURE_WINDOW_MS = 30 * 60 * 1000;

const getKey = (slug: string) => `gifta_payment_failed_${slug}`;

export function savePaymentAttemptData(slug: string, data: PaymentAttemptData): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(getKey(slug), JSON.stringify({ ...data, timestamp: Date.now() }));
}

export function getPaymentAttemptData(slug: string): PaymentAttemptData | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(getKey(slug));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PaymentAttemptData;
    if (!parsed.timestamp || Date.now() - parsed.timestamp > PAYMENT_FAILURE_WINDOW_MS) {
      sessionStorage.removeItem(getKey(slug));
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(getKey(slug));
    return null;
  }
}

export function clearPaymentAttemptData(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(getKey(slug));
}

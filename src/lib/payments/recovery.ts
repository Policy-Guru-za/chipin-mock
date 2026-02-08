export type PaymentAttemptData = {
  amountCents: number;
  paymentProvider?: string | null;
  displayName: string | null;
  message: string | null;
  isAnonymous: boolean;
  // Legacy field retained for backward compatibility with C2 reads.
  attemptedMethod: string | null;
  reason: string | null;
  timestamp?: number;
};

const PAYMENT_FAILURE_WINDOW_MS = 30 * 60 * 1000;

const getKey = (slug: string) => `gifta_payment_failed_${slug}`;

export function savePaymentAttemptData(slug: string, data: PaymentAttemptData): void {
  if (typeof window === 'undefined') return;
  const paymentProvider = data.paymentProvider ?? data.attemptedMethod ?? null;
  sessionStorage.setItem(
    getKey(slug),
    JSON.stringify({
      ...data,
      paymentProvider,
      attemptedMethod: data.attemptedMethod ?? paymentProvider,
      timestamp: Date.now(),
    })
  );
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
    const paymentProvider = parsed.paymentProvider ?? parsed.attemptedMethod ?? null;
    return {
      ...parsed,
      paymentProvider,
      attemptedMethod: parsed.attemptedMethod ?? paymentProvider,
    };
  } catch {
    sessionStorage.removeItem(getKey(slug));
    return null;
  }
}

export function clearPaymentAttemptData(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(getKey(slug));
}

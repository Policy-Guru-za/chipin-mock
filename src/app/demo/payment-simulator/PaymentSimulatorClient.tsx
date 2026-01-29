'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PaymentSimulatorClientProps = {
  contributionId?: string;
  returnTo: string;
};

export function PaymentSimulatorClient({ contributionId, returnTo }: PaymentSimulatorClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!contributionId) {
      setError('Missing contribution id.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/demo/payment-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? 'Failed to complete demo payment.');
        return;
      }

      router.push(returnTo);
    } catch {
      setError('Failed to complete demo payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(returnTo);
  };

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={handleComplete}
          disabled={!contributionId || isSubmitting}
        >
          {isSubmitting ? 'Completing…' : 'Complete payment'}
        </button>
        <button
          type="button"
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

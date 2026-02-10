'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { PaymentOverlay } from '@/components/effects/PaymentOverlay';
import {
  PaymentSummary,
  SnapScanPanel,
  type SnapScanQr,
} from '@/components/forms/ContributionFormParts';
import { CheckIcon, OzowIcon, PayFastIcon, SnapScanIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  clearFlowData,
  getFlowData,
  type ContributeFlowData,
} from '@/lib/contributions/flow-storage';
import { trackPaymentRedirectStarted } from '@/lib/analytics/metrics';
import { calculateFee } from '@/lib/payments/fees';
import type { PaymentProvider } from '@/lib/payments';
import { savePaymentAttemptData } from '@/lib/payments/recovery';
import { formatZar, formatZarWithCents } from '@/lib/utils/money';

type PaymentClientProps = {
  slug: string;
  dreamBoardId: string;
  childName: string;
  availableProviders: PaymentProvider[];
};

type CreatePaymentResponse = {
  mode?: 'form' | 'redirect' | 'qr';
  redirectUrl?: string;
  fields?: Array<[string, string]>;
  qrUrl?: string;
  qrImageUrl?: string;
  reference?: string;
  error?: string;
};

const PROVIDER_LABELS: Record<PaymentProvider, { title: string; description: string; icon: ReactNode }> = {
  payfast: {
    title: 'Credit or Debit Card',
    description: 'Visa, Mastercard, Amex. Processing with PayFast.',
    icon: <PayFastIcon className="text-primary-700" />,
  },
  snapscan: {
    title: 'SnapScan',
    description: 'Scan a QR code with your banking app.',
    icon: <SnapScanIcon className="text-primary-700" />,
  },
  ozow: {
    title: 'Instant EFT',
    description: 'Pay via Ozow bank transfer.',
    icon: <OzowIcon className="text-primary-700" />,
  },
};

const submitPayfastForm = (redirectUrl: string, fields: Array<[string, string]>) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = redirectUrl;

  for (const [key, value] of fields) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
};

const getDefaultProvider = (providers: PaymentProvider[]) => {
  if (providers.includes('payfast')) return 'payfast';
  return providers[0] ?? 'payfast';
};

const toAttemptPayload = (flowData: ContributeFlowData, paymentProvider: PaymentProvider) => ({
  amountCents: flowData.amountCents,
  paymentProvider,
  attemptedMethod: paymentProvider,
  displayName: flowData.isAnonymous ? null : flowData.contributorName || null,
  message: flowData.message || null,
  isAnonymous: flowData.isAnonymous,
  reason: null,
});

export function PaymentClient({
  slug,
  dreamBoardId,
  childName,
  availableProviders,
}: PaymentClientProps) {
  const router = useRouter();
  const [flowData] = useState(() => getFlowData(slug));
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(() =>
    getDefaultProvider(availableProviders)
  );
  const [snapscanQr, setSnapscanQr] = useState<SnapScanQr | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!flowData) {
      router.replace(`/${slug}/contribute`);
    }
  }, [flowData, router, slug]);

  const feeCents = useMemo(() => (flowData ? calculateFee(flowData.amountCents) : 0), [flowData]);
  const totalCents = (flowData?.amountCents ?? 0) + feeCents;
  const hasProviderOptions = availableProviders.length > 0;
  const canSubmit =
    !!flowData && hasProviderOptions && availableProviders.includes(paymentProvider) && !isSubmitting;

  if (!flowData) return null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/internal/contributions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamBoardId,
          contributionCents: flowData.amountCents,
          contributorName: flowData.isAnonymous ? undefined : flowData.contributorName.trim() || undefined,
          message: flowData.message.trim().slice(0, 280) || undefined,
          paymentProvider,
        }),
      });

      const payload = (await response.json().catch(() => null)) as CreatePaymentResponse | null;
      if (!response.ok) {
        setErrorMessage(payload?.error ?? 'We could not start your payment. Please try again.');
        return;
      }

      if (!payload?.mode) {
        setErrorMessage('We could not start your payment. Please try again.');
        return;
      }

      savePaymentAttemptData(slug, toAttemptPayload(flowData, paymentProvider));

      if (payload.mode === 'form' && payload.redirectUrl && payload.fields) {
        trackPaymentRedirectStarted(paymentProvider);
        clearFlowData(slug);
        setIsRedirecting(true);
        submitPayfastForm(payload.redirectUrl, payload.fields);
        return;
      }

      if (payload.mode === 'redirect' && payload.redirectUrl) {
        trackPaymentRedirectStarted(paymentProvider);
        clearFlowData(slug);
        setIsRedirecting(true);
        window.location.assign(payload.redirectUrl);
        return;
      }

      if (payload.mode === 'qr' && payload.qrUrl && payload.qrImageUrl && payload.reference) {
        setSnapscanQr({
          qrUrl: payload.qrUrl,
          qrImageUrl: payload.qrImageUrl,
          reference: payload.reference,
        });
        return;
      }

      setErrorMessage('We could not start your payment. Please try again.');
    } catch {
      setErrorMessage('We could not start your payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPaymentOverlay = isRedirecting && (paymentProvider === 'payfast' || paymentProvider === 'ozow');

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-text">Complete your contribution</h1>
        <p className="text-base font-medium text-gray-600">
          Contributing <strong>{formatZar(flowData.amountCents)}</strong> to {childName}&apos;s Dreamboard
        </p>
      </header>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          How would you like to pay?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {availableProviders.map((provider) => {
            const content = PROVIDER_LABELS[provider];
            const isSelected = paymentProvider === provider;
            return (
              <button
                key={provider}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setPaymentProvider(provider)}
                className={`relative min-h-[140px] rounded-lg border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? 'border-2 border-primary-700 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-3">{content.icon}</div>
                <p className="text-base font-semibold text-gray-900">{content.title}</p>
                <p className="mt-1 text-sm text-gray-600">{content.description}</p>
                {isSelected ? (
                  <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-700 text-white">
                    <CheckIcon size="sm" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <PaymentSummary contributionCents={flowData.amountCents} feeCents={feeCents} totalCents={totalCents} />

      {snapscanQr ? (
        <SnapScanPanel
          qr={snapscanQr}
          slug={slug}
          dreamBoardId={dreamBoardId}
          onBack={() => {
            setSnapscanQr(null);
            setErrorMessage(null);
          }}
        />
      ) : null}

      {!hasProviderOptions ? (
        <p className="rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-text-muted">
          Payments are temporarily unavailable. Please check back shortly.
        </p>
      ) : null}
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      {!snapscanQr ? (
        <Button
          type="button"
          loading={isSubmitting}
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="min-h-11 w-full rounded-lg bg-primary-700 text-base font-semibold text-white hover:bg-primary-800 sm:max-w-[400px]"
        >
          {isSubmitting ? 'Processing...' : `Pay ${formatZarWithCents(totalCents)} →`}
        </Button>
      ) : null}

      <p className="text-center text-xs text-text-muted">🔒 Payments secured by PayFast</p>

      <Link
        href={`/${slug}/contribute`}
        className="inline-flex min-h-11 items-center text-sm text-primary-700 hover:underline"
      >
        ← Back to details
      </Link>

      {showPaymentOverlay ? <PaymentOverlay provider={paymentProvider} /> : null}
    </section>
  );
}

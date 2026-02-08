'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import type { FailureDisplay } from '@/lib/payments/failure-display';
import { getPaymentAttemptData } from '@/lib/payments/recovery';

type PaymentFailedClientProps = {
  slug: string;
  childName: string;
  display: FailureDisplay;
  isClosed: boolean;
};

export function PaymentFailedClient({ slug, childName, display, isClosed }: PaymentFailedClientProps) {
  const attemptSummary = useMemo(() => {
    const attempt = getPaymentAttemptData(slug);
    if (!attempt) return null;
    const amount = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(attempt.amountCents / 100);
    return `Last attempt: ${amount}${attempt.attemptedMethod ? ` via ${attempt.attemptedMethod}` : ''}.`;
  }, [slug]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="rounded-3xl border border-border bg-white p-6 text-center shadow-soft">
        <header className="space-y-3">
          <h1
            role="alert"
            aria-live="assertive"
            className="font-display text-3xl text-text sm:text-4xl"
          >
            ❌ {display.heading}
          </h1>
          <p className="text-base text-gray-700">{display.message}</p>
          <p className="text-sm text-gray-600">No funds were taken.</p>
        </header>

        {attemptSummary ? <p className="mt-4 text-sm text-gray-600">{attemptSummary}</p> : null}

        {display.explanations.length > 0 ? (
          <ul className="mt-5 list-disc space-y-1 pl-6 text-left text-sm text-gray-600">
            {display.explanations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {isClosed ? (
          <p className="mt-6 rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-gray-700">
            This Dreamboard has closed.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/${slug}/contribute`}>
              <Button className="min-h-11 w-full sm:w-auto">Try Again</Button>
            </Link>
            <Link href={`/${slug}/contribute?clear_payment_method=true`}>
              <Button
                variant="ghost"
                className="min-h-11 w-full border-2 border-[#6B9E88] bg-white text-gray-900 sm:w-auto"
              >
                Use a Different Payment Method
              </Button>
            </Link>
          </div>
        )}

        <footer className="mt-6 flex flex-col items-center gap-2 text-sm text-text-muted">
          <a href="mailto:support@gifta.co" className="hover:text-text">
            Need help? Contact us 💬
          </a>
          <Link href={`/${slug}`} className="hover:text-text">
            Back to {childName}&apos;s Dreamboard ←
          </Link>
        </footer>
      </section>
    </main>
  );
}

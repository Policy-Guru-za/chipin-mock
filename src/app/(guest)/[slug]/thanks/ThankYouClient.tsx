'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { CharitableGivingCard } from '@/components/dream-board/CharitableGivingCard';
import { ConfettiTrigger } from '@/components/effects/ConfettiTrigger';
import { Button } from '@/components/ui/button';
import type { ThankYouViewModel } from '@/lib/dream-boards/view-model';
import { formatZar } from '@/lib/utils/money';

type ReceiptState = {
  success: boolean;
  error?: string;
};

type ThankYouClientProps = {
  view: ThankYouViewModel;
  slug: string;
  requestReceiptAction: (contributionId: string, email: string) => Promise<ReceiptState>;
};

export function ThankYouClient({ view, slug, requestReceiptAction }: ThankYouClientProps) {
  const [receiptPending, setReceiptPending] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [receiptFeedback, setReceiptFeedback] = useState('');

  useEffect(() => {
    if (!view.isContributionCompleted) return;
    if (!(view.contributorName || view.isAnonymous)) return;
    localStorage.setItem(
      `gifta_contributed_${slug}`,
      JSON.stringify({
        name: view.contributorName ?? 'Anonymous',
        timestamp: Date.now(),
      })
    );
  }, [slug, view.contributorName, view.isAnonymous, view.isContributionCompleted]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${slug}`;
  }, [slug]);

  const handleShare = async () => {
    const title = `${view.childName}'s Dream Board`;
    const text = view.isContributionCompleted
      ? `Your contribution helped make ${view.childName}'s birthday extra special. 💝`
      : `Help make ${view.childName}'s birthday extra special. 💝`;

    if (navigator.share) {
      await navigator.share({ title, text, url: shareUrl });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareFeedback('Link copied to clipboard!');
    window.setTimeout(() => setShareFeedback(''), 2000);
  };

  const handleReceiptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contributionId = String(formData.get('contributionId') ?? '');
    const email = String(formData.get('email') ?? '');

    setReceiptPending(true);
    const result = await requestReceiptAction(contributionId, email);
    setReceiptPending(false);

    if (result.success) {
      setReceiptSuccess(true);
      setReceiptFeedback('Receipt sent to your email!');
      window.setTimeout(() => setReceiptFeedback(''), 3000);
      return;
    }

    setReceiptSuccess(false);
    setReceiptFeedback("Couldn't send receipt. Please try again.");
    window.setTimeout(() => setReceiptFeedback(''), 5000);
  };

  const charityImpactCopy =
    view.charityAmountCents && view.charityName
      ? `${formatZar(view.charityAmountCents)} of your contribution will support ${view.charityName}. Thank you for giving twice! 💚`
      : null;
  const showReceiptSection = Boolean(view.contributionId && view.isContributionCompleted);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <ConfettiTrigger
        trigger={view.isContributionCompleted}
        variant="celebration"
        celebrationDuration={3000}
      />

      <section className="space-y-6 rounded-3xl border border-border bg-white p-6 text-center shadow-soft">
        <header className="space-y-2">
          <h1 className="font-display text-3xl text-text sm:text-4xl">{view.headline}</h1>
          <p className="text-base text-gray-700">{view.message}</p>
          {view.contributionAmountCents > 0 ? (
            <p className="text-sm text-gray-600">
              Contribution amount: {formatZar(view.contributionAmountCents)}
            </p>
          ) : null}
          {view.isContributionCompleted ? (
            <p className="text-sm text-gray-600">{view.childName}&apos;s parents have been notified. 💝</p>
          ) : null}
        </header>

        {view.charityEnabled && view.charityName && charityImpactCopy ? (
          <CharitableGivingCard
            charityName={view.charityName}
            charityDescription={view.charityDescription}
            charityLogoUrl={view.charityLogoUrl}
            allocationLabel={charityImpactCopy}
            impactCopy={charityImpactCopy}
          />
        ) : null}

        {showReceiptSection ? (
          <section aria-label="Receipt capture" className="space-y-3 rounded-2xl bg-subtle p-4 text-left">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Want a receipt?
            </h2>
            <form onSubmit={handleReceiptSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="contributionId" value={view.contributionId ?? ''} />
              <input
                type="email"
                name="email"
                required
                defaultValue={view.contributorEmail ?? ''}
                placeholder="you@example.com"
                className="min-h-11 flex-1 rounded-xl border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <Button
                type="submit"
                variant="ghost"
                disabled={receiptPending}
                className="min-h-11 border border-[#6B9E88] bg-white text-gray-900"
              >
                {receiptPending ? 'Sending...' : 'Send Receipt'}
              </Button>
            </form>
            {receiptFeedback ? (
              <p
                role="status"
                aria-live="polite"
                className={
                  receiptSuccess
                    ? 'rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800'
                    : 'rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700'
                }
              >
                {receiptFeedback}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="space-y-3">
          <Button
            type="button"
            onClick={handleShare}
            className="min-h-11 w-full bg-[#6B9E88] text-white hover:bg-[#5b8e78]"
          >
            📤 Share This Dream Board
          </Button>
          {shareFeedback ? (
            <p role="status" className="text-sm text-gray-600">
              {shareFeedback}
            </p>
          ) : null}
        </section>
      </section>

      <footer className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
        <Link href={`/${slug}`} className="hover:text-text">
          ← Back to Dream Board
        </Link>
        <a href="mailto:support@gifta.co" className="hover:text-text">
          Need help? Contact us
        </a>
      </footer>
    </main>
  );
}

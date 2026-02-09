'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useMemo, useState } from 'react';

import { ConfettiTrigger } from '@/components/effects/ConfettiTrigger';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { parseDateOnly } from '@/lib/utils/date';

type ReviewDraftData = {
  childName: string;
  childAge: number;
  childPhotoUrl: string;
  birthdayDate: string;
  partyDate: string;
  campaignEndDate: string;
  giftName: string;
  giftImageUrl: string;
  goalCents: number;
  payoutMethod: 'karri_card' | 'bank';
  payoutEmail: string;
  hostWhatsAppNumber: string;
  karriCardHolderName?: string;
  bankName?: string;
  bankAccountLast4?: string;
  charityEnabled?: boolean;
  charitySplitType?: 'percentage' | 'threshold';
  charityPercentageBps?: number;
  charityThresholdCents?: number;
};

export type PublishState = {
  status: 'preview' | 'published';
  error?: string;
  boardId?: string;
  slug?: string;
  shareUrl?: string;
};

type ReviewClientProps = {
  draft: ReviewDraftData;
  publishAction: (state: PublishState, formData: FormData) => Promise<PublishState>;
};

const formatDate = (value: string) => {
  const parsed = parseDateOnly(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatRand = (cents: number) => `R${Math.round(cents / 100).toLocaleString('en-ZA')}`;

type PreviewCardProps = {
  draft: ReviewDraftData;
  shareUrl?: string;
  readonlyMode: boolean;
};

function PreviewCard({ draft, shareUrl, readonlyMode }: PreviewCardProps) {
  const charitySummary = useMemo(() => {
    if (!draft.charityEnabled) {
      return 'No charity split selected.';
    }
    if (draft.charitySplitType === 'percentage' && draft.charityPercentageBps) {
      return `Charity split: ${Math.round(draft.charityPercentageBps / 100)}% of goal.`;
    }
    if (draft.charitySplitType === 'threshold' && draft.charityThresholdCents) {
      return `Charity split: ${formatRand(draft.charityThresholdCents)} fixed amount.`;
    }
    return 'Charity split enabled.';
  }, [draft]);

  const payoutSummary =
    draft.payoutMethod === 'bank'
      ? `Bank transfer${draft.bankName ? ` (${draft.bankName})` : ''}${draft.bankAccountLast4 ? ` •••• ${draft.bankAccountLast4}` : ''}`
      : `Karri Card${draft.karriCardHolderName ? ` (${draft.karriCardHolderName})` : ''}`;

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-soft sm:p-8">
      <div className="mx-auto mb-5 h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-primary sm:h-[150px] sm:w-[150px]">
        <Image
          src={draft.childPhotoUrl}
          alt={`${draft.childName}'s photo`}
          width={150}
          height={150}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-3 text-center">
        <h2 className="font-display text-2xl text-text sm:text-3xl">
          {draft.childName} turns {draft.childAge}!
        </h2>
        <p className="text-sm text-text-secondary">Birthday: {formatDate(draft.birthdayDate)}</p>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-subtle p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl sm:h-20 sm:w-20">
            <Image
              src={draft.giftImageUrl}
              alt={draft.giftName}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text">{draft.giftName}</p>
            <p className="text-xs text-text-muted">Goal: {formatRand(draft.goalCents)}</p>
          </div>
        </div>
        <div className="space-y-1 text-xs text-text-secondary sm:text-sm">
          <p>Campaign closes: {formatDate(draft.campaignEndDate)}</p>
          <p>Payout: {payoutSummary}</p>
          <p>{charitySummary}</p>
        </div>
      </div>

      {readonlyMode ? (
        shareUrl ? (
          <p className="mt-4 break-all text-center text-xs text-text-muted">{shareUrl}</p>
        ) : null
      ) : (
        <div className="mt-6 grid gap-2 text-sm">
          <Link href="/create/child" className="text-primary underline underline-offset-2">
            Edit child details
          </Link>
          <Link href="/create/gift" className="text-primary underline underline-offset-2">
            Edit gift details
          </Link>
          <Link href="/create/dates" className="text-primary underline underline-offset-2">
            Edit dates
          </Link>
          {draft.charityEnabled ? (
            <Link href="/create/giving-back" className="text-primary underline underline-offset-2">
              Edit charity settings
            </Link>
          ) : null}
          <Link href="/create/payout" className="text-primary underline underline-offset-2">
            Edit payout details
          </Link>
        </div>
      )}
    </div>
  );
}

export function ReviewClient({ draft, publishAction }: ReviewClientProps) {
  const [state, formAction, pending] = useActionState(publishAction, { status: 'preview' });
  const [copied, setCopied] = useState(false);
  const published = state.status === 'published';
  const shareUrl = state.shareUrl;

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  const whatsappShareMessage = shareUrl
    ? `🎁 Help make ${draft.childName}'s birthday extra special!\n\n${draft.childName} is dreaming of ${draft.giftName} (${formatRand(draft.goalCents)}).\n\nChip in here: ${shareUrl}`
    : '';
  const emailSubject = `Help ${draft.childName}'s Birthday Dream Come True! 🎉`;
  const emailBody = shareUrl
    ? `Hi there!\n\n${draft.childName} is turning ${draft.childAge}, and friends and family are chipping in for ${draft.giftName}.\n\nView and chip in here: ${shareUrl}\n\nEvery amount helps!`
    : '';

  if (published && shareUrl) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <ConfettiTrigger trigger variant="celebration" celebrationDuration={4000} />

        <header className="space-y-2 text-center">
          <h1 className="font-display text-4xl text-primary animate-fade-up sm:text-5xl">
            🎉 {draft.childName}&apos;s Dream Board is ready!
          </h1>
        </header>

        <PreviewCard draft={draft} shareUrl={shareUrl} readonlyMode />

        <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-text">Share link</p>
          <p className="break-all font-mono text-xs text-text-secondary sm:text-sm">{shareUrl}</p>
          <Button type="button" onClick={copyShareUrl}>
            {copied ? 'Copied! ✓' : 'Copy'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappShareMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-[#25D366] px-3 py-2 text-sm font-semibold text-white"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-text"
          >
            Email
          </a>
          <button
            type="button"
            onClick={copyShareUrl}
            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-text"
          >
            {copied ? 'Copied! ✓' : 'Copy Link'}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-border bg-subtle px-3 py-2 text-sm font-semibold text-text"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="text-center text-sm text-text-muted">
          <Link href="/dashboard" className="underline underline-offset-2">
            ← Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <CreateFlowShell
      currentStep={6}
      totalSteps={6}
      stepLabel="Step 6 of 6 — Review"
      title="Review your Dream Board"
      subtitle="Everything looks good? Create and start sharing."
    >
      <div className="space-y-5">
        {state.error ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.error}
          </div>
        ) : null}

        <PreviewCard draft={draft} readonlyMode={false} />

        <form action={formAction}>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Dream Board'}
          </Button>
        </form>
      </div>
    </CreateFlowShell>
  );
}

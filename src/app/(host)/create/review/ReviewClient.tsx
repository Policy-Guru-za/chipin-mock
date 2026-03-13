'use client';

import Link from 'next/link';
import { useActionState, useEffect, useMemo, useState } from 'react';

import { CelebrationHeader } from '@/components/create-review/CelebrationHeader';
import { ReviewPreviewCard } from '@/components/create-review/ReviewPreviewCard';
import { ShareActionsPanel } from '@/components/create-review/ShareActionsPanel';
import {
  WizardCTA,
  WizardCenteredLayout,
  WizardPanelTitle,
  WizardStepper,
} from '@/components/create-wizard';
import { ConfettiTrigger } from '@/components/effects/ConfettiTrigger';
import { formatBirthdayPartyLine } from '@/lib/dream-boards/party-visibility';
import { CREATE_FLOW_TOTAL_STEPS } from '@/lib/host/create-view-model';
import { parseDateOnly } from '@/lib/utils/date';

type ReviewDraftData = {
  childName: string;
  childAge: number;
  childPhotoUrl: string;
  birthdayDate: string;
  partyDate: string;
  partyDateTime?: string | null;
  campaignEndDate: string;
  giftName: string;
  giftImageUrl: string;
  payoutEmail: string;
  hostWhatsAppNumber: string;
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

export function ReviewClient({ draft, publishAction }: ReviewClientProps) {
  const [state, formAction, pending] = useActionState(publishAction, { status: 'preview' });
  const [copied, setCopied] = useState(false);
  const published = state.status === 'published';
  const shareUrl = state.shareUrl;
  const voucherSummary = useMemo(
    () => `Takealot Voucher placeholder via ${draft.payoutEmail} and ${draft.hostWhatsAppNumber}`,
    [draft.hostWhatsAppNumber, draft.payoutEmail]
  );
  const partyDateTimeSummary = formatBirthdayPartyLine({
    birthdayDate: draft.birthdayDate,
    partyDate: draft.partyDate,
    partyDateTime: draft.partyDateTime ?? null,
  });
  const birthdayLabel = formatDate(draft.birthdayDate);
  const campaignCloseLabel = formatDate(draft.campaignEndDate);

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
    ? `🎁 Help make ${draft.childName}'s birthday extra special!\n\n${draft.childName} is dreaming of ${draft.giftName}.\n\nChip in here: ${shareUrl}`
    : '';
  const emailSubject = `Help ${draft.childName}'s Birthday Dream Come True! 🎉`;
  const emailBody = shareUrl
    ? `Hi there!\n\n${draft.childName} is turning ${draft.childAge}, and friends and family are chipping in for ${draft.giftName}.\n\nView and chip in here: ${shareUrl}\n\nEvery amount helps!`
    : '';

  if (published && shareUrl) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-8 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        <ConfettiTrigger trigger variant="celebration" celebrationDuration={4000} />

        <div className="animate-fade-up">
          <CelebrationHeader childName={draft.childName} />
        </div>

        <div className="mx-auto w-full max-w-[580px] animate-fade-up-delay-1">
          <ReviewPreviewCard
            childName={draft.childName}
            childAge={draft.childAge}
            childPhotoUrl={draft.childPhotoUrl}
            birthdayLabel={birthdayLabel}
            giftName={draft.giftName}
            giftImageUrl={draft.giftImageUrl}
            partyDateTimeLabel={partyDateTimeSummary}
            campaignCloseLabel={campaignCloseLabel}
            voucherSummary={voucherSummary}
            shareUrl={shareUrl}
            copied={copied}
            onCopyShareUrl={copyShareUrl}
          />
        </div>

        <div className="animate-fade-up-delay-2">
          <ShareActionsPanel
            whatsappHref={`https://wa.me/?text=${encodeURIComponent(whatsappShareMessage)}`}
            emailHref={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
            copied={copied}
            onCopyLink={copyShareUrl}
          />
        </div>

        <div className="text-center text-sm text-ink-soft">
          <Link href="/dashboard" className="font-medium text-sage underline underline-offset-4">
            ← Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <WizardStepper
        currentStep={5}
        totalSteps={CREATE_FLOW_TOTAL_STEPS}
        stepLabel="Review"
      />
      <form action={formAction}>
        <WizardCenteredLayout>
          <WizardPanelTitle variant="form">Review your Dreamboard</WizardPanelTitle>
          <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
            Everything looks good? Create and start sharing.
          </p>

          <div className="mb-7">
            <ReviewPreviewCard
              childName={draft.childName}
              childAge={draft.childAge}
              childPhotoUrl={draft.childPhotoUrl}
              birthdayLabel={birthdayLabel}
              giftName={draft.giftName}
              giftImageUrl={draft.giftImageUrl}
              partyDateTimeLabel={partyDateTimeSummary}
              campaignCloseLabel={campaignCloseLabel}
              voucherSummary={voucherSummary}
            />
          </div>

          <div className="mb-7 space-y-1 border-b border-border-soft pb-5">
            <Link
              href="/create/child"
              className="wizard-interactive block py-1.5 text-[13px] font-medium text-primary transition-colors hover:text-sage-deep"
            >
              Edit child details
            </Link>
            <Link
              href="/create/gift"
              className="wizard-interactive block py-1.5 text-[13px] font-medium text-primary transition-colors hover:text-sage-deep"
            >
              Edit gift details
            </Link>
            <Link
              href="/create/dates"
              className="wizard-interactive block py-1.5 text-[13px] font-medium text-primary transition-colors hover:text-sage-deep"
            >
              Edit dates
            </Link>
            <Link
              href="/create/voucher"
              className="wizard-interactive block py-1.5 text-[13px] font-medium text-primary transition-colors hover:text-sage-deep"
            >
              Edit voucher details
            </Link>
          </div>

          <WizardCTA
            backHref="/create/voucher"
            submitLabel="Create Dreamboard"
            pendingLabel="Creating..."
            submitIcon="star"
            pending={pending}
            error={state.error ?? null}
          />
        </WizardCenteredLayout>
      </form>
    </>
  );
}

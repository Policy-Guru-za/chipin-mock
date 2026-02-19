import Image from 'next/image';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { saveManualGiftAction } from '@/app/(host)/create/gift/actions';
import {
  WizardCTA,
  WizardCenteredLayout,
  WizardFieldWrapper,
  WizardPanelTitle,
  WizardSkeletonLoader,
  WizardStepper,
  WizardTextInput,
  WizardTextarea,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

type GiftSearchParams = {
  error?: string;
};

const giftErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
};

const resolveDefaultGiftName = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftName ?? '';

const resolveDefaultMessage = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.message ?? '';

export default async function CreateGiftPage({
  searchParams,
}: {
  searchParams?: Promise<GiftSearchParams>;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'gift', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/child');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolveWizardError(resolvedSearchParams?.error, giftErrorMessages);
  const defaultGiftName = resolveDefaultGiftName(draft);
  const defaultMessage = resolveDefaultMessage(draft);
  const messageAuthor = draft.childName?.trim() ? draft.childName.trim() : 'your child';

  return (
    <>
      <WizardStepper currentStep={2} totalSteps={6} stepLabel="The gift" />

      <Suspense fallback={<WizardSkeletonLoader variant="centered" />}>
        <form action={saveManualGiftAction}>
          <WizardCenteredLayout>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <Image
                src="/icons/gifts/gifta-logo.png"
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                aria-hidden="true"
                priority
              />
            </div>

            <WizardPanelTitle variant="form">The dream gift</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              What&apos;s the one gift {messageAuthor} is dreaming of?
            </p>

            <WizardFieldWrapper label="Gift name" htmlFor="giftName">
              <WizardTextInput
                id="giftName"
                name="giftName"
                placeholder="e.g. LEGO Millennium Falcon"
                defaultValue={defaultGiftName}
                inputMode="text"
                autoComplete="off"
                enterKeyHint="next"
                required
              />
            </WizardFieldWrapper>

            <WizardFieldWrapper label={`A message from ${messageAuthor}`} htmlFor="message">
              <WizardTextarea
                id="message"
                name="message"
                maxLength={280}
                placeholder="E.g., Thank you for helping make this dream gift possible."
                defaultValue={defaultMessage}
                rows={3}
                enterKeyHint="done"
              />
              <p className="mt-1.5 text-xs text-ink-ghost">
                This note is saved with this Dreamboard and may appear on the public Dreamboard.
              </p>
            </WizardFieldWrapper>

            <WizardCTA
              backHref="/create/child"
              submitLabel="Continue to dates"
              pending={false}
              error={errorMessage}
            />
          </WizardCenteredLayout>
        </form>
      </Suspense>
    </>
  );
}

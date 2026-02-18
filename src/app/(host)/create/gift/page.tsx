import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { saveManualGiftAction } from '@/app/(host)/create/gift/actions';
import { GiftIconPreview } from '@/components/create-wizard/GiftIconPreview';
import {
  WizardCTA,
  WizardEyebrow,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardPreviewPanel,
  WizardSkeletonLoader,
  WizardSplitLayout,
  WizardStepper,
  WizardTextInput,
  WizardTextarea,
  resolveWizardError,
} from '@/components/create-wizard';
import { GiftIconPicker } from '@/components/gift/GiftIconPicker';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { extractIconIdFromPath, isValidGiftIconId } from '@/lib/icons/gift-icons';
import { suggestGiftIcon } from '@/lib/icons/suggest-icon';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

type GiftSearchParams = {
  error?: string;
};

const giftErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
};

const resolveDefaultGiftName = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftName ?? '';

const resolveDefaultGiftDescription = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftDescription ?? '';

const resolveDefaultMessage = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.message ?? '';

const resolveDefaultIconId = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) => {
  const draftIconId = draft?.giftIconId;
  if (draftIconId && isValidGiftIconId(draftIconId)) {
    return draftIconId;
  }

  const iconIdFromPath = extractIconIdFromPath(draft?.giftImageUrl ?? '');
  if (iconIdFromPath && isValidGiftIconId(iconIdFromPath)) {
    return iconIdFromPath;
  }

  return suggestGiftIcon({
    giftName: draft?.giftName ?? '',
    giftDescription: draft?.giftDescription,
    childAge: draft?.childAge,
  }).id;
};

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
  const defaultGiftDescription = resolveDefaultGiftDescription(draft);
  const defaultMessage = resolveDefaultMessage(draft);
  const defaultIconId = resolveDefaultIconId(draft);
  const messageAuthor = draft.childName?.trim() ? draft.childName.trim() : 'your child';

  return (
    <>
      <WizardStepper currentStep={2} totalSteps={6} stepLabel="The gift" />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        <form action={saveManualGiftAction}>
          <WizardSplitLayout
            mobileOrder="right-first"
            left={
              <WizardPreviewPanel
                eyebrow="Step 2 of 6 - The gift"
                title="Gift icon preview"
                summaryLabel="Preview icon -"
              >
                <GiftIconPreview selectedIcon={defaultIconId} />
              </WizardPreviewPanel>
            }
            right={
              <WizardFormCard>
                <WizardEyebrow>Step 2 of 6 - The gift</WizardEyebrow>
                <WizardPanelTitle variant="form">The dream gift</WizardPanelTitle>
                <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
                  Describe the dream gift so contributors know what they&apos;re chipping in for.
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

                <WizardFieldWrapper
                  label="Describe the dream gift"
                  htmlFor="giftDescription"
                  tip={
                    <WizardFieldTip>
                      A clear description helps contributors feel confident about what they&apos;re
                      giving towards.
                    </WizardFieldTip>
                  }
                >
                  <WizardTextarea
                    id="giftDescription"
                    name="giftDescription"
                    placeholder="Tell guests why this gift is special..."
                    defaultValue={defaultGiftDescription}
                    rows={3}
                    enterKeyHint="next"
                  />
                </WizardFieldWrapper>

                <WizardFieldWrapper label="Gift icon" htmlFor="giftIconId">
                  <GiftIconPicker
                    selectedIconId={defaultIconId}
                    giftNameInputId="giftName"
                    giftDescriptionInputId="giftDescription"
                    defaultGiftName={defaultGiftName}
                    defaultGiftDescription={defaultGiftDescription}
                    childAge={draft?.childAge}
                  />
                </WizardFieldWrapper>

                <div className="my-6 h-px bg-border-soft" />

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
              </WizardFormCard>
            }
          />
        </form>
      </Suspense>
    </>
  );
}

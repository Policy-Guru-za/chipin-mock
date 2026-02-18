import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ChildPhotoDropZone } from '@/components/create-wizard/ChildPhotoDropZone';
import {
  WizardCTA,
  WizardEyebrow,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardSkeletonLoader,
  WizardSplitLayout,
  WizardStepper,
  WizardTextInput,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { isMockSentry } from '@/lib/config/feature-flags';
import { getDreamBoardDraft, saveDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { deleteChildPhoto, UploadChildPhotoError, uploadChildPhoto } from '@/lib/integrations/blob';
import { log } from '@/lib/observability/logger';
import * as Sentry from '@sentry/nextjs';

const childSchema = z.object({
  childName: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z\s'-]+$/, 'Letters only'),
  childAge: z.coerce.number().int().min(1).max(18),
});

async function saveChildDetailsAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const childName = formData.get('childName');
  const childAge = formData.get('childAge');
  const photo = formData.get('photo');

  const result = childSchema.safeParse({ childName, childAge });
  if (!result.success) {
    redirect('/create/child?error=invalid');
  }

  const hasNewPhoto = photo instanceof File && photo.size > 0;
  const existingDraft = await getDreamBoardDraft(session.hostId);

  if (!hasNewPhoto && !existingDraft?.childPhotoUrl) {
    redirect('/create/child?error=photo');
  }

  let saveSuccess = false;
  try {
    if (hasNewPhoto) {
      const upload = await uploadChildPhoto(photo as File, session.hostId);
      if (existingDraft?.childPhotoUrl) {
        await deleteChildPhoto(existingDraft.childPhotoUrl);
      }
      await saveDreamBoardDraft(session.hostId, {
        childName: result.data.childName,
        childAge: result.data.childAge,
        childPhotoUrl: upload.url,
        photoFilename: upload.filename,
      });
    } else {
      await saveDreamBoardDraft(session.hostId, {
        childName: result.data.childName,
        childAge: result.data.childAge,
      });
    }
    saveSuccess = true;
  } catch (error) {
    log('error', 'child_photo_upload_failed', {
      hostId: session.hostId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    if (!isMockSentry()) {
      Sentry.captureException(error, {
        tags: { area: 'upload', step: 'child' },
        extra: { hostId: session.hostId },
      });
    }
    if (error instanceof UploadChildPhotoError) {
      redirect(`/create/child?error=${error.code}`);
    }

    redirect('/create/child?error=upload_failed');
  }

  if (saveSuccess) {
    redirect('/create/gift');
  }
}

type ChildSearchParams = {
  error?: string;
};

const childErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
  invalid_type: 'Photos must be JPG, PNG, or WebP.',
  file_too_large: 'Photo must be under 5MB.',
  upload_failed: 'Upload failed. Please try again.',
};

export default async function CreateChildPage({
  searchParams,
}: {
  searchParams?: Promise<ChildSearchParams>;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;
  const errorMessage = resolveWizardError(error, childErrorMessages, {
    photo: 'Please upload a photo of your child.',
    empty_file: 'Please upload a photo of your child.',
  });

  buildCreateFlowViewModel({ step: 'child', draft });

  return (
    <>
      <WizardStepper currentStep={1} totalSteps={6} stepLabel="The child" />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        <form action={saveChildDetailsAction} encType="multipart/form-data">
          <WizardSplitLayout
            mobileOrder="right-first"
            left={<ChildPhotoDropZone existingPhotoUrl={draft?.childPhotoUrl ?? null} />}
            right={
              <WizardFormCard>
                <WizardEyebrow>Step 1 of 6 - The child</WizardEyebrow>
                <WizardPanelTitle variant="form">Child details</WizardPanelTitle>
                <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
                  Tell us a little about the birthday child.
                </p>

                <WizardFieldWrapper
                  label="Child's first name"
                  htmlFor="childName"
                >
                  <WizardTextInput
                    id="childName"
                    name="childName"
                    placeholder="e.g. Maya"
                    required
                    defaultValue={draft?.childName ?? ''}
                    autoCapitalize="words"
                    enterKeyHint="next"
                    autoComplete="given-name"
                  />
                </WizardFieldWrapper>

                <WizardFieldWrapper
                  label="Age turning this birthday"
                  htmlFor="childAge"
                  tip={
                    <WizardFieldTip>
                      {`This will be shown on the Dreamboard as "${draft?.childName ?? 'Child'} turns ${draft?.childAge ?? '?'}!"`}
                    </WizardFieldTip>
                  }
                >
                  <WizardTextInput
                    id="childAge"
                    name="childAge"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={18}
                    step={1}
                    placeholder="e.g. 7"
                    required
                    defaultValue={draft?.childAge?.toString() ?? ''}
                    enterKeyHint="done"
                  />
                </WizardFieldWrapper>

                <WizardCTA submitLabel="Continue to gift" pending={false} error={errorMessage} />
              </WizardFormCard>
            }
          />
        </form>
      </Suspense>
    </>
  );
}

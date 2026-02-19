import { Suspense } from 'react';

import { saveChildDetailsAction } from '@/app/(host)/create/child/actions';
import { ChildStepForm } from '@/app/(host)/create/child/ChildStepForm';
import {
  WizardSkeletonLoader,
  WizardStepper,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

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
        <ChildStepForm
          action={saveChildDetailsAction}
          existingPhotoUrl={draft?.childPhotoUrl ?? null}
          defaultChildName={draft?.childName ?? ''}
          defaultChildAge={draft?.childAge?.toString() ?? ''}
          error={errorMessage}
        />
      </Suspense>
    </>
  );
}

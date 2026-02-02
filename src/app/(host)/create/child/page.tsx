import Image from 'next/image';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { requireSession } from '@/lib/auth/session';
import { isDemoMode } from '@/lib/demo';
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
});

async function saveChildDetailsAction(formData: FormData) {
  'use server';

  const session = await requireSession();
  const childName = formData.get('childName');
  const photo = formData.get('photo');

  const result = childSchema.safeParse({ childName });
  if (!result.success) {
    redirect('/create/child?error=invalid');
  }

  if (!(photo instanceof File) || photo.size === 0) {
    redirect('/create/child?error=photo');
  }

  let uploadSuccess = false;
  try {
    const upload = await uploadChildPhoto(photo, session.hostId);
    const existingDraft = await getDreamBoardDraft(session.hostId);
    if (existingDraft?.childPhotoUrl) {
      await deleteChildPhoto(existingDraft.childPhotoUrl);
    }
    await saveDreamBoardDraft(session.hostId, {
      childName: result.data.childName,
      childPhotoUrl: upload.url,
      photoFilename: upload.filename,
    });
    uploadSuccess = true;
  } catch (error) {
    log('error', 'child_photo_upload_failed', {
      hostId: session.hostId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    if (!isDemoMode()) {
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

  if (uploadSuccess) {
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

const getChildErrorMessage = (error?: string) => {
  if (!error) return null;
  if (error === 'photo' || error === 'empty_file') {
    return 'Please upload a photo of your child.';
  }
  return childErrorMessages[error] ?? null;
};

export default async function CreateChildPage({
  searchParams,
}: {
  searchParams?: ChildSearchParams;
}) {
  const session = await requireSession();
  const draft = await getDreamBoardDraft(session.hostId);
  const error = searchParams?.error;
  const errorMessage = getChildErrorMessage(error);
  const view = buildCreateFlowViewModel({ step: 'child', draft });

  return (
    <CreateFlowShell stepLabel={view.stepLabel} title={view.title} subtitle={view.subtitle}>
      <Card>
        <CardHeader>
          <CardTitle>Child details</CardTitle>
          <CardDescription>Tell us who we’re celebrating and add a photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {draft?.childPhotoUrl ? (
            <div className="flex items-center gap-4">
              <Image
                src={draft.childPhotoUrl}
                alt="Child photo preview"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div className="text-sm text-text-muted">
                Photo already uploaded. Uploading a new photo will replace it.
              </div>
            </div>
          ) : null}

          <form action={saveChildDetailsAction} className="space-y-5" encType="multipart/form-data">
            <div className="space-y-2">
              <label htmlFor="childName" className="text-sm font-medium text-text">
                Child’s first name
              </label>
              <Input
                id="childName"
                name="childName"
                placeholder="e.g. Maya"
                required
                defaultValue={draft?.childName ?? ''}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="photo" className="text-sm font-medium text-text">
                Child’s photo
              </label>
              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
              />
              <p className="text-xs text-text-muted">Max 5MB. JPG, PNG, or WebP.</p>
            </div>
            <Button type="submit">Continue to gift</Button>
          </form>
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}

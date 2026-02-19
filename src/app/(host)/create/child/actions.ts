'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { isMockSentry } from '@/lib/config/feature-flags';
import { getDreamBoardDraft, saveDreamBoardDraft } from '@/lib/dream-boards/draft';
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

export async function saveChildDetailsAction(formData: FormData) {
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

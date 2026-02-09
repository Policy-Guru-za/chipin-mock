'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';
import {
  deleteChildPhoto,
  UploadChildPhotoError,
  uploadChildPhoto,
} from '@/lib/integrations/blob';
import { getDashboardDetailExpanded, updateDreamBoardForHost } from '@/lib/host/queries';

const editSchema = z.object({
  boardId: z.string().uuid(),
  childName: z.string().trim().min(2).max(30).optional(),
  partyDate: z.string().optional(),
  campaignEndDate: z.string().optional(),
});

const EDITABLE_STATUSES = new Set(['active', 'funded']);

const toDateOrNull = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = parseDateOnly(value);
  return parsed ? formatDateOnly(parsed) : null;
};

export async function updateDreamBoard(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await requireHostAuth();
  const rawBoardId = formData.get('boardId');
  const rawChildName = formData.get('childName');
  const rawPartyDate = formData.get('partyDate');
  const rawCampaignEndDate = formData.get('campaignEndDate');
  const rawPhoto = formData.get('photo');

  const parsed = editSchema.safeParse({
    boardId: typeof rawBoardId === 'string' ? rawBoardId : '',
    childName: typeof rawChildName === 'string' ? rawChildName : undefined,
    partyDate: typeof rawPartyDate === 'string' ? rawPartyDate : undefined,
    campaignEndDate: typeof rawCampaignEndDate === 'string' ? rawCampaignEndDate : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: 'Invalid edit payload.' };
  }

  const board = await getDashboardDetailExpanded(parsed.data.boardId, session.hostId);
  if (!board) {
    return { success: false, error: 'Dream Board not found.' };
  }
  if (!EDITABLE_STATUSES.has(board.status)) {
    return { success: false, error: 'This Dream Board can no longer be edited.' };
  }

  const today = parseDateOnly(new Date());
  const nextPartyDate = toDateOrNull(parsed.data.partyDate);
  const nextCampaignEndDate = toDateOrNull(parsed.data.campaignEndDate);
  const currentPartyDate = toDateOrNull(board.partyDate);
  const currentCampaignEndDate = toDateOrNull(board.campaignEndDate);

  if (nextPartyDate) {
    if (currentPartyDate && nextPartyDate < currentPartyDate) {
      return { success: false, error: 'Party date can only move forward.' };
    }
    if (today && nextPartyDate < formatDateOnly(today)) {
      return { success: false, error: 'Party date must be in the future.' };
    }
  }

  if (nextCampaignEndDate) {
    if (currentCampaignEndDate && nextCampaignEndDate < currentCampaignEndDate) {
      return { success: false, error: 'Campaign end date can only move forward.' };
    }
    if (today && nextCampaignEndDate < formatDateOnly(today)) {
      return { success: false, error: 'Campaign end date must be in the future.' };
    }
    const targetPartyDate = nextPartyDate ?? currentPartyDate;
    if (targetPartyDate && nextCampaignEndDate > targetPartyDate) {
      return { success: false, error: 'Campaign end date must be on or before the party date.' };
    }
  }

  let uploadedPhotoUrl: string | undefined;
  if (rawPhoto instanceof File && rawPhoto.size > 0) {
    try {
      const uploaded = await uploadChildPhoto(rawPhoto, session.hostId);
      uploadedPhotoUrl = uploaded.url;
    } catch (error) {
      if (error instanceof UploadChildPhotoError) {
        if (error.code === 'invalid_type') {
          return { success: false, error: 'Photo must be a PNG, JPG, or WebP image.' };
        }
        if (error.code === 'file_too_large') {
          return { success: false, error: 'Photo must be 5MB or smaller.' };
        }
      }
      return { success: false, error: 'Could not upload the new photo.' };
    }
  }

  const updated = await updateDreamBoardForHost(parsed.data.boardId, session.hostId, {
    childName: parsed.data.childName?.trim(),
    childPhotoUrl: uploadedPhotoUrl,
    partyDate: nextPartyDate ?? undefined,
    campaignEndDate: nextCampaignEndDate ?? undefined,
  });

  if (!updated) {
    return { success: false, error: 'No changes were saved.' };
  }

  if (uploadedPhotoUrl && board.childPhotoUrl !== uploadedPhotoUrl) {
    try {
      await deleteChildPhoto(board.childPhotoUrl);
    } catch {
      // Non-blocking cleanup.
    }
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/${parsed.data.boardId}`);
  return { success: true };
}

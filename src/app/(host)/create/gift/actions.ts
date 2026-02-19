import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const manualGiftSchema = z.object({
  giftName: z.string().min(2).max(200),
  message: z.string().max(280).optional(),
});

const toOptionalString = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export async function saveManualGiftAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'gift', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft?.childPhotoUrl) {
    redirect('/create/child');
  }

  const payload = {
    giftName: formData.get('giftName'),
    message: toOptionalString(formData.get('message')),
  };

  const result = manualGiftSchema.safeParse(payload);
  if (!result.success) {
    redirect('/create/gift?error=invalid');
  }

  await updateDreamBoardDraft(session.hostId, {
    giftName: result.data.giftName.trim(),
    giftDescription: undefined,
    giftIconId: undefined,
    giftImageUrl: '/icons/gifts/gifta-logo.png',
    giftImagePrompt: undefined,
    goalCents: 0,
    message: result.data.message,
  });

  redirect('/create/dates');
}

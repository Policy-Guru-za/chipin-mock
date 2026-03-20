import { redirect } from 'next/navigation';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { updateDreamBoardDraft } from '@/lib/dream-boards/draft';

export async function saveGivingBackAction(_formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  await updateDreamBoardDraft(session.hostId, {
    charityEnabled: false,
    charityId: undefined,
    charitySplitType: undefined,
    charityPercentageBps: undefined,
    charityThresholdCents: undefined,
  });

  redirect('/create/payout');
}

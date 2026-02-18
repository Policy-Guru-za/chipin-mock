import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { publishDreamBoardAction } from '@/app/(host)/create/review/actions';
import { ReviewClient } from '@/app/(host)/create/review/ReviewClient';
import { WizardSkeletonLoader } from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { dreamBoardDraftSchema } from '@/lib/dream-boards/schema';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

export default async function CreateReviewPage() {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'review', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }

  const parsed = dreamBoardDraftSchema.safeParse(draft);
  if (!parsed.success) {
    redirect('/create');
  }

  return (
    <Suspense fallback={<WizardSkeletonLoader variant="centered" />}>
      <ReviewClient
        draft={{
          childName: parsed.data.childName,
          childAge: parsed.data.childAge,
          childPhotoUrl: parsed.data.childPhotoUrl,
          birthdayDate: parsed.data.birthdayDate,
          partyDate: parsed.data.partyDate,
          partyDateTime: parsed.data.partyDateTime ?? null,
          campaignEndDate: parsed.data.campaignEndDate,
          giftName: parsed.data.giftName,
          giftImageUrl: parsed.data.giftImageUrl,
          payoutMethod: parsed.data.payoutMethod,
          payoutEmail: parsed.data.payoutEmail,
          hostWhatsAppNumber: parsed.data.hostWhatsAppNumber,
          karriCardHolderName: parsed.data.karriCardHolderName,
          bankName: parsed.data.bankName,
          bankAccountLast4: parsed.data.bankAccountLast4,
          charityEnabled: parsed.data.charityEnabled,
          charitySplitType: parsed.data.charitySplitType,
          charityPercentageBps: parsed.data.charityPercentageBps,
          charityThresholdCents: parsed.data.charityThresholdCents,
        }}
        publishAction={publishDreamBoardAction}
      />
    </Suspense>
  );
}

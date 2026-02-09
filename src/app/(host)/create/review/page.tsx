import { redirect } from 'next/navigation';

import { ReviewClient, type PublishState } from '@/app/(host)/create/review/ReviewClient';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { clearDreamBoardDraft, getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { dreamBoardDraftSchema } from '@/lib/dream-boards/schema';
import { db } from '@/lib/db';
import { DEFAULT_PARTNER_ID } from '@/lib/db/partners';
import { dreamBoards } from '@/lib/db/schema';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { sendDreamBoardLink } from '@/lib/integrations/whatsapp';
import { log } from '@/lib/observability/logger';
import { generateSlug } from '@/lib/utils/slug';

async function publishDreamBoardAction(
  _state: PublishState,
  _formData: FormData
): Promise<PublishState> {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const parsed = dreamBoardDraftSchema.safeParse(draft);

  if (!parsed.success) {
    return {
      status: 'preview',
      error: 'Please complete all create steps before publishing.',
    };
  }

  try {
    const slug = generateSlug(parsed.data.childName);
    const [created] = await db
      .insert(dreamBoards)
      .values({
        partnerId: DEFAULT_PARTNER_ID,
        hostId: session.hostId,
        slug,
        childName: parsed.data.childName,
        childAge: parsed.data.childAge,
        childPhotoUrl: parsed.data.childPhotoUrl,
        birthdayDate: parsed.data.birthdayDate,
        partyDate: parsed.data.partyDate,
        campaignEndDate: parsed.data.campaignEndDate,
        giftName: parsed.data.giftName,
        giftDescription: parsed.data.giftDescription,
        giftImageUrl: parsed.data.giftImageUrl,
        giftImagePrompt: parsed.data.giftImagePrompt,
        goalCents: parsed.data.goalCents,
        payoutMethod: parsed.data.payoutMethod,
        karriCardNumber:
          parsed.data.payoutMethod === 'karri_card' ? parsed.data.karriCardNumberEncrypted : null,
        karriCardHolderName:
          parsed.data.payoutMethod === 'karri_card' ? parsed.data.karriCardHolderName : null,
        bankName: parsed.data.payoutMethod === 'bank' ? (parsed.data.bankName ?? null) : null,
        bankAccountNumberEncrypted:
          parsed.data.payoutMethod === 'bank' ? (parsed.data.bankAccountNumberEncrypted ?? null) : null,
        bankAccountLast4:
          parsed.data.payoutMethod === 'bank' ? (parsed.data.bankAccountLast4 ?? null) : null,
        bankBranchCode:
          parsed.data.payoutMethod === 'bank' ? (parsed.data.bankBranchCode ?? null) : null,
        bankAccountHolder:
          parsed.data.payoutMethod === 'bank' ? (parsed.data.bankAccountHolder ?? null) : null,
        charityEnabled: parsed.data.charityEnabled ?? false,
        charityId: parsed.data.charityEnabled ? (parsed.data.charityId ?? null) : null,
        charitySplitType: parsed.data.charityEnabled ? (parsed.data.charitySplitType ?? null) : null,
        charityPercentageBps: parsed.data.charityEnabled
          ? (parsed.data.charityPercentageBps ?? null)
          : null,
        charityThresholdCents: parsed.data.charityEnabled
          ? (parsed.data.charityThresholdCents ?? null)
          : null,
        hostWhatsAppNumber: parsed.data.hostWhatsAppNumber,
        message: parsed.data.message,
        payoutEmail: parsed.data.payoutEmail,
        status: 'active',
      })
      .returning({ id: dreamBoards.id });

    if (!created) {
      return {
        status: 'preview',
        error: 'Could not publish your Dream Board. Please try again.',
      };
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://gifta.co').replace(/\/$/, '');
    const shareUrl = `${baseUrl}/${slug}`;

    try {
      await sendDreamBoardLink(parsed.data.hostWhatsAppNumber, shareUrl, parsed.data.childName);
    } catch (error) {
      log('error', 'whatsapp.dream_board_link_failed', {
        hostId: session.hostId,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }

    await clearDreamBoardDraft(session.hostId);

    return {
      status: 'published',
      boardId: created.id,
      slug,
      shareUrl,
    };
  } catch (error) {
    log('error', 'dream_board_publish_failed', {
      hostId: session.hostId,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return {
      status: 'preview',
      error: 'Something went wrong while publishing. Please try again.',
    };
  }
}

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
    <ReviewClient
      draft={{
        childName: parsed.data.childName,
        childAge: parsed.data.childAge,
        childPhotoUrl: parsed.data.childPhotoUrl,
        birthdayDate: parsed.data.birthdayDate,
        partyDate: parsed.data.partyDate,
        campaignEndDate: parsed.data.campaignEndDate,
        giftName: parsed.data.giftName,
        giftImageUrl: parsed.data.giftImageUrl,
        goalCents: parsed.data.goalCents,
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
  );
}

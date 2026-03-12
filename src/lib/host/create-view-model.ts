import type { DreamBoardDraft } from '@/lib/dream-boards/draft';
import { DEFAULT_HOST_CREATE_PAYOUT_METHOD } from '@/lib/dream-boards/payout-methods';

export const CREATE_FLOW_TOTAL_STEPS = 5 as const;

export type CreateFlowStep = 'child' | 'gift' | 'dates' | 'voucher' | 'review';

type GiftPreview = {
  title: string;
  subtitle?: string;
  imageUrl: string;
};

export type CreateFlowViewModel = {
  step: CreateFlowStep;
  stepLabel: string;
  title: string;
  subtitle?: string;
  redirectTo?: string;
  childName?: string;
  childPhotoUrl?: string;
  giftPreview?: GiftPreview;
  giftTitle?: string;
  message?: string;
};

const stepLabels: Record<CreateFlowStep, string> = {
  child: 'Step 1 of 5 — The Child',
  gift: 'Step 2 of 5 — The Gift',
  dates: 'Step 3 of 5 — The Dates',
  voucher: 'Step 4 of 5 — Voucher Details',
  review: 'Step 5 of 5 — Review',
};

const getStepTitle = (step: CreateFlowStep, childName?: string) => {
  if (step === 'child') return "Who's the birthday star?";
  if (step === 'gift') {
    return childName ? `What's ${childName}'s dream gift?` : "What's the dream gift?";
  }
  if (step === 'dates') return "When's the big day?";
  if (step === 'voucher') return 'Where should we send voucher updates?';
  return 'Review your Dreamboard';
};

const getStepSubtitle = (step: CreateFlowStep, childName?: string) => {
  if (step === 'voucher') {
    return childName
      ? `We’ll use these details when ${childName}'s Dreamboard closes.`
      : 'We’ll use these details when the Dreamboard closes.';
  }
  return undefined;
};

const buildGiftPreview = (draft?: DreamBoardDraft): GiftPreview | undefined => {
  if (!draft?.giftName || !draft?.giftImageUrl) return undefined;

  return {
    title: draft.giftName,
    subtitle: draft.giftDescription,
    imageUrl: draft.giftImageUrl,
  };
};

const getGiftTitle = (draft?: DreamBoardDraft) => {
  return draft?.giftName;
};

const isChildComplete = (draft?: DreamBoardDraft | null) =>
  [draft?.childName, draft?.childPhotoUrl, draft?.childAge].every(Boolean);

const isGiftComplete = (draft?: DreamBoardDraft | null) =>
  [draft?.giftName, draft?.giftImageUrl].every(Boolean);

const isDatesComplete = (draft?: DreamBoardDraft | null) =>
  Boolean(draft?.birthdayDate && draft?.partyDate && draft?.campaignEndDate);

const isVoucherComplete = (draft?: DreamBoardDraft | null) =>
  Boolean(
    draft?.payoutEmail &&
      draft?.hostWhatsAppNumber &&
      (draft?.payoutMethod ?? DEFAULT_HOST_CREATE_PAYOUT_METHOD) ===
        DEFAULT_HOST_CREATE_PAYOUT_METHOD
  );

const getCompletionState = (draft?: DreamBoardDraft | null) => ({
  childComplete: isChildComplete(draft),
  giftComplete: isGiftComplete(draft),
  datesComplete: isDatesComplete(draft),
  voucherComplete: isVoucherComplete(draft),
});

const redirectRules: Record<
  CreateFlowStep,
  Array<(completion: ReturnType<typeof getCompletionState>) => string | undefined>
> = {
  child: [],
  gift: [(completion) => (!completion.childComplete ? '/create/child' : undefined)],
  dates: [(completion) => (!completion.giftComplete ? '/create/gift' : undefined)],
  voucher: [(completion) => (!completion.datesComplete ? '/create/dates' : undefined)],
  review: [(completion) => (!completion.voucherComplete ? '/create/voucher' : undefined)],
};

const getRedirectTarget = (
  step: CreateFlowStep,
  completion: ReturnType<typeof getCompletionState>
) => {
  for (const rule of redirectRules[step]) {
    const target = rule(completion);
    if (target) return target;
  }
  return undefined;
};

export const buildCreateFlowViewModel = (params: {
  step: CreateFlowStep;
  draft?: DreamBoardDraft | null;
}): CreateFlowViewModel => {
  const { step, draft } = params;
  const completion = getCompletionState(draft);
  const redirectTo = getRedirectTarget(step, completion);

  return {
    step,
    stepLabel: stepLabels[step],
    title: getStepTitle(step, draft?.childName),
    subtitle: getStepSubtitle(step, draft?.childName),
    redirectTo,
    childName: draft?.childName,
    childPhotoUrl: draft?.childPhotoUrl,
    giftPreview: buildGiftPreview(draft ?? undefined),
    giftTitle: getGiftTitle(draft ?? undefined),
    message: draft?.message,
  };
};

import type { HostCreateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { DEFAULT_HOST_CREATE_PAYOUT_METHOD } from '@/lib/dream-boards/payout-methods';

export const CREATE_FLOW_TOTAL_STEPS = 5 as const;

export type CreateFlowStep = 'child' | 'gift' | 'dates' | 'payout' | 'review';

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
  payout: 'Step 4 of 5 — Payout Details',
  review: 'Step 5 of 5 — Review',
};

const getStepTitle = (step: CreateFlowStep, childName?: string) => {
  if (step === 'child') return "Who's the birthday star?";
  if (step === 'gift') {
    return childName ? `What's ${childName}'s dream gift?` : "What's the dream gift?";
  }
  if (step === 'dates') return "When's the big day?";
  if (step === 'payout') return 'Where should the funds go?';
  return 'Review your Dreamboard';
};

const getStepSubtitle = (step: CreateFlowStep, childName?: string) => {
  if (step === 'payout') {
    return childName
      ? `Choose the payout destination we should use when ${childName}'s Dreamboard closes.`
      : 'Choose the payout destination we should use when the Dreamboard closes.';
  }
  return undefined;
};

const buildGiftPreview = (draft?: HostCreateDreamBoardDraft): GiftPreview | undefined => {
  if (!draft?.giftName || !draft?.giftImageUrl) return undefined;

  return {
    title: draft.giftName,
    subtitle: draft.giftDescription,
    imageUrl: draft.giftImageUrl,
  };
};

const getGiftTitle = (draft?: HostCreateDreamBoardDraft) => {
  return draft?.giftName;
};

const isChildComplete = (draft?: HostCreateDreamBoardDraft | null) =>
  [draft?.childName, draft?.childPhotoUrl, draft?.childAge].every(Boolean);

const isGiftComplete = (draft?: HostCreateDreamBoardDraft | null) =>
  [draft?.giftName, draft?.giftImageUrl].every(Boolean);

const isDatesComplete = (draft?: HostCreateDreamBoardDraft | null) =>
  Boolean(draft?.birthdayDate && draft?.partyDate && draft?.campaignEndDate);

const isPayoutComplete = (draft?: HostCreateDreamBoardDraft | null) => {
  if (!draft?.payoutEmail || !draft.hostWhatsAppNumber) {
    return false;
  }

  const payoutMethod = draft.payoutMethod ?? DEFAULT_HOST_CREATE_PAYOUT_METHOD;

  if (payoutMethod === 'karri_card') {
    return Boolean(draft.karriCardNumberEncrypted && draft.karriCardHolderName);
  }

  if (payoutMethod === 'bank') {
    return Boolean(
      draft.bankName &&
        draft.bankAccountNumberEncrypted &&
        draft.bankAccountLast4 &&
        draft.bankBranchCode &&
        draft.bankAccountHolder
    );
  }

  return false;
};

const getCompletionState = (draft?: HostCreateDreamBoardDraft | null) => ({
  childComplete: isChildComplete(draft),
  giftComplete: isGiftComplete(draft),
  datesComplete: isDatesComplete(draft),
  payoutComplete: isPayoutComplete(draft),
});

const redirectRules: Record<
  CreateFlowStep,
  Array<(completion: ReturnType<typeof getCompletionState>) => string | undefined>
> = {
  child: [],
  gift: [(completion) => (!completion.childComplete ? '/create/child' : undefined)],
  dates: [(completion) => (!completion.giftComplete ? '/create/gift' : undefined)],
  payout: [(completion) => (!completion.datesComplete ? '/create/dates' : undefined)],
  review: [(completion) => (!completion.payoutComplete ? '/create/payout' : undefined)],
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
  draft?: HostCreateDreamBoardDraft | null;
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

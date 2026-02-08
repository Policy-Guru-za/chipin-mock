import type { DreamBoardDraft } from '@/lib/dream-boards/draft';

export type CreateFlowStep = 'child' | 'gift' | 'dates' | 'giving-back' | 'payout' | 'review';

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
  goalLabel?: string;
  message?: string;
};

const stepLabels: Record<CreateFlowStep, string> = {
  child: 'Step 1 of 6 — The Child',
  gift: 'Step 2 of 6 — The Gift',
  dates: 'Step 3 of 6 — The Dates',
  'giving-back': 'Step 4 of 6 — Giving Back',
  payout: 'Step 5 of 6 — Payout Setup',
  review: 'Step 6 of 6 — Review',
};

const getStepTitle = (step: CreateFlowStep, childName?: string) => {
  if (step === 'child') return "Who's the birthday star?";
  if (step === 'gift') {
    return childName ? `What's ${childName}'s dream gift?` : "What's the dream gift?";
  }
  if (step === 'dates') return "When's the big day?";
  if (step === 'giving-back') return 'Want to share the love? 💚';
  if (step === 'payout') return 'How should we send your payout?';
  return 'Review your Dream Board';
};

const getStepSubtitle = (step: CreateFlowStep, childName?: string) => {
  if (step === 'giving-back') {
    return childName
      ? `Help a cause while celebrating ${childName}.`
      : 'Help a cause while celebrating.';
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

const getGoalLabel = (draft?: DreamBoardDraft) => {
  if (!draft?.goalCents) return undefined;
  return `R${(draft.goalCents / 100).toFixed(2)}`;
};

const isChildComplete = (draft?: DreamBoardDraft | null) =>
  [draft?.childName, draft?.childPhotoUrl, draft?.childAge].every(Boolean);

const isGiftComplete = (draft?: DreamBoardDraft | null) =>
  [draft?.giftName, draft?.giftImageUrl, draft?.goalCents].every(Boolean);

const isDatesComplete = (draft?: DreamBoardDraft | null) =>
  Boolean(draft?.birthdayDate && draft?.partyDate && draft?.campaignEndDate);

const isGivingBackComplete = (draft?: DreamBoardDraft | null) => {
  if (draft?.charityEnabled === false) {
    return true;
  }
  if (draft?.charityEnabled !== true) {
    return false;
  }

  const hasSplitValue =
    draft.charitySplitType === 'percentage'
      ? draft.charityPercentageBps !== undefined && draft.charityPercentageBps !== null
      : draft.charitySplitType === 'threshold'
        ? draft.charityThresholdCents !== undefined && draft.charityThresholdCents !== null
        : false;

  return Boolean(draft.charityId && draft.charitySplitType && hasSplitValue);
};

const isPayoutComplete = (draft?: DreamBoardDraft | null) =>
  Boolean(
    draft?.payoutEmail &&
      draft?.hostWhatsAppNumber &&
      ((draft?.payoutMethod ?? 'karri_card') === 'karri_card'
        ? draft?.karriCardNumberEncrypted && draft?.karriCardHolderName
        : draft?.bankName &&
            draft?.bankAccountNumberEncrypted &&
            draft?.bankAccountLast4 &&
            draft?.bankBranchCode &&
            draft?.bankAccountHolder)
  );

const getCompletionState = (draft?: DreamBoardDraft | null) => ({
  childComplete: isChildComplete(draft),
  giftComplete: isGiftComplete(draft),
  datesComplete: isDatesComplete(draft),
  givingBackComplete: isGivingBackComplete(draft),
  payoutComplete: isPayoutComplete(draft),
});

const redirectRules: Record<
  CreateFlowStep,
  Array<(completion: ReturnType<typeof getCompletionState>) => string | undefined>
> = {
  child: [],
  gift: [(completion) => (!completion.childComplete ? '/create/child' : undefined)],
  dates: [(completion) => (!completion.giftComplete ? '/create/gift' : undefined)],
  'giving-back': [(completion) => (!completion.datesComplete ? '/create/dates' : undefined)],
  payout: [(completion) => (!completion.givingBackComplete ? '/create/giving-back' : undefined)],
  review: [
    (completion) => (!completion.payoutComplete ? '/create/payout' : undefined),
  ],
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
    goalLabel: getGoalLabel(draft ?? undefined),
    message: draft?.message,
  };
};

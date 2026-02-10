import type { getContributionByPaymentRef, getDreamBoardBySlug } from '@/lib/db/queries';
import { parseDateOnly } from '@/lib/utils/date';

import { getGiftInfo } from './gift-info';

type DreamBoardRecord = NonNullable<Awaited<ReturnType<typeof getDreamBoardBySlug>>>;
type ContributionRecord = Awaited<ReturnType<typeof getContributionByPaymentRef>>;

type GuestViewModelOptions = {
  now?: Date;
};

export type TimeRemainingUrgency =
  | 'relaxed'
  | 'moderate'
  | 'urgent'
  | 'critical'
  | 'expired';

export type GuestViewModel = {
  hostId: string;
  childName: string;
  childPhotoUrl: string;
  slug: string;
  partyDateTime: string | null;
  giftTitle: string;
  giftSubtitle: string;
  giftImage: string;
  displayTitle: string;
  displaySubtitle: string;
  displayImage: string;
  charityEnabled: boolean;
  charityName: string | null;
  charityDescription: string | null;
  charityLogoUrl: string | null;
  charityAllocationLabel: string | null;
  timeRemainingMessage: string;
  timeRemainingUrgency: TimeRemainingUrgency;
  isActive: boolean;
  isFunded: boolean;
  isExpired: boolean;
  isClosed: boolean;
  daysLeft: number;
  contributionCount: number;
  message: string | null;
};

export type ContributionViewModel = GuestViewModel & {
  headline: string;
};

export type ThankYouViewModel = {
  headline: string;
  message: string;
  shareHref: string;
  contributeHref: string;
  isContributionCompleted: boolean;
  contributorName: string | null;
  isAnonymous: boolean;
  contributionAmountCents: number;
  charityEnabled: boolean;
  charityName: string | null;
  charityDescription: string | null;
  charityLogoUrl: string | null;
  charityAmountCents: number | null;
  childName: string;
  contributionId: string | null;
  contributorEmail: string | null;
};

const toIsoDateTime = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const toEndOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const getDaysLeftExactFrom = (targetDate: Date, now: Date) => {
  const diff = toEndOfDay(targetDate).getTime() - now.getTime();
  if (diff <= 0) return 0;
  return diff / (1000 * 60 * 60 * 24);
};

const getDaysLeftFrom = (targetDate: Date, now: Date) => {
  const exactDays = getDaysLeftExactFrom(targetDate, now);
  if (exactDays <= 0) return 0;
  return Math.ceil(exactDays);
};

const getDisplayInfo = (params: {
  giftTitle: string;
  giftSubtitle: string;
  giftImage: string;
  fallbackImage: string;
}) => ({
  displayTitle: params.giftTitle,
  displaySubtitle: params.giftSubtitle,
  displayImage: params.giftImage || params.fallbackImage,
});

const getContributionHeadline = (view: GuestViewModel) =>
  `Chip in for ${view.childName}'s dream gift`;

const getContributorName = (contribution?: ContributionRecord | null) =>
  contribution?.contributorName || 'Friend';

const getThankYouMessage = (params: { board: DreamBoardRecord; isComplete: boolean }) => {
  if (!params.isComplete) {
    return 'We’ll update this page once your payment is confirmed.';
  }

  return `You're helping ${params.board.childName} get their dream gift.`;
};

const getThankYouCopy = (params: {
  board: DreamBoardRecord;
  contribution?: ContributionRecord | null;
}) => {
  const name = getContributorName(params.contribution);
  const isComplete = params.contribution?.paymentStatus === 'completed';

  const thankYouMessage = getThankYouMessage({
    board: params.board,
    isComplete,
  });

  return {
    headline: isComplete ? `Thank you, ${name}!` : 'Thanks for your support!',
    message: thankYouMessage,
    isComplete,
  };
};

const resolveTargetDate = (board: DreamBoardRecord) => {
  const campaignEndDate = parseDateOnly(board.campaignEndDate ?? undefined);
  if (campaignEndDate) return campaignEndDate;
  return parseDateOnly(board.partyDate ?? undefined);
};

const isBoardExpired = (board: DreamBoardRecord, now: Date) => {
  const partyDate = parseDateOnly(board.partyDate ?? undefined);
  const campaignEndDate = parseDateOnly(board.campaignEndDate ?? undefined);

  const hasPartyExpired = partyDate ? now.getTime() > toEndOfDay(partyDate).getTime() : false;
  const hasCampaignExpired = campaignEndDate
    ? now.getTime() > toEndOfDay(campaignEndDate).getTime()
    : false;

  return hasPartyExpired || hasCampaignExpired;
};

const getTimeRemainingInfo = (params: { board: DreamBoardRecord; now: Date }) => {
  const expired = isBoardExpired(params.board, params.now);
  if (expired) {
    return {
      message: 'This Dreamboard is closed to new contributions.',
      urgency: 'expired' as const,
      daysLeft: 0,
    };
  }

  const targetDate = resolveTargetDate(params.board);
  const exactDays = targetDate ? getDaysLeftExactFrom(targetDate, params.now) : 0;
  const roundedDaysLeft = targetDate ? getDaysLeftFrom(targetDate, params.now) : 0;

  if (exactDays > 14) {
    return {
      message: 'Plenty of time to make this birthday special! ⏰',
      urgency: 'relaxed' as const,
      daysLeft: roundedDaysLeft,
    };
  }

  if (exactDays >= 7) {
    return {
      message: `${roundedDaysLeft} days left to chip in 🎁`,
      urgency: 'moderate' as const,
      daysLeft: roundedDaysLeft,
    };
  }

  if (exactDays >= 2) {
    return {
      message: `Just ${roundedDaysLeft} days left! 🎁`,
      urgency: 'urgent' as const,
      daysLeft: roundedDaysLeft,
    };
  }

  if (exactDays >= 1) {
    return {
      message: "Last day! 🎁 Don't miss out.",
      urgency: 'critical' as const,
      daysLeft: roundedDaysLeft,
    };
  }

  return {
    message: 'Final hours! ⏰ Chip in now.',
    urgency: 'critical' as const,
    daysLeft: roundedDaysLeft,
  };
};

const getCharityAllocationLabel = (board: DreamBoardRecord) => {
  if (!board.charityEnabled || !board.charityName) {
    return null;
  }

  if (board.charitySplitType === 'percentage' && board.charityPercentageBps) {
    return `${Math.round(board.charityPercentageBps / 100)}% of contributions support ${board.charityName}`;
  }

  if (board.charitySplitType === 'threshold' && board.charityThresholdCents) {
    return `Up to R${Math.round(board.charityThresholdCents / 100).toLocaleString('en-ZA')} will go to ${board.charityName}`;
  }

  return null;
};

const getThankYouCharityAmountCents = (params: {
  board: DreamBoardRecord;
  contribution?: ContributionRecord | null;
}) => {
  if (!params.board.charityEnabled || !params.contribution) {
    return null;
  }

  if (typeof params.contribution.charityCents === 'number') {
    return params.contribution.charityCents;
  }

  return null;
};

export const buildGuestViewModel = (
  board: DreamBoardRecord,
  options: GuestViewModelOptions = {}
): GuestViewModel => {
  const now = options.now ?? new Date();
  const timeRemaining = getTimeRemainingInfo({ board, now });
  const isExpired = isBoardExpired(board, now);
  const isActive = board.status === 'active';
  const isFunded = board.status === 'funded';
  const { giftTitle, giftSubtitle, giftImage } = getGiftInfo({
    giftName: board.giftName ?? null,
    giftDescription: null,
    giftImageUrl: board.giftImageUrl ?? null,
  });

  const { displayTitle, displaySubtitle, displayImage } = getDisplayInfo({
    giftTitle,
    giftSubtitle,
    giftImage,
    fallbackImage: board.childPhotoUrl,
  });

  return {
    hostId: board.hostId,
    childName: board.childName,
    childPhotoUrl: board.childPhotoUrl,
    slug: board.slug,
    partyDateTime: toIsoDateTime(board.partyDateTime),
    giftTitle,
    giftSubtitle,
    giftImage,
    displayTitle,
    displaySubtitle,
    displayImage,
    charityEnabled: board.charityEnabled,
    charityName: board.charityName ?? null,
    charityDescription: board.charityDescription ?? null,
    charityLogoUrl: board.charityLogoUrl ?? null,
    charityAllocationLabel: getCharityAllocationLabel(board),
    timeRemainingMessage: timeRemaining.message,
    timeRemainingUrgency: timeRemaining.urgency,
    isActive,
    isFunded,
    isExpired,
    isClosed: board.status !== 'active' && board.status !== 'funded',
    daysLeft: timeRemaining.daysLeft,
    contributionCount: board.contributionCount,
    message: board.message ?? null,
  };
};

export const buildContributionViewModel = (board: DreamBoardRecord): ContributionViewModel => {
  const view = buildGuestViewModel(board);

  return {
    ...view,
    headline: getContributionHeadline(view),
  };
};

export const buildThankYouViewModel = (params: {
  board: DreamBoardRecord;
  contribution?: ContributionRecord | null;
}): ThankYouViewModel => {
  const { headline, message, isComplete } = getThankYouCopy(params);

  return {
    headline,
    message,
    shareHref: `/${params.board.slug}`,
    contributeHref: `/${params.board.slug}/contribute`,
    isContributionCompleted: isComplete,
    contributorName: params.contribution?.contributorName ?? null,
    isAnonymous: params.contribution
      ? params.contribution.isAnonymous || !params.contribution.contributorName
      : false,
    contributionAmountCents: params.contribution?.amountCents ?? 0,
    charityEnabled: params.board.charityEnabled,
    charityName: params.board.charityName ?? null,
    charityDescription: params.board.charityDescription ?? null,
    charityLogoUrl: params.board.charityLogoUrl ?? null,
    charityAmountCents: getThankYouCharityAmountCents(params),
    childName: params.board.childName,
    contributionId: params.contribution?.id ?? null,
    contributorEmail: params.contribution?.contributorEmail ?? null,
  };
};

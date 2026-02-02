import type { getContributionByPaymentRef, getDreamBoardBySlug } from '@/lib/db/queries';
import { parseDateOnly } from '@/lib/utils/date';

import { getGiftInfo } from './gift-info';

type DreamBoardRecord = NonNullable<Awaited<ReturnType<typeof getDreamBoardBySlug>>>;
type ContributionRecord = Awaited<ReturnType<typeof getContributionByPaymentRef>>;

type GuestViewModelOptions = {
  now?: Date;
};

export type GuestViewModel = {
  childName: string;
  childPhotoUrl: string;
  slug: string;
  giftTitle: string;
  giftSubtitle: string;
  giftImage: string;
  displayTitle: string;
  displaySubtitle: string;
  displayImage: string;
  funded: boolean;
  isClosed: boolean;
  percentage: number;
  daysLeft: number;
  contributionCount: number;
  raisedCents: number;
  goalCents: number;
  message: string | null;
};

export type ContributionViewModel = GuestViewModel & {
  headline: string;
};

export type ThankYouViewModel = {
  headline: string;
  message: string;
  percentage: number;
  shareHref: string;
  contributeHref: string;
};

const getDaysLeftFrom = (partyDate: Date, now: Date) => {
  const diff = partyDate.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
  `Contribute to ${view.childName}'s dream gift`;

const getContributorName = (contribution?: ContributionRecord | null) =>
  contribution?.contributorName || 'Friend';

const getThankYouMessage = (params: { board: DreamBoardRecord; isComplete: boolean }) => {
  if (!params.isComplete) {
    return 'We’ll update this page once your payment is confirmed.';
  }

  return `Your contribution is helping ${params.board.childName} get their dream gift.`;
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
  };
};

export const buildGuestViewModel = (
  board: DreamBoardRecord,
  options: GuestViewModelOptions = {}
): GuestViewModel => {
  const now = options.now ?? new Date();
  const partyDate = parseDateOnly(board.partyDate ?? undefined);
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
    childName: board.childName,
    childPhotoUrl: board.childPhotoUrl,
    slug: board.slug,
    giftTitle,
    giftSubtitle,
    giftImage,
    displayTitle,
    displaySubtitle,
    displayImage,
    funded: board.raisedCents >= board.goalCents,
    isClosed: board.status !== 'active' && board.status !== 'funded',
    percentage: Math.min(100, Math.round((board.raisedCents / board.goalCents) * 100)),
    daysLeft: partyDate ? getDaysLeftFrom(partyDate, now) : 0,
    contributionCount: board.contributionCount,
    raisedCents: board.raisedCents,
    goalCents: board.goalCents,
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
  const { headline, message } = getThankYouCopy(params);
  const percentage = Math.min(
    100,
    Math.round((params.board.raisedCents / params.board.goalCents) * 100)
  );

  return {
    headline,
    message,
    percentage,
    shareHref: `/${params.board.slug}`,
    contributeHref: `/${params.board.slug}/contribute`,
  };
};

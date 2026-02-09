import { getGiftInfo } from '@/lib/dream-boards/gift-info';
import type {
  HostDashboardDetailRow,
  HostDashboardListRow,
  HostPayoutRow,
} from '@/lib/host/queries';
import { parseDateOnly } from '@/lib/utils/date';
import { formatZar } from '@/lib/utils/money';

const DAY_MS = 24 * 60 * 60 * 1000;

export type DashboardStatusVariant =
  | 'active'
  | 'funded'
  | 'closed'
  | 'paid_out'
  | 'expired'
  | 'cancelled'
  | 'draft';

export interface DashboardCardViewModel {
  boardId: string;
  boardTitle: string;
  percentage: number;
  raisedLabel: string;
  contributionCount: number;
  statusLabel: string;
  manageHref: string;
  displayTitle: string;
  displaySubtitle: string;
  displayImage: string | null;
  slug: string;
  childPhotoUrl: string | null;
  partyDate: Date | null;
  campaignEndDate: Date | null;
  daysRemaining: number | null;
  timeLabel: string;
  statusVariant: DashboardStatusVariant;
  isComplete: boolean;
  charityEnabled: boolean;
}

export interface PayoutSummary {
  id: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  statusVariant: 'amber' | 'blue' | 'green' | 'red';
  netCents: number;
  amountLabel: string;
  externalRef: string | null;
  completedAt: Date | null;
  completedLabel: string | null;
}

export interface DashboardDetailViewModel {
  boardId: string;
  slug: string;
  childName: string;
  childPhotoUrl: string | null;
  giftName: string;
  giftImageUrl: string | null;
  partyDate: Date | null;
  campaignEndDate: Date | null;
  status: string;
  statusLabel: string;
  statusVariant: DashboardStatusVariant;
  message: string | null;
  goalCents: number;
  raisedCents: number;
  percentage: number;
  raisedLabel: string;
  goalLabel: string;
  progressLabel: string;
  totalFeeCents: number;
  totalCharityCents: number;
  netPayoutCents: number;
  feeLabel: string;
  charityLabel: string;
  payoutLabel: string;
  contributionCount: number;
  messageCount: number;
  daysRemaining: number | null;
  timeLabel: string;
  payoutMethod: string;
  payoutMethodLabel: string;
  payoutRecipientDisplay: string;
  payouts: PayoutSummary[];
  charityEnabled: boolean;
  charityName: string | null;
  shareUrl: string;
  publicUrl: string;
  isComplete: boolean;
  isFunded: boolean;
  isEditable: boolean;
}

export type DashboardViewModel = {
  boardTitle: string;
  statusLabel: string;
  percentage: number;
  raisedLabel: string;
  contributionCount: number;
  manageHref: string;
  shareUrl?: string;
  displayTitle: string;
  displaySubtitle: string;
  displayImage: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Active',
  active: 'Active',
  funded: 'Funded!',
  closed: 'Complete',
  paid_out: 'Complete',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_VARIANTS: Record<string, DashboardStatusVariant> = {
  draft: 'draft',
  active: 'active',
  funded: 'funded',
  closed: 'closed',
  paid_out: 'paid_out',
  expired: 'expired',
  cancelled: 'cancelled',
};

const PAYOUT_STATUS_LABELS: Record<string, { label: string; variant: PayoutSummary['statusVariant'] }> = {
  pending: { label: 'Pending', variant: 'amber' },
  processing: { label: 'Processing', variant: 'blue' },
  completed: { label: 'Sent', variant: 'green' },
  failed: { label: 'Failed', variant: 'red' },
};

const toDate = (value: string | Date | null | undefined) => parseDateOnly(value ?? null);

const toStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatCompactDate = (date: Date) =>
  date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  });

const resolveTime = (dateValue: string | Date | null | undefined) => {
  const date = toDate(dateValue);
  if (!date) {
    return { daysRemaining: null, timeLabel: 'No deadline' };
  }

  const today = toStartOfDay(new Date());
  const target = toStartOfDay(date);
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / DAY_MS);

  if (diffDays < 0) {
    return {
      daysRemaining: null,
      timeLabel: `Ended ${formatCompactDate(target)}`,
    };
  }

  return {
    daysRemaining: diffDays,
    timeLabel: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`,
  };
};

const getStatusVariant = (status: string): DashboardStatusVariant =>
  STATUS_VARIANTS[status] ?? 'active';

const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;

const resolveGiftInfo = (board: {
  giftName: string;
  giftImageUrl: string;
  childName: string;
  childPhotoUrl: string;
}) =>
  getGiftInfo({
    giftName: board.giftName,
    giftImageUrl: board.giftImageUrl,
    giftDescription: null,
  });

export const buildFinancialBreakdown = (
  raisedCents: number,
  feeCents: number,
  charityCents: number
) => {
  const netPayoutCents = Math.max(0, raisedCents - feeCents - charityCents);
  return {
    netPayoutCents,
    feeLabel: formatZar(feeCents),
    charityLabel: formatZar(charityCents),
    payoutLabel: formatZar(netPayoutCents),
  };
};

export const buildPayoutSummary = (payout: HostPayoutRow): PayoutSummary => {
  const status = PAYOUT_STATUS_LABELS[payout.status] ?? {
    label: payout.status,
    variant: 'amber' as const,
  };
  const completedAt = payout.completedAt;
  return {
    id: payout.id,
    type: payout.type,
    typeLabel: payout.type === 'charity' ? 'Charity Payout' : 'Gift Payout',
    status: payout.status,
    statusLabel: status.label,
    statusVariant: status.variant,
    netCents: payout.netCents,
    amountLabel: formatZar(payout.netCents),
    externalRef: payout.externalRef,
    completedAt,
    completedLabel: completedAt ? completedAt.toLocaleDateString('en-ZA') : null,
  };
};

export const buildDashboardCardViewModel = (
  board: HostDashboardListRow,
  options?: { baseUrl?: string }
): DashboardCardViewModel => {
  const gift = resolveGiftInfo(board);
  const percentage =
    board.goalCents > 0 ? Math.min(100, Math.round((board.raisedCents / board.goalCents) * 100)) : 0;
  const deadline = board.campaignEndDate ?? board.partyDate;
  const { daysRemaining, timeLabel } = resolveTime(deadline);
  const isComplete = board.status === 'closed' || board.status === 'paid_out';

  return {
    boardId: board.id,
    slug: board.slug,
    boardTitle: `${board.childName}'s Dream Board`,
    percentage,
    raisedLabel: formatZar(board.raisedCents),
    contributionCount: board.contributionCount,
    statusLabel: getStatusLabel(board.status),
    manageHref: `/dashboard/${board.id}`,
    displayTitle: gift.giftTitle,
    displaySubtitle: gift.giftSubtitle,
    displayImage: gift.giftImage || board.childPhotoUrl,
    childPhotoUrl: board.childPhotoUrl,
    partyDate: toDate(board.partyDate),
    campaignEndDate: toDate(board.campaignEndDate),
    daysRemaining,
    timeLabel,
    statusVariant: getStatusVariant(board.status),
    isComplete,
    charityEnabled: board.charityEnabled,
  };
};

export const buildDashboardDetailViewModel = (
  board: HostDashboardDetailRow,
  payouts: HostPayoutRow[],
  options: { baseUrl: string }
): DashboardDetailViewModel => {
  const raisedCents = board.totalRaisedCents;
  const percentage = board.goalCents > 0 ? Math.min(100, Math.round((raisedCents / board.goalCents) * 100)) : 0;
  const { daysRemaining, timeLabel } = resolveTime(board.campaignEndDate ?? board.partyDate);
  const { netPayoutCents, feeLabel, charityLabel, payoutLabel } = buildFinancialBreakdown(
    raisedCents,
    board.totalFeeCents,
    board.totalCharityCents
  );
  const isComplete = board.status === 'closed' || board.status === 'paid_out';
  const isFunded = board.status === 'funded';
  const payoutMethodLabel = board.payoutMethod === 'bank' ? 'Bank Transfer' : 'Karri Card';
  const payoutRecipientDisplay =
    board.payoutMethod === 'bank'
      ? board.bankAccountHolder || board.payoutEmail
      : board.karriCardHolderName || board.payoutEmail;

  return {
    boardId: board.id,
    slug: board.slug,
    childName: board.childName,
    childPhotoUrl: board.childPhotoUrl,
    giftName: board.giftName,
    giftImageUrl: board.giftImageUrl,
    partyDate: toDate(board.partyDate),
    campaignEndDate: toDate(board.campaignEndDate),
    status: board.status,
    statusLabel: getStatusLabel(board.status),
    statusVariant: getStatusVariant(board.status),
    message: board.message,
    goalCents: board.goalCents,
    raisedCents,
    percentage,
    raisedLabel: formatZar(raisedCents),
    goalLabel: formatZar(board.goalCents),
    progressLabel: `${percentage}% funded · ${formatZar(raisedCents)} of ${formatZar(board.goalCents)}`,
    totalFeeCents: board.totalFeeCents,
    totalCharityCents: board.totalCharityCents,
    netPayoutCents,
    feeLabel,
    charityLabel,
    payoutLabel,
    contributionCount: board.contributionCount,
    messageCount: board.messageCount,
    daysRemaining,
    timeLabel,
    payoutMethod: board.payoutMethod,
    payoutMethodLabel,
    payoutRecipientDisplay,
    payouts: payouts.map(buildPayoutSummary),
    charityEnabled: board.charityEnabled,
    charityName: board.charityName,
    shareUrl: `${options.baseUrl}/${board.slug}`,
    publicUrl: `${options.baseUrl}/${board.slug}`,
    isComplete,
    isFunded,
    // C4 decision: funded boards remain host-editable until closed/paid out.
    isEditable: board.status === 'active' || board.status === 'funded',
  };
};

export const buildDashboardViewModel = (
  board: HostDashboardListRow,
  options?: { baseUrl?: string }
): DashboardViewModel => {
  const card = buildDashboardCardViewModel(board, options);
  return {
    boardTitle: card.boardTitle,
    statusLabel: card.statusLabel,
    percentage: card.percentage,
    raisedLabel: card.raisedLabel,
    contributionCount: card.contributionCount,
    manageHref: card.manageHref,
    shareUrl: options?.baseUrl ? `${options.baseUrl}/${board.slug}` : undefined,
    displayTitle: card.displayTitle,
    displaySubtitle: card.displaySubtitle,
    displayImage: card.displayImage,
  };
};

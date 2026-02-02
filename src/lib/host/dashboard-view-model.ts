import { getGiftInfo } from '@/lib/dream-boards/gift-info';
import { formatZar } from '@/lib/utils/money';

type DashboardBoard = {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  goalCents: number;
  status: string;
  raisedCents: number;
  contributionCount: number;
  giftName: string;
  giftImageUrl: string;
};

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
  displayImage: string;
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  funded: 'Funded',
  closed: 'Closed',
  paid_out: 'Paid out',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const resolveGiftInfo = (board: DashboardBoard) =>
  getGiftInfo({
    giftName: board.giftName,
    giftImageUrl: board.giftImageUrl,
    giftDescription: null,
  });

export const buildDashboardViewModel = (
  board: DashboardBoard,
  options?: { baseUrl?: string }
): DashboardViewModel => {
  const { giftTitle, giftSubtitle, giftImage } = resolveGiftInfo(board);
  const displayImage = giftImage || board.childPhotoUrl;

  return {
    boardTitle: `${board.childName}'s Dream Board`,
    statusLabel: statusLabels[board.status] ?? board.status,
    percentage: Math.min(100, Math.round((board.raisedCents / board.goalCents) * 100)),
    raisedLabel: formatZar(board.raisedCents),
    contributionCount: board.contributionCount,
    manageHref: `/dashboard/${board.id}`,
    shareUrl: options?.baseUrl ? `${options.baseUrl}/${board.slug}` : undefined,
    displayTitle: giftTitle,
    displaySubtitle: giftSubtitle,
    displayImage,
  };
};

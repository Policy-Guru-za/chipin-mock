import type {
  AdminCharityCsvRow,
  AdminCharityDataset,
  AdminContributionCsvRow,
  AdminContributionDataset,
  AdminDreamBoardCsvRow,
  AdminDreamBoardDataset,
  AdminHostCsvRow,
  AdminHostDataset,
  AdminPayoutCsvRow,
  AdminPayoutDataset,
} from './types';

export const toAdminDreamBoardCsvRows = (
  items: AdminDreamBoardDataset[],
): AdminDreamBoardCsvRow[] =>
  items.map((item) => ({
    id: item.id,
    slug: item.slug,
    child_name: item.childName,
    gift_name: item.giftName,
    status: item.status,
    host_email: item.hostEmail,
    goal_cents: item.goalCents,
    raised_cents: item.raisedCents,
    contributor_count: item.contributorCount,
    payout_pending_count: item.payoutStatusSummary.pending,
    payout_processing_count: item.payoutStatusSummary.processing,
    payout_completed_count: item.payoutStatusSummary.completed,
    payout_failed_count: item.payoutStatusSummary.failed,
    created_at_iso: item.createdAt.toISOString(),
  }));

export const toAdminContributionCsvRows = (
  items: AdminContributionDataset[],
): AdminContributionCsvRow[] =>
  items.map((item) => ({
    id: item.id,
    dream_board_id: item.dreamBoardId,
    dream_board_slug: item.dreamBoardSlug,
    child_name: item.childName,
    contributor_name: item.contributorName ?? '',
    payment_provider: item.paymentProvider,
    payment_status: item.paymentStatus,
    amount_cents: item.amountCents,
    fee_cents: item.feeCents,
    net_cents: item.netCents,
    charity_cents: item.charityCents,
    payment_ref: item.paymentRef,
    created_at_iso: item.createdAt.toISOString(),
  }));

export const toAdminPayoutCsvRows = (items: AdminPayoutDataset[]): AdminPayoutCsvRow[] =>
  items.map((item) => ({
    id: item.id,
    dream_board_id: item.dreamBoardId,
    dream_board_slug: item.dreamBoardSlug,
    child_name: item.childName,
    type: item.type,
    status: item.status,
    gross_cents: item.grossCents,
    fee_cents: item.feeCents,
    charity_cents: item.charityCents,
    net_cents: item.netCents,
    payout_email: item.payoutEmail,
    host_email: item.hostEmail,
    charity_id: item.charityId ?? '',
    charity_name: item.charityName ?? '',
    created_at_iso: item.createdAt.toISOString(),
    completed_at_iso: item.completedAt?.toISOString() ?? '',
  }));

export const toAdminCharityCsvRows = (
  items: AdminCharityDataset[],
): AdminCharityCsvRow[] =>
  items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    is_active: item.isActive,
    total_raised_cents: item.lifetimeTotals.totalRaisedCents,
    total_boards: item.lifetimeTotals.totalBoards,
    total_payouts_cents: item.lifetimeTotals.totalPayoutsCents,
    created_at_iso: item.createdAt.toISOString(),
  }));

export const toAdminHostCsvRows = (items: AdminHostDataset[]): AdminHostCsvRow[] =>
  items.map((item) => ({
    id: item.id,
    email: item.email,
    name: item.name ?? '',
    total_boards: item.summary.totalBoards,
    total_raised_cents: item.summary.totalRaisedCents,
    active_boards: item.summary.activeBoards,
    closed_boards: item.summary.closedBoards,
    created_at_iso: item.createdAt.toISOString(),
  }));

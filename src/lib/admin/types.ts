import type { PaginationCursor } from '@/lib/api/pagination';

export type AdminPage<T> = {
  items: T[];
  totalCount: number;
  nextCursor: string | null;
  limit: number;
};

export type AdminListParams = {
  limit?: number;
  cursor?: PaginationCursor | null;
};

export type AdminDreamBoardFilters = AdminListParams & {
  statuses?: Array<
    'draft' | 'active' | 'funded' | 'closed' | 'paid_out' | 'expired' | 'cancelled'
  >;
  createdFrom?: Date;
  createdTo?: Date;
  hostId?: string;
  search?: string;
};

export type AdminDreamBoardDataset = {
  id: string;
  slug: string;
  childName: string;
  giftName: string;
  status: string;
  hostId: string;
  hostName: string | null;
  hostEmail: string;
  goalCents: number;
  raisedCents: number;
  contributorCount: number;
  payoutStatusSummary: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type AdminContributionFilters = AdminListParams & {
  statuses?: Array<'pending' | 'processing' | 'completed' | 'failed' | 'refunded'>;
  paymentProviders?: Array<'payfast' | 'ozow' | 'snapscan'>;
  createdFrom?: Date;
  createdTo?: Date;
  dreamBoardId?: string;
  search?: string;
};

export type AdminContributionDataset = {
  id: string;
  dreamBoardId: string;
  dreamBoardSlug: string;
  childName: string;
  contributorName: string | null;
  paymentProvider: 'payfast' | 'ozow' | 'snapscan';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amountCents: number;
  feeCents: number;
  netCents: number;
  charityCents: number;
  paymentRef: string;
  createdAt: Date;
};

export type AdminPayoutFilters = AdminListParams & {
  statuses?: Array<'pending' | 'processing' | 'completed' | 'failed'>;
  types?: Array<'karri_card' | 'bank' | 'charity'>;
  giftMethod?: 'karri_card' | 'bank';
  charityId?: string;
  createdFrom?: Date;
  createdTo?: Date;
};

export type AdminPayoutDataset = {
  id: string;
  dreamBoardId: string;
  dreamBoardSlug: string;
  childName: string;
  type: 'karri_card' | 'bank' | 'charity';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  grossCents: number;
  feeCents: number;
  charityCents: number;
  netCents: number;
  payoutEmail: string;
  hostEmail: string;
  charityId: string | null;
  charityName: string | null;
  recipientSummary: Record<string, unknown>;
  createdAt: Date;
  completedAt: Date | null;
};

export type AdminCharityFilters = AdminListParams & {
  isActive?: boolean;
  category?: string;
  search?: string;
};

export type AdminCharityDataset = {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lifetimeTotals: {
    totalRaisedCents: number;
    totalBoards: number;
    totalPayoutsCents: number;
  };
};

export type AdminHostFilters = AdminListParams & {
  createdFrom?: Date;
  createdTo?: Date;
  minBoardCount?: number;
  search?: string;
};

export type AdminHostDataset = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
  summary: {
    totalBoards: number;
    totalRaisedCents: number;
    activeBoards: number;
    closedBoards: number;
  };
};

export type AdminTimeRange = {
  from: Date;
  to: Date;
};

export type AdminPlatformSummaryDataset = {
  period: AdminTimeRange;
  totalBoards: number;
  totalContributions: number;
  totalRaisedCents: number;
  totalPaidOutCents: number;
  totalFeesRetainedCents: number;
};

export type AdminDashboardDataset = {
  period: AdminTimeRange;
  grossMerchandiseValueCents: number;
  totalBoards: number;
  activeBoards: number;
  totalContributors: number;
  totalContributions: number;
  totalFeesRetainedCents: number;
  pendingPayoutsCount: number;
  failedPayoutsCount: number;
};

export type AdminMonthlyCharityReconciliationDataset = {
  month: number;
  year: number;
  generatedAt: Date;
  totals: {
    totalCharityCents: number;
    totalBoardCount: number;
    totalPayoutCount: number;
  };
  items: Array<{
    charityId: string;
    charityName: string;
    totalCharityCents: number;
    payoutCount: number;
    boardCount: number;
  }>;
};

export type AdminPlatformSettingsDataset = {
  brand: string;
  accessibilityBaseline: string;
  feeConfiguration: {
    percentage: number;
    percentageBps: number;
    minFeeCents: number;
    maxFeeCents: number;
    addedOnTopAtCheckout: boolean;
  };
  contributionLimits: {
    minContributionCents: number;
    maxContributionCents: number;
  };
  charityConfiguration: {
    splitModes: ReadonlyArray<'percentage' | 'threshold'>;
    monthlyPayoutCadence: string;
  };
  writePathGates: {
    bankEnabled: boolean;
    charityEnabled: boolean;
  };
};

export type AdminDreamBoardCsvRow = {
  id: string;
  slug: string;
  child_name: string;
  gift_name: string;
  status: string;
  host_email: string;
  goal_cents: number;
  raised_cents: number;
  contributor_count: number;
  payout_pending_count: number;
  payout_processing_count: number;
  payout_completed_count: number;
  payout_failed_count: number;
  created_at_iso: string;
};

export type AdminContributionCsvRow = {
  id: string;
  dream_board_id: string;
  dream_board_slug: string;
  child_name: string;
  contributor_name: string;
  payment_provider: string;
  payment_status: string;
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  charity_cents: number;
  payment_ref: string;
  created_at_iso: string;
};

export type AdminPayoutCsvRow = {
  id: string;
  dream_board_id: string;
  dream_board_slug: string;
  child_name: string;
  type: string;
  status: string;
  gross_cents: number;
  fee_cents: number;
  charity_cents: number;
  net_cents: number;
  payout_email: string;
  host_email: string;
  charity_id: string;
  charity_name: string;
  created_at_iso: string;
  completed_at_iso: string;
};

export type AdminCharityCsvRow = {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  total_raised_cents: number;
  total_boards: number;
  total_payouts_cents: number;
  created_at_iso: string;
};

export type AdminHostCsvRow = {
  id: string;
  email: string;
  name: string;
  total_boards: number;
  total_raised_cents: number;
  active_boards: number;
  closed_boards: number;
  created_at_iso: string;
};

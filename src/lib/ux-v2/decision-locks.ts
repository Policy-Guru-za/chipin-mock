export const LOCK_STATUS = 'LOCKED' as const;

export const LOCKED_PAYOUT_METHODS = ['karri_card', 'bank'] as const;
export const LOCKED_PAYOUT_TYPES = ['karri_card', 'bank', 'charity'] as const;
export const LOCKED_CHARITY_SPLIT_MODES = ['percentage', 'threshold'] as const;

export const LOCKED_FEE_SEMANTICS = {
  contributionAmountSource: 'contributor_selected_gift_amount',
  platformFeeApplication: 'added_on_top_at_checkout',
  raisedTracks: 'gift_amount_excluding_platform_fee',
} as const;

export const LOCKED_RAISED_FUNDED_SEMANTICS = {
  raisedField: 'raised_cents',
  raisedRepresents: 'gift_amount_toward_goal',
  fundedRule: 'raised_cents_gte_goal_cents',
} as const;

export const LOCKED_WRITE_PATH_POLICY = {
  bankAndCharityWritesEnabledAfterMilestone: 'B4',
} as const;

export const LOCKED_REMINDER_POLICY = {
  maxReminderDays: 14,
  dedupeKey: ['dream_board_id', 'email', 'remind_at'] as const,
  retryModel: 'idempotent_dedupe',
} as const;

export const LOCKED_CHARITY_PAYOUT_POLICY = {
  cadence: 'monthly_batch',
  reconciliationReport: 'per_charity',
} as const;

export const LOCKED_BRAND_STRING = 'Gifta' as const;
export const LOCKED_ACCESSIBILITY_BASELINE = 'WCAG 2.1 AA' as const;

export const UX_V2_DECISION_LOCKS = {
  D001: {
    id: 'D-001',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_PAYOUT_METHODS,
  },
  D002: {
    id: 'D-002',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_PAYOUT_TYPES,
  },
  D003: {
    id: 'D-003',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_CHARITY_SPLIT_MODES,
  },
  D004: {
    id: 'D-004',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_FEE_SEMANTICS,
  },
  D005: {
    id: 'D-005',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_RAISED_FUNDED_SEMANTICS,
  },
  D006: {
    id: 'D-006',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_WRITE_PATH_POLICY,
  },
  D007: {
    id: 'D-007',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_REMINDER_POLICY,
  },
  D008: {
    id: 'D-008',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_CHARITY_PAYOUT_POLICY,
  },
  D009: {
    id: 'D-009',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_BRAND_STRING,
  },
  D010: {
    id: 'D-010',
    status: LOCK_STATUS,
    effectiveValue: LOCKED_ACCESSIBILITY_BASELINE,
  },
} as const;


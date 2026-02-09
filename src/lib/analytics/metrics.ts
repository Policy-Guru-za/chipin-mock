/**
 * Custom metrics tracking for Gifta business KPIs.
 */

export type CustomMetricName =
  | 'host_create_started'
  | 'host_create_step_completed'
  | 'host_create_failed'
  | 'host_create_published'
  | 'guest_view_loaded'
  | 'contribution_redirect_started'
  | 'contribution_failed'
  | 'reminder_requested'
  | 'payout_created'
  | 'payout_processing_started'
  | 'payout_completed'
  | 'payout_failed'
  | 'charity_payout_created'
  | 'reminder_dispatched'
  | 'reminder_failed'
  | 'dream_board_created'
  | 'contribution_started'
  | 'contribution_completed'
  | 'goal_reached'
  | 'payment_method_selected'
  | 'wizard_step_completed'
  | 'share_link_clicked'
  | 'nav_drawer_opened'
  | 'payment_redirect_started'
  | 'snapscan_qr_shown'
  | 'snapscan_reference_copied';

export type CustomMetricData = {
  name: CustomMetricName;
  timestamp: number;
  properties?: Record<string, string | number | boolean>;
};

/**
 * Track a custom business metric.
 */
export function trackMetric(
  name: CustomMetricName,
  properties?: Record<string, string | number | boolean>
): void {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    return;
  }

  const metric: CustomMetricData = {
    name,
    timestamp: Date.now(),
    properties,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Metric]', metric.name, metric.properties ?? '');
    return;
  }

  // In production, send to analytics endpoint
  const body = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/internal/metrics', body);
  } else {
    fetch('/api/internal/metrics', {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Track wizard step completion.
 */
export function trackWizardStep(step: number, stepName: string): void {
  trackMetric('wizard_step_completed', { step, stepName });
}

/**
 * Track contribution funnel.
 */
export function trackContributionStarted(
  dreamBoardId: string,
  amountCents: number,
  paymentMethod: string
): void {
  trackMetric('contribution_started', {
    dream_board_id: dreamBoardId,
    amount_cents: amountCents,
    payment_provider: paymentMethod,
    dreamBoardId,
    amountCents,
    paymentMethod,
  });
}

export function trackContributionCompleted(
  dreamBoardId: string,
  amountCents: number,
  paymentMethod: string
): void {
  trackMetric('contribution_completed', {
    dream_board_id: dreamBoardId,
    amount_cents: amountCents,
    payment_provider: paymentMethod,
    dreamBoardId,
    amountCents,
    paymentMethod,
  });
}

/**
 * Track goal reached event.
 */
export function trackGoalReached(dreamBoardId: string, totalRaisedCents: number): void {
  trackMetric('goal_reached', {
    dreamBoardId,
    totalRaisedCents,
  });
}

/**
 * Track share link interactions.
 */
export function trackShareLinkClicked(platform: string, dreamBoardId: string): void {
  trackMetric('share_link_clicked', {
    platform,
    dreamBoardId,
  });
}

/**
 * Track mobile nav drawer usage.
 */
export function trackNavDrawerOpened(): void {
  trackMetric('nav_drawer_opened');
}

/**
 * Track payment redirect start.
 */
export function trackPaymentRedirectStarted(provider: string): void {
  trackContributionRedirectStarted(provider);
  trackMetric('payment_redirect_started', { provider });
}

/**
 * Track SnapScan QR visibility.
 */
export function trackSnapscanQrShown(dreamBoardId?: string): void {
  trackMetric('snapscan_qr_shown', dreamBoardId ? { dreamBoardId } : undefined);
}

/**
 * Track SnapScan reference copy events.
 */
export function trackSnapscanReferenceCopied(reference: string): void {
  trackMetric('snapscan_reference_copied', { reference_last4: reference.slice(-4) });
}

export function trackHostCreateStarted(): void {
  trackMetric('host_create_started');
}

export function trackHostCreateStepCompleted(step: string): void {
  trackMetric('host_create_step_completed', { step });
}

export function trackHostCreateFailed(step: string, failureCode: string): void {
  trackMetric('host_create_failed', {
    step,
    failure_code: failureCode,
  });
}

export function trackHostCreatePublished(params: {
  dreamBoardId: string;
  payoutMethod: string;
  charityEnabled: boolean;
}): void {
  trackMetric('host_create_published', {
    dream_board_id: params.dreamBoardId,
    payout_method: params.payoutMethod,
    charity_enabled: params.charityEnabled,
  });
}

export function trackGuestViewLoaded(dreamBoardId: string): void {
  trackMetric('guest_view_loaded', { dream_board_id: dreamBoardId });
}

export function trackContributionRedirectStarted(paymentProvider: string): void {
  trackMetric('contribution_redirect_started', {
    payment_provider: paymentProvider,
  });
}

export function trackContributionFailed(params: {
  dreamBoardId: string;
  paymentProvider: string;
  amountCents: number;
  failureCode: string;
}): void {
  trackMetric('contribution_failed', {
    dream_board_id: params.dreamBoardId,
    payment_provider: params.paymentProvider,
    amount_cents: params.amountCents,
    failure_code: params.failureCode,
  });
}

export function trackReminderRequested(dreamBoardId: string): void {
  trackMetric('reminder_requested', { dream_board_id: dreamBoardId });
}

export function trackPayoutCreated(params: {
  payoutId: string;
  payoutType: string;
  dreamBoardId: string;
  amountCents: number;
}): void {
  trackMetric('payout_created', {
    payout_id: params.payoutId,
    payout_type: params.payoutType,
    dream_board_id: params.dreamBoardId,
    amount_cents: params.amountCents,
  });
}

export function trackPayoutProcessingStarted(params: {
  payoutId: string;
  payoutType: string;
  dreamBoardId: string;
  amountCents: number;
}): void {
  trackMetric('payout_processing_started', {
    payout_id: params.payoutId,
    payout_type: params.payoutType,
    dream_board_id: params.dreamBoardId,
    amount_cents: params.amountCents,
  });
}

export function trackPayoutCompleted(params: {
  payoutId: string;
  payoutType: string;
  dreamBoardId: string;
  amountCents: number;
}): void {
  trackMetric('payout_completed', {
    payout_id: params.payoutId,
    payout_type: params.payoutType,
    dream_board_id: params.dreamBoardId,
    amount_cents: params.amountCents,
  });
}

export function trackPayoutFailed(params: {
  payoutId: string;
  payoutType: string;
  dreamBoardId: string;
  amountCents: number;
  failureCode: string;
}): void {
  trackMetric('payout_failed', {
    payout_id: params.payoutId,
    payout_type: params.payoutType,
    dream_board_id: params.dreamBoardId,
    amount_cents: params.amountCents,
    failure_code: params.failureCode,
  });
}

export function trackCharityPayoutCreated(params: {
  payoutId: string;
  dreamBoardId: string;
  amountCents: number;
}): void {
  trackMetric('charity_payout_created', {
    payout_id: params.payoutId,
    payout_type: 'charity',
    dream_board_id: params.dreamBoardId,
    amount_cents: params.amountCents,
  });
}

export function trackReminderDispatched(dreamBoardId: string): void {
  trackMetric('reminder_dispatched', { dream_board_id: dreamBoardId });
}

export function trackReminderFailed(dreamBoardId: string, failureCode: string): void {
  trackMetric('reminder_failed', {
    dream_board_id: dreamBoardId,
    failure_code: failureCode,
  });
}

/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  trackCharityPayoutCreated,
  trackContributionCompleted,
  trackContributionFailed,
  trackContributionStarted,
  trackGuestViewLoaded,
  trackHostCreateFailed,
  trackHostCreatePublished,
  trackHostCreateStarted,
  trackHostCreateStepCompleted,
  trackPayoutCompleted,
  trackPayoutCreated,
  trackPayoutFailed,
  trackPayoutProcessingStarted,
  trackReminderDispatched,
  trackReminderFailed,
  trackReminderRequested,
} from '@/lib/analytics/metrics';

const parsePayloads = (beaconMock: ReturnType<typeof vi.fn>) =>
  beaconMock.mock.calls.map(([, body]) => JSON.parse(body as string));

const emitAllCatalogEvents = () => {
  trackHostCreateStarted();
  trackHostCreateStepCompleted('dates');
  trackHostCreateFailed('payout', 'timeout');
  trackHostCreatePublished({
    dreamBoardId: 'board-1',
    payoutMethod: 'takealot_voucher',
  });
  trackGuestViewLoaded('board-1');
  trackContributionStarted('board-1', 5000, 'stitch');
  trackContributionCompleted('board-1', 5000, 'stitch');
  trackContributionFailed({
    dreamBoardId: 'board-1',
    paymentProvider: 'stitch',
    amountCents: 5000,
    failureCode: 'timeout',
  });
  trackReminderRequested('board-1');
  trackPayoutCreated({
    payoutId: 'payout-1',
    payoutType: 'takealot_voucher',
    dreamBoardId: 'board-1',
    amountCents: 5000,
  });
  trackPayoutProcessingStarted({
    payoutId: 'payout-1',
    payoutType: 'takealot_voucher',
    dreamBoardId: 'board-1',
    amountCents: 5000,
  });
  trackPayoutCompleted({
    payoutId: 'payout-1',
    payoutType: 'takealot_voucher',
    dreamBoardId: 'board-1',
    amountCents: 5000,
  });
  trackPayoutFailed({
    payoutId: 'payout-2',
    payoutType: 'takealot_voucher',
    dreamBoardId: 'board-2',
    amountCents: 7000,
    failureCode: 'declined',
  });
  trackReminderDispatched('board-1');
  trackReminderFailed('board-1', 'provider_error');
};

const requiredEventNames = [
  'host_create_started',
  'host_create_step_completed',
  'host_create_failed',
  'host_create_published',
  'guest_view_loaded',
  'contribution_started',
  'contribution_completed',
  'contribution_failed',
  'reminder_requested',
  'payout_created',
  'payout_processing_started',
  'payout_completed',
  'payout_failed',
  'reminder_dispatched',
  'reminder_failed',
];

describe('UAT telemetry verification (active catalog)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: vi.fn(() => true),
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('emits every required telemetry event at least once', () => {
    const sendBeacon = navigator.sendBeacon as unknown as ReturnType<typeof vi.fn>;

    emitAllCatalogEvents();

    const names = new Set(parsePayloads(sendBeacon).map((payload) => payload.name));

    for (const eventName of requiredEventNames) {
      expect(names.has(eventName)).toBe(true);
    }
  });

  it('includes required properties for contract-critical events', () => {
    const sendBeacon = navigator.sendBeacon as unknown as ReturnType<typeof vi.fn>;

    trackHostCreateStepCompleted('review');
    trackHostCreatePublished({
      dreamBoardId: 'board-1',
      payoutMethod: 'takealot_voucher',
    });
    trackContributionCompleted('board-1', 5000, 'stitch');
    trackContributionFailed({
      dreamBoardId: 'board-1',
      paymentProvider: 'stitch',
      amountCents: 5000,
      failureCode: 'timeout',
    });
    trackPayoutCompleted({
      payoutId: 'payout-1',
      payoutType: 'takealot_voucher',
      dreamBoardId: 'board-1',
      amountCents: 5000,
    });
    trackPayoutFailed({
      payoutId: 'payout-1',
      payoutType: 'takealot_voucher',
      dreamBoardId: 'board-1',
      amountCents: 5000,
      failureCode: 'declined',
    });

    const payloads = parsePayloads(sendBeacon);
    const findEvent = (name: string) => payloads.find((payload) => payload.name === name);

    expect(findEvent('host_create_step_completed')?.properties).toMatchObject({ step: 'review' });
    expect(findEvent('host_create_published')?.properties).toMatchObject({
      dream_board_id: 'board-1',
      payout_method: 'takealot_voucher',
    });
    expect(findEvent('contribution_completed')?.properties).toMatchObject({
      dream_board_id: 'board-1',
      payment_provider: 'stitch',
      amount_cents: 5000,
    });
    expect(findEvent('contribution_failed')?.properties).toMatchObject({
      dream_board_id: 'board-1',
      failure_code: 'timeout',
    });
    expect(findEvent('payout_completed')?.properties).toMatchObject({
      payout_id: 'payout-1',
      payout_type: 'takealot_voucher',
      amount_cents: 5000,
    });
    expect(findEvent('payout_failed')?.properties).toMatchObject({
      payout_id: 'payout-1',
      failure_code: 'declined',
    });
  });

  it('keeps historical charity payout telemetry isolated to explicit compat coverage', () => {
    const sendBeacon = navigator.sendBeacon as unknown as ReturnType<typeof vi.fn>;

    trackCharityPayoutCreated({
      payoutId: 'payout-3',
      dreamBoardId: 'board-3',
      amountCents: 9000,
    });

    const payloads = parsePayloads(sendBeacon);
    expect(payloads).toContainEqual(
      expect.objectContaining({
        name: 'charity_payout_created',
        properties: expect.objectContaining({
          payout_id: 'payout-3',
          dream_board_id: 'board-3',
          amount_cents: 9000,
        }),
      })
    );
  });
});

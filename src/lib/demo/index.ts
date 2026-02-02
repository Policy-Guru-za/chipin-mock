import {
  assertNotProductionDb,
  isDemoMode as featureIsDemoMode,
  isAnyMockEnabled,
  isMockKarri,
  isMockPaymentWebhooks,
  isMockPayments,
  isPaymentSimulatorEnabled,
  isMockSentry,
} from '@/lib/config/feature-flags';

export const isDemoMode = featureIsDemoMode;
export {
  isAnyMockEnabled,
  isMockPayments,
  isMockPaymentWebhooks,
  isMockKarri,
  isMockSentry,
  isPaymentSimulatorEnabled,
  assertNotProductionDb,
};

export const DEMO_MODE: boolean = false;

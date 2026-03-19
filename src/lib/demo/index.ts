import {
  assertNotProductionDb,
  isDemoMode as featureIsDemoMode,
  isAnyMockEnabled,
  isMockKarri,
  isMockSentry,
} from '@/lib/config/feature-flags';

export const isDemoMode = featureIsDemoMode;
export {
  isAnyMockEnabled,
  isMockKarri,
  isMockSentry,
  assertNotProductionDb,
};

export const DEMO_MODE: boolean = false;

const isEnabled = (value: string | undefined): boolean => value === 'true';

/**
 * Product-level charity capability for first-party Gifta surfaces.
 *
 * Default is off so the active Dreamboard product omits charity unless a
 * future environment explicitly re-enables it.
 */
export const isCharityProductEnabled = (): boolean =>
  isEnabled(process.env.UX_V2_ENABLE_CHARITY_PRODUCT);

export const isCharityVisibleInProduct = (charityEnabled?: boolean | null): boolean =>
  isCharityProductEnabled() && charityEnabled === true;

export interface ClerkConfigStatus {
  flagEnabled: boolean;
  hasPublishableKey: boolean;
  hasSecretKey: boolean;
  isEnabled: boolean;
  publishableKey?: string;
}

const hasValue = (value: string | undefined): boolean => Boolean(value && value.trim().length > 0);

export const getClerkConfigStatus = (): ClerkConfigStatus => {
  const flagEnabled = process.env.AUTH_CLERK_ENABLED === 'true';
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const hasPublishableKey = hasValue(publishableKey);
  const hasSecretKey = hasValue(secretKey);

  return {
    flagEnabled,
    hasPublishableKey,
    hasSecretKey,
    isEnabled: flagEnabled && hasPublishableKey && hasSecretKey,
    publishableKey,
  };
};

export const getClerkUrls = () => {
  return {
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? '/create/child',
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? '/create/child',
  };
};

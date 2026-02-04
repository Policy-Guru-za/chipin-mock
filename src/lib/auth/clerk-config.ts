export interface ClerkConfigStatus {
  hasPublishableKey: boolean;
  hasSecretKey: boolean;
  isEnabled: boolean;
  publishableKey?: string;
}

const hasValue = (value: string | undefined): boolean => Boolean(value && value.trim().length > 0);

export const getClerkConfigStatus = (): ClerkConfigStatus => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const hasPublishableKey = hasValue(publishableKey);
  const hasSecretKey = hasValue(secretKey);

  return {
    hasPublishableKey,
    hasSecretKey,
    isEnabled: hasPublishableKey && hasSecretKey,
    publishableKey,
  };
};

export const getClerkUrls = () => {
  return {
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
    signInFallbackRedirectUrl:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/create/child',
    signUpFallbackRedirectUrl:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? '/create/child',
  };
};

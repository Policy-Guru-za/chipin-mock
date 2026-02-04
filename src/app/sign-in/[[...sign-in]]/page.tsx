import { SignIn } from '@clerk/nextjs';

import { getClerkUrls } from '@/lib/auth/clerk-config';

export default function SignInPage() {
  const { signInUrl, signUpUrl, signInFallbackRedirectUrl } = getClerkUrls();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <SignIn
        path={signInUrl}
        routing="path"
        signUpUrl={signUpUrl}
        fallbackRedirectUrl={signInFallbackRedirectUrl}
      />
    </div>
  );
}

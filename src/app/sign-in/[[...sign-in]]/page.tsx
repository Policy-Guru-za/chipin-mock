import { SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getClerkUrls } from '@/lib/auth/clerk-config';

export default async function SignInPage() {
  const { signInUrl, signUpUrl, signInFallbackRedirectUrl } = getClerkUrls();
  const { userId } = await auth();

  if (userId) {
    redirect(signInFallbackRedirectUrl);
  }

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

import { SignIn } from '@clerk/nextjs';

import { getClerkConfigStatus, getClerkUrls } from '@/lib/auth/clerk-config';
import { deleteSession } from '@/lib/auth/session';

export default async function SignInPage() {
  const clerkConfig = getClerkConfigStatus();
  if (clerkConfig.isEnabled) {
    await deleteSession();
  }

  const { signInUrl, signUpUrl, afterSignInUrl } = getClerkUrls();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <SignIn
        path={signInUrl}
        routing="path"
        signUpUrl={signUpUrl}
        afterSignInUrl={afterSignInUrl}
      />
    </div>
  );
}

import { SignUp } from '@clerk/nextjs';

import { getClerkUrls } from '@/lib/auth/clerk-config';

export default function SignUpPage() {
  const { signInUrl, signUpUrl, afterSignUpUrl } = getClerkUrls();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <SignUp
        path={signUpUrl}
        routing="path"
        signInUrl={signInUrl}
        afterSignUpUrl={afterSignUpUrl}
      />
    </div>
  );
}

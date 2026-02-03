import { redirect } from 'next/navigation';

import { getClerkUrls } from '@/lib/auth/clerk-config';

const buildRedirectUrl = (baseUrl: string, redirectUrl: string) =>
  `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}redirect_url=${encodeURIComponent(redirectUrl)}`;

export default function AuthRedirectPage() {
  const { signUpUrl } = getClerkUrls();
  redirect(buildRedirectUrl(signUpUrl, '/dashboard'));
}

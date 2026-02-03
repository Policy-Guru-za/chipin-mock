import { redirect } from 'next/navigation';

import { getClerkUrls } from '@/lib/auth/clerk-config';
import { getHostAuth } from '@/lib/auth/clerk-wrappers';
const buildRedirectUrl = (baseUrl: string, redirectUrl: string) =>
  `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}redirect_url=${encodeURIComponent(redirectUrl)}`;

export default async function CreateDreamBoardPage() {
  const auth = await getHostAuth();
  if (auth) {
    redirect('/create/child');
  }

  const { signInUrl } = getClerkUrls();
  redirect(buildRedirectUrl(signInUrl, '/create/child'));
}

import { auth, clerkClient } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

import { getClerkUrls } from '@/lib/auth/clerk-config';
import { isAdminEmail } from '@/lib/auth/admin-allowlist';

type ClerkUserRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress?: { emailAddress: string | null } | null;
  emailAddresses: Array<{ emailAddress: string }>;
};

export type ClerkUserInfo = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

const resolveUserEmail = (user: ClerkUserRecord) =>
  user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;

const resolveStringClaim = (
  claims: Record<string, unknown> | null | undefined,
  keys: string[]
): string | null => {
  if (!claims) return null;
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return null;
};

const resolveEmailFromClaims = (claims: Record<string, unknown> | null | undefined) =>
  resolveStringClaim(claims, ['email', 'email_address', 'emailAddress', 'primary_email_address']);

export async function getClerkUser(): Promise<ClerkUserInfo | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const claims = sessionClaims as Record<string, unknown> | null;
  const claimEmail = resolveEmailFromClaims(claims);
  if (claimEmail) {
    return {
      id: userId,
      email: claimEmail,
      firstName:
        resolveStringClaim(claims, ['first_name', 'firstName', 'given_name']) ?? null,
      lastName: resolveStringClaim(claims, ['last_name', 'lastName', 'family_name']) ?? null,
    };
  }

  const client = await clerkClient();
  const user = (await client.users.getUser(userId)) as ClerkUserRecord;
  const email = resolveUserEmail(user);
  if (!email) return null;

  return {
    id: user.id,
    email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
  };
}

export async function requireClerkUser(): Promise<ClerkUserInfo> {
  const user = await getClerkUser();
  if (!user) {
    const { signInUrl } = getClerkUrls();
    redirect(signInUrl);
  }
  return user;
}

export async function requireAdminClerkUser(): Promise<ClerkUserInfo> {
  const user = await requireClerkUser();
  if (!isAdminEmail(user.email)) {
    notFound();
  }
  return user;
}

import { getClerkConfigStatus } from '@/lib/auth/clerk-config';
import { getClerkUser, requireAdminClerkUser, requireClerkUser } from '@/lib/auth/clerk';
import { getSession, requireAdminSession, requireSession } from '@/lib/auth/session';
import { ensureHostForClerkUser } from '@/lib/auth/host-mapping';

export type HostAuth = {
  hostId: string;
  email: string;
};

const resolveHostName = (user: { firstName: string | null; lastName: string | null }) => {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
};

const toHostAuth = (host: { id: string; email: string }): HostAuth => ({
  hostId: host.id,
  email: host.email,
});

const toLegacyAuth = (session: { hostId: string; email: string } | null): HostAuth | null =>
  session ? { hostId: session.hostId, email: session.email } : null;

const ensureClerkHost = async (user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}): Promise<HostAuth> => {
  const host = await ensureHostForClerkUser({
    clerkUserId: user.id,
    email: user.email,
    name: resolveHostName(user),
  });
  return toHostAuth(host);
};

export async function getHostAuth(): Promise<HostAuth | null> {
  if (getClerkConfigStatus().isEnabled) {
    const user = await getClerkUser();
    if (!user) return null;
    return ensureClerkHost(user);
  }

  const session = await getSession();
  return toLegacyAuth(session);
}

export async function requireHostAuth(): Promise<HostAuth> {
  if (getClerkConfigStatus().isEnabled) {
    const user = await requireClerkUser();
    return ensureClerkHost(user);
  }

  const session = await requireSession();
  return { hostId: session.hostId, email: session.email };
}

export async function requireAdminAuth(): Promise<HostAuth> {
  if (getClerkConfigStatus().isEnabled) {
    const user = await requireAdminClerkUser();
    return ensureClerkHost(user);
  }

  const session = await requireAdminSession();
  return { hostId: session.hostId, email: session.email };
}

export async function getInternalHostAuth(): Promise<HostAuth | null> {
  if (getClerkConfigStatus().isEnabled) {
    const user = await getClerkUser();
    if (!user) return null;
    return ensureClerkHost(user);
  }

  const session = await getSession();
  return toLegacyAuth(session);
}

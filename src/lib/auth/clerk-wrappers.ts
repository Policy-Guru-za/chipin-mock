import { getClerkUser, requireAdminClerkUser, requireClerkUser } from '@/lib/auth/clerk';
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
  const user = await getClerkUser();
  if (!user) return null;
  return ensureClerkHost(user);
}

export async function requireHostAuth(): Promise<HostAuth> {
  const user = await requireClerkUser();
  return ensureClerkHost(user);
}

export async function requireAdminAuth(): Promise<HostAuth> {
  const user = await requireAdminClerkUser();
  return ensureClerkHost(user);
}

export async function getInternalHostAuth(): Promise<HostAuth | null> {
  return getHostAuth();
}

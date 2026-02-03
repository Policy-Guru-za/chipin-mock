import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { getHostByEmail, hostSelect, normalizeEmail } from '@/lib/db/queries';
import { hosts } from '@/lib/db/schema';
import { log } from '@/lib/observability/logger';

type HostRecord = {
  id: string;
  email: string;
  name: string | null;
  clerkUserId: string | null;
};

const hashIdentifier = (value: string) => createHash('sha256').update(value).digest('hex');
const hashPrefix = (value: string) => hashIdentifier(value).slice(0, 12);

export async function getHostByClerkUserId(clerkUserId: string): Promise<HostRecord | null> {
  const [host] = await db
    .select(hostSelect)
    .from(hosts)
    .where(eq(hosts.clerkUserId, clerkUserId))
    .limit(1);

  return host ?? null;
}

export async function ensureHostForClerkUser(params: {
  clerkUserId: string;
  email: string;
  name?: string | null;
}): Promise<HostRecord> {
  const normalizedEmail = normalizeEmail(params.email);
  const byClerk = await getHostByClerkUserId(params.clerkUserId);
  if (byClerk) {
    return byClerk;
  }

  const byEmail = await getHostByEmail(normalizedEmail);
  if (byEmail) {
    const updates: { clerkUserId?: string; name?: string | null } = {};
    if (!byEmail.clerkUserId) {
      updates.clerkUserId = params.clerkUserId;
    } else if (byEmail.clerkUserId !== params.clerkUserId) {
      log('warn', 'auth.clerk_user_mismatch', {
        hostId: byEmail.id,
        emailHash: hashPrefix(normalizedEmail),
        previousClerkUserIdHash: hashPrefix(byEmail.clerkUserId),
        newClerkUserIdHash: hashPrefix(params.clerkUserId),
      });
      updates.clerkUserId = params.clerkUserId;
    }

    if (!byEmail.name && params.name) {
      updates.name = params.name;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(hosts).set(updates).where(eq(hosts.id, byEmail.id));
      const [updated] = await db
        .select(hostSelect)
        .from(hosts)
        .where(eq(hosts.id, byEmail.id))
        .limit(1);
      return updated ?? byEmail;
    }

    return byEmail;
  }

  await db
    .insert(hosts)
    .values({
      email: normalizedEmail,
      clerkUserId: params.clerkUserId,
      name: params.name ?? null,
    })
    .onConflictDoNothing({ target: hosts.email });

  const [created] = await db
    .select(hostSelect)
    .from(hosts)
    .where(eq(hosts.email, normalizedEmail))
    .limit(1);

  if (!created) {
    throw new Error('Unable to create host');
  }

  if (!created.clerkUserId) {
    const updates: { clerkUserId?: string; name?: string | null } = {
      clerkUserId: params.clerkUserId,
    };
    if (!created.name && params.name) {
      updates.name = params.name;
    }
    await db.update(hosts).set(updates).where(eq(hosts.id, created.id));
    const [updated] = await db
      .select(hostSelect)
      .from(hosts)
      .where(eq(hosts.id, created.id))
      .limit(1);
    return updated ?? created;
  }

  return created;
}

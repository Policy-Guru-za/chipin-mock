import { createHash, randomBytes } from 'crypto';

import * as Sentry from '@sentry/nextjs';

import { isMockSentry } from '@/lib/config/feature-flags';
import { kvAdapter } from '@/lib/demo/kv-adapter';
import { sendEmail } from '@/lib/integrations/email';
import { log } from '@/lib/observability/logger';
import { enforceRateLimit } from './rate-limit';

const MAGIC_LINK_EXPIRY_SECONDS = 60 * 15;
const parseBooleanFlag = (value: string | undefined) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const isMagicLinkRateLimitDisabled = () =>
  parseBooleanFlag(process.env.MAGIC_LINK_RATE_LIMIT_DISABLED) &&
  process.env.NODE_ENV !== 'production';

const parseRateLimitValue = (value: string | undefined, fallback: number) => {
  const parsed = Number(value?.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const MAGIC_LINK_RATE_LIMITS = {
  emailPerMinute: parseRateLimitValue(process.env.MAGIC_LINK_RATE_LIMIT_EMAIL_PER_MINUTE, 1),
  emailPerHour: parseRateLimitValue(process.env.MAGIC_LINK_RATE_LIMIT_EMAIL_PER_HOUR, 5),
  ipPerHour: parseRateLimitValue(process.env.MAGIC_LINK_RATE_LIMIT_IP_PER_HOUR, 10),
};

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; reason: 'rate_limited' | 'send_failed'; retryAfterSeconds?: number };

type MagicLinkContext = {
  ip?: string;
  userAgent?: string;
  requestId?: string;
};

type MagicLinkRecord = {
  email: string;
  createdAt: number;
  usedAt: number | null;
  ip?: string;
  userAgent?: string;
};

const hashIdentifier = (value: string) => createHash('sha256').update(value).digest('hex');

const getEmailIndexKey = (emailHash: string) => `magic:email:${emailHash}`;

const resolveBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_APP_URL is required in production');
    }
    return 'http://localhost:3000';
  }
  if (process.env.NODE_ENV === 'production' && !baseUrl.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_APP_URL must use https:// in production');
  }
  return baseUrl;
};

const normalizeMagicLinkRecord = (value: unknown): MagicLinkRecord | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    return { email: value, createdAt: 0, usedAt: null };
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Partial<MagicLinkRecord>;
    if (typeof record.email === 'string') {
      return {
        email: record.email,
        createdAt: typeof record.createdAt === 'number' ? record.createdAt : 0,
        usedAt: record.usedAt ?? null,
        ip: typeof record.ip === 'string' ? record.ip : undefined,
        userAgent: typeof record.userAgent === 'string' ? record.userAgent : undefined,
      };
    }
  }
  return null;
};

async function checkMagicLinkRateLimit(
  emailHash: string,
  ipHash?: string
): Promise<MagicLinkResult | null> {
  if (isMagicLinkRateLimitDisabled()) {
    log('info', 'auth.magic_link_rate_limit_bypassed', { emailHash, ipHash });
    return null;
  }
  const emailMinute = await enforceRateLimit(`auth:magic:email:${emailHash}:1m`, {
    limit: MAGIC_LINK_RATE_LIMITS.emailPerMinute,
    windowSeconds: 60,
  });
  if (!emailMinute.allowed) {
    return { ok: false, reason: 'rate_limited', retryAfterSeconds: emailMinute.retryAfterSeconds };
  }

  const emailHour = await enforceRateLimit(`auth:magic:email:${emailHash}:1h`, {
    limit: MAGIC_LINK_RATE_LIMITS.emailPerHour,
    windowSeconds: 60 * 60,
  });
  if (!emailHour.allowed) {
    return { ok: false, reason: 'rate_limited', retryAfterSeconds: emailHour.retryAfterSeconds };
  }

  if (ipHash) {
    const ipHour = await enforceRateLimit(`auth:magic:ip:${ipHash}:1h`, {
      limit: MAGIC_LINK_RATE_LIMITS.ipPerHour,
      windowSeconds: 60 * 60,
    });
    if (!ipHour.allowed) {
      return { ok: false, reason: 'rate_limited', retryAfterSeconds: ipHour.retryAfterSeconds };
    }
  }

  return null;
}

export async function sendMagicLink(email: string, context?: MagicLinkContext) {
  const normalizedEmail = email.trim().toLowerCase();
  const emailHash = hashIdentifier(normalizedEmail);
  const ipHash = context?.ip ? hashIdentifier(context.ip) : undefined;
  let tokenHash: string | null = null;
  let tokenStored = false;

  try {
    log(
      'info',
      'auth.magic_link_rate_limit_flag',
      {
        raw: process.env.MAGIC_LINK_RATE_LIMIT_DISABLED ?? null,
        disabled: isMagicLinkRateLimitDisabled(),
      },
      context?.requestId
    );
    log('info', 'auth.magic_link_requested', { emailHash, ipHash }, context?.requestId);
    const rateLimit = await checkMagicLinkRateLimit(emailHash, ipHash);
    if (rateLimit) {
      log('warn', 'auth.magic_link_rate_limited', { emailHash, ipHash }, context?.requestId);
      if (!isMockSentry()) {
        Sentry.captureMessage('auth.magic_link_rate_limited', {
          level: 'warning',
          tags: { area: 'auth' },
          extra: { emailHash, ipHash },
        });
      }
      return rateLimit;
    }

    const baseUrl = resolveBaseUrl();
    const token = randomBytes(32).toString('hex');
    tokenHash = hashIdentifier(token);
    const tokenHashPrefix = tokenHash.slice(0, 12);
    const createdAt = Date.now();

    const record: MagicLinkRecord = {
      email: normalizedEmail,
      createdAt,
      usedAt: null,
      ip: context?.ip,
      userAgent: context?.userAgent,
    };
    await kvAdapter.set(`magic:${tokenHash}`, record, { ex: MAGIC_LINK_EXPIRY_SECONDS });
    tokenStored = true;
    const storedRecord = await kvAdapter.get<MagicLinkRecord | string>(`magic:${tokenHash}`);
    log(
      'info',
      'auth.magic_link_stored',
      { tokenHashPrefix, stored: Boolean(storedRecord) },
      context?.requestId
    );
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    log('info', 'auth.magic_link_sending', { emailHash }, context?.requestId);
    await sendEmail({
      to: normalizedEmail,
      subject: 'Your ChipIn magic link ✨',
      html: `
        <p>Hi there!</p>
        <p>Click below to create your Dream Board:</p>
        <a href="${magicLink}" style="display:inline-block;padding:12px 24px;background:#0D9488;color:white;text-decoration:none;border-radius:12px;font-weight:600;">Continue to ChipIn →</a>
        <p>This link expires in 15 minutes.</p>
        <p>— The ChipIn Team</p>
      `,
      text: `Hi there!\n\nUse this link to continue: ${magicLink}\n\nThis link expires in 15 minutes.\n\n— The ChipIn Team`,
      tags: [
        { name: 'category', value: 'authentication' },
        { name: 'type', value: 'magic_link' },
      ],
    });

    const indexKey = getEmailIndexKey(emailHash);
    try {
      await kvAdapter.zadd(indexKey, { score: createdAt, member: tokenHash });
      await kvAdapter.expire(indexKey, MAGIC_LINK_EXPIRY_SECONDS);
    } catch (indexError) {
      await kvAdapter.del(indexKey);
      log(
        'warn',
        'auth.magic_link_index_update_failed',
        {
          emailHash,
          error: indexError instanceof Error ? indexError.message : 'unknown_error',
        },
        context?.requestId
      );
    }

    return { ok: true } as const;
  } catch (error) {
    if (tokenHash && tokenStored) {
      try {
        await kvAdapter.del(`magic:${tokenHash}`);
      } catch {
        // ignore cleanup failures
      }
    }
    log(
      'error',
      'auth.magic_link_failed',
      { emailHash, error: error instanceof Error ? error.message : 'unknown_error' },
      context?.requestId
    );
    if (!isMockSentry()) {
      Sentry.captureException(error, {
        tags: { area: 'auth', action: 'magic_link' },
        extra: { emailHash, ipHash },
      });
    }
    return { ok: false, reason: 'send_failed' } as const;
  }
}

type VerifyMagicLinkOptions = {
  consume?: boolean;
};

const cleanupOtherMagicLinks = async (email: string, tokenHash: string) => {
  const emailHash = hashIdentifier(email);
  const indexKey = getEmailIndexKey(emailHash);
  const tokens = await kvAdapter.zrange(indexKey, 0, -1);
  const toDelete = tokens.filter((candidate) => candidate !== tokenHash);

  await Promise.all(toDelete.map((hash) => kvAdapter.del(`magic:${hash}`)));
  await kvAdapter.del(indexKey);
};

export async function verifyMagicLink(token: string, options?: VerifyMagicLinkOptions) {
  const consume = options?.consume ?? true;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const tokenHashPrefix = tokenHash.slice(0, 12);
  log('info', 'auth.magic_link_lookup', { tokenHashPrefix });
  const stored = await kvAdapter.get<MagicLinkRecord | string>(`magic:${tokenHash}`);
  const record = normalizeMagicLinkRecord(stored);
  log('info', 'auth.magic_link_lookup_result', { tokenHashPrefix, found: Boolean(record) });
  if (!record) {
    return null;
  }

  if (record.usedAt) {
    return null;
  }

  const ttl = await kvAdapter.ttl(`magic:${tokenHash}`);
  if (ttl === -2) {
    return null;
  }

  if (!consume) {
    return record.email;
  }

  const expiresIn = ttl > 0 ? ttl : MAGIC_LINK_EXPIRY_SECONDS;
  await kvAdapter.set(
    `magic:${tokenHash}`,
    { ...record, usedAt: Date.now() },
    { ex: expiresIn }
  );

  await cleanupOtherMagicLinks(record.email, tokenHash);

  return record.email;
}

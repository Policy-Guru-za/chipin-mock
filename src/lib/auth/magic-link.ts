import { createHash, randomBytes } from 'crypto';

import * as Sentry from '@sentry/nextjs';

import { isMockSentry } from '@/lib/config/feature-flags';
import { kvAdapter } from '@/lib/demo/kv-adapter';
import { ResendApiError, sendEmail } from '@/lib/integrations/email';
import type { EmailPayload } from '@/lib/integrations/email';
import { log } from '@/lib/observability/logger';
import { enforceRateLimit } from './rate-limit';

const MAGIC_LINK_EXPIRY_SECONDS = 60 * 15;
const MAGIC_LINK_LOOKUP_RETRY_DELAYS_MS = [150, 350];
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const lookupMagicLinkRecord = async (tokenHash: string, tokenHashPrefix: string) => {
  let record: MagicLinkRecord | null = null;
  let attempts = 0;

  for (let attempt = 0; attempt <= MAGIC_LINK_LOOKUP_RETRY_DELAYS_MS.length; attempt += 1) {
    attempts = attempt + 1;
    const stored = await kvAdapter.get<MagicLinkRecord | string>(`magic:${tokenHash}`);
    record = normalizeMagicLinkRecord(stored);
    if (record) {
      break;
    }
    if (attempt < MAGIC_LINK_LOOKUP_RETRY_DELAYS_MS.length) {
      const delayMs = MAGIC_LINK_LOOKUP_RETRY_DELAYS_MS[attempt];
      log('warn', 'auth.magic_link_lookup_miss_retry', {
        tokenHashPrefix,
        attempt: attempts,
        delayMs,
      });
      await sleep(delayMs);
    }
  }

  return { record, attempts };
};

const buildMagicLinkEmailPayload = (normalizedEmail: string, magicLink: string): EmailPayload => ({
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

const logMagicLinkStored = async (tokenHash: string, tokenHashPrefix: string, requestId?: string) => {
  const storedRecord = await kvAdapter.get<MagicLinkRecord | string>(`magic:${tokenHash}`);
  log(
    'info',
    'auth.magic_link_stored',
    { tokenHashPrefix, stored: Boolean(storedRecord) },
    requestId
  );
};

const sendMagicLinkEmail = async (params: {
  normalizedEmail: string;
  magicLink: string;
  tokenHash: string;
  tokenHashPrefix: string;
  emailHash: string;
  requestId?: string;
}) => {
  log('info', 'auth.magic_link_sending', { emailHash: params.emailHash }, params.requestId);
  const sendResult = await sendEmail(
    buildMagicLinkEmailPayload(params.normalizedEmail, params.magicLink),
    { idempotencyKey: params.tokenHash }
  );
  log(
    'info',
    'auth.magic_link_sent',
    {
      emailHash: params.emailHash,
      tokenHashPrefix: params.tokenHashPrefix,
      resendId: sendResult && typeof sendResult === 'object' ? sendResult.id ?? null : null,
    },
    params.requestId
  );
};

const updateMagicLinkIndex = async (params: {
  emailHash: string;
  tokenHash: string;
  createdAt: number;
  requestId?: string;
}) => {
  const indexKey = getEmailIndexKey(params.emailHash);
  try {
    await kvAdapter.zadd(indexKey, { score: params.createdAt, member: params.tokenHash });
    await kvAdapter.expire(indexKey, MAGIC_LINK_EXPIRY_SECONDS);
  } catch (indexError) {
    await kvAdapter.del(indexKey);
    log(
      'warn',
      'auth.magic_link_index_update_failed',
      {
        emailHash: params.emailHash,
        error: indexError instanceof Error ? indexError.message : 'unknown_error',
      },
      params.requestId
    );
  }
};

const handleMagicLinkSendFailure = async (params: {
  error: unknown;
  emailHash: string;
  ipHash?: string;
  tokenHash: string | null;
  tokenHashPrefix: string | null;
  tokenStored: boolean;
  requestId?: string;
}) => {
  const errorClass =
    params.error instanceof ResendApiError ? 'resend_api_error' : 'network_or_unknown';
  if (params.tokenHash && params.tokenStored && params.error instanceof ResendApiError) {
    try {
      await kvAdapter.del(`magic:${params.tokenHash}`);
    } catch {
      // ignore cleanup failures
    }
  }
  log(
    'error',
    'auth.magic_link_send_failed',
    {
      emailHash: params.emailHash,
      tokenHashPrefix: params.tokenHashPrefix,
      errorClass,
      error: params.error instanceof Error ? params.error.message : 'unknown_error',
    },
    params.requestId
  );
  if (!isMockSentry()) {
    Sentry.captureException(params.error, {
      tags: { area: 'auth', action: 'magic_link' },
      extra: { emailHash: params.emailHash, ipHash: params.ipHash },
    });
  }
};

const applyMagicLinkRateLimit = async (params: {
  emailHash: string;
  ipHash?: string;
  requestId?: string;
}): Promise<MagicLinkResult | null> => {
  log(
    'info',
    'auth.magic_link_rate_limit_flag',
    {
      raw: process.env.MAGIC_LINK_RATE_LIMIT_DISABLED ?? null,
      disabled: isMagicLinkRateLimitDisabled(),
    },
    params.requestId
  );
  log('info', 'auth.magic_link_requested', { emailHash: params.emailHash, ipHash: params.ipHash }, params.requestId);
  const rateLimit = await checkMagicLinkRateLimit(params.emailHash, params.ipHash);
  if (!rateLimit) {
    return null;
  }

  log('warn', 'auth.magic_link_rate_limited', { emailHash: params.emailHash, ipHash: params.ipHash }, params.requestId);
  if (!isMockSentry()) {
    Sentry.captureMessage('auth.magic_link_rate_limited', {
      level: 'warning',
      tags: { area: 'auth' },
      extra: { emailHash: params.emailHash, ipHash: params.ipHash },
    });
  }
  return rateLimit;
};

const prepareMagicLinkRecord = async (params: {
  normalizedEmail: string;
  context?: MagicLinkContext;
}): Promise<{
  tokenHash: string;
  tokenHashPrefix: string;
  createdAt: number;
  magicLink: string;
}> => {
  const baseUrl = resolveBaseUrl();
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashIdentifier(token);
  const tokenHashPrefix = tokenHash.slice(0, 12);
  const createdAt = Date.now();

  const record: MagicLinkRecord = {
    email: params.normalizedEmail,
    createdAt,
    usedAt: null,
    ip: params.context?.ip,
    userAgent: params.context?.userAgent,
  };
  await kvAdapter.set(`magic:${tokenHash}`, record, { ex: MAGIC_LINK_EXPIRY_SECONDS });
  await logMagicLinkStored(tokenHash, tokenHashPrefix, params.context?.requestId);
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;

  return { tokenHash, tokenHashPrefix, createdAt, magicLink };
};

const attemptMagicLinkSend = async (params: {
  normalizedEmail: string;
  emailHash: string;
  ipHash?: string;
  context?: MagicLinkContext;
}): Promise<MagicLinkResult> => {
  let tokenHash: string | null = null;
  let tokenHashPrefix: string | null = null;
  let tokenStored = false;

  try {
    const prepared = await prepareMagicLinkRecord({
      normalizedEmail: params.normalizedEmail,
      context: params.context,
    });
    tokenHash = prepared.tokenHash;
    tokenHashPrefix = prepared.tokenHashPrefix;
    tokenStored = true;

    await sendMagicLinkEmail({
      normalizedEmail: params.normalizedEmail,
      magicLink: prepared.magicLink,
      tokenHash: prepared.tokenHash,
      tokenHashPrefix: prepared.tokenHashPrefix,
      emailHash: params.emailHash,
      requestId: params.context?.requestId,
    });
    await updateMagicLinkIndex({
      emailHash: params.emailHash,
      tokenHash: prepared.tokenHash,
      createdAt: prepared.createdAt,
      requestId: params.context?.requestId,
    });

    return { ok: true } as const;
  } catch (error) {
    await handleMagicLinkSendFailure({
      error,
      emailHash: params.emailHash,
      ipHash: params.ipHash,
      tokenHash,
      tokenHashPrefix,
      tokenStored,
      requestId: params.context?.requestId,
    });
    return { ok: false, reason: 'send_failed' } as const;
  }
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
  const rateLimit = await applyMagicLinkRateLimit({
    emailHash,
    ipHash,
    requestId: context?.requestId,
  });
  if (rateLimit) {
    return rateLimit;
  }

  return attemptMagicLinkSend({
    normalizedEmail,
    emailHash,
    ipHash,
    context,
  });
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
  const { record, attempts } = await lookupMagicLinkRecord(tokenHash, tokenHashPrefix);
  log('info', 'auth.magic_link_lookup_result', {
    tokenHashPrefix,
    found: Boolean(record),
    attempts,
  });
  if (!record) {
    return null;
  }

  if (record.usedAt) {
    return null;
  }

  if (!consume) {
    return record.email;
  }

  const updated = await kvAdapter.set(
    `magic:${tokenHash}`,
    { ...record, usedAt: Date.now() },
    { keepTtl: true, xx: true }
  );
  if (!updated) {
    return null;
  }

  await cleanupOtherMagicLinks(record.email, tokenHash);

  return record.email;
}

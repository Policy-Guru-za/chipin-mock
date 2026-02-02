import { createHash, randomBytes } from 'crypto';

import * as Sentry from '@sentry/nextjs';

import { isMockSentry } from '@/lib/config/feature-flags';
import { kvAdapter } from '@/lib/demo/kv-adapter';
import { sendEmail } from '@/lib/integrations/email';
import { log } from '@/lib/observability/logger';
import { enforceRateLimit } from './rate-limit';

const MAGIC_LINK_EXPIRY_SECONDS = 60 * 60;
const MAGIC_LINK_REUSE_WINDOW_SECONDS = 60 * 5;

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; reason: 'rate_limited' | 'send_failed'; retryAfterSeconds?: number };

type MagicLinkContext = {
  ip?: string;
  requestId?: string;
};

type MagicLinkRecord = {
  email: string;
  usedAt: number | null;
};

const hashIdentifier = (value: string) => createHash('sha256').update(value).digest('hex');

const normalizeMagicLinkRecord = (value: unknown): MagicLinkRecord | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    return { email: value, usedAt: null };
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Partial<MagicLinkRecord>;
    if (typeof record.email === 'string') {
      return { email: record.email, usedAt: record.usedAt ?? null };
    }
  }
  return null;
};

async function checkMagicLinkRateLimit(
  emailHash: string,
  ipHash?: string
): Promise<MagicLinkResult | null> {
  const emailMinute = await enforceRateLimit(`auth:magic:email:${emailHash}:1m`, {
    limit: 1,
    windowSeconds: 60,
  });
  if (!emailMinute.allowed) {
    return { ok: false, reason: 'rate_limited', retryAfterSeconds: emailMinute.retryAfterSeconds };
  }

  const emailHour = await enforceRateLimit(`auth:magic:email:${emailHash}:1h`, {
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!emailHour.allowed) {
    return { ok: false, reason: 'rate_limited', retryAfterSeconds: emailHour.retryAfterSeconds };
  }

  if (ipHash) {
    const ipHour = await enforceRateLimit(`auth:magic:ip:${ipHash}:1h`, {
      limit: 10,
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

  try {
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

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashIdentifier(token);

    const record: MagicLinkRecord = { email: normalizedEmail, usedAt: null };
    await kvAdapter.set(`magic:${tokenHash}`, record, { ex: MAGIC_LINK_EXPIRY_SECONDS });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    log('info', 'auth.magic_link_sending', { emailHash }, context?.requestId);
    await sendEmail({
      to: normalizedEmail,
      subject: 'Your ChipIn magic link ✨',
      html: `
        <p>Hi there!</p>
        <p>Click below to create your Dream Board:</p>
        <a href="${magicLink}" style="display:inline-block;padding:12px 24px;background:#0D9488;color:white;text-decoration:none;border-radius:12px;font-weight:600;">Continue to ChipIn →</a>
        <p>This link expires in 1 hour.</p>
        <p>— The ChipIn Team</p>
      `,
    });

    return { ok: true } as const;
  } catch (error) {
    log('error', 'auth.magic_link_failed', { emailHash }, context?.requestId);
    if (!isMockSentry()) {
      Sentry.captureException(error, {
        tags: { area: 'auth', action: 'magic_link' },
        extra: { emailHash, ipHash },
      });
    }
    return { ok: false, reason: 'send_failed' } as const;
  }
}

export async function verifyMagicLink(token: string) {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const stored = await kvAdapter.get<MagicLinkRecord | string>(`magic:${tokenHash}`);
  const record = normalizeMagicLinkRecord(stored);
  if (!record) {
    return null;
  }

  if (record.usedAt) {
    const elapsedSeconds = (Date.now() - record.usedAt) / 1000;
    if (elapsedSeconds > MAGIC_LINK_REUSE_WINDOW_SECONDS) {
      await kvAdapter.del(`magic:${tokenHash}`);
      return null;
    }
  }

  const ttl = await kvAdapter.ttl(`magic:${tokenHash}`);
  if (ttl === -2) {
    return null;
  }

  const expiresIn = ttl > 0 ? ttl : MAGIC_LINK_EXPIRY_SECONDS;
  await kvAdapter.set(
    `magic:${tokenHash}`,
    { ...record, usedAt: Date.now() },
    { ex: expiresIn }
  );

  return record.email;
}

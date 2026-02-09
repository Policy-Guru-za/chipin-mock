import { Resend } from 'resend';

const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@gifta.co.za';
const fromName = process.env.RESEND_FROM_NAME ?? 'Gifta';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
};

export class ResendApiError extends Error {
  readonly details: string;

  constructor(details: string) {
    super(`Resend send failed: ${details}`);
    this.name = 'ResendApiError';
    this.details = details;
  }
}

type SendEmailOptions = {
  idempotencyKey?: string;
};

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export async function sendEmail(payload: EmailPayload, options?: SendEmailOptions) {
  const resend = getResendClient();

  const requestOptions = options?.idempotencyKey
    ? { idempotencyKey: options.idempotencyKey }
    : undefined;

  const { data, error } = await resend.emails.send(
    {
      from: `${fromName} <${fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      cc: payload.cc,
      bcc: payload.bcc,
      replyTo: payload.replyTo,
      headers: payload.headers,
      tags: payload.tags,
    },
    requestOptions
  );

  if (error) {
    const details = typeof error === 'object' ? JSON.stringify(error) : String(error);
    throw new ResendApiError(details);
  }

  return data;
}

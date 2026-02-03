import { Resend } from 'resend';

const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@chipin.co.za';
const fromName = process.env.RESEND_FROM_NAME ?? 'ChipIn';

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

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export async function sendEmail(payload: EmailPayload) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
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
  });

  if (error) {
    const details = typeof error === 'object' ? JSON.stringify(error) : String(error);
    throw new Error(`Resend send failed: ${details}`);
  }

  return data;
}

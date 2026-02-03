import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sendMagicLink } from '@/lib/auth/magic-link';
import { getSession } from '@/lib/auth/session';

const emailSchema = z.object({
  email: z.string().email(),
});

type NoticeTone = 'error' | 'warning';

type ErrorNotice = {
  tone: NoticeTone;
  message: string;
};

const errorNoticeStyles: Record<NoticeTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
};

const getErrorNotice = (error: string): ErrorNotice | null => {
  if (!error) return null;
  if (error === 'invalid') {
    return { tone: 'error', message: 'Please enter a valid email address.' };
  }
  return null;
};

const SentNotice = ({ email }: { email: string }) => (
  <div className="rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-text">
    <p className="font-semibold">Check your email!</p>
    <p>We sent a link to {email}.</p>
  </div>
);

const ErrorNotice = ({ notice }: { notice: ErrorNotice }) => (
  <div className={`rounded-xl border px-4 py-3 text-sm ${errorNoticeStyles[notice.tone]}`}>
    {notice.message}
  </div>
);

async function sendMagicLinkAction(formData: FormData) {
  'use server';

  const email = formData.get('email');
  const result = emailSchema.safeParse({ email });

  if (!result.success) {
    redirect('/create?error=invalid');
  }

  const normalizedEmail = result.data.email.trim().toLowerCase();
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? headerStore.get('x-real-ip') ?? undefined;
  const requestId = headerStore.get('x-request-id') ?? undefined;
  const userAgent = headerStore.get('user-agent') ?? undefined;

  const outcome = await sendMagicLink(normalizedEmail, { ip, requestId, userAgent });
  if (!outcome.ok) {
    redirect(`/create?sent=1&email=${encodeURIComponent(normalizedEmail)}`);
  }

  redirect(`/create?sent=1&email=${encodeURIComponent(normalizedEmail)}`);
}

type CreateSearchParams = {
  sent?: string;
  email?: string;
  error?: string;
};

type CreatePageState = {
  sent: boolean;
  email: string;
  errorNotice: ErrorNotice | null;
};

const getCreatePageState = (searchParams?: CreateSearchParams): CreatePageState => {
  const sent = searchParams?.sent === '1';
  const email = searchParams?.email ?? '';
  const error = searchParams?.error ?? '';

  return {
    sent,
    email,
    errorNotice: getErrorNotice(error),
  };
};

const CreateDreamBoardView = ({ sent, email, errorNotice }: CreatePageState) => (
  <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Let’s get started</CardTitle>
        <CardDescription>We’ll email you a link to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sent ? <SentNotice email={email} /> : null}
        {errorNotice ? <ErrorNotice notice={errorNotice} /> : null}
        <form action={sendMagicLinkAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-text">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              defaultValue={email}
            />
          </div>
          <Button type="submit" className="w-full">
            Send magic link
          </Button>
        </form>
        {sent ? (
          <form action={sendMagicLinkAction} className="flex items-center gap-2">
            <input type="hidden" name="email" value={email} />
            <Button type="submit" variant="outline">
              Didn’t receive it? Resend
            </Button>
          </form>
        ) : null}
        <p className="text-xs text-text-muted">We never share your email.</p>
        <p className="text-xs text-text-muted">
          If it doesn’t arrive within a few minutes, check spam or request a new link.
        </p>
        <p className="text-sm text-text-muted">
          Curious first?{' '}
          <Link href="/" className="font-semibold text-text">
            Learn more →
          </Link>
        </p>
      </CardContent>
    </Card>
  </div>
);

export default async function CreateDreamBoardPage({
  searchParams,
}: {
  searchParams?: CreateSearchParams;
}) {
  const session = await getSession();
  if (session) {
    redirect('/create/child');
  }

  const state = getCreatePageState(searchParams);

  return <CreateDreamBoardView {...state} />;
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyMagicLink } from '@/lib/auth/magic-link';
import { createSession } from '@/lib/auth/session';
import { ensureHostForEmail } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const tokenSchema = z.object({
  token: z.string().min(32),
});

type VerifySearchParams = {
  token?: string | string[];
};

async function consumeMagicLinkAction(formData: FormData) {
  'use server';

  const token = formData.get('token');
  const parsed = tokenSchema.safeParse({ token });

  if (!parsed.success) {
    redirect('/auth/verify');
  }

  const email = await verifyMagicLink(parsed.data.token, { consume: true });
  if (!email) {
    redirect('/auth/verify');
  }

  const host = await ensureHostForEmail(email);
  await createSession(host.id, host.email);
  redirect('/create/child');
}

export default async function VerifyPage({ searchParams }: { searchParams?: VerifySearchParams }) {
  const tokenParam = searchParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Magic link expired</CardTitle>
            <CardDescription>We couldn’t find a valid login token.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create" className="font-semibold text-text">
              Request a new link →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parsed = tokenSchema.safeParse({ token });
  if (!parsed.success) {
    redirect('/auth/verify');
  }

  const email = await verifyMagicLink(parsed.data.token, { consume: false });
  if (!email) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Magic link expired</CardTitle>
            <CardDescription>We couldn’t find a valid login token.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create" className="font-semibold text-text">
              Request a new link →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Confirm your sign-in</CardTitle>
          <CardDescription>This link expires in 15 minutes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={consumeMagicLinkAction}>
            <input type="hidden" name="token" value={parsed.data.token} />
            <Button type="submit" className="w-full">
              Continue to ChipIn
            </Button>
          </form>
          <Link href="/create" className="text-sm font-semibold text-text">
            Request a new link →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

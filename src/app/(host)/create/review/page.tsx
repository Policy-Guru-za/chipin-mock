import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { clearDreamBoardDraft, getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { dreamBoardDraftSchema } from '@/lib/dream-boards/schema';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { generateSlug } from '@/lib/utils/slug';
import { parseDateOnly } from '@/lib/utils/date';
import { db } from '@/lib/db';
import { dreamBoards } from '@/lib/db/schema';
import { DEFAULT_PARTNER_ID } from '@/lib/db/partners';
import { sendDreamBoardLink } from '@/lib/integrations/whatsapp';
import { log } from '@/lib/observability/logger';

async function createDreamBoardAction() {
  'use server';

  const session = await requireSession();
  const draft = await getDreamBoardDraft(session.hostId);
  const parsed = dreamBoardDraftSchema.safeParse(draft);

  if (!parsed.success) {
    redirect('/create');
  }

  const slug = generateSlug(parsed.data.childName);
  const [created] = await db
    .insert(dreamBoards)
    .values({
      partnerId: DEFAULT_PARTNER_ID,
      hostId: session.hostId,
      slug,
      childName: parsed.data.childName,
      childPhotoUrl: parsed.data.childPhotoUrl,
      partyDate: parsed.data.partyDate,
      giftName: parsed.data.giftName,
      giftImageUrl: parsed.data.giftImageUrl,
      giftImagePrompt: parsed.data.giftImagePrompt,
      goalCents: parsed.data.goalCents,
      payoutMethod: 'karri_card',
      karriCardNumber: parsed.data.karriCardNumberEncrypted,
      karriCardHolderName: parsed.data.karriCardHolderName,
      hostWhatsAppNumber: parsed.data.hostWhatsAppNumber,
      message: parsed.data.message,
      payoutEmail: parsed.data.payoutEmail,
      status: 'active',
    })
    .returning({ id: dreamBoards.id });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const dreamBoardUrl = `${baseUrl}/${slug}`;
  try {
    await sendDreamBoardLink(parsed.data.hostWhatsAppNumber, dreamBoardUrl, parsed.data.childName);
  } catch (error) {
    log('error', 'whatsapp.dream_board_link_failed', {
      hostId: session.hostId,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
  }

  await clearDreamBoardDraft(session.hostId);
  redirect(`/dashboard/${created.id}`);
}

export default async function CreateReviewPage() {
  const session = await requireSession();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'review', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }

  const parsed = dreamBoardDraftSchema.safeParse(draft);
  if (!parsed.success) {
    redirect('/create');
  }

  const giftTitle = view.giftTitle ?? '';
  const partyDate = parseDateOnly(parsed.data.partyDate);
  const partyDateLabel = partyDate
    ? partyDate.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : parsed.data.partyDate;

  return (
    <CreateFlowShell stepLabel={view.stepLabel} title={view.title} subtitle={view.subtitle}>
      <Card>
        <CardHeader>
          <CardTitle>Guest preview</CardTitle>
          <CardDescription>This is what guests will see.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl border border-border bg-subtle p-6">
            <div className="flex items-center gap-4">
              <Image
                src={parsed.data.childPhotoUrl}
                alt={`${parsed.data.childName} photo`}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <p className="text-xl font-display text-text">
                  {parsed.data.childName}&apos;s Dream Gift
                </p>
                <p className="text-sm text-text-muted">{giftTitle}</p>
                <p className="text-xs text-text-muted">Party date: {partyDateLabel}</p>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
              <Image
                src={parsed.data.giftImageUrl}
                alt={parsed.data.giftName}
                width={800}
                height={600}
                className="h-48 w-full object-cover"
              />
            </div>
            <div className="mt-4 text-sm text-text">
              Goal: {view.goalLabel ?? `R${(parsed.data.goalCents / 100).toFixed(2)}`}
            </div>
            {parsed.data.message ? (
              <p className="mt-3 text-sm text-text-muted">“{parsed.data.message}”</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-text">
            <Link href="/create/child" className="underline">
              Edit child details
            </Link>
            <Link href="/create/gift" className="underline">
              Edit gift
            </Link>
            <Link href="/create/details" className="underline">
              Edit payout details
            </Link>
          </div>

          <form action={createDreamBoardAction}>
            <Button type="submit">Create Dream Board</Button>
          </form>
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}

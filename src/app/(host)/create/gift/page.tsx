import { redirect } from 'next/navigation';
import { z } from 'zod';

import { GiftIconPicker } from '@/components/gift/GiftIconPicker';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import {
  extractIconIdFromPath,
  getGiftIconById,
  isValidGiftIconId,
} from '@/lib/icons/gift-icons';
import { suggestGiftIcon } from '@/lib/icons/suggest-icon';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const manualGiftSchema = z.object({
  giftName: z.string().min(2).max(200),
  giftDescription: z.string().max(500).optional(),
  giftIconId: z.string().min(1),
});

type GiftSearchParams = {
  error?: string;
};

const getErrorMessage = (error?: string) =>
  (
    {
      invalid: 'Please complete all required fields.',
    }[error ?? ''] ?? null
  );

const resolveDefaultGiftName = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftName ?? '';

const resolveDefaultGiftDescription = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftDescription ?? '';

const resolveDefaultIconId = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) => {
  const draftIconId = draft?.giftIconId;
  if (draftIconId && isValidGiftIconId(draftIconId)) {
    return draftIconId;
  }

  const iconIdFromPath = extractIconIdFromPath(draft?.giftImageUrl ?? '');
  if (iconIdFromPath && isValidGiftIconId(iconIdFromPath)) {
    return iconIdFromPath;
  }

  return suggestGiftIcon({
    giftName: draft?.giftName ?? '',
    giftDescription: draft?.giftDescription,
    childAge: draft?.childAge,
  }).id;
};

async function saveManualGiftAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'gift', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft?.childPhotoUrl) {
    redirect('/create/child');
  }

  const giftName = formData.get('giftName');
  const giftDescription = formData.get('giftDescription');
  const giftIconId = formData.get('giftIconId');

  const result = manualGiftSchema.safeParse({
    giftName,
    giftDescription,
    giftIconId,
  });

  if (!result.success) {
    redirect('/create/gift?error=invalid');
  }

  const icon = getGiftIconById(result.data.giftIconId);
  if (!icon) {
    redirect('/create/gift?error=invalid');
  }

  const normalizedGiftDescription = result.data.giftDescription?.trim();

  await updateDreamBoardDraft(session.hostId, {
    giftName: result.data.giftName.trim(),
    giftDescription: normalizedGiftDescription && normalizedGiftDescription.length ? normalizedGiftDescription : undefined,
    giftIconId: icon.id,
    giftImageUrl: icon.src,
    giftImagePrompt: undefined,
    goalCents: 0,
  });

  redirect('/create/dates');
}

export default async function CreateGiftPage({
  searchParams,
}: {
  searchParams?: Promise<GiftSearchParams>;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'gift', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/child');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);
  const defaultGiftName = resolveDefaultGiftName(draft);
  const defaultGiftDescription = resolveDefaultGiftDescription(draft);
  const defaultIconId = resolveDefaultIconId(draft);

  return (
    <CreateFlowShell
      currentStep={2}
      totalSteps={6}
      stepLabel={view.stepLabel}
      title={view.title}
      subtitle={view.subtitle}
    >
      <Card>
        <CardHeader>
          <CardTitle>The dream gift</CardTitle>
          <CardDescription>Describe the dream gift.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={saveManualGiftAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="giftName" className="text-sm font-medium text-text">
                Gift name
              </label>
              <Input
                id="giftName"
                name="giftName"
                placeholder="E.g., red mountain bike"
                defaultValue={defaultGiftName}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="giftDescription" className="text-sm font-medium text-text">
                Describe the dream gift
              </label>
              <Textarea
                id="giftDescription"
                name="giftDescription"
                placeholder="E.g., a red mountain bike with a basket and shiny streamers."
                defaultValue={defaultGiftDescription}
              />
              <p className="text-xs text-text-muted">
                Describe the gift so contributors know what they&apos;re chipping in for.
              </p>
            </div>

            <GiftIconPicker
              selectedIconId={defaultIconId}
              giftNameInputId="giftName"
              giftDescriptionInputId="giftDescription"
              defaultGiftName={defaultGiftName}
              defaultGiftDescription={defaultGiftDescription}
              childAge={draft?.childAge}
            />

            <Button type="submit">Continue to dates</Button>
          </form>
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}

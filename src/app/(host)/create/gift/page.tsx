import { redirect } from 'next/navigation';

import { saveManualGiftAction } from '@/app/(host)/create/gift/actions';
import { GiftIconPicker } from '@/components/gift/GiftIconPicker';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import {
  extractIconIdFromPath,
  isValidGiftIconId,
} from '@/lib/icons/gift-icons';
import { suggestGiftIcon } from '@/lib/icons/suggest-icon';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

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

const resolveDefaultMessage = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.message ?? '';

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
  const defaultMessage = resolveDefaultMessage(draft);
  const defaultIconId = resolveDefaultIconId(draft);
  const messageAuthor = draft.childName?.trim() ? draft.childName.trim() : 'your child';

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

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-text">
                {`A message from ${messageAuthor}`}
              </label>
              <Textarea
                id="message"
                name="message"
                maxLength={280}
                placeholder="E.g., Thank you for helping make this dream gift possible."
                defaultValue={defaultMessage}
              />
              <p className="text-xs text-text-muted">
                This note is saved with this Dreamboard and may appear on the public Dreamboard.
              </p>
            </div>

            <Button type="submit">Continue to dates</Button>
          </form>
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}

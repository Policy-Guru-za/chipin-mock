import { redirect } from 'next/navigation';

import { getClerkUrls } from '@/lib/auth/clerk-config';
import { getHostAuth } from '@/lib/auth/clerk-wrappers';
import { clearDreamBoardDraft, getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { deleteChildPhoto } from '@/lib/integrations/blob';
import { log } from '@/lib/observability/logger';
const buildRedirectUrl = (baseUrl: string, redirectUrl: string) =>
  `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}redirect_url=${encodeURIComponent(redirectUrl)}`;

export default async function CreateDreamBoardPage() {
  const auth = await getHostAuth();
  if (auth) {
    let existingPhotoUrl: string | undefined;
    try {
      const existingDraft = await getDreamBoardDraft(auth.hostId);
      existingPhotoUrl = existingDraft?.childPhotoUrl;
    } catch (error) {
      log('warn', 'create_fresh_start_draft_read_failed', {
        hostId: auth.hostId,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }

    try {
      await clearDreamBoardDraft(auth.hostId);
    } catch (error) {
      log('error', 'create_fresh_start_clear_failed', {
        hostId: auth.hostId,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      throw error;
    }

    if (existingPhotoUrl) {
      try {
        await deleteChildPhoto(existingPhotoUrl);
      } catch (error) {
        log('warn', 'create_fresh_start_photo_delete_failed', {
          hostId: auth.hostId,
          childPhotoUrl: existingPhotoUrl,
          error: error instanceof Error ? error.message : 'unknown_error',
        });
      }
    }

    redirect('/create/child');
  }

  const { signInUrl } = getClerkUrls();
  redirect(buildRedirectUrl(signInUrl, '/create'));
}

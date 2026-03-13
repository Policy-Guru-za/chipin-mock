import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import {
  getHostCreateDreamBoardDraft,
  updateHostCreateDreamBoardDraft,
} from '@/lib/dream-boards/draft';
import { DEFAULT_HOST_CREATE_PAYOUT_METHOD } from '@/lib/dream-boards/payout-methods';
import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const voucherSchema = z.object({
  payoutEmail: z.string().email(),
  hostWhatsAppNumber: z.string(),
});

export async function saveVoucherAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getHostCreateDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'voucher', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }

  const parsed = voucherSchema.safeParse({
    payoutEmail: formData.get('payoutEmail'),
    hostWhatsAppNumber: formData.get('hostWhatsAppNumber'),
  });
  if (!parsed.success) {
    redirect('/create/voucher?error=invalid');
  }

  if (!SA_MOBILE_REGEX.test(parsed.data.hostWhatsAppNumber)) {
    redirect('/create/voucher?error=whatsapp');
  }

  await updateHostCreateDreamBoardDraft(session.hostId, {
    payoutMethod: DEFAULT_HOST_CREATE_PAYOUT_METHOD,
    payoutEmail: parsed.data.payoutEmail,
    hostWhatsAppNumber: parsed.data.hostWhatsAppNumber,
  });

  redirect('/create/review');
}

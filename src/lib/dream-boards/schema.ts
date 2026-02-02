import { z } from 'zod';

import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';

export const dreamBoardDraftSchema = z
  .object({
    childName: z.string().min(2).max(50),
    partyDate: z.string().min(1),
    childPhotoUrl: z.string().url(),
    giftName: z.string().min(2).max(200),
    giftDescription: z.string().min(10).max(500).optional(),
    giftImageUrl: z.string().url(),
    giftImagePrompt: z.string().min(1).optional(),
    goalCents: z.number().int().positive(),
    payoutEmail: z.string().email(),
    karriCardNumberEncrypted: z.string().min(1),
    karriCardHolderName: z.string().min(2).max(100),
    hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    message: z.string().max(280).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.karriCardNumberEncrypted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['karriCardNumberEncrypted'],
        message: 'Karri card number is required',
      });
    }
  });

export type DreamBoardDraftPayload = z.infer<typeof dreamBoardDraftSchema>;

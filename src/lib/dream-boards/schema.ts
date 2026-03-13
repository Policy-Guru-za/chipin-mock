import { z } from 'zod';

import { DEFAULT_HOST_CREATE_PAYOUT_METHOD } from '@/lib/dream-boards/payout-methods';
import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';

export const hostCreateDreamBoardDraftSchema = z
  .object({
    childName: z.string().min(2).max(50),
    childAge: z.number().int().min(1).max(18),
    birthdayDate: z.string().min(1),
    partyDate: z.string().min(1),
    partyDateTime: z.string().datetime().nullable().optional(),
    campaignEndDate: z.string().min(1),
    childPhotoUrl: z.string().url(),
    giftName: z.string().min(2).max(200),
    giftDescription: z.string().max(500).optional(),
    giftIconId: z.string().min(1).optional(),
    giftImageUrl: z.string().regex(/^\/icons\/gifts\/[a-z0-9-]+\.png$/, 'Must be a valid gift icon path'),
    giftImagePrompt: z.string().optional(),
    goalCents: z.number().int().min(0).optional().default(0),
    payoutMethod: z.literal(DEFAULT_HOST_CREATE_PAYOUT_METHOD).default(DEFAULT_HOST_CREATE_PAYOUT_METHOD),
    payoutEmail: z.string().email(),
    hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    message: z.string().max(280).optional(),
  })
  .strict();

export const dreamBoardDraftSchema = hostCreateDreamBoardDraftSchema;

export type HostCreateDreamBoardDraftPayload = z.infer<typeof hostCreateDreamBoardDraftSchema>;
export type DreamBoardDraftPayload = HostCreateDreamBoardDraftPayload;

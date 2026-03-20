import { z } from 'zod';

import {
  DEFAULT_HOST_CREATE_PAYOUT_METHOD,
  HOST_CREATE_PAYOUT_METHODS,
} from '@/lib/dream-boards/payout-methods';
import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';

const hostCreateDreamBoardDraftObjectSchema = z.object({
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
    payoutMethod: z.enum(HOST_CREATE_PAYOUT_METHODS).default(DEFAULT_HOST_CREATE_PAYOUT_METHOD),
    payoutEmail: z.string().email(),
    hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    karriCardNumberEncrypted: z.string().min(1).optional(),
    karriCardHolderName: z.string().min(2).max(100).optional(),
    bankName: z.string().min(2).max(120).optional(),
    bankAccountNumberEncrypted: z.string().min(1).optional(),
    bankAccountLast4: z.string().regex(/^\d{4}$/).optional(),
    bankBranchCode: z.string().min(2).max(20).optional(),
    bankAccountHolder: z.string().min(2).max(120).optional(),
    message: z.string().max(280).optional(),
  });

const withHostCreatePayoutValidation = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  schema.superRefine((value, ctx) => {
    if (value.payoutMethod === 'karri_card') {
      if (!value.karriCardNumberEncrypted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['karriCardNumberEncrypted'],
          message: 'Karri card details are required',
        });
      }
      if (!value.karriCardHolderName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['karriCardHolderName'],
          message: 'Karri card holder name is required',
        });
      }
    }

    if (value.payoutMethod === 'bank') {
      if (!value.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankName'],
          message: 'Bank name is required',
        });
      }
      if (!value.bankAccountNumberEncrypted || !value.bankAccountLast4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountNumberEncrypted'],
          message: 'Bank account details are required',
        });
      }
      if (!value.bankBranchCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankBranchCode'],
          message: 'Bank branch code is required',
        });
      }
      if (!value.bankAccountHolder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountHolder'],
          message: 'Bank account holder is required',
        });
      }
    }
  });

export const hostCreateDreamBoardDraftSchema = withHostCreatePayoutValidation(
  hostCreateDreamBoardDraftObjectSchema.strict()
);

export const hostCreateDreamBoardDraftPersistedSchema = withHostCreatePayoutValidation(
  hostCreateDreamBoardDraftObjectSchema.strip()
);

export const dreamBoardDraftSchema = hostCreateDreamBoardDraftSchema;

export type HostCreateDreamBoardDraftPayload = z.infer<typeof hostCreateDreamBoardDraftSchema>;
export type DreamBoardDraftPayload = HostCreateDreamBoardDraftPayload;

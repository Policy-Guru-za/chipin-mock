import { z } from 'zod';

import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';

export const dreamBoardDraftSchema = z
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
    payoutMethod: z.enum(['karri_card', 'bank']),
    payoutEmail: z.string().email(),
    karriCardNumberEncrypted: z.string().min(1).optional(),
    karriCardHolderName: z.string().min(2).max(100).optional(),
    bankName: z.string().min(2).max(120).optional(),
    bankAccountNumberEncrypted: z.string().min(1).optional(),
    bankAccountLast4: z.string().regex(/^\d{4}$/).optional(),
    bankBranchCode: z.string().min(2).max(20).optional(),
    bankAccountHolder: z.string().min(2).max(120).optional(),
    charityEnabled: z.boolean().optional().default(false),
    charityId: z.string().uuid().optional(),
    charitySplitType: z.enum(['percentage', 'threshold']).optional(),
    charityPercentageBps: z.number().int().min(500).max(5000).optional(),
    charityThresholdCents: z.number().int().min(5000).optional(),
    hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    message: z.string().max(280).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.payoutMethod === 'karri_card' && !value.karriCardNumberEncrypted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['karriCardNumberEncrypted'],
        message: 'Karri card number is required',
      });
    }

    if (value.payoutMethod === 'karri_card' && !value.karriCardHolderName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['karriCardHolderName'],
        message: 'Karri card holder is required',
      });
    }

    if (value.payoutMethod === 'bank') {
      if (!value.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankName'],
          message: 'Bank name is required',
        });
      }
      if (!value.bankAccountNumberEncrypted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountNumberEncrypted'],
          message: 'Bank account number is required',
        });
      }
      if (!value.bankAccountLast4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountLast4'],
          message: 'Bank account last 4 digits are required',
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

    if (value.charityEnabled) {
      if (!value.charityId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['charityId'],
          message: 'Charity is required',
        });
      }
      if (!value.charitySplitType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['charitySplitType'],
          message: 'Charity split type is required',
        });
      }

      if (value.charitySplitType === 'percentage' && value.charityPercentageBps === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['charityPercentageBps'],
          message: 'Charity percentage is required',
        });
      }

      if (value.charitySplitType === 'threshold' && value.charityThresholdCents === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['charityThresholdCents'],
          message: 'Charity threshold is required',
        });
      }
    }
  });

export type DreamBoardDraftPayload = z.infer<typeof dreamBoardDraftSchema>;

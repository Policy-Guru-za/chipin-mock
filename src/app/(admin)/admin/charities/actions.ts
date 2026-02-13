'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';
import { createCharity, setCharityActiveState, updateCharity } from '@/lib/charities/service';
import { autofillCharityDraftFromUrl, type AutofillCharityDraftFromUrlResult } from '@/lib/charities/autofill';

const categories = ['Education', 'Health', 'Environment', 'Community', 'Other'] as const;

const createCharitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2),
  category: z.enum(categories),
  logoUrl: z.string().trim().url(),
});

const updateCharitySchema = createCharitySchema.extend({
  website: z.string().trim().url().or(z.literal('')),
  contactName: z.string().trim().min(2).max(120).or(z.literal('')),
  contactEmail: z.string().trim().email().max(255).or(z.literal('')),
  bankDetailsEncrypted: z.string().trim(),
});

const parseBankDetails = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
};

const toActionError = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object') {
    const maybeError = error as {
      code?: string;
      constraint?: string;
      message?: string;
    };

    if (
      maybeError.code === '23505' ||
      maybeError.constraint === 'unique_charities_name' ||
      maybeError.message?.toLowerCase().includes('unique_charities_name')
    ) {
      return 'A charity with this name already exists.';
    }
  }

  if (error instanceof Error && error.message.toLowerCase().includes('duplicate')) {
    return 'A charity with this name already exists.';
  }

  return fallback;
};

const getTrimmedField = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const toCreatePayload = (formData: FormData) => ({
  name: getTrimmedField(formData, 'name'),
  description: getTrimmedField(formData, 'description'),
  category: getTrimmedField(formData, 'category'),
  logoUrl: getTrimmedField(formData, 'logoUrl'),
});

const toUpdatePayload = (formData: FormData) => ({
  ...toCreatePayload(formData),
  website: getTrimmedField(formData, 'website'),
  contactName: getTrimmedField(formData, 'contactName'),
  contactEmail: getTrimmedField(formData, 'contactEmail'),
  bankDetailsEncrypted: getTrimmedField(formData, 'bankDetailsEncrypted'),
});

export type GenerateCharityDraftFromUrlResult = AutofillCharityDraftFromUrlResult;

export async function createCharityAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();

  const parsed = createCharitySchema.safeParse(toCreatePayload(formData));
  if (!parsed.success) {
    return { success: false, error: 'Please complete all required charity fields.' };
  }

  try {
    await createCharity({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      logoUrl: parsed.data.logoUrl,
    });
  } catch (error) {
    return { success: false, error: toActionError(error, 'Could not create charity.') };
  }

  revalidatePath('/admin/charities');
  return { success: true };
}

export async function updateCharityAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();

  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: 'Invalid charity id.' };
  }

  const parsed = updateCharitySchema.safeParse(toUpdatePayload(formData));
  if (!parsed.success) {
    return { success: false, error: 'Please complete all required charity fields.' };
  }

  const hasBankDetailsUpdate = parsed.data.bankDetailsEncrypted.length > 0;
  const bankDetailsEncrypted = hasBankDetailsUpdate
    ? parseBankDetails(parsed.data.bankDetailsEncrypted)
    : null;
  if (hasBankDetailsUpdate && !bankDetailsEncrypted) {
    return { success: false, error: 'Bank details must be valid JSON.' };
  }

  try {
    const updated = await updateCharity({
      id: parsedId.data,
      input: {
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category,
        logoUrl: parsed.data.logoUrl,
        website: parsed.data.website || null,
        contactName: parsed.data.contactName || null,
        contactEmail: parsed.data.contactEmail || null,
        ...(bankDetailsEncrypted ? { bankDetailsEncrypted } : {}),
      },
    });

    if (!updated) {
      return { success: false, error: 'Charity not found.' };
    }
  } catch (error) {
    return { success: false, error: toActionError(error, 'Could not update charity.') };
  }

  revalidatePath('/admin/charities');
  return { success: true };
}

export async function toggleCharityStatusAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();

  const parsed = z
    .object({
      id: z.string().uuid(),
      isActive: z.boolean(),
    })
    .safeParse({ id, isActive });

  if (!parsed.success) {
    return { success: false, error: 'Invalid status payload.' };
  }

  try {
    const updated = await setCharityActiveState({
      id: parsed.data.id,
      isActive: parsed.data.isActive,
    });
    if (!updated) {
      return { success: false, error: 'Charity not found.' };
    }
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, 'Could not update charity status.'),
    };
  }

  revalidatePath('/admin/charities');
  return { success: true };
}

export async function generateCharityDraftFromUrlAction(
  rawUrl: string
): Promise<GenerateCharityDraftFromUrlResult> {
  await requireAdminAuth();
  return autofillCharityDraftFromUrl(rawUrl);
}

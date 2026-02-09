'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';
import { createCharity, setCharityActiveState, updateCharity } from '@/lib/charities/service';

const charityBaseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2),
  category: z.string().trim().min(2).max(80),
  logoUrl: z.string().trim().url(),
  website: z.string().trim().url().optional().or(z.literal('')),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(255),
});

const createCharitySchema = charityBaseSchema.extend({
  bankDetailsEncrypted: z.string().trim().min(2),
});

const updateCharitySchema = charityBaseSchema.extend({
  bankDetailsEncrypted: z.string().trim().optional().or(z.literal('')),
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

const toBasePayload = (formData: FormData) => ({
    name: formData.get('name'),
    description: formData.get('description'),
    category: formData.get('category'),
    logoUrl: formData.get('logoUrl'),
    website: formData.get('website'),
    contactName: formData.get('contactName'),
    contactEmail: formData.get('contactEmail'),
  });

export async function createCharityAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();

  const parsed = createCharitySchema.safeParse({
    ...toBasePayload(formData),
    bankDetailsEncrypted: formData.get('bankDetailsEncrypted'),
  });
  if (!parsed.success) {
    return { success: false, error: 'Please complete all required charity fields.' };
  }

  const bankDetailsEncrypted = parseBankDetails(parsed.data.bankDetailsEncrypted);
  if (!bankDetailsEncrypted) {
    return { success: false, error: 'Bank details must be valid JSON.' };
  }

  try {
    await createCharity({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      logoUrl: parsed.data.logoUrl,
      website: parsed.data.website || null,
      bankDetailsEncrypted,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
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

  const parsed = updateCharitySchema.safeParse({
    ...toBasePayload(formData),
    bankDetailsEncrypted: formData.get('bankDetailsEncrypted') ?? undefined,
  });
  if (!parsed.success) {
    return { success: false, error: 'Please complete all required charity fields.' };
  }

  const hasBankDetailsUpdate = Boolean(parsed.data.bankDetailsEncrypted?.trim());
  const bankDetailsEncrypted = hasBankDetailsUpdate
    ? parseBankDetails(parsed.data.bankDetailsEncrypted ?? '')
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
        ...(bankDetailsEncrypted ? { bankDetailsEncrypted } : {}),
        contactName: parsed.data.contactName,
        contactEmail: parsed.data.contactEmail,
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

import type { EmailPayload } from '@/lib/integrations/email';

export type ReminderTemplateVariables = {
  childName: string;
  giftName: string;
  dreamBoardUrl: string;
  campaignCloseDate: string;
};

export type ReminderWhatsAppTemplatePayload = {
  template: 'contribution_reminder';
  languageCode: string;
  bodyParams: [string, string, string, string];
};

export class ReminderTemplateValidationError extends Error {
  readonly missingFields: string[];

  constructor(missingFields: string[]) {
    super(`Missing reminder template variables: ${missingFields.join(', ')}`);
    this.name = 'ReminderTemplateValidationError';
    this.missingFields = missingFields;
  }
}

const isPresent = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const getMissingReminderTemplateFields = (
  variables: Partial<ReminderTemplateVariables>
): string[] => {
  const missing: string[] = [];

  if (!isPresent(variables.childName)) missing.push('child_name');
  if (!isPresent(variables.giftName)) missing.push('dreamboard_title');
  if (!isPresent(variables.dreamBoardUrl)) missing.push('dreamboard_url');
  if (!isPresent(variables.campaignCloseDate)) missing.push('campaign_close_date');

  return missing;
};

export const assertReminderTemplateVariables = (
  variables: Partial<ReminderTemplateVariables>
): ReminderTemplateVariables => {
  const missing = getMissingReminderTemplateFields(variables);
  if (missing.length > 0) {
    throw new ReminderTemplateValidationError(missing);
  }

  return {
    childName: variables.childName!.trim(),
    giftName: variables.giftName!.trim(),
    dreamBoardUrl: variables.dreamBoardUrl!.trim(),
    campaignCloseDate: variables.campaignCloseDate!.trim(),
  };
};

export const buildReminderEmailPayload = (params: {
  toEmail: string;
  variables: Partial<ReminderTemplateVariables>;
}): EmailPayload => {
  const vars = assertReminderTemplateVariables(params.variables);
  const safeChildName = escapeHtml(vars.childName);
  const safeGiftName = escapeHtml(vars.giftName);
  const safeUrl = escapeHtml(vars.dreamBoardUrl);
  const safeCloseDate = escapeHtml(vars.campaignCloseDate);

  return {
    to: params.toEmail.trim().toLowerCase(),
    subject: `🔔 Reminder: chip in for ${vars.childName}'s gift`,
    html: [
      `<p>Hi there,</p>`,
      `<p>${safeChildName}'s Dreamboard for <strong>${safeGiftName}</strong> is still open.</p>`,
      `<p>Please chip in before <strong>${safeCloseDate}</strong>.</p>`,
      `<p><a href="${safeUrl}">Chip in now</a></p>`,
      `<p>If you've already chipped in, thank you.</p>`,
    ].join(''),
    text: [
      `Reminder: ${vars.childName}'s Dreamboard for ${vars.giftName} is still open.`,
      `Chip in before ${vars.campaignCloseDate}.`,
      `Chip in now: ${vars.dreamBoardUrl}`,
    ].join('\n'),
  };
};

export const buildReminderWhatsAppTemplatePayload = (
  variables: Partial<ReminderTemplateVariables>
): ReminderWhatsAppTemplatePayload => {
  const vars = assertReminderTemplateVariables(variables);

  return {
    template: 'contribution_reminder',
    languageCode: 'en_US',
    bodyParams: [vars.childName, vars.giftName, vars.dreamBoardUrl, vars.campaignCloseDate],
  };
};

import { describe, expect, it } from 'vitest';

import {
  buildReminderEmailPayload,
  buildReminderWhatsAppTemplatePayload,
  ReminderTemplateValidationError,
} from '@/lib/reminders/templates';

describe('reminder templates', () => {
  it('builds email payload with required variables', () => {
    const payload = buildReminderEmailPayload({
      toEmail: 'Friend@Example.com',
      variables: {
        childName: 'Maya',
        giftName: 'Scooter',
        dreamBoardUrl: 'https://gifta.example/maya-board',
        campaignCloseDate: '2099-01-30',
      },
    });

    expect(payload.to).toBe('friend@example.com');
    expect(payload.subject).toContain('Maya');
    expect(payload.subject).toContain('Scooter');
    expect(payload.html).toContain('Contribute now');
    expect(payload.text).toContain('https://gifta.example/maya-board');
  });

  it('throws when required reminder variables are missing', () => {
    expect(() =>
      buildReminderEmailPayload({
        toEmail: 'friend@example.com',
        variables: {
          childName: 'Maya',
          giftName: '',
          dreamBoardUrl: '',
          campaignCloseDate: '',
        },
      })
    ).toThrow(ReminderTemplateValidationError);
  });

  it('builds WhatsApp template payload shape for future provider wiring', () => {
    const payload = buildReminderWhatsAppTemplatePayload({
      childName: 'Maya',
      giftName: 'Scooter',
      dreamBoardUrl: 'https://gifta.example/maya-board',
      campaignCloseDate: '2099-01-30',
    });

    expect(payload.template).toBe('contribution_reminder');
    expect(payload.languageCode).toBe('en_US');
    expect(payload.bodyParams).toEqual([
      'Maya',
      'Scooter',
      'https://gifta.example/maya-board',
      '2099-01-30',
    ]);
  });
});

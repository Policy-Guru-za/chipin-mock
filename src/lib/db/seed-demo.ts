import { createHash } from 'crypto';

import { buildDemoAssetUrl } from '@/lib/demo/urls';
import { db } from './index';
import {
  apiKeys,
  auditLogs,
  contributions,
  dreamBoards,
  hosts,
  partners,
  payoutItems,
  payouts,
  webhookEvents,
} from './schema';
import { DEFAULT_PARTNER_ID, DEFAULT_PARTNER_NAME } from './partners';

export const DEMO_SEEDED_BOARD_SLUG = 'emma-birthday-demo';

export async function seedDemoDatabase(): Promise<void> {
  await db.delete(webhookEvents);
  await db.delete(auditLogs);
  await db.delete(payoutItems);
  await db.delete(apiKeys);
  await db.delete(payouts);
  await db.delete(contributions);
  await db.delete(dreamBoards);
  await db.delete(hosts);
  await db.delete(partners);

  await db.insert(partners).values({
    id: DEFAULT_PARTNER_ID,
    name: DEFAULT_PARTNER_NAME,
  });

  const [host] = await db
    .insert(hosts)
    .values({
      email: 'sarah@demo.chipin.co.za',
      name: 'Sarah Thompson',
    })
    .returning({ id: hosts.id });

  // v2.0: Party date serves as pot close date
  const futurePartyDate = new Date();
  futurePartyDate.setMonth(futurePartyDate.getMonth() + 1);
  const partyDate = futurePartyDate.toISOString().split('T')[0];

  const childPhotoUrl = buildDemoAssetUrl('/images/child-placeholder.svg');
  const giftImageUrl = buildDemoAssetUrl('/images/child-placeholder.svg');

  const [dreamBoard] = await db
    .insert(dreamBoards)
    .values({
      partnerId: DEFAULT_PARTNER_ID,
      hostId: host.id,
      slug: DEMO_SEEDED_BOARD_SLUG,
      childName: 'Emma',
      childPhotoUrl,
      partyDate,
      // v2.0: Manual gift definition with AI artwork
      giftName: 'Storytime Train Set',
      giftImageUrl,
      giftImagePrompt: 'A whimsical watercolor illustration of a wooden train set for a child',
      goalCents: 35000,
      // v2.0: Karri Card is sole payout method
      payoutMethod: 'karri_card',
      karriCardNumber: '5234123456781234',
      karriCardHolderName: 'Emma Thompson',
      hostWhatsAppNumber: '+27821234567',
      message: "Let's make Emma's birthday magical.",
      status: 'active',
      payoutEmail: 'sarah@demo.chipin.co.za',
    })
    .returning({ id: dreamBoards.id });

  await db.insert(contributions).values({
    partnerId: DEFAULT_PARTNER_ID,
    dreamBoardId: dreamBoard.id,
    contributorName: 'Ava',
    message: 'Happy birthday, Emma!',
    amountCents: 5000,
    feeCents: 300,
    paymentProvider: 'payfast',
    paymentRef: 'PF-DEMO-001',
    paymentStatus: 'completed',
  });

  // v2.0: Karri Card is sole payout type
  const [payout] = await db
    .insert(payouts)
    .values({
      partnerId: DEFAULT_PARTNER_ID,
      dreamBoardId: dreamBoard.id,
      type: 'karri_card',
      grossCents: 5000,
      feeCents: 300,
      netCents: 4700,
      recipientData: {
        email: 'sarah@demo.chipin.co.za',
        karriCardNumber: '5234123456781234',
        karriCardHolderName: 'Emma Thompson',
      },
      status: 'pending',
    })
    .returning({ id: payouts.id });

  await db.insert(payoutItems).values({
    payoutId: payout.id,
    dreamBoardId: dreamBoard.id,
    type: 'gift',
    amountCents: 4700,
    metadata: { seeded: true },
  });

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      partnerId: DEFAULT_PARTNER_ID,
      partnerName: 'Demo Partner',
      keyHash: createHash('sha256')
        .update('cpk_test_0123456789abcdef0123456789abcdef')
        .digest('hex'),
      keyPrefix: 'cpk_test_',
      scopes: ['dreamboards:read'],
      rateLimit: 1000,
      isActive: true,
    })
    .returning({ id: apiKeys.id });

  await db.insert(webhookEvents).values({
    apiKeyId: apiKey.id,
    eventType: 'dream_board.created',
    payload: {
      dreamBoardId: dreamBoard.id,
      hostId: host.id,
    },
    status: 'pending',
    attempts: 0,
  });
}

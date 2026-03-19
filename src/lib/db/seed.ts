import { createHash } from 'crypto';

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

export async function seedDatabase() {
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
      email: 'lerato@gifta.co.za',
      name: 'Lerato Mahlangu',
    })
    .returning({ id: hosts.id });

  // v2.0: Party date serves as pot close date
  const futurePartyDate = new Date();
  futurePartyDate.setMonth(futurePartyDate.getMonth() + 1);
  const partyDate = futurePartyDate.toISOString().split('T')[0];

  const [dreamBoard] = await db
    .insert(dreamBoards)
    .values({
      partnerId: DEFAULT_PARTNER_ID,
      hostId: host.id,
      slug: 'maya-birthday-demo',
      childName: 'Maya',
      childPhotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      partyDate,
      // v4.0: Manual gift definition with curated icon
      giftName: 'Wooden Train Set',
      giftImageUrl: '/icons/gifts/train.png',
      giftImagePrompt: null,
      goalCents: 35000,
      // v2.0+: Voucher-first active payout path
      payoutMethod: 'takealot_voucher',
      hostWhatsAppNumber: '+27821234567',
      message: "Let's make Maya's birthday magical.",
      status: 'active',
      payoutEmail: 'lerato@gifta.co.za',
    })
    .returning({ id: dreamBoards.id });

  await db.insert(contributions).values({
    partnerId: DEFAULT_PARTNER_ID,
    dreamBoardId: dreamBoard.id,
    contributorName: 'Ava',
    message: 'Happy birthday, Maya!',
    amountCents: 5000,
    feeCents: 0,
    paymentProvider: 'stitch',
    paymentRef: 'STITCH-TEST-001',
    paymentStatus: 'completed',
  });

  // v2.0+: Voucher payout row for the active seeded flow
  const [payout] = await db
    .insert(payouts)
    .values({
      partnerId: DEFAULT_PARTNER_ID,
      dreamBoardId: dreamBoard.id,
      type: 'takealot_voucher',
      grossCents: 5000,
      feeCents: 0,
      netCents: 5000,
      recipientData: {
        email: 'lerato@gifta.co.za',
        payoutMethod: 'takealot_voucher',
        hostWhatsAppNumber: '+27821234567',
        childName: 'Maya',
        giftName: 'Wooden Train Set',
        giftImageUrl: '/icons/gifts/train.png',
        fulfilmentMode: 'manual_placeholder',
      },
      status: 'pending',
    })
    .returning({ id: payouts.id });

  await db.insert(payoutItems).values({
    payoutId: payout.id,
    dreamBoardId: dreamBoard.id,
    type: 'gift',
    amountCents: 5000,
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

import { NextRequest, NextResponse } from 'next/server';

import { recordAuditEvent } from '@/lib/audit';
import { requireInternalAuth, getInternalActor } from '@/lib/api/internal-auth';
import { deactivateApiKey, getApiKeyById } from '@/lib/db/api-key-queries';
import { isValidUuid } from '@/lib/api/validation';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const auth = requireInternalAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const existing = await getApiKeyById(id);
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const updated = await deactivateApiKey(id);
  if (!updated) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await recordAuditEvent({
    actor: getInternalActor(request),
    action: 'api_key.revoked',
    target: { type: 'api_key', id },
    metadata: {
      partnerName: existing.partnerName,
      scopes: existing.scopes,
      rateLimit: existing.rateLimit,
    },
  });

  return NextResponse.json({ data: { id } }, { status: 200 });
}

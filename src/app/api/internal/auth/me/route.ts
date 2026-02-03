import { NextResponse } from 'next/server';

import { jsonInternalError } from '@/lib/api/internal-response';
import { getInternalHostAuth } from '@/lib/auth/clerk-wrappers';

export async function GET() {
  const session = await getInternalHostAuth();
  if (!session) {
    return jsonInternalError({ code: 'unauthorized', status: 401 });
  }

  return NextResponse.json({
    data: {
      id: session.hostId,
      email: session.email,
    },
  });
}

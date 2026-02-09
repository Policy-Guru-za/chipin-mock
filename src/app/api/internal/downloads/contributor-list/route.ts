import { NextRequest } from 'next/server';
import { z } from 'zod';

import { jsonInternalError } from '@/lib/api/internal-response';
import { getInternalHostAuth } from '@/lib/auth/clerk-wrappers';
import {
  getDreamBoardHostAccessById,
  listCompletedContributionsForDreamBoard,
} from '@/lib/host/queries';
import { formatZar } from '@/lib/utils/money';

const querySchema = z.object({
  dreamBoardId: z.string().uuid(),
});

const sanitizeFilename = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

export async function GET(request: NextRequest) {
  const auth = await getInternalHostAuth();
  if (!auth) {
    return jsonInternalError({ code: 'unauthorized', status: 401 });
  }

  const parsed = querySchema.safeParse({
    dreamBoardId: request.nextUrl.searchParams.get('dreamBoardId') ?? '',
  });
  if (!parsed.success) {
    return jsonInternalError({ code: 'invalid_request', status: 400 });
  }

  const boardAccess = await getDreamBoardHostAccessById(parsed.data.dreamBoardId);
  if (!boardAccess) {
    return jsonInternalError({ code: 'not_found', status: 404 });
  }
  if (boardAccess.hostId !== auth.hostId) {
    return jsonInternalError({ code: 'forbidden', status: 403 });
  }

  const contributions = await listCompletedContributionsForDreamBoard(parsed.data.dreamBoardId);
  const header = ['Name', 'Amount (ZAR)', 'Fee (ZAR)', 'Date', 'Message', 'Anonymous'];
  const rows = contributions.map((contribution) => {
    const name = contribution.isAnonymous ? 'Anonymous' : contribution.contributorName || 'Anonymous';
    return [
      name,
      formatZar(contribution.amountCents),
      formatZar(contribution.feeCents),
      contribution.createdAt.toISOString(),
      contribution.message ?? '',
      contribution.isAnonymous ? 'Yes' : 'No',
    ];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(','))
    .join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${sanitizeFilename(boardAccess.childName)}-contributors.csv"`,
    },
  });
}

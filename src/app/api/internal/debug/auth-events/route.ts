import { timingSafeEqual } from 'crypto';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { jsonInternalError } from '@/lib/api/internal-response';
import { enforceRateLimit } from '@/lib/auth/rate-limit';

export const runtime = 'nodejs';

const requestSchema = z.object({
  tokenHashPrefix: z.string().regex(/^[a-f0-9]{12}$/).optional(),
  minutesBack: z.number().int().min(1).max(180).default(30),
  limit: z.number().int().min(1).max(100).default(30),
});

const getClientIp = (request: NextRequest): string | null => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip');
};

const isDebugEnabled = (): boolean =>
  process.env.NODE_ENV === 'production' && process.env.DEBUG_ENDPOINTS_ENABLED === 'true';

const isValidDebugKey = (provided: string | null, expected: string | undefined): boolean => {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
};

type AxiomTabularField = { name: string };
type AxiomTabularTable = {
  fields: AxiomTabularField[];
  columns: unknown[][];
};
type AxiomTabularResponse = {
  tables?: AxiomTabularTable[];
  status?: { isPartial?: boolean };
};

type DebugAuthEvent = {
  time?: string;
  message: string;
};

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;

const tabularToRows = (table: AxiomTabularTable): Array<Record<string, unknown>> => {
  const fieldNames = table.fields.map((field) => field.name);
  const columns = table.columns;
  const rowCount = columns.length > 0 ? columns[0]?.length ?? 0 : 0;
  const rows: Array<Record<string, unknown>> = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row: Record<string, unknown> = {};
    for (let colIndex = 0; colIndex < fieldNames.length; colIndex += 1) {
      row[fieldNames[colIndex]] = columns[colIndex]?.[rowIndex];
    }
    rows.push(row);
  }

  return rows;
};

const buildAplQuery = (dataset: string, tokenHashPrefix: string | undefined, limit: number) => {
  const quotedDataset = `['${dataset.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`;
  const baseWhere = `| where message contains "auth.magic_link_"`;
  const prefixWhere = tokenHashPrefix ? `\n| where message contains "${tokenHashPrefix}"` : '';
  return `${quotedDataset}\n${baseWhere}${prefixWhere}\n| project _time, message\n| sort by _time desc\n| limit ${limit}`;
};

export async function GET() {
  return jsonInternalError({
    code: 'method_not_allowed',
    status: 405,
    message: 'Use POST with a JSON body containing { tokenHashPrefix?, minutesBack?, limit? }.',
    headers: { Allow: 'POST' },
  });
}

export async function POST(request: NextRequest) {
  if (!isDebugEnabled()) {
    return jsonInternalError({ code: 'not_found', status: 404 });
  }

  if (!isValidDebugKey(request.headers.get('x-debug-key'), process.env.DEBUG_API_KEY)) {
    return jsonInternalError({ code: 'unauthorized', status: 401 });
  }

  const ip = getClientIp(request) ?? 'unknown';
  const rateLimit = await enforceRateLimit(`debug:auth-events:${ip}`, {
    limit: 30,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return jsonInternalError({
      code: 'rate_limited',
      status: 429,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonInternalError({ code: 'invalid_request', status: 400 });
  }

  const apiToken = process.env.AXIOM_API_TOKEN;
  const orgId = process.env.AXIOM_ORG_ID;
  const dataset = process.env.AXIOM_DATASET ?? 'vercel';
  if (!apiToken || !orgId) {
    return jsonInternalError({ code: 'misconfigured', status: 500 });
  }

  const { tokenHashPrefix, minutesBack, limit } = parsed.data;
  const apl = buildAplQuery(dataset, tokenHashPrefix, limit);

  const axiomResponse = await fetch('https://api.axiom.co/v1/datasets/_apl?format=tabular', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'x-axiom-org-id': orgId,
    },
    body: JSON.stringify({
      apl,
      startTime: `now-${minutesBack}m`,
      endTime: 'now',
    }),
    cache: 'no-store',
  });

  if (!axiomResponse.ok) {
    const traceId = axiomResponse.headers.get('x-axiom-trace-id');
    const text = await axiomResponse.text().catch(() => '');
    return jsonInternalError({
      code: 'axiom_query_failed',
      status: 502,
      details: {
        status: axiomResponse.status,
        traceId,
        body: truncate(text, 2000),
      },
    });
  }

  const axiomPayload = (await axiomResponse.json().catch(() => null)) as AxiomTabularResponse | null;
  const table = axiomPayload?.tables?.[0];
  const rows = table ? tabularToRows(table) : [];

  const events: DebugAuthEvent[] = rows
    .map((row) => {
      const timeValue = row._time;
      const messageValue = row.message;
      const time = typeof timeValue === 'string' ? timeValue : undefined;
      const message =
        typeof messageValue === 'string'
          ? messageValue
          : messageValue == null
            ? ''
            : JSON.stringify(messageValue);

      return {
        time,
        message: truncate(message, 4000),
      };
    })
    .filter((event) => Boolean(event.message));

  return NextResponse.json({
    ok: true,
    tokenHashPrefix: tokenHashPrefix ?? null,
    partial: axiomPayload?.status?.isPartial ?? false,
    events,
  });
}

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import fontkit from '@pdf-lib/fontkit';
import { NextRequest } from 'next/server';
import { PDFDocument, type PDFFont, type PDFPage, StandardFonts } from 'pdf-lib';
import { z } from 'zod';

import { jsonInternalError } from '@/lib/api/internal-response';
import { getInternalHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardHostAccessById, listBirthdayMessages } from '@/lib/host/queries';

const querySchema = z.object({
  dreamBoardId: z.string().uuid(),
});

const require = createRequire(import.meta.url);
const UNICODE_FONT_PATH = require.resolve('next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf');

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN_LEFT = 50;
const PAGE_MARGIN_RIGHT = 50;
const PAGE_MARGIN_TOP = 42;
const PAGE_MARGIN_BOTTOM = 50;
const FONT_SIZE = 12;
const LINE_HEIGHT = 16;

let cachedUnicodeFontBytes: Uint8Array | null = null;

const sanitizeFilename = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sanitizeControlCharacters = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

const createPage = (pdf: PDFDocument) => pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

const widthOf = (font: PDFFont, text: string) => {
  try {
    return font.widthOfTextAtSize(text, FONT_SIZE);
  } catch {
    return Number.POSITIVE_INFINITY;
  }
};

const toDrawableText = (font: PDFFont, value: string) =>
  Array.from(value)
    .map((char) => {
      try {
        font.encodeText(char);
        return char;
      } catch {
        return '?';
      }
    })
    .join('');

const splitLongToken = (font: PDFFont, token: string, maxWidth: number) => {
  const chunks: string[] = [];
  let current = '';

  for (const char of Array.from(token)) {
    const candidate = `${current}${char}`;
    if (current && widthOf(font, candidate) > maxWidth) {
      chunks.push(current);
      current = char;
      continue;
    }
    current = candidate;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [''];
};

const wrapLine = (font: PDFFont, line: string, maxWidth: number) => {
  if (!line.trim()) {
    return [''];
  }

  const wrapped: string[] = [];
  let current = '';
  const words = line.trim().split(/\s+/);

  const flushCurrent = () => {
    if (current) {
      wrapped.push(current);
      current = '';
    }
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (widthOf(font, candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    flushCurrent();

    if (widthOf(font, word) <= maxWidth) {
      current = word;
      continue;
    }

    wrapped.push(...splitLongToken(font, word, maxWidth));
  }

  flushCurrent();
  return wrapped.length > 0 ? wrapped : [''];
};

const ensurePageSpace = (pdf: PDFDocument, page: PDFPage, y: number) => {
  if (y >= PAGE_MARGIN_BOTTOM) {
    return { page, y };
  }

  return {
    page: createPage(pdf),
    y: PAGE_HEIGHT - PAGE_MARGIN_TOP,
  };
};

const loadUnicodeFontBytes = async () => {
  if (cachedUnicodeFontBytes) {
    return cachedUnicodeFontBytes;
  }

  const file = await readFile(UNICODE_FONT_PATH);
  cachedUnicodeFontBytes = new Uint8Array(file);
  return cachedUnicodeFontBytes;
};

const loadPdfFont = async (pdf: PDFDocument) => {
  try {
    pdf.registerFontkit(fontkit);
    const unicodeFontBytes = await loadUnicodeFontBytes();
    return await pdf.embedFont(unicodeFontBytes, { subset: true });
  } catch {
    return await pdf.embedFont(StandardFonts.Helvetica);
  }
};

const buildBirthdayMessagePdf = async (lines: string[]) => {
  const pdf = await PDFDocument.create();
  const font = await loadPdfFont(pdf);
  let page = createPage(pdf);
  let y = PAGE_HEIGHT - PAGE_MARGIN_TOP;
  const maxWidth = PAGE_WIDTH - PAGE_MARGIN_LEFT - PAGE_MARGIN_RIGHT;

  for (const line of lines) {
    const splitLines = line.split(/\r?\n/);
    for (const splitLine of splitLines) {
      const sanitizedLine = toDrawableText(font, sanitizeControlCharacters(splitLine));
      const wrappedLines = wrapLine(font, sanitizedLine, maxWidth);
      for (const wrappedLine of wrappedLines) {
        const next = ensurePageSpace(pdf, page, y);
        page = next.page;
        y = next.y;
        page.drawText(wrappedLine, { x: PAGE_MARGIN_LEFT, y, size: FONT_SIZE, font });
        y -= LINE_HEIGHT;
      }
    }
  }

  return pdf.save();
};

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

  const messages = await listBirthdayMessages(parsed.data.dreamBoardId);
  const now = new Date();
  const lines: string[] = [
    `${boardAccess.childName}'s Birthday Messages`,
    'From their Dream Board on Gifta',
    '',
  ];

  if (messages.length === 0) {
    lines.push('No birthday messages yet.');
  } else {
    for (const item of messages) {
      const author = item.isAnonymous ? 'Anonymous' : item.contributorName || 'Anonymous';
      lines.push(`From: ${author}`);
      lines.push(`Date: ${item.createdAt.toLocaleDateString('en-ZA')}`);
      lines.push(item.message);
      lines.push('');
    }
  }
  lines.push(`Generated by Gifta · ${now.toLocaleDateString('en-ZA')}`);

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildBirthdayMessagePdf(lines);
  } catch {
    return jsonInternalError({ code: 'internal_error', status: 500 });
  }

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${sanitizeFilename(boardAccess.childName)}-birthday-messages.pdf"`,
    },
  });
}

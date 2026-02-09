import { NextResponse } from 'next/server';

type CsvCell = string | number | boolean | null | undefined;

const escapeCsv = (value: CsvCell) => {
  const stringValue = String(value ?? '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const toCsv = (headers: string[], rows: Array<Record<string, CsvCell>>) => {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
};

export const csvAttachment = (csv: string, filename: string) =>
  new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });

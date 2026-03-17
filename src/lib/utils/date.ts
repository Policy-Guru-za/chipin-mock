const ISO_DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const buildDateOnly = (year: number, month: number, day: number): Date | null => {
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
};

export const parseDateOnly = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return buildDateOnly(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(ISO_DATE_ONLY_REGEX);
  if (!isoMatch) return null;

  const [, year, month, day] = isoMatch;
  return buildDateOnly(Number(year), Number(month), Number(day));
};

export const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysUntilDateOnly = (value?: string | Date | null, now = new Date()): number => {
  const target = parseDateOnly(value);
  const today = parseDateOnly(now);
  if (!target || !today) {
    return 0;
  }

  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.round(diff / DAY_IN_MS));
};

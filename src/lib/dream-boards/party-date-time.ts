const JOHANNESBURG_TIME_ZONE = 'Africa/Johannesburg';

export const formatPartyDateTime = (value?: Date | string | null): string | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const formattedDate = parsed.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: JOHANNESBURG_TIME_ZONE,
  });
  const formattedTime = parsed.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: JOHANNESBURG_TIME_ZONE,
  });

  return `${formattedDate}, ${formattedTime}`;
};

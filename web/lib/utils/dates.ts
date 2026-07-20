const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
};

export function formatDate(value: string | null, fallback = ''): string {
  if (!value) {
    return fallback;
  }
  return new Date(value).toLocaleDateString('en-US', DATE_FORMAT);
}

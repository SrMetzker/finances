export function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isoDateFromNow(daysOffset = 0) {
  const base = new Date();
  base.setDate(base.getDate() + daysOffset);
  return formatLocalIsoDate(base);
}

export function toStableTransactionDate(dateOnly: string) {
  return `${dateOnly}T12:00:00.000Z`;
}
/**
 * Fechas de certificados de radicación: M/d/yyyy con hora opcional
 * (p. ej. "6/12/2026 4:41:49 PM" = 12 de junio de 2026, no diciembre).
 * El filtro interno usa ISO yyyy-MM-dd.
 */
export function parseLooseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dashMatch) {
    const month = Number(dashMatch[1]);
    const day = Number(dashMatch[2]);
    const year = Number(dashMatch[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatFilterDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFilterDateDisplay(isoValue: string): string {
  const date = parseLooseDate(isoValue);
  if (!date) return isoValue;
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Tokens tal como aparecen en el PDF (M/d/yyyy). */
function dateSearchTokens(date: Date): string[] {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return [`${month}/${day}/${year}`, `${mm}/${dd}/${year}`, `${month}/${dd}/${year}`, `${mm}/${day}/${year}`];
}

export function matchesDateFilter(recordDate: string, filterValue: string): boolean {
  const filterDate = parseLooseDate(filterValue);
  if (!filterDate) {
    return recordDate.toLowerCase().includes(filterValue.toLowerCase());
  }

  const recordDateParsed = parseLooseDate(recordDate);
  if (recordDateParsed) {
    return formatFilterDateIso(recordDateParsed) === formatFilterDateIso(filterDate);
  }

  return dateSearchTokens(filterDate).some((token) => recordDate.includes(token));
}

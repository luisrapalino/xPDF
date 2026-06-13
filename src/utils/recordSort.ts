import type { InvoiceRecord } from '@/models/Invoice';
import type { SortableColumn, SortDirection } from '@/models/Summary';
import { parseLooseDate } from '@/utils/dateFilter';

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true });
}

function getSortValue(record: InvoiceRecord, column: SortableColumn): string | number {
  switch (column) {
    case 'valorRadicado':
      return record.valorRadicado;
    case 'fechaRadicacion': {
      const date = parseLooseDate(record.fechaRadicacion);
      return date?.getTime() ?? 0;
    }
    default:
      return record[column];
  }
}

export function sortRecords(
  records: InvoiceRecord[],
  column: SortableColumn,
  direction: SortDirection,
): InvoiceRecord[] {
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...records].sort((a, b) => {
    const aVal = getSortValue(a, column);
    const bVal = getSortValue(b, column);

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier;
    }

    return compareStrings(String(aVal), String(bVal)) * multiplier;
  });
}

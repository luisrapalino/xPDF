import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Clock } from 'lucide-react';
import { HintTooltip } from '@/components/HintTooltip';
import { TablePagination } from '@/components/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResultsFilters } from '@/components/ResultsFilters';
import { useAppStore } from '@/hooks/useAppStore';
import type { SortableColumn } from '@/models/Summary';
import { appStore } from '@/store/AppStore';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { formatFileDisplayName } from '@/utils/fileDisplay';
import { cn } from '@/lib/utils';

const ROW_HEIGHT = 44;
const DEFAULT_PAGE_SIZE = 10;

const COLUMNS: ReadonlyArray<{
  key: SortableColumn;
  label: string;
  width: number;
  align?: 'right';
  mono?: boolean;
}> = [
  { key: 'archivo', label: 'Archivo', width: 228 },
  { key: 'lote', label: 'Lote', width: 96, mono: true },
  { key: 'fechaRadicacion', label: 'Fecha', width: 168 },
  { key: 'numeroRadicado', label: 'Radicado', width: 136, mono: true },
  { key: 'numeroFactura', label: 'Factura', width: 116, mono: true },
  { key: 'razonSocial', label: 'Razón Social', width: 208 },
  { key: 'valorRadicado', label: 'Valor', width: 128, align: 'right' },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, col) => sum + col.width, 0);

export function ResultsTable() {
  const { filteredRecords, stats, preferences } = useAppStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const showSkeleton = stats.isProcessing && filteredRecords.length === 0;
  const sort = preferences.sort;
  const filters = preferences.filters;

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  const filterKey = useMemo(
    () =>
      [
        filters.globalSearch,
        filters.lote,
        filters.factura,
        filters.radicado,
        filters.razonSocial,
        filters.fecha,
      ].join('\u0000'),
    [filters],
  );

  useEffect(() => {
    setPage(1);
  }, [filterKey, sort.column, sort.direction]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="gap-4 border-b pt-6 pb-5">
        <CardTitle className="text-base tracking-tight">Resultados</CardTitle>
        <div className="flex flex-wrap gap-2">
          <HintTooltip label="PDFs procesados">
            <Badge variant="secondary" className="cursor-default">
              {stats.processedPdfs.toLocaleString('es-CO')} PDFs
            </Badge>
          </HintTooltip>
          <HintTooltip label="Registros encontrados">
            <Badge variant="secondary" className="cursor-default">
              {stats.totalInvoices.toLocaleString('es-CO')} registros
            </Badge>
          </HintTooltip>
          <HintTooltip label="Suma de todos los valores">
            <Badge variant="outline" className="cursor-default">
              {formatCurrency(stats.totalRadicado)} total
            </Badge>
          </HintTooltip>
          {stats.elapsedMs > 0 && (
            <HintTooltip label="Tiempo transcurrido en el procesamiento">
              <Badge variant="outline" className="cursor-default gap-1">
                <Clock className="size-3" />
                {formatDuration(stats.elapsedMs)}
              </Badge>
            </HintTooltip>
          )}
        </div>
      </CardHeader>

      <ResultsFilters />

      <CardContent className="scrollbar-subtle overflow-x-auto p-0">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <table className="w-full table-fixed text-sm">
            <colgroup>
              {COLUMNS.map((col) => (
                <col key={col.key} style={{ width: col.width }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {COLUMNS.map((col) => (
                  <SortableHeader
                    key={col.key}
                    column={col.key}
                    label={col.label}
                    {...(col.align ? { align: col.align } : {})}
                  />
                ))}
              </TableRow>
            </TableHeader>
          </table>

          {showSkeleton ? (
            <TableSkeleton />
          ) : filteredRecords.length === 0 ? (
            <p className="text-muted-foreground px-6 py-16 text-center text-sm">
              No hay registros para mostrar.
            </p>
          ) : (
            <div style={{ height: `${paginatedRecords.length * ROW_HEIGHT}px` }}>
              {paginatedRecords.map((record) => {
                const archivo = formatFileDisplayName(record.archivo);

                return (
                  <div
                    key={record.id}
                    className="grid w-full border-b hover:bg-muted/50"
                    style={{
                      height: `${ROW_HEIGHT}px`,
                      gridTemplateColumns: COLUMNS.map((col) => `${col.width}px`).join(' '),
                    }}
                  >
                    <Cell
                      value={record.archivo}
                      display={archivo.detail ?? archivo.label}
                    />
                    <Cell value={record.lote} mono />
                    <Cell value={record.fechaRadicacion} />
                    <Cell value={record.numeroRadicado} mono />
                    <Cell value={record.numeroFactura} mono />
                    <Cell value={record.razonSocial} />
                    <Cell value={formatCurrency(record.valorRadicado)} align="right" tabular />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <TablePagination
          page={safePage}
          pageSize={pageSize}
          totalItems={filteredRecords.length}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardContent>
    </Card>
  );
}

function SortableHeader({
  column,
  label,
  align,
}: {
  column: SortableColumn;
  label: string;
  align?: 'right';
}) {
  const { preferences } = useAppStore();
  const { column: activeColumn, direction } = preferences.sort;
  const isActive = activeColumn === column;
  const SortIcon = !isActive ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;
  const sortLabel = isActive
    ? direction === 'asc'
      ? `Ordenado ascendente por ${label.toLowerCase()}`
      : `Ordenado descendente por ${label.toLowerCase()}`
    : `Ordenar por ${label.toLowerCase()}`;

  return (
    <TableHead
      className={cn('h-11 p-0', align === 'right' && 'text-right')}
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <HintTooltip label={sortLabel}>
        <button
          type="button"
          onClick={() => appStore.setSort(column)}
          className={cn(
            'flex h-11 w-full items-center gap-1 px-3 text-xs font-medium uppercase transition-colors',
            align === 'right' && 'justify-end',
            isActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span className="truncate">{label}</span>
          <SortIcon className={cn('size-3.5 shrink-0', !isActive && 'opacity-50')} />
        </button>
      </HintTooltip>
    </TableHead>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid border-b px-3 py-3.5"
          style={{ gridTemplateColumns: COLUMNS.map((col) => `${col.width}px`).join(' ') }}
        >
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[75%]" />
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-4 w-[65%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="ml-auto h-4 w-[55%]" />
        </div>
      ))}
    </div>
  );
}

function Cell({
  value,
  display,
  align,
  mono,
  tabular,
}: {
  value: string;
  display?: string;
  align?: 'right';
  mono?: boolean;
  tabular?: boolean;
}) {
  const shown = display ?? value;
  const cellClass = cn(
    'flex h-11 items-center truncate px-3 text-sm',
    mono && 'font-mono text-[13px]',
    tabular && 'tabular-nums',
    align === 'right' && 'justify-end text-right',
  );

  const content = <div className={cellClass}>{shown}</div>;

  if (value.length <= 24 && !display) return content;

  return (
    <HintTooltip label={value} side="top">
      <div tabIndex={0} className={cn(cellClass, 'cursor-default outline-none')}>
        {shown}
      </div>
    </HintTooltip>
  );
}

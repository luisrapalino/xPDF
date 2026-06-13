/** Estadísticas globales del procesamiento. */
export interface ProcessingStats {
  totalPdfs: number;
  processedPdfs: number;
  totalInvoices: number;
  totalRadicado: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  pdfsPerSecond: number;
  progressPercent: number;
  isProcessing: boolean;
  isExporting: boolean;
}

/** Resumen para la hoja Excel y el dashboard. */
export interface ExportSummary {
  totalPdfs: number;
  totalFacturas: number;
  totalValorRadicado: number;
  fechaGeneracion: Date;
}

/** Entrada del panel de logs. */
export interface LogEntry {
  id: string;
  timestamp: Date;
  fileName: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

/** Filtros aplicables a la tabla de resultados. */
export interface ResultFilters {
  globalSearch: string;
  lote: string;
  factura: string;
  radicado: string;
  razonSocial: string;
  fecha: string;
}

export type SortableColumn =
  | 'archivo'
  | 'lote'
  | 'fechaRadicacion'
  | 'numeroRadicado'
  | 'numeroFactura'
  | 'razonSocial'
  | 'valorRadicado';

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  column: SortableColumn | null;
  direction: SortDirection;
}

export type ThemePreference = 'light' | 'dark' | 'system';

/** Preferencias persistidas de la aplicación. */
export interface AppPreferences {
  theme: ThemePreference;
  filters: ResultFilters;
  sort: TableSort;
}

export const DEFAULT_FILTERS: ResultFilters = {
  globalSearch: '',
  lote: '',
  factura: '',
  radicado: '',
  razonSocial: '',
  fecha: '',
};

export const DEFAULT_SORT: TableSort = {
  column: null,
  direction: 'asc',
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'system',
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export function createInitialStats(totalPdfs = 0): ProcessingStats {
  return {
    totalPdfs,
    processedPdfs: 0,
    totalInvoices: 0,
    totalRadicado: 0,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    pdfsPerSecond: 0,
    progressPercent: 0,
    isProcessing: false,
    isExporting: false,
  };
}

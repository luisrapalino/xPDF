export type ErrorContext = 'pdf' | 'export' | 'app';

const PDF_ERROR_MAP: Record<string, string> = {
  'PDF inválido: no contiene CERTIFICADO DE RADICACIÓN':
    'Este PDF no tiene el formato esperado.',
  'No se encontraron facturas en FACTURAS RADICADAS':
    'No se encontraron registros en este PDF.',
  'PDF inválido': 'No se pudo leer este PDF.',
  'Error desconocido al procesar PDF': 'No se pudo procesar este PDF.',
  'No se pudo leer el archivo': 'No se pudo abrir el archivo. Vuelve a seleccionarlo.',
  'Error en worker': 'Ocurrió un error interno al leer el PDF.',
};

const PDF_ERROR_PATTERNS: Array<{ test: RegExp; message: string }> = [
  { test: /password|encrypted|needs password/i, message: 'El PDF está protegido con contraseña.' },
  { test: /invalid pdf|corrupt|damaged|format error/i, message: 'El archivo PDF está dañado o no es válido.' },
  { test: /memory|allocation|out of memory/i, message: 'Memoria insuficiente. Prueba con menos archivos.' },
  { test: /abort|cancel/i, message: 'El procesamiento fue cancelado.' },
  { test: /network|fetch/i, message: 'No se pudo cargar un recurso necesario. Recarga la página.' },
];

const EXPORT_ERROR_PATTERNS: Array<{ test: RegExp; message: string }> = [
  { test: /quota|exceeded|storage/i, message: 'No hay espacio suficiente para guardar el archivo.' },
  { test: /permission|denied/i, message: 'El navegador bloqueó la descarga. Revisa los permisos.' },
];

/**
 * Convierte errores técnicos en mensajes claros para el usuario.
 */
export function toUserErrorMessage(error: unknown, context: ErrorContext = 'app'): string {
  const raw =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : 'Error inesperado';

  const trimmed = raw.trim();
  if (!trimmed) return defaultMessage(context);

  if (context === 'pdf' && PDF_ERROR_MAP[trimmed]) {
    return PDF_ERROR_MAP[trimmed];
  }

  const patterns =
    context === 'export'
      ? EXPORT_ERROR_PATTERNS
      : context === 'pdf'
        ? PDF_ERROR_PATTERNS
        : [...PDF_ERROR_PATTERNS, ...EXPORT_ERROR_PATTERNS];

  for (const { test, message } of patterns) {
    if (test.test(trimmed)) return message;
  }

  if (trimmed.length > 140) {
    return defaultMessage(context);
  }

  return trimmed;
}

function defaultMessage(context: ErrorContext): string {
  switch (context) {
    case 'pdf':
      return 'No se pudo procesar este PDF. Revisa el archivo e inténtalo de nuevo.';
    case 'export':
      return 'No se pudo generar el Excel. Inténtalo de nuevo.';
    default:
      return 'Ocurrió un error inesperado. Recarga la página e inténtalo de nuevo.';
  }
}

export interface ProcessingOutcome {
  failedCount: number;
  successCount: number;
  invoiceCount: number;
}

/**
 * Mensaje resumido al terminar un lote con errores parciales o totales.
 */
export function buildProcessingToast(outcome: ProcessingOutcome): {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
} {
  const { failedCount, successCount, invoiceCount } = outcome;
  const summary = `${invoiceCount.toLocaleString('es-CO')} registros en ${successCount.toLocaleString('es-CO')} PDFs`;

  if (failedCount === 0) {
    return {
      type: 'success',
      title: 'Procesamiento completado',
      description: summary,
    };
  }

  if (invoiceCount === 0) {
    return {
      type: 'error',
      title: 'No se pudieron extraer datos',
      description: `${failedCount.toLocaleString('es-CO')} PDF${failedCount === 1 ? '' : 's'} con problemas. Revisa Actividad para el detalle.`,
    };
  }

  return {
    type: 'warning',
    title: 'Completado con advertencias',
    description: `${summary}. ${failedCount.toLocaleString('es-CO')} PDF${failedCount === 1 ? '' : 's'} con problemas — revisa Actividad.`,
  };
}

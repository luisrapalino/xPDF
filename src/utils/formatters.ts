/**
 * Convierte una cadena de moneda colombiana a número.
 * @param value - Texto con formato `$ 1,234.56` o `$1,234.56`
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[$\s]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Formatea un número como moneda COP.
 * @param value - Valor numérico
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formatea milisegundos a texto legible (mm:ss o hh:mm:ss).
 * @param ms - Duración en milisegundos
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return '< 1 s';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formatea una fecha/hora para mostrar en la UI.
 * @param date - Fecha a formatear
 */
export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Formatea un porcentaje con un decimal.
 * @param value - Valor entre 0 y 100
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Genera un identificador único corto.
 */
export function createId(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Formatea PDFs por segundo con dos decimales.
 */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return '0.00';
  return rate.toFixed(2);
}

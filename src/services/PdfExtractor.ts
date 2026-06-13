import type { InvoiceRecord, PdfProcessResult, WorkerResponse } from '../models/Invoice';
import type { LogEntry } from '../models/Summary';
import { createId } from '../utils/formatters';
import { toUserErrorMessage } from '../utils/errors';
import { WorkerPool } from './WorkerPool';

export interface ExtractionProgress {
  processed: number;
  total: number;
  invoicesFound: number;
  totalRadicado: number;
  elapsedMs: number;
}

export type ProgressCallback = (progress: ExtractionProgress) => void;
export type LogCallback = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
export type ResultCallback = (records: InvoiceRecord[]) => void;

export interface PdfExtractorOptions {
  batchSize?: number;
  onProgress?: ProgressCallback;
  onLog?: LogCallback;
  onRecords?: ResultCallback;
}

/**
 * Orquesta la extracción de datos de múltiples PDFs usando un pool de workers.
 */
export class PdfExtractor {
  private pool: WorkerPool | null = null;
  private readonly batchSize: number;
  private readonly onProgress: ProgressCallback | undefined;
  private readonly onLog: LogCallback | undefined;
  private readonly onRecords: ResultCallback | undefined;

  constructor(options: PdfExtractorOptions = {}) {
    this.batchSize = options.batchSize ?? 50;
    this.onProgress = options.onProgress;
    this.onLog = options.onLog;
    this.onRecords = options.onRecords;
  }

  /**
   * Procesa una colección de archivos PDF y devuelve todos los registros extraídos.
   */
  async extract(files: File[]): Promise<PdfProcessResult[]> {
    const pdfFiles = files.filter((file) => file.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      this.log('Sistema', 'No se encontraron archivos PDF para procesar', 'warn');
      return [];
    }

    this.pool = new WorkerPool({
      batchSize: this.batchSize,
      onBatchStart: (batchIndex, size) => {
        this.log('Sistema', `Iniciando grupo ${batchIndex + 1} (${size} PDFs)`, 'info');
      },
    });

    const results: PdfProcessResult[] = [];
    const allRecords: InvoiceRecord[] = [];
    const startTime = performance.now();
    let processed = 0;
    let invoicesFound = 0;
    let totalRadicado = 0;

    this.log('Sistema', `Procesando ${pdfFiles.length} PDFs con ${this.pool.size} workers`, 'info');

    await this.pool.processFiles(pdfFiles, (response: WorkerResponse) => {
      processed++;
      const result = this.handleResponse(response);
      results.push(result);

      if (result.success) {
        invoicesFound += result.invoiceCount;
        totalRadicado += result.records.reduce((sum, r) => sum + r.valorRadicado, 0);
        allRecords.push(...result.records);
        this.onRecords?.(result.records);
        this.log(result.fileName, `${result.invoiceCount} registros extraídos`, 'success');
      } else {
        this.log(result.fileName, result.error ?? 'No se pudo procesar este PDF', 'error');
      }

      const elapsedMs = performance.now() - startTime;
      this.onProgress?.({
        processed,
        total: pdfFiles.length,
        invoicesFound,
        totalRadicado,
        elapsedMs,
      });
    });

    this.pool.dispose();
    this.pool = null;

    this.log(
      'Sistema',
      `Completado: ${processed} PDFs, ${invoicesFound} registros, ${formatMoney(totalRadicado)}`,
      'success',
    );

    return results;
  }

  /**
   * Cancela el procesamiento activo.
   */
  cancel(): void {
    this.pool?.dispose();
    this.pool = null;
    this.log('Sistema', 'Procesamiento cancelado', 'warn');
  }

  private handleResponse(response: WorkerResponse): PdfProcessResult {
    if (response.type === 'error') {
      return {
        fileName: response.fileName,
        success: false,
        records: [],
        invoiceCount: 0,
        error: toUserErrorMessage(response.error, 'pdf'),
      };
    }

    return {
      fileName: response.fileName,
      success: true,
      records: response.records,
      metadata: response.metadata,
      invoiceCount: response.invoiceCount,
    };
  }

  private log(fileName: string, message: string, level: LogEntry['level']): void {
    this.onLog?.({ fileName, message, level });
  }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(value);
}

export { createId };

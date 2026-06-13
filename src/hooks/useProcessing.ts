import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { ExportSummaryData } from '@/components/ExportSummaryDialog';
import { ExcelExporter } from '@/services/ExcelExporter';
import { PdfExtractor } from '@/services/PdfExtractor';
import { appStore } from '@/store/AppStore';
import { buildProcessingToast, toUserErrorMessage } from '@/utils/errors';

const excelExporter = new ExcelExporter();

export function useProcessing() {
  const extractorRef = useRef<PdfExtractor | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      if (!appStore.stats.isProcessing) return;
      const elapsedMs = performance.now() - startTimeRef.current;
      const processed = appStore.stats.processedPdfs;
      const total = appStore.stats.totalPdfs;
      const remaining = processed > 0 ? (elapsedMs / processed) * (total - processed) : 0;
      const pdfsPerSecond = processed > 0 ? (processed / elapsedMs) * 1000 : 0;
      appStore.updateProgress({ elapsedMs, estimatedRemainingMs: remaining, pdfsPerSecond });
    }, 250);
  }, [stopTimer]);

  const cancelProcessing = useCallback(() => {
    extractorRef.current?.cancel();
    appStore.finishProcessing();
    stopTimer();
    extractorRef.current = null;
    toast.info('Procesamiento cancelado');
  }, [stopTimer]);

  const processFiles = useCallback(async () => {
    const files = appStore.selectedFiles;
    if (files.length === 0) {
      toast.warning('Selecciona al menos un PDF');
      return;
    }

    appStore.clearResults();
    appStore.startProcessing(files.length);
    appStore.addLog({
      fileName: 'Sistema',
      message: `Iniciando procesamiento de ${files.length} PDFs`,
      level: 'info',
    });

    startTimeRef.current = performance.now();
    startTimer();

    extractorRef.current = new PdfExtractor({
      batchSize: 50,
      onProgress: (progress) => {
        const elapsedMs = progress.elapsedMs;
        const processed = progress.processed;
        const total = progress.total;
        const remaining = processed > 0 ? (elapsedMs / processed) * (total - processed) : 0;
        const pdfsPerSecond = processed > 0 ? (processed / elapsedMs) * 1000 : 0;

        appStore.updateProgress({
          processedPdfs: processed,
          totalPdfs: total,
          totalInvoices: progress.invoicesFound,
          totalRadicado: progress.totalRadicado,
          elapsedMs,
          estimatedRemainingMs: remaining,
          pdfsPerSecond,
          progressPercent: total > 0 ? (processed / total) * 100 : 0,
          isProcessing: processed < total,
        });
      },
      onLog: (entry) => {
        appStore.addLog(entry);
      },
      onRecords: (records) => {
        if (records.length > 0) {
          appStore.appendRecords(records, records[0]!.archivo);
        }
      },
    });

    try {
      const results = await extractorRef.current.extract(files);
      const failed = results.filter((result) => !result.success);
      const succeeded = results.filter((result) => result.success);

      for (const result of results) {
        if (result.success && result.records.length === 0 && result.metadata) {
          appStore.processedPdfNames.add(result.fileName);
        }
      }

      appStore.finishProcessing();

      const invoiceCount = appStore.records.length;
      const logSummary = `${invoiceCount.toLocaleString('es-CO')} registros en ${appStore.uniquePdfCount} PDFs`;
      appStore.addLog({
        fileName: 'Sistema',
        message:
          failed.length > 0
            ? `Procesamiento finalizado con advertencias: ${logSummary} (${failed.length} PDFs con problemas)`
            : `Procesamiento finalizado: ${logSummary}`,
        level: failed.length > 0 ? 'warn' : 'success',
      });

      const toastMessage = buildProcessingToast({
        failedCount: failed.length,
        successCount: succeeded.length,
        invoiceCount,
      });

      if (toastMessage.type === 'success') {
        toast.success(toastMessage.title, { description: toastMessage.description });
      } else if (toastMessage.type === 'warning') {
        toast.warning(toastMessage.title, { description: toastMessage.description });
      } else {
        toast.error(toastMessage.title, { description: toastMessage.description });
      }
    } catch (error) {
      const message = toUserErrorMessage(error, 'pdf');
      appStore.addLog({ fileName: 'Sistema', message, level: 'error' });
      appStore.finishProcessing();
      toast.error('No se pudo completar el procesamiento', { description: message });
    } finally {
      stopTimer();
      extractorRef.current = null;
    }
  }, [startTimer, stopTimer]);

  const exportExcel = useCallback(async (): Promise<ExportSummaryData | null> => {
    if (appStore.records.length === 0) {
      toast.warning('No hay registros para exportar');
      return null;
    }

    appStore.setExporting(true);
    appStore.addLog({ fileName: 'Sistema', message: 'Generando archivo Excel...', level: 'info' });

    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    const summary: ExportSummaryData = {
      totalPdfs: appStore.stats.processedPdfs,
      totalFacturas: appStore.records.length,
      totalValorRadicado: appStore.totalRadicado,
      fechaGeneracion: new Date(),
    };

    try {
      await excelExporter.export(appStore.records, summary);
      appStore.addLog({
        fileName: 'Sistema',
        message: 'Archivo export.xlsx descargado',
        level: 'success',
      });
      toast.success('Excel descargado', {
        description: 'export.xlsx',
      });
      return summary;
    } catch (error) {
      const message = toUserErrorMessage(error, 'export');
      appStore.addLog({ fileName: 'Sistema', message, level: 'error' });
      toast.error('No se pudo exportar el Excel', { description: message });
      return null;
    } finally {
      appStore.setExporting(false);
    }
  }, []);

  return { processFiles, exportExcel, cancelProcessing };
}

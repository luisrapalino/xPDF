import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { WorkerRequest, WorkerResponse } from '../models/Invoice';
import { extractTextFromPdfDocument, parseCertificateText } from '../utils/pdfParser';
import { toUserErrorMessage } from '../utils/errors';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfPage {
  getTextContent: () => Promise<{ items: Array<{ str?: string; transform?: number[] }> }>;
  cleanup: () => void;
}

/**
 * Extrae texto de un PDF usando PDF.js dentro del Web Worker.
 */
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;

  try {
    return await extractTextFromPdfDocument(
      (pageNum: number) => pdf.getPage(pageNum) as Promise<PdfPage>,
      pdf.numPages,
    );
  } finally {
    await pdf.destroy();
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { type, id, fileName, buffer } = event.data;

  if (type !== 'process') return;

  try {
    const text = await extractPdfText(buffer);
    const result = parseCertificateText(text, fileName);

    if (!result.valid) {
      const response: WorkerResponse = {
        type: 'error',
        id,
        fileName,
        error: toUserErrorMessage(result.error ?? 'PDF inválido', 'pdf'),
      };
      self.postMessage(response);
      return;
    }

    const response: WorkerResponse = {
      type: 'success',
      id,
      fileName,
      records: result.records,
      metadata: result.metadata!,
      invoiceCount: result.records.length,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      id,
      fileName,
      error: toUserErrorMessage(error, 'pdf'),
    };
    self.postMessage(response);
  }
};

import type { CertificateMetadata, InvoiceRecord } from '../models/Invoice';
import {
  CERTIFICATE_MARKER,
  HEADER_NOISE_PATTERNS,
  INVOICE_ROW_PATTERN,
  LOTE_PATTERN,
  SECTION_END_MARKERS,
} from './regex';
import { createId, parseCurrency } from './formatters';

interface ParsedInvoiceRow {
  numeroRadicado: string;
  numeroFactura: string;
  razonSocial: string;
  valorRadicado: number;
}

interface PdfTextItem {
  str?: string;
  transform?: number[];
}

export interface ParseResult {
  valid: boolean;
  metadata?: CertificateMetadata;
  records: InvoiceRecord[];
  error?: string;
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\f/g, '\n');
}

function extractAfterLabel(text: string, label: string): string {
  const pattern = new RegExp(`${label}\\s*\\n\\s*([^\\n]+)`, 'i');
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? '';
}

function isNoiseLine(line: string): boolean {
  return HEADER_NOISE_PATTERNS.some((pattern) => pattern.test(line));
}

/**
 * Agrupa items de PDF.js por posición vertical para reconstruir líneas legibles.
 */
export function extractPageTextFromItems(items: PdfTextItem[]): string {
  const lineMap = new Map<number, Array<{ x: number; text: string }>>();

  for (const item of items) {
    const text = item.str?.trim();
    if (!text) continue;

    const transform = item.transform ?? [];
    const x = transform[4] ?? 0;
    const y = transform[5] ?? 0;
    const bucket = Math.round(y / 2) * 2;

    const parts = lineMap.get(bucket) ?? [];
    parts.push({ x, text });
    lineMap.set(bucket, parts);
  }

  return [...lineMap.keys()]
    .sort((a, b) => b - a)
    .map((bucket) => {
      const parts = lineMap.get(bucket)!;
      parts.sort((a, b) => a.x - b.x);
      return parts
        .map((part) => part.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Extrae la región con facturas radicadas (todo antes de NO RADICADAS / SOPORTES).
 * PDF.js suele colocar las filas de factura antes del encabezado de sección.
 */
export function extractRadicadasSection(text: string): string {
  const endMatch = text.search(SECTION_END_MARKERS);
  return endMatch === -1 ? text : text.slice(0, endMatch);
}

/**
 * Parsea filas de facturas radicadas compactando el texto en una sola línea lógica.
 */
export function parseInvoiceRows(section: string): ParsedInvoiceRow[] {
  const compact = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !isNoiseLine(line))
    .join(' ');

  const rows: ParsedInvoiceRow[] = [];
  const pattern = new RegExp(INVOICE_ROW_PATTERN.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(compact)) !== null) {
    rows.push({
      numeroRadicado: match[1]!,
      numeroFactura: match[2]!,
      razonSocial: match[3]!.trim(),
      valorRadicado: parseCurrency(match[4]!),
    });
  }

  return rows;
}

function extractLote(text: string): string {
  const fromLabel = text.match(LOTE_PATTERN)?.[1];
  if (fromLabel) return fromLabel;

  const afterLoteLabel = text.match(/LOTE:[\s\S]{0,120}?(\d{5,7})(?:\s|$)/i)?.[1];
  if (afterLoteLabel) return afterLoteLabel;

  return text.match(/(?:Cantidad de facturas[\s\S]{0,80}?)(\d{5,7})(?:\s*\n)/i)?.[1] ?? '';
}

/**
 * Parsea el texto completo de un certificado de radicación.
 * @param text - Texto extraído del PDF
 * @param fileName - Nombre del archivo PDF
 */
export function parseCertificateText(text: string, fileName: string): ParseResult {
  const normalized = normalizeText(text);

  if (!CERTIFICATE_MARKER.test(normalized)) {
    return {
      valid: false,
      records: [],
      error: 'Este archivo no es un certificado de radicación válido.',
    };
  }

  const lote = extractLote(normalized);
  const codigoHabilitacion = extractAfterLabel(normalized, 'Código de habilitación');
  const fechaRadicacion = extractAfterLabel(normalized, 'Fecha radicación');
  const cantidadStr = extractAfterLabel(normalized, 'Cantidad de facturas');
  const totalStr = extractAfterLabel(normalized, 'Total Radicado');
  const usuarioRadica = extractAfterLabel(normalized, 'Usuario radica');

  const cantidadFacturas = Number.parseInt(cantidadStr.replace(/\D/g, ''), 10) || 0;
  const totalRadicado = parseCurrency(totalStr.startsWith('$') ? totalStr : `$${totalStr}`);

  const metadata: CertificateMetadata = {
    archivo: fileName,
    lote,
    codigoHabilitacion,
    fechaRadicacion,
    cantidadFacturas,
    totalRadicado,
    usuarioRadica,
  };

  const section = extractRadicadasSection(normalized);
  const invoiceRows = parseInvoiceRows(section);

  if (invoiceRows.length === 0) {
    return {
      valid: true,
      metadata,
      records: [],
      error: 'No se encontraron facturas en la sección FACTURAS RADICADAS.',
    };
  }

  const records: InvoiceRecord[] = invoiceRows.map((row) => ({
    id: createId('inv'),
    archivo: fileName,
    lote,
    codigoHabilitacion,
    fechaRadicacion,
    cantidadFacturas,
    totalRadicado,
    usuarioRadica,
    numeroRadicado: row.numeroRadicado,
    numeroFactura: row.numeroFactura,
    razonSocial: row.razonSocial,
    valorRadicado: row.valorRadicado,
  }));

  return { valid: true, metadata, records };
}

/**
 * Extrae texto de todas las páginas de un documento PDF.js.
 */
export async function extractTextFromPdfDocument(
  getPage: (pageNum: number) => Promise<{
    getTextContent: () => Promise<{ items: PdfTextItem[] }>;
    cleanup: () => void;
  }>,
  numPages: number,
): Promise<string> {
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await getPage(pageNum);
    const content = await page.getTextContent();
    pageTexts.push(extractPageTextFromItems(content.items));
    page.cleanup();
  }

  return pageTexts.join('\n');
}

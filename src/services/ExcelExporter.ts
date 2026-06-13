import ExcelJS from 'exceljs';
import type { InvoiceRecord } from '../models/Invoice';
import type { ExportSummary } from '../models/Summary';
import { formatCurrency } from '../utils/formatters';

const DETAIL_COLUMNS = [
  { header: 'Archivo', key: 'archivo', width: 40 },
  { header: 'Lote', key: 'lote', width: 12 },
  { header: 'Código Habilitación', key: 'codigoHabilitacion', width: 20 },
  { header: 'Fecha Radicación', key: 'fechaRadicacion', width: 22 },
  { header: 'Cantidad Facturas', key: 'cantidadFacturas', width: 18 },
  { header: 'Total Radicado', key: 'totalRadicado', width: 18 },
  { header: 'Usuario Radica', key: 'usuarioRadica', width: 20 },
  { header: 'Número Radicado', key: 'numeroRadicado', width: 18 },
  { header: 'Número Factura', key: 'numeroFactura', width: 18 },
  { header: 'Razón Social', key: 'razonSocial', width: 35 },
  { header: 'Valor Radicado', key: 'valorRadicado', width: 18 },
] as const;

const EXPORT_FILENAME = 'export.xlsx';

/**
 * Exporta registros extraídos a un archivo Excel (.xlsx).
 */
export class ExcelExporter {
  /**
   * Genera y descarga el archivo Excel.
   */
  async export(records: InvoiceRecord[], summary: ExportSummary): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'xPDF';
    workbook.created = summary.fechaGeneracion;

    this.addResumenSheet(workbook, summary);
    this.addDetalleSheet(workbook, records);

    const buffer = await workbook.xlsx.writeBuffer();
    this.downloadBuffer(buffer, EXPORT_FILENAME);
  }

  private addResumenSheet(workbook: ExcelJS.Workbook, summary: ExportSummary): void {
    const sheet = workbook.addWorksheet('Resumen');

    sheet.columns = [
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Valor', key: 'valor', width: 30 },
    ];

    sheet.addRows([
      { concepto: 'Total PDFs', valor: summary.totalPdfs },
      { concepto: 'Total registros', valor: summary.totalFacturas },
      { concepto: 'Importe total', valor: formatCurrency(summary.totalValorRadicado) },
      {
        concepto: 'Fecha de generación',
        valor: summary.fechaGeneracion.toLocaleString('es-CO'),
      },
    ]);

    this.styleHeaderRow(sheet);
  }

  private addDetalleSheet(workbook: ExcelJS.Workbook, records: InvoiceRecord[]): void {
    const sheet = workbook.addWorksheet('Detalle');
    sheet.columns = DETAIL_COLUMNS.map((col) => ({ ...col }));

    for (const record of records) {
      sheet.addRow({
        archivo: record.archivo,
        lote: record.lote,
        codigoHabilitacion: record.codigoHabilitacion,
        fechaRadicacion: record.fechaRadicacion,
        cantidadFacturas: record.cantidadFacturas,
        totalRadicado: record.totalRadicado,
        usuarioRadica: record.usuarioRadica,
        numeroRadicado: record.numeroRadicado,
        numeroFactura: record.numeroFactura,
        razonSocial: record.razonSocial,
        valorRadicado: record.valorRadicado,
      });
    }

    this.styleHeaderRow(sheet);

    sheet.getColumn('totalRadicado').numFmt = '"$"#,##0.00';
    sheet.getColumn('valorRadicado').numFmt = '"$"#,##0.00';
  }

  private styleHeaderRow(sheet: ExcelJS.Worksheet): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  private downloadBuffer(buffer: ExcelJS.Buffer, fileName: string): void {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

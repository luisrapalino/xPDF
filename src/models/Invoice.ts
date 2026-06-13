/** Registro consolidado de una factura radicada extraída de un PDF. */
export interface InvoiceRecord {
  id: string;
  archivo: string;
  lote: string;
  codigoHabilitacion: string;
  fechaRadicacion: string;
  cantidadFacturas: number;
  totalRadicado: number;
  usuarioRadica: string;
  numeroRadicado: string;
  numeroFactura: string;
  razonSocial: string;
  valorRadicado: number;
}

/** Metadatos generales extraídos de un certificado de radicación. */
export interface CertificateMetadata {
  archivo: string;
  lote: string;
  codigoHabilitacion: string;
  fechaRadicacion: string;
  cantidadFacturas: number;
  totalRadicado: number;
  usuarioRadica: string;
}

/** Resultado del procesamiento de un PDF individual. */
export interface PdfProcessResult {
  fileName: string;
  success: boolean;
  records: InvoiceRecord[];
  metadata?: CertificateMetadata;
  invoiceCount: number;
  error?: string;
}

/** Mensaje enviado desde el hilo principal al worker. */
export interface WorkerRequest {
  type: 'process';
  id: string;
  fileName: string;
  buffer: ArrayBuffer;
}

/** Mensaje de respuesta exitosa del worker. */
export interface WorkerSuccessResponse {
  type: 'success';
  id: string;
  fileName: string;
  records: InvoiceRecord[];
  metadata: CertificateMetadata;
  invoiceCount: number;
}

/** Mensaje de error del worker. */
export interface WorkerErrorResponse {
  type: 'error';
  id: string;
  fileName: string;
  error: string;
}

export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

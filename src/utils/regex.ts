/** Patrones regex para extraer datos de certificados de radicación. */
export const CERTIFICATE_MARKER = /CERTIFICADO\s+DE[\s\S]{0,20}?RADICACI[ÓO]N/i;

export const SECTION_FACTURAS_RADICADAS = /-?\s*FACTURAS\s+RADICADAS/i;

export const SECTION_END_MARKERS = /FACTURAS\s+NO\s+RADICADAS|-?\s*SOPORTES/i;

export const INVOICE_ROW_PATTERN =
  /(FMED\d+)\s+(FN\d+)\s+(.+?)\s+(\$\s*[\d,]+\.\d{2})/g;

export const LOTE_PATTERN = /LOTE:\s*(\d+)/i;

export const INLINE_INVOICE_PATTERN =
  /^(FMED\d+)\s+(FN\d+)\s+(.+?)\s+(\$[\d,]+\.\d{2})\s*$/;

export const RADICADO_LINE_PATTERN = /^(FMED\d+)\s+(FN\d+)\s*$/;

export const CURRENCY_PATTERN = /^\$\s*([\d,]+(?:\.\d{2})?)$/;

export const HEADER_NOISE_PATTERNS = [
  /^N\.\s*Radicado$/i,
  /^N\.\s*Factrura$/i,
  /^N\.\s*Factura$/i,
  /^Raz[oó]n\s+social$/i,
  /^Valor\s+Radicado$/i,
  /^Generado:/i,
  /^\d+\s+de\s+\d+$/i,
  /^CERTIFICADO\s+DE$/i,
  /^RADICACI[ÓO]N$/i,
  /^Lote\s+radicaci[óo]n$/i,
  /^ENTIDAD:/i,
  /^LOTE:$/i,
  /^-?\s*FACTURAS\s+RADICADAS$/i,
  /^-?\s*FACTURAS\s+NO\s+RADICADAS$/i,
  /^-?\s*SOPORTES$/i,
  /^Etiqueta$/i,
  /^Archivo$/i,
  /^Fecha Cargue$/i,
  /^[A-Z]{2,4}$/,
  /^[\w.-]+\.pdf$/i,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
];

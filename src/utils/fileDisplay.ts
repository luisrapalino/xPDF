export interface FileDisplayName {
  label: string;
  detail?: string;
  full: string;
}

export function getFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function isSameFile(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/**
 * Nombre legible para UI a partir del archivo PDF del certificado.
 * Ej: Certificado_Radicacion_396965_<uuid>.pdf → "Lote 396965"
 */
export function formatFileDisplayName(fileName: string): FileDisplayName {
  if (fileName === 'Sistema') {
    return { label: 'Sistema', full: fileName };
  }

  const loteMatch = fileName.match(/Certificado_Radicacion_(\d+)/i);
  if (loteMatch?.[1]) {
    return {
      label: `Lote ${loteMatch[1]}`,
      detail: shortenFileName(fileName),
      full: fileName,
    };
  }

  const shortened = shortenFileName(fileName);
  return {
    label: shortened,
    full: fileName,
  };
}

function shortenFileName(fileName: string, max = 36): string {
  const base = fileName.replace(/\.pdf$/i, '');
  if (base.length <= max) return fileName;

  const head = 16;
  const tail = 10;
  return `${base.slice(0, head)}…${base.slice(-tail)}.pdf`;
}

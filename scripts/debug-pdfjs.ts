import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractPageTextFromItems, parseCertificateText } from '../src/utils/pdfParser.ts';

const pdfs = [
  '/home/lrapa/Descargas/WhatSie/Certificado_Radicacion_396922_669e65fb-1f03-44c7-baf0-c4528df721b6.pdf',
  '/home/lrapa/Descargas/WhatSie/Certificado_Radicacion_396949_6717e74d-d4fa-4438-9cce-34271c26bf77.pdf',
  '/home/lrapa/Descargas/WhatSie/Certificado_Radicacion_396965_910ca0c7-bb0a-423e-a234-743466e8ece2.pdf',
  '/home/lrapa/Descargas/WhatSie/Certificado_Radicacion_396998_a9584670-6ed2-412c-ba1e-146e7704dc45.pdf',
];

async function extractWithPdfJs(pdfPath: string): Promise<string> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(extractPageTextFromItems(content.items));
    page.cleanup();
  }
  await pdf.destroy();
  return pages.join('\n');
}

async function main(): Promise<void> {
  for (const pdfPath of pdfs) {
    const name = pdfPath.split('/').pop()!;
    const pdfJsText = await extractWithPdfJs(pdfPath);
    const pdftotext = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8' });

    const fromPdfJs = parseCertificateText(pdfJsText, name);
    const fromPdftotext = parseCertificateText(pdftotext, name);

    console.log(
      name,
      '| pdf.js:',
      fromPdfJs.records.length,
      'pdftotext:',
      fromPdftotext.records.length,
      '| cantidad meta:',
      fromPdfJs.metadata?.cantidadFacturas,
    );
  }
}

main().catch(console.error);

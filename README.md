# xPDF

Aplicación web local para extraer facturas radicadas de certificados PDF y exportarlas a Excel.

## Requisitos

- Node.js 18+
- npm 9+

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

## Uso

1. Arrastra o selecciona PDFs de certificados de radicación (o una carpeta completa).
2. Haz clic en **Procesar PDFs**.
3. Revisa estadísticas, filtros y la tabla virtualizada.
4. Exporta **radicaciones.xlsx** con hojas **Resumen** y **Detalle**.

## Stack

- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS v4
- Sonner (toasts)
- PDF.js (Web Workers)
- ExcelJS
- @tanstack/react-virtual
- PWA offline (vite-plugin-pwa)

## Notas

- Todo el procesamiento ocurre en el navegador; no hay backend.
- Los filtros y el tema se persisten en `localStorage`.

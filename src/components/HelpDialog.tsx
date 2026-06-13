import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HelpDialogProps {
  iconOnly?: boolean;
}

export function HelpDialog({ iconOnly = false }: HelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={iconOnly ? 'icon' : 'sm'}
          className={iconOnly ? 'size-9' : ''}
          aria-label="Ayuda"
        >
          <CircleHelp className="size-4" />
          {!iconOnly && <span className="hidden sm:inline">Ayuda</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cómo usar xPDF</DialogTitle>
          <DialogDescription>
            Guía rápida para extraer datos de PDFs y exportarlos a Excel.
          </DialogDescription>
        </DialogHeader>

        <ol className="text-muted-foreground list-decimal space-y-3 pl-5 text-sm leading-relaxed">
          <li>
            <strong className="text-foreground">Carga PDFs</strong> arrastrando archivos, seleccionando
            múltiples PDFs o una carpeta completa.
          </li>
          <li>
            <strong className="text-foreground">Procesa</strong> para extraer los registros de cada PDF.
          </li>
          <li>
            <strong className="text-foreground">Filtra</strong> resultados con la búsqueda global o los
            filtros avanzados.
          </li>
          <li>
            <strong className="text-foreground">Exporta</strong> a Excel con hojas Resumen y Detalle.
          </li>
        </ol>

        <div className="bg-muted/50 rounded-lg border p-3 text-sm">
          <p className="font-medium">Rendimiento recomendado</p>
          <p className="text-muted-foreground mt-1">
            100–1.000 PDFs funciona de forma fluida. Para 5.000+ conviene dividir la carga por memoria
            del navegador.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

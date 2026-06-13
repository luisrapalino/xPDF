import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileCount: number;
  existingRecords: number;
  onConfirm: () => void;
}

export function ConfirmProcessDialog({
  open,
  onOpenChange,
  fileCount,
  existingRecords,
  onConfirm,
}: ConfirmProcessDialogProps) {
  const isLargeBatch = fileCount >= 2000;
  const willClearResults = existingRecords > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Iniciar procesamiento?</DialogTitle>
          <DialogDescription>
            Se procesarán{' '}
            <strong>{fileCount.toLocaleString('es-CO')} archivos PDF</strong> en el navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {willClearResults && (
            <div className="bg-muted rounded-lg border p-3">
              Se reemplazarán{' '}
              <strong>{existingRecords.toLocaleString('es-CO')} registros</strong> actuales por los
              nuevos resultados.
            </div>
          )}
          {isLargeBatch && (
            <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                Lote grande: puede consumir mucha memoria RAM y tardar varios minutos. Considera
                dividir la carga si el equipo es limitado.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Procesar ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

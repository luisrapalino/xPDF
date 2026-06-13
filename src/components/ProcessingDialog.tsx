import { Loader2 } from 'lucide-react';
import { HintTooltip } from '@/components/HintTooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, formatDuration, formatPercent } from '@/utils/formatters';

interface ProcessingDialogProps {
  open: boolean;
  onCancel: () => void;
}

export function ProcessingDialog({ open, onCancel }: ProcessingDialogProps) {
  const { stats } = useAppStore();

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="text-primary size-5 animate-spin" />
            Procesando PDFs
          </DialogTitle>
          <DialogDescription>
            Extrayendo datos. Puedes cancelar en cualquier momento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <HintTooltip label="Porcentaje de PDFs procesados">
                <span className="cursor-default font-medium">{formatPercent(stats.progressPercent)}</span>
              </HintTooltip>
            </div>
            <Progress value={stats.progressPercent} />
            <p className="text-muted-foreground text-xs">
              {stats.processedPdfs.toLocaleString('es-CO')} /{' '}
              {stats.totalPdfs.toLocaleString('es-CO')} PDFs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Registros"
              tooltip="Registros encontrados hasta ahora"
              value={stats.totalInvoices.toLocaleString('es-CO')}
              loading={stats.totalInvoices === 0}
            />
            <StatBox
              label="Importe total"
              tooltip="Suma de valores acumulada"
              value={formatCurrency(stats.totalRadicado)}
              loading={stats.totalRadicado === 0}
            />
            <StatBox
              label="Transcurrido"
              tooltip="Tiempo transcurrido desde el inicio del procesamiento"
              value={formatDuration(stats.elapsedMs)}
            />
            <StatBox
              label="Restante est."
              tooltip="Estimación según la velocidad actual de procesamiento"
              value={formatDuration(stats.estimatedRemainingMs)}
            />
          </div>

          <Button variant="outline" className="w-full" onClick={onCancel}>
            Cancelar procesamiento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatBox({
  label,
  tooltip,
  value,
  loading = false,
}: {
  label: string;
  tooltip: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <HintTooltip label={tooltip}>
      <div className="bg-muted/50 cursor-default rounded-lg border p-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-6 w-20" />
        ) : (
          <p className="mt-1 text-sm font-semibold">{value}</p>
        )}
      </div>
    </HintTooltip>
  );
}

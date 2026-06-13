import { CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatters';

export interface ExportSummaryData {
  totalPdfs: number;
  totalFacturas: number;
  totalValorRadicado: number;
  fechaGeneracion: Date;
}

interface ExportSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ExportSummaryData | null;
}

export function ExportSummaryDialog({ open, onOpenChange, summary }: ExportSummaryDialogProps) {
  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            Exportación completada
          </DialogTitle>
          <DialogDescription>
            El archivo <strong>export.xlsx</strong> se descargó correctamente.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 space-y-2 rounded-lg border p-4 text-sm">
          <Row label="Total PDFs" value={summary.totalPdfs.toLocaleString('es-CO')} />
          <Row label="Total registros" value={summary.totalFacturas.toLocaleString('es-CO')} />
          <Row label="Importe total" value={formatCurrency(summary.totalValorRadicado)} />
          <Row
            label="Generado"
            value={summary.fechaGeneracion.toLocaleString('es-CO')}
          />
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            <FileSpreadsheet className="size-4" />
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

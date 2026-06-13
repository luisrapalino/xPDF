import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore } from '@/hooks/useAppStore';

export function ExportProgressDialog() {
  const { stats } = useAppStore();

  return (
    <Dialog open={stats.isExporting} onOpenChange={() => undefined}>
      <DialogContent
        className="sm:max-w-sm [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="text-primary size-5 animate-spin" />
            Generando Excel
          </DialogTitle>
          <DialogDescription>
            Preparando export.xlsx con tus registros. Esto puede tardar unos segundos.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

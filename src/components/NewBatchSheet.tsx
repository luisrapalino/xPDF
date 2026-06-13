import { Upload } from 'lucide-react';
import { Dropzone } from '@/components/Dropzone';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NewBatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: () => void;
}

export function NewBatchSheet({ open, onOpenChange, onProcess }: NewBatchSheetProps) {
  const handleProcess = () => {
    onOpenChange(false);
    onProcess();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle>Nueva carga</SheetTitle>
          <SheetDescription>
            Selecciona los PDFs a procesar. Al confirmar se reemplazarán los resultados actuales.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <Dropzone variant="compact" onProcess={handleProcess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function NewBatchButton({
  onClick,
  disabled,
  className,
  size = 'sm',
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(className)}
    >
      <Upload className="size-4" />
      <span className="hidden sm:inline">Nueva carga</span>
      <span className="sm:hidden">Nueva</span>
    </Button>
  );
}

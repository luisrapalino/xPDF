import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Files, FolderOpen, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/hooks/useAppStore';
import { appStore } from '@/store/AppStore';
import { chipPop, springSnappy } from '@/lib/motion';
import { formatFileDisplayName, getFileKey } from '@/utils/fileDisplay';

function filterPdfFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
}

interface SelectedFilesSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function SelectedFilesSheet({
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: SelectedFilesSheetProps) {
  const { selectedFiles, stats } = useAppStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const removeDisabled = stats.isProcessing;
  const addDisabled = stats.isProcessing;

  const handleAddFiles = (files: FileList | File[]) => {
    const pdfs = filterPdfFiles(files);
    if (pdfs.length === 0) {
      return;
    }
    appStore.addFiles(pdfs);
  };

  useEffect(() => {
    if (selectedFiles.length === 0 && open) {
      setOpen(false);
    }
  }, [selectedFiles.length, open, setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedFiles.length === 0}>
            <Files className="size-4" />
            <span className="hidden sm:inline">Archivos</span>
            {selectedFiles.length > 0 && (
              <span className="text-muted-foreground ml-1 text-xs tabular-nums">
                {selectedFiles.length > 999 ? '999+' : selectedFiles.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Archivos seleccionados</SheetTitle>
          <SheetDescription>
            {selectedFiles.length.toLocaleString('es-CO')} PDFs listos para procesar.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="scrollbar-subtle h-[calc(100vh-9.5rem)]">
          <ul className="divide-y">
            <AnimatePresence initial={false}>
              {selectedFiles.map((file) => {
                const display = formatFileDisplayName(file.name);
                const fileKey = getFileKey(file);

                return (
                  <motion.li
                    key={fileKey}
                    layout
                    variants={chipPop}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={springSnappy}
                    className="flex items-start gap-2 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{display.label}</p>
                      {display.detail && (
                        <p className="text-muted-foreground truncate font-mono text-[11px]">
                          {display.detail}
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={removeDisabled}
                      onClick={() => appStore.removeFile(file)}
                      aria-label={`Quitar ${display.label}`}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="size-4" />
                    </Button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </ScrollArea>
        <div className="flex gap-2 border-t p-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={addDisabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-4" />
            Agregar PDFs
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={addDisabled}
            onClick={() => folderInputRef.current?.click()}
          >
            <FolderOpen className="size-4" />
            Carpeta
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleAddFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          hidden
          {...{ webkitdirectory: '', directory: '' }}
          onChange={(e) => {
            if (e.target.files) handleAddFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

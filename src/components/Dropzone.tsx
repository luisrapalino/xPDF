import { useCallback, useRef, useState } from 'react';
import { FileText, FolderOpen, Play, Plus, Upload, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { SelectedFilesSheet } from '@/components/SelectedFilesSheet';
import { SelectedFilesStack } from '@/components/SelectedFilesStack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppStore } from '@/hooks/useAppStore';
import { appStore } from '@/store/AppStore';
import { cn } from '@/lib/utils';

function filterPdfFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
}

type FilePickMode = 'add' | 'replace';

function notifyFileSelection(
  mode: FilePickMode,
  count: number,
  result?: { added: number; skipped: number },
): void {
  if (mode === 'add' && result) {
    const { added, skipped } = result;
    if (added === 0 && skipped > 0) {
      toast.info('Esos PDFs ya estaban en la cola');
      return;
    }
    if (skipped > 0) {
      toast.success(
        `${added.toLocaleString('es-CO')} agregado${added === 1 ? '' : 's'}, ${skipped.toLocaleString('es-CO')} duplicado${skipped === 1 ? '' : 's'} omitido${skipped === 1 ? '' : 's'}`,
      );
      return;
    }
    toast.success(
      `${added.toLocaleString('es-CO')} PDF${added === 1 ? '' : 's'} agregado${added === 1 ? '' : 's'}`,
    );
    return;
  }

  toast.success(`${count.toLocaleString('es-CO')} PDFs seleccionados`);
}

const features = [
  { icon: Zap, label: 'Muchos archivos' },
  { icon: FileText, label: 'Exporta a Excel' },
] as const;

interface DropzoneProps {
  onProcess?: () => void;
  variant?: 'hero' | 'compact';
}

export function Dropzone({ onProcess, variant = 'hero' }: DropzoneProps) {
  const { selectedFiles, stats } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [filesSheetOpen, setFilesSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const pickModeRef = useRef<FilePickMode>('replace');
  const isCompact = variant === 'compact';
  const hasFiles = selectedFiles.length > 0;

  const handleFiles = useCallback(
    (files: File[], mode: FilePickMode = hasFiles ? 'add' : 'replace') => {
      const pdfs = filterPdfFiles(files);
      if (pdfs.length === 0) {
        toast.error('No se encontraron archivos PDF');
        return;
      }

      if (mode === 'add' && hasFiles) {
        const result = appStore.addFiles(pdfs);
        notifyFileSelection('add', pdfs.length, result);
        return;
      }

      appStore.setFiles(pdfs);
      notifyFileSelection('replace', pdfs.length);
    },
    [hasFiles],
  );

  const openFilePicker = (mode: FilePickMode) => {
    pickModeRef.current = mode;
    fileInputRef.current?.click();
  };

  const openFolderPicker = (mode: FilePickMode) => {
    pickModeRef.current = mode;
    folderInputRef.current?.click();
  };

  return (
    <>
      <Card
        className={cn(
          'w-full min-w-0 border-dashed',
          isDragging && 'border-primary bg-primary/5',
          isCompact && 'gap-4 py-4',
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(filterPdfFiles(e.dataTransfer.files), hasFiles ? 'add' : 'replace');
        }}
      >
        <CardHeader
          className={cn(
            'flex flex-col items-center gap-3 text-center',
            isCompact && 'px-4',
          )}
        >
          {!hasFiles && (
            <div
              className={cn(
                'bg-muted flex items-center justify-center rounded-full',
                isCompact ? 'size-10' : 'size-16',
              )}
            >
              <Upload className={cn('text-muted-foreground', isCompact ? 'size-4' : 'size-7')} />
            </div>
          )}
          <CardTitle className={cn(isCompact ? 'text-base' : 'text-xl')}>
            {hasFiles ? 'PDFs listos para procesar' : 'Arrastra tus PDFs'}
          </CardTitle>
          <CardDescription className="max-w-sm">
            {hasFiles
              ? `${selectedFiles.length.toLocaleString('es-CO')} archivo${selectedFiles.length === 1 ? '' : 's'} en cola. Arrastra más PDFs o agrégalos con los botones.`
              : 'Selecciona archivos o una carpeta.'}
          </CardDescription>
        </CardHeader>

        <CardContent
          className={cn(
            'flex min-w-0 flex-col items-stretch gap-4',
            isCompact && 'px-4',
          )}
        >
          {hasFiles ? (
            <>
              <SelectedFilesStack
                files={selectedFiles}
                size={isCompact ? 'sm' : 'md'}
                {...(isCompact ? { maxVisible: 9 } : {})}
                className="w-full"
                onOverflowClick={() => setFilesSheetOpen(true)}
                onRemove={(file) => appStore.removeFile(file)}
                removeDisabled={stats.isProcessing}
              />
              <div className="flex w-full min-w-0 flex-col gap-2 border-t pt-4">
                {isCompact ? (
                  <>
                    <Button
                      size="default"
                      disabled={stats.isProcessing}
                      onClick={onProcess}
                      className="w-full"
                    >
                      <Play className="size-4" />
                      Procesar ahora
                    </Button>
                    <Button
                      variant="outline"
                      disabled={stats.isProcessing}
                      onClick={() => openFilePicker('add')}
                      className="w-full min-w-0"
                    >
                      <Plus className="size-4 shrink-0" />
                      Agregar PDFs
                    </Button>
                    <Button
                      variant="outline"
                      disabled={stats.isProcessing}
                      onClick={() => openFolderPicker('add')}
                      className="w-full min-w-0"
                    >
                      <FolderOpen className="size-4 shrink-0" />
                      Agregar carpeta
                    </Button>
                  </>
                ) : (
                  <div className="flex w-full flex-wrap items-center justify-center gap-2">
                    <Button
                      size="default"
                      disabled={stats.isProcessing}
                      onClick={onProcess}
                      className="min-w-44"
                    >
                      <Play className="size-4" />
                      Procesar ahora
                    </Button>
                    <Button
                      variant="outline"
                      disabled={stats.isProcessing}
                      onClick={() => openFilePicker('add')}
                    >
                      <Plus className="size-4" />
                      Agregar PDFs
                    </Button>
                    <Button
                      variant="outline"
                      disabled={stats.isProcessing}
                      onClick={() => openFolderPicker('add')}
                    >
                      <FolderOpen className="size-4" />
                      Agregar carpeta
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={stats.isProcessing}
                  onClick={() => openFilePicker('replace')}
                  className={cn('text-muted-foreground', isCompact ? 'w-full' : 'self-center')}
                >
                  Reemplazar todos
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size={isCompact ? 'default' : 'lg'} onClick={() => openFilePicker('replace')}>
                  <FileText className="size-4" />
                  Seleccionar PDFs
                </Button>
                <Button
                  variant="outline"
                  size={isCompact ? 'default' : 'lg'}
                  onClick={() => openFolderPicker('replace')}
                >
                  <FolderOpen className="size-4" />
                  Seleccionar carpeta
                </Button>
              </div>
              {!isCompact && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {features.map(({ icon: Icon, label }) => (
                    <Badge key={label} variant="secondary">
                      <Icon />
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(filterPdfFiles(e.target.files), pickModeRef.current);
            }
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
            if (e.target.files) {
              handleFiles(filterPdfFiles(e.target.files), pickModeRef.current);
            }
            e.target.value = '';
          }}
        />
      </Card>

      <SelectedFilesSheet
        open={filesSheetOpen}
        onOpenChange={setFilesSheetOpen}
        showTrigger={false}
      />
    </>
  );
}

import {
  FileSpreadsheet,
  Play,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NewBatchButton } from '@/components/NewBatchSheet';
import { HelpDialog } from '@/components/HelpDialog';
import { LogsSheet } from '@/components/LogsSheet';
import { SelectedFilesSheet } from '@/components/SelectedFilesSheet';
import { ThemeMenu } from '@/components/ThemeMenu';
import { useAppStore } from '@/hooks/useAppStore';

export type AppPhase = 'welcome' | 'ready' | 'workspace';

interface HeaderProps {
  phase: AppPhase;
  onProcess: () => void;
  onExport: () => void;
  showNewBatch?: boolean;
  onNewBatch?: () => void;
}

export function Header({ phase, onProcess, onExport, showNewBatch, onNewBatch }: HeaderProps) {
  const { stats, selectedFiles, records } = useAppStore();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="min-w-0 truncate">
            <Logo size="lg" />
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showNewBatch && onNewBatch && (
            <NewBatchButton onClick={onNewBatch} disabled={stats.isExporting} />
          )}

          {phase === 'workspace' && (
            <Button
              size="sm"
              disabled={records.length === 0 || stats.isProcessing || stats.isExporting}
              onClick={onExport}
            >
              <FileSpreadsheet className="size-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}

          {phase === 'ready' && (
            <Button
              size="sm"
              disabled={selectedFiles.length === 0 || stats.isProcessing}
              onClick={onProcess}
              className="hidden sm:inline-flex"
            >
              <Play className="size-4" />
              Procesar
            </Button>
          )}

          {phase !== 'welcome' && records.length === 0 && (
            <div className="hidden sm:contents">
              <SelectedFilesSheet />
            </div>
          )}

          {phase === 'workspace' && <LogsSheet />}

          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

          <HelpDialog iconOnly />
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}

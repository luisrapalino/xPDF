import { Fragment, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileSpreadsheet, Play, Upload, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BrandFooter } from '@/components/BrandFooter';
import { Dropzone } from '@/components/Dropzone';
import { Header, type AppPhase } from '@/components/Header';
import { ResultsTable } from '@/components/ResultsTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NewBatchSheet } from '@/components/NewBatchSheet';
import { ConfirmProcessDialog } from '@/components/ConfirmProcessDialog';
import { ExportProgressDialog } from '@/components/ExportProgressDialog';
import { ProcessingDialog } from '@/components/ProcessingDialog';
import {
  ExportSummaryDialog,
  type ExportSummaryData,
} from '@/components/ExportSummaryDialog';
import { useAppStore } from '@/hooks/useAppStore';
import { useProcessing } from '@/hooks/useProcessing';
import { easeOut, fadeUp, scaleIn, staggerContainer, staggerItem } from '@/lib/motion';

const WORKFLOW_STEPS: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Carga', icon: Upload },
  { label: 'Procesa', icon: Play },
  { label: 'Exporta', icon: FileSpreadsheet },
];

function resolvePhase(
  selectedFiles: File[],
  recordsLength: number,
  isProcessing: boolean,
  processedPdfs: number,
): AppPhase {
  if (isProcessing || recordsLength > 0 || processedPdfs > 0) return 'workspace';
  if (selectedFiles.length > 0) return 'ready';
  return 'welcome';
}

function WorkflowSteps({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex w-full items-center">
      {WORKFLOW_STEPS.map(({ label, icon: Icon }, index) => (
        <Fragment key={label}>
          {index > 0 && <Separator className="flex-1" />}
          <Badge
            variant={index <= activeStep ? 'default' : 'secondary'}
            className="shrink-0 px-2.5 py-1"
          >
            <Icon />
            {label}
          </Badge>
        </Fragment>
      ))}
    </div>
  );
}

export function App() {
  const { stats, selectedFiles, records } = useAppStore();
  const { processFiles, exportExcel, cancelProcessing } = useProcessing();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newBatchOpen, setNewBatchOpen] = useState(false);
  const [exportSummaryOpen, setExportSummaryOpen] = useState(false);
  const [exportSummary, setExportSummary] = useState<ExportSummaryData | null>(null);

  const phase = useMemo(
    () => resolvePhase(selectedFiles, records.length, stats.isProcessing, stats.processedPdfs),
    [selectedFiles, records.length, stats.isProcessing, stats.processedPdfs],
  );

  const hasResults = records.length > 0;
  const showNewBatch = hasResults && !stats.isProcessing;

  const handleProcessClick = useCallback(() => {
    if (selectedFiles.length === 0) {
      toast.warning('Selecciona al menos un PDF');
      return;
    }

    const needsConfirm = records.length > 0 || selectedFiles.length >= 2000;
    if (needsConfirm) {
      setConfirmOpen(true);
      return;
    }

    void processFiles();
  }, [selectedFiles.length, records.length, processFiles]);

  const handleExportClick = useCallback(async () => {
    const summary = await exportExcel();
    if (summary) {
      setExportSummary(summary);
      setExportSummaryOpen(true);
    }
  }, [exportExcel]);

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex h-dvh flex-col overflow-hidden">
      <Toaster richColors closeButton position="bottom-right" />
      <Header
        phase={phase}
        onProcess={handleProcessClick}
        onExport={() => void handleExportClick()}
        showNewBatch={showNewBatch}
        onNewBatch={() => setNewBatchOpen(true)}
      />

      <div className="scrollbar-subtle flex min-h-0 flex-1 flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'welcome' && (
            <motion.main
              key="welcome"
              className="mx-auto flex w-full max-w-lg flex-1 flex-col items-stretch justify-center gap-6 px-4 py-8"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={easeOut}
            >
              <Alert>
                <AlertTitle>De PDFs a Excel en minutos</AlertTitle>
                <AlertDescription>
                  Extrae datos de tus PDFs y exporta un Excel listo para usar.
                </AlertDescription>
              </Alert>
              <WorkflowSteps activeStep={0} />
              <Dropzone variant="hero" onProcess={handleProcessClick} />
            </motion.main>
          )}

          {phase === 'ready' && (
            <motion.main
              key="ready"
              className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-stretch justify-center gap-6 px-4 py-8"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={easeOut}
            >
              <WorkflowSteps activeStep={1} />
              <Dropzone variant="compact" onProcess={handleProcessClick} />
            </motion.main>
          )}

          {phase === 'workspace' && (
            <motion.main
              key="workspace"
              className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {hasResults ? (
                <motion.div variants={staggerItem} transition={easeOut}>
                  <ResultsTable />
                </motion.div>
              ) : (
                !stats.isProcessing && (
                  <motion.div
                    variants={staggerItem}
                    transition={easeOut}
                    className="flex flex-1 flex-col justify-center"
                  >
                    <Dropzone variant="compact" onProcess={handleProcessClick} />
                  </motion.div>
                )
              )}
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      <BrandFooter />

      <NewBatchSheet
        open={newBatchOpen}
        onOpenChange={setNewBatchOpen}
        onProcess={handleProcessClick}
      />

      <ConfirmProcessDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        fileCount={selectedFiles.length}
        existingRecords={records.length}
        onConfirm={() => void processFiles()}
      />

      <ProcessingDialog open={stats.isProcessing} onCancel={cancelProcessing} />
      <ExportProgressDialog />

      <ExportSummaryDialog
        open={exportSummaryOpen}
        onOpenChange={setExportSummaryOpen}
        summary={exportSummary}
      />
    </div>
    </TooltipProvider>
  );
}

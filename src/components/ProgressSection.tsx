import { HintTooltip } from '@/components/HintTooltip';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/hooks/useAppStore';
import { formatDuration, formatPercent } from '@/utils/formatters';

export function ProgressSection() {
  const { stats } = useAppStore();

  if (!stats.isProcessing) return null;

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium">Procesando PDFs…</CardTitle>
        <CardAction className="flex items-center gap-3">
          <HintTooltip label="Tiempo transcurrido desde el inicio">
            <span className="text-muted-foreground cursor-default text-sm tabular-nums">
              {formatDuration(stats.elapsedMs)}
            </span>
          </HintTooltip>
          <HintTooltip label="Porcentaje de PDFs procesados">
            <span className="text-muted-foreground cursor-default text-sm tabular-nums">
              {formatPercent(stats.progressPercent)}
            </span>
          </HintTooltip>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <Progress value={stats.progressPercent} className="h-1.5" />
        <p className="text-muted-foreground text-xs">
          {stats.processedPdfs.toLocaleString('es-CO')} / {stats.totalPdfs.toLocaleString('es-CO')}{' '}
          PDFs
        </p>
      </CardContent>
    </Card>
  );
}

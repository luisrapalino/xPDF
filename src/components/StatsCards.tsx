import { Clock, FileCheck, FileText, Gauge, Receipt, Wallet } from 'lucide-react';
import { HintTooltip } from '@/components/HintTooltip';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, formatDuration, formatRate } from '@/utils/formatters';

const statsConfig = [
  {
    key: 'pdfs',
    label: 'PDFs procesados',
    tooltip: 'PDFs analizados hasta ahora',
    icon: FileCheck,
  },
  {
    key: 'invoices',
    label: 'Registros',
    tooltip: 'Total de registros extraídos',
    icon: Receipt,
  },
  {
    key: 'total',
    label: 'Importe total',
    tooltip: 'Suma de los valores encontrados',
    icon: Wallet,
  },
  {
    key: 'elapsed',
    label: 'Tiempo transcurrido',
    tooltip: 'Duración desde el inicio del procesamiento',
    icon: Clock,
  },
  {
    key: 'remaining',
    label: 'Tiempo estimado restante',
    tooltip: 'Estimación según la velocidad actual',
    icon: Gauge,
  },
  {
    key: 'rate',
    label: 'PDFs por segundo',
    tooltip: 'Velocidad media de procesamiento',
    icon: FileText,
  },
] as const;

const METRICS_PENDING_FIRST_PDF = new Set(['pdfs', 'invoices', 'total', 'rate']);

export function StatsCards() {
  const { stats } = useAppStore();
  const isInitialLoading = stats.isProcessing && stats.processedPdfs === 0;

  const values: Record<(typeof statsConfig)[number]['key'], string> = {
    pdfs: stats.processedPdfs.toLocaleString('es-CO'),
    invoices: stats.totalInvoices.toLocaleString('es-CO'),
    total: formatCurrency(stats.totalRadicado),
    elapsed: formatDuration(stats.elapsedMs),
    remaining: stats.isProcessing ? formatDuration(stats.estimatedRemainingMs) : '—',
    rate: formatRate(stats.pdfsPerSecond),
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {statsConfig.map(({ key, label, tooltip, icon: Icon }) => (
        <HintTooltip key={key} label={tooltip}>
          <Card className="cursor-default gap-4 py-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
              <CardAction>
                <Icon className="text-muted-foreground size-4" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {isInitialLoading && METRICS_PENDING_FIRST_PDF.has(key) ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-bold tracking-tight tabular-nums">{values[key]}</p>
              )}
            </CardContent>
          </Card>
        </HintTooltip>
      ))}
    </div>
  );
}

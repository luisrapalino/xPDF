import { AlertCircle, CheckCircle2, Info, Trash2 } from 'lucide-react';
import { HintTooltip } from '@/components/HintTooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/hooks/useAppStore';
import { appStore } from '@/store/AppStore';
import type { LogEntry } from '@/models/Summary';
import { formatFileDisplayName } from '@/utils/fileDisplay';
import { formatTimestamp } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const levelConfig: Record<
  LogEntry['level'],
  { icon: typeof Info; badge: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  info: { icon: Info, badge: 'secondary', label: 'Info' },
  success: { icon: CheckCircle2, badge: 'default', label: 'OK' },
  warn: { icon: AlertCircle, badge: 'outline', label: 'Aviso' },
  error: { icon: AlertCircle, badge: 'destructive', label: 'Error' },
};

interface LogPanelContentProps {
  className?: string;
  showHeader?: boolean;
}

export function LogPanelContent({ className, showHeader = false }: LogPanelContentProps) {
  const { logs } = useAppStore();

  return (
    <div className={cn('flex flex-col', className)}>
      {showHeader && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Registro de actividad</p>
          <Button variant="ghost" size="sm" onClick={() => appStore.clearLogs()}>
            <Trash2 className="size-4" />
            Limpiar
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">Sin registros aún.</p>
        ) : (
          <div className="flex flex-col">
            {logs.slice(0, 100).map((log, index) => {
              const config = levelConfig[log.level];
              const Icon = config.icon;
              const file = formatFileDisplayName(log.fileName);

              return (
                <div key={log.id}>
                  <div className="flex gap-3 px-4 py-3">
                    <Icon
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        log.level === 'error' && 'text-destructive',
                        log.level === 'success' && 'text-primary',
                        log.level === 'warn' && 'text-amber-500',
                        log.level === 'info' && 'text-muted-foreground',
                      )}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={config.badge} className="shrink-0 text-[10px]">
                          {config.label}
                        </Badge>
                        <time className="text-muted-foreground shrink-0 text-xs tabular-nums">
                          {formatTimestamp(log.timestamp)}
                        </time>
                      </div>
                      <HintTooltip label={file.full} side="left">
                        <p className="w-fit max-w-full truncate text-sm font-medium">{file.label}</p>
                      </HintTooltip>
                      {file.detail && (
                        <p className="text-muted-foreground truncate font-mono text-[11px]">
                          {file.detail}
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs leading-relaxed">{log.message}</p>
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

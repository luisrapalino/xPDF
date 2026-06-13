import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogPanelContent } from '@/components/LogPanelContent';
import { appStore } from '@/store/AppStore';

export function LogPanel() {
  return (
    <Card className="sticky top-24 hidden h-[calc(100vh-7rem)] gap-0 overflow-hidden py-0 lg:flex lg:flex-col">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Logs</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => appStore.clearLogs()}>
            <Trash2 className="size-4" />
            Limpiar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <LogPanelContent className="h-full" />
      </CardContent>
    </Card>
  );
}

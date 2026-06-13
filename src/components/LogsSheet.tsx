import { ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LogPanelContent } from '@/components/LogPanelContent';
import { useAppStore } from '@/hooks/useAppStore';
import { Badge } from '@/components/ui/badge';

export function LogsSheet() {
  const { logs } = useAppStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <ScrollText className="size-4" />
          Actividad
          {logs.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {Math.min(logs.length, 99)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Actividad</SheetTitle>
          <SheetDescription>
            Historial del procesamiento. Los errores por archivo aparecen aquí con detalle.
          </SheetDescription>
        </SheetHeader>
        <LogPanelContent className="h-[calc(100vh-5.5rem)]" />
      </SheetContent>
    </Sheet>
  );
}

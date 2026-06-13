import { useState } from 'react';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatFilterDateDisplay, formatFilterDateIso, parseLooseDate } from '@/utils/dateFilter';
import { cn } from '@/lib/utils';

interface DateFilterPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateFilterPicker({
  id,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
}: DateFilterPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseLooseDate(value) ?? undefined : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4" />
          {value ? formatFilterDateDisplay(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(formatFilterDateIso(date));
            } else {
              onChange('');
            }
            setOpen(false);
          }}
        />
        {value && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              Limpiar fecha
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

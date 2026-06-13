import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { HintTooltip } from '@/components/HintTooltip';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppStore } from '@/hooks/useAppStore';
import type { ThemePreference } from '@/models/Summary';
import { appStore } from '@/store/AppStore';
import { cn } from '@/lib/utils';

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Monitor;
}> = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
];

export function ThemeMenu() {
  const { preferences } = useAppStore();
  const theme = preferences.theme;
  const ActiveIcon = THEME_OPTIONS.find((option) => option.value === theme)?.icon ?? Monitor;

  return (
    <Popover>
      <HintTooltip label="Tema">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Tema">
            <ActiveIcon className="size-4" />
          </Button>
        </PopoverTrigger>
      </HintTooltip>
      <PopoverContent align="end" className="w-40 p-1">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => appStore.setTheme(value)}
            className={cn(
              'hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
              theme === value && 'bg-accent',
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
            {theme === value && <Check className="ml-auto size-4" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

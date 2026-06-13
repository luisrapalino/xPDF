import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, RotateCcw, Search } from 'lucide-react';
import { DateFilterPicker } from '@/components/DateFilterPicker';
import { HintTooltip } from '@/components/HintTooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/hooks/useAppStore';
import { appStore } from '@/store/AppStore';
import type { ResultFilters } from '@/models/Summary';
import { collapsePanel, easeOut, staggerContainer, staggerItem } from '@/lib/motion';

const textFilterFields: Array<{
  key: Exclude<keyof ResultFilters, 'globalSearch' | 'fecha'>;
  label: string;
  placeholder: string;
}> = [
  { key: 'lote', label: 'Lote', placeholder: 'Ej: 396922' },
  { key: 'factura', label: 'Factura', placeholder: 'Ej: FN898004' },
  { key: 'radicado', label: 'Radicado', placeholder: 'Ej: FMED27033517' },
  { key: 'razonSocial', label: 'Razón Social', placeholder: 'Ej: MARCAZSALUD' },
];

function hasAdvancedFilters(filters: ResultFilters): boolean {
  return (
    textFilterFields.some(({ key }) => filters[key].trim().length > 0) ||
    filters.fecha.trim().length > 0
  );
}

export function ResultsFilters() {
  const { preferences, records, filteredRecords } = useAppStore();
  const filters = preferences.filters;
  const [expanded, setExpanded] = useState(() => hasAdvancedFilters(filters));

  const countLabel =
    records.length === filteredRecords.length
      ? `${filteredRecords.length.toLocaleString('es-CO')} registros`
      : `${filteredRecords.length.toLocaleString('es-CO')} de ${records.length.toLocaleString('es-CO')}`;

  return (
    <div className="border-b px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="globalSearch"
            className="pl-9"
            placeholder="Buscar en los resultados…"
            value={filters.globalSearch}
            onChange={(e) => appStore.setFilters({ globalSearch: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 lg:ml-auto">
          <span className="text-muted-foreground text-sm tabular-nums">{countLabel}</span>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
          >
            Filtros
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex"
            >
              <ChevronDown className="size-4" />
            </motion.span>
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="advanced-filters"
            variants={collapsePanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={easeOut}
            className="overflow-hidden"
          >
            <motion.div
              className="mt-5 space-y-4 border-t pt-5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {textFilterFields.map(({ key, label, placeholder }) => (
                  <motion.div key={key} variants={staggerItem} className="space-y-2">
                    <Label htmlFor={key} className="text-xs">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      placeholder={placeholder}
                      value={filters[key]}
                      onChange={(e) => appStore.setFilters({ [key]: e.target.value })}
                    />
                  </motion.div>
                ))}
                <motion.div variants={staggerItem} className="space-y-2">
                  <HintTooltip label="Filtra por fecha (mes/día/año)">
                    <Label htmlFor="fecha" className="text-xs">
                      Fecha
                    </Label>
                  </HintTooltip>
                  <DateFilterPicker
                    id="fecha"
                    value={filters.fecha}
                    onChange={(value) => appStore.setFilters({ fecha: value })}
                    placeholder="Seleccionar fecha"
                  />
                </motion.div>
              </div>
              <motion.div variants={staggerItem}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    appStore.resetFilters();
                    setExpanded(false);
                  }}
                >
                  <RotateCcw className="size-4" />
                  Restablecer filtros
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

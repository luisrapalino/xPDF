import { AnimatePresence, motion } from 'motion/react';
import { FileText, X } from 'lucide-react';
import { HintTooltip } from '@/components/HintTooltip';
import { chipPop, chipStagger, springSnappy } from '@/lib/motion';
import { formatFileDisplayName, getFileKey } from '@/utils/fileDisplay';
import { cn } from '@/lib/utils';

/** Con lotes pequeños se muestran todos; solo se trunca en cargas grandes. */
const SHOW_ALL_UP_TO = 16;

interface SelectedFilesStackProps {
  files: File[];
  size?: 'sm' | 'md';
  className?: string;
  maxVisible?: number;
  onOverflowClick?: () => void;
  onRemove?: (file: File) => void;
  removeDisabled?: boolean;
}

export function SelectedFilesStack({
  files,
  size = 'md',
  className,
  maxVisible = SHOW_ALL_UP_TO,
  onOverflowClick,
  onRemove,
  removeDisabled = false,
}: SelectedFilesStackProps) {
  if (files.length === 0) return null;

  const hasOverflow = files.length > maxVisible;
  const visibleFiles = hasOverflow ? files.slice(0, maxVisible - 1) : files;
  const overflowCount = files.length - visibleFiles.length;

  const chipSize = size === 'sm' ? 'h-8 gap-1 px-2 text-xs' : 'h-9 gap-1 px-2 text-xs';
  const iconSize = size === 'sm' ? 'size-3' : 'size-3.5';
  const chipMaxW = onRemove
    ? size === 'sm'
      ? 'max-w-[9rem]'
      : 'max-w-[10rem]'
    : size === 'sm'
      ? 'max-w-[7.5rem]'
      : 'max-w-[8.5rem]';
  const removeIconSize = size === 'sm' ? 'size-3' : 'size-3.5';

  return (
    <motion.div
      className={cn('flex w-full flex-wrap items-center justify-center gap-1.5', className)}
      variants={chipStagger}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {visibleFiles.map((file) => {
          const display = formatFileDisplayName(file.name);
          const fileKey = getFileKey(file);

          return (
            <motion.div
              key={fileKey}
              layout
              variants={chipPop}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={springSnappy}
              className="inline-flex"
            >
              <div
                className={cn(
                  'bg-card group/chip inline-flex items-center rounded-md border shadow-sm',
                  chipMaxW,
                  chipSize,
                )}
              >
                <HintTooltip label={display.full}>
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <FileText className={cn('text-muted-foreground shrink-0', iconSize)} />
                    <span className="truncate font-medium">{display.label}</span>
                  </div>
                </HintTooltip>
                {onRemove && (
                  <HintTooltip label="Quitar archivo">
                    <button
                      type="button"
                      disabled={removeDisabled}
                      onClick={() => onRemove(file)}
                      aria-label={`Quitar ${display.label}`}
                      className={cn(
                        'text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
                        removeIconSize,
                      )}
                    >
                      <X className="size-full" />
                    </button>
                  </HintTooltip>
                )}
              </div>
            </motion.div>
          );
        })}

        {hasOverflow && (
          <motion.div
            key="overflow"
            layout
            variants={chipPop}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springSnappy}
            className="inline-flex"
          >
            <OverflowChip
              count={overflowCount}
              size={size}
              label={`${overflowCount} archivo${overflowCount === 1 ? '' : 's'} más`}
              {...(onOverflowClick ? { onClick: onOverflowClick } : {})}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OverflowChip({
  count,
  size,
  onClick,
  label,
}: {
  count: number;
  size: 'sm' | 'md';
  onClick?: () => void;
  label: string;
}) {
  const chipSize = size === 'sm' ? 'size-8 text-xs' : 'size-9 text-xs';
  const content = (
    <span
      className={cn(
        'bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold tabular-nums',
        chipSize,
        onClick && 'hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors',
      )}
    >
      +{count.toLocaleString('es-CO')}
    </span>
  );

  if (onClick) {
    return (
      <HintTooltip label={label}>
        <button type="button" onClick={onClick} className="inline-flex">
          {content}
        </button>
      </HintTooltip>
    );
  }

  return (
    <HintTooltip label={label}>
      <span className="inline-flex">{content}</span>
    </HintTooltip>
  );
}

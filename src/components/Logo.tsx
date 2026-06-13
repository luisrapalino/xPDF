import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  decorative?: boolean;
  /** Solo el símbolo, sin wordmark. */
  markOnly?: boolean;
}

const heights = {
  sm: 18,
  md: 22,
  lg: 26,
} as const;

const aspect = {
  full: 3.72,
  mark: 0.82,
} as const;

export function Logo({
  className,
  size = 'md',
  decorative = false,
  markOnly = false,
}: LogoProps) {
  const height = heights[size];
  const width = height * (markOnly ? aspect.mark : aspect.full);

  return (
    <svg
      viewBox={markOnly ? '0 0 20 24' : '0 0 96 24'}
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 text-foreground', className)}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'xPDF'}
      role={decorative ? undefined : 'img'}
    >
      <LogoMark />
      {!markOnly && <LogoWordmark />}
    </svg>
  );
}

function LogoMark() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M2.5 1.5h9.5l4 4v15.5a1.5 1.5 0 0 1-1.5 1.5H2.5a1.5 1.5 0 0 1-1.5-1.5V3a1.5 1.5 0 0 1 1.5-1.5Z"
        strokeWidth="1.35"
      />
      <path d="M12 1.5v4h4" strokeWidth="1.35" />
      <path d="M5 11.5h7M5 14.5h5.5" strokeWidth="1.1" opacity="0.32" />
      <path d="M14.25 8.25 17.75 11.75M17.75 8.25 14.25 11.75" strokeWidth="1.35" opacity="0.88" />
    </g>
  );
}

function LogoWordmark() {
  return (
    <text
      x="26"
      y="17.25"
      fill="currentColor"
      fontFamily="'Geist Sans', ui-sans-serif, system-ui, sans-serif"
      fontSize="15.5"
      fontWeight="600"
      letterSpacing="-0.4"
    >
      <tspan fontWeight="500" opacity="0.72">
        x
      </tspan>
      PDF
    </text>
  );
}

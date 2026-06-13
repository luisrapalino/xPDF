import { cn } from '@/lib/utils';

interface BrandLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export function BrandLogo({ src, alt, className }: BrandLogoProps) {
  const webpSrc = src.replace(/\.png$/i, '.webp');

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={cn('object-contain', className)}
      />
    </picture>
  );
}

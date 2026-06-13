import { BrandLogo } from '@/components/BrandLogo';
import { Separator } from '@/components/ui/separator';

export function BrandFooter() {
  return (
    <footer className="shrink-0 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <BrandLogo
          src="/logos/colmedis.png"
          alt="Colmedis Farma S.A.S"
          className="h-8 w-auto max-w-[150px] sm:h-9"
        />
        <Separator orientation="vertical" className="hidden h-8 sm:block" />
        <BrandLogo
          src="/logos/facturacion.png"
          alt="Facturación"
          className="h-11 w-auto max-w-[80px] sm:h-12"
        />
      </div>
    </footer>
  );
}

import type { ReactNode } from 'react';
import { SparkleIcon } from '@/components/site/icons';

/* Badge de encabezado de sección (píldora de vidrio + SparkleIcon), con un
   contorno fino que gira siempre (.spin-border--thin, ver globals.css). */
export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="relative mb-2 inline-flex w-fit items-center gap-2 rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-brand-primary backdrop-blur-md">
      <span className="spin-border spin-border--thin" aria-hidden />
      <SparkleIcon className="h-4 w-4" />
      {children}
    </span>
  );
}

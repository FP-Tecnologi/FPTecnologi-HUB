import type { ReactNode } from 'react';
import { SparkleIcon } from '@/components/site/icons';

/* Badge de encabezado de sección (píldora de vidrio + SparkleIcon), con un
   contorno fino que gira siempre (.spin-border--thin, ver globals.css).
   tone="dark": versión blanca para secciones de fondo oscuro. */
export function SectionBadge({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span
      className={`relative mb-2 inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold uppercase tracking-wide backdrop-blur-md ${
        tone === 'dark' ? 'border-white/20 bg-white/10 text-white' : 'border-brand-primary/20 bg-brand-primary/10 text-brand-700'
      }`}
    >
      <span className="spin-border spin-border--thin" aria-hidden />
      <SparkleIcon className="h-4 w-4" />
      {children}
    </span>
  );
}

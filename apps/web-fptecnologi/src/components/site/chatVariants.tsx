/* Variantes de look del ChatWidget por modelo — separado en un módulo sin
   'use client' para que tanto el widget real (client) como la guía de
   estilos (server) puedan importar los mismos valores/componente reales sin
   problemas de límite cliente/servidor. */

export type HeaderLook = 'mesh' | 'dark' | 'diagonal';

export type Variant = {
  header: HeaderLook;
  panelRadius: string;
  labelClass: string;
  cornerAccent?: boolean;
};

export const VARIANTS: Record<string, Variant> = {
  'modelo-2': { header: 'dark', panelRadius: 'rounded-xl', labelClass: 'text-xs font-bold uppercase tracking-wide' },
  'modelo-3': { header: 'diagonal', panelRadius: 'rounded-2xl', labelClass: 'text-sm font-semibold' },
  'modelo-4': { header: 'mesh', panelRadius: 'rounded-xl', labelClass: 'text-sm font-bold' },
  'modelo-5': { header: 'dark', panelRadius: 'rounded-lg', labelClass: 'font-mono text-xs font-semibold uppercase tracking-wide', cornerAccent: true },
  'modelo-6': { header: 'mesh', panelRadius: 'rounded-[1rem_1rem_1rem_0.375rem]', labelClass: 'text-sm font-semibold' },
};

export const DEFAULT_VARIANT: Variant = { header: 'mesh', panelRadius: 'rounded-2xl', labelClass: 'text-sm font-semibold' };

export function getVariant(pathname: string | null): Variant {
  const seg = pathname?.split('/')[1];
  return (seg && VARIANTS[seg]) || DEFAULT_VARIANT;
}

export function HeaderBg({ look }: { look: HeaderLook }) {
  if (look === 'dark') {
    return (
      <div className="absolute inset-0 bg-brand-primary" aria-hidden>
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand-primary/40 blur-2xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 200 80">
          <defs>
            <pattern id="cw-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1.4" cy="1.4" r="1.1" fill="white" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#cw-dots)" />
        </svg>
      </div>
    );
  }
  if (look === 'diagonal') {
    return (
      <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, var(--color-brand-primary), var(--color-brand-teal-light))' }} aria-hidden>
        <svg className="absolute inset-0 h-full w-full opacity-[0.15]" viewBox="0 0 200 80">
          <defs>
            <pattern id="cw-diag" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#cw-diag)" />
        </svg>
      </div>
    );
  }
  return (
    <div className="brand-mesh absolute inset-0" aria-hidden>
      <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
    </div>
  );
}

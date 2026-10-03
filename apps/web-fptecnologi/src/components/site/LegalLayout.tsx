import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { LEGAL_LINKS } from '@/lib/legal';

/*
 * Cuerpo de las páginas legales: tarjeta blanca con el contenido y, al
 * costado (fijo al bajar), el índice de la página y las otras páginas
 * legales. Mismo lenguaje del sitio: rounded-2xl, sombra azul de marca.
 */
export function LegalLayout({
  actual,
  indice,
  actualizado,
  children,
}: {
  actual: string;
  indice?: { id: string; titulo: string }[];
  actualizado?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-20">
      <aside className="order-2 lg:order-1">
        <div className="space-y-6 lg:sticky lg:top-28">
          {indice && indice.length > 0 && (
            <nav className="rounded-2xl bg-white p-5 shadow-lg shadow-brand-dark/10" aria-label="Contenido de la página">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
                En esta página
                <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
              </p>
              <ol className="mt-4 space-y-2 text-sm">
                {indice.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-2 text-ink/65 transition-colors hover:text-brand-700">
                      <span className="font-semibold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                      {s.titulo}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <nav className="rounded-2xl bg-white p-5 shadow-lg shadow-brand-dark/10" aria-label="Páginas legales">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
              Legales
              <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
            </p>
            <ul className="mt-4 space-y-1.5">
              {LEGAL_LINKS.map((l) => {
                const on = l.href === actual;
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      aria-current={on ? 'page' : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        on ? 'bg-brand-primary text-white shadow-md shadow-brand-dark/25' : 'text-ink/70 hover:bg-paper hover:text-brand-700'
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <article className="order-1 rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 sm:p-10 lg:order-2">
        {actualizado && <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-ink/45">Última actualización: {actualizado}</p>}
        {children}
      </article>
    </section>
  );
}

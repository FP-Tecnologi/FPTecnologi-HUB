import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

type Crumb = { label: string; href: string };

export function PlaceholderPage({
  eyebrow,
  title,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  crumbs: Crumb[];
  children?: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6 py-24">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink/45">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <a href={c.href} className="hover:text-brand-700">
                {c.label}
              </a>
            </span>
          ))}
        </nav>

        <span className="text-sm font-semibold uppercase tracking-wide text-brand-700">{eyebrow}</span>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-dashed border-black/15 bg-white px-5 py-4 text-sm text-ink/60">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-brand-700/60">
            <path d="M12 8v5m0 3h.01M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Página en construcción — este link ya existe en el mapa del sitio, el contenido se completa en la
          siguiente etapa.
        </div>

        {children}

        <a href="/" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          ← Volver al home
        </a>
      </main>
      <Footer />
    </>
  );
}

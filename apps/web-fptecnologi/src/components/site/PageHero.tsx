import type { ReactNode } from 'react';
import { StickyNav } from '@/components/home/StickyNav';
import { Navbar9 } from '@/components/home/Navbar9';
import { SectionBadge } from '@/components/home/SectionBadge';

/*
 * Encabezado de páginas internas (Nosotros, Servicios, Contacto...): mismo
 * marco que el hero de la home y la tienda (tarjeta redondeada sobre paper,
 * Navbar9 invisible que reserva el lugar del encabezado fijo), fondo azul de
 * marca con resplandores o foto con velo oscuro, migas, badge y título en
 * dos tonos (DESIGN.md §2 y §3). `children` = botones u otro contenido.
 */
export function PageHero({
  crumbs,
  badge,
  titulo,
  destacado,
  descripcion,
  imagen,
  children,
}: {
  crumbs: { label: string; href: string }[];
  badge: string;
  titulo: string;
  destacado: string;
  descripcion?: string;
  imagen?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <StickyNav />
      <div className="bg-paper p-3 md:p-5">
        <section className="relative overflow-hidden rounded-[1.25rem] bg-brand-dark text-white md:rounded-[2.25rem]">
          {imagen ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagen} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" />
            </>
          ) : (
            <>
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-primary/40 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-brand-teal/30 blur-3xl" />
            </>
          )}
          <div className="invisible" aria-hidden>
            <Navbar9 />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 md:px-10 md:pb-20">
            <nav aria-label="Migas de pan" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
              {crumbs.map((c, i) => (
                <span key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  {i === crumbs.length - 1 ? (
                    <span className="text-white">{c.label}</span>
                  ) : (
                    <a href={c.href} className="hover:text-white">
                      {c.label}
                    </a>
                  )}
                </span>
              ))}
            </nav>
            <SectionBadge tone="dark">{badge}</SectionBadge>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              <span className="text-white">{titulo}</span> <span className="title-shimmer-dark">{destacado}</span>
            </h1>
            {descripcion && <p className="mt-4 max-w-2xl text-white/75">{descripcion}</p>}
            {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
          </div>
        </section>
      </div>
    </>
  );
}

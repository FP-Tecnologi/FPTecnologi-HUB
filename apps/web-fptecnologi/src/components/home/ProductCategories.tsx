import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';
import Image from 'next/image';
import { ArrowUpRight, Laptop, Monitor, Presentation, Printer, Server, type LucideIcon } from 'lucide-react';
import { TIENDA_CATEGORIES } from '@/lib/content';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

// Fotos propias de esta sección (Unsplash, licencia libre): no se tocan las
// de TIENDA_CATEGORIES porque las usan otros modelos.
const IMAGES: Record<string, string> = {
  monitores: '/images/categorias/monitores.jpg', // unsplash.com/photos/KZnfwqi-B0U
  laptops: '/images/categorias/laptops.jpg', // unsplash.com/photos/1SAnrIxw5OY
  pantallas: '/images/categorias/pantallas-interactivas.jpg', // unsplash.com/photos/L__MBAI3ucc
  'proyectores-pantallas-interactivas': '/images/categorias/pantallas-interactivas.jpg',
  impresion: '/images/modelo9/hero-office.jpg',
  'pantallas-interactivas': '/images/categorias/pantallas-interactivas.jpg',
  servidores: '/images/categorias/servidores.jpg', // unsplash.com/photos/dyUp7WPu5q4
};

const ICONS: Record<string, LucideIcon> = {
  monitores: Monitor,
  laptops: Laptop,
  pantallas: Presentation,
  'proyectores-pantallas-interactivas': Presentation,
  impresion: Printer,
  'pantallas-interactivas': Presentation,
  servidores: Server,
};

/*
 * "Categorías del catálogo" -- las 4 categorías reales de la Tienda
 * (TIENDA_CATEGORIES). Encabezado con el mismo lenguaje que Servicios
 * (SectionBadge + título con brillo + descripción + botón sweep).
 *
 * Tarjeta distinta a la de Servicios a propósito (acá es tienda, no
 * servicio): tarjeta blanca tipo producto, foto arriba con fondo claro,
 * ícono de la categoría y pie con título + flecha. Hover: sube, sombra azul
 * de marca, contorno que gira (.spin-border), zoom de la foto y la flecha
 * pasa a azul principal girando.
 */
export function ProductCategories({ c = HOME_DEFAULTS.categorias }: { c?: Encabezado }) {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <ScrollReveal direction="left">
          <SectionBadge>{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span>{' '}
            <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="right" delayMs={120} className="flex max-w-lg flex-col items-end gap-5">
          <p className="text-justify text-ink/60 hyphens-auto">
            {c.descripcion}
          </p>
          {c.botonTexto && <MoreInfoButton href={c.botonUrl || '/tienda'} label={c.botonTexto} />}
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-5">
        {TIENDA_CATEGORIES.map((c, i) => {
          const Icon = ICONS[c.slug] ?? Monitor;
          return (
            <ScrollReveal key={c.slug} direction="up" delayMs={i * 100}>
              <a
                href={`/tienda/${c.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/30"
              >
                <span className="spin-border" aria-hidden />

                <div className="relative aspect-4/3 overflow-hidden bg-gradient-to-b from-paper to-white">
                  <Image
                    src={IMAGES[c.slug] ?? c.image}
                    alt={c.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-brand-dark text-white shadow-lg shadow-brand-dark/40 transition-colors duration-300 group-hover:bg-brand-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">Categoría</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">{c.title}</h3>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-dark/10 text-brand-dark transition-all duration-300 group-hover:rotate-45 group-hover:bg-brand-primary group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                  </span>
                </div>
              </a>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

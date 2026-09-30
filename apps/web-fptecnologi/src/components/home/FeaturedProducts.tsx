'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { FEATURED_PRODUCTS } from '@/lib/content';
import { ProductCardFinal } from './ProductCardFinal';
import { CompareDock, useCompare } from './CompareDock';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

/*
 * Sección "Productos destacados" de la home final -- mismo wrapper/heading
 * de site2/FeaturedProducts.tsx, pero con la tarjeta definitiva (zoom de
 * imagen, comparar, ver galería) y la tabla comparativa 12.2 con imagen (ver
 * app/guia-estilos-final).
 */
export function FeaturedProducts({ c = HOME_DEFAULTS.productos }: { c?: Encabezado }) {
  // Comparar: estado + panel pegado abajo compartidos con la tienda.
  const compare = useCompare();

  return (
    // Fondo blanco (antes bg-paper celeste), alterna con Categorías.
    <section id="catalogo" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Encabezado igual que Servicios/Categorías: badge + título con
            brillo a la izquierda, descripción + botón sweep a la derecha. */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <ScrollReveal direction="left">
            <SectionBadge>{c.badge}</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">{c.titulo}</span> <span className="title-shimmer-light">{c.destacado}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delayMs={120}>
            {c.botonTexto && <MoreInfoButton href={c.botonUrl || '/tienda'} label={c.botonTexto} />}
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p, i) => (
            <ScrollReveal key={p.sku} direction="up" delayMs={i * 100} className="h-full">
              <ProductCardFinal product={p} compared={compare.skus.includes(p.sku)} onToggleCompare={compare.toggle} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      <CompareDock products={FEATURED_PRODUCTS} compare={compare} />
    </section>
  );
}

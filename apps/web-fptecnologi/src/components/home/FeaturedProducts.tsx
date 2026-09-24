'use client';

import { useState } from 'react';
import { ChevronDown, GitCompareArrows } from 'lucide-react';
import { FEATURED_PRODUCTS } from '@/lib/content';
import { ProductCardFinal } from './ProductCardFinal';
import { ProductComparisonTable } from './ProductComparisonTable';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

const MAX_COMPARE = 4;

/*
 * Sección "Productos destacados" de la home final -- mismo wrapper/heading
 * de site2/FeaturedProducts.tsx, pero con la tarjeta definitiva (zoom de
 * imagen, comparar, ver galería) y la tabla comparativa 12.2 con imagen (ver
 * app/guia-estilos-final).
 */
export function FeaturedProducts() {
  const [compareSkus, setCompareSkus] = useState<string[]>([]);
  // Panel de comparar pegado abajo: se abre solo al marcar el primero y se
  // puede minimizar a una barra.
  const [minimized, setMinimized] = useState(false);

  const toggleCompare = (sku: string) => {
    setMinimized(false);
    setCompareSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : prev.length < MAX_COMPARE ? [...prev, sku] : prev
    );
  };

  const compareProducts = FEATURED_PRODUCTS.filter((p) => compareSkus.includes(p.sku));

  return (
    // Fondo blanco (antes bg-paper celeste), alterna con Categorías.
    <section id="catalogo" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Encabezado igual que Servicios/Categorías: badge + título con
            brillo a la izquierda, descripción + botón sweep a la derecha. */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <ScrollReveal direction="left">
            <SectionBadge>Tienda B2B</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">Los más</span> <span className="title-shimmer-light">vendidos</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delayMs={120}>
            <MoreInfoButton href="/tienda" label="Ver Tienda B2B" />
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p, i) => (
            <ScrollReveal key={p.sku} direction="up" delayMs={i * 100} className="h-full">
              <ProductCardFinal product={p} compared={compareSkus.includes(p.sku)} onToggleCompare={toggleCompare} />
            </ScrollReveal>
          ))}
        </div>

      </div>


      {/* Panel de comparar pegado abajo: un solo paso. Apenas se marca el
          primer producto aparece ya con la tabla comparativa (los lugares
          vacíos dicen "Libre"), y se va completando al marcar más. Se puede
          minimizar a la barra de título o limpiar. */}
      {compareProducts.length > 0 && (
        <div className="animate-pop-in fixed inset-x-0 bottom-24 z-[58] flex justify-center px-4 sm:bottom-5 sm:px-24">
          {/* Minimizado: píldora compacta del ancho de su contenido (como la
              barra de Favoritos); abierto: ancho completo con la tabla. */}
          <div
            className={`overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-brand-dark/30 ${
              minimized ? 'w-auto' : 'w-full max-w-4xl'
            }`}
          >
            {minimized ? (
              // Minimizado: toda la píldora es un botón que abre la tabla
              // (sin "Limpiar", eso queda para la vista abierta).
              <button
                type="button"
                onClick={() => setMinimized(false)}
                aria-label="Mostrar comparación"
                className="flex items-center gap-3 bg-brand-dark px-4 py-2.5 text-white transition-colors hover:bg-brand-primary"
              >
                <GitCompareArrows className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="text-sm font-semibold">
                  Comparar <span className="font-normal text-white/60">({compareProducts.length}/{MAX_COMPARE})</span>
                </span>
                <ChevronDown className="h-5 w-5 rotate-180" strokeWidth={2} />
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-brand-dark px-4 py-2.5 text-white">
                <GitCompareArrows className="h-5 w-5 shrink-0" strokeWidth={2} />
                <p className="flex-1 text-sm font-semibold">
                  Comparar productos{' '}
                  <span className="font-normal text-white/60">
                    ({compareProducts.length}/{MAX_COMPARE})
                  </span>
                </p>
                <button type="button" onClick={() => setCompareSkus([])} className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25">
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  aria-label="Minimizar comparación"
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                >
                  <ChevronDown className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            )}
            {!minimized && (
              <div className="max-h-[55vh] overflow-y-auto">
                <ProductComparisonTable products={compareProducts} slots={MAX_COMPARE} onRemove={toggleCompare} />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
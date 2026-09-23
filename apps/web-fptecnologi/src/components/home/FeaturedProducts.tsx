'use client';

import { useState } from 'react';
import { FEATURED_PRODUCTS } from '@/lib/content';
import { ProductCardFinal } from './ProductCardFinal';
import { ProductComparisonTable } from './ProductComparisonTable';

const MAX_COMPARE = 3;

/*
 * Sección "Productos destacados" de la home final -- mismo wrapper/heading
 * de site2/FeaturedProducts.tsx, pero con la tarjeta definitiva (zoom de
 * imagen, comparar, ver galería) y la tabla comparativa 12.2 con imagen (ver
 * app/guia-estilos-final).
 */
export function FeaturedProducts() {
  const [compareSkus, setCompareSkus] = useState<string[]>([]);

  const toggleCompare = (sku: string) => {
    setCompareSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : prev.length < MAX_COMPARE ? [...prev, sku] : prev
    );
  };

  const compareProducts = FEATURED_PRODUCTS.filter((p) => compareSkus.includes(p.sku));

  return (
    <section id="catalogo" className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Tienda B2B</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Los más vendidos</h2>
          </div>
          <p className="max-w-sm text-sm text-ink/50">
            Marcá &quot;Comparar&quot; en hasta {MAX_COMPARE} productos para verlos lado a lado.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => (
            <ProductCardFinal key={p.sku} product={p} compared={compareSkus.includes(p.sku)} onToggleCompare={toggleCompare} />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <a href="/tienda" className="btn-sweep rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white">
            Ver catálogo completo
          </a>
        </div>

        {compareProducts.length >= 2 && (
          <div className="mt-10">
            <ProductComparisonTable products={compareProducts} />
          </div>
        )}
      </div>
    </section>
  );
}

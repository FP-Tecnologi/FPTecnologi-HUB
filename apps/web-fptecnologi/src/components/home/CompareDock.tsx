'use client';

import { useState } from 'react';
import { ChevronDown, GitCompareArrows } from 'lucide-react';
import type { ShopProduct } from '@/lib/catalog';
import { ProductComparisonTable } from './ProductComparisonTable';

export const MAX_COMPARE = 4;

/* Estado de "comparar": hasta MAX_COMPARE SKUs. `minimized` se reabre solo
   al marcar/desmarcar un producto. Lo usan la home y la tienda. */
export function useCompare() {
  const [skus, setSkus] = useState<string[]>([]);
  const [minimized, setMinimized] = useState(false);
  const toggle = (sku: string) => {
    setMinimized(false);
    setSkus((prev) => (prev.includes(sku) ? prev.filter((s) => s !== sku) : prev.length < MAX_COMPARE ? [...prev, sku] : prev));
  };
  return { skus, toggle, clear: () => setSkus([]), minimized, setMinimized };
}

/*
 * Panel de comparar pegado abajo: aparece apenas hay 1 producto marcado, ya
 * con la tabla (los lugares vacíos dicen "Libre"). Minimizado queda como una
 * píldora que al click vuelve a abrir la tabla.
 */
export function CompareDock({
  products,
  compare,
}: {
  products: readonly ShopProduct[];
  compare: ReturnType<typeof useCompare>;
}) {
  const selected = compare.skus.map((s) => products.find((p) => p.sku === s)).filter((p): p is ShopProduct => !!p);
  if (selected.length === 0) return null;
  const { minimized, setMinimized } = compare;

  return (
    <div className="animate-pop-in fixed inset-x-0 bottom-24 z-[58] flex justify-center px-4 sm:bottom-5 sm:px-24">
      <div
        className={`overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-brand-dark/30 ${
          minimized ? 'w-auto' : 'w-full max-w-4xl'
        }`}
      >
        {minimized ? (
          <button
            type="button"
            onClick={() => setMinimized(false)}
            aria-label="Mostrar comparación"
            className="flex items-center gap-3 bg-brand-primary px-4 py-2.5 text-white transition-colors hover:bg-brand-primary"
          >
            <GitCompareArrows className="h-5 w-5 shrink-0" strokeWidth={2} />
            <span className="text-sm font-semibold">
              Comparar <span className="font-normal text-white/60">({selected.length}/{MAX_COMPARE})</span>
            </span>
            <ChevronDown className="h-5 w-5 rotate-180" strokeWidth={2} />
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-brand-primary px-4 py-2.5 text-white">
            <GitCompareArrows className="h-5 w-5 shrink-0" strokeWidth={2} />
            <p className="flex-1 text-sm font-semibold">
              Comparar productos <span className="font-normal text-white/60">({selected.length}/{MAX_COMPARE})</span>
            </p>
            <button
              type="button"
              onClick={compare.clear}
              className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
            >
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
            <ProductComparisonTable products={selected} slots={MAX_COMPARE} onRemove={compare.toggle} />
          </div>
        )}
      </div>
    </div>
  );
}

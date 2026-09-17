'use client';

import { useState } from 'react';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import { Button } from '@riteflow/components/ui/button';
import { FEATURED_PRODUCTS } from '@/lib/content';
import { useCart } from '@/context/CartContext';

const MAX_COMPARE = 3;

/* "Productos destacados" de Modelo 12 -- mismo dato real y misma lógica
   (CartContext, comparar hasta 3) que site2/FeaturedProducts.tsx, con el
   lenguaje visual de Modelo 12 (SectionBanner + rounded-20/bg-blue/
   border-lineColor/gradient-border, igual que ServicesSection) en vez del
   estilo propio del sitio (rounded-2xl/bg-white/shadow). */
export function ProductsSection() {
  const { addItem, justAddedSku } = useCart();
  const [compareSkus, setCompareSkus] = useState<string[]>([]);

  const toggleCompare = (sku: string) => {
    setCompareSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : prev.length < MAX_COMPARE ? [...prev, sku] : prev
    );
  };

  const compareProducts = FEATURED_PRODUCTS.filter((p) => compareSkus.includes(p.sku));

  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <SectionBanner
            variant="two"
            outlineButtonText="Tienda B2B"
            title="Los más vendidos"
            description={`Marcá "Comparar" en hasta ${MAX_COMPARE} productos para verlos lado a lado.`}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PRODUCTS.map((p) => {
              const discount = Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100);
              const justAdded = justAddedSku === p.sku;
              const inCompare = compareSkus.includes(p.sku);
              return (
                <div
                  key={p.sku}
                  className="group overflow-hidden rounded-20 border border-lineColor/70 bg-blue transition-colors hover:border-primary/60"
                >
                  <div className="relative flex h-44 items-center justify-center bg-white p-4">
                    <span className="badge-button absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold">
                      -{discount}%
                    </span>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="px-5 pt-5 pb-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">{p.brand}</p>
                    <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-base font-medium leading-snug text-offWhite">
                      {p.name}
                    </h3>
                    <div className="my-4 gradient-border h-px w-full" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-offWhite">${p.price.toFixed(2)}</span>
                      <span className="text-sm text-offWhite/40 line-through">${p.priceBefore.toFixed(2)}</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="mt-4"
                      onClick={() => addItem({ sku: p.sku, name: p.name, price: p.price, image: p.image })}
                    >
                      {justAdded ? (
                        <svg viewBox="0 0 24 24" fill="none" className="mr-2 h-4 w-4">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="mr-2 h-4 w-4">
                          <path d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 6v4m-2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                      )}
                      {justAdded ? 'Agregado' : 'Agregar al carrito'}
                    </Button>

                    <label className="mt-3 flex items-center gap-2 text-sm text-offWhite/60">
                      <input
                        type="checkbox"
                        checked={inCompare}
                        disabled={!inCompare && compareSkus.length >= MAX_COMPARE}
                        onChange={() => toggleCompare(p.sku)}
                        className="h-4 w-4 rounded border-lineColor accent-primary"
                      />
                      Comparar
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="outline" href="/tienda">Ver catálogo completo</Button>
          </div>

          {compareProducts.length >= 2 && (
            <div className="mt-8 overflow-x-auto rounded-20 border border-lineColor/70 bg-blue">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-lineColor/70 text-offWhite/50">
                    <th className="p-4 font-medium">Producto</th>
                    {compareProducts.map((p) => (
                      <th key={p.sku} className="p-4 font-medium text-offWhite">{p.brand}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-offWhite/70">
                  <tr className="border-b border-lineColor/70">
                    <td className="p-4 text-offWhite/50">Modelo</td>
                    {compareProducts.map((p) => <td key={p.sku} className="p-4">{p.name}</td>)}
                  </tr>
                  <tr className="border-b border-lineColor/70">
                    <td className="p-4 text-offWhite/50">SKU</td>
                    {compareProducts.map((p) => <td key={p.sku} className="p-4">{p.sku}</td>)}
                  </tr>
                  <tr>
                    <td className="p-4 text-offWhite/50">Precio</td>
                    {compareProducts.map((p) => <td key={p.sku} className="p-4 font-semibold text-offWhite">${p.price.toFixed(2)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

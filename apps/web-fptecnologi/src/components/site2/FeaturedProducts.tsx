'use client';

import { FEATURED_PRODUCTS } from '@/lib/content';
import { useCart } from '@/context/CartContext';

export function FeaturedProducts() {
  const { addItem, justAddedSku } = useCart();

  return (
    <section id="catalogo" className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Tienda B2B</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Los más vendidos</h2>
          </div>
          <a href="/tienda" className="btn-sweep rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white">
            Ver catálogo completo
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => {
            const discount = Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100);
            const justAdded = justAddedSku === p.sku;
            return (
              <div key={p.sku} className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-white p-4">
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white">
                    -{discount}%
                  </span>
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="border-t border-black/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{p.brand}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 text-xs text-ink/40">SKU: {p.sku}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-ink">${p.price.toFixed(2)}</span>
                    <span className="text-sm text-ink/40 line-through">${p.priceBefore.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addItem({ sku: p.sku, name: p.name, price: p.price, image: p.image })}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all ${
                      justAdded ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'btn-glow'
                    }`}
                  >
                    {justAdded ? (
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 6v4m-2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    )}
                    {justAdded ? 'Agregado' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

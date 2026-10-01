'use client';

import { FEATURED_PRODUCTS } from '@/lib/content';
import { useCart } from '@/context/CartContext';

/* "Favoritos del mes" -- mismo carrito real que FeaturedProducts (site2),
   con el tratamiento visual de la referencia (numerado, badge, corazón de
   favoritos decorativo -- no hay wishlist real todavía). */
export function Favorites10() {
  const { addItem, justAddedSku } = useCart();

  return (
    <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Este mes</span>
          <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">Favoritos de nuestros clientes</h2>
        </div>
        <p className="max-w-sm text-sm text-ink/55">Equipos seleccionados por rendimiento, confiabilidad y precio real, listos para despachar.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_PRODUCTS.map((p, i) => {
          const justAdded = justAddedSku === p.sku;
          return (
            <div key={p.sku} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
              {i === 0 && (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white">Top Pick</span>
              )}
              <button type="button" aria-label="Agregar a favoritos" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink/40 shadow-sm transition-colors hover:text-brand-primary">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 20s-7-4.35-9.5-8.5C.5 8 2.5 4.5 6 4.5c2 0 3.5 1 6 3.5 2.5-2.5 4-3.5 6-3.5 3.5 0 5.5 3.5 3.5 7C19 15.65 12 20 12 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              </button>

              <div className="relative flex h-48 items-center justify-center bg-white p-4">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute bottom-3 right-3 text-xs font-semibold text-ink/25">{String(i + 1).padStart(2, '0')}</span>
              </div>

              <div className="border-t border-black/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{p.brand}</p>
                <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-ink">${p.price.toFixed(2)}</span>
                  <span className="text-xs text-ink/40 line-through">${p.priceBefore.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => addItem({ sku: p.sku, name: p.name, price: p.price, image: p.image })}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all ${justAdded ? 'bg-emerald-500' : 'bg-ink hover:bg-brand-primary'}`}
                >
                  {justAdded ? 'Agregado' : 'Añadir al carrito'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <a href="/tienda" className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-black/5">
          Ver todos los productos
        </a>
      </div>
    </section>
  );
}

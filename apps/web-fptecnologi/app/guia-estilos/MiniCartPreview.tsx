'use client';

import { useState } from 'react';

type Item = { sku: string; name: string; brand: string; price: number; image: string; qty: number };

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
    <path
      d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Propuesta de panel de carrito tipo tarjeta — estructura adaptada del
 * ejemplo que pasó el usuario (ShoppingCartCard), con datos reales de
 * FEATURED_PRODUCTS. Distinto del dropdown real (CartButton.tsx): acá el
 * stepper de cantidad es interactivo (+/−) y cada línea tiene su propio
 * subtotal, cosa que el carrito real hoy no tiene. */
export function MiniCartPreview({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);

  function setQty(sku: string, qty: number) {
    setItems((prev) => prev.map((it) => (it.sku === sku ? { ...it, qty: Math.max(1, qty) } : it)));
  }
  function remove(sku: string) {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal >= 300 ? 0 : 15;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-6 shadow-lg shadow-black/5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CartIcon />
          <h3 className="font-display text-base font-bold text-ink">Carrito</h3>
        </div>
        <span className="text-xs font-medium text-ink/45">{items.length} productos</span>
      </div>

      <div className="mb-5 flex max-h-72 flex-col gap-4 overflow-y-auto">
        {items.length === 0 && <p className="py-6 text-center text-sm text-ink/45">Vacío — se sacaron todos los productos.</p>}
        {items.map((item) => (
          <div key={item.sku} className="flex gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-primary/6">
              <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
              <p className="mt-0.5 text-xs text-ink/45">{item.brand}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQty(item.sku, item.qty - 1)}
                    aria-label="Restar"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-paper text-ink/70 transition-colors hover:bg-black/10"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-ink">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.sku, item.qty + 1)}
                    aria-label="Sumar"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-paper text-ink/70 transition-colors hover:bg-black/10"
                  >
                    <PlusIcon />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">${(item.price * item.qty).toFixed(2)}</span>
                  <button type="button" onClick={() => remove(item.sku)} aria-label={`Quitar ${item.name}`} className="text-red-400 transition-colors hover:text-red-500">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 space-y-2 border-t border-black/5 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink/55">Subtotal</span>
          <span className="font-medium text-ink">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/55">Envío</span>
          <span className="font-medium text-ink">{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/55">IGV (18%)</span>
          <span className="font-medium text-ink">${tax.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-black/5 pt-2">
          <span className="font-bold text-ink">Total</span>
          <span className="text-lg font-bold text-brand-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <button type="button" className="btn-glow w-full rounded-xl py-3 text-sm font-semibold text-white">
        Ir al checkout
      </button>
    </div>
  );
}

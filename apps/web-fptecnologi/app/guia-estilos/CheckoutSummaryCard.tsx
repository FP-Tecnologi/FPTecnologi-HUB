'use client';

import { useState } from 'react';

type Item = { sku: string; name: string; price: number; image: string; qty: number };

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
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
    <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/** Propuesta 2 de resumen de carrito — adaptada del ejemplo que pasó el
 * usuario (CheckoutCard): encabezado con ícono en chip circular oscuro,
 * steppers redondos, línea de descuento, y botón de checkout oscuro (no
 * azul de marca) en vez del glow — un tono más "premium/neutro" que el
 * resto del sitio. */
export function CheckoutSummaryCard({ initialItems, discount = 0 }: { initialItems: Item[]; discount?: number }) {
  const [items, setItems] = useState(initialItems);

  function setQty(sku: string, qty: number) {
    setItems((prev) => prev.map((it) => (it.sku === sku ? { ...it, qty: Math.max(1, qty) } : it)));
  }
  function remove(sku: string) {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal > 0 && subtotal < 300 ? 15 : 0;
  const tax = subtotal * 0.18;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  return (
    <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-6 shadow-lg shadow-black/5">
      <div className="mb-5 flex items-center gap-3 border-b border-black/10 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink">
          <BagIcon />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Tu carrito</h3>
          <p className="text-sm text-ink/45">{items.length} productos</p>
        </div>
      </div>

      <div className="mb-2 flex flex-col gap-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.sku} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
              <p className="text-xs text-ink/45">${item.price.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQty(item.sku, item.qty - 1)}
                aria-label="Restar"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-ink/60 transition-colors hover:bg-black/10"
              >
                <MinusIcon />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-ink">{item.qty}</span>
              <button
                type="button"
                onClick={() => setQty(item.sku, item.qty + 1)}
                aria-label="Sumar"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-ink/60 transition-colors hover:bg-black/10"
              >
                <PlusIcon />
              </button>
            </div>
            <button type="button" onClick={() => remove(item.sku)} aria-label={`Quitar ${item.name}`} className="text-ink/30 transition-colors hover:text-red-500">
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-black/10 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink/55">Subtotal</span>
          <span className="font-semibold text-ink">${subtotal.toFixed(2)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between">
            <span className="text-ink/55">Envío</span>
            <span className="font-semibold text-ink">${shipping.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-ink/55">IGV</span>
          <span className="font-semibold text-ink">${tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-emerald-600">Descuento</span>
            <span className="font-semibold text-emerald-600">-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-black/10 pt-4">
        <span className="text-lg font-bold text-ink">Total</span>
        <span className="text-2xl font-bold text-ink">${total.toFixed(2)}</span>
      </div>

      <button type="button" className="w-full rounded-2xl bg-ink py-4 text-sm font-medium text-white transition-colors hover:bg-black">
        Ir al checkout
      </button>
    </div>
  );
}

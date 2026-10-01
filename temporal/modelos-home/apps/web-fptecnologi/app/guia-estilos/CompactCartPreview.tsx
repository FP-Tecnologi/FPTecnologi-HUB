'use client';

import { useState } from 'react';

type Item = { sku: string; name: string; brand: string; price: number; qty: number };

/** Propuesta 4 de carrito — minimalista/densa, sin foto de producto, pensada
 * para un dropdown chico donde el espacio importa: solo texto, stepper en
 * línea (− N +) en vez de pastillas con fondo, divisores finos, y un botón
 * de checkout solo-borde en vez de relleno — para no competir visualmente
 * con nada alrededor. */
export function CompactCartPreview({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);

  function setQty(sku: string, qty: number) {
    setItems((prev) => prev.map((it) => (it.sku === sku ? { ...it, qty: Math.max(1, qty) } : it)));
  }
  function remove(sku: string) {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="w-full max-w-xs rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-3">
        <h3 className="text-sm font-semibold text-ink">Carrito ({items.length})</h3>
        <button type="button" onClick={() => setItems([])} className="text-xs font-medium text-ink/40 hover:text-red-500">
          Vaciar
        </button>
      </div>

      <div className="flex flex-col">
        {items.length === 0 && <p className="py-4 text-center text-xs text-ink/40">Sin productos.</p>}
        {items.map((item, i) => (
          <div key={item.sku} className={`flex items-center gap-2 py-2.5 text-xs ${i > 0 ? 'border-t border-black/5' : ''}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{item.name}</p>
              <p className="text-ink/40">{item.brand}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 font-mono text-ink/60">
              <button type="button" onClick={() => setQty(item.sku, item.qty - 1)} aria-label="Restar" className="px-1 hover:text-ink">
                −
              </button>
              <span className="w-3 text-center text-ink">{item.qty}</span>
              <button type="button" onClick={() => setQty(item.sku, item.qty + 1)} aria-label="Sumar" className="px-1 hover:text-ink">
                +
              </button>
            </div>
            <span className="w-14 shrink-0 text-right font-mono font-semibold text-ink">${(item.price * item.qty).toFixed(0)}</span>
            <button type="button" onClick={() => remove(item.sku)} aria-label={`Quitar ${item.name}`} className="shrink-0 text-ink/25 hover:text-red-500">
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 text-sm">
        <span className="text-ink/55">Subtotal</span>
        <span className="font-mono font-bold text-ink">${subtotal.toFixed(2)}</span>
      </div>

      <button type="button" className="mt-3 w-full rounded-lg border border-ink/15 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-black/5">
        Ir al checkout
      </button>
    </div>
  );
}

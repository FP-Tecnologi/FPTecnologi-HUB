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

/** Propuesta 3 de carrito — vidrio esmerilado, reusando tal cual las clases
 * reales .glass-panel/.glass-card (oscuro) o .glass-panel-light/.glass-card-light
 * (claro, mismo ADN Vireo/Aurora pero blanco translúcido) del widget de chat
 * y la tarjeta 5.2/5.3. La oscura no necesita fondo de color detrás — su
 * propio fondo ya es casi opaco. La clara SÍ lo necesita (ej. .brand-mesh),
 * igual que 5.2, o el contraste desaparece sobre blanco liso. */
export function GlassCartPreview({ initialItems, light = false }: { initialItems: Item[]; light?: boolean }) {
  const [items, setItems] = useState(initialItems);

  function setQty(sku: string, qty: number) {
    setItems((prev) => prev.map((it) => (it.sku === sku ? { ...it, qty: Math.max(1, qty) } : it)));
  }
  function remove(sku: string) {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const t = light
    ? {
        panel: 'glass-panel-light text-ink',
        card: 'glass-card-light',
        thumb: 'bg-ink/5',
        name: 'text-ink/90',
        price: 'text-ink/50',
        stepBtn: 'bg-ink/5 text-ink/60 hover:bg-ink/10',
        stepCount: 'text-ink/80',
        remove: 'text-ink/30 hover:bg-ink/10 hover:text-ink/70',
        divider: 'border-ink/10',
        subtotalLabel: 'text-ink/60',
        subtotalValue: 'text-ink',
      }
    : {
        panel: 'glass-panel text-white',
        card: 'glass-card',
        thumb: 'bg-white/10',
        name: 'text-white/90',
        price: 'text-white/45',
        stepBtn: 'bg-white/10 text-white/70 hover:bg-white/20',
        stepCount: 'text-white/80',
        remove: 'text-white/30 hover:bg-white/10 hover:text-white/70',
        divider: 'border-white/10',
        subtotalLabel: 'text-white/60',
        subtotalValue: 'text-white',
      };

  return (
    <div className={`${t.panel} w-full max-w-sm rounded-3xl p-6`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CartIcon />
          <h3 className="font-display text-base font-bold">Carrito</h3>
        </div>
        <span className={`text-xs ${t.price}`}>{items.length} productos</span>
      </div>

      <div className="mb-5 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {items.length === 0 && <p className={`py-6 text-center text-sm ${t.price}`}>Vacío.</p>}
        {items.map((item) => (
          <div key={item.sku} className={`${t.card} flex items-center gap-3 rounded-2xl p-3 transition-colors`}>
            <div className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg ${t.thumb}`}>
              <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${t.name}`}>{item.name}</p>
              <p className={`mt-0.5 font-mono text-xs ${t.price}`}>${(item.price * item.qty).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setQty(item.sku, item.qty - 1)} aria-label="Restar" className={`flex h-6 w-6 items-center justify-center rounded-full ${t.stepBtn}`}>
                <MinusIcon />
              </button>
              <span className={`w-4 text-center text-xs ${t.stepCount}`}>{item.qty}</span>
              <button type="button" onClick={() => setQty(item.sku, item.qty + 1)} aria-label="Sumar" className={`flex h-6 w-6 items-center justify-center rounded-full ${t.stepBtn}`}>
                <PlusIcon />
              </button>
            </div>
            <button type="button" onClick={() => remove(item.sku)} aria-label={`Quitar ${item.name}`} className={`ml-1 flex h-6 w-6 items-center justify-center rounded-full ${t.remove}`}>
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className={`mb-4 flex items-center justify-between border-t ${t.divider} pt-4`}>
        <span className={`text-sm ${t.subtotalLabel}`}>Subtotal</span>
        <span className={`font-mono text-lg font-bold ${t.subtotalValue}`}>${subtotal.toFixed(2)}</span>
      </div>

      <button type="button" className="btn-glow w-full rounded-full py-3 text-sm font-semibold text-white">
        Ir al checkout
      </button>
    </div>
  );
}

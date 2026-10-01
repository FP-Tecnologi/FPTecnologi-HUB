'use client';

import { useEffect, useRef, useState } from 'react';

type Item = { sku: string; name: string; price: number; image: string; qty: number };

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

/** Propuesta de dropdown de header — a diferencia del real (CartButton.tsx,
 * cantidad fija, solo agregar/quitar), este SÍ tiene stepper de cantidad
 * por línea. Misma mecánica de trigger+dropdown+cierre-al-hacer-clic-afuera
 * que el real, para que se sienta como el mismo tipo de componente, no una
 * tarjeta suelta. */
export function HeaderCartDropdownA({ initialItems }: { initialItems: Item[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function setQty(sku: string, qty: number) {
    setItems((prev) => prev.map((it) => (it.sku === sku ? { ...it, qty: Math.max(1, qty) } : it)));
  }

  const count = items.reduce((s, it) => s + it.qty, 0);
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Carrito, ${count} productos`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink transition-colors hover:border-brand-primary hover:text-brand-primary"
      >
        <CartIcon />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">{count}</span>
        )}
      </button>

      {open && (
        <div className="animate-pop-in absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-black/5 bg-white p-3 shadow-2xl shadow-black/15">
          <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
            {items.map((item) => (
              <div key={item.sku} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-black/[0.03]">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-primary/6">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <button type="button" onClick={() => setQty(item.sku, item.qty - 1)} aria-label="Restar" className="flex h-5 w-5 items-center justify-center rounded-md bg-paper text-[10px] text-ink/60 hover:bg-black/10">
                      −
                    </button>
                    <span className="w-4 text-center text-[11px] text-ink/70">{item.qty}</span>
                    <button type="button" onClick={() => setQty(item.sku, item.qty + 1)} aria-label="Sumar" className="flex h-5 w-5 items-center justify-center rounded-md bg-paper text-[10px] text-ink/60 hover:bg-black/10">
                      +
                    </button>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-ink">${(item.price * item.qty).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
            <span className="text-ink/60">Subtotal</span>
            <span className="font-semibold text-ink">${subtotal.toFixed(2)}</span>
          </div>
          <button type="button" className="btn-glow mt-3 w-full rounded-full py-2.5 text-sm font-semibold text-white">
            Ver carrito
          </button>
        </div>
      )}
    </div>
  );
}

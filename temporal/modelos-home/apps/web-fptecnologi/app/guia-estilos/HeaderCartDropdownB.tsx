'use client';

import { useEffect, useRef, useState } from 'react';

type Item = { sku: string; name: string; price: number; qty: number };

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

/** Segunda propuesta de dropdown de header — minimalista, sin foto,
 * lista de texto densa (mismo espíritu que 11.6 pero como dropdown real
 * colgando del ícono, no una tarjeta suelta). Ícono del trigger cuadrado
 * en vez de círculo, a tono con la propuesta de forma de 9.1. */
export function HeaderCartDropdownB({ initialItems }: { initialItems: Item[] }) {
  const [open, setOpen] = useState(false);
  const [items] = useState(initialItems);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const count = items.reduce((s, it) => s + it.qty, 0);
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Carrito, ${count} productos`}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-ink transition-colors hover:border-brand-primary hover:text-brand-primary"
      >
        <CartIcon />
        {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-white">{count}</span>}
      </button>

      {open && (
        <div className="animate-pop-in absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-black/10 bg-white py-1 shadow-xl shadow-black/10">
          {items.map((item, i) => (
            <div key={item.sku} className={`flex items-center justify-between gap-3 px-3 py-2 text-xs ${i > 0 ? 'border-t border-black/5' : ''}`}>
              <span className="truncate text-ink/80">
                {item.qty}× {item.name}
              </span>
              <span className="shrink-0 font-mono font-semibold text-ink">${(item.price * item.qty).toFixed(0)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-black/10 px-3 py-2.5 text-xs font-semibold">
            <span className="text-ink/60">Total</span>
            <span className="font-mono text-ink">${subtotal.toFixed(2)}</span>
          </div>
          <a href="/carrito" className="block px-3 py-2 text-center text-xs font-semibold text-brand-primary hover:bg-black/[0.03]">
            Ver carrito →
          </a>
        </div>
      )}
    </div>
  );
}

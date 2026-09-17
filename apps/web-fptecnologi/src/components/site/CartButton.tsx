'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

type Tone = 'light' | 'dark';

const TONE = {
  light: 'border-black/10 text-ink hover:border-brand-primary hover:text-brand-primary',
  dark: 'border-white/25 text-white hover:border-white hover:bg-white/5',
} as const;

export function CartButton({ tone = 'light' }: { tone?: Tone }) {
  const { items, count, subtotal, removeItem, justAddedSku } = useCart();
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!justAddedSku) return;
    setOpen(true);
    setBump(true);
    const t = window.setTimeout(() => setBump(false), 350);
    return () => window.clearTimeout(t);
  }, [justAddedSku]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Carrito, ${count} producto${count === 1 ? '' : 's'}`}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${TONE[tone]}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path
            d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {count > 0 && (
          <span className={`absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white transition-transform ${bump ? 'scale-125' : 'scale-100'}`}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-black/5 bg-white p-4 text-ink shadow-2xl shadow-black/15">
          <p className="text-sm font-semibold">Carrito {count > 0 && `(${count})`}</p>

          {items.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">Todavía no agregaste productos.</p>
          ) : (
            <>
              <ul className="mt-3 flex max-h-72 flex-col gap-3 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.sku} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg border border-black/5 object-contain p-1" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink/50">
                        {item.qty} × {format(item.price)}
                      </p>
                    </div>
                    <button type="button" onClick={() => removeItem(item.sku)} aria-label={`Quitar ${item.name}`} className="text-ink/30 hover:text-red-500">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
                <span className="text-ink/60">Subtotal</span>
                <span className="font-semibold">{format(subtotal)}</span>
              </div>

              <a href="/carrito" onClick={() => setOpen(false)} className="btn-glow mt-3 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Ver carrito
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

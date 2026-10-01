'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CartPanel } from './CartPanel';

type Tone = 'light' | 'dark';

const TONE = {
  light: 'border-black/10 text-ink hover:border-brand-primary hover:text-brand-primary',
  dark: 'border-white/25 text-white hover:border-white hover:bg-white/5',
} as const;

/**
 * Ícono del carrito final -- cuadrado minimalista (antes círculo) con el
 * badge contador azul pequeño superpuesto, según la propuesta elegida.
 */
export function CartButton({ tone = 'light' }: { tone?: Tone }) {
  const { count, justAddedSku } = useCart();
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
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${TONE[tone]}`}
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
          <span className={`absolute -right-1.5 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white transition-transform ${bump ? 'scale-125' : 'scale-100'}`}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-black/5 bg-white p-4 text-ink shadow-2xl shadow-black/15">
          <p className="mb-3 text-sm font-semibold">Carrito {count > 0 && `(${count})`}</p>
          <CartPanel onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartPanel } from './CartPanel';

type Tone = 'light' | 'dark';

const TONE = {
  light: 'border-black/10 text-ink hover:border-brand-primary hover:text-brand-700',
  dark: 'border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/20',
} as const;

/**
 * Ícono del carrito final -- cuadrado minimalista (antes círculo) con el
 * badge contador azul pequeño superpuesto, según la propuesta elegida.
 */
export function CartButton({ tone = 'light', compact = false }: { tone?: Tone; compact?: boolean }) {
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
        className={`relative flex items-center justify-center rounded-lg border transition-colors ${compact ? 'h-9 w-9' : 'h-10 w-10 lg:h-11 lg:w-11 2xl:h-12 2xl:w-12'} ${TONE[tone]}`}
      >
        <ShoppingCart className={`h-4.5 w-4.5 ${tone === 'dark' ? 'text-white' : ''}`} strokeWidth={tone === 'dark' ? 2.2 : 1.8} />
        {count > 0 && (
          <span className={`absolute -right-1.5 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold transition-transform ${tone === 'dark' ? 'bg-white text-brand-700 shadow-sm shadow-black/25' : 'bg-brand-primary text-white'} ${bump ? 'scale-125' : 'scale-100'}`}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-black/5 bg-white p-4 text-ink shadow-2xl shadow-brand-dark/20">
          <p className="mb-3 text-sm font-semibold">Carrito {count > 0 && `(${count})`}</p>
          <CartPanel onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

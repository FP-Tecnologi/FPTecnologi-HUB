'use client';

import { useCurrency } from '@/context/CurrencyContext';

type Tone = 'light' | 'dark';

const TONE = {
  light: 'border-black/10 text-ink hover:border-brand-primary hover:text-brand-primary',
  dark: 'border-white/25 text-white hover:border-white hover:bg-white/5',
} as const;

/*
 * Selector de moneda del header -- cambia CurrencyContext (persistido en
 * localStorage), que es lo que leen los carritos (CartButton, /carrito)
 * para mostrar el monto convertido. Tasa de cambio de referencia, no una
 * API en vivo (ver CurrencyContext.tsx).
 */
export function CurrencyToggle({ tone = 'light' }: { tone?: Tone }) {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      aria-label="Cambiar moneda"
      title="Cambiar moneda (USD / PEN)"
      className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${TONE[tone]}`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">
        {currency === 'USD' ? '$' : 'S/'}
      </span>
      {currency}
    </button>
  );
}

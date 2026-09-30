'use client';

import { useCurrency } from '@/context/CurrencyContext';

/*
 * Selector de moneda tipo interruptor: dólares a la izquierda y soles a la
 * derecha; el indicador se desliza hasta la moneda activa -- azul de marca
 * con USD, ámbar con PEN (alusión a la moneda de oro). Vidrio claro para
 * verse bien sobre el encabezado oscuro; `tone="light"` lo adapta a
 * encabezados blancos.
 */
export function CurrencyToggle({ tone = 'dark', className = 'h-10' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { currency, toggleCurrency } = useCurrency();
  const isUsd = currency === 'USD';
  const light = tone === 'light';

  const label = (activo: boolean) =>
    `relative z-10 flex flex-1 items-center justify-center gap-1 whitespace-nowrap px-2 text-xs font-bold transition-colors duration-300 ${
      activo ? 'text-white' : light ? 'text-ink/50' : 'text-white/60'
    }`;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isUsd}
      onClick={toggleCurrency}
      aria-label={`Moneda: ${isUsd ? 'dólares' : 'soles'}. Cambiar a ${isUsd ? 'soles' : 'dólares'}`}
      title="Cambiar moneda (USD / PEN)"
      className={`relative flex w-[8.75rem] shrink-0 items-stretch rounded-xl border p-1 backdrop-blur-md transition-colors ${className} ${
        light ? 'border-brand-dark/15 bg-paper' : 'border-white/20 bg-white/10 hover:bg-white/15'
      }`}
    >
      {/* Indicador que se desliza. */}
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-out ${
          isUsd ? 'translate-x-0 bg-brand-dark shadow-brand-dark/40' : 'translate-x-full bg-amber-500 shadow-amber-500/40'
        }`}
      />
      <span className={label(isUsd)}>$ USD</span>
      <span className={label(!isUsd)}>S/ PEN</span>
    </button>
  );
}

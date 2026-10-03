'use client';

import { useCurrency } from '@/context/CurrencyContext';

/*
 * Selector de moneda tipo interruptor: dólares a la izquierda y soles a la
 * derecha; el indicador se desliza hasta la moneda activa -- azul de marca
 * con USD, ámbar con PEN. Cada lado lleva su símbolo en una ficha de vidrio.
 * Vidrio claro para el encabezado oscuro; `tone="light"` para encabezados blancos.
 */
/* Símbolo de la moneda en una ficha de vidrio sutil: lo que resalta es el
   símbolo ($ / S/), no la ficha. */
function Moneda({ tipo, activa, light }: { tipo: 'USD' | 'PEN'; activa: boolean; light: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border px-1 text-[13px] font-extrabold leading-none backdrop-blur-sm transition-all duration-300 ${
        activa
          ? 'border-white/35 bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)]'
          : light
            ? 'border-brand-dark/10 bg-white/60 text-ink/65'
            : 'border-white/15 bg-white/5 text-white/80'
      }`}
    >
      {tipo === 'PEN' ? 'S/' : '$'}
    </span>
  );
}

export function CurrencyToggle({ tone = 'dark', className = 'h-10' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { currency, toggleCurrency } = useCurrency();
  const isUsd = currency === 'USD';
  const light = tone === 'light';

  const label = (activo: boolean) =>
    `relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-1.5 text-xs font-bold transition-colors duration-300 ${
      activo ? 'text-white' : light ? 'text-ink/65' : 'text-white/80'
    }`;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isUsd}
      onClick={toggleCurrency}
      aria-label={`Moneda: ${isUsd ? 'dólares' : 'soles'}. Cambiar a ${isUsd ? 'soles' : 'dólares'}`}
      title="Cambiar moneda (USD / PEN)"
      className={`relative flex w-[9.5rem] shrink-0 items-stretch rounded-xl border p-1 backdrop-blur-md transition-colors ${className} ${
        light ? 'border-brand-dark/15 bg-paper' : 'border-white/20 bg-white/10 hover:bg-white/15'
      }`}
    >
      {/* Indicador que se desliza. */}
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-out ${
          isUsd ? 'translate-x-0 bg-brand-primary shadow-brand-dark/40' : 'translate-x-full bg-amber-500 shadow-amber-500/40'
        }`}
      />
      <span className={label(isUsd)}>
        <Moneda tipo="USD" activa={isUsd} light={light} />
        USD
      </span>
      <span className={label(!isUsd)}>
        <Moneda tipo="PEN" activa={!isUsd} light={light} />
        PEN
      </span>
    </button>
  );
}

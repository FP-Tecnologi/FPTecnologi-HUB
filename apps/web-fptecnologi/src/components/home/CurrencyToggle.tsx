'use client';

import { useCurrency } from '@/context/CurrencyContext';

/*
 * Selector de moneda tipo interruptor: dólares a la izquierda y soles a la
 * derecha; el indicador se desliza hasta la moneda activa -- azul de marca
 * con USD, ámbar con PEN. Cada lado lleva una "moneda" (disco metálico con
 * canto y símbolo en relieve): plateada para el dólar, dorada para el sol.
 * Vidrio claro para el encabezado oscuro; `tone="light"` para encabezados blancos.
 */
function Moneda({ tipo, activa }: { tipo: 'USD' | 'PEN'; activa: boolean }) {
  const oro = tipo === 'PEN';
  return (
    <span
      aria-hidden
      className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black leading-none transition-transform duration-300 ${
        activa ? 'scale-110' : 'scale-95 opacity-70'
      }`}
      style={{
        background: oro
          ? 'radial-gradient(circle at 32% 28%, #fff3c4 0%, #f7c948 38%, #d99a06 72%, #a86f00 100%)'
          : 'radial-gradient(circle at 32% 28%, #ffffff 0%, #e3e9ee 40%, #a9b6c2 75%, #7d8b98 100%)',
        boxShadow: activa ? '0 2px 6px rgba(0,0,0,.35), inset 0 -1px 1px rgba(0,0,0,.25)' : 'inset 0 -1px 1px rgba(0,0,0,.2)',
        color: oro ? '#7a4d00' : '#3d4a56',
        textShadow: '0 1px 0 rgba(255,255,255,.6)',
      }}
    >
      {/* Canto de la moneda. */}
      <span className="absolute inset-[2px] rounded-full border" style={{ borderColor: oro ? 'rgba(122,77,0,.35)' : 'rgba(61,74,86,.3)' }} />
      <span className="relative">{oro ? 'S/' : '$'}</span>
    </span>
  );
}

export function CurrencyToggle({ tone = 'dark', className = 'h-10' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { currency, toggleCurrency } = useCurrency();
  const isUsd = currency === 'USD';
  const light = tone === 'light';

  const label = (activo: boolean) =>
    `relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-1.5 text-xs font-bold transition-colors duration-300 ${
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
      className={`relative flex w-[9.5rem] shrink-0 items-stretch rounded-xl border p-1 backdrop-blur-md transition-colors ${className} ${
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
      <span className={label(isUsd)}>
        <Moneda tipo="USD" activa={isUsd} />
        USD
      </span>
      <span className={label(!isUsd)}>
        <Moneda tipo="PEN" activa={!isUsd} />
        PEN
      </span>
    </button>
  );
}

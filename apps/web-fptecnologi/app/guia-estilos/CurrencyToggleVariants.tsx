'use client';

import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

/*
 * Variantes del selector de moneda para la guía de estilos (#moneda) --
 * todas usan el mismo useCurrency() real del header (CurrencyContext), así
 * que tocar cualquiera cambia las demás también: no son mockups separados,
 * es el mismo estado. Lo único que cambia es el envoltorio visual.
 */

/* 1. Sólido con color por moneda -- USD azul de marca, PEN dorado (alusión
   al sol/moneda de oro), en vez del outline neutro que ya está en el header. */
export function CurrencyToggleSolid() {
  const { currency, toggleCurrency } = useCurrency();
  const isUsd = currency === 'USD';

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      aria-label="Cambiar moneda"
      className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white shadow-sm transition-colors ${
        isUsd ? 'bg-brand-primary shadow-brand-primary/30' : 'bg-amber-500 shadow-amber-500/30'
      }`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] leading-none">
        {isUsd ? '$' : 'S/'}
      </span>
      {currency}
    </button>
  );
}

/* 2. Switch segmentado -- las 2 opciones siempre visibles lado a lado, un
   fondo (thumb) se desliza entre ellas. Más explícito que un solo botón que
   alterna: se ve de entrada que hay 2 estados posibles. */
export function CurrencyToggleSwitch() {
  const { currency, setCurrency } = useCurrency();
  const isUsd = currency === 'USD';

  return (
    <div className="relative flex h-10 w-[132px] rounded-full border border-black/10 bg-paper p-1">
      <span
        className={`absolute top-1 h-8 w-[60px] rounded-full bg-brand-primary shadow-sm transition-transform duration-300 ease-out ${
          isUsd ? 'translate-x-0' : 'translate-x-[60px]'
        }`}
      />
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`relative z-10 flex-1 text-xs font-bold transition-colors ${isUsd ? 'text-white' : 'text-ink/50'}`}
      >
        USD
      </button>
      <button
        type="button"
        onClick={() => setCurrency('PEN')}
        className={`relative z-10 flex-1 text-xs font-bold transition-colors ${!isUsd ? 'text-white' : 'text-ink/50'}`}
      >
        PEN
      </button>
    </div>
  );
}

/* 3. Salto (bump) al cambiar -- mismo diseño que ya está en el header, con
   el mismo `bump` de escala que ya usa el badge del carrito al agregar un
   producto (CartButton.tsx), para que el cambio de moneda se sienta, no
   solo se lea. */
export function CurrencyToggleBump() {
  const { currency, toggleCurrency } = useCurrency();
  const [bump, setBump] = useState(false);

  const handleClick = () => {
    toggleCurrency();
    setBump(true);
    window.setTimeout(() => setBump(false), 300);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Cambiar moneda"
      className={`flex h-10 items-center gap-1.5 rounded-full border border-black/10 px-3 text-xs font-semibold text-ink transition-transform hover:border-brand-primary hover:text-brand-primary ${
        bump ? 'scale-110' : 'scale-100'
      }`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">
        {currency === 'USD' ? '$' : 'S/'}
      </span>
      {currency}
    </button>
  );
}

/* 4. Moneda al aire -- el símbolo gira 360° (rotateY, `animate-coin-flip`
   en app/globals.css) cada vez que cambia, como una moneda real al voltear.
   El `key={currency}` fuerza a React a re-montar el ícono en cada cambio,
   así la animación se dispara de nuevo (si no, un `key` fijo solo la
   correría la primera vez). */
export function CurrencyToggleCoinFlip() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      aria-label="Cambiar moneda"
      className="flex h-10 items-center gap-2 rounded-full border border-black/10 px-3 text-sm font-semibold text-ink transition-colors hover:border-brand-primary hover:text-brand-primary"
    >
      <span
        key={currency}
        className="animate-coin-flip flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-[11px] font-bold text-white"
      >
        {currency === 'USD' ? '$' : 'S'}
      </span>
      {currency}
    </button>
  );
}

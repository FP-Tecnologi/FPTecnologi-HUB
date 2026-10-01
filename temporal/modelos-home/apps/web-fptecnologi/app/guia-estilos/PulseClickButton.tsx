'use client';

import { useState, type ReactNode } from 'react';

/** Pulso al clic — mismo patrón real que usa el badge del carrito
 * (CartButton.tsx: `bump` a `scale-125` por 350ms al agregar un producto),
 * generalizado acá a todo el botón como feedback táctil de "acción
 * registrada". `className` trae todo el estilo visual, para reusarlo en
 * botones primario/secundario/texto. */
export function PulseClickButton({ children, className = 'btn-glow rounded-full px-6 py-3 text-sm font-semibold text-white' }: { children: ReactNode; className?: string }) {
  const [bump, setBump] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setBump(true);
        window.setTimeout(() => setBump(false), 350);
      }}
      className={`flex w-fit items-center gap-2 transition-transform duration-200 ${bump ? 'scale-110' : 'scale-100'} ${className}`}
    >
      {children}
    </button>
  );
}

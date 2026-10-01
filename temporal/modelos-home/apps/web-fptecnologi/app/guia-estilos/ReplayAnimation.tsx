'use client';

import { useState, type ReactNode } from 'react';

/** Las animaciones de "entrada" (fade-up, pop-in) solo se disparan una vez,
 * al montar el elemento — no son loops. Para poder verlas de nuevo en la
 * guía sin recargar la página, se remonta el hijo dentro de un `div` con
 * `key` distinto en cada clic (React trata el subárbol como nodos nuevos y
 * las animaciones CSS vuelven a correr desde el principio). No se puede
 * pasar una función como children desde un Server Component — por eso
 * recibe el elemento ya armado, no un render-prop. */
export function ReplayAnimation({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div key={key}>{children}</div>
      <button type="button" onClick={() => setKey((k) => k + 1)} className="text-xs font-semibold text-brand-primary hover:underline">
        Repetir
      </button>
    </div>
  );
}

import type { KeyboardEvent } from 'react';

/** Para filas/tarjetas clicables: Enter o Espacio hacen lo mismo que el clic (solo si el foco está en la fila misma). */
export const teclaFila =
  (accion: () => void) =>
  (e: KeyboardEvent<HTMLElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault();
      accion();
    }
  };

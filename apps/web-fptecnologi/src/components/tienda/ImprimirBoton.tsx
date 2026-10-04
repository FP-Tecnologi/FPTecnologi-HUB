'use client';

import { Printer } from 'lucide-react';

/* Abre el diálogo de impresión del navegador: ahí se elige "Guardar como PDF". */
export function ImprimirBoton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#0b68b8]"
    >
      <Printer className="h-4 w-4" strokeWidth={2} />
      Imprimir PDF
    </button>
  );
}

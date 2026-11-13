'use client';
import { Minus, Plus } from 'lucide-react';
import { Forma } from '@/components/hex/BotonHex';

/** Contador de cantidad con el marco hexagonal de la web: menos a la izquierda, más a la derecha y el número al centro (editable). */
export default function ContadorCantidad({ valor, onCambio, etiqueta, min = 1, max = 999, className = '' }: { valor: number; onCambio: (n: number) => void; etiqueta: string; min?: number; max?: number; className?: string }) {
  const poner = (n: number) => onCambio(Math.min(max, Math.max(min, Math.floor(n) || min)));
  const boton = 'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-rojo-hondo transition-colors hover:bg-boton hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rojo-hondo disabled:pointer-events-none disabled:opacity-35';
  return (
    <div role="group" aria-label={etiqueta} className={`group/campo relative isolate inline-flex min-h-11 items-center gap-1 px-6 ${className}`}>
      <Forma className="inset-0 text-carbon group-focus-within/campo:text-rojo-hondo" />
      <Forma className="inset-[2px] text-white" />
      <button type="button" aria-label={`Quitar una unidad. ${etiqueta}`} disabled={valor <= min} onClick={() => poner(valor - 1)} className={boton}><Minus aria-hidden="true" size={18} /></button>
      <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label={etiqueta} value={valor} onChange={(e) => poner(Number(e.target.value.replace(/\D/g, '')))} onFocus={(e) => e.currentTarget.select()} className="relative z-10 min-h-10 w-12 min-w-0 bg-transparent text-center text-base font-bold text-tinta outline-none" />
      <button type="button" aria-label={`Agregar una unidad. ${etiqueta}`} disabled={valor >= max} onClick={() => poner(valor + 1)} className={boton}><Plus aria-hidden="true" size={18} /></button>
    </div>
  );
}

'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Forma } from '@/components/hex/BotonHex';

type Opcion = { valor: string; texto: string };

/** Desplegable con el marco hexagonal de la web y una lista propia (blanca, con borde rojo, opción activa en rojo).
 *  Teclado: flechas, Inicio/Fin, Enter/Espacio, Esc; clic fuera cierra. Con `name` envía su valor en un campo oculto. */
export default function SelectHex({ valor, opciones, onCambio, etiqueta, className = '' }: { valor: string; opciones: Opcion[]; onCambio: (v: string) => void; etiqueta: string; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const id = useId();
  const actual = Math.max(0, opciones.findIndex((o) => o.valor === valor));

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => { if (!raiz.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    return () => document.removeEventListener('pointerdown', fuera);
  }, [abierto]);

  useEffect(() => { if (abierto) lista.current?.children[activo]?.scrollIntoView({ block: 'nearest' }); }, [abierto, activo]);

  const abrir = () => { setActivo(actual); setAbierto(true); };
  const elegir = (i: number) => { onCambio(opciones[i].valor); setAbierto(false); raiz.current?.querySelector('button')?.focus(); };

  const tecla = (e: React.KeyboardEvent) => {
    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); abrir(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActivo((a) => Math.min(opciones.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActivo((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActivo(0); }
    else if (e.key === 'End') { e.preventDefault(); setActivo(opciones.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(activo); }
    else if (e.key === 'Escape') { e.preventDefault(); setAbierto(false); }
    else if (e.key === 'Tab') setAbierto(false);
  };

  return (
    <div ref={raiz} className={`relative ${className}`} onKeyDown={tecla}>
      <button type="button" aria-haspopup="listbox" aria-expanded={abierto} aria-label={`${etiqueta}: ${opciones[actual]?.texto}`} aria-controls={abierto ? id : undefined}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        className="group/campo relative isolate flex min-h-11 w-full items-center justify-between gap-3 px-7 text-left text-base text-tinta focus-visible:outline-hidden">
        <Forma className="inset-0 text-rojo-hondo group-focus-visible/campo:text-boton" />
        <Forma className="inset-[2px] text-white" />
        <span className="truncate">{opciones[actual]?.texto}</span>
        <ChevronDown aria-hidden="true" size={18} className={`shrink-0 text-rojo-hondo transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <ul ref={lista} id={id} role="listbox" aria-label={etiqueta} aria-activedescendant={`${id}-${activo}`} className="absolute left-0 top-full z-40 mt-2 max-h-72 min-w-full w-max max-w-[min(22rem,90vw)] overflow-auto rounded-2xl border-2 border-rojo-hondo bg-white p-1.5 shadow-xl">
          {opciones.map((o, i) => {
            const sel = i === actual;
            return (
              <li key={o.valor} id={`${id}-${i}`} role="option" aria-selected={sel} onPointerEnter={() => setActivo(i)} onClick={() => elegir(i)}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2 text-base ${i === activo ? 'bg-boton text-white' : sel ? 'bg-rojo/10 font-semibold text-rojo-hondo' : 'text-carbon'}`}>
                <span>{o.texto}</span>
                {sel && <Check aria-hidden="true" size={16} className="shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

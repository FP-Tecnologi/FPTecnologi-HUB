'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';

/** Pausa/reanuda la marquesina hermana (WCAG 2.2.2). La elección del usuario manda sobre hover/foco (ver globals.css). */
export default function PausaMarquesina() {
  const ref = useRef<HTMLDivElement>(null);
  const [pausada, setPausada] = useState(false);
  return (
    <div ref={ref} className="marquesina-ctl mt-3 flex justify-center">
      <BotonHex
        variante="contorno"
        size="sm"
        icono={pausada ? Play : Pause}
        className="w-16 !px-0"
        onClick={() => {
          const sig = !pausada;
          ref.current?.parentElement?.querySelector<HTMLElement>('.marquesina')?.setAttribute('data-modo', sig ? 'pausa' : 'play');
          setPausada(sig);
        }}
      >
        <span className="sr-only">{pausada ? 'Reanudar desplazamiento de marcas' : 'Pausar desplazamiento de marcas'}</span>
      </BotonHex>
    </div>
  );
}

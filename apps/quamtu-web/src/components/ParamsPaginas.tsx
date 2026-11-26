'use client';
/* La web es estática: los ?parámetros se leen en el navegador (no hay servidor que los reciba). */
import { useSearchParams } from 'next/navigation';
import Cotizador from '@/components/Cotizador';
import SeguimientoTicket from '@/components/SeguimientoTicket';

export function CotizarConParams() {
  // ?equipo=codigo parte con ese equipo ya añadido.
  return <Cotizador inicial={useSearchParams().get('equipo') ?? undefined} />;
}

export function SeguimientoConParams() {
  return <SeguimientoTicket numeroInicial={(useSearchParams().get('n') ?? '').slice(0, 30).toUpperCase()} />;
}

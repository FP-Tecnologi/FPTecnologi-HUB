'use client';
/* La web es estática: los ?parámetros se leen en el navegador (no hay servidor que los reciba). */
import { useSearchParams } from 'next/navigation';
import Builder from '@/components/Builder';
import Cotizador from '@/components/Cotizador';
import SeguimientoTicket from '@/components/SeguimientoTicket';
import { BUILDS, porId } from '@/lib/piezas';

export function ArmarConParams() {
  const p = useSearchParams();
  const pieza = p.get('pieza');
  // ?build=N carga una configuración lista; ?pieza=id parte desde una pieza de la tienda.
  const inicial = BUILDS[Number(p.get('build'))]?.ids ?? (pieza && porId(pieza) ? [pieza] : undefined);
  return <Builder inicial={inicial} />;
}

export function CotizarConParams() {
  const p = useSearchParams();
  const pieza = p.get('pieza');
  const build = p.get('build');
  // ?pieza=id o ?build=N parten con ese producto ya añadido.
  const inicial = build && BUILDS[Number(build)] ? { tipo: 'build' as const, id: String(Number(build)) } : pieza && porId(pieza) ? { tipo: 'pieza' as const, id: pieza } : undefined;
  return <Cotizador inicial={inicial} />;
}

export function SeguimientoConParams() {
  return <SeguimientoTicket numeroInicial={(useSearchParams().get('n') ?? '').slice(0, 30).toUpperCase()} />;
}

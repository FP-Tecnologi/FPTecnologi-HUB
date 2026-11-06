'use client';
import { usePathname } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import { HREF_BBVA, LogoBbva, TarjetaBbva } from './Tarjetas';

// Donde no va: el inicio (ya tiene su bloque grande), la propia página de BBVA y las páginas de formulario o legales.
const SIN_BANNER = ['/', '/tarjetas-bbva', '/cotizar', '/contacto', '/libro-de-reclamaciones', '/legal'];
const oculto = (ruta: string) => SIN_BANNER.some((p) => (p === '/' ? ruta === '/' : ruta === p || ruta.startsWith(`${p}/`)));

/** Franja delgada de todo el ancho, en claro, justo antes del pie (CTA de cotizar): invita a consultar tarjetas BBVA. */
export default function BannerBbva() {
  if (oculto(usePathname())) return null;
  return (
    <aside aria-label="Tarjetas de crédito BBVA" className="print:hidden mt-8 border-y border-carbon/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-5 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div aria-hidden="true" className="hidden h-14 items-center pl-3 sm:flex">
            {(['visa-bfree', 'visa-platinum', 'visa-signature'] as const).map((id, i) => (
              <TarjetaBbva key={id} id={id} className={`-ml-3 h-14 w-auto ${i === 0 ? '-rotate-6' : i === 1 ? 'z-10' : 'rotate-6'}`} />
            ))}
          </div>
          <div>
            <LogoBbva className="mx-auto h-4 md:mx-0" />
            <p className="mt-1.5 font-display text-xl font-bold uppercase leading-tight tracking-wide text-carbon">
              ¿Tienes una tarjeta BBVA <span className="text-rojo-hondo">preaprobada?</span>
            </p>
            <p className="text-sm text-carbon/80">Consulta con tu DNI en 1 minuto, sin costo.</p>
          </div>
        </div>
        <BotonHex href={`${HREF_BBVA}#consulta`} icono={CreditCard}>Consultar</BotonHex>
      </div>
    </aside>
  );
}

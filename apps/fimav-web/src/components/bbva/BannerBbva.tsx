'use client';
import { usePathname } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import { HREF_BBVA, LogoBbva, TarjetaBbva } from './Tarjetas';

// Donde no va: el inicio (ya tiene su bloque grande), la propia página de BBVA y las páginas de formulario o legales.
const SIN_BANNER = ['/', '/tarjetas-bbva', '/cotizar', '/contacto', '/libro-de-reclamaciones', '/legal'];
const oculto = (ruta: string) => SIN_BANNER.some((p) => (p === '/' ? ruta === '/' : ruta === p || ruta.startsWith(`${p}/`)));

/** Franja delgada de todo el ancho, en azul BBVA, justo antes del pie (CTA de cotizar): invita a consultar tarjetas BBVA. */
export default function BannerBbva() {
  if (oculto(usePathname())) return null;
  return (
    <aside aria-label="Tarjetas de crédito BBVA" className="banner-bbva print:hidden relative overflow-hidden bg-gradient-to-r from-[#070E46] via-[#001391] to-[#004481] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-[#85C8FF]/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-5 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div aria-hidden="true" className="hidden h-14 items-center pl-3 sm:flex">
            {(['visa-bfree', 'visa-platinum', 'visa-signature'] as const).map((id, i) => (
              <TarjetaBbva key={id} id={id} className={`-ml-3 h-14 w-auto ${i === 0 ? '-rotate-6' : i === 1 ? 'z-10' : 'rotate-6'}`} />
            ))}
          </div>
          <div>
            <LogoBbva blanco className="mx-auto h-4 md:mx-0" />
            <p className="mt-1.5 font-display text-xl font-bold uppercase leading-tight tracking-wide">
              ¿Tienes una tarjeta BBVA <span className="text-[#85C8FF]">preaprobada?</span>
            </p>
            <p className="text-sm text-white/90">Consulta con tu DNI en 1 minuto, sin costo.</p>
          </div>
        </div>
        <BotonHex href={`${HREF_BBVA}#consulta`} variante="contorno" icono={CreditCard}>Consultar</BotonHex>
      </div>
    </aside>
  );
}

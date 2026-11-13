import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HREF_BBVA, LogoBbva, TarjetaBbva } from './Tarjetas';

/** Tarjeta compacta de BBVA para el momento de compra (ficha, carrito, cotización con carrito): invita a pagar con tarjeta preaprobada. */
export default function AvisoCompra({ className = '' }: { className?: string }) {
  return (
    <aside aria-label="Paga con tarjeta BBVA" className={`print:hidden relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#070E46] via-[#001391] to-[#004481] p-4 text-white ${className}`}>
      <div className="flex items-center gap-4">
        <div aria-hidden="true" className="flex shrink-0 items-center pl-2">
          {(['visa-platinum', 'visa-signature'] as const).map((id, i) => (
            <TarjetaBbva key={id} id={id} className={`-ml-2 h-14 w-auto ${i === 0 ? '-rotate-6' : 'rotate-6'}`} />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <LogoBbva blanco className="h-3.5" />
          <p className="mt-1 font-display text-lg font-bold leading-snug">Compra con tu tarjeta <span className="text-[#85C8FF]">BBVA</span></p>
          <p className="text-sm text-white/90">Consulta con tu DNI si la tienes preaprobada. Sin costo.</p>
        </div>
      </div>
      <Link href={`${HREF_BBVA}#consulta`} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#85C8FF] text-sm font-semibold text-[#070E46] transition-colors hover:bg-white focus-visible:outline-white">
        Ver mis tarjetas <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </aside>
  );
}

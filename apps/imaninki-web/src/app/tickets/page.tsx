import Link from 'next/link';
import { Headset } from 'lucide-react';
import AbrirTicket from '@/components/AbrirTicket';
import Banner from '@/components/Banner';
import { meta } from '@/lib/seo';

const descripcion = 'Soporte técnico, garantías y reclamos de Imaninki: abre un ticket y sigue su estado en línea.';
export const metadata = meta('Tickets de soporte', descripcion, '/tickets');

export default function TicketsPage() {
  return (
    <main id="contenido">
      <Banner miga="Tickets" titulo="Soporte por" acento="tickets" foto="/fotos/cumbre.webp" />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8">
        <p className="flex max-w-2xl items-start gap-3 text-carbon">
          <Headset aria-hidden="true" size={20} className="mt-1 shrink-0 text-rojo-hondo" />
          <span>¿Compraste con nosotros y necesitas soporte, una garantía o registrar un reclamo? Abre un ticket: te llega una copia por correo y puedes seguir su estado aquí.</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/tickets/seguimiento" className="btn-borde inline-flex min-h-11 items-center rounded-full px-5 text-sm">VER SEGUIMIENTO</Link>
          <Link href="/libro-de-reclamaciones" className="btn-borde inline-flex min-h-11 items-center rounded-full px-5 text-sm">LIBRO DE RECLAMACIONES</Link>
        </div>
        <div className="mt-10"><AbrirTicket /></div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { Headset } from 'lucide-react';
import AbrirTicket from '@/components/AbrirTicket';

const descripcion = 'Soporte técnico, verificación de equipos y reclamos de Quamtu: abre un ticket y sigue su estado en línea.';
export const metadata = {
  title: 'Tickets de soporte — Quamtu',
  description: descripcion,
  alternates: { canonical: '/tickets' },
  openGraph: { title: 'Tickets de soporte — Quamtu', description: descripcion, url: '/tickets' },
};

export default function TicketsPage() {
  return (
    <main id="contenido" className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">Soporte por <span className="titulo-neon">tickets</span></h1>
      <p className="mt-4 flex max-w-2xl items-start gap-3 text-slate-300">
        <Headset aria-hidden="true" size={20} className="mt-1 shrink-0 text-claro" />
        <span>¿Compraste tu equipo con nosotros y necesitas soporte, verificar una pieza o registrar un reclamo? Abre un ticket: te llega una copia por correo y puedes seguir su estado aquí.</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/tickets/seguimiento" className="btn-borde inline-flex min-h-11 items-center rounded-full px-5 font-display text-xs">VER SEGUIMIENTO</Link>
        <Link href="/libro-de-reclamaciones" className="btn-borde inline-flex min-h-11 items-center rounded-full px-5 font-display text-xs">LIBRO DE RECLAMACIONES</Link>
      </div>
      <div className="mt-10"><AbrirTicket /></div>
    </main>
  );
}

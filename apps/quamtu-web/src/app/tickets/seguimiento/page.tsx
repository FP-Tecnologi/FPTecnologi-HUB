import SeguimientoTicket from '@/components/SeguimientoTicket';

export const metadata = { title: 'Seguimiento de ticket — Quamtu', robots: { index: false } };

/* El cliente entra con el número (llega por correo en ?n=) y el correo con el que abrió el ticket. */
export default async function SeguimientoPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <h1 className="mb-8 font-display text-3xl font-bold sm:text-4xl">Seguimiento de tu <span className="titulo-neon">ticket</span></h1>
      <SeguimientoTicket numeroInicial={(n ?? '').slice(0, 30).toUpperCase()} />
    </main>
  );
}

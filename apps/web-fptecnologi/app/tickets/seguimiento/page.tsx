import { TiendaBar } from '@/components/tienda/TiendaBar';
import { SeguimientoTicket } from '@/components/site/SeguimientoTicket';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Seguimiento de ticket', robots: { index: false } };

/* Estado y conversación de un ticket: el cliente entra con su número y correo. */
export default async function SeguimientoPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Tickets', href: '/tickets' }, { label: 'Seguimiento' }]} titulo="Seguimiento de tu ticket" />
      <main className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <SeguimientoTicket numeroInicial={(n ?? '').slice(0, 30).toUpperCase()} />
        </div>
      </main>
      <Footer />
    </>
  );
}

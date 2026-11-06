import SeguimientoTicket from '@/components/SeguimientoTicket';
import Banner from '@/components/Banner';

export const metadata = { title: 'Seguimiento de ticket', robots: { index: false } };

/* El cliente entra con el número (llega por correo en ?n=) y el correo con el que abrió el ticket. */
export default async function SeguimientoPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return (
    <main id="contenido">
      <Banner miga="Seguimiento" titulo="Seguimiento de tu" acento="ticket" foto="/fotos/cumbre.webp" />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8">
        <SeguimientoTicket numeroInicial={(n ?? '').slice(0, 30).toUpperCase()} />
      </div>
    </main>
  );
}

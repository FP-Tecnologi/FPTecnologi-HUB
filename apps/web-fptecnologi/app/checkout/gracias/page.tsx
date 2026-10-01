import { notFound } from 'next/navigation';
import { TiendaBar } from '@/components/tienda/TiendaBar';
import { PedidoGracias } from '@/components/tienda/PedidoGracias';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Pedido recibido', robots: { index: false } };

export default async function GraciasPage({ searchParams }: { searchParams: Promise<{ pedido?: string; total?: string }> }) {
  const { pedido, total } = await searchParams;
  // El número lo genera la API (FP-AAAA-XXXXXX); cualquier otra cosa no es una confirmación válida.
  if (!pedido || !/^FP-\d{4}-[A-Z0-9]{6}$/.test(pedido)) notFound();
  const monto = Number(total);

  return (
    <>
      <TiendaBar crumbs={[{ label: 'Tienda', href: '/tienda' }, { label: 'Pedido recibido' }]} titulo="Pedido recibido" />
      <main className="bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <PedidoGracias numero={pedido} total={Number.isFinite(monto) && monto > 0 ? monto : 0} />
        </div>
      </main>
      <Footer />
    </>
  );
}

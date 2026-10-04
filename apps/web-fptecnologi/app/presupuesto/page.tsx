import { TiendaBar } from '@/components/tienda/TiendaBar';
import { PresupuestoForm } from '@/components/tienda/PresupuestoForm';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Pedir presupuesto', robots: { index: false } };

export default function PresupuestoPage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Tienda', href: '/tienda' }, { label: 'Carrito', href: '/carrito' }, { label: 'Presupuesto' }]} titulo="Pedir presupuesto" />
      <main className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <PresupuestoForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

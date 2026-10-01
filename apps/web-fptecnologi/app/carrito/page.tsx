import { TiendaBar } from '@/components/tienda/TiendaBar';
import { CartView } from '@/components/tienda/CartView';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Tu carrito', robots: { index: false } };

export default function CarritoPage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Tienda', href: '/tienda' }, { label: 'Carrito' }]} titulo="Tu carrito" />
      <main className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <CartView />
        </div>
      </main>
      <Footer />
    </>
  );
}

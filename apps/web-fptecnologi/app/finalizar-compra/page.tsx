import { TiendaBar } from '@/components/tienda/TiendaBar';
import { CheckoutForm } from '@/components/tienda/CheckoutForm';
import { PasosCompra } from '@/components/tienda/PasosCompra';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Finalizar compra', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Tienda', href: '/tienda' }, { label: 'Carrito', href: '/carrito' }, { label: 'Finalizar compra' }]} titulo="Finalizar compra" />
      <main className="bg-paper pb-28 pt-10 lg:pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <PasosCompra actual={2} />
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

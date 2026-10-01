import { TiendaBar } from '@/components/tienda/TiendaBar';
import { CheckoutForm } from '@/components/tienda/CheckoutForm';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Finalizar compra', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Tienda', href: '/tienda' }, { label: 'Carrito', href: '/carrito' }, { label: 'Finalizar compra' }]} titulo="Finalizar compra" />
      <main className="bg-paper pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-6">
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

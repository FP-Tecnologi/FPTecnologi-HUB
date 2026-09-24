import { StoreCatalog } from '@/components/tienda/StoreCatalog';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Tienda' };

export default function TiendaPage() {
  return (
    <>
      <StoreCatalog />
      <Footer />
    </>
  );
}

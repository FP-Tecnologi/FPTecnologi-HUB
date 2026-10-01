import { StoreCatalog } from '@/components/tienda/StoreCatalog';
import { Footer } from '@/components/home/Footer';
import { categoriasDe, getCatalogo } from '@/lib/catalogo';

export const metadata = { title: 'Tienda' };

// Catálogo desde la API central (se refresca cada 60 s); sin API usa el local.
export default async function TiendaPage() {
  const { products } = await getCatalogo();
  return (
    <>
      <StoreCatalog products={products} categories={categoriasDe(products)} />
      <Footer />
    </>
  );
}

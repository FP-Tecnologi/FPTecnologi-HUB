import { notFound } from 'next/navigation';
import { StoreCatalog } from '@/components/tienda/StoreCatalog';
import { Footer } from '@/components/home/Footer';
import { categoriasDe, getCatalogo } from '@/lib/catalogo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getCatalogo();
  return { title: categoriasDe(products).find((c) => c.slug === slug)?.title ?? 'Categoría' };
}

// Misma tienda, con la categoría ya filtrada (se puede cambiar desde ahí).
export default async function TiendaCategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getCatalogo();
  const categories = categoriasDe(products);
  if (!categories.some((c) => c.slug === slug)) notFound();

  return (
    <>
      <StoreCatalog initialCategory={slug} products={products} categories={categories} />
      <Footer />
    </>
  );
}

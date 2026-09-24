import { notFound } from 'next/navigation';
import { TIENDA_CATEGORIES } from '@/lib/content';
import { StoreCatalog } from '@/components/tienda/StoreCatalog';
import { Footer } from '@/components/home/Footer';

export function generateStaticParams() {
  return TIENDA_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = TIENDA_CATEGORIES.find((c) => c.slug === slug);
  return { title: category?.title ?? 'Categoría' };
}

// Misma tienda, con la categoría ya filtrada (se puede cambiar desde ahí).
export default async function TiendaCategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!TIENDA_CATEGORIES.some((c) => c.slug === slug)) notFound();

  return (
    <>
      <StoreCatalog initialCategory={slug} />
      <Footer />
    </>
  );
}

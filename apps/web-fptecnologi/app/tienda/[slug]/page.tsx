import { notFound } from 'next/navigation';
import { TIENDA_CATEGORIES } from '@/lib/content';
import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export function generateStaticParams() {
  return TIENDA_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = TIENDA_CATEGORIES.find((c) => c.slug === slug);
  return { title: category?.title ?? 'Categoría' };
}

export default async function TiendaCategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = TIENDA_CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <PlaceholderPage
      eyebrow="Tienda B2B"
      title={category.title}
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Tienda', href: '/tienda' },
        { label: category.title, href: `/tienda/${category.slug}` },
      ]}
    />
  );
}

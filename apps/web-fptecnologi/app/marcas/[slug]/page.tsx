import { notFound } from 'next/navigation';
import { FEATURED_PRODUCTS, PARTNER_BRANDS, brandSlug } from '@/lib/content';
import { PlaceholderPage } from '@/components/site/PlaceholderPage';

// Marcas distribuidas + las que aparecen en productos (ej. ASUS no está en
// el carrusel de marcas pero sí tiene productos).
const BRANDS = [...new Set([...PARTNER_BRANDS.map((b) => b.name), ...FEATURED_PRODUCTS.map((p) => p.brand)])];

export function generateStaticParams() {
  return BRANDS.map((name) => ({ slug: brandSlug(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: BRANDS.find((b) => brandSlug(b) === slug) ?? 'Marca' };
}

// Página de productos por marca -- placeholder como el resto de la tienda
// hasta conectar el catálogo real.
export default async function MarcaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = BRANDS.find((b) => brandSlug(b) === slug);
  if (!brand) notFound();

  return (
    <PlaceholderPage
      eyebrow="Productos por marca"
      title={brand}
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Marcas', href: '/marcas' },
        { label: brand, href: `/marcas/${slug}` },
      ]}
    />
  );
}

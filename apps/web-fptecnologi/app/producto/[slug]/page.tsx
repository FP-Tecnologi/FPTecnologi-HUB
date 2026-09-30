import { notFound } from 'next/navigation';
import { Home } from 'lucide-react';
import { CATALOG, findProduct, productSlug } from '@/lib/catalog';
import { TIENDA_CATEGORIES } from '@/lib/content';
import { StickyNav } from '@/components/home/StickyNav';
import { Navbar9 } from '@/components/home/Navbar9';
import { ProductDetail } from '@/components/tienda/ProductDetail';
import { Footer } from '@/components/home/Footer';

export function generateStaticParams() {
  return CATALOG.map((p) => ({ slug: productSlug(p.sku) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: findProduct(slug)?.name.split(',')[0] ?? 'Producto' };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  const categoria = TIENDA_CATEGORIES.find((c) => c.slug === product.category);
  const relacionados = CATALOG.filter((p) => p.category === product.category && p.sku !== product.sku).slice(0, 4);

  return (
    <>
      <StickyNav store />
      {/* Franja de portada corta (mismo marco y degradado que la tienda):
          el encabezado fijo es claro y necesita fondo oscuro detrás. */}
      <div className="bg-paper p-3 md:p-5">
        <section className="relative overflow-hidden rounded-[1.25rem] text-white md:rounded-[2.25rem]">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-ink via-brand-primary to-brand-dark" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-teal/30 blur-3xl" />
          <div className="invisible" aria-hidden>
            <Navbar9 store />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-2 md:px-10">
            <nav aria-label="Migas de pan" className="relative flex w-fit flex-wrap items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/75 backdrop-blur-md">
              <span className="spin-border spin-border--thin" aria-hidden />
              <a href="/" className="relative flex items-center gap-1.5 hover:text-white">
                <Home className="h-4 w-4 text-white" strokeWidth={2} />
                Inicio
              </a>
              <span className="relative text-white/40">/</span>
              <a href="/tienda" className="relative hover:text-white">Tienda</a>
              {categoria && (
                <>
                  <span className="relative text-white/40">/</span>
                  <a href={`/tienda/${categoria.slug}`} className="relative hover:text-white">{categoria.title}</a>
                </>
              )}
              <span className="relative text-white/40">/</span>
              <span className="relative font-semibold text-white">{product.sku}</span>
            </nav>
          </div>
        </section>
      </div>
      <main>
        <ProductDetail product={product} relacionados={relacionados} />
      </main>
      <Footer />
    </>
  );
}

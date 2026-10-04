import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Footer } from '@/components/home/Footer';
import { ProductGrid } from '@/components/tienda/ProductGrid';
import { PARTNER_BRANDS, brandSlug } from '@/lib/content';
import { getCatalogo } from '@/lib/catalogo';

async function datosMarca(slug: string) {
  const { products } = await getCatalogo();
  const delCatalogo = products.filter((p) => brandSlug(p.brand) === slug);
  const nombre = delCatalogo[0]?.brand ?? PARTNER_BRANDS.find((b) => brandSlug(b.name) === slug)?.name;
  return { nombre, productos: delCatalogo };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { nombre, productos } = await datosMarca(slug);
  if (!nombre) return { title: 'Marca' };
  const descripcion = `${nombre}: ${productos.length > 0 ? `${productos.length} producto${productos.length === 1 ? '' : 's'} con garantía oficial` : 'consulta disponibilidad'} en FPTecnologi & System.`;
  return { title: nombre, description: descripcion, openGraph: { title: `${nombre} · FPTecnologi`, description: descripcion } };
}

// Productos de una marca: catálogo real (API central) filtrado por marca.
export default async function MarcaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { nombre, productos } = await datosMarca(slug);
  if (!nombre) notFound();

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Marcas', href: '/marcas' },
          { label: nombre, href: `/marcas/${slug}` },
        ]}
        titulo={nombre}
        destacado="distribución autorizada"
        descripcion={productos.length > 0 ? `${productos.length} producto${productos.length === 1 ? '' : 's'} originales con garantía oficial y stock local.` : 'Consúltanos por equipos de esta marca: te cotizamos a medida.'}
      >
        <MoreInfoButton tone="dark" href="/tienda" label="Ver tienda" />
      </PageHero>

      <main className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          {productos.length > 0 ? (
            <>
              <ScrollReveal direction="up" className="mb-10">
                <SectionBadge>Productos {nombre}</SectionBadge>
              </ScrollReveal>
              <ProductGrid products={productos} />
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-xl shadow-brand-dark/10">
              <h2 className="font-display text-2xl font-bold text-ink">Aún no tenemos {nombre} en la tienda</h2>
              <p className="mt-2 text-ink/60">Somos distribuidores autorizados: pídenos una cotización y un asesor te propone la mejor opción.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <MoreInfoButton href="/cotizador" label="Cotizar" />
                <WhatsAppCta label="WhatsApp" texto={`Hola, quiero información de equipos ${nombre}`} tone="light" />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

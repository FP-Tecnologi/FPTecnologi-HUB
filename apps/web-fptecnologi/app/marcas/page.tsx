import Image from 'next/image';
import { PageHero } from '@/components/site/PageHero';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Footer } from '@/components/home/Footer';
import { PARTNER_BRANDS, brandSlug } from '@/lib/content';
import { getCatalogo } from '@/lib/catalogo';

export const metadata = {
  title: 'Marcas',
  description: 'Distribución autorizada de las principales marcas de tecnología: Dell, HP, Lenovo, Epson, ViewSonic, LG y más.',
};

/* Marcas -- las aliadas (con logo) y las que tienen productos en la tienda,
   con el conteo real del catálogo. Cada tarjeta lleva a /marcas/[slug]. */
export default async function MarcasPage() {
  const { products } = await getCatalogo();
  const conteo = new Map<string, number>();
  for (const p of products) conteo.set(brandSlug(p.brand), (conteo.get(brandSlug(p.brand)) ?? 0) + 1);

  const conLogo = new Set(PARTNER_BRANDS.map((b) => brandSlug(b.name)));
  const extra = [...new Set(products.map((p) => p.brand))].filter((b) => !conLogo.has(brandSlug(b)));
  const marcas = [
    ...PARTNER_BRANDS.map((b) => ({ name: b.name, logo: b.logo as string | null })),
    ...extra.map((name) => ({ name, logo: null })),
  ].sort((a, b) => (conteo.get(brandSlug(b.name)) ?? 0) - (conteo.get(brandSlug(a.name)) ?? 0) || a.name.localeCompare(b.name));

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Marcas', href: '/marcas' },
        ]}
        titulo="Marcas aliadas"
        destacado="con distribución autorizada"
        descripcion="Productos originales con garantía oficial y stock local de las principales marcas de tecnología."
      >
        <MoreInfoButton tone="dark" href="/tienda" label="Ver la tienda" />
      </PageHero>

      <main className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <SectionBadge>Nuestras marcas</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">Elige una marca y</span> <span className="title-shimmer-light">mira sus productos</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {marcas.map((m, i) => {
              const n = conteo.get(brandSlug(m.name)) ?? 0;
              return (
                <ScrollReveal key={m.name} direction="up" delayMs={(i % 5) * 80} className="h-full">
                  <a
                    href={`/marcas/${brandSlug(m.name)}`}
                    className="group flex h-full flex-col items-center justify-center rounded-2xl border border-ink/5 bg-white p-6 text-center shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25"
                  >
                    <span className="relative flex h-16 w-full items-center justify-center">
                      {m.logo ? (
                        <Image src={m.logo} alt={m.name} width={120} height={56} className="max-h-14 w-auto object-contain" />
                      ) : (
                        <span className="font-display text-2xl font-bold text-brand-primary">{m.name}</span>
                      )}
                    </span>
                    <span className="mt-4 text-sm font-semibold text-ink">{m.name}</span>
                    <span className={`mt-1 text-xs ${n > 0 ? 'font-semibold text-brand-700' : 'text-ink/45'}`}>
                      {n > 0 ? `${n} producto${n === 1 ? '' : 's'}` : 'Consultar disponibilidad'}
                    </span>
                  </a>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

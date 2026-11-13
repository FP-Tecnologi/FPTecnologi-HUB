import { notFound } from 'next/navigation';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Footer } from '@/components/home/Footer';
import { ProductGrid } from '@/components/tienda/ProductGrid';
import { PARTNER_BADGES, PARTNER_BRANDS, brandSlug } from '@/lib/content';
import { MARCAS_INFO } from '@/lib/marcasInfo';
import { getCatalogo } from '@/lib/catalogo';
import { OG_BASE, OG_LOGO } from '@/lib/seo';

async function datosMarca(slug: string) {
  const { products } = await getCatalogo();
  const delCatalogo = products.filter((p) => brandSlug(p.brand) === slug);
  const info = MARCAS_INFO[slug];
  const nombre = info?.nombre ?? delCatalogo[0]?.brand ?? PARTNER_BRANDS.find((b) => brandSlug(b.name) === slug)?.name;
  return { nombre, productos: delCatalogo, info };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { nombre, productos, info } = await datosMarca(slug);
  if (!nombre) return { title: 'Marca' };
  const descripcion = info
    ? `${info.nombre}: ${info.lema} Distribución autorizada, garantía y soporte local con FPTecnologi & System.`
    : `${nombre}: ${productos.length > 0 ? `${productos.length} producto${productos.length === 1 ? '' : 's'} con garantía oficial` : 'consulta disponibilidad'} en FPTecnologi & System.`;
  return { title: nombre, description: descripcion, openGraph: { ...OG_BASE, title: `${nombre} · FPTecnologi`, description: descripcion, images: [OG_LOGO] } };
}

const POR_QUE = [
  { titulo: 'Distribución autorizada', texto: 'Equipos originales, con la garantía del fabricante y la trazabilidad que piden las compras corporativas.' },
  { titulo: 'Cotización a medida', texto: 'Armamos la propuesta según tu proyecto: cantidades, configuración y plazos de entrega.' },
  { titulo: 'Soporte local', texto: 'Un equipo en el país que te acompaña antes y después de la compra, desde la instalación hasta la garantía.' },
];

// Landing de la marca: ficha informativa (si existe en marcasInfo.ts) + productos reales del catálogo.
export default async function MarcaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { nombre, productos, info } = await datosMarca(slug);
  if (!nombre) notFound();

  const insignia = info?.badge ? PARTNER_BADGES.find((b) => b.name === info.badge) : undefined;
  const nivel = insignia?.level;
  const col = info?.colores;
  // Color para textos e íconos sobre fondo blanco: si el primario es muy claro (amarillos) se usa el oscuro.
  const acento = col ? (col.claro ? col.oscuro : col.primario) : '';
  const crumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Marcas', href: '/marcas' },
    { label: nombre, href: `/marcas/${slug}` },
  ];

  const productosSeccion = (
    <section id="productos" className="scroll-mt-28 py-20">
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
    </section>
  );

  // Marcas sin ficha: se mantiene la página de productos de siempre.
  if (!info) {
    return (
      <>
        <PageHero
          crumbs={crumbs}
          titulo={nombre}
          destacado="distribución autorizada"
          descripcion={productos.length > 0 ? `${productos.length} producto${productos.length === 1 ? '' : 's'} originales con garantía oficial y stock local.` : 'Consúltanos por equipos de esta marca: te cotizamos a medida.'}
        >
          <MoreInfoButton tone="dark" href="/tienda" label="Ver tienda" />
        </PageHero>
        <main id="contenido">{productosSeccion}</main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHero crumbs={crumbs} titulo={info.nombre} destacado="distribución autorizada" descripcion={info.lema} tinte={info.colores} logo={info.logoHero === null ? undefined : (info.logoHero ?? info.logo)}>
        <MoreInfoButton tone="dark" href="#cotizar" label="Cotizar" />
        <WhatsAppCta label="WhatsApp" texto={`Hola, quiero información sobre ${info.nombre}`} />
      </PageHero>

      <main id="contenido">
        <section id="quienes" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 lg:grid-cols-[1fr_minmax(0,420px)]">
            <ScrollReveal direction="left">
              <SectionBadge>Sobre la marca</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Conoce</span> <span className="title-shimmer-light">{info.nombre}</span>
              </h2>
              <div className="mt-4 space-y-4 text-ink/65">
                {info.quienes.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <h3 className="mt-8 font-display text-lg font-bold text-ink">Ideal para</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {info.ideal.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-ink">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: acento }} strokeWidth={2} />
                    {t}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal direction="right" delayMs={120}>
              <aside className="overflow-hidden rounded-3xl bg-white p-7 shadow-xl shadow-brand-dark/10 ring-1 ring-ink/5" style={{ borderTop: `6px solid ${info.colores.primario}` }}>
                <div className="flex h-24 items-center justify-center rounded-2xl bg-paper p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={info.logo} alt={`Logo ${info.nombre}`} className="h-full w-full object-contain" />
                </div>
                {insignia && insignia.logo !== info.logo && (
                  <div className="mt-4 flex items-center justify-center rounded-2xl p-4" style={{ background: `${info.colores.primario}14` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={insignia.logo} alt={`${insignia.name}: partner ${insignia.level}`} className="h-24 w-full object-contain" />
                  </div>
                )}
                <dl className="mt-6 space-y-4">
                  {info.datos.map((d) => (
                    <div key={d.etiqueta}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">{d.etiqueta}</dt>
                      <dd className="mt-0.5 font-medium text-ink">{d.valor}</dd>
                    </div>
                  ))}
                  {nivel && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">Nuestro nivel de partner</dt>
                      <dd className="mt-0.5 font-medium text-ink">{nivel}</dd>
                    </div>
                  )}
                </dl>
                <a href={info.web} target="_blank" rel="noreferrer noopener" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
                  Sitio oficial <ExternalLink className="h-4 w-4" strokeWidth={2} />
                </a>
              </aside>
            </ScrollReveal>
          </div>
        </section>

        <section id="lineas" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-20">
          <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <SectionBadge>Portafolio</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">Soluciones</span> <span className="title-shimmer-light">{info.nombre}</span>
            </h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {info.lineas.map((l, i) => (
              <ScrollReveal key={l.titulo} direction="up" delayMs={(i % 3) * 100} className="h-full">
                <div className="h-full rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/20">
                  <span className="font-display text-4xl font-bold" style={{ color: `${info.colores.primario}40` }}>0{i + 1}</span>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink">{l.titulo}</h3>
                  <span className="mt-2 block h-1 w-10 rounded-full" style={{ background: `linear-gradient(90deg, ${info.colores.primario}, #2898ee)` }} />
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{l.texto}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section id="porque" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
              <SectionBadge>Con FPTecnologi</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Compra {info.nombre}</span> <span className="title-shimmer-light">con respaldo</span>
              </h2>
            </ScrollReveal>
            <div className="grid gap-6 md:grid-cols-3">
              {POR_QUE.map((b, i) => (
                <ScrollReveal key={b.titulo} direction="up" delayMs={i * 100} className="h-full">
                  <div className="flex h-full gap-4 rounded-2xl bg-paper p-6">
                    <CheckCircle2 className="mt-1 h-6 w-6 shrink-0" style={{ color: acento }} strokeWidth={2} />
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">{b.titulo}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink/60">{b.texto}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {productosSeccion}

        <section id="cotizar" className="scroll-mt-28 pb-20">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-4xl rounded-3xl px-8 py-12 text-center text-white shadow-2xl shadow-brand-dark/25" style={{ background: `linear-gradient(120deg, ${info.colores.oscuro} 0%, ${info.colores.oscuro}E6 40%, #0c60a1 100%)`, borderBottom: `6px solid ${info.colores.primario}` }}>
              <h2 className="font-display text-3xl font-bold">¿Necesitas equipos {info.nombre}?</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/75">Cuéntanos tu proyecto y un asesor te prepara una cotización a medida, con garantía oficial.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <MoreInfoButton tone="dark" href="/cotizador" label="Solicitar cotización" />
                <WhatsAppCta label="Hablar por WhatsApp" texto={`Hola, quiero cotizar productos ${info.nombre}`} />
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

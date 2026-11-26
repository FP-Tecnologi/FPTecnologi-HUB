import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Banknote, Building2, CalendarDays, CheckCircle2, Layers, MapPin, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { ProyectoCard, deptName } from '@/components/site/ProyectoCard';
import { GaleriaProyecto } from '@/components/site/GaleriaProyecto';
import { VideoYoutube } from '@/components/site/VideoYoutube';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { getProyecto } from '@/lib/referencias';
import { montoSoles, slugProyecto } from '@/lib/projects';
import { aVideos } from '@/lib/youtube';
import { OG_BASE, migasJsonLd } from '@/lib/seo';

export const revalidate = 60;

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getProyecto(slug);
  if (!r) return { title: 'Proyecto' };
  const p = r.proyecto;
  const url = `${SITE}/proyectos/${slug}`;
  const imagen = p.image.startsWith('http') ? p.image : `${SITE}${p.image}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, title: p.title, description: p.description, url, images: [imagen] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: [imagen] },
  };
}

/*
 * Detalle de un proyecto (caso de éxito): hero con la foto, la historia
 * completa, ficha lateral (cliente, región, año, inversión), alcance,
 * galería, videos de YouTube y otros proyectos. El contenido se carga en el
 * dashboard (Web informativa → Proyectos).
 */
export default async function ProyectoDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getProyecto(slug);
  if (!r) notFound();
  const { proyecto: p, otros } = r;

  const parrafos = (p.detalle?.trim() || p.description).split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  const fotos = [p.image, ...(p.galeria ?? [])].filter((f, i, a) => f && a.indexOf(f) === i);
  const videos = aVideos((p.videos ?? []).map((url) => ({ url })));
  // Primero los reales, luego los de la misma región y los más recientes.
  const relacionados = [...otros]
    .sort((a, b) => Number(!!a.ejemplo) - Number(!!b.ejemplo) || Number(b.department === p.department) - Number(a.department === p.department) || (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3);

  const ficha: { icon: LucideIcon; label: string; valor: string }[] = [
    { icon: Building2, label: 'Cliente', valor: p.client },
    { icon: MapPin, label: 'Región', valor: deptName(p.department) },
    ...(p.year ? [{ icon: CalendarDays, label: 'Año', valor: String(p.year) }] : []),
    ...(p.monto ? [{ icon: Banknote, label: 'Inversión', valor: montoSoles(p.monto) }] : []),
    ...(p.scope.length ? [{ icon: Layers, label: 'Soluciones', valor: `${p.scope.length} ${p.scope.length === 1 ? 'línea' : 'líneas'} de trabajo` }] : []),
  ];

  const migas = [
    { label: 'Inicio', href: '/' },
    { label: 'Proyectos', href: '/proyectos' },
    { label: p.title.length > 48 ? `${p.title.slice(0, 46)}…` : p.title, href: `/proyectos/${slugProyecto(p.title)}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(migasJsonLd(migas)) }} />
      <PageHero crumbs={migas} titulo={p.title} descripcion={p.description} imagen={p.image}>
        <MoreInfoButton tone="dark" href="/cotizador" label="Quiero un proyecto así" />
        <WhatsAppCta label="Hablar con un especialista" texto={`Hola, vi el proyecto "${p.title}" y quiero algo similar`} />
      </PageHero>

      <main id="contenido">
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_360px]">
            <ScrollReveal direction="up">
              <SectionBadge>Caso de éxito</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Sobre el</span> <span className="title-shimmer-light">proyecto</span>
              </h2>
              <div className="mt-5 space-y-4 text-justify leading-relaxed text-ink/70">
                {parrafos.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>

              {p.scope.length > 0 && (
                <>
                  <h3 className="mt-10 font-display text-xl font-bold text-ink">Qué implementamos</h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {p.scope.map((s) => (
                      <li key={s} className="flex items-center gap-3 rounded-xl bg-brand-primary/5 px-4 py-3 font-semibold text-ink">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-primary" strokeWidth={2.2} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={120}>
              <aside className="sticky top-28 overflow-hidden rounded-2xl bg-brand-950 text-white shadow-2xl shadow-brand-dark/30">
                <div className="border-b border-white/10 px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-200">Ficha del proyecto</p>
                </div>
                <dl className="divide-y divide-white/10 px-6">
                  {ficha.map(({ icon: Icon, label, valor }) => (
                    <div key={label} className="flex items-start gap-3 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <Icon className="h-4.5 w-4.5 text-brand-200" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs uppercase tracking-wide text-white/50">{label}</dt>
                        <dd className="mt-0.5 font-semibold leading-snug">{valor}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                <div className="space-y-3 bg-white/5 px-6 py-5">
                  <p className="text-sm text-white/70">¿Tu organización necesita algo parecido? Te armamos una propuesta a medida.</p>
                  <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar proyecto" className="w-full justify-center" />
                </div>
              </aside>
            </ScrollReveal>
          </div>
        </section>

        {fotos.length > 1 && (
          <section className="mx-auto max-w-7xl px-6 py-20">
            <ScrollReveal direction="up" className="mb-10">
              <SectionBadge>Galería</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
                <span className="text-ink">El proyecto en</span> <span className="title-shimmer-light">imágenes</span>
              </h2>
            </ScrollReveal>
            <GaleriaProyecto fotos={fotos} titulo={p.title} />
          </section>
        )}

        {videos.length > 0 && (
          <section className={`py-20 ${fotos.length > 1 ? 'bg-white' : ''}`}>
            <div className="mx-auto max-w-7xl px-6">
              <ScrollReveal direction="up" className="mb-10">
                <SectionBadge>En video</SectionBadge>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
                  <span className="text-ink">Mira el</span> <span className="title-shimmer-light">caso de éxito</span>
                </h2>
              </ScrollReveal>
              <div className={`grid gap-6 ${videos.length > 1 ? 'md:grid-cols-2' : 'mx-auto max-w-4xl'}`}>
                {videos.map((v) => (
                  <VideoYoutube key={v.id} id={v.id} titulo={v.titulo} grande={videos.length === 1} />
                ))}
              </div>
            </div>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-20">
            <ScrollReveal direction="up" className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionBadge>Más casos</SectionBadge>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
                  <span className="text-ink">Otros</span> <span className="title-shimmer-light">proyectos</span>
                </h2>
              </div>
              <Link href="/proyectos" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline">
                <ArrowLeft className="h-4 w-4" /> Todos los proyectos
              </Link>
            </ScrollReveal>
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {relacionados.map((o, i) => (
                <ScrollReveal key={o.title} direction="up" delayMs={i * 100} className="h-full">
                  <ProyectoCard p={o} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        <Contact />
      </main>
      <Footer />
    </>
  );
}

import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { SOLUTIONS } from '@/lib/content';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { ProcesoServicio } from '@/components/site/ProcesoServicio';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ServiceCardFinal } from '@/components/home/ServiceCardFinal';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = SOLUTIONS.find((s) => s.slug === slug);
  return { title: solution?.title ?? 'Servicio' };
}

// Lo que incluye cualquier proyecto (común a todos los servicios hasta tener
// el detalle real de cada uno desde el CMS).
const INCLUYE = [
  'Visita técnica y diagnóstico sin costo',
  'Diseño de la solución y cotización detallada',
  'Equipos de marcas autorizadas con garantía oficial',
  'Instalación, configuración y pruebas en sitio',
  'Capacitación a tu equipo',
  'Soporte técnico local post-implementación',
];

export default async function ServicioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) notFound();
  const otros = SOLUTIONS.filter((x) => x.slug !== s.slug).slice(0, 4);

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios', href: '/servicios' },
          { label: s.title, href: `/servicios/${s.slug}` },
        ]}
        badge={s.tag}
        titulo={s.title}
        destacado="a medida"
        descripcion={s.description}
        imagen={s.image}
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar este servicio" />
        <WhatsAppCta label="Hablar con un especialista" texto={`Hola, quiero información sobre ${s.title}`} />
      </PageHero>

      <main>
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <SectionBadge>Qué incluye</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Un servicio</span> <span className="title-shimmer-light">llave en mano</span>
              </h2>
              <p className="mt-4 text-ink/60">
                Nos encargamos de todo el proyecto de {s.title.toLowerCase()}: desde el diagnóstico hasta el soporte después de la entrega.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {INCLUYE.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-ink">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" strokeWidth={2} />
                    {t}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>
              <div className="overflow-hidden rounded-2xl shadow-2xl shadow-brand-dark/25">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.title} className="aspect-[4/3] w-full object-cover" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ProcesoServicio />

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <ScrollReveal direction="left">
              <SectionBadge>Otros servicios</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">También te</span> <span className="title-shimmer-light">puede interesar</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>
              <MoreInfoButton href="/servicios" label="Ver todos" />
            </ScrollReveal>
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {otros.map((item, i) => (
              <ScrollReveal key={item.slug} direction="up" delayMs={i * 100}>
                <ServiceCardFinal item={item} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}

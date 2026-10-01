import { notFound } from 'next/navigation';
import { CheckCircle2, Plus } from 'lucide-react';
import { getServicio, getServicios } from '@/lib/servicios';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { ProcesoServicio } from '@/components/site/ProcesoServicio';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ServiceCardFinal } from '@/components/home/ServiceCardFinal';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const servicio = await getServicio(slug);
  return { title: servicio?.title ?? 'Servicio', description: servicio?.description || undefined };
}

export default async function ServicioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [s, todos] = await Promise.all([getServicio(slug), getServicios()]);
  if (!s) notFound();
  const d = s.detalle;
  const otros = todos.filter((x) => x.slug !== s.slug).slice(0, 4);

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
                {d?.intro ?? s.description}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {(d?.incluye ?? []).map((t) => (
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

        {d && (
          <section className="mx-auto max-w-7xl px-6 py-20">
            <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
              <SectionBadge>Beneficios</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Por qué</span> <span className="title-shimmer-light">te conviene</span>
              </h2>
            </ScrollReveal>
            <div className="grid gap-6 md:grid-cols-3">
              {d.beneficios.map((b, i) => (
                <ScrollReveal key={b.titulo} direction="up" delayMs={i * 100} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25">
                    <span className="spin-border" aria-hidden />
                    <span className="font-display text-4xl font-bold text-brand-primary/15">0{i + 1}</span>
                    <h3 className="mt-2 font-display text-xl font-bold text-ink">{b.titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{b.texto}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        <ProcesoServicio />

        {d && (
          <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
              <ScrollReveal direction="left">
                <SectionBadge>Para quién</SectionBadge>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
                  <span className="text-ink">Sectores que</span> <span className="title-shimmer-light">atendemos</span>
                </h2>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {d.sectores.map((sec) => (
                    <span key={sec} className="rounded-lg border border-brand-dark/10 bg-white px-3.5 py-2 text-sm font-semibold text-brand-primary shadow-sm shadow-brand-dark/10">
                      {sec}
                    </span>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" delayMs={120}>
                <SectionBadge>Preguntas frecuentes</SectionBadge>
                <div className="mt-4 space-y-3">
                  {d.faqs.map((f) => (
                    <details key={f.p} className="group rounded-2xl bg-white p-5 shadow-md shadow-brand-dark/10 open:shadow-lg">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                        {f.p}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-transform duration-300 group-open:rotate-45">
                          <Plus className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-ink/65">{f.r}</p>
                    </details>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
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
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}

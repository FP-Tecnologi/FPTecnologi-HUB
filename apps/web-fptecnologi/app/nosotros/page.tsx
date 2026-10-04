import { Compass, Eye, HeartHandshake, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ImageHoverCard } from '@/components/home/ImageHoverCard';
import { CertificacionesISO } from '@/components/home/CertificacionesISO';
import { PartnerLevels } from '@/components/home/PartnerLevels';
import { BrandMarquee } from '@/components/home/BrandMarquee';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { NuestrosClientes } from '@/components/home/NuestrosClientes';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { getSitio } from '@/lib/sitio';
import { getPagina } from '@/lib/paginasContenido';
import { getClientes } from '@/lib/referencias';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () => metaSeo('nosotros', { title: 'Nosotros' });

/*
 * Nosotros -- mismo lenguaje que la home (DESIGN.md): hero interno, secciones
 * con badge + título en dos tonos, fondos alternados claros y cierre oscuro
 * (Contacto + Footer). Los textos se editan en el dashboard (Web informativa →
 * Nosotros); lib/paginasContenido.ts guarda los valores por defecto.
 */
const ICONOS_PILAR: LucideIcon[] = [Compass, Eye, HeartHandshake];

export default async function NosotrosPage() {
  const c = await getPagina('nosotros');
  const { stats: STATS } = await getSitio();
  const clientes = await getClientes();
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Nosotros', href: '/nosotros' },
        ]}
        badge={c.hero.badge}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        video="/images/home/about.mp4"
        imagen="/herobanner/partner izquierdo.jpg"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar" />
        <WhatsAppCta label="Contactar asesor" tone="dark" />
      </PageHero>

      <main>
        {/* Quiénes somos */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <ImageHoverCard siempre datos={STATS.map((s) => ({ value: `${s.value}${s.suffix}`, label: s.label }))}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/herobanner/partner izquierdo.jpg" alt="Equipo de FPTecnologi en reunión con clientes" />
              </ImageHoverCard>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>
              <SectionBadge>{c.quienes.badge}</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">{c.quienes.titulo}</span> <span className="title-shimmer-light">{c.quienes.destacado}</span>
              </h2>
              {c.quienes.parrafos.map((t, i) => (
                <p key={i} className={`${i === 0 ? 'mt-4' : 'mt-3'} text-justify text-ink/60`}>
                  {t}
                </p>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* Misión, visión, valores */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <SectionBadge>{c.proposito.badge}</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">{c.proposito.titulo}</span> <span className="title-shimmer-light">{c.proposito.destacado}</span>
            </h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {c.proposito.items.map(({ title: titulo, text: texto }, i) => {
              const Icon = ICONOS_PILAR[i % ICONOS_PILAR.length];
              return (
              <ScrollReveal key={titulo + i} direction="up" delayMs={i * 100} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25">
                  <span className="spin-border" aria-hidden />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/30">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 origin-left font-display text-xl font-bold text-brand-primary transition-transform duration-300 ease-out group-hover:scale-105">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{texto}</p>
                </div>
              </ScrollReveal>
              );
            })}
          </div>
        </section>

        <WhyChooseUs />
        <CertificacionesISO />
        <PartnerLevels conTitulo />
        <BrandMarquee />
        <NuestrosClientes sectors={clientes} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Handshake, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CotizadorForm } from '@/components/site/CotizadorForm';
import { FaqAcordeon } from '@/components/site/FaqAcordeon';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { ServiceCardFinal } from '@/components/home/ServiceCardFinal';
import { BrandMarquee } from '@/components/home/BrandMarquee';
import { Footer } from '@/components/home/Footer';
import { CONTACT_INFO, SOLUTIONS } from '@/lib/content';
import { whatsappHref } from '@/lib/chatActions';
import { getCotizadorContenido } from '@/lib/cotizadorContenido';

export const metadata = {
  title: 'Cotizador',
  description: 'Solicita tu cotización de servicios TI y equipamiento tecnológico en 3 pasos simples.',
};

// El contenido lo edita el equipo desde el dashboard (Cotizador → Formulario).
export const dynamic = 'force-dynamic';

const ICONOS: LucideIcon[] = [Sparkles, ShieldCheck, Handshake];

const CONTACTO: { label: string; value: string; href: string; icon: LucideIcon }[] = [
  { label: 'WhatsApp', value: CONTACT_INFO.phoneVentasWeb, href: whatsappHref('Hola, quiero cotizar con FPTecnologi'), icon: MessageCircle },
  { label: 'Ventas', value: CONTACT_INFO.phoneVentas, href: `tel:${CONTACT_INFO.phoneVentas.replace(/\s/g, '')}`, icon: Phone },
  { label: 'Correo', value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}`, icon: Mail },
  {
    label: 'Visítanos',
    value: CONTACT_INFO.address,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`,
    icon: MapPin,
  },
];

/* Cotizador -- punto de contacto con el cliente: formulario por pasos (los
   leads llegan al dashboard → Cotizador → Leads) acompañado de información:
   beneficios, cómo funciona, servicios, marcas y preguntas frecuentes. */
export default async function CotizadorPage({ searchParams }: { searchParams: Promise<{ interes?: string }> }) {
  const [c, { interes }] = await Promise.all([getCotizadorContenido(), searchParams]);

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Cotizador', href: '/cotizador' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
      />

      <main>
        {/* Formulario + panel informativo (el formulario sube sobre el borde del hero) */}
        <section className="bg-paper pb-20 pt-10 lg:pt-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[22rem_1fr] lg:items-start xl:grid-cols-[24rem_1fr]">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <aside className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-2xl shadow-brand-dark/30 sm:p-8 lg:sticky lg:top-28">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-dark/40 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-teal/30 blur-3xl" />
                <div className="relative">
                  <SectionBadge tone="dark">{c.hero.badge}</SectionBadge>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                    ¿Por qué cotizar <span className="title-shimmer-dark">con nosotros?</span>
                  </h2>

                  <ul className="mt-6 space-y-5">
                    {c.beneficios.items.map((b, i) => {
                      const Icon = ICONOS[i % ICONOS.length];
                      return (
                        <li key={i} className="flex gap-4">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-white shadow-lg shadow-black/30">
                            <Icon className="h-5 w-5" strokeWidth={1.8} />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold">{b.title}</h3>
                            <p className="mt-0.5 text-sm leading-relaxed text-white/65">{b.text}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="my-7 h-px bg-white/10" />

                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                    <Clock className="h-4 w-4" strokeWidth={2} /> ¿Prefieres hablar con alguien?
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {CONTACTO.map(({ label, value, href, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noreferrer' : undefined}
                        className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 transition-all duration-300 hover:border-brand-teal-light/50 hover:bg-white/10"
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${label === 'WhatsApp' ? 'text-whatsapp' : 'text-brand-teal-light'}`} strokeWidth={1.8} />
                        <span className="min-w-0">
                          <span className="block text-[11px] uppercase tracking-wide text-white/45">{label}</span>
                          <span className="block break-words text-sm font-medium">{value.replace('@', '​@')}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </aside>
            </ScrollReveal>

            <ScrollReveal direction="up" className="order-1 lg:order-2">
              <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-xl shadow-brand-dark/10 sm:p-10 lg:-mt-24">
                <CotizadorForm c={c} interesInicial={interes} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
              <SectionBadge>{c.proceso.badge}</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">{c.proceso.titulo}</span> <span className="title-shimmer-light">{c.proceso.destacado}</span>
              </h2>
            </ScrollReveal>
            <div className="grid gap-6 md:grid-cols-3">
              {c.proceso.items.map((p, i) => (
                <ScrollReveal key={i} direction="up" delayMs={i * 100} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-ink p-7 text-center shadow-lg shadow-brand-dark/25 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-2xl hover:shadow-brand-dark/45">
                    <span aria-hidden className="absolute -right-2 -top-4 font-display text-7xl font-bold text-white/5">
                      0{i + 1}
                    </span>
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary font-display text-xl font-bold text-white shadow-lg shadow-brand-dark/40">
                      {i + 1}
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-white">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{p.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Qué puedes cotizar */}
        <section className="bg-paper py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
              <SectionBadge>Qué puedes cotizar</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Soluciones TI</span> <span className="title-shimmer-light">para cada sector</span>
              </h2>
              <p className="mt-3 text-ink/60">Conoce lo que hacemos y pide tu cotización a medida.</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
              {SOLUTIONS.slice(0, 4).map((item, i) => (
                <ScrollReveal key={item.slug} direction="up" delayMs={i * 100}>
                  <ServiceCardFinal item={item} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <BrandMarquee />

        {/* Preguntas frecuentes */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <ScrollReveal direction="left">
              <SectionBadge>{c.faq.badge}</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">{c.faq.titulo}</span> <span className="title-shimmer-light">{c.faq.destacado}</span>
              </h2>
              <p className="mt-4 text-ink/60">¿No encuentras tu respuesta? Escríbenos y un asesor te ayuda.</p>
              <div className="mt-6">
                <WhatsAppCta label="Hablar con un asesor" texto="Hola, tengo una consulta sobre cotizar con FPTecnologi" />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>
              <FaqAcordeon items={c.faq.items} />
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

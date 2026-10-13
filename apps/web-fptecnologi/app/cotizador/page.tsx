import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Handshake, type LucideIcon } from 'lucide-react';
import { AREAS_CONTACTO, type AreaContacto } from '@/lib/areasContacto';
import { PageHero } from '@/components/site/PageHero';
import { CotizadorForm } from '@/components/site/CotizadorForm';
import { FaqAcordeon } from '@/components/site/FaqAcordeon';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { ServiciosCarrusel } from '@/components/site/ServiciosCarrusel';
import { ServiceCardFinal } from '@/components/home/ServiceCardFinal';
import { BrandMarquee } from '@/components/home/BrandMarquee';
import { Footer } from '@/components/home/Footer';
import { getSitio } from '@/lib/sitio';
import { getServicios } from '@/lib/servicios';
import { whatsappHref } from '@/lib/chatActions';
import { getCotizadorContenido } from '@/lib/cotizadorContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () =>
  metaSeo('cotizador', {
    title: 'Cotizador',
    description: 'Solicita tu cotización de servicios TI y equipamiento tecnológico en 3 pasos simples.',
  });

// El contenido lo edita el equipo desde el dashboard (Cotizador → Formulario).
export const dynamic = 'force-dynamic';

const ICONOS: LucideIcon[] = [Sparkles, ShieldCheck, Handshake];

// Tarjetas blancas sobre el panel azul; al pasar el cursor se oscurecen y el ícono salta (mismo efecto que Contacto por área).
const TARJETA_CONTACTO =
  'group flex items-center gap-3 rounded-xl bg-white p-4 text-ink shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-dark hover:text-white hover:shadow-2xl';
const ICONO_CONTACTO =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-white';

const AREAS_COTIZAR: AreaContacto['icono'][] = ['comercial', 'ventas', 'atencion'];

/* Cotizador -- punto de contacto con el cliente: formulario por pasos (los
   leads llegan al dashboard → Cotizador → Leads) acompañado de información:
   beneficios, cómo funciona, servicios, marcas y preguntas frecuentes. */
export default async function CotizadorPage({ searchParams }: { searchParams: Promise<{ interes?: string }> }) {
  const [c, { interes }, sitio] = await Promise.all([getCotizadorContenido(), searchParams, getSitio()]);

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
        {/* Formulario + panel informativo (alineados bajo el hero) */}
        <section className="bg-paper pb-20 pt-10 lg:pt-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[22rem_1fr] lg:items-center xl:grid-cols-[24rem_1fr]">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <aside className="relative overflow-hidden rounded-3xl bg-brand-primary p-7 text-white shadow-2xl shadow-brand-dark/30 sm:p-8">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-primary/40 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-teal/30 blur-3xl" />
                <div className="relative">
                  <SectionBadge tone="dark">{c.hero.badge}</SectionBadge>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                    Habla con <span className="title-shimmer-dark">un asesor</span>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Si prefieres no llenar el formulario, escríbenos o llámanos: cada área te atiende directo.</p>

                  <div className="mt-5 space-y-3">
                    <a
                      href={whatsappHref('Hola, quiero cotizar con FPTecnologi')}
                      target="_blank"
                      rel="noreferrer"
                      className={TARJETA_CONTACTO}
                    >
                      <span className={ICONO_CONTACTO}>
                        <MessageCircle className="icon-hop h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">WhatsApp</span>
                        <span className="block text-sm font-semibold">{sitio.contact.phoneVentasWeb}</span>
                      </span>
                    </a>
                    {AREAS_CONTACTO.filter((a) => AREAS_COTIZAR.includes(a.icono)).map((a) => (
                      <div key={a.area} className={`${TARJETA_CONTACTO} flex-col !items-stretch gap-0`}>
                        <div className="flex items-center gap-3">
                          <span className={ICONO_CONTACTO}>
                            <Phone className="icon-hop h-5 w-5" strokeWidth={1.8} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{a.area}</span>
                            <span className="block text-xs opacity-70">{a.descripcion}</span>
                          </span>
                        </div>
                        <a href={`tel:${a.telefono.replace(/\s/g, '')}`} className="mt-3 flex items-center gap-2 text-sm font-semibold">
                          <Phone className="h-4 w-4 shrink-0" strokeWidth={2} /> {a.telefono}
                        </a>
                        <a href={`mailto:${a.email}`} className="mt-1 flex items-center gap-2 break-all text-sm font-semibold">
                          <Mail className="h-4 w-4 shrink-0" strokeWidth={2} /> {a.email}
                        </a>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sitio.contact.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-start gap-2 text-xs text-white/65 transition hover:text-white"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal-light" strokeWidth={2} /> <span>Visítanos: {sitio.contact.address}</span>
                  </a>
                </div>
              </aside>
            </ScrollReveal>

            <ScrollReveal direction="up" className="order-1 lg:order-2">
              <div className="hover-lift rounded-3xl border border-ink/5 bg-white p-6 shadow-xl shadow-brand-dark/10 hover:shadow-2xl hover:shadow-brand-dark/20 sm:p-10">
                <CotizadorForm c={c} interesInicial={interes} />
              </div>
            </ScrollReveal>
          </div>
          <div className="mx-auto mt-10 grid max-w-7xl gap-5 px-6 md:grid-cols-3">
            {c.beneficios.items.map((b, i) => {
              const Icon = ICONOS[i % ICONOS.length];
              return (
                <ScrollReveal key={i} direction="up" delayMs={i * 100}>
                  <div className="group flex h-full gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary hover:shadow-[0_16px_32px_-10px_rgba(40,152,238,0.6)]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-primary">
                      <Icon className="icon-hop h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-ink transition-colors duration-300 group-hover:text-white">{b.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink/65 transition-colors duration-300 group-hover:text-white/90">{b.text}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
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
            <div className="relative grid gap-6 md:grid-cols-3">
              <div aria-hidden className="absolute left-[16%] right-[16%] top-[3.25rem] hidden border-t-2 border-dashed border-brand-primary/40 md:block" />
              {c.proceso.items.map((p, i) => (
                <ScrollReveal key={i} direction="up" delayMs={i * 100} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-100 bg-white p-7 text-center shadow-md shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary hover:shadow-[0_18px_36px_-12px_rgba(40,152,238,0.55)]">
                    <span aria-hidden className="absolute -right-1 -top-3 font-display text-8xl font-bold text-brand-primary/10 transition-colors duration-300 group-hover:text-brand-primary/20">
                      0{i + 1}
                    </span>
                    <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary font-display text-xl font-bold text-white shadow-lg shadow-brand-primary/40 ring-4 ring-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      {i + 1}
                    </span>
                    <h3 className="relative mt-5 font-display text-lg font-bold text-ink">{p.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink/65">{p.text}</p>
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
            <ServiciosCarrusel>
              {(await getServicios()).map((item) => (
                <div key={item.slug} className="w-[17rem] shrink-0 snap-start sm:w-72 [&>div]:!aspect-[4/5]">
                  <ServiceCardFinal item={item} />
                </div>
              ))}
            </ServiciosCarrusel>
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
                <WhatsAppCta tone="light" className="shadow-lg shadow-brand-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:!bg-brand-dark hover:shadow-xl" label="Contactar asesor" texto="Hola, tengo una consulta sobre cotizar con FPTecnologi" />
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

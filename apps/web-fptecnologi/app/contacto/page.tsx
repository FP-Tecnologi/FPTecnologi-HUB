import { Clock, MapPin } from 'lucide-react';
import { CONTACT_INFO, WHATSAPP_AREAS } from '@/lib/content';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { WhatsAppIcon } from '@/components/site/icons';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Contacto' };

const MAPA = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT_INFO.address)}&output=embed`;

/* Contacto -- asesores por área, mapa y horario, y al cierre el formulario +
   datos (sección Contacto de la home) (DESIGN.md). */
export default function ContactoPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Contacto', href: '/contacto' },
        ]}
        badge="Contacto"
        titulo="Hablemos de"
        destacado="tu próximo proyecto"
        descripcion="Escríbenos, llámanos o visítanos en Breña. Un asesor te responde en horario de oficina."
      >
        <WhatsAppCta label="Escríbenos por WhatsApp" />
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar" />
      </PageHero>

      <main>
        {/* Asesores por área */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
              <SectionBadge>Asesores</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Habla directo con</span> <span className="title-shimmer-light">el área que necesitas</span>
              </h2>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {WHATSAPP_AREAS.map((a, i) => (
                <ScrollReveal key={a.label} direction="up" delayMs={i * 100} className="h-full">
                  <a
                    href={`https://wa.me/${a.number}?text=${encodeURIComponent(`Hola ${a.contact}, quiero contactar al área de ${a.label} de FPTecnologi`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col items-center rounded-2xl bg-paper p-7 text-center shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25"
                  >
                    <span className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.photo} alt={a.contact} className="h-20 w-20 rounded-2xl rounded-bl-md object-cover shadow-lg shadow-brand-dark/25 ring-2 ring-whatsapp/70" />
                      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-whatsapp ring-2 ring-white" />
                    </span>
                    <span className="mt-4 rounded-md bg-whatsapp/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-whatsapp-dark">{a.label}</span>
                    <span className="mt-2 font-display text-lg font-bold text-ink">{a.contact}</span>
                    <span className="text-sm text-ink/60">+51 {a.phone}</span>
                    <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-semibold text-white shadow-md shadow-whatsapp/30 transition-colors group-hover:bg-whatsapp-dark">
                      <WhatsAppIcon className="h-4 w-4" />
                      Chatear
                    </span>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Mapa + horario */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <ScrollReveal direction="left">
              <div className="overflow-hidden rounded-2xl shadow-2xl shadow-brand-dark/20">
                <iframe title="Ubicación de FPTecnologi" src={MAPA} className="h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120} className="h-full">
              <div className="flex h-full flex-col gap-6 rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10">
                <div>
                  <SectionBadge>Visítanos</SectionBadge>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                    <span className="text-ink">Nuestra</span> <span className="title-shimmer-light">oficina</span>
                  </h2>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-dark/25">
                    <MapPin className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <p className="text-sm text-ink/70">{CONTACT_INFO.address}</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-dark/25">
                    <Clock className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <p className="text-sm text-ink/70">
                    Lunes a viernes, 9:00 a 18:00
                  </p>
                </div>
                <div className="mt-auto">
                  <MoreInfoButton
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`}
                    label="Cómo llegar"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Formulario + datos: bloque oscuro al cierre, como en la home. */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}

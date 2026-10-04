import { Clock, MapPin } from 'lucide-react';
import { WHATSAPP_AREAS } from '@/lib/content';
import { getSitio } from '@/lib/sitio';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { WhatsAppIcon } from '@/components/site/icons';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { AreasContacto } from '@/components/site/AreasContacto';
import { TicketsCta } from '@/components/site/TicketsCta';
import { Footer } from '@/components/home/Footer';
import { getPagina } from '@/lib/paginasContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () => metaSeo('contacto', { title: 'Contacto' });


/* Contacto -- contacto por área, formulario con motivo, mapa y horario, y al cierre
   la llamada a la página de tickets (/tickets). */
export default async function ContactoPage() {
  const [c, { contact: CONTACT_INFO }] = await Promise.all([getPagina('contacto'), getSitio()]);
  const MAPA = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT_INFO.address)}&output=embed`;
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Contacto', href: '/contacto' },
        ]}
        badge={c.hero.badge}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/images/modelo9/hero-office.jpg"
      >
        <WhatsAppCta label="WhatsApp" />
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar" />
      </PageHero>

      <main>
        <AreasContacto />

        {/* Formulario principal (sin tarjetas de datos: ya están en «Contacto por área»). */}
        <Contact completo />

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
                  <SectionBadge>{c.visita.badge}</SectionBadge>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                    <span className="text-ink">{c.visita.titulo}</span> <span className="title-shimmer-light">{c.visita.destacado}</span>
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
                  <p className="text-sm text-ink/70">{c.visita.horario}</p>
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

        {/* Cierre: llamada a la página de tickets. */}
        <TicketsCta />
      </main>
      <Footer />
    </>
  );
}

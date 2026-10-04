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
import { MapaVisita } from '@/components/site/MapaVisita';
import { Footer } from '@/components/home/Footer';
import { getPagina } from '@/lib/paginasContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () => metaSeo('contacto', { title: 'Contacto' });


/* Contacto -- contacto por área, formulario con motivo, mapa y horario, y al cierre
   la llamada a la página de tickets (/tickets). */
export default async function ContactoPage() {
  const [c, { contact: CONTACT_INFO }] = await Promise.all([getPagina('contacto'), getSitio()]);
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

        {/* Mapa con pin y opciones de ruta + tarjeta de dirección y horario */}
        <MapaVisita address={CONTACT_INFO.address} horario={c.visita.horario} badge={c.visita.badge} titulo={c.visita.titulo} destacado={c.visita.destacado} />

        {/* Cierre: llamada a la página de tickets. */}
        <TicketsCta />
      </main>
      <Footer />
    </>
  );
}

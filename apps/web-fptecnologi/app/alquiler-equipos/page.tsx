import { Cpu, Headset, Laptop, Monitor, PackageCheck, Presentation, Printer, RefreshCcw, Server, Truck, Wrench, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { TarjetasInfo } from '@/components/site/TarjetasInfo';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { getPagina } from '@/lib/paginasContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () =>
  metaSeo('alquiler', { title: 'Alquiler de equipos', description: 'Alquila laptops, PCs, monitores, servidores y más equipos IT para tu empresa. Entrega en 24 horas, atención de incidencias y cambio inmediato.' });
export const dynamic = 'force-dynamic';

// Los textos se editan en el dashboard; el ícono sale de la posición de cada tarjeta.
const ICONOS_BENEFICIOS: LucideIcon[] = [Truck, Headset, Wrench, RefreshCcw];
const ICONOS_EQUIPOS: LucideIcon[] = [Laptop, Cpu, Monitor, Server, Presentation, Printer];
const ICONOS_PASOS: LucideIcon[] = [PackageCheck, Truck, Headset];
const tarjetas = (items: { title: string; text: string }[], iconos: LucideIcon[]) =>
  items.map((it, i) => ({ icono: iconos[i % iconos.length], titulo: it.title, texto: it.text }));

export default async function AlquilerEquiposPage() {
  const c = await getPagina('alquiler');
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios', href: '/servicios' },
          { label: 'Alquiler de equipos', href: '/alquiler-equipos' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/images/solutions/soporte-tecnico.jpg"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="¡Quiero una cotización!" />
        <WhatsAppCta label="Hablar con un asesor" texto="Hola, quiero cotizar el alquiler de equipos" />
      </PageHero>
      <main>
        <TarjetasInfo {...c.beneficios} tarjetas={tarjetas(c.beneficios.items, ICONOS_BENEFICIOS)} />
        <TarjetasInfo {...c.equipos} tarjetas={tarjetas(c.equipos.items, ICONOS_EQUIPOS)} fondo="bg-paper" />
        <TarjetasInfo {...c.pasos} tarjetas={tarjetas(c.pasos.items, ICONOS_PASOS)} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

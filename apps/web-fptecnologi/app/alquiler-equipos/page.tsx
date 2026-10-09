import { Cpu, Headset, Laptop, Monitor, PackageCheck, Presentation, Printer, RefreshCcw, Server, Truck, Wrench } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { TarjetasInfo } from '@/components/site/TarjetasInfo';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';

export const metadata = {
  title: 'Alquiler de equipos',
  description: 'Alquila laptops, PCs, monitores, servidores y más equipos IT para tu empresa. Entrega en 24 horas, atención de incidencias y cambio inmediato.',
};

const BENEFICIOS = [
  { icono: Truck, titulo: 'Entrega en 24 horas', texto: 'Recibe los equipos dentro de las 24 horas de confirmado tu pedido.' },
  { icono: Headset, titulo: '+20 especialistas', texto: 'Un equipo técnico a tu disposición durante todo el alquiler.' },
  { icono: Wrench, titulo: 'Atención de incidencias', texto: 'Resolvemos cualquier problema rápido, sin que se detenga tu operación.' },
  { icono: RefreshCcw, titulo: 'Cambio inmediato', texto: 'Si un equipo falla, lo cambiamos de manera inmediata.' },
];

const EQUIPOS = [
  { icono: Laptop, titulo: 'Laptops', texto: 'Para equipos de trabajo, capacitaciones y eventos.' },
  { icono: Cpu, titulo: 'Computadoras', texto: 'PCs de escritorio y all-in-one listas para usar.' },
  { icono: Monitor, titulo: 'Monitores', texto: 'Pantallas para oficinas, salas y puestos temporales.' },
  { icono: Server, titulo: 'Servidores', texto: 'Capacidad de cómputo para proyectos y contingencias.' },
  { icono: Presentation, titulo: 'Proyectores y pantallas interactivas', texto: 'Para aulas, salas de reuniones y presentaciones.' },
  { icono: Printer, titulo: 'Impresoras', texto: 'Impresión para oficinas y operaciones temporales.' },
];

const PASOS = [
  { icono: PackageCheck, titulo: '1. Cotiza', texto: 'Indícanos la cantidad y el modelo de equipos que necesitas.' },
  { icono: Truck, titulo: '2. Recibe', texto: 'Coordinamos la logística y entregamos en 24 horas.' },
  { icono: Headset, titulo: '3. Usa con respaldo', texto: 'Soporte técnico y cambio inmediato durante todo el alquiler.' },
];

export default function AlquilerEquiposPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios', href: '/servicios' },
          { label: 'Alquiler de equipos', href: '/alquiler-equipos' },
        ]}
        titulo="Alquiler de equipos"
        destacado="a tu medida"
        descripcion="Cotiza la cantidad y el modelo de equipos que necesites: tenemos la mayor variedad de equipos IT para tu empresa y la mejor solución de garantías."
        imagen="/images/solutions/soporte-tecnico.jpg"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="¡Quiero una cotización!" />
        <WhatsAppCta label="Hablar con un asesor" texto="Hola, quiero cotizar el alquiler de equipos" />
      </PageHero>
      <main>
        <TarjetasInfo badge="Por qué alquilar con nosotros" titulo="Equipos listos," destacado="con respaldo" tarjetas={BENEFICIOS} />
        <TarjetasInfo badge="Qué puedes alquilar" titulo="Variedad de equipos" destacado="para tu empresa" tarjetas={EQUIPOS} fondo="bg-paper" />
        <TarjetasInfo badge="Cómo funciona" titulo="Alquilar es" destacado="simple" tarjetas={PASOS} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

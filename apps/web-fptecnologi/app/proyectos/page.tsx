import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { ProyectosListado } from '@/components/site/ProyectosListado';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { NuestrosProyectos } from '@/components/home/NuestrosProyectos';
import { NuestrosClientes } from '@/components/home/NuestrosClientes';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { HOME_DEFAULTS } from '@/lib/homeContenido';

export const metadata = { title: 'Proyectos' };

/* Proyectos -- listado filtrable por región, mapa del Perú (sección de la
   home) y clientes; cierre con Contacto (DESIGN.md). Datos de ejemplo en
   lib/projects.ts hasta cargar los reales. */
export default function ProyectosPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Proyectos', href: '/proyectos' },
        ]}
        titulo="Proyectos que ya"
        destacado="funcionan en todo el Perú"
        descripcion="Seguridad ciudadana, educación, data centers, videoconferencia y cloud: implementaciones reales, de la visita técnica al soporte."
        imagen="/images/solutions/seguridad.jpg"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar un proyecto" />
        <WhatsAppCta label="Hablar con un especialista" texto="Hola, quiero información sobre un proyecto" />
      </PageHero>
      <main>
        <ProyectosListado />
        <NuestrosProyectos c={{ ...HOME_DEFAULTS.proyectos, badge: 'Mapa de proyectos', titulo: 'Presencia en', destacado: 'todo el país' }} />
        <NuestrosClientes />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

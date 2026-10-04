import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { ProyectosListado } from '@/components/site/ProyectosListado';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { NuestrosProyectos } from '@/components/home/NuestrosProyectos';
import { NuestrosClientes } from '@/components/home/NuestrosClientes';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { HOME_DEFAULTS } from '@/lib/homeContenido';
import { getPagina } from '@/lib/paginasContenido';
import { getClientes, getProyectos } from '@/lib/referencias';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () => metaSeo('proyectos', { title: 'Proyectos' });

/* Proyectos -- listado filtrable por región, mapa del Perú (sección de la
   home) y clientes; cierre con Contacto (DESIGN.md). Datos de ejemplo en
   lib/projects.ts hasta cargar los reales. */
export default async function ProyectosPage() {
  const c = await getPagina('proyectos');
  const [proyectos, clientes] = await Promise.all([getProyectos(), getClientes()]);
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Proyectos', href: '/proyectos' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/images/solutions/seguridad.jpg"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar proyecto" />
        <WhatsAppCta label="Contactar especialista" texto="Hola, quiero información sobre un proyecto" />
      </PageHero>
      <main>
        <ProyectosListado projects={proyectos} />
        <NuestrosProyectos
          c={{ ...HOME_DEFAULTS.proyectos, badge: 'Mapa de proyectos', titulo: 'Presencia en', destacado: 'todo el país' }}
          projects={proyectos}
        />
        <NuestrosClientes sectors={clientes} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

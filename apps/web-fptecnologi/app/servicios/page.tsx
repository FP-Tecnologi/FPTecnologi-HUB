import { getPagina } from '@/lib/paginasContenido';
import { getServicios } from '@/lib/servicios';
import { getProyectos } from '@/lib/referencias';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { ProcesoServicio } from '@/components/site/ProcesoServicio';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ServiceCardFinal } from '@/components/home/ServiceCardFinal';
import { NuestrosProyectos } from '@/components/home/NuestrosProyectos';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () => metaSeo('servicios', { title: 'Servicios' });

/* Servicios -- listado completo con las mismas tarjetas de la home, el
   proceso de trabajo, proyectos y cierre con Contacto (DESIGN.md). */
export default async function ServiciosPage() {
  const c = await getPagina('servicios');
  const [servicios, proyectos] = await Promise.all([getServicios(), getProyectos()]);
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios', href: '/servicios' },
        ]}
        badge={c.hero.badge}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/herobanner/Servicios.png"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar servicio" />
        <WhatsAppCta label="Contactar especialista" texto="Hola, quiero información sobre sus servicios TI" />
      </PageHero>

      <main>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <SectionBadge>{c.listado.badge}</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">{c.listado.titulo}</span> <span className="title-shimmer-light">{c.listado.destacado}</span>
            </h2>
            {c.listado.descripcion && <p className="mt-3 text-ink/60">{c.listado.descripcion}</p>}
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {servicios.map((item, i) => (
              <ScrollReveal key={item.slug} direction="up" delayMs={(i % 4) * 100}>
                <ServiceCardFinal item={item} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ProcesoServicio />
        <NuestrosProyectos projects={proyectos} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

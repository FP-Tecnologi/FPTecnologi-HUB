import { SOLUTIONS } from '@/lib/content';
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

export const metadata = { title: 'Servicios' };

/* Servicios -- listado completo con las mismas tarjetas de la home, el
   proceso de trabajo, proyectos y cierre con Contacto (DESIGN.md). */
export default function ServiciosPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicios', href: '/servicios' },
        ]}
        badge="Servicios TI"
        titulo="Soluciones tecnológicas"
        destacado="a medida de tu empresa"
        descripcion="Seguridad, videoconferencia, cloud, data centers y más — diseñados, instalados y soportados por nuestros especialistas."
        imagen="/herobanner/Servicios.png"
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar servicio" />
        <WhatsAppCta label="Hablar con un especialista" texto="Hola, quiero información sobre sus servicios TI" />
      </PageHero>

      <main>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <SectionBadge>Nuestros servicios</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">Servicios TI</span> <span className="title-shimmer-light">para cada sector</span>
            </h2>
            <p className="mt-3 text-ink/60">Elige el servicio y conoce cómo lo implementamos en tu empresa.</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {SOLUTIONS.map((item, i) => (
              <ScrollReveal key={item.slug} direction="up" delayMs={(i % 4) * 100}>
                <ServiceCardFinal item={item} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ProcesoServicio />
        <NuestrosProyectos />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

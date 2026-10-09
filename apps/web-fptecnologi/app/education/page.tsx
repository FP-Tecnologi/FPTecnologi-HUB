import { BookOpen, CalendarCheck, GraduationCap, MonitorPlay } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { TarjetasInfo } from '@/components/site/TarjetasInfo';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';

export const metadata = {
  title: 'FP Education',
  description: 'Tecnología para el aula: coordina una visita a tu institución y conoce en vivo las soluciones de nuestras marcas aliadas.',
};

const TARJETAS = [
  { icono: CalendarCheck, titulo: 'Coordina una visita a tu institución', texto: 'Llevamos la mejor tecnología a tus aulas para que la conozcas y pruebes en vivo, de la mano de un especialista que te enseñará cada uno de sus beneficios.' },
  { icono: BookOpen, titulo: 'Aprende sobre la tecnología en el aula', texto: 'Descubre cómo implementar de la mejor manera tu institución con nuestras marcas aliadas, todas con beneficios increíbles.' },
  { icono: GraduationCap, titulo: 'Elige el equipo que se amolda a ti', texto: 'Te orientamos para escoger el equipo que más se ajusta a las necesidades de tu institución.' },
];

export default function EducationPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'FP Education', href: '/education' },
        ]}
        titulo="FP"
        destacado="Education"
        descripcion="Tecnología para el aula: lleva a tu institución las mejores soluciones, con acompañamiento de un especialista."
        imagen="/images/solutions/escuelas.jpg"
      >
        <WhatsAppCta label="Coordinar una visita" texto="Hola, quiero coordinar una visita a mi institución (FP Education)" />
        <MoreInfoButton tone="dark" href="/servicios/escuelas-y-universidades" label="Soluciones para escuelas" />
      </PageHero>
      <main>
        <TarjetasInfo badge="Tecnología en el aula" titulo="Aprende y prueba" destacado="en tu institución" tarjetas={TARJETAS} />
        <section className="bg-paper py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
            <MonitorPlay className="h-10 w-10 text-brand-primary" strokeWidth={1.6} />
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Mira las soluciones en acción</h2>
            <p className="text-ink/65">Conoce en video cómo nuestras marcas aliadas transforman el aula, o revisa los equipos disponibles en la tienda.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <MoreInfoButton tone="light" href="/tienda" label="Ir a la tienda" />
              <a href="https://www.youtube.com/@fptecnologisystem" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-primary hover:text-white">
                Ver más en YouTube
              </a>
            </div>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  );
}

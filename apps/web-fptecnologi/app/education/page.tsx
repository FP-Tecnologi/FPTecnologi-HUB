import { BookOpen, CalendarCheck, GraduationCap, MonitorPlay, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { TarjetasInfo } from '@/components/site/TarjetasInfo';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { getPagina } from '@/lib/paginasContenido';
import { metaSeo } from '@/lib/seo';

export const generateMetadata = () =>
  metaSeo('education', { title: 'FP Education', description: 'Tecnología para el aula: coordina una visita a tu institución y conoce en vivo las soluciones de nuestras marcas aliadas.' });
export const dynamic = 'force-dynamic';

const ICONOS: LucideIcon[] = [CalendarCheck, BookOpen, GraduationCap];

export default async function EducationPage() {
  const c = await getPagina('education');
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'FP Education', href: '/education' },
        ]}
        titulo={c.hero.titulo}
        destacado={c.hero.destacado}
        descripcion={c.hero.descripcion}
        imagen="/images/solutions/escuelas.jpg"
      >
        <WhatsAppCta label="Coordinar una visita" texto="Hola, quiero coordinar una visita a mi institución (FP Education)" />
        <MoreInfoButton tone="dark" href="/servicios/escuelas-y-universidades" label="Soluciones para escuelas" />
      </PageHero>
      <main>
        <TarjetasInfo {...c.tarjetas} tarjetas={c.tarjetas.items.map((it, i) => ({ icono: ICONOS[i % ICONOS.length], titulo: it.title, texto: it.text }))} />
        <section className="bg-paper py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
            <MonitorPlay className="h-10 w-10 text-brand-primary" strokeWidth={1.6} />
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{c.accion.titulo}</h2>
            <p className="text-ink/65">{c.accion.texto}</p>
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

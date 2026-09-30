import { Compass, Eye, HeartHandshake, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { WhatsAppCta } from '@/components/site/WhatsAppCta';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { BrandMarquee } from '@/components/home/BrandMarquee';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { NuestrosClientes } from '@/components/home/NuestrosClientes';
import { Contact } from '@/components/home/Contact';
import { Footer } from '@/components/home/Footer';
import { STATS } from '@/lib/content';

export const metadata = { title: 'Nosotros' };

/*
 * Nosotros -- mismo lenguaje que la home (DESIGN.md): hero interno, secciones
 * con badge + título en dos tonos, fondos alternados claros y cierre oscuro
 * (Contacto + Footer). Textos provisionales: se conectan al CMS del
 * dashboard en la siguiente etapa.
 */
const PILARES: { icon: LucideIcon; titulo: string; texto: string }[] = [
  {
    icon: Compass,
    titulo: 'Misión',
    texto: 'Equipar a las empresas peruanas con la tecnología correcta para su operación, con asesoría honesta, stock local y soporte técnico cercano.',
  },
  {
    icon: Eye,
    titulo: 'Visión',
    texto: 'Ser el aliado tecnológico de referencia para empresas e instituciones del Perú, reconocido por cumplir lo que promete.',
  },
  {
    icon: HeartHandshake,
    titulo: 'Valores',
    texto: 'Transparencia en cada cotización, compromiso con los plazos y relaciones de largo plazo con clientes y partners.',
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Nosotros', href: '/nosotros' },
        ]}
        badge="Nosotros"
        titulo="Tecnología empresarial con"
        destacado="respaldo real y soporte local"
        descripcion="Somos FPTecnologi & System: distribuimos las principales marcas de tecnología y diseñamos soluciones TI a medida para empresas e instituciones de todo el Perú."
      >
        <MoreInfoButton tone="dark" href="/cotizador" label="Cotizar" />
        <WhatsAppCta label="Hablar con un asesor" tone="dark" />
      </PageHero>

      <main>
        {/* Quiénes somos */}
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <div className="overflow-hidden rounded-2xl shadow-2xl shadow-brand-dark/25">
                <video src="/images/home/about.mp4" autoPlay muted loop playsInline className="aspect-[4/3] w-full object-cover" aria-label="Video institucional FPTecnologi" />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delayMs={120}>
              <SectionBadge>Quiénes somos</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Más de una década</span> <span className="title-shimmer-light">equipando empresas</span>
              </h2>
              <p className="mt-4 text-justify text-ink/60">
                Ayudamos a empresas a equiparse con la tecnología correcta: distribución autorizada de las principales marcas, stock local
                listo para despachar y un equipo técnico que arma cada propuesta a medida de tu operación.
              </p>
              <p className="mt-3 text-justify text-ink/60">
                Trabajamos en dos líneas: una tienda B2B con equipamiento en stock y servicios TI por proyecto — seguridad, videoconferencia,
                cloud y data centers — con diseño, instalación y soporte de nuestros propios especialistas.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-brand-dark/10 bg-paper px-4 py-5 text-center shadow-md shadow-brand-dark/10">
                    <p className="font-display text-3xl font-bold text-brand-primary">
                      {s.value}
                      {s.suffix}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-snug text-ink/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Misión, visión, valores */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <SectionBadge>Lo que nos mueve</SectionBadge>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">Nuestro</span> <span className="title-shimmer-light">propósito</span>
            </h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {PILARES.map(({ icon: Icon, titulo, texto }, i) => (
              <ScrollReveal key={titulo} direction="up" delayMs={i * 100} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25">
                  <span className="spin-border" aria-hidden />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/30">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{texto}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <WhyChooseUs />
        <BrandMarquee />
        <NuestrosClientes />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

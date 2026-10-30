import type { Metadata } from 'next';
import { BadgeCheck, CreditCard, IdCard, MousePointerClick } from 'lucide-react';
import { StickyNav } from '@/components/home/StickyNav';
import { Navbar9 } from '@/components/home/Navbar9';
import { Footer } from '@/components/home/Footer';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { AbanicoBbva, LogoBbva } from '@/components/site/BannerBbva';
import { TarjetasBbvaVitrina } from '@/components/site/TarjetasBbvaVitrina';
import { TarjetasBbvaForm } from '@/components/site/TarjetasBbvaForm';

export const metadata: Metadata = {
  title: 'Tarjetas de crédito BBVA',
  description: 'Consulta con tu DNI qué tarjetas de crédito BBVA tienes preaprobadas y solicítalas en minutos.',
};

const PASOS = [
  { icon: IdCard, titulo: 'Ingresa tus datos', texto: 'DNI, fecha de nacimiento, celular y correo.' },
  { icon: BadgeCheck, titulo: 'BBVA evalúa tu perfil', texto: 'Te muestra al instante las tarjetas que tienes disponibles.' },
  { icon: MousePointerClick, titulo: 'Elige tu tarjeta', texto: 'Compara línea de crédito y tasa, y elige la que prefieras.' },
  { icon: CreditCard, titulo: 'Solicítala con BBVA', texto: 'Terminas la solicitud en la web o la app de BBVA.' },
];

/* Tarjetas BBVA -- hero con el formulario de consulta (API Cards offer de BBVA) y cómo funciona. */
export default function TarjetasBbvaPage() {
  return (
    <>
      <StickyNav />
      <div className="bg-paper p-3 md:p-5">
        <section className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#070E46] via-[#001391] to-[#0a2bd6] md:rounded-[2.25rem]">
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#85C8FF]/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#1973e8]/30 blur-3xl" />
          <div className="invisible w-full" aria-hidden>
            <Navbar9 />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-16 lg:pt-20">
            <div className="text-white">
              <div className="flex flex-wrap items-center gap-3">
                <LogoBbva blanco className="h-5 sm:h-6" />
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#85C8FF] backdrop-blur sm:text-xs">
                  FP Tecnologi · Aliado BBVA
                </span>
              </div>
              <h1 className="mt-5 font-display text-[2rem] font-bold leading-[1.15] sm:text-5xl sm:leading-tight">
                Descubre qué tarjeta BBVA <span className="text-[#85C8FF]">tienes preaprobada</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/85 sm:mt-5 sm:text-lg">
                Consulta con tu DNI en menos de un minuto y mira las tarjetas de crédito que BBVA tiene para ti, con su línea de crédito y tasa.
              </p>
              <AbanicoBbva className="mt-4 hidden w-full max-w-sm sm:block" />
            </div>
            <div id="consulta" className="scroll-mt-28">
              <TarjetasBbvaForm />
            </div>
          </div>
        </section>
      </div>

      <main id="como-funciona" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">¿Cómo</span> <span className="title-shimmer-light">funciona?</span>
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p, i) => (
              <ScrollReveal key={p.titulo} delayMs={i * 110}>
                <li className="h-full rounded-2xl bg-paper p-6 shadow-md shadow-brand-dark/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#001391] text-white">
                    <p.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-4 text-xs font-semibold text-[#001391]">Paso {i + 1}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink">{p.titulo}</h3>
                  <p className="mt-2 text-sm text-ink/65">{p.texto}</p>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </main>

      <TarjetasBbvaVitrina />
      <p className="bg-paper px-6 pb-16 text-center text-xs text-ink/60">
        <span className="mx-auto block max-w-3xl">
          Las ofertas, líneas de crédito y tasas las define BBVA Perú según tu evaluación crediticia y están sujetas a su aprobación final. FP Tecnologi solo facilita la consulta; la contratación se realiza directamente con BBVA.
        </span>
      </p>
      <Footer />
    </>
  );
}

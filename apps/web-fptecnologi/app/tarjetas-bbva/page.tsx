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
  { icon: IdCard, etiqueta: 'Menos de 1 minuto', titulo: 'Ingresa tus datos', texto: 'DNI, fecha de nacimiento, celular y correo.' },
  { icon: BadgeCheck, etiqueta: 'Al instante', titulo: 'BBVA evalúa tu perfil', texto: 'Te muestra las tarjetas que tienes disponibles.' },
  { icon: MousePointerClick, etiqueta: 'Tú decides', titulo: 'Elige tu tarjeta', texto: 'Compara línea de crédito y tasa, y elige la que prefieras.' },
  { icon: CreditCard, etiqueta: 'Web o app de BBVA', titulo: 'Solicítala con BBVA', texto: 'Terminas la solicitud directamente con el banco.' },
];

/* Tarjetas BBVA -- hero con el formulario de consulta (API Cards offer de BBVA) y cómo funciona. */
export default function TarjetasBbvaPage() {
  return (
    <>
      <StickyNav />
      <div className="bg-paper p-3 md:p-5">
        <section className="relative flex min-h-[calc(100svh-1.5rem)] flex-col overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#070E46] via-[#001391] to-[#0a2bd6] md:rounded-[2.25rem] md:min-h-[calc(100svh-2.5rem)]">
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#85C8FF]/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#1973e8]/30 blur-3xl" />
          <div className="invisible w-full shrink-0" aria-hidden>
            <Navbar9 />
          </div>
          <div className="relative flex w-full flex-1 items-center pb-10 pt-12 sm:py-12 lg:py-16">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10">
            <div className="text-center text-white lg:text-left">
              <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
                <LogoBbva blanco className="h-4 sm:h-6" />
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#85C8FF] backdrop-blur sm:px-3 sm:text-xs sm:tracking-[0.16em]">
                  FP Tecnologi · Aliado BBVA
                </span>
              </div>
              <h1 className="mt-4 font-display text-[1.75rem] font-bold leading-[1.15] sm:mt-5 sm:text-[2.5rem] sm:leading-tight lg:text-5xl">
                Descubre qué tarjeta BBVA <span className="text-[#85C8FF]">tienes preaprobada</span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-[0.95rem] leading-relaxed text-white/85 sm:mt-5 sm:text-lg lg:mx-0">
                Consulta con tu DNI en menos de un minuto y mira las tarjetas de crédito que BBVA tiene para ti, con su línea de crédito y tasa.
              </p>
              <AbanicoBbva className="mx-auto mt-2 hidden w-full max-w-[15rem] sm:[@media(min-height:820px)]:block lg:mt-4 lg:max-w-sm lg:mx-0" />
            </div>
            <div id="consulta" className="mx-auto w-full max-w-xl scroll-mt-28 lg:max-w-none">
              <TarjetasBbvaForm />
            </div>
          </div>
          </div>
        </section>
      </div>

      <main id="como-funciona" className="bg-paper py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              <span className="text-ink">¿Cómo</span> <span className="title-shimmer-light">funciona?</span>
            </h2>
            <p className="mt-3 text-ink/65">Cuatro pasos, sin papeleo ni costo: consultas aquí en un minuto y terminas tu solicitud directamente con BBVA.</p>
          </div>

          {/* Línea de tiempo: el número va una sola vez, en el marcador sobre la línea que une los pasos. */}
          <div className="relative mt-8 sm:mt-12">
            <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-0.5 bg-gradient-to-r from-[#85C8FF] via-[#001391]/40 to-[#85C8FF] lg:block" />
            <div aria-hidden className="absolute bottom-6 left-6 top-6 w-0.5 bg-gradient-to-b from-[#85C8FF] via-[#001391]/40 to-[#85C8FF] sm:hidden" />
            <ol className="relative grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {PASOS.map((p, i) => (
                <li key={p.titulo} className="group flex gap-4 lg:flex-col lg:items-center lg:gap-5">
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#001391] bg-white font-display text-lg font-extrabold text-[#001391] shadow-md shadow-[#001391]/15 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-[#001391] group-hover:text-white">
                    {i + 1}
                  </span>
                  <ScrollReveal delayMs={i * 110} className="w-full flex-1">
                    <div className="relative h-full overflow-hidden rounded-2xl bg-white p-6 shadow-md shadow-brand-dark/10 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-[#001391]/20 lg:text-center">
                      <div className="flex items-center justify-between gap-3 lg:flex-col">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#85C8FF]/25 text-[#001391] transition-transform duration-300 group-hover:scale-110">
                          <p.icon className="h-5 w-5" strokeWidth={2} />
                        </span>
                        <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-[#004481]">{p.etiqueta}</span>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold text-ink">{p.titulo}</h3>
                      <p className="mt-2 text-sm text-ink/65">{p.texto}</p>
                      <span aria-hidden className="absolute inset-x-6 bottom-0 h-1 origin-left scale-x-0 rounded-full bg-[#001391] transition-transform duration-300 group-hover:scale-x-100 lg:origin-center" />
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>

      <TarjetasBbvaVitrina />
      <p className="bg-white px-6 pb-16 text-center text-xs text-ink/60">
        <span className="mx-auto block max-w-3xl">
          Las ofertas, líneas de crédito y tasas las define BBVA Perú según tu evaluación crediticia y están sujetas a su aprobación final. FP Tecnologi solo facilita la consulta; la contratación se realiza directamente con BBVA.
        </span>
      </p>
      <Footer />
    </>
  );
}

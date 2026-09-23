'use client';

import { COMPANY_VALUES, STATS } from '@/lib/content';
import { ClickConfirmButton } from './ClickConfirmButton';
import { ScrollReveal } from './ScrollReveal';
import { SparkleIcon, ArrowUpRightIcon } from '@/components/site/icons';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* "Nosotros" corta de la estructura final (ver docs/estructura-home.md) --
   antes tenía las 3 métricas de STATS (usadas en otros modelos, ver
   content.ts); acá se reemplazaron por un checklist de valores de la
   empresa (COMPANY_VALUES) -- un número suelto no dice nada de por qué
   elegir a FPTecnologi, un check con el motivo sí. Cada ítem entra con su
   propio ScrollReveal escalonado (delayMs creciente) para que se sientan
   "en cascada" al hacer scroll, no todos de golpe. */
export function Nosotros() {
  return (
    // bg-white en la sección completa (no solo en el contenido) -- para que
    // se note como una franja blanca propia, distinta del fondo con
    // puntitos del resto de la página y del bg-paper de la sección de marcas.
    <section id="nosotros" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Mismo video que el "Sobre nosotros" de /modelo-12 (about.mp4).
            La foto del equipo queda como poster mientras carga.
            Hover: zoom leve + degradado + tarjeta de vidrio con STATS que
            sube. En pantallas táctiles (sin hover) queda siempre visible. */}
        <ScrollReveal direction="left" className="group relative aspect-4/3 overflow-hidden rounded-2xl">
          <video
            src="/images/home/about.mp4"
            poster="/images/modelo7/equipo.jpg"
            autoPlay
            loop
            muted
            playsInline
            aria-label="Video institucional FPTecnologi"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-dark/80 via-brand-dark/10 to-transparent transition-opacity duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-around gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md transition-all duration-500 ease-out motion-reduce:transition-none [@media(hover:hover)]:translate-y-6 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-xl font-bold sm:text-2xl">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="text-[11px] leading-tight text-white/80 sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          {/* Mismo fondo "píldora de vidrio" + ícono que el badge del Hero
              (border + bg translúcido + backdrop-blur + SparkleIcon, ver
              Hero.tsx), acá en tonos de marca en vez de blanco/celeste
              porque el fondo de esta sección es blanco, no un video oscuro. */}
          {/* El nombre de la empresa va acá (antes en el título) -- el
              título ya no lo repite. */}
          <span className="mb-2 inline-flex w-fit items-center gap-2 rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-brand-primary backdrop-blur-md">
            <SparkleIcon className="h-4 w-4" />
            FPTecnologi & System
          </span>
          {/* Mismo lenguaje de dos colores + brillo en movimiento que el
              título del Hero (.hero-title-shimmer): línea 1 en color sólido
              normal, línea 2 con el degradé animado -- acá en su variante
              clara (.title-shimmer-light, sin blanco) porque el fondo de
              esta sección es blanco, no oscuro. */}
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="block text-ink">Tecnología empresarial con</span>
            <span className="title-shimmer-light block">respaldo real y soporte local</span>
          </h2>
          <p className="mt-4 max-w-lg text-justify text-ink/60">
            Más de una década ayudando a empresas a equiparse con la tecnología correcta: distribución autorizada de
            las principales marcas, stock local listo para despachar y un equipo técnico que arma cada propuesta a
            medida de tu operación.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {COMPANY_VALUES.map((value, i) => (
              <ScrollReveal key={value.title} direction="up" delayMs={150 + i * 100}>
                <div className="flex items-center gap-3">
                  {/* Chip con degradé de marca en movimiento (.value-check-glow,
                      ver globals.css) en vez de un color plano -- mismo
                      lenguaje "vivo" que el resto de acentos animados de la
                      página. */}
                  <span className="value-check-glow flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="font-medium text-ink">{value.title}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Botón primario sólido -- mismo estilo que "Cotizar" del Navbar9
              (bg-brand-dark, mayúscula, ícono que gira 45° al hover), no el
              link de texto liso que usan las tarjetas de servicio. Redirige
              a la página completa de Nosotros (app/nosotros/page.tsx). */}
          {/* Mismo botón sweep que "Cotizar": ícono a la izquierda, al click
              viaja al otro lado mientras se borra el texto y recién ahí
              navega a /nosotros. */}
          {/* max-w-lg igual que el párrafo: el botón queda alineado a su
              borde derecho. */}
          <div className="mt-6 flex max-w-lg justify-end">
            <ClickConfirmButton
              icon={(rotated) => (
                <span className="flex items-center justify-center rounded-lg bg-white/20 p-1 md:p-1.5">
                  <ArrowUpRightIcon className={`h-4 w-4 text-white transition-transform duration-300 md:h-5 md:w-5 ${rotated ? 'rotate-45' : ''}`} />
                </span>
              )}
              label="Más información"
              doneIcon={() => (
                <span className="flex items-center justify-center rounded-lg bg-white/20 p-1 md:p-1.5">
                  <ArrowUpRightIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
                </span>
              )}
              doneLabel="Más información"
              onConfirm={() => {
                window.location.href = '/nosotros';
              }}
              className="h-10 items-center rounded-xl bg-brand-dark pl-2 pr-5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-primary md:h-11 md:pr-6 md:text-sm 2xl:h-12 2xl:text-base"
              doneClassName="h-10 items-center rounded-xl bg-brand-primary pl-2 pr-5 text-xs font-semibold uppercase tracking-wide text-white md:h-11 md:pr-6 md:text-sm 2xl:h-12 2xl:text-base"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

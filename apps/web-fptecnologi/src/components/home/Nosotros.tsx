'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { useSitio } from '@/context/SitioContext';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';
import { ImageHoverCard } from './ImageHoverCard';
import { SegmentVideo } from './SegmentVideo';

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
export function Nosotros({ c = HOME_DEFAULTS.nosotros }: { c?: Encabezado & { puntos: string[] } }) {
  const { stats: STATS } = useSitio();
  return (
    // bg-white en la sección completa (no solo en el contenido) -- para que
    // se note como una franja blanca propia, distinta del fondo con
    // puntitos del resto de la página y del bg-paper de la sección de marcas.
    <section id="nosotros" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Fragmento corto (segundos 6 a 12) en bucle del video del hero (about.mp4,
            tonos azules de la paleta; el video de la oficina era verdoso).
            Hover: zoom leve + degradado + tarjeta de vidrio con STATS que
            sube. En pantallas táctiles (sin hover) queda siempre visible. */}
        <ScrollReveal direction="left">
          <ImageHoverCard datos={STATS.map((s) => ({ value: `${s.value}${s.suffix}`, label: s.label }))}>
            <SegmentVideo
              src="/images/home/about.mp4"
              start={6}
              end={12}
              aria-label="Video institucional FPTecnologi"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </ImageHoverCard>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          {/* Mismo fondo "píldora de vidrio" + ícono que el badge del Hero
              (border + bg translúcido + backdrop-blur + SparkleIcon, ver
              Hero.tsx), acá en tonos de marca en vez de blanco/celeste
              porque el fondo de esta sección es blanco, no un video oscuro. */}
          {/* El nombre de la empresa va acá (antes en el título) -- el
              título ya no lo repite. */}
          <SectionBadge>{c.badge}</SectionBadge>
          {/* Mismo lenguaje de dos colores + brillo en movimiento que el
              título del Hero (.hero-title-shimmer): línea 1 en color sólido
              normal, línea 2 con el degradé animado -- acá en su variante
              clara (.title-shimmer-light, sin blanco) porque el fondo de
              esta sección es blanco, no oscuro. */}
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span>{' '}
            <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
          <p className="mt-4 max-w-lg text-justify text-ink/60">
            {c.descripcion}
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {c.puntos.map((title, i) => (
              <ScrollReveal key={i} direction="up" delayMs={150 + i * 100}>
                <div className="flex items-center gap-3">
                  {/* Chip con degradé de marca en movimiento (.value-check-glow,
                      ver globals.css) en vez de un color plano -- mismo
                      lenguaje "vivo" que el resto de acentos animados de la
                      página. */}
                  <span className="value-check-glow flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="font-medium text-ink">{title}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Botón primario sólido -- mismo estilo que "Cotizar" del Navbar9
              (bg-brand-primary, mayúscula, ícono que gira 45° al hover), no el
              link de texto liso que usan las tarjetas de servicio. Redirige
              a la página completa de Nosotros (app/nosotros/page.tsx). */}
          {/* Mismo botón sweep que "Cotizar": ícono a la izquierda, al click
              viaja al otro lado mientras se borra el texto y recién ahí
              navega a /nosotros. */}
          {/* max-w-lg igual que el párrafo: el botón queda alineado a su
              borde derecho. */}
          <div className="mt-6 flex max-w-lg justify-end">
            <MoreInfoButton href={c.botonUrl || '/nosotros'} label={c.botonTexto || undefined} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

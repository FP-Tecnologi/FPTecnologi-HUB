import { SOLUTIONS } from '@/lib/content';
import { ServiceCardFinal } from './ServiceCardFinal';
import { MoreInfoButton } from './MoreInfoButton';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

/*
 * Sección "Servicios" de la home final -- mismo wrapper/heading de
 * site/Solutions.tsx, pero la tarjeta ya es la definitiva (ver
 * app/guia-estilos-final): badge, descripción a 2 líneas y botón "Más
 * información".
 *
 * Entrada/salida con el scroll (ScrollReveal, igual que Nosotros): el título
 * entra desde la izquierda, descripción+botón desde la derecha, y las
 * tarjetas suben en cascada por columna (delay creciente).
 */
export function Solutions() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-20">
      {/* Encabezado con el mismo lenguaje que Nosotros: badge de vidrio con
          SparkleIcon, título en 2 líneas (sólido + degradé con brillo
          .title-shimmer-light), descripción justificada y botón sweep. */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <ScrollReveal direction="left">
          <SectionBadge>Nuestros servicios</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">Servicios TI a medida</span>{' '}
            <span className="title-shimmer-light">para cada sector</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="right" delayMs={120}>
          <MoreInfoButton href="/servicios" label="Ver servicios" />
        </ScrollReveal>
      </div>

      {/* 4 columnas recién desde xl (1280px): en 1024px cada tarjeta medía
          ~225px y el botón "Más información" (mismo tamaño que Nosotros) no
          entraba. Debajo de xl van 2 columnas con tarjeta apaisada. */}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
        {SOLUTIONS.map((item, i) => (
          <ScrollReveal key={item.slug} direction="up" delayMs={(i % 4) * 100}>
            <ServiceCardFinal item={item} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

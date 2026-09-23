import { SOLUTIONS } from '@/lib/content';
import { ServiceCardFinal } from './ServiceCardFinal';

/*
 * Sección "Servicios" de la home final -- mismo wrapper/heading de
 * site/Solutions.tsx, pero la tarjeta ya es la definitiva (ver
 * app/guia-estilos-final): badge, descripción a 2 líneas y botón "Más
 * información".
 */
export function Solutions() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Servicios destacados</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Tecnología para cada tipo de negocio
          </h2>
        </div>
        <p className="max-w-md text-sm text-ink/60">
          Explora nuestro catálogo especializado para infraestructura corporativa. Stock local y distribución
          autorizada de las principales marcas internacionales.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((item) => (
          <ServiceCardFinal key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

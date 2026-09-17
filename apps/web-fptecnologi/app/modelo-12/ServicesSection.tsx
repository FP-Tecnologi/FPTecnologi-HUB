import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import { SOLUTIONS } from '@/lib/content';
import { Icon } from '@/components/site/Icon';

/* "Servicios" de Modelo 12 -- mismo lenguaje visual que UseCaseSection
   (SectionBanner + tarjetas bg-blue/rounded-20), pero con los 8 servicios
   reales (SOLUTIONS) y sus íconos reales, en vez de la UseCaseCard original
   (limitada a 6 íconos fijos y enlaces a /use-cases/[slug] que no existe). */
export function ServicesSection() {
  return (
    <section className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <SectionBanner
            variant="two"
            outlineButtonText="Servicios"
            title="8 soluciones TI, a medida de tu empresa"
            description="Del diagnóstico a la implementación — cada solución se cotiza sin compromiso según el rubro y tamaño de tu operación."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((s) => (
              <a
                key={s.slug}
                href={`/servicios/${s.slug}`}
                className="group rounded-20 border border-lineColor/70 bg-blue px-5 pt-5 pb-6 transition-colors hover:border-primary/60"
              >
                <span className="flex h-10.5 w-10.5 items-center justify-center rounded-[10px] bg-primary p-2.5 text-white">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs font-medium uppercase tracking-wide text-offWhite/40">{s.tag}</p>
                <h3 className="mt-1 text-lg font-medium leading-snug text-offWhite">{s.title}</h3>
                <div className="my-4 gradient-border h-px w-full" />
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Cotizar
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

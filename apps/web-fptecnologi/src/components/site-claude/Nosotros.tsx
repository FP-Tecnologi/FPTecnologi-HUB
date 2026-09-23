import Image from 'next/image';
import { STATS } from '@/lib/content';
import { Counter } from '../site2/Counter';

/* "Nosotros" corta de la estructura final (ver docs/estructura-home.md) --
   antes las 3 métricas de STATS vivían en un StatsBar suelto después de
   "Por qué elegirnos"; ahora van acá, adentro de la presentación breve de la
   empresa, igual al patrón ya probado en el Modelo Riteflow (AboutRiteflow). */
export function Nosotros() {
  return (
    <section id="nosotros" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
          <Image
            src="/images/modelo7/equipo.jpg"
            alt="Equipo comercial FPTecnologi en reunión"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Nosotros</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Equipamiento TI con distribución autorizada
          </h2>
          <p className="mt-4 max-w-lg text-ink/60">
            Stock local de las principales marcas del mercado, cotización sin compromiso y un especialista que arma
            la propuesta a medida de tu operación.
          </p>

          <div className="mt-8 grid grid-cols-3 divide-x divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
                <p className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-ink/60 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

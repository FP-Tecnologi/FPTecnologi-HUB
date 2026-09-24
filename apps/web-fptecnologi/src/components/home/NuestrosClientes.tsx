import { GraduationCap, Landmark, ShoppingBag, Truck, type LucideIcon } from 'lucide-react';
import { CLIENT_SECTORS } from '@/lib/clients';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

const SECTOR_ICONS: Record<string, LucideIcon> = {
  educacion: GraduationCap,
  logistico: Truck,
  retail: ShoppingBag,
  gobierno: Landmark,
};

/*
 * "Nuestros clientes" -- misma estructura que la referencia (tactical-it.pe):
 * clientes agrupados por sector, cada grupo con su etiqueta + línea y un
 * contenedor con los logos. Acá la sección va en blanco y los contenedores
 * en azul oscuro de marca (al revés que la referencia). Clientes de ejemplo
 * en lib/clients.ts hasta tener los reales autorizados.
 */
export function NuestrosClientes() {
  return (
    <section id="clientes" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>Confían en nosotros</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">Nuestros</span> <span className="title-shimmer-light">clientes</span>
          </h2>
          <p className="mt-3 text-ink/60">
            Organizaciones que confían en nosotros en <span className="font-semibold text-brand-primary">4 sectores clave</span>.
          </p>
        </ScrollReveal>

        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
          {CLIENT_SECTORS.map((sector, i) => {
            const Icon = SECTOR_ICONS[sector.key] ?? Landmark;
            return (
              <ScrollReveal key={sector.key} direction="up" delayMs={(i % 2) * 120}>
                {/* Etiqueta del sector + línea. */}
                <div className="mb-4 flex items-center gap-3 text-brand-dark">
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  <p className="text-sm font-bold uppercase tracking-[0.2em]">{sector.label}</p>
                  <span className="h-px flex-1 bg-brand-dark/15" />
                </div>

                <div className="flex min-h-[10.5rem] flex-wrap items-center justify-around gap-6 rounded-2xl bg-brand-dark px-6 py-7 shadow-xl shadow-brand-dark/25">
                  {sector.clients.map((c) => (
                    <div key={c.name} className="group flex w-28 flex-col items-center gap-3 text-center">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md shadow-black/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} className="h-full w-full object-contain p-2" />
                        ) : (
                          <span className="font-display text-lg font-bold text-brand-dark">{c.short}</span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs font-semibold uppercase tracking-wide text-white/80">{c.name}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

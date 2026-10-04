import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';

const CASOS = [{ titulo: 'Verificar un producto' }, { titulo: 'Registrar un reclamo' }, { titulo: 'Soporte técnico' }];

/* Llamada a la acción de /contacto hacia la página completa de tickets (/tickets):
   texto + botón a la izquierda y una foto de soporte a la derecha. */
export function TicketsCta() {
  return (
    <section id="tickets" className="border-t border-brand-100 bg-paper py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <SectionBadge>Soporte por tickets</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">¿Problemas con un producto?</span> <span className="title-shimmer-light">Abre un ticket</span>
          </h2>
          <p className="mt-4 max-w-lg text-ink/65">
            Si compraste con nosotros y necesitas verificar un equipo, registrar un reclamo o recibir soporte, abre un ticket y el área comercial le dará seguimiento.
          </p>
          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-ink">
            {CASOS.map(({ titulo }, i) => (
              <span key={titulo} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-brand-primary" />}
                {titulo}
              </span>
            ))}
          </p>
          <div className="mt-8">
            <MoreInfoButton href="/tickets" label="Abrir ticket" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <div className="group relative overflow-hidden rounded-2xl shadow-2xl shadow-brand-950/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/solutions/soporte-tecnico.jpg" alt="Técnico revisando un equipo" className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent transition-opacity duration-500 group-hover:from-brand-950/85" />
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white p-4 shadow-xl shadow-brand-950/30 transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl">
              <p className="font-display text-base font-bold text-ink transition-colors duration-300 group-hover:text-brand-primary">Tu caso, con seguimiento</p>
              <p className="text-sm text-ink/65">Una vez registres tu reclamo, el personal especializado atenderá tu problema a la brevedad.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

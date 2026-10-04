import { FileWarning, PackageSearch, Wrench, type LucideIcon } from 'lucide-react';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';

const CASOS: { titulo: string; icono: LucideIcon }[] = [
  { titulo: 'Verificar un producto', icono: PackageSearch },
  { titulo: 'Registrar un reclamo', icono: FileWarning },
  { titulo: 'Soporte técnico', icono: Wrench },
];

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
          <ul className="mt-6 flex flex-wrap gap-3">
            {CASOS.map(({ titulo, icono: Icono }) => (
              <li key={titulo} className="flex items-center gap-2 rounded-xl border border-brand-100 bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-sm shadow-brand-950/5">
                <Icono className="h-4 w-4 text-brand-primary" strokeWidth={2} />
                {titulo}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MoreInfoButton href="/tickets" label="Abrir ticket" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-brand-950/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/solutions/soporte-tecnico.jpg" alt="Técnico revisando un equipo" className="aspect-[4/3] w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white p-4 shadow-xl shadow-brand-950/30">
              <p className="font-display text-base font-bold text-ink">Tu caso, con seguimiento</p>
              <p className="text-sm text-ink/65">Registramos tu ticket y un asesor te contacta.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

import { Briefcase, Building2, Headset, HeartHandshake, Mail, Megaphone, Phone, ShoppingBag, type LucideIcon } from 'lucide-react';
import type { AreaContacto } from '@/lib/areasContacto';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';

const ICONOS: Record<string, LucideIcon> = {
  comercial: Briefcase,
  ventas: ShoppingBag,
  marketing: Megaphone,
  soporte: Headset,
  atencion: HeartHandshake,
  administracion: Building2,
};

/* Datos de contacto por área (comercial, ventas, marketing, soporte, atención
   al cliente, administración). Tarjetas blancas; al hover se rellenan de azul
   primario con texto blanco y el ícono flota (mismo efecto que Hablemos).
   Textos y tarjetas: CMS Contacto → Asesores por área. Las tarjetas nuevas
   (sin `icono`) usan el de atención al cliente. */
type Props = { badge: string; titulo: string; destacado: string; descripcion: string; items: Partial<AreaContacto>[] };

export function AreasContacto({ badge, titulo, destacado, descripcion, items }: Props) {
  return (
    <section id="areas" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          {badge && <SectionBadge>{badge}</SectionBadge>}
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{titulo}</span> <span className="title-shimmer-light">{destacado}</span>
          </h2>
          {descripcion && <p className="mt-3 text-ink/65">{descripcion}</p>}
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => {
            const Icon = ICONOS[a.icono ?? ''] ?? HeartHandshake;
            return (
              <ScrollReveal key={i} direction="up" delayMs={i * 80} className="h-full">
                <div className="group h-full rounded-2xl border border-brand-100 bg-white p-6 shadow-sm shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary hover:shadow-[0_16px_32px_-10px_rgba(40,152,238,0.6)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-white">
                    <Icon className="icon-hop h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink transition-colors duration-300 group-hover:text-white">{a.area}</h3>
                  <p className="mt-1 text-sm text-ink/65 transition-colors duration-300 group-hover:text-white/90">{a.descripcion}</p>
                  <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 transition-colors duration-300 group-hover:border-white/25">
                    {a.telefono && <a href={`tel:${a.telefono.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-white">
                      <Phone className="h-4 w-4 shrink-0 text-brand-primary transition-colors duration-300 group-hover:text-white" strokeWidth={2} />
                      {a.telefono}
                    </a>}
                    {a.email && <a href={`mailto:${a.email}`} className="flex items-center gap-2 break-all text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-white">
                      <Mail className="h-4 w-4 shrink-0 text-brand-primary transition-colors duration-300 group-hover:text-white" strokeWidth={2} />
                      {a.email}
                    </a>}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

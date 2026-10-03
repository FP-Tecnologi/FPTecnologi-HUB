import { ClipboardList, PencilRuler, Wrench, Headset, type LucideIcon } from 'lucide-react';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';

/* "Cómo trabajamos": los 4 pasos de todo servicio TI (listado y detalle). */
const PASOS: { icon: LucideIcon; titulo: string; texto: string }[] = [
  { icon: ClipboardList, titulo: 'Diagnóstico', texto: 'Visitamos tu sede y entendemos qué necesita tu operación.' },
  { icon: PencilRuler, titulo: 'Propuesta a medida', texto: 'Diseñamos la solución y te enviamos una cotización clara.' },
  { icon: Wrench, titulo: 'Implementación', texto: 'Nuestros especialistas instalan y configuran todo.' },
  { icon: Headset, titulo: 'Soporte continuo', texto: 'Acompañamiento técnico local después de la entrega.' },
];

export function ProcesoServicio() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>Cómo trabajamos</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">De la idea a la</span> <span className="title-shimmer-light">operación</span>
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PASOS.map(({ icon: Icon, titulo, texto }, i) => (
            <ScrollReveal key={titulo} direction="up" delayMs={i * 100} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-brand-primary p-7 shadow-lg shadow-brand-dark/25 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-2xl hover:shadow-brand-dark/45">
                <span aria-hidden className="absolute -right-2 -top-4 font-display text-7xl font-bold text-white/5">
                  0{i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/40">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ClipboardList, PencilRuler, Wrench, Headset, type LucideIcon } from 'lucide-react';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { getPagina, type PaginasContenido } from '@/lib/paginasContenido';

/* "Cómo trabajamos": los pasos de todo servicio TI (listado y detalle). Textos desde el CMS (Servicios → Cómo trabajamos). */
const ICONOS: LucideIcon[] = [ClipboardList, PencilRuler, Wrench, Headset];

export async function ProcesoServicio({ proceso: propio }: { proceso?: PaginasContenido['servicios']['proceso'] }) {
  const proceso = propio ?? (await getPagina('servicios')).proceso;
  return (
    <section id="proceso" className="scroll-mt-28 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>{proceso.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{proceso.titulo}</span> <span className="title-shimmer-light">{proceso.destacado}</span>
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {proceso.items.map(({ title, text }, i) => {
            const Icon = ICONOS[i % ICONOS.length];
            return (
              <ScrollReveal key={`${title}-${i}`} direction="up" delayMs={i * 100} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-brand-primary p-7 shadow-lg shadow-brand-dark/25 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-2xl hover:shadow-brand-dark/45">
                  <span aria-hidden className="absolute -right-2 -top-4 font-display text-7xl font-bold text-white/5">
                    0{i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/40">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{text}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

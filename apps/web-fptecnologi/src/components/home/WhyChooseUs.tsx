import { HOME_DEFAULTS, type Encabezado, type ItemTexto } from '@/lib/homeContenido';
import { BadgeCheck, FileText, Handshake, Warehouse, type LucideIcon } from 'lucide-react';
import { SectionBadge } from './SectionBadge';
import { ScrollReveal } from './ScrollReveal';

// Un ícono por diferenciador, en el mismo orden que WHY_CHOOSE_US.
const ICONS: LucideIcon[] = [Warehouse, BadgeCheck, FileText, Handshake];

/*
 * "Por qué elegirnos" -- sección blanca a lo ancho (distinta del bg-paper
 * con puntitos de Servicios). Mismo encabezado que Nosotros/Servicios
 * (badge de vidrio + título con brillo). Tarjetas oscuras con resplandor
 * de marca, ícono, número grande de fondo y hover: sube, borde celeste,
 * sombra azul oscuro y el chip del ícono pasa a azul principal.
 */
export function WhyChooseUs({ c = HOME_DEFAULTS.porque }: { c?: Encabezado & { items: ItemTexto[] } }) {
  return (
    // Fondo blanco (bg-white a lo ancho) -- distinto del bg-paper con
    // puntitos de Servicios, para separar secciones sin oscurecer la página.
    <section id="porque" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal direction="up" className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center">
          <SectionBadge>{c.badge}</SectionBadge>
          {/* Título en una línea (corto): las 2 partes son inline, solo
              bajan de línea solas si no entran. */}
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span>{' '}
            <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {c.items.map((item, i) => {
            const Icon = ICONS[i] ?? BadgeCheck;
            return (
              <ScrollReveal key={item.title} direction="up" delayMs={i * 100} className="h-full">
                {/* La tarjeta conserva el look oscuro (bg-brand-primary + resplandor de
                    marca) aunque la sección sea blanca. */}
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-brand-primary p-7 shadow-lg shadow-brand-dark/25 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-2xl hover:shadow-brand-dark/45">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/25 blur-3xl transition-opacity duration-300 group-hover:bg-brand-primary/40"
                  />
                  {/* Número grande de fondo, decorativo. */}
                  <span
                    aria-hidden
                    className="absolute -right-2 -top-4 font-display text-8xl font-bold text-white/5 transition-colors duration-300 group-hover:text-brand-primary/20"
                  >
                    0{i + 1}
                  </span>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/40 transition-colors duration-300 group-hover:bg-brand-primary">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="relative mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/65">{item.text}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

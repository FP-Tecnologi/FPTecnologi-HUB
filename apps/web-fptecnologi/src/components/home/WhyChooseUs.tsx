import { HOME_DEFAULTS, type Encabezado, type ItemTexto } from '@/lib/homeContenido';
import Image from 'next/image';
import { ArrowRight, BadgeCheck, FileText, Handshake, Trophy, Warehouse, type LucideIcon } from 'lucide-react';
import { PARTNER_BRANDS } from '@/lib/content';
import { CLIENT_SECTORS } from '@/lib/clients';
import { PREMIOS } from './Reconocimientos';
import { CERTIFICACIONES } from './CertificacionesISO';
import { SectionBadge } from './SectionBadge';
import { ScrollReveal } from './ScrollReveal';

// Un ícono por diferenciador, en el mismo orden que WHY_CHOOSE_US.
const ICONS: LucideIcon[] = [Warehouse, BadgeCheck, FileText, Handshake];

// Cifras calculadas de las listas reales: se actualizan solas al sumar logos.
const LOGROS = [
  { value: `${PARTNER_BRANDS.length}+`, label: 'Marcas con distribución autorizada' },
  { value: `${CLIENT_SECTORS.reduce((n, s) => n + s.clients.length, 0)}+`, label: 'Instituciones y empresas atendidas' },
  { value: `${PREMIOS.length}`, label: 'Premios de fabricantes y mayoristas' },
  { value: `${CERTIFICACIONES.length}`, label: 'Certificaciones ISO y SA 8000' },
];

/*
 * "Por qué elegirnos" -- sección blanca. A la izquierda, tarjeta oscura de
 * logros (foto de un premio, cifras reales en chips de vidrio y enlace a los
 * reconocimientos); a la derecha, los 4 diferenciadores (CMS) en tarjetas
 * blancas con ícono, número de fondo y sombra azul de marca.
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

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Logros: tarjeta oscura con foto de un premio y cifras que salen de
              las listas reales (marcas, clientes, premios, certificaciones). */}
          <div className="lg:col-span-5">
          <ScrollReveal direction="left" className="h-full">
            <div className="relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl bg-ink p-8 shadow-xl shadow-brand-dark/30">
              <Image src="/images/premios/huawei.webp" alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover opacity-35" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-brand-primary/30" />
              <span className="spin-border" aria-hidden />
              <div className="relative">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                  <Trophy className="h-4 w-4" strokeWidth={2} /> Nuestros logros
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">Respaldo que puedes comprobar</h3>
              </div>
              <div className="relative mt-8 grid grid-cols-2 gap-3">
                {LOGROS.map((l) => (
                  <div key={l.label} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                    <p className="font-display text-3xl font-bold text-white">{l.value}</p>
                    <p className="mt-1 text-xs leading-snug text-white/70">{l.label}</p>
                  </div>
                ))}
              </div>
              <a
                href="/nosotros#reconocimientos"
                className="relative mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-brand-primary"
              >
                Ver premios y reconocimientos <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </ScrollReveal>
          </div>

          {/* Diferenciadores (editables en el CMS): tarjetas blancas 2x2. */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            {c.items.map((item, i) => {
              const Icon = ICONS[i] ?? BadgeCheck;
              return (
                <ScrollReveal key={item.title} direction="up" delayMs={i * 100} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25">
                    <span className="spin-border" aria-hidden />
                    <span aria-hidden className="absolute right-5 top-4 font-display text-5xl font-bold text-brand-primary/10 transition-colors duration-300 group-hover:text-brand-primary/25">
                      0{i + 1}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-dark/30 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.text}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Building2, MapPin, MousePointerClick, RotateCcw } from 'lucide-react';
import { PERU_DEPARTMENTS, PERU_VIEWBOX } from '@/lib/peruDepartments';
import { PROJECTS, type Project } from '@/lib/projects';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

const [, , VB_W, VB_H] = PERU_VIEWBOX.split(' ').map(Number);

/*
 * Tarjeta de proyecto que se da vuelta: toda la tarjeta es clickeable y gira
 * 180° en 3D. Arriba a la derecha, una etiqueta de vidrio informativa
 * ("Click para ver detalles" / "Volver") que aparece al pasar
 * el cursor (siempre visible en táctil). Atrás, sobre la misma
 * foto desenfocada, cliente, año, descripción y alcance centrados.
 */
const GLASS_TAG =
  'pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/30 backdrop-blur-md transition-all duration-300 group-hover:border-white/50 group-hover:bg-white/20 sm:text-xs [@media(hover:hover)]:-translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100';

function ProjectCard({
  project: p,
  index,
  flipped,
  onFlip,
}: {
  project: Project;
  index: number;
  flipped: boolean;
  onFlip: (v: boolean) => void;
}) {
  const face = 'absolute inset-0 overflow-hidden rounded-xl [backface-visibility:hidden]';
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${p.title}: ${flipped ? 'volver' : 'ver detalles'}`}
      onClick={() => onFlip(!flipped)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip(!flipped);
        }
      }}
      className="group relative aspect-[16/10] shrink-0 cursor-pointer rounded-xl [perspective:1200px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark sm:aspect-[16/8] lg:aspect-auto lg:h-[calc((100%-1rem)/2)]"
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Frente */}
        <div className={face} aria-hidden={flipped}>
          {/* Foto: acercamiento + giro suave al hover (igual que Servicios). */}
          <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:rotate-2 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/95 via-brand-primary/35 to-transparent" />
          {/* Numeración: vidrio oscuro (legible sobre fotos claras). */}
          <span className="absolute left-3 top-3 z-10 flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/25 bg-brand-primary/45 px-2.5 font-display text-base font-bold tabular-nums text-white shadow-lg shadow-brand-dark/30 backdrop-blur-md">
            {String(index).padStart(2, '0')}
          </span>
          <span className={GLASS_TAG}>
            <MousePointerClick className="h-3.5 w-3.5" strokeWidth={2.2} />
            Click para ver detalles
          </span>
          <div className="absolute inset-x-4 bottom-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-200">
              <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{p.client} · {p.year}</span>
            </p>
            <p className="mt-1.5 line-clamp-2 text-sm font-bold uppercase leading-snug text-white sm:text-base">{p.title}</p>
            {/* Línea de acento que se alarga al hover. */}
            <span aria-hidden className="mt-2.5 block h-0.5 w-8 rounded-full bg-brand-primary transition-all duration-500 group-hover:w-20 group-hover:bg-brand-200" />
          </div>
          {/* Contorno que gira al hover (ver .spin-border en globals.css). */}
          <span className="spin-border" aria-hidden />
        </div>

        {/* Reverso: misma foto desenfocada + velo de marca, contenido centrado. */}
        <div className={`${face} text-white [transform:rotateY(180deg)]`} aria-hidden={!flipped}>
          <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="scale-110 object-cover blur-md" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/90 via-brand-primary/90 to-brand-primary/95" />
          <span className={GLASS_TAG}>
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} />
            Volver
          </span>
          <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto px-6 pb-4 pt-12 text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-200">
              <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
              {p.client} · {p.year}
            </p>
            <h4 className="mt-2 max-w-md text-sm font-bold uppercase leading-snug sm:text-base">{p.title}</h4>
            <span aria-hidden className="mt-3 h-0.5 w-10 rounded-full bg-brand-primary" />
            <p className="mt-3 max-w-md text-xs leading-relaxed text-white/75 sm:text-sm">{p.description}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {p.scope.map((s) => (
                <span key={s} className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * "Nuestros proyectos" -- mapa interactivo del Perú (referencia:
 * tactical-it.pe). A la derecha el mapa por departamentos: los que tienen
 * proyectos van coloreados y con un punto; al pasar el cursor sale un
 * tooltip con el nombre y la cantidad, y al hacer click se selecciona. A la
 * izquierda, el contenedor lista los proyectos del departamento elegido.
 * Datos de ejemplo en lib/projects.ts (reemplazar por los reales).
 */
export function NuestrosProyectos({ c = HOME_DEFAULTS.proyectos, projects: lista = PROJECTS }: { c?: Encabezado; projects?: Project[] }) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of lista) m.set(p.department, (m.get(p.department) ?? 0) + 1);
    return m;
  }, [lista]);
  const withProjects = PERU_DEPARTMENTS.filter((d) => counts.has(d.id));

  const [selected, setSelected] = useState(withProjects.find((d) => d.id === 'lima')?.id ?? withProjects[0]?.id);
  const [hovered, setHovered] = useState<string | null>(null);
  // Tarjeta de proyecto dada vuelta (una a la vez).
  const [flipped, setFlipped] = useState<string | null>(null);
  const selectDepartment = (id: string) => {
    setSelected(id);
    setFlipped(null);
  };

  const current = PERU_DEPARTMENTS.find((d) => d.id === selected);
  const projects = lista.filter((p) => p.department === selected);
  const tip = PERU_DEPARTMENTS.find((d) => d.id === (hovered ?? selected));
  const tipCount = tip ? (counts.get(tip.id) ?? 0) : 0;
  // La línea sale de costado hacia el lado con más espacio (el tooltip mide
  // ~170 unidades: con el mapa de 500 de ancho, siempre entra de un lado).
  // El tooltip se engancha por su borde lateral al final de la línea.
  const toRight = tip ? tip.cx < VB_W / 2 : true;
  const anchor = tip ? { x: tip.cx + (toRight ? 60 : -60), y: Math.max(40, tip.cy - 18) } : { x: 0, y: 0 };

  if (lista.length === 0) return null;

  return (
    <section id="proyectos" className="mx-auto max-w-7xl px-6 py-20">
      <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
        <SectionBadge>{c.badge}</SectionBadge>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
          <span className="text-ink">{c.titulo}</span> <span className="title-shimmer-light">{c.destacado}</span>
        </h2>
        {c.descripcion && <p className="mt-3 text-ink/60">{c.descripcion}</p>}
      </ScrollReveal>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Contenedor de proyectos del departamento seleccionado. En desktop
            se estira al alto del mapa (absolute sobre la celda de la grilla:
            el mapa define el alto de la fila) y la lista scrollea adentro. */}
        <div className="relative order-2 lg:order-1">
          <div className="lg:absolute lg:inset-0 lg:[&>div]:h-full">
            <ScrollReveal direction="left" className="h-full">
              <div className="brand-mesh relative flex h-full flex-col overflow-hidden rounded-2xl shadow-2xl shadow-brand-dark/30">
                {/* Encabezado: departamento + cantidad. */}
                <div className="flex items-center gap-3 border-b border-white/15 px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-md">
                    <MapPin className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-200">Proyectos en</p>
                    <p className="truncate font-display text-lg font-bold uppercase leading-tight text-white">{current?.name}</p>
                  </div>
                  <span className="shrink-0 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <span className="font-display text-base font-bold">{projects.length}</span>{' '}
                    {projects.length === 1 ? 'proyecto' : 'proyectos'}
                  </span>
                </div>
                {/* Scroll sin barra visible (sigue funcionando con rueda/touch). */}
                <div className="flex max-h-[34rem] min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 [scrollbar-width:none] lg:max-h-none [&::-webkit-scrollbar]:hidden">
                  {projects.map((p, i) => (
                    <ProjectCard
                      key={p.title}
                      project={p}
                      index={i + 1}
                      flipped={flipped === p.title}
                      onFlip={(v) => setFlipped(v ? p.title : null)}
                    />
                  ))}
                </div>
                {/* Degradé abajo: indica que hay más proyectos al scrollear. */}
                {projects.length > 2 && (
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl bg-gradient-to-t from-brand-primary/80 to-transparent" />
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Mapa. */}
        <div className="order-1 lg:order-2">
        <ScrollReveal direction="right" delayMs={120}>
          <div className="relative mx-auto max-w-md">
            <svg viewBox={PERU_VIEWBOX} className="h-auto w-full overflow-visible" role="img" aria-label="Mapa del Perú por departamentos">
              {/* Relieve: copia del país desplazada abajo-derecha en azul
                  suave con sombra difusa de marca (efecto "sobresale"), y
                  encima una base blanca para que los rellenos translúcidos
                  no dejen ver el relieve. */}
              <g aria-hidden className="pointer-events-none">
                <g transform="translate(6 10)" className="drop-shadow-[0_14px_22px_rgb(16_122_204_/_0.28)]">
                  {PERU_DEPARTMENTS.map((d) => (
                    <path key={d.id} d={d.d} className="fill-[#b9d1e2] stroke-[#b9d1e2] [stroke-width:1.2]" />
                  ))}
                </g>
                {PERU_DEPARTMENTS.map((d) => (
                  <path key={d.id} d={d.d} className="fill-white" />
                ))}
              </g>
              {PERU_DEPARTMENTS.map((d) => {
                const has = counts.has(d.id);
                const isSel = d.id === selected;
                const isHov = d.id === hovered;
                return (
                  <path
                    key={d.id}
                    d={d.d}
                    onMouseEnter={() => setHovered(d.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => has && selectDepartment(d.id)}
                    className={`stroke-white transition-colors duration-200 [stroke-width:1.2] ${
                      isSel
                        ? 'fill-brand-primary'
                        : has
                          ? `cursor-pointer ${isHov ? 'fill-brand-primary/75' : 'fill-brand-primary/50'}`
                          : isHov
                            ? 'fill-[#d3e3ee]'
                            : 'fill-[#e4eef5]'
                    }`}
                  >
                    <title>{`${d.name}: ${counts.get(d.id) ?? 0} proyectos`}</title>
                  </path>
                );
              })}
              {/* Punto en cada departamento con proyectos. */}
              {withProjects.map((d) => (
                <circle key={d.id} cx={d.cx} cy={d.cy} r={4} className="pointer-events-none fill-brand-dark" />
              ))}

              {/* Marcador del departamento activo: anillo que late + línea
                  punteada animada hasta el tooltip + punto de llegada. */}
              {tip && (
                <g className="pointer-events-none">
                  <line x1={tip.cx} y1={tip.cy} x2={anchor.x} y2={anchor.y} className="dash-flow stroke-brand-primary [stroke-width:1.6]" />
                  <circle cx={anchor.x} cy={anchor.y} r={3} className="fill-brand-primary" />
                  {/* Ondas: 3 anillos que se expanden desfasados. */}
                  {[0, 0.6, 1.2].map((delay) => (
                    <circle
                      key={delay}
                      cx={tip.cx}
                      cy={tip.cy}
                      r={16}
                      className="marker-wave fill-none stroke-brand-primary [stroke-width:1.5]"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                  <circle cx={tip.cx} cy={tip.cy} r={8} className="fill-white/90 stroke-brand-primary [stroke-width:1.5]" />
                  <circle cx={tip.cx} cy={tip.cy} r={4} className="fill-brand-dark" />
                </g>
              )}
            </svg>

            {/* Tooltip: departamento en hover (o el seleccionado). */}
            {tip && (
              <div
                // Borde de acento del lado donde llega la línea.
                className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border-brand-primary bg-white px-4 py-2.5 shadow-xl shadow-brand-dark/20 transition-all duration-300 ${
                  toRight ? 'border-l-4' : 'border-r-4'
                }`}
                // Pegado de costado al final de la línea.
                style={{
                  left: `${(anchor.x / VB_W) * 100}%`,
                  top: `${(anchor.y / VB_H) * 100}%`,
                  translate: toRight ? '4px -50%' : 'calc(-100% - 4px) -50%',
                }}
              >
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-dark">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2.2} />
                  {tip.name}
                </p>
                <p className="mt-0.5 text-sm text-ink/60">
                  <span className="font-display text-lg font-bold text-brand-primary">{tipCount}</span>{' '}
                  {tipCount === 1 ? 'proyecto' : 'proyectos'}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-center gap-6 text-xs text-ink/60">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-brand-primary/50 ring-1 ring-brand-primary/60" /> Con proyectos
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-[#e4eef5] ring-1 ring-brand-primary/40" /> Sin proyectos
              </span>
            </div>
          </div>
        </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

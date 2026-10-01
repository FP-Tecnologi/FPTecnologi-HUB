'use client';

import { useMemo, useState } from 'react';
import { Building2, CalendarDays, MapPin } from 'lucide-react';
import { PROJECTS, type Project } from '@/lib/projects';
import { PERU_DEPARTMENTS } from '@/lib/peruDepartments';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';

const deptName = (id: string) => PERU_DEPARTMENTS.find((d) => d.id === id)?.name ?? id;

/* Listado de proyectos con filtro por región (chips con cantidad). */
export function ProyectosListado({ projects: todos = PROJECTS }: { projects?: Project[] }) {
  const [region, setRegion] = useState<string | null>(null);
  const regiones = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of todos) m.set(p.department, (m.get(p.department) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [todos]);
  const lista = [...todos].filter((p) => !region || p.department === region).sort((a, b) => b.year - a.year);

  const chip = (on: boolean) =>
    `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
      on ? 'bg-brand-dark text-white shadow-md shadow-brand-dark/30' : 'bg-white text-ink/70 shadow-sm shadow-brand-dark/10 hover:text-brand-primary'
    }`;

  if (todos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <ScrollReveal direction="up" className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
        <SectionBadge>Casos de implementación</SectionBadge>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
          <span className="text-ink">Proyectos</span> <span className="title-shimmer-light">ejecutados</span>
        </h2>
        <p className="mt-3 text-ink/60">Filtra por región para ver lo que implementamos en cada zona del país.</p>
      </ScrollReveal>

      <div className="mb-10 flex flex-wrap justify-center gap-2.5">
        <button type="button" className={chip(region === null)} onClick={() => setRegion(null)}>
          Todas ({todos.length})
        </button>
        {regiones.map(([id, n]) => (
          <button key={id} type="button" className={chip(region === id)} onClick={() => setRegion(id)}>
            {deptName(id)} ({n})
          </button>
        ))}
      </div>

      <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((p, i) => (
          <ScrollReveal key={p.title} direction="up" delayMs={(i % 3) * 100} className="h-full">
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25">
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:rotate-1 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/70 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                  {deptName(p.department)}
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-brand-primary/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
                  {p.year}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-primary">
                  <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span className="truncate">{p.client}</span>
                </p>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.description}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {p.scope.map((s) => (
                    <span key={s} className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

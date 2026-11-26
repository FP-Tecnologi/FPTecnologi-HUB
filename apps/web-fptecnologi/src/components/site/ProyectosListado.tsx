'use client';

import { useMemo, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { ProyectoCard, deptName } from '@/components/site/ProyectoCard';
import { SectionBadge } from '@/components/home/SectionBadge';
import { ScrollReveal } from '@/components/home/ScrollReveal';

/* Listado de proyectos con filtro por región (chips con cantidad). */
export function ProyectosListado({ projects: todos = PROJECTS }: { projects?: Project[] }) {
  const [region, setRegion] = useState<string | null>(null);
  const regiones = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of todos) m.set(p.department, (m.get(p.department) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [todos]);
  const lista = [...todos].filter((p) => !region || p.department === region).sort((a, b) => Number(!!a.ejemplo) - Number(!!b.ejemplo) || (b.year ?? 0) - (a.year ?? 0) || (b.monto ?? 0) - (a.monto ?? 0));

  const chip = (on: boolean) =>
    `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
      on ? 'bg-brand-primary text-white shadow-md shadow-brand-dark/30' : 'bg-white text-ink/70 shadow-sm shadow-brand-dark/10 hover:text-brand-700'
    }`;

  if (todos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <ScrollReveal direction="up" className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
        <SectionBadge>Casos de implementación</SectionBadge>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
          <span className="text-ink">Proyectos</span> <span className="title-shimmer-light">ejecutados</span>
        </h2>
        <p className="mt-3 text-ink/60">Filtra por región y entra a cada proyecto para ver la historia completa, fotos y videos.</p>
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
            <ProyectoCard p={p} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

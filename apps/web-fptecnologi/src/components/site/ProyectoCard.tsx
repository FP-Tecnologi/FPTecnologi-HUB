import Link from 'next/link';
import { ArrowRight, Building2, CalendarDays, Images, MapPin, PlayCircle } from 'lucide-react';
import { slugProyecto, type Project } from '@/lib/projects';
import { PERU_DEPARTMENTS } from '@/lib/peruDepartments';

export const deptName = (id: string) => PERU_DEPARTMENTS.find((d) => d.id === id)?.name ?? id;

/*
 * Tarjeta de proyecto: solo lo esencial (foto, región, cliente, título y una
 * línea de resumen). Toda la tarjeta abre la página de detalle, donde van la
 * historia completa, el alcance, la galería y los videos.
 */
export function ProyectoCard({ p }: { p: Project }) {
  const fotos = 1 + (p.galeria?.length ?? 0);
  const conVideo = (p.videos?.length ?? 0) > 0;
  return (
    <Link
      href={`/proyectos/${slugProyecto(p.title)}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-dark/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
          {deptName(p.department)}
        </span>
        {p.year && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-brand-primary/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
            {p.year}
          </span>
        )}
        {(conVideo || fotos > 1) && (
          <span className="absolute bottom-3 left-3 flex gap-1.5">
            {conVideo && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#ff0000] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                <PlayCircle className="h-3.5 w-3.5" strokeWidth={2.2} /> Video
              </span>
            )}
            {fotos > 1 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-bold text-brand-dark">
                <Images className="h-3.5 w-3.5" strokeWidth={2.2} /> {fotos}
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
          <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span className="truncate">{p.client}</span>
        </p>
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand-primary">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{p.description}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-brand-primary">
          Ver proyecto
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.2} />
        </span>
      </div>
    </Link>
  );
}

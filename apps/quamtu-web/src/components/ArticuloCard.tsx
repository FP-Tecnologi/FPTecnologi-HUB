import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { fechaLarga, PORTADA_DEFECTO, type ArticuloResumen } from '@/lib/blog';

/** Tarjeta de artículo: portada, categoría, título, resumen y fecha. Todo el bloque es el enlace al artículo. */
export default function ArticuloCard({ a }: { a: ArticuloResumen }) {
  return (
    <Link href={`/blog/${a.slug}`} className="group/card glass flex h-full w-full flex-col overflow-hidden rounded-2xl transition-[transform,border-color,box-shadow] duration-300 hover:border-claro hover:shadow-lg motion-safe:hover:-translate-y-1">
      <div className="aspect-[16/10] overflow-hidden bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.portadaUrl || PORTADA_DEFECTO} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 motion-safe:group-hover/card:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-md bg-boton px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">{a.categoria}</span>
        <h3 className="mt-3 font-display text-lg font-bold leading-tight text-white group-hover/card:text-claro">{a.titulo}</h3>
        <p className="mt-2 line-clamp-3 text-slate-300">{a.resumen}</p>
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-slate-400">
          <CalendarDays aria-hidden="true" size={15} />{fechaLarga(a.publicadoEn)}
        </p>
      </div>
    </Link>
  );
}

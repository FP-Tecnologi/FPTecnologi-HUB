import Enlace from "./Enlace";
import { Icono } from "./ui";
import { fechaLarga, PORTADA_DEFECTO, type ArticuloResumen } from "@/lib/blog";

/** Tarjeta de artículo: portada, categoría, título, resumen y fecha. Todo el bloque es el enlace al artículo. */
export default function ArticuloCard({ a }: { a: ArticuloResumen }) {
  return (
    <Enlace href={`/blog/${a.slug}/`} className="group/card flex h-full w-full flex-col overflow-hidden border border-tinta/10 bg-white shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:border-naranja hover:shadow-lg motion-safe:hover:-translate-y-1">
      <div className="aspect-[16/10] overflow-hidden bg-azul-claro">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.portadaUrl || PORTADA_DEFECTO} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 motion-safe:group-hover/card:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit bg-azul-claro px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-azul-2">{a.categoria}</span>
        <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-tinta group-hover/card:text-azul-2">{a.titulo}</h3>
        <p className="mt-2 line-clamp-3 text-grafito/85">{a.resumen}</p>
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-grafito/75">
          <Icono n="reloj" className="h-4 w-4" />{fechaLarga(a.publicadoEn)}
        </p>
      </div>
    </Enlace>
  );
}

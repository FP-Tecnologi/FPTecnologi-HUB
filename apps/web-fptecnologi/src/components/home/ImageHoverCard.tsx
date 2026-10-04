import type { ReactNode } from 'react';

export type HoverDato = { value: string; label: string };

/* Marco de imagen/video con efecto al pasar el cursor, reutilizable:
   zoom lento de la foto + degradé azul muy oscuro de marca (brand-950) abajo +
   tarjeta blanca SÓLIDA (sin vidrio) que sube con los datos: número en azul
   primario y etiqueta debajo. En pantallas táctiles (sin hover) la tarjeta
   queda siempre visible. Uso: <ImageHoverCard datos={[...]}>{<img .../>}</ImageHoverCard>. */
export function ImageHoverCard({
  datos,
  titulo,
  children,
  className = 'aspect-4/3',
}: {
  datos: HoverDato[];
  titulo?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl shadow-2xl shadow-brand-950/25 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out group-hover:[&_img]:scale-105 [&_video]:transition-transform [&_video]:duration-700 [&_video]:ease-out group-hover:[&_video]:scale-105 motion-reduce:[&_img]:transition-none ${className}`}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/10 to-transparent transition-opacity duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-white p-4 text-ink shadow-xl shadow-brand-950/30 transition-all duration-500 ease-out motion-reduce:transition-none [@media(hover:hover)]:translate-y-8 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
        {titulo && (
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-700">
            <span className="h-0.5 w-6 bg-brand-primary" aria-hidden />
            {titulo}
          </p>
        )}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${datos.length}, minmax(0, 1fr))` }}>
          {datos.map((d, i) => (
            <div key={d.label} className={`px-2 text-center ${i > 0 ? 'border-l border-brand-100' : ''}`}>
              <p className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">{d.value}</p>
              <p className="mt-0.5 text-[11px] font-medium leading-tight text-ink/70 sm:text-xs">{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

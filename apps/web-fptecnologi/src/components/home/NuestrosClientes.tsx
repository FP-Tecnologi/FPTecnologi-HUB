/*
 * TODO(diseño pendiente): sección "Nuestros clientes" -- carrusel por
 * sectores, pedida en la estructura de home (ver
 * docs/notas-rediseno-web-publica.md). Separado de BrandMarquee (esa es la
 * franja de marcas distribuidas, esto son clientes reales agrupados por
 * rubro) -- sin logos/nombres reales autorizados todavía, se deja el
 * placeholder en vez de inventar clientes.
 */
export function NuestrosClientes() {
  return (
    <section id="clientes" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-8">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Confían en nosotros</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Nuestros clientes</h2>
      </div>
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.02] text-sm text-ink/40">
        Carrusel por sectores pendiente de diseño y logos reales autorizados -- ver docs/notas-rediseno-web-publica.md
      </div>
    </section>
  );
}

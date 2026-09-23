/*
 * TODO(diseño pendiente): sección "Nuestros proyectos" -- pedida en la
 * estructura de home (ver docs/notas-rediseno-web-publica.md), sin modelo
 * ni contenido definido todavía. No se inventan proyectos "de ejemplo": se
 * deja el placeholder hasta tener casos reales + el estilo elegido.
 */
export function NuestrosProyectos() {
  return (
    <section id="proyectos" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-8">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Nuestro trabajo</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Nuestros proyectos</h2>
      </div>
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.02] text-sm text-ink/40">
        Sección pendiente de diseño y contenido real -- ver docs/notas-rediseno-web-publica.md
      </div>
    </section>
  );
}

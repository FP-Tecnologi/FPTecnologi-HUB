import { STATS } from '@/lib/content';

/* La referencia tiene tarjetas de testimonios con foto+nombre+cita --
   FPTecnologi no tiene reseñas de clientes reales relevadas todavía, así
   que en vez de inventar personas/citas falsas esta sección se queda solo
   con las métricas reales (mismo criterio que WHY_CHOOSE_US en content.ts:
   "no testimonios falsos"). */
export function TrustStats10() {
  return (
    <section className="border-y border-black/5 bg-paper px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Confían en nosotros</span>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">Empresas que ya equipamos</h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-bold text-brand-primary">
                {s.value}
                {s.suffix}
              </p>
              <p className="mt-1 text-sm text-ink/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

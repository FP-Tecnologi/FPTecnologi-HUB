import { PARTNER_STEPS } from '@/lib/content';

export function PartnerSteps() {
  return (
    <section id="partners" className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Programa de partners</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Conviértete en Partner FP</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PARTNER_STEPS.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <span className="font-display text-5xl font-bold text-brand-primary/15">{s.step}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

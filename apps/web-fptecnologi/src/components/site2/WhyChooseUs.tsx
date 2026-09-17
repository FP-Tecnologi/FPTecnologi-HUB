import { WHY_CHOOSE_US } from '@/lib/content';

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Por qué elegirnos</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Lo que nos hace distintos</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_CHOOSE_US.map((item, i) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-colors duration-300 hover:bg-brand-primary"
          >
            <span className="font-display text-3xl font-bold text-brand-primary/20 transition-colors duration-300 group-hover:text-white/30">
              0{i + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink transition-colors duration-300 group-hover:text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/75">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

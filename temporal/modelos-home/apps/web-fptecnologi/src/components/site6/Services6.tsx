import { SOLUTIONS } from '@/lib/content';
import { Icon } from '@/components/site/Icon';

export function Services6() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-14 max-w-xl">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Servicios que ofrecemos</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Tecnología para cada tipo de negocio
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SOLUTIONS.map((item) => (
          <a
            key={item.title}
            href="#contacto"
            className="group flex items-center gap-5 rounded-2xl border border-black/5 bg-white p-5 transition-colors duration-300 hover:bg-brand-primary"
          >
            <span
              className="icon-flip flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white"
              style={{ borderRadius: '62% 38% 34% 66% / 58% 32% 68% 42%' }}
            >
              <Icon name={item.icon} className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-ink transition-colors duration-300 group-hover:text-white">{item.title}</h3>
              <p className="mt-1 text-xs text-ink/50 transition-colors duration-300 group-hover:text-white/70">{item.tag}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

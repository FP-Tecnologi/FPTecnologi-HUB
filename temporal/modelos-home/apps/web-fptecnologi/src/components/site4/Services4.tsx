import { SOLUTIONS } from '@/lib/content';
import { Icon } from '@/components/site/Icon';

export function Services4() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-14 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Servicios</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Tecnología para cada tipo de negocio
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((item) => (
          <a key={item.title} href="#contacto" className="group block overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="relative h-40 overflow-hidden">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-white shadow-lg transition-colors duration-300 group-hover:bg-white group-hover:text-brand-primary">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-xs text-ink/45">{item.tag}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

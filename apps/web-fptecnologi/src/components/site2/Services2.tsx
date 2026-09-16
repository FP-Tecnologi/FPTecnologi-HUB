import { SOLUTIONS } from '@/lib/content';
import { Icon } from '@/components/site/Icon';

export function Services2() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Servicios TI</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Tecnología para cada tipo de negocio
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((item) => (
          <a key={item.title} href="#contacto" className="group block">
            <div className="relative h-40 overflow-hidden rounded-xl bg-brand-dark">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="relative z-10 -mt-8 flex justify-center">
              <span className="icon-flip flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-primary shadow-lg transition-colors duration-500 group-hover:bg-brand-primary group-hover:text-white">
                <Icon name={item.icon} className="h-7 w-7" />
              </span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-ink/45">{item.tag}</p>
              <h3 className="mt-1 text-base font-semibold text-ink">{item.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

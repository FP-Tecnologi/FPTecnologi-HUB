import { SOLUTIONS } from '@/lib/content';
import { Icon } from '@/components/site/Icon';

export function Services5() {
  return (
    <section id="servicios" className="relative z-10 -mt-24 px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.slice(0, 4).map((item) => (
          <a
            key={item.title}
            href="#contacto"
            className="group rounded-2xl border border-black/5 bg-white p-7 shadow-xl shadow-black/5 transition-transform duration-300 hover:-translate-y-1.5"
          >
            <Icon name={item.icon} className="icon-flip h-10 w-10 text-brand-primary" />
            <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-xs text-ink/50">{item.tag} FPTecnologi</p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
              Leer más
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.slice(4).map((item) => (
          <a
            key={item.title}
            href="#contacto"
            className="group rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-transform duration-300 hover:-translate-y-1.5"
          >
            <Icon name={item.icon} className="icon-flip h-10 w-10 text-brand-primary" />
            <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-xs text-ink/50">{item.tag} FPTecnologi</p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
              Leer más
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

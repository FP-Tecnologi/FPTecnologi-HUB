import { SOLUTIONS } from '@/lib/content';

export function Services3() {
  return (
    <section id="servicios" className="relative overflow-hidden bg-ink py-20 text-white">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern id="tri" width="60" height="52" patternUnits="userSpaceOnUse">
            <path d="M30 0 60 52 0 52Z" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tri)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">Nuestros servicios</span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Explora todo lo que ofrecemos
            </h2>
          </div>
          <p className="text-sm text-white/60 lg:text-right">
            Servicios TI a medida, con distribución autorizada de las principales marcas del mercado y stock
            local disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.map((item) => (
            <a key={item.title} href="#contacto" className="group relative block aspect-square overflow-hidden rounded-xl">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">{item.tag}</p>
                <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

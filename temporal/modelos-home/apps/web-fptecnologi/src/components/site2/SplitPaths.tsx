import { BUSINESS_PATHS } from '@/lib/content';

const IMAGES: Record<string, string> = {
  cart: '/images/products/dell-p2724deb.png',
  wrench: '/images/solutions/data-centers.png',
};

/*
 * Tarjeta "elegí tu camino" (Tienda / Servicios) -- estilo pedido por el
 * usuario (referencia: TravelCard, foto + overlay oscuro + contenido pegado
 * abajo + chips de vidrio + botón blanco de ancho completo). Adaptada: sin
 * bookmark ni rating (no aplican a un selector de 2 líneas de negocio), sin
 * cn()/lucide-react (no están instalados acá, esta app concatena clases con
 * template strings en todos lados) -- mismo look con lo que ya hay.
 */
export function SplitPaths() {
  return (
    <section className="relative z-10 -mt-16 px-6">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2">
        {BUSINESS_PATHS.map((path) => (
          <a
            key={path.title}
            href={path.href}
            className="group relative min-h-[380px] w-full overflow-hidden rounded-3xl bg-ink shadow-2xl shadow-black/20"
          >
            <img
              src={IMAGES[path.icon]}
              alt=""
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                path.icon === 'cart' ? 'object-contain p-10' : 'object-cover'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />

            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="mb-2 flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-bold text-white text-balance">{path.title}</h3>
                <span className="shrink-0 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  {path.tag}
                </span>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-white/70">{path.text}</p>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {path.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <span className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-ink transition-colors group-hover:bg-white/90">
                {path.cta}
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

import { BUSINESS_PATHS } from '@/lib/content';

const IMAGES: Record<string, string> = {
  cart: '/images/products/dell-p2724deb.png',
  wrench: '/images/solutions/data-centers.png',
};

export function SplitPaths() {
  return (
    <section className="relative z-10 -mt-16 px-6">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2">
        {BUSINESS_PATHS.map((path) => (
          <a
            key={path.title}
            href={path.href}
            className="group relative overflow-hidden rounded-2xl bg-ink text-white shadow-2xl shadow-black/20"
          >
            <div className="relative h-44 overflow-hidden bg-brand-dark">
              <img
                src={IMAGES[path.icon]}
                alt=""
                className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${
                  path.icon === 'cart' ? 'object-contain p-6' : 'object-cover'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            </div>
            <div className="p-7">
              <h3 className="font-display text-xl font-bold">{path.title}</h3>
              <p className="mt-2 text-sm text-white/65">{path.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-teal-light">
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

import Image from 'next/image';
import { BUSINESS_PATHS } from '@/lib/content';

const IMAGES: Record<string, string> = {
  cart: '/images/products/dell-p2724deb.png',
  wrench: '/images/solutions/data-centers.jpg',
};

/* Banner partido en 2 (referencia: "para él" / "para ella") -- acá las 2
   líneas de negocio reales de FPTecnologi, no una segmentación de género
   que no aplica a un distribuidor B2B. */
export function SplitBanner10() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2">
      {BUSINESS_PATHS.map((path) => (
        <a key={path.title} href={path.href} className="group relative flex min-h-[380px] items-end overflow-hidden bg-ink p-8 text-white sm:min-h-[440px] sm:p-12">
          <Image
            src={IMAGES[path.icon]}
            alt=""
            fill
            sizes="50vw"
            className={`transition-transform duration-700 group-hover:scale-105 ${path.icon === 'cart' ? 'object-contain p-16 opacity-90' : 'object-cover opacity-70'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold sm:text-3xl">{path.title}</h3>
            <p className="mt-2 max-w-sm text-sm text-white/70">{path.text}</p>
            <span className="btn-sweep mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary before:text-white group-hover:text-white">
              {path.cta}
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}

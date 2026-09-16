import Image from 'next/image';
import { PARTNER_BRANDS } from '@/lib/content';

export function BrandMarquee() {
  const track = [...PARTNER_BRANDS, ...PARTNER_BRANDS];

  return (
    <section id="marcas" className="border-y border-black/5 bg-white py-12">
      <p className="mx-auto mb-6 max-w-7xl px-6 text-center text-xs font-semibold uppercase tracking-widest text-ink/40">
        Distribución autorizada de las principales marcas
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="animate-marquee flex w-max items-center gap-14">
          {track.map((brand, i) => (
            <div key={`${brand.name}-${i}`} className="relative h-10 w-28 shrink-0 grayscale transition-all hover:grayscale-0">
              <Image src={brand.logo} alt={brand.name} fill sizes="112px" className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

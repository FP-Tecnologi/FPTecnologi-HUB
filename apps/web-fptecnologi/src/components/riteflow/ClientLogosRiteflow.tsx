import Image from 'next/image';
import { PARTNER_BRANDS } from '@/lib/content';

/* "Marcas" de la estructura final -- franja de desplazamiento infinito, sin
   pausa (mismo mecanismo CSS que site/BrandMarquee.tsx: track duplicado +
   @keyframes marquee de globals.css), estilo Riteflow. */
export function ClientLogosRiteflow() {
  const track = [...PARTNER_BRANDS, ...PARTNER_BRANDS];

  return (
    <section id="marcas" className="border-b border-[#2d3a57] bg-[#0e1422] py-10">
      <p className="mx-auto mb-6 max-w-[1440px] px-4 text-center text-sm uppercase tracking-wide text-[#fbfbfb]/50 md:px-6 lg:px-12 xl:px-16">
        Distribución autorizada de las principales marcas
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0e1422] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0e1422] to-transparent" />
        <div className="animate-marquee flex w-max items-center gap-6">
          {track.map((b, i) => (
            <div key={`${b.name}-${i}`} className="shrink-0 rounded-md bg-white/90 px-4 py-3 opacity-80 transition-opacity hover:opacity-100">
              <Image src={b.logo} alt={b.name} width={110} height={32} className="h-6 w-auto object-contain sm:h-7" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';
import { STATS } from '@/lib/content';

const BADGES = [
  { icon: 'M13 2 3 14h7l-1 8 11-14h-7l1-6Z', label: 'Stock local', sub: 'Sin esperar importación' },
  { icon: 'M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8', label: '24–48H', sub: 'Entrega en Lima' },
  { icon: 'M12 3 4 6.5v5c0 5 3.4 8.7 8 9.5 4.6-.8 8-4.5 8-9.5v-5L12 3Z', label: 'Garantía oficial', sub: 'Marcas certificadas' },
];

export function Hero7() {
  return (
    <section id="inicio" className="relative flex min-h-[640px] items-center overflow-hidden bg-ink text-white lg:min-h-[92vh]">
      <Image
        src="/images/modelo7/hero.jpg"
        alt="Escritorio de trabajo con monitor, laptop y teclado — equipamiento FPTecnologi"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 brand-mesh opacity-40 mix-blend-overlay" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">FPTecnologi &amp; System</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[1.05] sm:text-5xl lg:text-6xl">
            Tecnología <span className="text-brand-teal-light">sin límites</span> para tu empresa
          </h1>
          <p className="mt-6 max-w-md text-base text-white/70 sm:text-lg">
            Monitores, laptops, servidores y pantallas interactivas con stock local y distribución autorizada.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a href="#categorias" className="btn-sweep rounded-full bg-brand-teal-light px-7 py-3.5 text-sm font-semibold text-brand-dark before:bg-white">
              Ver catálogo
            </a>
            <div className="flex items-center gap-3 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-dark">
                {STATS[0].value}{STATS[0].suffix}
              </span>
              <span className="text-xs font-semibold text-white/85">{STATS[0].label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal-light/20 text-brand-teal-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d={b.icon} /></svg>
              </span>
              <div>
                <p className="text-sm font-bold text-white">{b.label}</p>
                <p className="text-xs text-white/60">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

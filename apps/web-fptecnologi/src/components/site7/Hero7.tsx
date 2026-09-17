import Image from 'next/image';
import { STATS } from '@/lib/content';

const BADGES = [
  { label: 'Stock local', sub: 'Sin esperar importación' },
  { label: '24-48H', sub: 'Entrega en Lima' },
  { label: 'Garantía oficial', sub: 'Marcas certificadas' },
];

export function Hero7() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-paper py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">FPTecnologi &amp; System</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
            Tecnología <span className="text-brand-primary">sin límites</span> para tu empresa
          </h1>
          <p className="mt-6 max-w-md text-base text-ink/60 sm:text-lg">
            Monitores, laptops, servidores y pantallas interactivas con stock local y distribución autorizada.
            Equipamos oficinas, aulas y data centers en todo Lima.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#categorias" className="btn-sweep rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
              Ver catálogo
            </a>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                {STATS[0].value}{STATS[0].suffix}
              </span>
              {STATS[0].label}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-black/10">
            <Image
              src="/images/modelo7/hero.jpg"
              alt="Escritorio de trabajo con monitor, laptop y teclado — equipamiento FPTecnologi"
              width={1600}
              height={1067}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 flex w-[92%] -translate-x-1/2 flex-wrap justify-between gap-3 rounded-2xl bg-white p-4 shadow-xl">
            {BADGES.map((b) => (
              <div key={b.label} className="min-w-[100px] flex-1 text-center">
                <p className="text-sm font-bold text-ink">{b.label}</p>
                <p className="text-[11px] text-ink/50">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

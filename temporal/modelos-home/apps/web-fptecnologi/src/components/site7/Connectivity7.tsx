import Image from 'next/image';
import { SOLUTIONS } from '@/lib/content';

const SETUPS = SOLUTIONS.slice(0, 5);

// 5 puntos sobre un círculo (pentágono), calculados una vez a mano
// (ángulos de 72° empezando arriba) -- ver nota más abajo sobre por qué no
// se calculan en runtime.
const POSITIONS = [
  { top: '10%', left: '50%' },
  { top: '37.6%', left: '88%' },
  { top: '82.4%', left: '73.5%' },
  { top: '82.4%', left: '26.5%' },
  { top: '37.6%', left: '12%' },
];

export function Connectivity7() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal-light/10 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">Plug in. Connect. Perform.</span>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">Conectividad para cada configuración</h2>
        </div>

        {/* Composición radial -- solo desde lg, necesita espacio real para
            que el pentágono no se pise. En mobile/tablet, grid simple. */}
        <div className="relative mx-auto hidden aspect-square max-w-[640px] lg:block">
          <div className="absolute inset-[8%] rounded-full border border-dashed border-white/15" aria-hidden />
          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-2xl">
            <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-brand-primary"><path d="M12 3 4 6.5v5c0 5 3.4 8.7 8 9.5 4.6-.8 8-4.5 8-9.5v-5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          {SETUPS.map((s, i) => (
            <div
              key={s.slug}
              className="absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={POSITIONS[i]}
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-4 ring-ink">
                <Image src={s.image} alt={s.title} fill sizes="80px" className="object-cover" />
              </div>
              <p className="mt-3 text-sm font-semibold">{s.title}</p>
              <p className="mt-0.5 text-xs text-white/50">{s.tag}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:hidden">
          {SETUPS.map((s) => (
            <div key={s.slug} className="flex flex-col items-center text-center">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-4 ring-ink">
                <Image src={s.image} alt={s.title} fill sizes="80px" className="object-cover" />
              </div>
              <p className="mt-3 text-sm font-semibold">{s.title}</p>
              <p className="mt-0.5 text-xs text-white/50">{s.tag}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

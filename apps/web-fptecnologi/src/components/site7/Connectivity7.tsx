import Image from 'next/image';
import { SOLUTIONS } from '@/lib/content';

// ponytail: 5 nodos en fila conectados por una línea, no el diagrama en
// órbita/hexágono de la referencia (posicionamiento absoluto con trigonometría
// para 5 puntos en un círculo) -- mismo concepto ("conectado para cada
// entorno"), sin la fragilidad de calcular ángulos a mano en CSS.
const SETUPS = SOLUTIONS.slice(0, 5);

export function Connectivity7() {
  return (
    <section className="overflow-hidden bg-ink py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">Conectado a cada entorno</span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Soluciones para cada tipo de negocio</h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-11 hidden h-px bg-white/15 sm:block" aria-hidden />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-5">
            {SETUPS.map((s) => (
              <div key={s.slug} className="relative flex flex-col items-center text-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-ink">
                  <Image src={s.image} alt={s.title} fill sizes="96px" className="object-cover" />
                </div>
                <p className="mt-4 text-sm font-semibold">{s.title}</p>
                <p className="mt-1 text-xs text-white/50">{s.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

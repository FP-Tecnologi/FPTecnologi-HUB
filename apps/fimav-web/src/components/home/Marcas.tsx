import Reveal from '@/components/motion/Reveal';
import { contenido } from '@/lib/contenido';

// Franja de logos con desplazamiento continuo. La lista va dos veces: la copia es decorativa (aria-hidden + inert).
// Con prefers-reduced-motion se oculta la copia y queda una cuadrícula estática (ver globals.css).
export function FranjaMarcas({ className = '' }: { className?: string }) {
  return (
    <div className={`marquesina overflow-hidden ${className}`}>
      <div className="marquesina-pista flex w-max">
        {[false, true].map((copia) => (
          <ul
            key={String(copia)}
            className="marquesina-lista flex shrink-0 items-center gap-x-12 pr-12"
            {...(copia ? { 'aria-hidden': true, inert: true } : {})}
          >
            {contenido.marcas.map((m) => (
              <li key={m.nombre} className="group flex h-12 items-center">
                {m.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.logo}
                    alt={copia ? '' : m.nombre}
                    style={{ height: m.alto ?? 40 }}
                    className={`w-auto max-w-none transition ${m.solido ? '' : 'opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}
                  />
                ) : (
                  <span className="font-titulo text-2xl font-semibold leading-10 text-carbon/70 transition group-hover:text-carbon">{m.nombre}</span>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Marcas() {
  return (
    <section className="bg-white py-14">
      <Reveal className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-rojo-hondo">Marcas aliadas</h2>
        <FranjaMarcas className="mt-6" />
      </Reveal>
    </section>
  );
}

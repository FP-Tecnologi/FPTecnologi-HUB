import SeccionTitulo from '@/components/SeccionTitulo';
import Reveal from '@/components/motion/Reveal';
import { contenido } from '@/lib/contenido';
import type { CmsContenido } from '@/lib/cms';

// Franja de logos con desplazamiento continuo. La lista va dos veces: la copia es decorativa (aria-hidden + inert).
// Con prefers-reduced-motion se oculta la copia y queda una cuadrícula estática (ver globals.css).
export function FranjaMarcas({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
    <div className="marquesina overflow-hidden">
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
                    className={`w-auto max-w-none transition motion-safe:group-hover:scale-110 ${m.solido ? '' : 'opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}
                  />
                ) : (
                  <span className="inline-block font-titulo text-2xl font-semibold leading-10 text-carbon/70 transition motion-safe:group-hover:scale-110 group-hover:text-carbon">{m.nombre}</span>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
    </div>
  );
}

export default function Marcas({ titulo: t }: { titulo: CmsContenido['inicio']['marcas'] }) {
  return (
    <section className="bg-white py-14">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
        <SeccionTitulo nivel="h2" alineacion="centro" eyebrow={t.eyebrow} claro={t.claro} rojo={t.rojo} />
        <FranjaMarcas className="mt-6" />
      </Reveal>
    </section>
  );
}

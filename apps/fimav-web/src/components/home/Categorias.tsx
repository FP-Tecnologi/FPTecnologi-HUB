import Link from 'next/link';
import Hexagono from '@/components/Hexagono';
import SeccionTitulo from '@/components/SeccionTitulo';
import Inclinar from '@/components/motion/Inclinar';
import Reveal from '@/components/motion/Reveal';
import { categorias } from '@/lib/categorias';

export default function Categorias() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SeccionTitulo nivel="h2" claro="¿Cuáles" rojo="Servicios Ofrecemos?" subtitulo="Nuestras categorías de bienes y servicios para empresas y entidades del Estado." />
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {categorias.map((c, i) => (
            <Reveal as="li" key={c.slug} retraso={(i % 4) * 80}>
              <Inclinar className="h-full rounded-2xl">
                <Link
                  href={`/catalogo/${c.slug}`}
                  className="group/tarjeta flex h-full flex-col items-center gap-3 rounded-2xl bg-gris px-3 py-6 text-center transition-shadow duration-300 hover:shadow-[0_14px_30px_-12px_rgb(56_56_60/0.35)]"
                >
                  <Hexagono icono={c.icono} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-carbon">{c.nombre}</span>
                </Link>
              </Inclinar>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

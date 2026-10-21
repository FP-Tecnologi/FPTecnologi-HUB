import Link from 'next/link';
import Hexagono from '@/components/Hexagono';
import Titulo from '@/components/Titulo';
import { categorias } from '@/lib/categorias';

export default function Categorias() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Titulo claro="¿Cuáles" rojo="Servicios Ofrecemos?" className="text-3xl sm:text-4xl" />
        <p className="mt-3 max-w-xl text-carbon/80">Nuestras categorías de bienes y servicios para empresas y entidades del Estado.</p>
        <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link href={`/catalogo/${c.slug}`} className="flex h-full flex-col items-center gap-3 text-center transition-transform hover:-translate-y-1">
                <Hexagono icono={c.icono} />
                <span className="text-xs font-semibold uppercase tracking-wide text-carbon">{c.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

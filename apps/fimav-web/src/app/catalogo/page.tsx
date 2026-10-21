import Link from 'next/link';
import Hexagono from '@/components/Hexagono';
import Titulo from '@/components/Titulo';
import { categorias } from '@/lib/categorias';

export const metadata = { title: 'Catálogo' };

export default function CatalogoPage() {
  return (
    <main>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Titulo nivel="h1" claro="Portafolio" rojo="Especializado" className="text-4xl sm:text-5xl" />
          <p className="mt-3 max-w-xl text-carbon/80">Bienes y servicios para empresas y entidades del Estado.</p>
        </div>
      </section>
      {categorias.map((c, i) => (
        <section key={c.slug} className={`py-12 ${i % 2 ? 'bg-white' : 'bg-gris'}`}>
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
            <div className="flex gap-5">
              <div className="shrink-0"><Hexagono icono={c.icono} tam={64} /></div>
              <div>
                <h2 className="text-2xl font-medium text-carbon">{c.nombre}</h2>
                <p className="mt-2 max-w-xl text-carbon/80">{c.resumen}</p>
                {c.marcas.length > 0 && <p className="mt-2 text-sm font-medium text-rojo-hondo">Marcas: {c.marcas.join(' · ')}</p>}
                <Link href={`/catalogo/${c.slug}`} className="mt-4 inline-block rounded-full bg-boton px-6 py-2.5 font-medium text-white">
                  Ver y cotizar<span className="sr-only"> {c.nombre}</span>
                </Link>
              </div>
            </div>
            {c.fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 lg:w-96">
                {c.fotos.map((f, n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f} src={f} alt={`${c.nombre}, ejemplo ${n + 1}`} loading="lazy" className="aspect-square w-full rounded-2xl border border-carbon/20 object-cover" />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}

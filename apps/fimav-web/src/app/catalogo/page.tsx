import Hexagono from '@/components/Hexagono';
import Titulo from '@/components/Titulo';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
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
                <BotonHex href={`/catalogo/${c.slug}`} className="mt-4">
                  Ver y cotizar<span className="sr-only"> {c.nombre}</span>
                </BotonHex>
              </div>
            </div>
            {c.fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 lg:w-96">
                {c.fotos.map((f, n) => (
                  <HexImagen key={f} src={f} alt={`${c.nombre}, ejemplo ${n + 1}`} sizes="128px" />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}

import Reveal from '@/components/motion/Reveal';
import { ArrowRight } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import BannerPagina from '@/components/BannerPagina';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import { categorias } from '@/lib/categorias';

export const metadata = { title: 'Catálogo' };

export default function CatalogoPage() {
  return (
    <main>
      <BannerPagina eyebrow="Catálogo" titulo="Bienes y" resaltado="servicios" imagen="/fotos/networking-2.jpg" />
      {categorias.map((c, i) => (
        <section key={c.slug} className={`py-12 ${i % 2 ? 'bg-gris' : 'bg-white'}`}>
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
            <Reveal className="flex gap-5">
              <div className="shrink-0"><Hexagono icono={c.icono} tam={64} /></div>
              <div>
                <SeccionTitulo nivel="h2" tam="sm" claro={c.nombre} />
                <p className="mt-3 max-w-xl text-carbon/80">{c.resumen}</p>
                {c.marcas.length > 0 && <p className="mt-2 text-sm font-medium text-rojo-hondo">Marcas: {c.marcas.join(' · ')}</p>}
                <BotonHex href={`/catalogo/${c.slug}`} icono={ArrowRight} iconoPos="der" className="mt-4">
                  Ver y cotizar<span className="sr-only"> {c.nombre}</span>
                </BotonHex>
              </div>
            </Reveal>
            {c.fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 lg:w-96">
                {c.fotos.map((f, n) => (
                  <Reveal key={f} retraso={120 + n * 90}>
                    <HexImagen src={f} alt={`${c.nombre}, ejemplo ${n + 1}`} sizes="128px" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}

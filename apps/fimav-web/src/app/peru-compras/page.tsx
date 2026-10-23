import Reveal from '@/components/motion/Reveal';
import { Megaphone } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import BannerPagina from '@/components/BannerPagina';
import SeccionTitulo from '@/components/SeccionTitulo';
import { FranjaMarcas } from '@/components/home/Marcas';
import OrnamentoGeometrico from '@/components/OrnamentoGeometrico';
import HexImagen from '@/components/hex/HexImagen';
import { getCategorias, getPagina } from '@/lib/cms';

const descripcion = 'Fimav Perú atiende al sector Estado en Perú Compras: venta de bienes y servicios, postventa y soluciones tecnológicas según la necesidad de cada entidad.';
export const metadata = {
  title: 'Perú Compras',
  description: descripcion,
  openGraph: { title: 'Estamos en Perú Compras | Fimav Perú', description: descripcion, images: ['/brand/og.jpg'] },
};


export default async function PeruComprasPage() {
  const [c, categorias] = await Promise.all([getPagina('peru-compras'), getCategorias()]);
  return (
    <main>
      <BannerPagina eyebrow={c.banner.eyebrow} titulo={c.banner.titulo} resaltado={c.banner.resaltado} imagen={c.banner.imagen} posicion="center 45%" />
      <section className="relative isolate overflow-hidden bg-white pb-16 pt-8 lg:pb-24">
        <OrnamentoGeometrico className="pointer-events-none absolute -right-24 top-1/2 z-0 hidden w-80 -translate-y-1/2 text-carbon opacity-[0.07] md:block" />
        <Reveal className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-4">
              <Hexagono icono={Megaphone} tam={64} />
              <h2 className="titulo-menor text-3xl text-carbon">{c.sector.subtitulo}</h2>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-carbon/80">{c.sector.texto}</p>
            {c.sector.texto2 && <p className="mt-4 max-w-2xl leading-relaxed text-carbon/80">{c.sector.texto2}</p>}
          </div>
          <HexImagen
            src={c.sector.imagen}
            alt="Grúa de puerto levantando un contenedor con el logo de la marca Perú"
            sizes="(min-width: 1024px) 380px, 80vw"
            className="mx-auto w-full max-w-xs lg:max-w-sm"
          />
        </Reveal>
      </section>

      <section className="bg-boton py-10 text-white">
        <Reveal className="mx-auto flex max-w-6xl justify-center px-4 sm:px-6 md:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/peru-compras/logo-blanco.png" alt="Perú Compras" width={900} height={427} loading="lazy" className="h-auto w-56 sm:w-72" />
        </Reveal>
      </section>

      <section className="bg-gris py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal><SeccionTitulo nivel="h2" eyebrow={c.trabajo.eyebrow} claro={c.trabajo.claro} rojo={c.trabajo.rojo} /></Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {c.trabajo.items.map(({ title: t, text: d }, i) => (
              <Reveal as="li" key={`${i}-${t}`} retraso={(i % 2) * 90} className="rounded-2xl bg-white p-6">
                <h3 className="titulo-menor text-xl text-carbon">{t}</h3>
                <p className="mt-2 leading-relaxed text-carbon/80">{d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SeccionTitulo nivel="h2" eyebrow={c.categorias.eyebrow} claro={c.categorias.claro} rojo={c.categorias.rojo} />
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((c, i) => (
              <Reveal as="li" key={c.slug} retraso={(i % 3) * 70} className="flex items-center gap-3 rounded-2xl bg-gris p-4 text-carbon">
                <Hexagono icono={c.icono} tam={44} />
                <span className="font-medium">{c.nombre}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gris py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SeccionTitulo nivel="h2" eyebrow={c.marcas.eyebrow} claro={c.marcas.claro} rojo={c.marcas.rojo} />
            <FranjaMarcas className="mt-6" />
          </Reveal>
        </div>
      </section>

    </main>
  );
}

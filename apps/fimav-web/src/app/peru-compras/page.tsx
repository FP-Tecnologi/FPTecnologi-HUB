import Reveal from '@/components/motion/Reveal';
import { Megaphone } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import BannerPagina from '@/components/BannerPagina';
import SeccionTitulo from '@/components/SeccionTitulo';
import { FranjaMarcas } from '@/components/home/Marcas';
import HexImagen from '@/components/hex/HexImagen';
import { categorias } from '@/lib/categorias';
import { contenido } from '@/lib/contenido';

const descripcion = 'Fimav Perú atiende al sector Estado en Perú Compras: venta de bienes y servicios, postventa y soluciones tecnológicas según la necesidad de cada entidad.';
export const metadata = {
  title: 'Perú Compras',
  description: descripcion,
  openGraph: { title: 'Estamos en Perú Compras | Fimav Perú', description: descripcion, images: ['/brand/og.jpg'] },
};

const trabajo = [
  ['Venta y postventa', 'Atendemos la venta de bienes y servicios y acompañamos con postventa.'],
  ['Soluciones a medida', 'Desarrollamos diversos tipos de soluciones tecnológicas según la necesidad de cada entidad.'],
  ['Cobertura', 'Estamos en diversos puntos de Lima Metropolitana y en los demás departamentos del interior del país.'],
  ['Respaldo de marcas', 'Contamos con el respaldo de las marcas más comerciales del mercado y somos socios estratégicos de ellas.'],
];

export default function PeruComprasPage() {
  return (
    <main>
      <BannerPagina titulo="Estamos en" resaltado="Perú Compras" subtitulo="Atendemos al sector Estado en la plataforma de contratación pública." imagen="/peru-compras/contenedor.jpg" posicion="center 45%" />
      <section className="bg-white pb-16 pt-8 lg:pb-24">
        <div className="entrada mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-4">
              <Hexagono icono={Megaphone} tam={64} />
              <h2 className="titulo-menor text-3xl text-carbon">Sector Estatal</h2>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-carbon/80">{contenido.perucompras}</p>
            <p className="mt-4 max-w-2xl leading-relaxed text-carbon/80">
              Nuestra experiencia de más de 10 años nos ha posicionado en los primeros puestos del ranking comercial de gobierno en Perú Compras, la plataforma de contratación del Estado.
            </p>
          </div>
          <HexImagen
            src="/peru-compras/contenedor.jpg"
            alt="Grúa de puerto levantando un contenedor con el logo de la marca Perú"
            sizes="(min-width: 1024px) 380px, 80vw"
            className="mx-auto w-full max-w-xs lg:max-w-sm"
          />
        </div>
      </section>

      <section className="bg-boton py-10 text-white">
        <Reveal className="mx-auto flex max-w-6xl justify-center px-4 sm:px-6 md:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/peru-compras/logo-blanco.png" alt="Perú Compras" width={900} height={427} loading="lazy" className="h-auto w-56 sm:w-72" />
        </Reveal>
      </section>

      <section className="bg-gris py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal><SeccionTitulo nivel="h2" claro="Cómo" rojo="trabajamos" subtitulo="Venta, postventa y soluciones tecnológicas para cada entidad." /></Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {trabajo.map(([t, d], i) => (
              <Reveal as="li" key={t} retraso={(i % 2) * 90} className="rounded-2xl bg-white p-6">
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
            <SeccionTitulo nivel="h2" claro="Nuestras" rojo="categorías" subtitulo="Bienes y servicios que atendemos para entidades del Estado y empresas privadas." />
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
            <SeccionTitulo nivel="h2" claro="Marcas con las que" rojo="trabajamos" subtitulo="Socios estratégicos de las marcas más comerciales del mercado." />
            <FranjaMarcas className="mt-6" />
          </Reveal>
        </div>
      </section>

    </main>
  );
}

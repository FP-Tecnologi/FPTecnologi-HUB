import { Megaphone } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import Titulo from '@/components/Titulo';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import { categorias } from '@/lib/categorias';
import { contacto } from '@/lib/contacto';
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
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <Titulo nivel="h1" claro="Estamos en" rojo="Perú Compras" className="text-4xl sm:text-5xl" />
            <div className="mt-8 flex items-center gap-4">
              <Hexagono icono={Megaphone} tam={64} />
              <h2 className="font-titulo text-3xl text-carbon">Sector Estatal</h2>
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
        <div className="mx-auto flex max-w-6xl justify-center px-4 sm:px-6 md:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/peru-compras/logo-blanco.png" alt="Perú Compras" width={900} height={427} className="h-auto w-56 sm:w-72" />
        </div>
      </section>

      <section className="bg-gris py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Titulo claro="Cómo" rojo="trabajamos" className="text-3xl sm:text-4xl" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {trabajo.map(([t, d]) => (
              <li key={t} className="rounded-2xl bg-white p-6">
                <h3 className="text-lg font-semibold text-carbon">{t}</h3>
                <p className="mt-2 leading-relaxed text-carbon/80">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Titulo claro="Qué ofrecemos a las" rojo="entidades" className="text-3xl sm:text-4xl" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((c) => (
              <li key={c.slug} className="flex items-center gap-3 rounded-2xl bg-gris p-4 text-carbon">
                <Hexagono icono={c.icono} tam={44} />
                <span className="font-medium">{c.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gris py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Titulo claro="Marcas" rojo="aliadas" className="text-3xl sm:text-4xl" />
          <ul className="mt-6 flex flex-wrap gap-3">
            {contenido.marcas.map((m) => (
              <li key={m} className="rounded-full bg-white px-5 py-2 font-medium text-carbon">{m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-carbon py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-medium">¿Tu entidad necesita una cotización?</h2>
            <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-rojo" />
            <p className="mt-2 text-white/80">
              Escríbenos a <a href={`mailto:${contacto.ventas}`} className="underline focus-visible:outline-white">{contacto.ventas}</a> o llámanos al{' '}
              <a href={contacto.telefonoHref} className="underline focus-visible:outline-white">{contacto.telefono}</a>.
            </p>
          </div>
          <BotonHex href="/cotizar" size="lg">Cotizar ahora</BotonHex>
        </div>
      </section>
    </main>
  );
}

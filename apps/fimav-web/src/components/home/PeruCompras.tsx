import Reveal from '@/components/motion/Reveal';
import { Landmark, Megaphone } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import { contenido } from '@/lib/contenido';

export default function PeruCompras() {
  return (
    <section>
      <div className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <SeccionTitulo nivel="h2" tam="lg" claro="Estamos en" rojo="Perú Compras" subtitulo="Atendemos al sector Estado en la plataforma de contratación pública." />
            <div className="mt-8 flex items-center gap-4">
              <Hexagono icono={Megaphone} tam={64} />
              <h3 className="titulo-menor text-3xl text-carbon">Sector Estatal</h3>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-carbon/80">{contenido.perucompras}</p>
          </Reveal>
          <Reveal retraso={120}>
          <HexImagen
            src="/peru-compras/contenedor.jpg"
            alt="Grúa de puerto levantando un contenedor con el logo de la marca Perú"
            sizes="(min-width: 1024px) 380px, 80vw"
            className="mx-auto w-full max-w-xs lg:max-w-sm"
          />
          </Reveal>
        </div>
      </div>
      <div className="bg-boton py-12 text-white">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6 md:flex-row md:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/peru-compras/logo-blanco.png" alt="Perú Compras" width={900} height={427} loading="lazy" className="h-auto w-56 sm:w-72" />
          <div className="flex flex-col items-center gap-4 text-center md:items-end md:text-right">
            <p className="max-w-md text-lg">Atendemos al Estado a través de la plataforma de contratación pública.</p>
            <BotonHex href="/peru-compras" variante="contorno" size="lg" icono={Landmark}>Conoce cómo atendemos al Estado</BotonHex>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

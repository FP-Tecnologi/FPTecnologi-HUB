import Reveal from '@/components/motion/Reveal';
import { Landmark, Megaphone } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import type { CmsContenido } from '@/lib/cms';

export default function PeruCompras({ datos: d }: { datos: CmsContenido['inicio']['perucompras'] }) {
  return (
    <section>
      <div className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <SeccionTitulo nivel="h2" tam="lg" eyebrow={d.eyebrow} claro={d.claro} rojo={d.rojo} />
            <div className="mt-8 flex items-center gap-4">
              <Hexagono icono={Megaphone} tam={64} />
              <h3 className="titulo-menor text-3xl text-carbon">{d.subtitulo}</h3>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-carbon/80">{d.texto}</p>
          </Reveal>
          <Reveal retraso={120}>
          <HexImagen
            src={d.imagen}
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
            <p className="max-w-md text-lg">{d.franja}</p>
            <BotonHex href="/peru-compras" variante="contorno" size="lg" icono={Landmark}>{d.boton}</BotonHex>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

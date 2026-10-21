import { Megaphone } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import Titulo from '@/components/Titulo';
import BotonHex from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import { contenido } from '@/lib/contenido';

export default function PeruCompras() {
  return (
    <section>
      <div className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <Titulo claro="Estamos en" rojo="Perú Compras" className="text-4xl sm:text-5xl" />
            <div className="mt-8 flex items-center gap-4">
              <Hexagono icono={Megaphone} tam={64} />
              <h3 className="font-titulo text-3xl text-carbon">Sector Estatal</h3>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-carbon/80">{contenido.perucompras}</p>
          </div>
          <HexImagen
            src="/peru-compras/contenedor.jpg"
            alt="Grúa de puerto levantando un contenedor con el logo de la marca Perú"
            sizes="(min-width: 1024px) 380px, 80vw"
            className="mx-auto w-full max-w-xs lg:max-w-sm"
          />
        </div>
      </div>
      <div className="bg-boton py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6 md:flex-row md:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/peru-compras/logo-blanco.png" alt="Perú Compras" width={900} height={427} loading="lazy" className="h-auto w-56 sm:w-72" />
          <div className="flex flex-col items-center gap-4 text-center md:items-end md:text-right">
            <p className="max-w-md text-lg">Atendemos al Estado a través de la plataforma de contratación pública.</p>
            <BotonHex href="/peru-compras" variante="contorno" size="lg">Conoce cómo atendemos al Estado</BotonHex>
          </div>
        </div>
      </div>
    </section>
  );
}

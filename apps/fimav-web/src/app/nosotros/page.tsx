import Espiral from '@/components/Espiral';
import Titulo from '@/components/Titulo';
import CorteHex from '@/components/hex/CorteHex';
import { contenido } from '@/lib/contenido';

export const metadata = { title: 'Nosotros' };

export default function NosotrosPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <Espiral contorno className="pointer-events-none absolute -right-24 -top-24 w-80 opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Titulo nivel="h1" claro="Misión" rojo="y Visión" className="text-4xl sm:text-5xl" />
          <h2 className="mt-10 text-2xl font-medium text-carbon">Misión</h2>
          <span aria-hidden="true" className="mt-2 block h-1 w-16 rounded-full bg-rojo" />
          <p className="mt-4 max-w-3xl leading-relaxed text-carbon/80">{contenido.mision}</p>
        </div>
      </section>
      <section className="bg-white">
        <CorteHex lado="arriba" color="var(--color-carbon)" />
        <div className="bg-carbon py-16 text-white lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-medium">Visión</h2>
            <span aria-hidden="true" className="mt-2 block h-1 w-16 rounded-full bg-rojo" />
            <p className="mt-4 max-w-3xl leading-relaxed text-white/90">{contenido.vision}</p>
          </div>
        </div>
        <CorteHex lado="abajo" color="var(--color-carbon)" />
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="max-w-3xl leading-relaxed text-carbon/80">{contenido.frase}</p>
        </div>
      </section>
    </main>
  );
}

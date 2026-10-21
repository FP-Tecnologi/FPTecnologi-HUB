import Reveal from '@/components/motion/Reveal';
import BotonHex from '@/components/hex/BotonHex';
import CorteHex from '@/components/hex/CorteHex';

export default function CtaCotizar() {
  return (
    <section className="text-white">
      <CorteHex lado="arriba" color="var(--color-carbon)" />
      <div className="bg-carbon py-14">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-medium">Cotiza con Fimav Perú</h2>
            <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-rojo" />
            <p className="mt-2 text-white/80">Cuéntanos qué necesitas y te respondemos con una propuesta.</p>
          </div>
          <BotonHex href="/cotizar" size="lg">Cotizar ahora</BotonHex>
        </Reveal>
      </div>
    </section>
  );
}

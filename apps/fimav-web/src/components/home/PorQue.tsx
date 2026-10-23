import Reveal from '@/components/motion/Reveal';
import { Check } from 'lucide-react';
import SeccionTitulo from '@/components/SeccionTitulo';
import type { CmsContenido } from '@/lib/cms';
import HexImagen from '@/components/hex/HexImagen';

export default function PorQue({ datos: d }: { datos: CmsContenido['inicio']['porque'] }) {
  return (
    <section className="bg-gris py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal className="lg:order-2" retraso={120}>
          <HexImagen src={d.imagen} alt="Atención y soluciones de Fimav Perú" orientacion="punta-lado" sizes="(min-width: 1024px) 448px, 90vw" className="mx-auto w-full max-w-md" />
        </Reveal>
        <div>
          <Reveal>
          <SeccionTitulo nivel="h2" eyebrow={d.eyebrow} claro={d.claro} rojo={d.rojo} />
          <p className="mt-6 text-carbon/80">{d.intro}</p>
          </Reveal>
          <ul className="mt-6 space-y-3">
            {d.items.map((t, i) => (
              <Reveal as="li" key={`${i}-${t}`} retraso={i * 90} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-rojo text-white"><Check size={16} strokeWidth={3} aria-hidden="true" /></span>
                <span className="text-carbon">{t}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

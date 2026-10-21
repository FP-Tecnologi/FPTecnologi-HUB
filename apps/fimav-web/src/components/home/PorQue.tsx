import { Check } from 'lucide-react';
import Titulo from '@/components/Titulo';
import { contenido } from '@/lib/contenido';
import HexImagen from '@/components/hex/HexImagen';

export default function PorQue() {
  return (
    <section className="bg-gris py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <HexImagen src="/fotos/escogernos.jpg" alt="Atención y soluciones de Fimav Perú" orientacion="punta-lado" sizes="(min-width: 1024px) 448px, 90vw" className="mx-auto w-full max-w-md lg:order-2" />
        <div>
          <Titulo claro="¿Por qué" rojo="Escogernos?" className="text-3xl sm:text-4xl" />
          <p className="mt-4 text-carbon/80">{contenido.porQueIntro}</p>
          <ul className="mt-6 space-y-3">
            {contenido.porQue.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-rojo text-white"><Check size={16} strokeWidth={3} aria-hidden="true" /></span>
                <span className="text-carbon">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

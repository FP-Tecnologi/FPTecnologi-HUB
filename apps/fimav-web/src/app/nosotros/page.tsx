import { Eye, Lightbulb, Medal, RefreshCw, ShieldCheck, Target } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import Espiral from '@/components/Espiral';
import Hexagono from '@/components/Hexagono';
import BannerPagina from '@/components/BannerPagina';
import SeccionTitulo from '@/components/SeccionTitulo';
import { getPagina } from '@/lib/cms';

export const metadata = { title: 'Nosotros' };

const HEX = 'M50 4 94 27v46L50 96 6 73V27Z';
const pilares = [Lightbulb, Medal, ShieldCheck, RefreshCw];

/** Tarjeta de Misión / Visión: hexágono con icono, sobretítulo + título, párrafo y barra roja. */
function Tarjeta({ icono, eyebrow, claro, rojo, texto, retraso }: { icono: typeof Target; eyebrow: string; claro: string; rojo: string; texto: string; retraso: number }) {
  return (
    <Reveal retraso={retraso} className="group/tarjeta relative overflow-hidden rounded-2xl border border-carbon/10 bg-white p-6 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:border-rojo/40 hover:shadow-md motion-safe:hover:-translate-y-1 sm:p-8">
      <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 w-36 opacity-[0.12]">
        <path d={HEX} fill="none" stroke="#38383c" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="relative">
        <Hexagono icono={icono} tam={56} />
        <SeccionTitulo nivel="h2" tam="sm" eyebrow={eyebrow} claro={claro} rojo={rojo} className="mt-5" />
        <p className="mt-5 max-w-prose leading-relaxed text-carbon/80">{texto}</p>
      </div>
    </Reveal>
  );
}

export default async function NosotrosPage() {
  const c = await getPagina('nosotros');
  return (
    <main>
      <BannerPagina eyebrow={c.banner.eyebrow} titulo={c.banner.titulo} resaltado={c.banner.resaltado} imagen={c.banner.imagen} posicion="center 35%" />
      <section className="relative overflow-hidden bg-white py-16 lg:py-20">
        <Espiral contorno className="aparecer pointer-events-none absolute -right-24 -top-24 w-80 opacity-20" />
        <Reveal className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" eyebrow={c.quienes.eyebrow} claro={c.quienes.claro} rojo={c.quienes.rojo} />
          <p className="mt-6 max-w-3xl leading-relaxed text-carbon/80">{c.quienes.texto}</p>
        </Reveal>
      </section>
      <section className="bg-gris py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:gap-8">
          <Tarjeta icono={Target} eyebrow={c.mision.eyebrow} claro={c.mision.claro} rojo={c.mision.rojo} texto={c.mision.texto} retraso={0} />
          <Tarjeta icono={Eye} eyebrow={c.vision.eyebrow} claro={c.vision.claro} rojo={c.vision.rojo} texto={c.vision.texto} retraso={120} />
        </div>
      </section>
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal><SeccionTitulo nivel="h2" eyebrow={c.porque.eyebrow} claro={c.porque.claro} rojo={c.porque.rojo} /></Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.porque.items.map((t, i) => {
              const Icono = pilares[i % pilares.length];
              return (
                <Reveal as="li" key={`${i}-${t}`} retraso={i * 90} className="group/tarjeta flex flex-col items-start gap-4">
                  <Hexagono icono={Icono} tam={52} />
                  <span className="text-carbon">{t}</span>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}

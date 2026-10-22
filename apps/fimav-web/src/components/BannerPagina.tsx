import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Espiral from '@/components/Espiral';
import SeccionTitulo from '@/components/SeccionTitulo';
import CorteHex from '@/components/hex/CorteHex';

type Miga = { texto: string; href: string };
type Props = {
  titulo: string;
  resaltado?: string;
  subtitulo?: string;
  /** Migas intermedias; "Inicio" y la página actual (el propio título) se agregan solas. */
  migas?: Miga[];
};

const enlace = 'inline-flex min-h-6 items-center rounded-smunderline-offset-2 hover:text-white hover:underline focus-visible:outline-white';

/** Banner pequeño de página interna: franja carbón con motivos del brochure, borde inferior con muesca hexagonal y migas de pan. El título es el h1 de la página. */
export default function BannerPagina({ titulo, resaltado, subtitulo, migas = [] }: Props) {
  const actual = [titulo, resaltado].filter(Boolean).join(' ');
  return (
    <header>
      <div className="relative overflow-hidden bg-carbon text-white">
        {/* Decoración: espiral recortada en el borde derecho y hexágonos en línea fina. */}
        <Espiral contorno className="pointer-events-none absolute -right-28 top-1/2 w-72 -translate-y-1/2 opacity-30 sm:-right-24 sm:w-96" />
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute bottom-3 right-40 hidden w-16 opacity-25 lg:block">
          <path d="M50 4 94 27v46L50 96 6 73V27Z" fill="none" stroke="#b4bcc2" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute right-[34%] top-2 hidden w-9 opacity-20 md:block">
          <path d="M50 4 94 27v46L50 96 6 73V27Z" fill="none" stroke="#e02424" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div className="entrada relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
          <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-white/80">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              {[{ texto: 'Inicio', href: '/' }, ...migas].map((m) => (
                <li key={m.href} className="flex items-center gap-1.5">
                  <Link href={m.href} className={enlace}>{m.texto}</Link>
                  <ChevronRight aria-hidden="true" size={14} className="shrink-0" />
                </li>
              ))}
              <li aria-current="page" className="font-semibold text-white">{actual}</li>
            </ol>
          </nav>
          <SeccionTitulo nivel="h1" tam="md" claroSobreOscuro claro={titulo} rojo={resaltado} subtitulo={subtitulo} />
        </div>
      </div>
      <CorteHex lado="abajo" color="var(--color-carbon)" />
    </header>
  );
}

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
  /** Foto de fondo (decorativa), ruta bajo /public. */
  imagen?: string;
  /** `object-position` de la foto. */
  posicion?: string;
};

const enlace = 'inline-flex min-h-6 items-center rounded-sm underline-offset-2 hover:text-white hover:underline focus-visible:outline-white';

/** Banner de página interna: foto de fondo con degradado carbón (texto blanco AA sobre cualquier zona), motivos del brochure, borde inferior con muesca hexagonal y migas de pan. El título es el h1 de la página. */
export default function BannerPagina({ titulo, resaltado, subtitulo, migas = [], imagen = '/fotos/networking-2.jpg', posicion = 'center' }: Props) {
  const actual = [titulo, resaltado].filter(Boolean).join(' ');
  return (
    <header>
      <div className="relative overflow-hidden bg-carbon text-white">
        {/* Foto decorativa (LCP del banner: eager, con dimensiones) y degradado que oscurece más donde va el texto. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagen} alt="" aria-hidden="true" width={1200} height={700} loading="eager" fetchPriority="high" decoding="async" style={{ objectPosition: posicion }} className="pointer-events-none absolute inset-0 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-carbon/85 lg:bg-[linear-gradient(to_right,rgb(56_56_60/0.92),rgb(56_56_60/0.85)_70%,rgb(56_56_60/0.5))]" />
        {/* Decoración: espiral recortada en el borde derecho y hexágonos en línea fina. */}
        <Espiral contorno className="pointer-events-none absolute -right-28 top-1/2 w-72 -translate-y-1/2 opacity-30 sm:-right-24 sm:w-96" />
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute bottom-3 right-40 hidden w-16 opacity-25 lg:block">
          <path d="M50 4 94 27v46L50 96 6 73V27Z" fill="none" stroke="#b4bcc2" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute right-[34%] top-2 hidden w-9 opacity-20 md:block">
          <path d="M50 4 94 27v46L50 96 6 73V27Z" fill="none" stroke="#e02424" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div className="entrada relative mx-auto max-w-6xl min-h-[12.5rem] px-4 pb-8 pt-14 sm:min-h-[18.5rem] sm:px-6 sm:pb-14 sm:pt-20">
          <nav aria-label="Ruta de navegación" className="mb-2 text-sm text-white/80 sm:mb-4">
            <ol className="flex flex-nowrap items-center gap-x-1.5">
              {[{ texto: 'Inicio', href: '/' }, ...migas].map((m) => (
                <li key={m.href} className="flex shrink-0 items-center gap-1.5">
                  <Link href={m.href} className={enlace}>{m.texto}</Link>
                  <ChevronRight aria-hidden="true" size={14} className="shrink-0" />
                </li>
              ))}
              <li aria-current="page" title={actual} className="min-w-0 truncate font-semibold text-white">{actual}</li>
            </ol>
          </nav>
          <SeccionTitulo nivel="h1" tam="md" claroSobreOscuro className="max-sm:[&>h1]:text-[1.5rem] [&>p]:line-clamp-2" claro={titulo} rojo={resaltado} subtitulo={subtitulo} />
        </div>
      </div>
      <CorteHex lado="abajo" color="var(--color-carbon)" />
    </header>
  );
}

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import SeccionTitulo from '@/components/SeccionTitulo';
import CorteHex from '@/components/hex/CorteHex';

type Miga = { texto: string; href: string };
type Props = {
  /** Etiqueta corta de la página (sobretítulo y miga actual). */
  eyebrow: string;
  /** Título corto: el h1. Si no hay `resaltado`, la última palabra va en rojo. */
  titulo: string;
  resaltado?: string;
  /** Texto de la miga actual si no es el eyebrow. */
  miga?: string;
  /** Migas intermedias; "Inicio" y la página actual (el propio título) se agregan solas. */
  migas?: Miga[];
  /** Foto de fondo (decorativa), ruta bajo /public. */
  imagen?: string;
  /** `object-position` de la foto. */
  posicion?: string;
  /** Foto de producto sobre fondo blanco: se muestra completa a la derecha en vez de recortada. */
  producto?: boolean;
};

const enlace = 'inline-flex min-h-6 items-center rounded-sm underline-offset-2 hover:text-white hover:underline focus-visible:outline-white';

/** Banner de página interna: foto de fondo con degradado carbón (texto blanco AA sobre cualquier zona), malla hexagonal de fondo, borde inferior con muesca hexagonal y migas de pan. El título es el h1 de la página. */
export default function BannerPagina({ eyebrow, titulo, resaltado, miga, migas = [], imagen = '/fotos/networking-2.jpg', posicion = 'center', producto = false }: Props) {
  const actual = miga ?? eyebrow;
  const palabras = titulo.split(' ');
  const claro = resaltado === undefined ? palabras.slice(0, -1).join(' ') : titulo;
  const rojo = resaltado === undefined ? palabras.at(-1) : resaltado;
  return (
    <header>
      <div className="relative overflow-hidden bg-carbon text-white">
        {/* Foto decorativa (LCP del banner: eager, con dimensiones). Producto sobre blanco: se muestra entera a la derecha. */}
        {producto && <div aria-hidden="true" className="absolute inset-0 bg-white" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagen} alt="" aria-hidden="true" width={1200} height={producto ? 900 : 700} loading="eager" fetchPriority="high" decoding="async" style={{ objectPosition: producto ? undefined : posicion }} className={`pointer-events-none absolute ${producto ? 'inset-y-0 right-0 h-full w-full object-contain object-right lg:right-[4%] lg:w-[45%]' : 'inset-0 size-full object-cover'}`} />
        {/* Degradado direccional: carbón fuerte donde va el texto (AA sobre el peor píxel) y velo ligero donde se luce la foto.
            < lg el texto ocupa todo el ancho: vertical (foto visible arriba y abajo). lg+: horizontal (texto a la izquierda, foto a la derecha). */}
        <div aria-hidden="true" className={`absolute inset-0 bg-[linear-gradient(to_bottom,rgb(56_56_60/0.3),rgb(56_56_60/0.8)_18%,rgb(56_56_60/0.8)_80%,rgb(56_56_60/0.35))] ${producto ? 'lg:bg-[linear-gradient(to_right,rgb(56_56_60/0.92),rgb(56_56_60/0.88)_58%,rgb(56_56_60/0.4)_88%)]' : 'lg:bg-[linear-gradient(to_right,rgb(56_56_60/0.92),rgb(56_56_60/0.88)_58%,rgb(56_56_60/0.2)_88%)]'}`} />
        {/* Franja inferior que enlaza con el color de la muesca hexagonal (carbón). */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-carbon to-transparent" />
        {/* Decoración de fondo: malla de hexágonos suaves sobre el velo oscuro (más visible a la derecha) y un resplandor rojo tenue. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_88%_40%,rgb(224_36_36/0.2),transparent_45%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url(/fondos/hex-patron.svg)] bg-[length:78px_auto] opacity-70 [mask-image:linear-gradient(to_left,#000_0%,rgb(0_0_0/0.55)_45%,transparent_90%)] sm:bg-[length:97px_auto]" />
        <div className="entrada relative mx-auto max-w-6xl min-h-[15rem] px-4 pb-8 pt-24 sm:min-h-[21rem] sm:px-6 sm:pb-14 sm:pt-28">
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
          <SeccionTitulo nivel="h1" tam="md" claroSobreOscuro className="max-w-xl max-sm:[&>h1]:text-[1.5rem] [&_h1>span:first-child]:text-white/90" eyebrow={eyebrow} claro={claro} rojo={rojo} />
        </div>
      </div>
      <CorteHex lado="abajo" color="var(--color-carbon)" />
    </header>
  );
}

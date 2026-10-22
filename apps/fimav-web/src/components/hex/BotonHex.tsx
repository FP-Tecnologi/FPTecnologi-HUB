import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { redondear } from './rutaHexagono';

// Tapa izquierda en unidades de la altura del botón: punta a 60° (como un hexágono regular) con vértices redondeados.
// Las tapas escalan con la altura y el cuerpo central se estira, así la forma sirve a cualquier ancho sin JS.
const S = 0.29, R = 0.15, W = S + 2 * R;
const TAPA = `${redondear([[W, 0], [S, 0], [0, 0.5], [S, 1], [W, 1]], R, false)}Z`;

export function Forma({ className }: { className: string }) {
  const tapa = (extra = '') => (
    <svg viewBox={`0 0 ${W} 1`} preserveAspectRatio="none" className={`h-full shrink-0 ${extra}`} style={{ aspectRatio: `${W} / 1` }}>
      <path d={TAPA} fill="currentColor" />
    </svg>
  );
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute -z-10 flex transition-[color,opacity] ${className}`}>
      {tapa()}<span className="-mx-px flex-1 bg-current" />{tapa('-scale-x-100')}
    </span>
  );
}

const VARIANTES = {
  rojo: { texto: 'text-white', capas: <Forma className="inset-0 text-boton group-hover/hex:text-rojo-hondo" /> },
  carbon: { texto: 'text-white', capas: <Forma className="inset-0 text-carbon group-hover/hex:text-tinta" /> },
  contorno: {
    texto: 'text-rojo-hondo',
    capas: <><Forma className="inset-0 text-rojo-hondo" /><Forma className="inset-[2px] text-white group-hover/hex:text-gris" /></>,
  },
};
const TAM = { sm: 'min-h-11 px-6 py-2', md: 'min-h-11 px-8 py-2', lg: 'min-h-13 px-10 py-3' };
// Tipografía: texto normal o rótulo (display, mayúscula). Va aquí y no en className para no depender del orden del CSS.
const TIPO = {
  normal: { sm: 'font-semibold text-sm', md: 'font-semibold text-base', lg: 'font-semibold text-lg' },
  rotulo: { sm: 'font-display font-bold uppercase tracking-widest text-base', md: 'font-display font-bold uppercase tracking-widest text-lg', lg: 'font-display font-bold uppercase tracking-widest text-xl' },
};

/** Capas de fondo de un control hexagonal: anillo de foco (en `group-focus-visible/hex`), forma de la variante y brillo de hover.
 *  El control debe llevar `group/hex relative isolate`. */
export function CapasHex({ variante = 'rojo' }: { variante?: keyof typeof VARIANTES }) {
  return (
    <>
      <Forma className="-inset-[5px] text-tinta opacity-0 group-focus-visible/hex:opacity-100" />
      <Forma className="-inset-[3px] text-white opacity-0 group-focus-visible/hex:opacity-100" />
      {VARIANTES[variante].capas}
      <span aria-hidden="true" className={`barrido ${variante === 'contorno' ? '[--brillo:rgb(224_36_36/0.14)]' : ''}`}><span /></span>
    </>
  );
}

type Props = {
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variante?: keyof typeof VARIANTES;
  size?: keyof typeof TAM;
  disabled?: boolean;
  /** Icono lucide decorativo (aria-hidden); en hover se desplaza (derecha) o gira (izquierda). */
  icono?: LucideIcon;
  iconoPos?: 'izq' | 'der';
  /** Icono girando (estado de carga). */
  cargando?: boolean;
  /** Texto en display y mayúscula (cabecera, CTA). */
  rotulo?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Botón o enlace con forma de hexágono alargado. Foco: anillo blanco + tinta que sigue la forma (visible sobre claro y sobre carbón). */
export default function BotonHex({ href, onClick, type = 'button', variante = 'rojo', size = 'md', disabled, icono: Icono, iconoPos = 'izq', cargando, rotulo, className = '', children }: Props) {
  const cls = `group/hex relative isolate inline-flex items-center justify-center gap-2 text-center leading-snug focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-transform motion-safe:hover:not-disabled:not-aria-disabled:scale-[1.03] ${TAM[size]} ${TIPO[rotulo ? 'rotulo' : 'normal'][size]} ${VARIANTES[variante].texto} ${className}`;
  const icon = Icono && (
    <Icono aria-hidden="true" size={size === 'lg' ? 22 : 18} className={`shrink-0 ${cargando ? 'animate-spin' : ''} motion-safe:transition-transform motion-safe:duration-300 ${cargando || disabled ? '' : iconoPos === 'der' ? 'motion-safe:group-hover/hex:translate-x-1' : 'motion-safe:group-hover/hex:-rotate-12 motion-safe:group-hover/hex:scale-110'}`} />
  );
  const contenido = <><CapasHex variante={variante} />{iconoPos === 'izq' && icon}{children}{iconoPos === 'der' && icon}</>;
  if (!href) return <button type={type} onClick={onClick} disabled={disabled} aria-busy={cargando || undefined} className={cls}>{contenido}</button>;
  // Enlace deshabilitado: no es un enlace (sin href ni foco), anunciado como deshabilitado.
  if (disabled) return <span role="link" aria-disabled="true" className={`${cls} cursor-not-allowed opacity-60`}>{contenido}</span>;
  if (href.startsWith('/')) return <Link href={href} className={cls}>{contenido}</Link>;
  const externo = /^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}; // mailto:, tel:, # se quedan en la pestaña
  return <a href={href} {...externo} className={cls}>{contenido}</a>;
}

import Link from 'next/link';
import { redondear } from './rutaHexagono';

// Tapa izquierda en unidades de la altura del botón: punta a 60° (como un hexágono regular) con vértices redondeados.
// Las tapas escalan con la altura y el cuerpo central se estira, así la forma sirve a cualquier ancho sin JS.
const S = 0.29, R = 0.15, W = S + 2 * R;
const TAPA = `${redondear([[W, 0], [S, 0], [0, 0.5], [S, 1], [W, 1]], R, false)}Z`;

function Forma({ className }: { className: string }) {
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
const TAM = { md: 'min-h-11 px-8 py-2 text-base', lg: 'min-h-13 px-10 py-3 text-lg' };

type Props = {
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variante?: keyof typeof VARIANTES;
  size?: keyof typeof TAM;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Botón o enlace con forma de hexágono alargado. Foco: anillo blanco + tinta que sigue la forma (visible sobre claro y sobre carbón). */
export default function BotonHex({ href, onClick, type = 'button', variante = 'rojo', size = 'md', disabled, className = '', children }: Props) {
  const v = VARIANTES[variante];
  const cls = `group/hex relative isolate inline-flex items-center justify-center gap-2 text-center font-semibold leading-snug focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 ${TAM[size]} ${v.texto} ${className}`;
  const contenido = (
    <>
      <Forma className="-inset-[5px] text-tinta opacity-0 group-focus-visible/hex:opacity-100" />
      <Forma className="-inset-[3px] text-white opacity-0 group-focus-visible/hex:opacity-100" />
      {v.capas}
      {children}
    </>
  );
  if (href?.startsWith('/')) return <Link href={href} className={cls}>{contenido}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{contenido}</a>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{contenido}</button>;
}

'use client';

import { ClickConfirmButton } from './ClickConfirmButton';
import { ArrowUpRightIcon } from '@/components/site/icons';

const SIZE = 'h-10 rounded-xl pl-2 pr-5 text-xs font-semibold uppercase tracking-wide md:h-11 md:pr-6 md:text-sm 2xl:h-12 2xl:text-base';

// light: para fondos claros (azul oscuro -> azul principal). dark: para
// secciones de fondo oscuro (blanco -> azul principal).
const TONE = {
  light: { base: 'bg-brand-dark text-white hover:bg-brand-primary', done: 'bg-brand-primary text-white', chip: 'bg-white/20' },
  dark: { base: 'bg-white text-brand-dark hover:bg-brand-primary hover:text-white', done: 'bg-brand-primary text-white', chip: 'bg-brand-dark/10' },
} as const;

/* Botón "Más información" con sweep -- uno solo para Nosotros y las
   tarjetas de Servicios, así tamaño (responsive) y color no se desalinean. */
export function MoreInfoButton({
  href,
  label = 'Más información',
  className = '',
  onClick,
  tone = 'light',
}: {
  href?: string;
  label?: string;
  className?: string;
  /** En vez de navegar a `href`, ejecuta esto al terminar el sweep. */
  onClick?: () => void;
  tone?: keyof typeof TONE;
}) {
  const t = TONE[tone];
  const icon = (rotated: boolean) => (
    <span className={`flex items-center justify-center rounded-lg p-1 md:p-1.5 ${t.chip}`}>
      <ArrowUpRightIcon className={`h-4 w-4 transition-transform duration-300 md:h-5 md:w-5 ${rotated ? 'rotate-45' : ''}`} />
    </span>
  );

  return (
    <ClickConfirmButton
      icon={icon}
      label={label}
      doneIcon={() => icon(false)}
      doneLabel={label}
      onConfirm={() => {
        if (onClick) onClick();
        else if (href) window.location.href = href;
      }}
      className={`${SIZE} ${t.base} ${className}`}
      doneClassName={`${SIZE} ${t.done} ${className}`}
    />
  );
}

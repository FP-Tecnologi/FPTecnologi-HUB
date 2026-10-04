'use client';

import { ClickConfirmButton } from './ClickConfirmButton';
import { ArrowUpRightIcon } from '@/components/site/icons';

const SIZE = 'h-9 rounded-xl pl-1.5 pr-4 text-xs font-semibold uppercase tracking-wide md:h-10 md:pr-5 md:text-[13px] 2xl:h-11 2xl:text-sm';

// light: para fondos claros (azul oscuro -> azul principal). dark: para
// secciones de fondo oscuro (blanco -> azul principal).
const TONE = {
  light: { base: 'bg-brand-primary text-white hover:bg-brand-primary', done: 'bg-brand-primary text-white', chip: 'bg-white/20' },
  dark: { base: 'bg-white text-brand-dark hover:bg-brand-primary hover:text-white', done: 'bg-brand-primary text-white', chip: 'bg-brand-primary/10' },
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
    <span className={`flex items-center justify-center rounded-lg p-1 ${t.chip}`}>
      <ArrowUpRightIcon className={`h-4 w-4 transition-transform duration-300 ${rotated ? 'rotate-45' : ''}`} />
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

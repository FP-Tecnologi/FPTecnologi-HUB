/*
 * Logos de redes sociales con el mismo trazo lineal que lucide. lucide-react 1.x ya no trae logos de marcas
 * (Facebook, Instagram, LinkedIn); son los mismos trazos que usaba lucide y que usa la web de FPTecnologi.
 */
import type { ReactNode } from 'react';

type Props = { className?: string; size?: number };
const icono = (children: ReactNode) =>
  function RedSocialIcono({ className, size = 24 }: Props) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {children}
      </svg>
    );
  };

export const Facebook = icono(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />);
export const Instagram = icono(
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>,
);
export const Linkedin = icono(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>,
);

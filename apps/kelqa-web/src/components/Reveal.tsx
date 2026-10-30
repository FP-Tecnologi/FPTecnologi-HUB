'use client';
import { useEffect, useRef } from 'react';

// Un solo observador: marca data-dentro la primera vez que el elemento entra en pantalla y deja de observarlo (no se reanima al volver a pasar).
let io: IntersectionObserver | undefined;
const observador = () =>
  (io ??= new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-dentro', ''); io?.unobserve(e.target); } }), {
    rootMargin: '0px 0px -8% 0px',
  }));

type Props = {
  children: React.ReactNode;
  retraso?: number;
  efecto?: 'subir' | 'izquierda' | 'derecha' | 'zoom';
  as?: 'div' | 'li';
  className?: string;
};

/** Entrada suave al aparecer en pantalla. Sin JS o con reduced-motion se ve normal (ver globals.css). */
export default function Reveal({ children, retraso = 0, efecto = 'subir', as: Tag = 'div', className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return el?.setAttribute('data-dentro', '');
    observador().observe(el);
    return () => observador().unobserve(el);
  }, []);
  return (
    <Tag ref={ref as React.Ref<never>} data-reveal={efecto} className={className} style={retraso ? ({ '--retraso': `${retraso}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}

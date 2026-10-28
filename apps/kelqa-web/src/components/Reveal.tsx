'use client';
import { useEffect, useRef } from 'react';

// Un solo observador: marca data-dentro al entrar y lo quita al salir, así la entrada y la salida son suaves.
let io: IntersectionObserver | undefined;
const observador = () =>
  (io ??= new IntersectionObserver((es) => es.forEach((e) => e.target.toggleAttribute('data-dentro', e.isIntersecting)), {
    rootMargin: '0px 0px -8% 0px',
  }));

type Props = {
  children: React.ReactNode;
  retraso?: number;
  efecto?: 'subir' | 'izquierda' | 'derecha' | 'zoom';
  as?: 'div' | 'li';
  className?: string;
};

/** Entrada y salida suaves al aparecer/desaparecer de la pantalla. Sin JS o con reduced-motion se ve normal (ver globals.css). */
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

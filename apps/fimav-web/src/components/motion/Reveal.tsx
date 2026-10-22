'use client';
import { useEffect, useRef } from 'react';

// Un solo observador para toda la página. Margen superior = alto del header fijo (~57 px): la atenuación de salida ocurre bajo el header.
let io: IntersectionObserver | undefined;
const observador = () =>
  (io ??= new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        (e.target as HTMLElement).dataset.estado = e.isIntersecting ? 'dentro' : e.boundingClientRect.top < 0 ? 'arriba' : 'abajo';
      }
    },
    { rootMargin: '-64px 0px -8% 0px' },
  ));

type Props = { children: React.ReactNode; retraso?: number; as?: 'div' | 'li' | 'section'; className?: string };

/** Entrada con desvanecido y desplazamiento al entrar al viewport. Sin JS o con reduced-motion el contenido se ve normal
 *  (el estado oculto vive en `@media (scripting: enabled)`); si el JS falla o no hay IntersectionObserver, una animación
 *  de respaldo lo muestra a los 2.5 s (ver globals.css). */
export default function Reveal({ children, retraso = 0, as: Tag = 'div', className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const o = observador();
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return (
    <Tag ref={ref as React.Ref<never>} data-reveal="" className={className} style={retraso ? ({ '--retraso': `${retraso}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}

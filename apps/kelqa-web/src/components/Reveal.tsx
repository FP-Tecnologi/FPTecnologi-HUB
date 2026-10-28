'use client';
import { useEffect, useRef } from 'react';

let io: IntersectionObserver | undefined;
const observador = () =>
  (io ??= new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && (e.target.setAttribute('data-dentro', ''), io!.unobserve(e.target))),
    { rootMargin: '0px 0px -8% 0px' },
  ));

type Props = { children: React.ReactNode; retraso?: number; className?: string };

/** Entrada suave al aparecer en pantalla (una sola vez). Sin JS o con reduced-motion se ve normal (ver globals.css). */
export default function Reveal({ children, retraso = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return el?.setAttribute('data-dentro', '');
    observador().observe(el);
    return () => observador().unobserve(el);
  }, []);
  return (
    <div ref={ref} data-reveal="" className={className} style={retraso ? ({ '--retraso': `${retraso}ms` } as React.CSSProperties) : undefined}>
      {children}
    </div>
  );
}

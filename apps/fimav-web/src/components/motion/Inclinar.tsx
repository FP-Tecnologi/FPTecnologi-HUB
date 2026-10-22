'use client';
import { useRef } from 'react';

const MAX = 6; // grados

/** Inclinación 3D (≤6°) según el cursor, con brillo que lo sigue. Solo ratón y sin reduced-motion; en táctil no hace nada.
 *  El rectángulo y la preferencia de movimiento se leen al entrar (no en cada movimiento). */
export default function Inclinar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const caja = useRef<DOMRect | null>(null);

  const entrar = (e: React.PointerEvent) => {
    const el = ref.current;
    const activo = el && e.pointerType === 'mouse' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    caja.current = activo ? el.getBoundingClientRect() : null;
  };
  const mover = (e: React.PointerEvent) => {
    const el = ref.current, r = caja.current;
    if (!el || !r || e.pointerType !== 'mouse') return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const px = (clientX - r.left) / r.width, py = (clientY - r.top) / r.height;
      el.dataset.activo = '';
      el.style.transform = `perspective(700px) rotateX(${(0.5 - py) * 2 * MAX}deg) rotateY(${(px - 0.5) * 2 * MAX}deg)`;
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    });
  };
  const salir = () => {
    const el = ref.current;
    cancelAnimationFrame(raf.current);
    caja.current = null;
    if (!el) return;
    el.removeAttribute('data-activo');
    el.style.transform = '';
  };

  return (
    <div ref={ref} onPointerEnter={entrar} onPointerMove={mover} onPointerLeave={salir} className={`inclinar relative ${className}`}>
      {children}
    </div>
  );
}

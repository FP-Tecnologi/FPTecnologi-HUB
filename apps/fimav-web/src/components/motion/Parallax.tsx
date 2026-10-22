'use client';
import { useEffect, useRef } from 'react';

const MQ = '(pointer: fine) and (prefers-reduced-motion: no-preference)';

/** Escribe --px/--py (-1…1, posición del cursor respecto al centro del bloque) para las `.capa` hijas.
 *  Solo ratón con puntero fino y sin reduced-motion (se reevalúa si cambia la preferencia); en táctil las capas quedan quietas. */
export default function Parallax({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = matchMedia(MQ);
    let raf = 0, cx = 0, cy = 0;
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cx = e.clientX;
      cy = e.clientY;
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        el.style.setProperty('--px', clamp((cx - (r.left + r.width / 2)) / (innerWidth / 2)).toFixed(3));
        el.style.setProperty('--py', clamp((cy - (r.top + r.height / 2)) / (innerHeight / 2)).toFixed(3));
      });
    };
    const aplicar = () => {
      window.removeEventListener('pointermove', mover);
      cancelAnimationFrame(raf);
      raf = 0;
      if (mq.matches) window.addEventListener('pointermove', mover, { passive: true });
      else { el.style.removeProperty('--px'); el.style.removeProperty('--py'); }
    };
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => {
      mq.removeEventListener('change', aplicar);
      window.removeEventListener('pointermove', mover);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

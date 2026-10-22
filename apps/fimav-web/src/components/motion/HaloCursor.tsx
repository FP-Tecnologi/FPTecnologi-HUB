'use client';
import { useEffect, useRef, useState } from 'react';

const INTERACTIVOS = 'a, button, summary, label, input, select, textarea, [data-halo]';

/** Halo rojo suave que sigue al puntero. Alfa 0.10 en el centro: blanco sobre `boton` queda en 4.77:1 y `rojo-hondo` sobre blanco en 5.05:1 (AA).
 * Solo con puntero fino y sin reduced-motion; decorativo (aria-hidden, sin eventos). */
export default function HaloCursor() {
  const [activo, setActivo] = useState(false);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    const actualizar = () => setActivo(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  useEffect(() => {
    const el = halo.current;
    if (!activo || !el) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, visto = false;
    const paso = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x - 100}px, ${y - 100}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(paso) : 0;
    };
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visto) { x = tx; y = ty; visto = true; }
      el.dataset.visible = '';
      el.toggleAttribute('data-sobre', !!(e.target as Element).closest?.(INTERACTIVOS));
      raf ||= requestAnimationFrame(paso);
    };
    const salir = () => el.removeAttribute('data-visible');
    window.addEventListener('pointermove', mover, { passive: true });
    document.documentElement.addEventListener('pointerleave', salir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', mover);
      document.documentElement.removeEventListener('pointerleave', salir);
    };
  }, [activo]);

  if (!activo) return null;
  return (
    <div ref={halo} aria-hidden="true" className="group/halo pointer-events-none fixed left-0 top-0 z-[60] size-[200px] opacity-0 transition-opacity duration-300 data-visible:opacity-100">
      <div className="size-full rounded-full bg-[radial-gradient(circle,rgb(224_36_36/0.1),transparent_68%)] transition-transform duration-300 ease-out group-data-sobre/halo:scale-150" />
    </div>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { rutaHexagono } from '@/components/hex/rutaHexagono';

const INTERACTIVOS = 'a, button, summary, label, input, select, textarea, [data-halo]';
const LADO = 28;
const RUTA = rutaHexagono({ orientacion: 'punta-arriba', radio: 0.12 });

/** Anillo hexagonal fino (solo contorno, sin relleno, sombra ni desenfoque) que sigue al puntero con un leve retraso.
 *  Crece sobre enlaces y botones y se encoge al pulsar. El cursor del sistema sigue visible.
 *  Solo con puntero fino y sin reduced-motion; decorativo (aria-hidden, sin eventos). */
export default function CursorHex() {
  const [activo, setActivo] = useState(false);
  const aro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    const actualizar = () => setActivo(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  useEffect(() => {
    const el = aro.current;
    if (!activo || !el) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, visto = false;
    const paso = () => {
      x += (tx - x) * 0.25;
      y += (ty - y) * 0.25;
      el.style.transform = `translate3d(${x - LADO / 2}px, ${y - LADO / 2}px, 0)`;
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
    const bajar = () => el.setAttribute('data-presion', '');
    const subir = () => el.removeAttribute('data-presion');
    window.addEventListener('pointermove', mover, { passive: true });
    window.addEventListener('pointerdown', bajar);
    window.addEventListener('pointerup', subir);
    document.documentElement.addEventListener('pointerleave', salir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerdown', bajar);
      window.removeEventListener('pointerup', subir);
      document.documentElement.removeEventListener('pointerleave', salir);
    };
  }, [activo]);

  if (!activo) return null;
  return (
    <div ref={aro} aria-hidden="true" style={{ width: LADO, height: LADO }} className="group/aro pointer-events-none fixed left-0 top-0 z-[60] opacity-0 transition-opacity duration-200 data-visible:opacity-100">
      <svg viewBox="0 0 1 1" className="size-full overflow-visible text-rojo/70 transition-transform duration-200 ease-out group-data-sobre/aro:scale-[1.6] group-data-presion/aro:scale-90 group-data-sobre/aro:group-data-presion/aro:scale-[1.35]">
        <path d={RUTA} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

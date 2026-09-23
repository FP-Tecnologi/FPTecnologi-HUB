'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right';

/*
 * Envoltorio reutilizable para animar cualquier bloque al entrar/salir del
 * viewport con scroll (a diferencia de los v9-appear/v1-appear del Hero, que
 * solo animan una vez al montar el componente). Usa IntersectionObserver:
 * `visible` pasa a true al entrar y vuelve a false al salir, así que la
 * animación se repite cada vez que el bloque cruza el viewport (entrada Y
 * salida), no solo la primera vez.
 *
 * useLayoutEffect + un chequeo síncrono con getBoundingClientRect (en vez de
 * arrancar siempre en `visible=false` y esperar el primer callback del
 * observer) -- necesario para el Hero: es lo primero que se ve al cargar la
 * página, así que sin esto se vería un parpadeo (oculto -> visible) apenas
 * carga, en vez de aparecer ya visible.
 */
export function ScrollReveal({
  children,
  direction = 'up',
  className = '',
  delayMs = 0,
}: {
  children: ReactNode;
  direction?: Direction;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH * 0.9 && rect.bottom > viewportH * 0.1) {
      setVisible(true);
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.2,
      rootMargin: '-10% 0px -10% 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${direction} ${visible ? 'scroll-reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}

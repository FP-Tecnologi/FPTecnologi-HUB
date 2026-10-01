'use client';

import { useEffect } from 'react';

/*
 * Animación de SALIDA al cambiar de página. La entrada es CSS puro (`main` entra con `pagina-entra`
 * en globals.css); la salida la hace esto: al hacer clic en un enlace interno normal se marca el body con
 * `pagina-saliendo` (el contenido se desvanece ~220 ms) y recién entonces se navega. No toca clics con
 * Ctrl/Cmd/Shift, enlaces a otra pestaña, anclas (#), descargas ni los que otro componente ya manejó
 * (por ejemplo los botones con sweep que navegan solos).
 */
const SALIDA_MS = 220;

export function TransicionPagina() {
  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Al volver con "atrás" el navegador restaura la página en caché: quitar la marca de salida.
    const alMostrar = () => document.body.classList.remove('pagina-saliendo');
    window.addEventListener('pageshow', alMostrar);

    const alClic = (e: MouseEvent) => {
      if (reducido || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|https?:\/\/wa\.me)/i.test(href)) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // ancla/misma página
      e.preventDefault();
      document.body.classList.add('pagina-saliendo');
      window.setTimeout(() => {
        window.location.href = url.href;
      }, SALIDA_MS);
    };
    document.addEventListener('click', alClic);
    return () => {
      document.removeEventListener('click', alClic);
      window.removeEventListener('pageshow', alMostrar);
    };
  }, []);
  return null;
}

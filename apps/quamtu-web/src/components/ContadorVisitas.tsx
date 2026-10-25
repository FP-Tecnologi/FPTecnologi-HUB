'use client';
/*
 * Contador de visitas propio (sin cookies): en cada página vista avisa a /api/hub/visita, que lo reenvía a la API
 * del HUB con el marcaId de esta web. No cuenta la vista previa del editor del dashboard (iframe, ?cms, ?equipo).
 * Las cifras se ven en el dashboard → tarjetas «Tráfico web».
 */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ContadorVisitas() {
  const pathname = usePathname();
  const anterior = useRef<string | null>(null);
  const contada = useRef<string | null>(null);

  useEffect(() => {
    // Una vez por página (en desarrollo React ejecuta el efecto dos veces).
    if (!pathname || contada.current === pathname) return;
    const params = new URLSearchParams(window.location.search);
    if (window.self !== window.top || params.has('cms') || params.has('equipo')) return;
    // La primera página trae el referrer real; las siguientes vienen de esta misma web (navegación interna).
    const referrer = anterior.current ?? document.referrer;
    anterior.current = window.location.href;
    contada.current = pathname;
    const cuerpo = JSON.stringify({ ruta: pathname, referrer, utm: params.get('utm_source') ?? undefined });
    try {
      if (navigator.sendBeacon?.('/api/hub/visita', new Blob([cuerpo], { type: 'application/json' }))) return;
    } catch { /* sigue con fetch */ }
    fetch('/api/hub/visita', { method: 'POST', body: cuerpo, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => undefined);
  }, [pathname]);

  return null;
}

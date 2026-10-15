'use client';
/*
 * Vista previa de la tarjeta: la MISMA página pública (web /tarjeta/vista-previa) dentro de un iframe, alimentada en vivo
 * con lo que se edita (sin guardar). Se puede ver en celular o en escritorio, con íconos, QR y portada reales.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { aplicarMostrar } from '../../lib/tarjetaOpciones';
import type { Tarjeta } from '../../screens/pages/MiTarjeta';
import { urlImagen } from '../ui/SubirImagen';

const WEB_ENV = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

const MODOS = {
  celular: { nombre: 'Celular', ancho: 390, alto: 800 },
  escritorio: { nombre: 'Escritorio', ancho: 1180, alto: 760 },
} as const;
type Modo = keyof typeof MODOS;

/** `base`: dirección de la web pública que informa la API (WEB_PUBLICA_URL); si no llega, la del panel. */
export function VistaPreviaReal({ t, url, base }: { t: Tarjeta; url?: string; base?: string }) {
  const WEB = (base || WEB_ENV).replace(/\/$/, '');
  const ORIGEN = (() => { try { return new URL(WEB).origin; } catch { return '*'; } })();
  const [modo, setModo] = useState<Modo>('celular');
  const [qr, setQr] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [ampliado, setAmpliado] = useState(false);
  const [ancho, setAncho] = useState(360);
  const marco = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  // Ancho disponible: la página se dibuja a su tamaño real y se reduce para caber.
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const medir = () => setAncho(el.clientWidth || 360);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // El iframe avisa cuando está listo para recibir datos.
  useEffect(() => {
    const alRecibir = (ev: MessageEvent) => {
      if (ev.source === frame.current?.contentWindow && (ev.data as { tipo?: string } | null)?.tipo === 'tarjeta-preview-listo') setListo(true);
    };
    window.addEventListener('message', alRecibir);
    return () => window.removeEventListener('message', alRecibir);
  }, []);

  // QR con los colores elegidos (lo genera la API; con un pequeño retardo mientras se escribe/elige).
  useEffect(() => {
    const id = setTimeout(() => {
      api.post<{ qr: string }>('/tarjetas/qr', { slug: t.slug, color: t.qrColor ?? '', fondo: t.qrFondo ?? '' }).then((r) => setQr(r.qr)).catch(() => setQr(null));
    }, 350);
    return () => clearTimeout(id);
  }, [t.slug, t.qrColor, t.qrFondo]);

  const datos = useMemo(() => {
    const v = aplicarMostrar(t);
    const m = t.mostrar ?? {};
    return {
      ...v,
      fotoUrl: v.fotoUrl ? urlImagen(v.fotoUrl) : null,
      portadaUrl: v.portadaUrl ? urlImagen(v.portadaUrl) : null,
      empresa: 'FPTecnologi & System',
      url: url || `${WEB}/tarjeta/${t.slug || 'tu-enlace'}`,
      qr: m.qr === false ? null : qr,
      mostrar: { cotizar: m.cotizar !== false, vcard: m.vcard !== false, compartir: m.compartir !== false, qr: m.qr !== false },
    };
  }, [t, url, qr]);

  const enviar = () => frame.current?.contentWindow?.postMessage({ tipo: 'tarjeta-preview', t: datos }, ORIGEN);
  useEffect(() => { if (listo) enviar(); }, [listo, datos]); // eslint-disable-line react-hooks/exhaustive-deps

  const m = MODOS[modo];
  const escala = Math.min(1, ancho / m.ancho);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)', ...(ampliado ? { position: 'fixed', inset: 0, zIndex: 60, background: 'var(--ax-surface, #fff)', padding: 16, overflow: 'auto' } : {}) }}>
      <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
        <strong>Vista previa</strong>
        <div className="ax-cluster" style={{ gap: 4 }}>
          {(Object.keys(MODOS) as Modo[]).map((k) => (
            <button key={k} type="button" aria-pressed={modo === k} className={`ax-btn ax-btn--sm ${modo === k ? 'ax-btn--secondary' : 'ax-btn--ghost'}`} onClick={() => setModo(k)}>{MODOS[k].nombre}</button>
          ))}
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setAmpliado((a) => !a)}>{ampliado ? 'Cerrar' : 'Ampliar'}</button>
        </div>
      </div>
      <div ref={marco} style={{ width: '100%' }}>
        <div style={{ width: m.ancho * escala, height: m.alto * escala, margin: '0 auto', border: '1px solid var(--ax-border)', borderRadius: modo === 'celular' ? 28 : 12, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}>
          <iframe
            ref={frame}
            title={`Vista previa de la tarjeta (${m.nombre.toLowerCase()})`}
            src={`${WEB}/tarjeta/vista-previa`}
            onLoad={() => enviar()}
            style={{ width: m.ancho, height: m.alto, border: 0, transform: `scale(${escala})`, transformOrigin: 'top left', background: '#fff' }}
          />
        </div>
      </div>
      <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', textAlign: 'center' }}>Es tu página real, en vivo: se actualiza mientras editas. Guarda para publicar los cambios.</span>
    </div>
  );
}

'use client';

/*
 * Vista previa de la tarjeta para el dashboard: se incrusta en un iframe y recibe por postMessage los datos que se están
 * editando (sin guardar). Dibuja EXACTAMENTE la misma página pública (TarjetaVista), en el ancho que tenga el iframe:
 * celular o escritorio. No guarda ni consulta nada; todo dato recibido se sanea antes de mostrarse.
 */
import { useEffect, useState } from 'react';
import { TarjetaVista, type DatosTarjeta } from '@/components/site/TarjetaVista';

const ESTILOS = ['clasico', 'moderno', 'oscuro', 'minimal'];
const texto = (v: unknown, max = 400) => (typeof v === 'string' ? v.slice(0, max) : null);
/** Solo http(s) o rutas propias: nunca javascript:, data: ni similares. */
const enlace = (v: unknown) => {
  const t = texto(v, 600)?.trim();
  return t && (/^https?:\/\/[^\s]+$/i.test(t) || /^\/[\w./%-]+$/.test(t)) ? t : null;
};

function sanear(d: unknown): DatosTarjeta | null {
  if (!d || typeof d !== 'object') return null;
  const o = d as Record<string, unknown>;
  const m = (o.mostrar ?? {}) as Record<string, unknown>;
  return {
    slug: texto(o.slug, 60) || 'tu-enlace',
    estilo: (ESTILOS.includes(String(o.estilo)) ? o.estilo : 'clasico') as DatosTarjeta['estilo'],
    vista: o.vista === 'linktree' ? 'linktree' : 'perfil',
    nombre: texto(o.nombre, 100) || 'Tu nombre',
    cargo: texto(o.cargo, 100) || null,
    area: texto(o.area, 100) || null,
    bio: texto(o.bio, 400) || null,
    fotoUrl: enlace(o.fotoUrl),
    portadaUrl: enlace(o.portadaUrl),
    telefono: texto(o.telefono, 30) || null,
    whatsapp: (texto(o.whatsapp, 30) ?? '').replace(/\D/g, '') || null,
    email: texto(o.email, 120) || null,
    linkedin: enlace(o.linkedin),
    web: enlace(o.web),
    agendaUrl: enlace(o.agendaUrl),
    enlaces: (Array.isArray(o.enlaces) ? o.enlaces : []).slice(0, 12).flatMap((l) => {
      const x = l as { titulo?: unknown; url?: unknown };
      const url = enlace(x?.url);
      const titulo = texto(x?.titulo, 60)?.trim();
      return url && titulo ? [{ titulo, url }] : [];
    }),
    empresa: texto(o.empresa, 80) || 'FPTecnologi & System',
    url: enlace(o.url) ?? '',
    qr: typeof o.qr === 'string' && o.qr.trimStart().startsWith('<svg') && o.qr.length < 100_000 ? o.qr : null,
    mostrar: { cotizar: m.cotizar !== false, vcard: m.vcard !== false, compartir: m.compartir !== false, qr: m.qr !== false },
  };
}

export default function VistaPreviaTarjeta() {
  const [t, setT] = useState<DatosTarjeta | null>(null);

  useEffect(() => {
    const alRecibir = (ev: MessageEvent) => {
      if (ev.source !== window.parent) return; // solo el dashboard que nos incrustó
      const msg = ev.data as { tipo?: string; t?: unknown } | null;
      if (msg?.tipo === 'tarjeta-preview') setT(sanear(msg.t));
    };
    window.addEventListener('message', alRecibir);
    window.parent?.postMessage({ tipo: 'tarjeta-preview-listo' }, '*');
    return () => window.removeEventListener('message', alRecibir);
  }, []);

  if (!t) return <p className="p-8 text-center text-sm text-ink/60">Cargando vista previa…</p>;
  return <TarjetaVista t={t} />;
}

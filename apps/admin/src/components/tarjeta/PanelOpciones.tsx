'use client';
/*
 * Opciones de la tarjeta digital: qué datos se muestran u ocultan en la página pública y cómo se ve el QR (colores).
 * Lo usan «Mi tarjeta digital» (cada persona) y «Tarjetas del equipo» (quien administra).
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { contrasteQr, GRUPOS_MOSTRAR, type CampoMostrar } from '../../lib/tarjetaOpciones';
import type { Tarjeta } from '../../screens/pages/MiTarjeta';

const PRESETS: { nombre: string; color: string; fondo: string }[] = [
  { nombre: 'Clásico', color: '#000000', fondo: '#ffffff' },
  { nombre: 'Azul', color: '#107acc', fondo: '#ffffff' },
  { nombre: 'Marino', color: '#0b1b26', fondo: '#ffffff' },
  { nombre: 'Celeste suave', color: '#0c60a1', fondo: '#e8f3fd' },
];

const ayuda = { fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' } as const;

/** `solo`: muestra únicamente «Qué se muestra» o únicamente el personalizador de QR (por defecto, ambos). */
export function PanelOpciones({ t, onCambio, solo }: { t: Tarjeta; onCambio: <K extends keyof Tarjeta>(k: K, valor: Tarjeta[K]) => void; solo?: 'mostrar' | 'qr' }) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    if (solo === 'mostrar') return;
    const id = setTimeout(() => {
      api.post<{ qr: string }>('/tarjetas/qr', { slug: t.slug, color: t.qrColor ?? '', fondo: t.qrFondo ?? '' }).then((r) => setQr(r.qr)).catch(() => setQr(null));
    }, 350);
    return () => clearTimeout(id);
  }, [solo, t.slug, t.qrColor, t.qrFondo]);
  const mostrar = t.mostrar ?? {};
  const color = t.qrColor || '#000000';
  const fondo = t.qrFondo || '#ffffff';
  const { ratio, invertido } = contrasteQr(color, fondo);
  const alternar = (id: CampoMostrar, visible: boolean) => onCambio('mostrar', { ...mostrar, [id]: visible });

  return (
    <>
      {solo !== 'qr' && <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
        <strong>Qué se muestra en la tarjeta</strong>
        <span style={ayuda}>Activa o desactiva cada dato o botón. Lo que apagues no aparece en tu página, en el contacto que se guarda ni en la tarjeta que descargas.</span>
        {GRUPOS_MOSTRAR.map((g) => (
          <fieldset key={g.titulo} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 }}>
            <legend style={{ fontSize: 'var(--ax-text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ax-text-muted)', marginBlockEnd: 4 }}>{g.titulo}</legend>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))' }}>
              {g.campos.map((c) => (
                <label key={c.id} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', fontSize: 'var(--ax-text-sm)' }}>
                  <input type="checkbox" className="ax-switch" checked={mostrar[c.id] !== false} onChange={(e) => alternar(c.id, e.target.checked)} />
                  {c.etiqueta}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>}

      {solo !== 'mostrar' && <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
        <strong>Personaliza el código QR</strong>
        <span style={ayuda}>Elige los colores del QR de esta tarjeta. Se ve en tu página y en la tarjeta que descargas. Si cambias el color, el QR sigue llevando al mismo enlace.</span>
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`} alt="Vista previa del código QR" width={160} height={160} style={{ width: 160, height: 160, borderRadius: 8, border: '1px solid var(--ax-border)', alignSelf: 'center' }} />
        )}
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p.nombre} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => { onCambio('qrColor', p.color); onCambio('qrFondo', p.fondo); }}>
              <span aria-hidden style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: p.color, border: `3px solid ${p.fondo}`, outline: '1px solid var(--ax-border)', marginInlineEnd: 6 }} />
              {p.nombre}
            </button>
          ))}
        </div>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
          <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
            Color del QR
            <input type="color" value={color} onChange={(e) => onCambio('qrColor', e.target.value)} aria-label="Color del QR" />
          </label>
          <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
            Fondo
            <input type="color" value={fondo} onChange={(e) => onCambio('qrFondo', e.target.value)} aria-label="Fondo del QR" />
          </label>
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => { onCambio('qrColor', ''); onCambio('qrFondo', ''); }}>Restablecer</button>
        </div>
        {(ratio < 4 || invertido) && (
          <span role="status" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-warning-600, #b45309)' }}>
            {invertido ? 'El QR es más claro que su fondo: algunos lectores no lo reconocen. Usa un color oscuro sobre fondo claro.' : 'Poco contraste entre el QR y su fondo: puede costar escanearlo. Prueba un color más oscuro.'}
          </span>
        )}
      </section>}
    </>
  );
}

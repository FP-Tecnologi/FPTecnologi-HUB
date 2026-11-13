'use client';
/*
 * Campo de imagen unificado: en un solo lugar se puede SUBIR desde el dispositivo o PEGAR un enlace (URL, o ruta
 * que empiece con / de la web pública). Siempre muestra la vista previa. Usar este componente en cualquier módulo
 * que pida una imagen (portada, logo, foto, ícono…) en vez de un <input> suelto o solo el botón de subir.
 *
 *  - <CampoImagen value onChange />        → una imagen (string)
 *  - <CampoImagenes value onChange />      → varias (string[]); la primera es la portada
 */
import { useState } from 'react';
import { SubirImagen, urlImagen } from './SubirImagen';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

/** URL mostrable: /uploads/… vive en la API; otras rutas con / son de la web pública. */
export function srcImagen(u: string | null | undefined): string | null {
  const v = (u ?? '').trim();
  if (!v) return null;
  if (v.startsWith('/uploads/')) return urlImagen(v);
  if (v.startsWith('/')) return `${WEB}${v}`;
  return v;
}

const valida = (u: string) => /^(https?:\/\/|\/)/.test(u.trim());

function Miniatura({ src, tam }: { src: string | null; tam: number }) {
  return (
    <span aria-hidden="true" style={{ flex: `0 0 ${tam}px`, inlineSize: tam, blockSize: tam, borderRadius: 'var(--ax-radius-md)', border: '1px solid var(--ax-border)', background: 'var(--ax-surface-subtle)', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-xs)' }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ inlineSize: '100%', blockSize: '100%', objectFit: 'contain' }} />
      ) : (
        'Sin imagen'
      )}
    </span>
  );
}

export function CampoImagen({
  id,
  value,
  onChange,
  placeholder = 'Pega un enlace https://… o sube un archivo',
  etiquetaSubir,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  placeholder?: string;
  etiquetaSubir?: string;
}) {
  const v = value ?? '';
  const mala = v.trim() !== '' && !valida(v);
  return (
    <div style={{ display: 'flex', gap: 'var(--ax-space-3)', alignItems: 'flex-start' }}>
      <Miniatura src={srcImagen(v)} tam={72} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
        <input id={id} type="text" inputMode="url" className={`ax-input${mala ? ' is-invalid' : ''}`} value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={mala || undefined} />
        {mala && <span role="alert" style={{ color: 'var(--ax-danger-500)', fontSize: 'var(--ax-text-xs)' }}>Debe empezar con https:// o con /</span>}
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
          <SubirImagen etiqueta={etiquetaSubir ?? (v ? 'Cambiar desde el dispositivo' : 'Subir desde el dispositivo')} onSubida={(urls) => urls[0] && onChange(urls[0])} />
          {v && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => onChange('')}>Quitar</button>}
        </div>
      </div>
    </div>
  );
}

export function CampoImagenes({
  id,
  value,
  onChange,
  etiquetaPortada = 'Portada',
}: {
  id?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  etiquetaPortada?: string;
}) {
  const [enlace, setEnlace] = useState('');
  const [aviso, setAviso] = useState('');

  function agregarEnlace() {
    const u = enlace.trim();
    if (!u) return;
    if (!valida(u)) return setAviso('El enlace debe empezar con https:// o con /');
    setAviso('');
    onChange([...value, u]);
    setEnlace('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ax-space-2)' }}>
          {value.map((u, i) => (
            <div key={u + i} style={{ position: 'relative', inlineSize: 84, blockSize: 84, borderRadius: 'var(--ax-radius-md)', border: i === 0 ? '2px solid var(--ax-accent)' : '1px solid var(--ax-border)', background: 'var(--ax-surface-subtle)', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={srcImagen(u) ?? ''} alt="" style={{ inlineSize: '100%', blockSize: '100%', objectFit: 'contain' }} />
              {i === 0 && <span style={{ position: 'absolute', insetBlockStart: 2, insetInlineStart: 2, fontSize: 10, background: 'var(--ax-accent)', color: 'var(--ax-on-accent)', borderRadius: 4, paddingInline: 4 }}>{etiquetaPortada}</span>}
              <div style={{ position: 'absolute', insetBlockEnd: 0, insetInline: 0, display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,.55)' }}>
                <button type="button" aria-label="Poner de portada" disabled={i === 0} onClick={() => onChange([u, ...value.filter((_, j) => j !== i)])} style={{ color: '#fff', fontSize: 12, padding: '2px 6px', opacity: i === 0 ? 0.3 : 1 }}>★</button>
                <button type="button" aria-label="Quitar imagen" onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ color: '#fff', fontSize: 12, padding: '2px 6px' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <SubirImagen multiple etiqueta="Subir desde el dispositivo" onSubida={(urls) => onChange([...value, ...urls])} />
      </div>
      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
        <input id={id} type="text" inputMode="url" className="ax-input" style={{ flex: 1 }} value={enlace} placeholder="…o pega un enlace https://… y pulsa Agregar" onChange={(e) => setEnlace(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarEnlace(); } }} />
        <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={agregarEnlace} disabled={!enlace.trim()}>Agregar</button>
      </div>
      {aviso && <span role="alert" style={{ color: 'var(--ax-danger-500)', fontSize: 'var(--ax-text-xs)' }}>{aviso}</span>}
    </div>
  );
}

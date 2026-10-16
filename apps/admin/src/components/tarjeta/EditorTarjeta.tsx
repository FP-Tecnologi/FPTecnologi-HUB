'use client';
/*
 * Editor de una tarjeta digital (el mismo para «Mi tarjeta» y para el administrador): formulario con un interruptor
 * de visibilidad en cada dato, vista previa con diseño y estilo, botones, QR personalizable y descargable.
 */
import type { ReactNode } from 'react';
import { PageHead } from '../shell/PageHead';
import { SubirImagen, urlImagen } from '../ui/SubirImagen';
import { PanelOpciones } from './PanelOpciones';
import { SelectorArea } from './SelectorArea';
import { VistaPreviaReal, type MarcaTarjeta } from './VistaPreviaReal';
import type { CampoMostrar } from '../../lib/tarjetaOpciones';
import type { Tarjeta } from '../../screens/pages/MiTarjeta';

const v = (x: string | null | undefined) => x ?? '';

export function EditorTarjeta({ titulo, volver = '← Volver', form, set, onGuardar, onCancelar, guardando, error, webBase, marca, url, extra, conVersion }: {
  titulo: string;
  volver?: string;
  form: Tarjeta;
  set: <K extends keyof Tarjeta>(k: K, valor: Tarjeta[K]) => void;
  onGuardar: () => void;
  onCancelar: () => void;
  guardando: boolean;
  error?: string;
  webBase?: string;
  marca?: MarcaTarjeta | null;
  url?: string;
  /** Botones extra junto a Guardar / Cancelar (p. ej. «Eliminar esta versión»). */
  extra?: ReactNode;
  /** Muestra «Nombre de esta versión» (solo en Mi tarjeta, donde una persona puede tener varias). */
  conVersion?: boolean;
}) {
  // «Mostrar en la tarjeta»: cada dato tiene su interruptor al lado; las mismas claves que usa la API.
  const mostrar = form.mostrar ?? {};
  const alternarMostrar = (id: CampoMostrar, visible: boolean) => set('mostrar', { ...mostrar, [id]: visible });
  const interruptor = (id: CampoMostrar, etiqueta: string) => (
    <label className="ax-cluster" style={{ gap: 6, flexWrap: 'nowrap', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', cursor: 'pointer' }}>
      <input type="checkbox" className="ax-switch" checked={mostrar[id] !== false} onChange={(e) => alternarMostrar(id, e.target.checked)} aria-label={`Mostrar ${etiqueta} en la tarjeta`} />
      {mostrar[id] !== false ? 'Visible' : 'Oculto'}
    </label>
  );

  const campo = (k: keyof Tarjeta, label: string, placeholder?: string, id?: CampoMostrar) => (
    <div className="ax-field">
      <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <label className="ax-label" htmlFor={`a-${k}`}>{label}</label>
        {id && interruptor(id, label)}
      </div>
      <input id={`a-${k}`} className="ax-input" placeholder={placeholder} value={v(form[k] as string)} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );


  return (
      <>
        <PageHead
          title={titulo}
          subtitle="Los cambios se ven en la vista previa mientras editas. Guarda para publicarlos."
          actions={<button type="button" className="ax-btn ax-btn--ghost" onClick={onCancelar}>{volver}</button>}
        />
        {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--ax-space-5)', alignItems: 'flex-start' }}>
          <section className="ax-card" style={{ flex: '1 1 24rem', minWidth: 0, padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--ax-space-4)', alignItems: 'flex-start' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                {form.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urlImagen(form.fotoUrl)} alt="Foto" width={64} height={64} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{(form.nombre || '?').charAt(0).toUpperCase()}</span>
                )}
                <SubirImagen etiqueta={form.fotoUrl ? 'Cambiar foto' : 'Subir foto'} onSubida={(urls) => set('fotoUrl', urls[0])} />
                {form.fotoUrl && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => set('fotoUrl', '')}>Quitar foto</button>}
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                {form.portadaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urlImagen(form.portadaUrl)} alt="Portada" style={{ width: 160, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 160, height: 60, borderRadius: 8, background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Sin portada</span>
                )}
                <SubirImagen etiqueta={form.portadaUrl ? 'Cambiar portada' : 'Subir portada'} onSubida={(urls) => set('portadaUrl', urls[0])} />
                {form.portadaUrl && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => set('portadaUrl', '')}>Quitar portada</button>}
              </div>
            </div>
            {conVersion && campo('etiqueta', 'Nombre de esta versión (solo para ti)', 'Comercial, Redes, Soporte…')}
            {campo('nombre', 'Nombre completo')}
            {campo('slug', 'Enlace único (/tarjeta/…)', 'se genera con el nombre')}
            {campo('cargo', 'Cargo', undefined, 'cargo')}
            <div className="ax-field">
              <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <label className="ax-label" htmlFor="a-area">Área</label>
                {interruptor('area', 'el área')}
              </div>
              <SelectorArea id="a-area" valor={v(form.area)} onCambio={(x) => set('area', x)} />
            </div>
            <div className="ax-field">
              <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <label className="ax-label" htmlFor="a-bio">Presentación corta</label>
                {interruptor('bio', 'la presentación')}
              </div>
              <input id="a-bio" className="ax-input" maxLength={400} placeholder="Qué haces y cómo ayudas al cliente" value={v(form.bio)} onChange={(e) => set('bio', e.target.value)} />
            </div>
            {campo('telefono', 'Teléfono', '+51 970 614 881', 'telefono')}
            {campo('whatsapp', 'WhatsApp (solo números con código de país)', '51970614881', 'whatsapp')}
            {campo('email', 'Correo', undefined, 'email')}
            {campo('linkedin', 'LinkedIn (enlace)', 'https://www.linkedin.com/in/…', 'linkedin')}
            {campo('cotizarUrl', 'Botón «Pide una cotización» (enlace)', 'Vacío = el cotizador de la web', 'cotizar')}

            <div className="ax-field" style={{ gap: 'var(--ax-space-2)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                <span className="ax-label">Enlaces extra (hasta 12)</span>
                <span className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                  {interruptor('enlaces', 'los enlaces extra')}
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={form.enlaces.length >= 12} onClick={() => set('enlaces', [...form.enlaces, { titulo: '', url: '' }])}>Agregar</button>
                </span>
              </div>
              {form.enlaces.map((e, i) => (
                <div key={i} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                  <input className="ax-input" placeholder="Título" aria-label={`Título del enlace ${i + 1}`} value={e.titulo} onChange={(ev) => set('enlaces', form.enlaces.map((x, j) => (j === i ? { ...x, titulo: ev.target.value } : x)))} />
                  <input className="ax-input" placeholder="https://…" aria-label={`Enlace ${i + 1}`} value={e.url} onChange={(ev) => set('enlaces', form.enlaces.map((x, j) => (j === i ? { ...x, url: ev.target.value } : x)))} />
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Quitar enlace" onClick={() => set('enlaces', form.enlaces.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>

            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--primary" disabled={guardando || form.nombre.trim().length < 2} onClick={onGuardar}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={onCancelar}>Cancelar</button>
              {extra}
            </div>
          </section>

          <div style={{ flex: '1.7 1 36rem', minWidth: 0 }}>
            <VistaPreviaReal onCambio={set} base={webBase} marca={marca} t={form} url={url} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', marginBlockStart: 'var(--ax-space-4)' }}>
              <section className="ax-card" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-5)', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 'var(--ax-text-sm)' }}>Botones</strong>
                  {([['vcard', 'Guardar contacto'], ['compartir', 'Compartir']] as const).map(([id, nombre]) => (
                    <label key={id} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', fontSize: 'var(--ax-text-sm)' }}>
                      <input type="checkbox" className="ax-switch" checked={mostrar[id] !== false} onChange={(e) => alternarMostrar(id, e.target.checked)} />
                      {nombre}
                    </label>
                  ))}
                </div>
              </section>
              <PanelOpciones t={form} onCambio={set} solo="qr" />
            </div>
          </div>
        </div>
      </>
  );
}

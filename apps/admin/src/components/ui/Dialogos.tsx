'use client';
/*
 * Diálogos propios del dashboard (en vez de window.confirm / window.prompt del navegador).
 * Uso: `if (!(await confirmar('¿Eliminar al usuario?', { boton: 'Eliminar' }))) return;`
 *      `const motivo = await pedirTexto({ titulo: 'Motivo', etiqueta: '¿Por qué se perdió?' });` (null = cancelado)
 * <DialogosHost /> se monta una sola vez en app/layout.tsx.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';

type Tono = 'peligro' | 'aviso' | 'info';
interface OpcionesConfirmar { titulo?: string; boton?: string; cancelar?: string; tono?: Tono }
interface OpcionesTexto { titulo: string; etiqueta?: string; placeholder?: string; boton?: string; minimo?: number; valor?: string }

type Pendiente =
  | { tipo: 'confirmar'; mensaje: string; o: OpcionesConfirmar; resolver: (v: boolean) => void }
  | { tipo: 'texto'; o: OpcionesTexto; resolver: (v: string | null) => void };

let actual: Pendiente | null = null;
const cola: Pendiente[] = [];
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());
const siguiente = () => { actual = cola.shift() ?? null; avisar(); };
const encolar = (p: Pendiente) => { if (actual) cola.push(p); else { actual = p; avisar(); } };

/** Pregunta de confirmación. Resuelve true al aceptar, false al cancelar / Escape / clic fuera. */
export function confirmar(mensaje: string, o: OpcionesConfirmar = {}): Promise<boolean> {
  return new Promise((resolver) => encolar({ tipo: 'confirmar', mensaje, o, resolver }));
}

/** Pide un texto. Resuelve el texto (recortado) o null si se cancela. */
export function pedirTexto(o: OpcionesTexto): Promise<string | null> {
  return new Promise((resolver) => encolar({ tipo: 'texto', o, resolver }));
}

const TONOS: Record<Tono, { color: string; fondo: string; icono: string }> = {
  peligro: { color: 'var(--ax-danger-500)', fondo: 'color-mix(in srgb, var(--ax-danger-500) 14%, transparent)', icono: '!' },
  aviso: { color: 'var(--ax-warning-500, #d99a00)', fondo: 'color-mix(in srgb, var(--ax-warning-500, #d99a00) 16%, transparent)', icono: '?' },
  info: { color: 'var(--ax-primary-500, #2563eb)', fondo: 'color-mix(in srgb, var(--ax-primary-500, #2563eb) 14%, transparent)', icono: 'i' },
};

/** Elige el tono según el texto: eliminar/borrar/quitar/cancelar → peligro. */
const tonoPorDefecto = (m: string, boton?: string): Tono => (/eliminar|borrar|quitar|cancelar el|restablecer|cerrar todas/i.test(`${boton ?? ''} ${m}`) ? 'peligro' : 'aviso');

export function DialogosHost() {
  const [, forzar] = useState(0);
  useEffect(() => {
    const f = () => forzar((n) => n + 1);
    oyentes.add(f);
    return () => { oyentes.delete(f); };
  }, []);
  if (!actual) return null;
  return <Dialogo key={cola.length + (actual.tipo === 'texto' ? actual.o.titulo : actual.mensaje)} p={actual} />;
}

function Dialogo({ p }: { p: Pendiente }) {
  const ref = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState(p.tipo === 'texto' ? p.o.valor ?? '' : '');
  useFocusTrap(ref, true);

  const cerrar = (ok: boolean) => {
    if (p.tipo === 'confirmar') p.resolver(ok);
    else p.resolver(ok ? texto.trim() : null);
    siguiente();
  };
  const minimo = p.tipo === 'texto' ? p.o.minimo ?? 1 : 0;
  const valido = p.tipo === 'confirmar' || texto.trim().length >= minimo;

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); cerrar(false); }
      else if (e.key === 'Enter' && p.tipo === 'confirmar') { e.preventDefault(); cerrar(true); }
    };
    window.addEventListener('keydown', tecla, true);
    return () => window.removeEventListener('keydown', tecla, true);
  });

  const tono = p.tipo === 'confirmar' ? p.o.tono ?? tonoPorDefecto(p.mensaje, p.o.boton) : 'info';
  const t = TONOS[tono];
  const titulo = p.tipo === 'confirmar' ? p.o.titulo ?? (tono === 'peligro' ? 'Confirmar acción' : 'Confirmar') : p.o.titulo;
  const boton = p.tipo === 'confirmar' ? p.o.boton ?? (tono === 'peligro' ? 'Sí, continuar' : 'Aceptar') : p.o.boton ?? 'Aceptar';

  return createPortal(
    <div className="ax-modal ax-modal--centered" role="presentation" style={{ zIndex: 'calc(var(--ax-z-modal) + 100)' as unknown as number }}>
      <div className="ax-modal__backdrop" onClick={() => cerrar(false)} />
      <div ref={ref} role="alertdialog" aria-modal="true" aria-label={titulo} className="ax-modal__dialog ax-modal__dialog--sm" style={{ textAlign: 'center' }}>
        <div className="ax-modal__body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ax-space-3)', paddingTop: 'var(--ax-space-6)' }}>
          <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 700, color: t.color, background: t.fondo }}>{t.icono}</span>
          <h2 className="ax-modal__title" style={{ margin: 0 }}>{titulo}</h2>
          {p.tipo === 'confirmar' ? (
            <p style={{ margin: 0, color: 'var(--ax-text-muted)', whiteSpace: 'pre-line' }}>{p.mensaje}</p>
          ) : (
            <form style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }} onSubmit={(e) => { e.preventDefault(); if (valido) cerrar(true); }}>
              {p.o.etiqueta && <label htmlFor="dialogo-texto" style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>{p.o.etiqueta}</label>}
              <textarea id="dialogo-texto" className="ax-input" rows={3} autoFocus value={texto} placeholder={p.o.placeholder} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (valido) cerrar(true); } }} />
            </form>
          )}
        </div>
        <div className="ax-modal__footer" style={{ justifyContent: 'center', gap: 'var(--ax-space-2)' }}>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={() => cerrar(false)}>{p.tipo === 'confirmar' ? p.o.cancelar ?? 'Cancelar' : 'Cancelar'}</button>
          <button type="button" autoFocus={p.tipo === 'confirmar'} disabled={!valido} className={`ax-btn ax-btn--primary${tono === 'peligro' ? ' ax-btn--danger' : ''}`} onClick={() => cerrar(true)}>
            <span className="ax-btn__label">{boton}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

'use client';
/*
 * Campanita del encabezado: notificaciones del sistema (GET /notificaciones) con contador, panel con las últimas y
 * avisos flotantes cuando llega una nueva mientras el dashboard está abierto. Consulta cada 30 s.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Dropdown } from '../ui/Dropdown';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Notificacion { id: string; titulo: string; mensaje: string; tipo: string; leida: boolean; createdAt: string }

const CADA_MS = 30_000;
const TOAST_MS = 7_000;
const MAX_TOASTS = 3;

const hace = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.round(min / 60)} h`;
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const BELL = (
  <svg className="ax-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={24} height={24} aria-hidden="true"><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
);

export function NotificationBell() {
  const { activeMarcaId } = useAuth();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [toasts, setToasts] = useState<Notificacion[]>([]);
  const vistas = useRef<Set<string> | null>(null); // null = primera carga (no avisar de lo que ya existía)

  const cargar = useCallback(async () => {
    try {
      const data = await api.get<Notificacion[]>('/notificaciones?limite=30');
      if (!Array.isArray(data)) return;
      setItems(data);
      if (vistas.current) {
        const nuevas = data.filter((n) => !n.leida && !vistas.current!.has(n.id)).slice(0, MAX_TOASTS);
        if (nuevas.length) {
          setToasts((t) => [...nuevas, ...t].slice(0, MAX_TOASTS));
          nuevas.forEach((n) => setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n.id)), TOAST_MS));
        }
      }
      vistas.current = new Set(data.map((n) => n.id));
    } catch { /* sin sesión o sin red: reintenta en el siguiente ciclo */ }
  }, []);

  useEffect(() => {
    if (!activeMarcaId) return;
    cargar();
    const t = setInterval(() => { if (!document.hidden) cargar(); }, CADA_MS);
    return () => clearInterval(t);
  }, [activeMarcaId, cargar]);

  const noLeidas = items.filter((n) => !n.leida).length;
  const marcar = async (id: string) => { setItems((l) => l.map((n) => (n.id === id ? { ...n, leida: true } : n))); try { await api.patch(`/notificaciones/${id}/leida`, {}); } catch { cargar(); } };
  const marcarTodas = async () => { setItems((l) => l.map((n) => ({ ...n, leida: true }))); try { await api.patch('/notificaciones/leidas/todas', {}); } catch { cargar(); } };

  return (
    <>
      <Dropdown
        className="ax-notifications"
        panelClassName="ax-dropdown"
        trigger={({ open, triggerProps }) => (
          <button type="button" className="ax-icon-btn" style={{ position: 'relative' }} aria-label={noLeidas ? `Notificaciones (${noLeidas} sin leer)` : 'Notificaciones'} {...triggerProps} aria-expanded={open}>
            {BELL}
            {noLeidas > 0 && (
              <span aria-hidden="true" style={{ position: 'absolute', top: 2, insetInlineEnd: 0, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: 'var(--ax-danger-500)', color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: '16px', textAlign: 'center' }}>{noLeidas > 9 ? '9+' : noLeidas}</span>
            )}
          </button>
        )}
      >
        {({ close }) => (
          <div style={{ width: 340, maxWidth: '88vw' }}>
            <div className="ax-cluster" style={{ justifyContent: 'space-between', padding: 'var(--ax-space-3)' }}>
              <strong style={{ color: 'var(--ax-text-strong)' }}>Notificaciones</strong>
              {noLeidas > 0 && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={marcarTodas}>Marcar todas</button>}
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {items.length === 0 && <p style={{ padding: 'var(--ax-space-3)', color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>No tienes notificaciones.</p>}
              {items.slice(0, 8).map((n) => (
                <button key={n.id} type="button" role="menuitem" className="ax-dropdown__item" onClick={() => marcar(n.id)} style={{ display: 'block', width: '100%', textAlign: 'start', background: n.leida ? 'none' : 'var(--ax-surface-subtle)', border: 'none', cursor: 'pointer', whiteSpace: 'normal' }}>
                  <div className="ax-cluster" style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'nowrap' }}>
                    <b style={{ fontSize: 'var(--ax-text-sm)' }}>{n.titulo}</b>
                    <small style={{ color: 'var(--ax-text-subtle)', whiteSpace: 'nowrap' }}>{hace(n.createdAt)}</small>
                  </div>
                  <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{n.mensaje}</div>
                </button>
              ))}
            </div>
            <div className="ax-dropdown__divider" role="separator"></div>
            <Link className="ax-dropdown__item" role="menuitem" href="/notificaciones" onClick={close} style={{ textAlign: 'center' }}>Ver todas</Link>
          </div>
        )}
      </Dropdown>

      {toasts.length > 0 && (
        <div className="ax-toast-region ax-toast-region--top-end" role="region" aria-label="Avisos nuevos" style={{ zIndex: 80 }}>
          {toasts.map((n) => (
            <div key={n.id} className="ax-toast" role="status">
              <div className="ax-toast__content">
                <div className="ax-toast__title">{n.titulo}</div>
                <div className="ax-toast__message">{n.mensaje}</div>
                <Link href="/notificaciones" className="ax-toast__action" onClick={() => setToasts((t) => t.filter((x) => x.id !== n.id))}>Ver</Link>
              </div>
              <button type="button" className="ax-toast__dismiss" aria-label="Cerrar aviso" onClick={() => setToasts((t) => t.filter((x) => x.id !== n.id))}>×</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

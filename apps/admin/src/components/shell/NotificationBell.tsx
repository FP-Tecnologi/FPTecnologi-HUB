'use client';
/*
 * Campanita del encabezado: notificaciones del sistema (GET /notificaciones) con contador, panel con las últimas y
 * avisos flotantes cuando llega una nueva mientras el dashboard está abierto. Consulta cada 30 s.
 *
 * El panel usa las clases que shell.css ya define para esta pieza (`.ax-notif__menu/__row/__chip/__body/__title/
 * __text/__time/__dot/__empty/__mark-all`): sin `ax-notif__menu` el panel no recibe `position: absolute` ni la
 * superficie (fondo, borde, sombra, z-index) y se ve encajado en el flujo del header en vez de flotar encima.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Dropdown } from '../ui/Dropdown';
import { Icon } from '../ui/Icon';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Notificacion { id: string; titulo: string; mensaje: string; tipo: string; leida: boolean; createdAt: string }

const CADA_MS = 30_000;
const TOAST_MS = 7_000;
const MAX_TOASTS = 3;
const MAX_EN_PANEL = 8;

const hace = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.round(min / 60)} h`;
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

// Un icono por tipo de notificación (mismos nombres del registro de Icon.tsx).
const ICONO: Record<string, string> = {
  SISTEMA: 'bell',
  PEDIDO: 'shopping-cart',
  COTIZACION: 'article',
  EQUIPO: 'users-group',
  STOCK: 'alert-triangle',
  CHAT: 'messages',
};
// Tono del círculo: lo que requiere acción se destaca.
const TONO: Record<string, string> = {
  PEDIDO: 'ax-notif__chip--success',
  COTIZACION: 'ax-notif__chip--success',
  STOCK: 'ax-notif__chip--warning',
};

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
        className="ax-notif"
        panelClassName="ax-dropdown ax-notif__menu"
        panelRole="dialog"
        panelAriaLabel="Notificaciones"
        trigger={({ open, triggerProps }) => (
          <button
            type="button"
            className="ax-icon-btn ax-notif__trigger"
            aria-label={noLeidas ? `Notificaciones (${noLeidas} sin leer)` : 'Notificaciones'}
            {...triggerProps}
            aria-expanded={open}
          >
            <Icon name="bell" />
            {noLeidas > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', top: 2, insetInlineEnd: 0, minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 8, background: 'var(--ax-danger-500)', color: '#fff', fontSize: 10, fontWeight: 700,
                  lineHeight: '16px', textAlign: 'center',
                }}
              >
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </button>
        )}
      >
        {({ close }) => (
          <>
            <div className="ax-dropdown__head">
              <span>Notificaciones{noLeidas > 0 ? ` (${noLeidas})` : ''}</span>
              {noLeidas > 0 && (
                <button type="button" className="ax-notif__mark-all" onClick={marcarTodas}>Marcar todas</button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="ax-notif__empty">No tienes notificaciones.</p>
            ) : (
              <ul className="ax-notif__list">
                {items.slice(0, MAX_EN_PANEL).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`ax-notif__row${n.leida ? '' : ' is-unread'}`}
                      onClick={() => marcar(n.id)}
                      style={{ inlineSize: '100%', textAlign: 'start', border: 0, cursor: 'pointer' }}
                    >
                      <span className={`ax-notif__chip ${TONO[n.tipo] ?? ''}`}>
                        <Icon name={ICONO[n.tipo] ?? 'bell'} />
                      </span>
                      <span className="ax-notif__body">
                        <span className="ax-notif__title">{n.titulo}</span>
                        <span className="ax-notif__text">{n.mensaje}</span>
                        <span className="ax-notif__time">{hace(n.createdAt)}</span>
                      </span>
                      {!n.leida && <span className="ax-notif__dot" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="ax-dropdown__divider" role="separator"></div>
            <Link className="ax-dropdown__item" href="/notificaciones" onClick={close} style={{ justifyContent: 'center' }}>
              Ver todas
            </Link>
          </>
        )}
      </Dropdown>

      {toasts.length > 0 && (
        <div className="ax-toast-region ax-toast-region--top-end" role="region" aria-label="Avisos nuevos">
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
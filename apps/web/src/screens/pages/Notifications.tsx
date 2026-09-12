'use client';
/*
 * FPTecnologi-HUB · Dashboard — Notificaciones (ruta "pages/notifications").
 *
 * Lista real servida por la API central (GET /notificaciones) con acciones
 * PATCH /notificaciones/:id/leida y PATCH /notificaciones/leidas/todas.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { api } from '../../lib/api';

type Notificacion = {
  id: string;
  marcaId: string | null;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
};

type Filter = 'all' | 'unread';

export function Notifications() {
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const data = await api.get<Notificacion[]>('/notificaciones');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markOne = async (id: string) => {
    setActionError(null);
    setMarkingId(id);
    try {
      await api.patch(`/notificaciones/${id}/leida`, {});
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo marcar la notificación como leída.');
    } finally {
      setMarkingId(null);
    }
  };

  const markAll = async () => {
    setActionError(null);
    setMarkingAll(true);
    try {
      await api.patch('/notificaciones/leidas/todas', {});
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudieron marcar todas como leídas.');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((n) => !n.leida).length;
  const visible = filter === 'unread' ? items.filter((n) => !n.leida) : items;

  const unreadRowStyle: React.CSSProperties = {
    borderInlineStart: '2px solid var(--ax-accent)',
    background: 'var(--ax-accent-wash)',
    paddingInlineStart: 'var(--ax-space-3)',
  };
  const readRowStyle: React.CSSProperties = { paddingInline: 0 };

  return (
    <>
      <PageHead
        title="Notificaciones"
        subtitle="Todo lo que necesita tu atención, en un solo lugar."
        actions={
          <button
            type="button"
            className="ax-btn ax-btn--primary"
            onClick={markAll}
            disabled={unreadCount === 0 || loading || markingAll}
          >
            <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 12l5 5l10 -10" /><path d="M2 12l5 5m5 -5l5 -5" /></svg>
            <span className="ax-btn__label">{markingAll ? 'Marcando…' : 'Marcar todas como leídas'}</span>
          </button>
        }
      />

      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Lista de notificaciones">
          <div className="ax-card__header">
            <div className="ax-card__titles" style={{ flex: '1 1 auto' }}>
              <div className="ax-tabs">
                <div className="ax-tabs__list" role="tablist" aria-label="Filtrar notificaciones">
                  <button type="button" className="ax-tabs__tab" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>
                    Todas<span className="ax-tabs__badge ax-badge ax-badge--soft ax-badge--neutral ax-num">{items.length}</span>
                  </button>
                  <button type="button" className="ax-tabs__tab" role="tab" aria-selected={filter === 'unread'} onClick={() => setFilter('unread')}>
                    No leídas<span className="ax-tabs__badge ax-badge ax-badge--soft ax-badge--accent ax-num">{unreadCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="ax-card__body" style={{ paddingTop: 0 }} aria-live="polite">
            {actionError && (
              <div className="ax-alert ax-alert--error" style={{ marginBottom: 'var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{actionError}</p></div>
              </div>
            )}

            {loading && (
              <p style={{ padding: 'var(--ax-space-5) 0', color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>
                Cargando notificaciones…
              </p>
            )}

            {!loading && error && (
              <div className="ax-alert ax-alert--error" style={{ marginBottom: 'var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div>
                <div className="ax-alert__actions">
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => void load()}>
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && visible.length === 0 && (
              <p style={{ padding: 'var(--ax-space-5) 0', color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>
                {filter === 'unread' ? 'No tienes notificaciones sin leer.' : 'No tienes notificaciones.'}
              </p>
            )}

            {!loading && !error && visible.length > 0 && (
              <ul className="ax-list">
                {visible.map((n) => (
                  <li key={n.id} className="ax-list__row" style={n.leida ? readRowStyle : unreadRowStyle}>
                    <span className="ax-list__content">
                      <span className="ax-list__title">
                        {n.titulo}{' '}
                        <span className={`ax-badge ax-badge--soft ax-badge--pill ${n.leida ? 'ax-badge--neutral' : 'ax-badge--accent'}`}>
                          {n.leida ? 'Leída' : 'No leída'}
                        </span>
                      </span>
                      <span className="ax-list__meta">{n.mensaje}</span>
                    </span>
                    <span className="ax-list__trailing" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ax-space-3)' }}>
                      {!n.leida && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ax-accent)' }} aria-label="No leída" />
                      )}
                      <span className="ax-num" style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {!n.leida && (
                        <button
                          type="button"
                          className="ax-btn ax-btn--ghost ax-btn--sm"
                          onClick={() => void markOne(n.id)}
                          disabled={markingId === n.id}
                        >
                          {markingId === n.id ? 'Marcando…' : 'Marcar como leída'}
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default Notifications;

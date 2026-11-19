'use client';
/*
 * FPTecnologi-HUB — Campañas → Revisión de landings (GET /landings/revision, POST /landings/:id/aprobar|rechazar):
 * el jefe comercial ve las landings que enviaron sus comerciales, las previsualiza y las aprueba (se publican)
 * o las devuelve con un comentario. Al comercial le llega una notificación con la respuesta.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { confirmar } from '../../components/ui/Dialogos';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Pendiente {
  id: string; slug: string; nombre: string; plantilla: string; enviadaRevisionAt: string | null;
  campana: { id: string; nombre: string } | null; creador: { id: string; nombre: string | null; email: string } | null;
}
const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);
const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export function RevisionLandings() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Pendiente[] | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [devolviendo, setDevolviendo] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setLista(await api.get<Pendiente[]>('/landings/revision')); }
    catch (e) { setLista([]); setAviso({ ok: false, texto: errMsg(e, 'No se pudieron cargar las landings por revisar.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function vistaPrevia(p: Pendiente) {
    try { const r = await api.post<{ slug: string; token: string }>(`/landings/${p.id}/vista-previa`); window.open(`${WEB}/l/${r.slug}?preview=${r.token}`, '_blank', 'noopener'); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo abrir la vista previa.') }); }
  }

  async function aprobar(p: Pendiente) {
    if (!await confirmar(`¿Aprobar y publicar “${p.nombre}”? Quedará visible en ${WEB.replace(/^https?:\/\//, '')}/l/${p.slug}`)) return;
    setBusy(p.id); setAviso(null);
    try { await api.post(`/landings/${p.id}/aprobar`); setAviso({ ok: true, texto: `“${p.nombre}” fue aprobada y publicada.` }); await cargar(); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo aprobar.') }); }
    finally { setBusy(null); }
  }

  async function devolver(p: Pendiente) {
    setBusy(p.id); setAviso(null);
    try { await api.post(`/landings/${p.id}/rechazar`, { comentario }); setDevolviendo(null); setComentario(''); setAviso({ ok: true, texto: `“${p.nombre}” volvió al comercial con tu comentario.` }); await cargar(); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo devolver.') }); }
    finally { setBusy(null); }
  }

  return (
    <>
      <PageHead title="Revisión de landings" subtitle="Landing pages que enviaron tus comerciales. Aprueba para publicar o devuelve con comentarios." />
      <div className="ax-dash-grid">
        {aviso && <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div></div>}
        {lista === null && <p className="ax-col--12" style={{ color: 'var(--ax-text-muted)' }}>Cargando…</p>}
        {lista?.length === 0 && <section className="ax-card ax-col--12"><div className="ax-card__body"><p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>No hay landings esperando revisión.</p></div></section>}
        {lista?.map((p) => (
          <section key={p.id} className="ax-card ax-col--12">
            <div className="ax-card__body" style={{ display: 'grid', gap: 'var(--ax-space-3)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ax-space-3)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{p.nombre}</div>
                  <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                    Enviada por {p.creador ? (p.creador.nombre || p.creador.email) : 'un comercial'} · {fecha(p.enviadaRevisionAt)} · /l/{p.slug}{p.campana ? ` · Campaña: ${p.campana.nombre}` : ''}
                  </div>
                </div>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                  <button type="button" className="ax-btn ax-btn--secondary" onClick={() => vistaPrevia(p)}>Vista previa</button>
                  <a className="ax-btn ax-btn--ghost" href={`/campanas/landings?id=${p.id}`}>Abrir en el editor</a>
                  <button type="button" className="ax-btn ax-btn--secondary" disabled={busy === p.id} onClick={() => { setDevolviendo(devolviendo === p.id ? null : p.id); setComentario(''); }}>Devolver</button>
                  <button type="button" className="ax-btn ax-btn--primary" disabled={busy === p.id} onClick={() => aprobar(p)}>Aprobar y publicar</button>
                </div>
              </div>
              {devolviendo === p.id && (
                <div style={{ display: 'grid', gap: 'var(--ax-space-2)' }}>
                  <label htmlFor={`com-${p.id}`} style={{ fontSize: 'var(--ax-text-sm)' }}>¿Qué debe corregir el comercial?</label>
                  <textarea id={`com-${p.id}`} className="ax-textarea" rows={3} maxLength={500} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Ej.: Falta el logo y el precio no coincide con la oferta vigente." />
                  <div><button type="button" className="ax-btn ax-btn--primary" disabled={busy === p.id || comentario.trim().length < 3} onClick={() => devolver(p)}>Enviar comentario y devolver</button></div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

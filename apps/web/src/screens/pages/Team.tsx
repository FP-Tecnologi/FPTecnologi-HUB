'use client';
/*
 * FPTecnologi-HUB — Usuarios y equipo (diseño de la plantilla Vireo,
 * adaptado): directorio con buscador, filtro por marca, vistas grid/lista,
 * modal de invitación y estado vacío. Datos de EJEMPLO hasta la limpieza
 * (luego vendrán de GET /marcas/:marcaId/equipo). Arriba, la tarjeta real
 * de Desbloquear 2FA (POST /usuarios/2fa/reset). Todo en español.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Member { id: number; name: string; role: string; marca: string; init: string; tint: string; status: Status; email: string; }
type Status = 'online' | 'away' | 'busy' | 'offline';

const MEMBERS: Member[] = [
  { id: 1, name: 'Jaime Tarazona', role: 'admin', marca: 'FPTecnologi', init: 'JT', tint: 'var(--ax-accent)', status: 'online', email: 'jaime@fptecnologi.com' },
  { id: 2, name: 'María Fernández', role: 'ventas', marca: 'FPTecnologi', init: 'MF', tint: 'var(--ax-viz-cyan)', status: 'online', email: 'maria.fernandez@fptecnologi.com' },
  { id: 3, name: 'Carlos Quispe', role: 'ventas', marca: 'Fimavperu', init: 'CQ', tint: 'var(--ax-viz-violet)', status: 'away', email: 'carlos.quispe@fimavperu.com' },
  { id: 4, name: 'Lucía Ramos', role: 'marketing', marca: 'Kelqa', init: 'LR', tint: 'var(--ax-viz-amber)', status: 'online', email: 'lucia.ramos@kelqa.com' },
  { id: 5, name: 'Diego Huamán', role: 'soporte', marca: 'Imaninki', init: 'DH', tint: 'var(--ax-viz-emerald)', status: 'busy', email: 'diego.huaman@imaninki.com' },
  { id: 6, name: 'Sofía Mendoza', role: 'comercial', marca: 'Quamtu', init: 'SM', tint: 'var(--ax-viz-pink)', status: 'offline', email: 'sofia.mendoza@quamtu.com' },
  { id: 7, name: 'Pedro Castillo', role: 'logistica', marca: 'FPTecnologi', init: 'PC', tint: 'var(--ax-viz-cyan)', status: 'online', email: 'pedro.castillo@fptecnologi.com' },
  { id: 8, name: 'Ana Torres', role: 'finanzas', marca: 'FPTecnologi', init: 'AT', tint: 'var(--ax-viz-violet)', status: 'away', email: 'ana.torres@fptecnologi.com' },
  { id: 9, name: 'Luis Vargas', role: 'asesores', marca: 'Kelqa', init: 'LV', tint: 'var(--ax-viz-amber)', status: 'online', email: 'luis.vargas@kelqa.com' },
  { id: 10, name: 'Carmen Flores', role: 'soporte', marca: 'Fimavperu', init: 'CF', tint: 'var(--ax-viz-emerald)', status: 'offline', email: 'carmen.flores@fimavperu.com' },
];

const MARCAS = ['FPTecnologi', 'Fimavperu', 'Kelqa', 'Imaninki', 'Quamtu'];
const ROLES_INVITE = ['admin', 'ventas', 'marketing', 'comercial', 'soporte', 'logistica', 'finanzas', 'asesores'];

const statusColor: Record<Status, string> = { online: 'var(--ax-viz-emerald)', away: 'var(--ax-viz-amber)', busy: 'var(--ax-viz-red)', offline: 'var(--ax-text-subtle)' };
const statusLabel: Record<Status, string> = { online: 'En línea', away: 'Ausente', busy: 'Ocupado', offline: 'Desconectado' };

const ICON_DOTS = (
  <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
);
const ICON_MSG = (
  <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" /></svg>
);

export function Team() {
  const { marcas, activeMarcaId } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [marca, setMarca] = useState('all');
  const [q, setQ] = useState('');
  const [invite, setInvite] = useState(false);
  const [sent, setSent] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, invite);

  // Escape cierra el diálogo de invitación.
  useEffect(() => {
    if (!invite) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInvite(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [invite]);

  const filtered = useMemo(
    () => MEMBERS.filter((m) => (marca === 'all' || m.marca === marca) && (q === '' || (m.name + m.role + m.marca).toLowerCase().includes(q.toLowerCase()))),
    [marca, q],
  );

  const openInvite = () => { setInvite(true); setSent(false); };

  // --- Desbloquear 2FA (real: POST /usuarios/2fa/reset, solo admin) ---
  const [resetEmail, setResetEmail] = useState('');
  const [resetMarcaId, setResetMarcaId] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOk, setResetOk] = useState('');
  const [resetErr, setResetErr] = useState('');
  const resetMarca = resetMarcaId ?? activeMarcaId ?? marcas[0]?.marcaId ?? null;

  async function reset2fa(ev: React.FormEvent) {
    ev.preventDefault();
    if (!resetEmail.trim() || !resetMarca || resetLoading) return;
    setResetOk('');
    setResetErr('');
    setResetLoading(true);
    try {
      const result = await api.post<{ reset: boolean; email: string }>(
        '/usuarios/2fa/reset',
        { email: resetEmail.trim() },
        { marcaId: resetMarca },
      );
      setResetOk(`2FA restablecido para ${result.email}. Ya puede entrar con contraseña + código al correo.`);
      setResetEmail('');
    } catch (err: unknown) {
      setResetErr(err instanceof ApiError ? err.message : 'No se pudo restablecer el 2FA.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <>
      <PageHead
        title="Usuarios y equipo"
        subtitle={`${MEMBERS.length} miembros de ejemplo en ${MARCAS.length} marcas.`}
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={openInvite}>
            <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /></svg>
            <span className="ax-btn__label">Invitar miembro</span>
          </button>
        }
      />

      <div className="ax-dash-grid">
        {/* Desbloquear 2FA */}
        <section className="ax-card ax-col--12" role="region" aria-label="Desbloquear 2FA">
          <div className="ax-card__body">
            <h2 className="ax-card__title" style={{ marginBottom: 'var(--ax-space-1)' }}>Desbloquear 2FA</h2>
            <p style={{ margin: '0 0 var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
              Si un usuario perdió su app o sus códigos, restablece su segundo factor: apaga su TOTP, borra sus códigos de respaldo y cierra sus sesiones. Luego entra con contraseña + código al correo.
            </p>
            {resetOk && (
              <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{resetOk}</p></div>
              </div>
            )}
            {resetErr && (
              <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{resetErr}</p></div>
              </div>
            )}
            <form onSubmit={reset2fa} noValidate style={{ display: 'flex', gap: 'var(--ax-space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="ax-field" style={{ minInlineSize: 240, flex: '1 1 auto' }}>
                <label className="ax-label" htmlFor="reset-email">Correo del usuario bloqueado</label>
                <input id="reset-email" type="email" className="ax-input" placeholder="usuario@correo.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
              </div>
              <div className="ax-field" style={{ minInlineSize: 180 }}>
                <label className="ax-label" htmlFor="reset-marca">Marca</label>
                <select id="reset-marca" className="ax-select" value={resetMarca ?? ''} onChange={(e) => setResetMarcaId(e.target.value || null)}>
                  {marcas.map((m) => (
                    <option key={m.marcaId} value={m.marcaId}>{m.marca.nombre}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className={`ax-btn ax-btn--secondary${resetLoading ? ' is-loading' : ''}`} disabled={!resetEmail.trim() || !resetMarca || resetLoading} aria-busy={resetLoading}>
                <span className="ax-btn__spinner" aria-hidden="true"></span>
                <span className="ax-btn__label">{resetLoading ? 'Restableciendo…' : 'Restablecer 2FA'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Toolbar */}
        <section className="ax-card ax-col--12" role="region" aria-label="Filtros del equipo">
          <div className="ax-card__body">
            <p style={{ margin: '0 0 var(--ax-space-3)', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
              Datos de ejemplo — se reemplazarán por el equipo real.
            </p>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', flex: '1 1 auto' }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180, maxWidth: 320 }}>
                  <svg style={{ position: 'absolute', left: 'var(--ax-space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--ax-text-subtle)' }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10a7 7 0 1 0 14 0a7 7 0 0 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                  <input type="search" className="ax-input" placeholder="Buscar miembros…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar miembros" style={{ paddingInlineStart: 'var(--ax-space-8)' }} />
                </div>
                <select className="ax-select" aria-label="Filtrar por marca" value={marca} onChange={(e) => setMarca(e.target.value)} style={{ maxWidth: 180 }}>
                  <option value="all">Todas las marcas</option>
                  {MARCAS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                <span className="ax-num" style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }} aria-live="polite"><span>{filtered.length}</span> mostrados</span>
                <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Modo de vista">
                  <button type="button" className={`ax-btn ax-btn--sm ax-btn--icon${view === 'grid' ? ' is-selected' : ''}`} role="radio" aria-checked={view === 'grid'} onClick={() => setView('grid')} aria-label="Vista en cuadrícula"><svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h6v6h-6z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6h-6z" /><path d="M14 14h6v6h-6z" /></svg></button>
                  <button type="button" className={`ax-btn ax-btn--sm ax-btn--icon${view === 'list' ? ' is-selected' : ''}`} role="radio" aria-checked={view === 'list'} onClick={() => setView('list')} aria-label="Vista en lista"><svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRID VIEW */}
        {view === 'grid' && (
          <div className="ax-col--12">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--ax-space-5)' }}>
              {filtered.map((m) => (
                <article key={m.id} className="ax-card ax-card--interactive" role="region" aria-label={m.name}>
                  <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                    <div className="ax-cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="ax-avatar ax-avatar--lg" style={{ background: `color-mix(in oklab,${m.tint} 16%,transparent)`, color: m.tint }}>
                        <span className="ax-avatar__initials">{m.init}</span>
                        <span className="ax-avatar__status" style={{ background: statusColor[m.status] }} aria-label={statusLabel[m.status]} />
                      </span>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" aria-label="Opciones del miembro">{ICON_DOTS}</button>
                    </div>
                    <div>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}><span style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{m.name}</span></div>
                      <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)', textTransform: 'capitalize' }}>{m.role} · {m.marca}</div>
                      <div className="ax-cluster" style={{ gap: 6, marginTop: 6, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor[m.status] }} /><span>{statusLabel[m.status]}</span></div>
                    </div>
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginTop: 'var(--ax-space-1)' }}>
                      <a className="ax-btn ax-btn--secondary ax-btn--sm ax-btn--block" href={`mailto:${m.email}`} aria-label={`Escribir a ${m.name}`}>{ICON_MSG}<span className="ax-btn__label">Mensaje</span></a>
                      <a className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" href={`mailto:${m.email}`} aria-label={`Correo de ${m.name}`}><svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" /><path d="M3 7l9 6l9 -6" /></svg></a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="ax-card" style={{ marginTop: 'var(--ax-space-5)' }}>
                <div className="ax-card__body" style={{ textAlign: 'center', paddingBlock: 'var(--ax-space-8)' }}>
                  <span className="ax-avatar ax-avatar--lg" style={{ background: 'var(--ax-surface-subtle)', color: 'var(--ax-text-subtle)', marginInline: 'auto' }}><svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></span>
                  <p style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)', marginTop: 'var(--ax-space-3)' }}>Ningún miembro coincide con los filtros</p>
                  <p style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)', marginTop: 4 }}>Prueba con otra búsqueda u otra marca.</p>
                  <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" style={{ marginTop: 'var(--ax-space-3)' }} onClick={() => { setQ(''); setMarca('all'); }}>Limpiar filtros</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <section className="ax-card ax-col--12" role="region" aria-label="Lista de miembros">
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head">
                  <tr>
                    <th className="ax-table__th" scope="col">Miembro</th>
                    <th className="ax-table__th" scope="col">Rol</th>
                    <th className="ax-table__th" scope="col">Marca</th>
                    <th className="ax-table__th" scope="col">Estado</th>
                    <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="ax-table__row">
                      <td className="ax-table__td">
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                          <span className="ax-avatar ax-avatar--sm" style={{ background: `color-mix(in oklab,${m.tint} 16%,transparent)`, color: m.tint }}><span className="ax-avatar__initials">{m.init}</span></span>
                          <div><div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{m.name}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{m.email}</div></div>
                        </div>
                      </td>
                      <td className="ax-table__td"><span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{m.role}</span></td>
                      <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)', textTransform: 'capitalize' }}>{m.marca}</td>
                      <td className="ax-table__td"><span className="ax-cluster" style={{ gap: 6, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[m.status] }} /><span>{statusLabel[m.status]}</span></span></td>
                      <td className="ax-table__td" style={{ textAlign: 'right' }}>
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                          <a className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" href={`mailto:${m.email}`} aria-label={`Escribir a ${m.name}`}>{ICON_MSG}</a>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" aria-label={`Opciones de ${m.name}`}>{ICON_DOTS}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* INVITE MODAL */}
      {invite && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setInvite(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="inv-title" className="ax-card" style={{ position: 'relative', maxWidth: 460, width: '100%' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title" id="inv-title">Invitar miembro</h2><p className="ax-card__subtitle">Por ahora la invitación es demostrativa (llega la creación real con la limpieza de datos).</p></div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={() => setInvite(false)} aria-label="Cerrar diálogo"><svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg></button>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              {sent && (
                <div className="ax-alert ax-alert--success">
                  <span className="ax-alert__icon"><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10" /></svg></span>
                  <div className="ax-alert__content"><p className="ax-alert__message">Invitación preparada. Se enviará cuando se active la creación real.</p></div>
                </div>
              )}
              <div className="ax-field"><label className="ax-label" htmlFor="inv-email">Correo electrónico</label><input id="inv-email" type="email" className="ax-input" placeholder="nombre@empresa.com" required /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="inv-role">Rol</label><select id="inv-role" className="ax-select">{ROLES_INVITE.map((r) => (<option key={r}>{r}</option>))}</select></div>
              <div className="ax-field"><label className="ax-label" htmlFor="inv-marca">Marca</label><select id="inv-marca" className="ax-select">{MARCAS.map((d) => (<option key={d}>{d}</option>))}</select></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end', marginTop: 'var(--ax-space-2)' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setInvite(false)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary">Enviar invitación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Team;

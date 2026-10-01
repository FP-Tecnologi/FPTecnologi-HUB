'use client';
/*
 * FPTecnologi-HUB — Usuarios y equipo (datos reales de la API, marca activa):
 * miembros (cambiar rol, activar/desactivar, quitar, restablecer 2FA),
 * invitaciones por correo (enviar, reenviar, revocar) y clientes de las webs.
 * Solo admin (ver nav-manifest). Diseño de la plantilla Vireo.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Rol { id: string; nombre: string }
interface Usuario { id: string; email: string; nombre: string | null; activo: boolean; telefono: string | null; cargo: string | null; totpEnabled: boolean; createdAt: string }
interface Fila { usuarioId: string; rolId: string; usuario: Usuario; rol: Rol; createdAt: string }
interface Invitacion { id: string; email: string; expiresAt: string; rol: Rol; invitadoPor?: string | null }
interface AsesorChat { id: string; usuarioId: string | null; area: string; telefono: string; whatsapp: string; activo: boolean }
type Tab = 'equipo' | 'invitaciones' | 'clientes';

const errMsg = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

export function Team() {
  const { activeMarcaId, marcas, user } = useAuth();
  const marcaNombre = marcas.find((m) => m.marcaId === activeMarcaId)?.marca.nombre ?? 'la marca';
  const [tab, setTab] = useState<Tab>('equipo');
  const [q, setQ] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [equipo, setEquipo] = useState<Fila[]>([]);
  const [clientes, setClientes] = useState<Fila[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [asesores, setAsesores] = useState<AsesorChat[]>([]);
  const [asesorDe, setAsesorDe] = useState<Usuario | null>(null);
  const [asesorForm, setAsesorForm] = useState({ area: 'Ventas', telefono: '', whatsapp: '51' });
  const [asesorErr, setAsesorErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    setLoading(true);
    try {
      const [r, e, c, i, a] = await Promise.all([
        api.get<Rol[]>('/roles'),
        api.get<Fila[]>(`/marcas/${activeMarcaId}/equipo`),
        api.get<Fila[]>('/roles/clientes'),
        api.get<Invitacion[]>('/invitaciones'),
        api.get<AsesorChat[]>('/chat/asesores').catch(() => [] as AsesorChat[]),
      ]);
      setRoles(r); setEquipo(e); setClientes(c); setInvitaciones(i); setAsesores(a);
    } catch (err) {
      setAviso({ ok: false, texto: errMsg(err, 'No se pudo cargar el equipo.') });
    } finally {
      setLoading(false);
    }
  }, [activeMarcaId]);

  useEffect(() => { void cargar(); }, [cargar]);

  async function accion(fn: () => Promise<unknown>, okTexto: string) {
    setAviso(null);
    try {
      await fn();
      setAviso({ ok: true, texto: okTexto });
      await cargar();
    } catch (err) {
      setAviso({ ok: false, texto: errMsg(err, 'No se pudo completar la acción.') });
    }
  }

  const rolesEquipo = roles.filter((r) => r.nombre !== 'cliente');
  const filtrar = (filas: Fila[]) =>
    filas.filter((f) => !q || (f.usuario.email + (f.usuario.nombre ?? '') + f.rol.nombre).toLowerCase().includes(q.toLowerCase()));
  const filasEquipo = useMemo(() => filtrar(equipo), [equipo, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const filasClientes = useMemo(() => filtrar(clientes), [clientes, q]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Invitar ---
  const [invite, setInvite] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invRol, setInvRol] = useState('');
  const [invBusy, setInvBusy] = useState(false);
  const [invErr, setInvErr] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, invite);
  useEffect(() => {
    if (!invite) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInvite(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [invite]);

  async function enviarInvitacion(ev: React.FormEvent) {
    ev.preventDefault();
    const rolId = invRol || rolesEquipo[0]?.id;
    if (!invEmail.trim() || !rolId || invBusy) return;
    setInvBusy(true); setInvErr('');
    try {
      await api.post('/invitaciones', { email: invEmail.trim(), rolId });
      setInvite(false); setInvEmail('');
      setAviso({ ok: true, texto: 'Invitación enviada por correo.' });
      setTab('invitaciones');
      await cargar();
    } catch (err) {
      setInvErr(errMsg(err, 'No se pudo enviar la invitación.'));
    } finally {
      setInvBusy(false);
    }
  }

  const asesorDeUsuario = (id: string) => asesores.find((a) => a.usuarioId === id);

  function abrirAsesor(u: Usuario) {
    const a = asesorDeUsuario(u.id);
    setAsesorErr('');
    setAsesorDe(u);
    setAsesorForm(a ? { area: a.area, telefono: a.telefono, whatsapp: a.whatsapp } : { area: 'Ventas', telefono: u.telefono ?? '', whatsapp: (u.telefono ?? '').replace(/\D/g, '') || '51' });
  }

  async function guardarAsesor(ev: React.FormEvent) {
    ev.preventDefault();
    if (!asesorDe) return;
    const actual = asesorDeUsuario(asesorDe.id);
    const body = { area: asesorForm.area.trim(), telefono: asesorForm.telefono.trim(), whatsapp: asesorForm.whatsapp.replace(/\D/g, '') };
    try {
      if (actual) await api.patch(`/chat/asesores/${actual.id}`, body);
      else await api.post('/chat/asesores', { ...body, nombre: asesorDe.nombre || asesorDe.email, usuarioId: asesorDe.id });
      setAsesorDe(null);
      setAviso({ ok: true, texto: actual ? 'Perfil de asesor actualizado.' : `${asesorDe.nombre || asesorDe.email} ya aparece como asesor en el chat de la web.` });
      await cargar();
    } catch (err) {
      setAsesorErr(errMsg(err, 'No se pudo guardar el perfil de asesor.'));
    }
  }

  const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  const iniciales = (u: Usuario) => (u.nombre || u.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('');

  const tabs: Array<[Tab, string, number]> = [
    ['equipo', 'Equipo', equipo.length],
    ['invitaciones', 'Invitaciones', invitaciones.length],
    ['clientes', 'Clientes de las webs', clientes.length],
  ];

  function tablaMiembros(filas: Fila[], esEquipo: boolean) {
    if (!filas.length) {
      return <div className="ax-card__body" style={{ textAlign: 'center', paddingBlock: 'var(--ax-space-8)', color: 'var(--ax-text-muted)' }}>{loading ? 'Cargando…' : 'Nada para mostrar.'}</div>;
    }
    return (
      <div className="ax-table-wrap">
        <table className="ax-table ax-table--hover">
          <thead className="ax-table__head">
            <tr>
              <th className="ax-table__th" scope="col">Usuario</th>
              <th className="ax-table__th" scope="col">Rol</th>
              <th className="ax-table__th" scope="col">Estado</th>
              {esEquipo && <th className="ax-table__th" scope="col">2FA</th>}
              <th className="ax-table__th" scope="col">Desde</th>
              <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const u = f.usuario;
              const yo = u.id === user?.id;
              return (
                <tr key={`${u.id}-${f.rolId}`} className="ax-table__row">
                  <td className="ax-table__td">
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                      <span className="ax-avatar ax-avatar--sm" style={{ background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}><span className="ax-avatar__initials">{iniciales(u)}</span></span>
                      <div>
                        <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{u.nombre || u.email}{yo && ' (tú)'}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ax-table__td">
                    {esEquipo && !yo ? (
                      <select className="ax-select" aria-label={`Rol de ${u.email}`} value={f.rolId} style={{ maxWidth: 160 }}
                        onChange={(e) => accion(() => api.patch(`/roles/equipo/${u.id}`, { rolId: e.target.value }), 'Rol actualizado.')}>
                        {rolesEquipo.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                    ) : (
                      <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{f.rol.nombre}</span>
                    )}
                    {esEquipo && asesorDeUsuario(u.id) && <div style={{ marginBlockStart: 4 }}><span className="ax-badge ax-badge--soft ax-badge--success ax-badge--pill">Asesor de chat · {asesorDeUsuario(u.id)!.area}</span></div>}
                  </td>
                  <td className="ax-table__td">
                    <span className={`ax-badge ax-badge--soft ax-badge--pill ${u.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{u.activo ? 'Activo' : 'Desactivado'}</span>
                  </td>
                  {esEquipo && <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{u.totpEnabled ? 'App' : 'Correo'}</td>}
                  <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{fecha(f.createdAt)}</td>
                  <td className="ax-table__td" style={{ textAlign: 'right' }}>
                    {esEquipo && (
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrirAsesor(u)}>
                        {asesorDeUsuario(u.id) ? 'Perfil de asesor' : 'Hacer asesor del chat'}
                      </button>
                    )}
                    {!yo && (
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                        {esEquipo && u.totpEnabled && (
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm"
                            onClick={() => window.confirm(`¿Restablecer el 2FA de ${u.email}?`) && accion(() => api.post('/usuarios/2fa/reset', { email: u.email }), `2FA restablecido para ${u.email}.`)}>
                            Restablecer 2FA
                          </button>
                        )}
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm"
                          onClick={() => accion(() => api.patch(`/roles/equipo/${u.id}`, { activo: !u.activo }), u.activo ? 'Cuenta desactivada.' : 'Cuenta activada.')}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }}
                          onClick={() => window.confirm(`¿Quitar a ${u.email} de ${marcaNombre}?`) && accion(() => api.delete(`/roles/equipo/${u.id}`), 'Quitado de la marca.')}>
                          Quitar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title="Usuarios y equipo"
        subtitle={`Gestión de accesos de ${marcaNombre}: equipo, invitaciones y clientes de sus webs.`}
        actions={
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => { setInvite(true); setInvErr(''); }}>
            <span className="ax-btn__label">Invitar miembro</span>
          </button>
        }
      />

      <div className="ax-dash-grid">
        {aviso && (
          <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
            <div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div>
          </div>
        )}

        <section className="ax-card ax-col--12" role="region" aria-label="Filtros">
          <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Sección">
              {tabs.map(([id, label, n]) => (
                <button key={id} type="button" role="radio" aria-checked={tab === id} className={`ax-btn ax-btn--sm${tab === id ? ' is-selected' : ''}`} onClick={() => setTab(id)}>
                  {label} ({n})
                </button>
              ))}
            </div>
            {tab !== 'invitaciones' && (
              <input type="search" className="ax-input" placeholder="Buscar…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} />
            )}
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label={tabs.find(([id]) => id === tab)?.[1]}>
          {tab === 'equipo' && tablaMiembros(filasEquipo, true)}
          {tab === 'clientes' && tablaMiembros(filasClientes, false)}
          {tab === 'invitaciones' && (
            invitaciones.length === 0 ? (
              <div className="ax-card__body" style={{ textAlign: 'center', paddingBlock: 'var(--ax-space-8)', color: 'var(--ax-text-muted)' }}>No hay invitaciones pendientes.</div>
            ) : (
              <div className="ax-table-wrap">
                <table className="ax-table ax-table--hover">
                  <thead className="ax-table__head">
                    <tr>
                      <th className="ax-table__th" scope="col">Correo</th>
                      <th className="ax-table__th" scope="col">Rol</th>
                      <th className="ax-table__th" scope="col">Vence</th>
                      <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitaciones.map((i) => {
                      const vencida = new Date(i.expiresAt) < new Date();
                      return (
                        <tr key={i.id} className="ax-table__row">
                          <td className="ax-table__td">{i.email}{i.invitadoPor && <div style={{ fontSize: "var(--ax-text-xs)", color: "var(--ax-text-subtle)" }}>Invitó: {i.invitadoPor}</div>}</td>
                          <td className="ax-table__td"><span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{i.rol.nombre}</span></td>
                          <td className="ax-table__td" style={{ color: vencida ? 'var(--ax-danger-500)' : 'var(--ax-text-muted)' }}>{vencida ? 'Vencida' : fecha(i.expiresAt)}</td>
                          <td className="ax-table__td" style={{ textAlign: 'right' }}>
                            <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.post(`/invitaciones/${i.id}/reenviar`), 'Invitación reenviada.')}>Reenviar</button>
                              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => accion(() => api.delete(`/invitaciones/${i.id}`), 'Invitación revocada.')}>Revocar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </div>

      {asesorDe && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setAsesorDe(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div role="dialog" aria-modal="true" aria-labelledby="as-title" className="ax-card" style={{ position: 'relative', maxWidth: 460, width: '100%' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title" id="as-title">Asesor del chat · {asesorDe.nombre || asesorDe.email}</h2><p className="ax-card__subtitle">Aparece en «Habla con un asesor» de la web de {marcaNombre}.</p></div>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={guardarAsesor}>
              {asesorErr && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{asesorErr}</p></div></div>}
              <div className="ax-field"><label className="ax-label" htmlFor="as-area">Área</label><input id="as-area" className="ax-input" list="as-areas" required maxLength={40} value={asesorForm.area} onChange={(e) => setAsesorForm({ ...asesorForm, area: e.target.value })} /><datalist id="as-areas">{['Ventas', 'Servicios', 'Tienda', 'Partners', 'Soporte'].map((a) => <option key={a} value={a} />)}</datalist></div>
              <div className="ax-field"><label className="ax-label" htmlFor="as-tel">Teléfono que se muestra</label><input id="as-tel" className="ax-input" required maxLength={30} placeholder="999 999 999" value={asesorForm.telefono} onChange={(e) => setAsesorForm({ ...asesorForm, telefono: e.target.value })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="as-wa">WhatsApp (con código de país)</label><input id="as-wa" className="ax-input" inputMode="numeric" required placeholder="51999999999" value={asesorForm.whatsapp} onChange={(e) => setAsesorForm({ ...asesorForm, whatsapp: e.target.value })} /></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'space-between' }}>
                <span>{asesorDeUsuario(asesorDe.id) && <button type="button" className="ax-btn ax-btn--ghost" style={{ color: 'var(--ax-danger-500)' }} onClick={() => { const a = asesorDeUsuario(asesorDe.id)!; setAsesorDe(null); void accion(() => api.delete(`/chat/asesores/${a.id}`), 'Ya no es asesor del chat.'); }}>Quitar de asesores</button>}</span>
                <span className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                  <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setAsesorDe(null)}>Cancelar</button>
                  <button type="submit" className="ax-btn ax-btn--primary">Guardar</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {invite && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setInvite(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="inv-title" className="ax-card" style={{ position: 'relative', maxWidth: 460, width: '100%' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title" id="inv-title">Invitar miembro</h2><p className="ax-card__subtitle">Recibirá un enlace por correo (vence en 7 días) para crear su acceso a {marcaNombre}.</p></div>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={enviarInvitacion}>
              {invErr && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{invErr}</p></div></div>}
              <div className="ax-field"><label className="ax-label" htmlFor="inv-email">Correo electrónico</label><input id="inv-email" type="email" className="ax-input" placeholder="nombre@empresa.com" required value={invEmail} onChange={(e) => setInvEmail(e.target.value)} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="inv-role">Rol</label>
                <select id="inv-role" className="ax-select" value={invRol || rolesEquipo[0]?.id || ''} onChange={(e) => setInvRol(e.target.value)}>
                  {rolesEquipo.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setInvite(false)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={invBusy || !invEmail.trim()}>{invBusy ? 'Enviando…' : 'Enviar invitación'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Team;

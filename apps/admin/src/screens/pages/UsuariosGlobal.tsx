'use client';
/*
 * FPTecnologi-HUB — Todos los usuarios (Administración, solo super admin = admin de todas las marcas).
 * GET /usuarios/global: cuentas de todas las marcas con sus roles por marca; activar/desactivar la cuenta,
 * agregar o quitar un rol en una marca. La gestión fina de una marca (invitaciones, 2FA) sigue en «Usuarios y equipo».
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Asig { marcaId: string; rolId: string; marca: { nombre: string }; rol: { nombre: string } }
interface Usuario { id: string; email: string; nombre: string | null; cargo: string | null; activo: boolean; totpEnabled: boolean; superAdmin: boolean; createdAt: string; marcas: Asig[] }
interface Respuesta { usuarios: Usuario[]; marcas: { id: string; nombre: string }[]; roles: { id: string; nombre: string }[] }

const msg = (e: unknown, d: string) => (e instanceof ApiError ? e.message : d);

export function UsuariosGlobal() {
  const { user } = useAuth();
  const [data, setData] = useState<Respuesta | null>(null);
  const [q, setQ] = useState('');
  const [marcaF, setMarcaF] = useState('');
  const [rolF, setRolF] = useState('');
  const [error, setError] = useState('');
  const [agregando, setAgregando] = useState<string | null>(null);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoRol, setNuevoRol] = useState('');

  const cargar = useCallback(async () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (marcaF) p.set('marcaId', marcaF);
    if (rolF) p.set('rolId', rolF);
    try { setData(await api.get<Respuesta>(`/usuarios/global?${p}`)); setError(''); }
    catch (e) { setError(msg(e, 'No se pudieron cargar los usuarios.')); }
  }, [q, marcaF, rolF]);

  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);

  async function accion(fn: () => Promise<unknown>, d: string) {
    try { await fn(); setError(''); await cargar(); } catch (e) { setError(msg(e, d)); }
  }

  // Crear usuario: invitación por correo con empresa (marca) y rol; la persona solo verá esa marca.
  const [crear, setCrear] = useState(false);
  const [cEmail, setCEmail] = useState('');
  const [cMarca, setCMarca] = useState('');
  const [cRol, setCRol] = useState('');
  const [cBusy, setCBusy] = useState(false);
  const [cErr, setCErr] = useState('');
  const [ok, setOk] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, crear);
  useEffect(() => {
    if (!crear) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCrear(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [crear]);

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!cEmail.trim() || !cMarca || !cRol || cBusy) return;
    setCBusy(true); setCErr('');
    try {
      await api.post('/invitaciones', { email: cEmail.trim(), rolId: cRol }, { marcaId: cMarca });
      setCrear(false); setCEmail('');
      setOk('Invitación enviada por correo.');
      await cargar();
    } catch (e) { setCErr(msg(e, 'No se pudo enviar la invitación.')); }
    finally { setCBusy(false); }
  }

  // Seguridad de la cuenta: correo de restablecimiento, contraseña nueva, 2FA y sesiones.
  const [pwU, setPwU] = useState<Usuario | null>(null);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  async function seguridad(fn: () => Promise<unknown>, okTexto: string, d: string) {
    try { await fn(); setError(''); setOk(okTexto); await cargar(); } catch (e) { setOk(''); setError(msg(e, d)); }
  }
  async function guardarPw(ev: React.FormEvent) {
    ev.preventDefault();
    if (!pwU) return;
    try {
      await api.post(`/usuarios/global/${pwU.id}/password`, { password: pw });
      setOk(`Contraseña de ${pwU.email} cambiada; sus sesiones se cerraron.`); setPwU(null); setPw(''); setPwErr('');
    } catch (e) { setPwErr(msg(e, 'No se pudo cambiar la contraseña.')); }
  }
  const cerrarMenu = (el: HTMLElement) => el.closest('details')?.removeAttribute('open');

  return (
    <>
      <PageHead
        title="Todos los usuarios"
        subtitle="Cuentas de todas las marcas y sus roles. Solo el super administrador (admin de todas las marcas)."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => { setCrear(true); setCErr(''); setOk(''); }}><span className="ax-btn__label">Crear usuario</span></button>}
      />
      {ok && (
        <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message">{ok}</p></div>
        </div>
      )}
      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <input type="search" className="ax-input" style={{ width: 240 }} placeholder="Buscar por nombre o correo" aria-label="Buscar usuario" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="ax-select" style={{ width: "auto" }} aria-label="Filtrar por marca" value={marcaF} onChange={(e) => setMarcaF(e.target.value)}>
            <option value="">Todas las empresas</option>
            {data?.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <select className="ax-select" style={{ width: "auto" }} aria-label="Filtrar por rol" value={rolF} onChange={(e) => setRolF(e.target.value)}>
            <option value="">Todos los roles</option>
            {data?.roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>

        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head"><tr>
              <th className="ax-table__th" scope="col">Usuario</th>
              <th className="ax-table__th" scope="col">Marcas y roles</th>
              <th className="ax-table__th" scope="col">2FA</th>
              <th className="ax-table__th" scope="col">Activo</th>
              <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Seguridad</th>
            </tr></thead>
            <tbody>
              {!data && <tr><td className="ax-table__td" colSpan={5}>{error ? 'No se pudo cargar. Vuelve a iniciar sesión o recarga.' : 'Cargando…'}</td></tr>}
              {data?.usuarios.length === 0 && <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>Sin resultados.</td></tr>}
              {data?.usuarios.map((u) => (
                <tr key={u.id} className="ax-table__row">
                  <td className="ax-table__td">
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                      <span className="ax-avatar ax-avatar--sm" style={{ background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' }}><span className="ax-avatar__initials">{(u.nombre || u.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0]!.toUpperCase()).join('')}</span></span>
                      <div>
                        <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{u.nombre || u.email}{u.id === user?.id ? ' (tú)' : ''}{u.superAdmin && <span className="ax-badge ax-badge--soft ax-badge--accent ax-badge--pill" style={{ marginInlineStart: 8 }}>Super admin</span>}</div>
                        <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{u.email}{u.cargo ? ` · ${u.cargo}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ax-table__td">
                    <div className="ax-cluster" style={{ gap: 4, flexWrap: 'wrap' }}>
                      {u.marcas.map((a) => (
                        <span key={`${a.marcaId}${a.rolId}`} className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">
                          {a.marca.nombre} · {a.rol.nombre}
                          <button type="button" aria-label={`Quitar ${a.rol.nombre} en ${a.marca.nombre}`} style={{ marginInlineStart: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                            onClick={() => window.confirm(`¿Quitar el rol ${a.rol.nombre} de ${u.email} en ${a.marca.nombre}?`) && accion(() => api.delete(`/usuarios/global/${u.id}/asignaciones/${a.marcaId}/${a.rolId}`), 'No se pudo quitar el rol.')}>×</button>
                        </span>
                      ))}
                      {agregando === u.id ? (
                        <span className="ax-cluster" style={{ gap: 4 }}>
                          <select className="ax-select ax-select--sm" aria-label="Marca" value={nuevaMarca} onChange={(e) => setNuevaMarca(e.target.value)}><option value="">Marca…</option>{data.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
                          <select className="ax-select ax-select--sm" aria-label="Rol" value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)}><option value="">Rol…</option>{data.roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select>
                          <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" disabled={!nuevaMarca || !nuevoRol}
                            onClick={() => accion(async () => { await api.post(`/usuarios/global/${u.id}/asignaciones`, { marcaId: nuevaMarca, rolId: nuevoRol }); setAgregando(null); }, 'No se pudo asignar el rol.')}>Agregar</button>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setAgregando(null)}>Cancelar</button>
                        </span>
                      ) : (
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => { setAgregando(u.id); setNuevaMarca(''); setNuevoRol(''); }}>+ Rol</button>
                      )}
                    </div>
                  </td>
                  <td className="ax-table__td">{u.totpEnabled ? 'Sí' : 'No'}</td>
                  <td className="ax-table__td">
                    <input type="checkbox" className="ax-switch" checked={u.activo} disabled={u.id === user?.id} aria-label={`Cuenta activa de ${u.email}`} onChange={() => accion(() => api.patch(`/usuarios/global/${u.id}/activo`, { activo: !u.activo }), 'No se pudo actualizar.')} />
                  </td>
                  <td className="ax-table__td" style={{ textAlign: 'right' }}>
                    <details style={{ position: 'relative', display: 'inline-block' }}>
                      <summary className="ax-btn ax-btn--ghost ax-btn--sm" style={{ listStyle: 'none', cursor: 'pointer' }}>Acciones ▾</summary>
                      <div className="ax-card" style={{ position: 'absolute', right: 0, zIndex: 20, minWidth: 230, padding: 'var(--ax-space-1)', textAlign: 'left' }}>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm ax-btn--block" style={{ justifyContent: 'flex-start' }} disabled={u.id === user?.id && u.superAdmin}
                          onClick={(e) => { cerrarMenu(e.currentTarget); window.confirm(u.superAdmin ? `¿Quitar el rol de super administrador a ${u.email}? Dejará de ver Administración (seguirá como admin de sus marcas).` : `¿Hacer super administrador a ${u.email}? Verá y podrá usar toda la Administración y será admin de todas las marcas.`) && void seguridad(() => api.patch(`/usuarios/global/${u.id}/super-admin`, { superAdmin: !u.superAdmin }), u.superAdmin ? 'Ya no es super administrador.' : `${u.email} ahora es super administrador.`, 'No se pudo cambiar el rol de super administrador.'); }}>{u.superAdmin ? 'Quitar super administrador' : 'Hacer super administrador'}</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm ax-btn--block" style={{ justifyContent: 'flex-start' }}
                          onClick={(e) => { cerrarMenu(e.currentTarget); void seguridad(() => api.post(`/usuarios/global/${u.id}/reset-password`), `Correo de restablecimiento enviado a ${u.email}.`, 'No se pudo enviar el correo.'); }}>Enviar correo para restablecer contraseña</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm ax-btn--block" style={{ justifyContent: 'flex-start' }}
                          onClick={(e) => { cerrarMenu(e.currentTarget); setPwU(u); setPw(''); setPwErr(''); }}>Cambiar contraseña…</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm ax-btn--block" style={{ justifyContent: 'flex-start' }} disabled={!u.totpEnabled}
                          onClick={(e) => { cerrarMenu(e.currentTarget); window.confirm(`¿Restablecer el 2FA de ${u.email}? Podrá volver a activarlo desde su Configuración.`) && void seguridad(() => api.post(`/usuarios/global/${u.id}/2fa/reset`), `2FA restablecido para ${u.email}.`, 'No se pudo restablecer el 2FA.'); }}>Restablecer 2FA{u.totpEnabled ? '' : ' (no activo)'}</button>
                        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm ax-btn--block" style={{ justifyContent: 'flex-start' }}
                          onClick={(e) => { cerrarMenu(e.currentTarget); window.confirm(`¿Cerrar todas las sesiones de ${u.email}?`) && void seguridad(() => api.post(`/usuarios/global/${u.id}/sesiones/cerrar`), 'Sesiones cerradas.', 'No se pudieron cerrar las sesiones.'); }}>Cerrar todas sus sesiones</button>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {crear && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setCrear(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cu-title" className="ax-card" style={{ position: 'relative', maxWidth: 460, width: '100%' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title" id="cu-title">Crear usuario</h2><p className="ax-card__subtitle">Recibirá un enlace por correo (vence en 7 días) y solo verá la empresa que elijas.</p></div>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={enviar}>
              {cErr && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{cErr}</p></div></div>}
              <div className="ax-field"><label className="ax-label" htmlFor="cu-email">Correo electrónico</label><input id="cu-email" type="email" className="ax-input" placeholder="nombre@empresa.com" required value={cEmail} onChange={(e) => setCEmail(e.target.value)} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="cu-marca">Empresa</label>
                <select id="cu-marca" className="ax-select" required value={cMarca} onChange={(e) => setCMarca(e.target.value)}>
                  <option value="">Elegir empresa…</option>
                  {data?.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="ax-field"><label className="ax-label" htmlFor="cu-rol">Rol</label>
                <select id="cu-rol" className="ax-select" required value={cRol} onChange={(e) => setCRol(e.target.value)}>
                  <option value="">Elegir rol…</option>
                  {data?.roles.filter((r) => r.nombre !== 'cliente').map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setCrear(false)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={cBusy || !cEmail.trim() || !cMarca || !cRol}>{cBusy ? 'Enviando…' : 'Enviar invitación'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pwU && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setPwU(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div role="dialog" aria-modal="true" aria-labelledby="pw-title" className="ax-card" style={{ position: 'relative', maxWidth: 420, width: '100%' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title" id="pw-title">Cambiar contraseña</h2><p className="ax-card__subtitle">{pwU.email}. Se cerrarán sus sesiones y recibirá un aviso por correo.</p></div>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={guardarPw}>
              {pwErr && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{pwErr}</p></div></div>}
              <div className="ax-field"><label className="ax-label" htmlFor="pw-new">Nueva contraseña (mín. 8 caracteres)</label><input id="pw-new" type="password" autoComplete="new-password" className="ax-input" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setPwU(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={pw.length < 8}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UsuariosGlobal;

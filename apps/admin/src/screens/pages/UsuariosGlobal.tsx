'use client';
/*
 * FPTecnologi-HUB — Todos los usuarios (Administración, solo super admin = admin de todas las marcas).
 * GET /usuarios/global: cuentas de todas las marcas con sus roles por marca; activar/desactivar la cuenta,
 * agregar o quitar un rol en una marca. La gestión fina de una marca (invitaciones, 2FA) sigue en «Usuarios y equipo».
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Asig { marcaId: string; rolId: string; marca: { nombre: string }; rol: { nombre: string } }
interface Usuario { id: string; email: string; nombre: string | null; cargo: string | null; activo: boolean; totpEnabled: boolean; createdAt: string; marcas: Asig[] }
interface Respuesta { usuarios: Usuario[]; marcas: { id: string; nombre: string }[]; roles: { id: string; nombre: string }[] }

const msg = (e: unknown, d: string) => (e instanceof ApiError ? e.message : d);

export function UsuariosGlobal() {
  const { user, activeMarcaId } = useAuth();
  const [data, setData] = useState<Respuesta | null>(null);
  const [q, setQ] = useState('');
  const [marcaF, setMarcaF] = useState('');
  const [rolF, setRolF] = useState('');
  const [error, setError] = useState('');
  const [agregando, setAgregando] = useState<string | null>(null);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoRol, setNuevoRol] = useState('');

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (marcaF) p.set('marcaId', marcaF);
    if (rolF) p.set('rolId', rolF);
    try { setData(await api.get<Respuesta>(`/usuarios/global?${p}`)); setError(''); }
    catch (e) { setError(msg(e, 'No se pudieron cargar los usuarios.')); }
  }, [activeMarcaId, q, marcaF, rolF]);

  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);

  async function accion(fn: () => Promise<unknown>, d: string) {
    try { await fn(); setError(''); await cargar(); } catch (e) { setError(msg(e, d)); }
  }

  return (
    <>
      <PageHead title="Todos los usuarios" subtitle="Cuentas de todas las marcas y sus roles. Solo el super administrador (admin de todas las marcas)." />
      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
          <input className="ax-input" style={{ flex: '1 1 220px' }} placeholder="Buscar por nombre o correo" aria-label="Buscar usuario" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="ax-select" aria-label="Filtrar por marca" value={marcaF} onChange={(e) => setMarcaF(e.target.value)}>
            <option value="">Todas las marcas</option>
            {data?.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <select className="ax-select" aria-label="Filtrar por rol" value={rolF} onChange={(e) => setRolF(e.target.value)}>
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
            </tr></thead>
            <tbody>
              {!data && <tr><td className="ax-table__td" colSpan={4}>Cargando…</td></tr>}
              {data?.usuarios.length === 0 && <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>Sin resultados.</td></tr>}
              {data?.usuarios.map((u) => (
                <tr key={u.id} className="ax-table__row">
                  <td className="ax-table__td">
                    <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{u.nombre || '—'}{u.id === user?.id ? ' (tú)' : ''}</div>
                    <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{u.email}</div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default UsuariosGlobal;

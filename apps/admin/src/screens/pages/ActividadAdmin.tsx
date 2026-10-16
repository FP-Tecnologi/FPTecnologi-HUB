'use client';
/*
 * FPTecnologi-HUB — Administración → Actividad (solo super admin): registro de seguridad con los inicios de sesión
 * (correctos y fallidos) y las acciones administrativas (usuarios, roles, contraseñas, 2FA, marcas, tickets).
 * GET /actividad: últimos 300 eventos, filtrables por acción y texto.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Evento { id: string; usuarioId: string | null; email: string | null; accion: string; detalle: string | null; marcaId: string | null; createdAt: string }
interface Respuesta { eventos: Evento[]; acciones: string[]; marcas: { id: string; nombre: string }[] }

const ACCIONES: Record<string, { label: string; badge: string }> = {
  login: { label: 'Inicio de sesión', badge: 'ax-badge--success' },
  login_fallido: { label: 'Intento fallido', badge: 'ax-badge--danger' },
  password_restablecida: { label: 'Contraseña restablecida', badge: 'ax-badge--warning' },
  password_cambiada_por_admin: { label: 'Contraseña cambiada por admin', badge: 'ax-badge--warning' },
  correo_restablecer_password: { label: 'Correo de restablecimiento', badge: 'ax-badge--info' },
  '2fa_restablecido': { label: '2FA restablecido', badge: 'ax-badge--warning' },
  sesiones_cerradas: { label: 'Sesiones cerradas', badge: 'ax-badge--warning' },
  cuenta_activada: { label: 'Cuenta activada', badge: 'ax-badge--success' },
  cuenta_desactivada: { label: 'Cuenta desactivada', badge: 'ax-badge--danger' },
  rol_asignado: { label: 'Rol asignado', badge: 'ax-badge--info' },
  rol_quitado: { label: 'Rol quitado', badge: 'ax-badge--neutral' },
  invitacion_enviada: { label: 'Invitación enviada', badge: 'ax-badge--info' },
  marca_creada: { label: 'Marca creada', badge: 'ax-badge--success' },
  marca_editada: { label: 'Marca editada', badge: 'ax-badge--neutral' },
  marca_eliminada: { label: 'Marca eliminada', badge: 'ax-badge--danger' },
  ticket_atendido: { label: 'Ticket atendido', badge: 'ax-badge--neutral' },
};
const info = (a: string) => ACCIONES[a] ?? { label: a, badge: 'ax-badge--neutral' };
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function ActividadAdmin() {
  const [data, setData] = useState<Respuesta | null>(null);
  const [q, setQ] = useState('');
  const [accion, setAccion] = useState('');
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (accion) p.set('accion', accion);
    try { setData(await api.get<Respuesta>(`/actividad?${p}`)); setError(''); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo cargar la actividad.'); }
  }, [q, accion]);
  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);

  const marca = (id: string | null) => (id ? data?.marcas.find((m) => m.id === id)?.nombre ?? '—' : '—');

  return (
    <>
      <PageHead
        title="Actividad"
        subtitle="Registro de seguridad: inicios de sesión y cambios hechos por administradores. Solo el super administrador."
        actions={<button type="button" className="ax-btn ax-btn--ghost" onClick={() => void cargar()}>Actualizar</button>}
      />
      {error && <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div></div>}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <input type="search" className="ax-input" style={{ width: 240 }} placeholder="Buscar correo o detalle" aria-label="Buscar en la actividad" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="ax-select" style={{ width: 'auto' }} aria-label="Filtrar por acción" value={accion} onChange={(e) => setAccion(e.target.value)}>
            <option value="">Todas las acciones</option>
            {data?.acciones.map((a) => <option key={a} value={a}>{info(a).label}</option>)}
          </select>
        </div>
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head"><tr>
              <th className="ax-table__th" scope="col">Fecha</th>
              <th className="ax-table__th" scope="col">Acción</th>
              <th className="ax-table__th" scope="col">Usuario</th>
              <th className="ax-table__th" scope="col">Empresa</th>
              <th className="ax-table__th" scope="col">Detalle</th>
            </tr></thead>
            <tbody>
              {!data && <tr><td className="ax-table__td" colSpan={5}>{error ? 'No se pudo cargar. Vuelve a iniciar sesión o recarga.' : 'Cargando…'}</td></tr>}
              {data?.eventos.length === 0 && <tr><td className="ax-table__td" colSpan={5} style={{ color: 'var(--ax-text-muted)' }}>Todavía no hay actividad registrada.</td></tr>}
              {data?.eventos.map((e) => (
                <tr key={e.id} className="ax-table__row">
                  <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)', whiteSpace: 'nowrap' }}>{fecha(e.createdAt)}</td>
                  <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${info(e.accion).badge}`}>{info(e.accion).label}</span></td>
                  <td className="ax-table__td">{e.email ?? '—'}</td>
                  <td className="ax-table__td">{marca(e.marcaId)}</td>
                  <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{e.detalle ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ActividadAdmin;

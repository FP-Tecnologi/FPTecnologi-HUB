'use client';
/*
 * FPTecnologi-HUB — Bitácora del sistema: quién hizo qué, cuándo y desde dónde.
 *  · Administración → Actividad (solo super admin): toda la plataforma. GET /actividad
 * Registra inicios de sesión, acciones administrativas y, de forma automática, cada cambio y exportación de cualquier módulo.
 * Filtros por texto, usuario, marca, acción y fechas; 50 por página; exporta a CSV.
 */
import { Fragment, useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Select } from '../../components/ui/Select';

interface Evento {
  id: string; usuarioId: string | null; email: string | null; accion: string; detalle: string | null; marcaId: string | null; createdAt: string;
  metodo: string | null; ruta: string | null; ip: string | null; dispositivo: string | null; cambios: unknown;
}
interface Respuesta { eventos: Evento[]; total: number; page: number; paginas: number; porPagina: number; acciones: string[]; marcas: { id: string; nombre: string }[] }

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
  landing_enviada_revision: { label: 'Landing enviada a revisión', badge: 'ax-badge--info' },
  landing_aprobada: { label: 'Landing aprobada', badge: 'ax-badge--success' },
  landing_devuelta: { label: 'Landing devuelta', badge: 'ax-badge--warning' },
};
/** Acciones automáticas llegan como "recurso.verbo" (p. ej. crm/oportunidades.editar). */
const info = (a: string) => {
  if (ACCIONES[a]) return ACCIONES[a];
  const [recurso, verbo] = a.split('.');
  if (!verbo) return { label: a, badge: 'ax-badge--neutral' };
  const badge = verbo === 'eliminar' ? 'ax-badge--danger' : verbo === 'crear' ? 'ax-badge--success' : verbo === 'exportar' ? 'ax-badge--warning' : 'ax-badge--neutral';
  return { label: `${recurso.replace(/[/-]/g, ' › ')} · ${verbo}`, badge };
};
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function ActividadAdmin() {
  const base = '/actividad';
  const [data, setData] = useState<Respuesta | null>(null);
  const [f, setF] = useState({ q: '', usuario: '', accion: '', marcaId: '', desde: '', hasta: '' });
  const [page, setPage] = useState(1);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);

  const params = useCallback((extra: Record<string, string> = {}) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...f, ...extra })) if (v.trim()) p.set(k, v.trim());
    return p;
  }, [f]);

  const cargar = useCallback(async () => {
    try { setData(await api.get<Respuesta>(`${base}?${params({ page: String(page) })}`)); setError(''); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo cargar la actividad.'); }
  }, [base, params, page]);
  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);

  const cambiar = (parcial: Partial<typeof f>) => { setF((p) => ({ ...p, ...parcial })); setPage(1); };
  const marca = (id: string | null) => (id ? data?.marcas.find((m) => m.id === id)?.nombre ?? '—' : '—');

  async function exportar() {
    setExportando(true);
    try {
      const r = await api.get<{ nombre: string; csv: string; filas: number }>(`${base}/exportar?${params()}`);
      const url = URL.createObjectURL(new Blob([r.csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = r.nombre; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo exportar.'); }
    finally { setExportando(false); }
  }

  return (
    <>
      <PageHead
        title="Actividad"
        subtitle="Bitácora de toda la plataforma: quién hizo qué, cuándo y desde dónde. Solo el super administrador."
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={() => void cargar()}>Actualizar</button>
            <button type="button" className="ax-btn ax-btn--secondary" disabled={exportando} onClick={() => void exportar()}>{exportando ? 'Exportando…' : 'Exportar CSV'}</button>
          </div>
        }
      />
      {error && <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div></div>}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <input type="search" className="ax-input" style={{ width: 200 }} placeholder="Buscar detalle o ruta" aria-label="Buscar en la actividad" value={f.q} onChange={(e) => cambiar({ q: e.target.value })} />
          <input type="search" className="ax-input" style={{ width: 200 }} placeholder="Usuario (correo)" aria-label="Filtrar por usuario" value={f.usuario} onChange={(e) => cambiar({ usuario: e.target.value })} />
          <Select className="ax-select" style={{ width: 'auto' }} aria-label="Filtrar por marca" value={f.marcaId} onChange={(e) => cambiar({ marcaId: e.target.value })}>
            <option value="">Todas las marcas</option>
            {data?.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Select>
          <Select className="ax-select" style={{ width: 'auto' }} aria-label="Filtrar por acción" value={f.accion} onChange={(e) => cambiar({ accion: e.target.value })}>
            <option value="">Todas las acciones</option>
            {data?.acciones.map((a) => <option key={a} value={a}>{info(a).label}</option>)}
          </Select>
          <input type="date" className="ax-input" style={{ width: 150 }} aria-label="Desde" value={f.desde} max={f.hasta || undefined} onChange={(e) => cambiar({ desde: e.target.value })} />
          <input type="date" className="ax-input" style={{ width: 150 }} aria-label="Hasta" value={f.hasta} min={f.desde || undefined} onChange={(e) => cambiar({ hasta: e.target.value })} />
        </div>
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head"><tr>
              <th className="ax-table__th" scope="col">Fecha</th>
              <th className="ax-table__th" scope="col">Acción</th>
              <th className="ax-table__th" scope="col">Usuario</th>
              <th className="ax-table__th" scope="col">Marca</th>
              <th className="ax-table__th" scope="col">Detalle</th>
              <th className="ax-table__th" scope="col"><span className="ax-sr-only">Ver más</span></th>
            </tr></thead>
            <tbody>
              {!data && <tr><td className="ax-table__td" colSpan={6}>{error ? 'No se pudo cargar. Vuelve a iniciar sesión o recarga.' : 'Cargando…'}</td></tr>}
              {data?.eventos.length === 0 && <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>No hay actividad con esos filtros.</td></tr>}
              {data?.eventos.map((e) => (
                <Fragment key={e.id}>
                  <tr className="ax-table__row">
                    <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)', whiteSpace: 'nowrap' }}>{fecha(e.createdAt)}</td>
                    <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${info(e.accion).badge}`}>{info(e.accion).label}</span></td>
                    <td className="ax-table__td">{e.email ?? '—'}</td>
                    <td className="ax-table__td">{marca(e.marcaId)}</td>
                    <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{e.detalle ?? e.ruta ?? '—'}</td>
                    <td className="ax-table__td" style={{ textAlign: 'right' }}>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-expanded={abierto === e.id} onClick={() => setAbierto(abierto === e.id ? null : e.id)}>{abierto === e.id ? 'Ocultar' : 'Detalle'}</button>
                    </td>
                  </tr>
                  {abierto === e.id && (
                    <tr className="ax-table__row">
                      <td className="ax-table__td" colSpan={6} style={{ background: 'var(--ax-surface-subtle, transparent)' }}>
                        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 'var(--ax-space-1) var(--ax-space-4)', margin: 0, fontSize: 'var(--ax-text-sm)' }}>
                          <dt style={{ color: 'var(--ax-text-subtle)' }}>Petición</dt><dd style={{ margin: 0 }}>{e.metodo ? `${e.metodo} ${e.ruta ?? ''}` : '—'}</dd>
                          <dt style={{ color: 'var(--ax-text-subtle)' }}>IP</dt><dd style={{ margin: 0 }}>{e.ip ?? '—'}</dd>
                          <dt style={{ color: 'var(--ax-text-subtle)' }}>Dispositivo</dt><dd style={{ margin: 0, wordBreak: 'break-word' }}>{e.dispositivo ?? '—'}</dd>
                          <dt style={{ color: 'var(--ax-text-subtle)' }}>Datos enviados</dt>
                          <dd style={{ margin: 0 }}>{e.cambios ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 'var(--ax-text-xs)' }}>{JSON.stringify(e.cambios, null, 2)}</pre> : '—'}</dd>
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="ax-cluster" style={{ justifyContent: 'space-between', alignItems: 'center', marginBlockStart: 'var(--ax-space-3)', flexWrap: 'wrap', gap: 'var(--ax-space-2)' }}>
            <span style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>{data.total.toLocaleString('es-PE')} eventos · página {data.page} de {data.paginas}</span>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={page >= data.paginas} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default ActividadAdmin;

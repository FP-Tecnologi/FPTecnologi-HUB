'use client';
/*
 * FPTecnologi-HUB — Administración → Soporte (solo super admin): tickets que los usuarios de la plataforma enviaron
 * desde su «Centro de ayuda». GET /soporte: filtrar por estado / empresa / texto, abrir un ticket, responder (le llega
 * por correo al usuario) y cambiar su estado.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'ABIERTO' | 'EN_REVISION' | 'CERRADO';
interface Ticket {
  id: string; asunto: string; categoria: string; mensaje: string; estado: Estado;
  respuesta: string | null; respondidoPor: string | null; respondidoAt: string | null; createdAt: string;
  marca: { nombre: string } | null; usuario: { email: string; nombre: string | null };
}
interface Respuesta { tickets: Ticket[]; marcas: { id: string; nombre: string }[] }

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'ABIERTO', label: 'Abierto', badge: 'ax-badge--info' },
  { v: 'EN_REVISION', label: 'En revisión', badge: 'ax-badge--warning' },
  { v: 'CERRADO', label: 'Cerrado', badge: 'ax-badge--neutral' },
];
const msg = (e: unknown, d: string) => (e instanceof ApiError ? e.message : d);
const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function SoporteAdmin() {
  const [data, setData] = useState<Respuesta | null>(null);
  const [q, setQ] = useState('');
  const [estadoF, setEstadoF] = useState('');
  const [marcaF, setMarcaF] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [abierto, setAbierto] = useState<Ticket | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [estado, setEstado] = useState<Estado>('ABIERTO');
  const [busy, setBusy] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, !!abierto);

  const cargar = useCallback(async () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (estadoF) p.set('estado', estadoF);
    if (marcaF) p.set('marcaId', marcaF);
    try { setData(await api.get<Respuesta>(`/soporte?${p}`)); setError(''); }
    catch (e) { setError(msg(e, 'No se pudieron cargar los tickets.')); }
  }, [q, estadoF, marcaF]);
  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  function abrir(t: Ticket) { setAbierto(t); setRespuesta(t.respuesta ?? ''); setEstado(t.estado); setModalErr(''); }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!abierto || busy) return;
    setBusy(true); setModalErr('');
    const nueva = respuesta.trim() && respuesta.trim() !== (abierto.respuesta ?? '');
    try {
      await api.patch(`/soporte/${abierto.id}`, { estado, ...(nueva ? { respuesta: respuesta.trim() } : {}) });
      setOk(nueva ? `Respuesta enviada a ${abierto.usuario.email}.` : 'Ticket actualizado.');
      setAbierto(null);
      await cargar();
    } catch (e) { setModalErr(msg(e, 'No se pudo guardar.')); }
    finally { setBusy(false); }
  }

  const badge = (e: Estado) => ESTADOS.find((x) => x.v === e)!;

  return (
    <>
      <PageHead title="Soporte" subtitle="Tickets que enviaron los usuarios de la plataforma desde su Centro de ayuda. Solo el super administrador." />
      {error && <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div></div>}
      {ok && <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{ok}</p></div></div>}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <input type="search" className="ax-input" style={{ width: 240 }} placeholder="Buscar asunto o correo" aria-label="Buscar ticket" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="ax-select" style={{ width: 'auto' }} aria-label="Filtrar por estado" value={estadoF} onChange={(e) => setEstadoF(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
          <select className="ax-select" style={{ width: 'auto' }} aria-label="Filtrar por empresa" value={marcaF} onChange={(e) => setMarcaF(e.target.value)}>
            <option value="">Todas las empresas</option>
            {data?.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>

        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head"><tr>
              <th className="ax-table__th" scope="col">Ticket</th>
              <th className="ax-table__th" scope="col">Usuario</th>
              <th className="ax-table__th" scope="col">Empresa</th>
              <th className="ax-table__th" scope="col">Estado</th>
              <th className="ax-table__th" scope="col">Enviado</th>
              <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
            </tr></thead>
            <tbody>
              {!data && <tr><td className="ax-table__td" colSpan={6}>{error ? 'No se pudo cargar. Vuelve a iniciar sesión o recarga.' : 'Cargando…'}</td></tr>}
              {data?.tickets.length === 0 && <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>No hay tickets.</td></tr>}
              {data?.tickets.map((t) => (
                <tr key={t.id} className="ax-table__row">
                  <td className="ax-table__td">
                    <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{t.asunto}</div>
                    <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{t.categoria}</div>
                  </td>
                  <td className="ax-table__td">
                    <div>{t.usuario.nombre || t.usuario.email}</div>
                    <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{t.usuario.email}</div>
                  </td>
                  <td className="ax-table__td">{t.marca?.nombre ?? '—'}</td>
                  <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${badge(t.estado).badge}`}>{badge(t.estado).label}</span></td>
                  <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{fecha(t.createdAt)}</td>
                  <td className="ax-table__td" style={{ textAlign: 'right' }}>
                    <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrir(t)}>{t.respuesta ? 'Ver / editar' : 'Responder'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {abierto && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setAbierto(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="st-title" className="ax-card" style={{ position: 'relative', maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles"><h2 className="ax-card__title" id="st-title">{abierto.asunto}</h2><p className="ax-card__subtitle">{abierto.usuario.email} · {abierto.marca?.nombre ?? 'Sin empresa'} · {fecha(abierto.createdAt)}</p></div>
            </div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={guardar}>
              {modalErr && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{modalErr}</p></div></div>}
              <div>
                <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', marginBlockEnd: 4 }}>{abierto.categoria}</div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{abierto.mensaje}</p>
              </div>
              <div className="ax-field"><label className="ax-label" htmlFor="st-resp">Respuesta (se envía por correo al usuario)</label>
                <textarea id="st-resp" className="ax-input" rows={5} maxLength={4000} value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
                {abierto.respondidoAt && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Última respuesta: {abierto.respondidoPor} · {fecha(abierto.respondidoAt)}</span>}
              </div>
              <div className="ax-field"><label className="ax-label" htmlFor="st-estado">Estado</label>
                <select id="st-estado" className="ax-select" value={estado} onChange={(e) => setEstado(e.target.value as Estado)}>
                  {ESTADOS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setAbierto(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SoporteAdmin;

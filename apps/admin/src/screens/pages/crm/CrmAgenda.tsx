'use client';
/*
 * FPTecnologi-HUB — CRM → Agenda: calendario mensual + lista del día (o de todo lo pendiente). Reúne las tareas
 * pendientes y las «próximas acciones» de las oportunidades abiertas (se agregan solas desde la ficha / el embudo)
 * y permite agregar tareas a mano desde aquí. «Hecha» cierra la tarea sin abrir la ficha.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { Select } from '../../../components/ui/Select';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Alerta, Modal, OportunidadPanel, deLocal, etapa, fechaHora, msg, nombreDe, useVeTodoCrm, vencida, type Actividad, type Etapa, type Oportunidad, type Usuario } from './comun';

type Tarea = Actividad & { oportunidad: { id: string; numero: string; titulo: string; etapa: Etapa; asignado: Usuario | null; contacto: { nombre: string } | null } };
const hoyFin = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
const clave = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CrmAgenda() {
  const { activeMarcaId } = useAuth();
  const [datos, setDatos] = useState<{ tareas: Tarea[]; acciones: Oportunidad[] } | null>(null);
  const [error, setError] = useState('');
  const [mias, setMias] = useState(true);
  const { veTodo } = useVeTodoCrm();
  const [abierta, setAbierta] = useState<string | null>(null);
  const [mes, setMes] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [dia, setDia] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setDatos(await api.get(`/crm/agenda${mias ? '?mias=1' : ''}`)); setError(''); } catch (e) { setError(msg(e, 'No se pudo cargar la agenda.')); }
  }, [activeMarcaId, mias]);
  useEffect(() => { cargar(); }, [cargar]);

  async function hecha(t: Tarea) {
    try { await api.patch(`/crm/actividades/${t.id}`, { hecha: true }); cargar(); } catch (e) { setError(msg(e, 'No se pudo marcar.')); }
  }

  // Eventos por día (tareas + próximas acciones) para los puntos del calendario.
  const porDia = useMemo(() => {
    const m = new Map<string, { tareas: number; acciones: number }>();
    const suma = (iso: string | null, k: 'tareas' | 'acciones') => {
      if (!iso) return;
      const c = clave(new Date(iso));
      const x = m.get(c) ?? { tareas: 0, acciones: 0 };
      x[k]++; m.set(c, x);
    };
    datos?.tareas.forEach((t) => suma(t.fecha, 'tareas'));
    datos?.acciones.forEach((o) => suma(o.proximaAccionAt, 'acciones'));
    return m;
  }, [datos]);

  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const desfase = (primero.getDay() + 6) % 7; // semana desde el lunes
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return [...Array(desfase).fill(null), ...Array.from({ length: total }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1))] as (Date | null)[];
  }, [mes]);

  const tareasVis = (datos?.tareas ?? []).filter((t) => !dia || clave(new Date(t.fecha)) === dia);
  const accionesVis = (datos?.acciones ?? []).filter((o) => !dia || (o.proximaAccionAt && clave(new Date(o.proximaAccionAt)) === dia));
  const grupos = (() => {
    if (dia) return [{ titulo: new Date(`${dia}T12:00`).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }), filas: tareasVis, tono: 'var(--ax-text)' }];
    const fin = hoyFin();
    return [
      { titulo: 'Vencidas', filas: tareasVis.filter((x) => vencida(x.fecha)), tono: 'var(--ax-danger-500)' },
      { titulo: 'Hoy', filas: tareasVis.filter((x) => !vencida(x.fecha) && new Date(x.fecha).getTime() <= fin), tono: 'var(--ax-viz-amber)' },
      { titulo: 'Próximas', filas: tareasVis.filter((x) => new Date(x.fecha).getTime() > fin), tono: 'var(--ax-text-muted)' },
    ];
  })();
  const hoy = clave(new Date());

  return (
    <>
      <PageHead title="Agenda comercial" subtitle="Calendario de tareas y próximas acciones. Se llena solo desde las oportunidades y también puedes agregar a mano." actions={
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
          {veTodo && (
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="De quién">
              <button type="button" role="radio" aria-checked={mias} className={`ax-btn ax-btn--sm${mias ? ' is-selected' : ''}`} onClick={() => setMias(true)}>Mías</button>
              <button type="button" role="radio" aria-checked={!mias} className={`ax-btn ax-btn--sm${!mias ? ' is-selected' : ''}`} onClick={() => setMias(false)}>Todo el equipo</button>
            </div>
          )}
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => setNueva(true)}><span className="ax-btn__label">Agregar a la agenda</span></button>
        </div>
      } />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}

      <div className="ax-dash-grid">
        <section className="ax-card ax-col--5" aria-label="Calendario">
          <div className="ax-card__header">
            <div className="ax-card__titles"><h2 className="ax-card__title" style={{ textTransform: 'capitalize' }}>{mes.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</h2></div>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)' }}>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Mes anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</button>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => { const d = new Date(); setMes(new Date(d.getFullYear(), d.getMonth(), 1)); setDia(clave(d)); }}>Hoy</button>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Mes siguiente" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</button>
            </div>
          </div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
              {DIAS.map((d) => <span key={d} style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', paddingBlock: 4 }}>{d}</span>)}
              {celdas.map((d, i) => {
                if (!d) return <span key={`v${i}`} />;
                const c = clave(d);
                const ev = porDia.get(c);
                const sel = dia === c;
                return (
                  <button key={c} type="button" onClick={() => setDia(sel ? null : c)} aria-pressed={sel}
                    aria-label={`${d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}${ev ? `, ${ev.tareas + ev.acciones} pendientes` : ''}`}
                    style={{
                      aspectRatio: '1', minHeight: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer',
                      borderRadius: 'var(--ax-radius-md, 8px)', font: 'inherit', fontSize: 'var(--ax-text-sm)', color: 'inherit',
                      background: sel ? 'var(--ax-primary-500, #2563eb)' : 'transparent',
                      border: c === hoy && !sel ? '1px solid var(--ax-primary-500, #2563eb)' : '1px solid transparent',
                      ...(sel ? { color: '#fff' } : {}),
                    }}>
                    <span>{d.getDate()}</span>
                    <span style={{ display: 'flex', gap: 3, height: 6 }}>
                      {ev?.tareas ? <i style={{ width: 6, height: 6, borderRadius: 3, background: sel ? '#fff' : 'var(--ax-viz-amber)' }} /> : null}
                      {ev?.acciones ? <i style={{ width: 6, height: 6, borderRadius: 3, background: sel ? '#fff' : 'var(--ax-viz-emerald)' }} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: 'var(--ax-space-3) 0 0', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
              <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: 'var(--ax-viz-amber)' }} /> Tarea · <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: 'var(--ax-viz-emerald)' }} /> Próxima acción
              {dia && <> · <button type="button" className="ax-btn ax-btn--link" style={{ padding: 0, fontSize: 'inherit' }} onClick={() => setDia(null)}>Ver todo</button></>}
            </p>
          </div>
        </section>

        <div className="ax-col--7" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          <section className="ax-card" aria-label="Tareas pendientes">
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Tareas {dia ? 'del día' : 'pendientes'}</h2></div></div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              {!datos ? <p>Cargando…</p> : tareasVis.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>{dia ? 'Sin tareas este día.' : 'No hay tareas pendientes.'}</p> : grupos.filter((g) => g.filas.length).map((g) => (
                <div key={g.titulo}>
                  <h3 style={{ margin: '0 0 var(--ax-space-2)', fontSize: 'var(--ax-text-sm)', color: g.tono, textTransform: 'capitalize' }}>{g.titulo} ({g.filas.length})</h3>
                  <ul className="ax-list ax-list--compact" style={{ margin: 0, padding: 0 }}>
                    {g.filas.map((t) => (
                      <li key={t.id} className="ax-list__row" style={{ paddingInline: 0, alignItems: 'flex-start' }}>
                        <span className="ax-list__content">
                          <span className="ax-list__title">{t.texto}</span>
                          <button type="button" className="ax-btn ax-btn--link" style={{ padding: 0, fontSize: 'var(--ax-text-xs)' }} onClick={() => setAbierta(t.oportunidad.id)}>
                            {t.oportunidad.numero} · {t.oportunidad.titulo}{t.oportunidad.contacto ? ` · ${t.oportunidad.contacto.nombre}` : ''}
                          </button>
                          <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{fechaHora(t.fecha)}{!mias ? ` · ${nombreDe(t.oportunidad.asignado)}` : ''}</span>
                        </span>
                        <span className="ax-list__trailing"><button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => hecha(t)}>Hecha</button></span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="ax-card" aria-label="Próximas acciones">
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Próximas acciones</h2><p className="ax-card__subtitle">La «próxima acción» con fecha de cada oportunidad abierta (se agregan solas).</p></div></div>
            <div className="ax-card__body" style={{ paddingTop: 0 }}>
              {!datos ? <p>Cargando…</p> : accionesVis.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>{dia ? 'Sin acciones este día.' : 'Ninguna oportunidad abierta tiene una próxima acción con fecha.'}</p> : (
                <ul className="ax-list ax-list--compact" style={{ margin: 0, padding: 0 }}>
                  {accionesVis.map((o) => (
                    <li key={o.id} className="ax-list__row" style={{ paddingInline: 0, alignItems: 'flex-start' }}>
                      <span className="ax-list__content">
                        <span className="ax-list__title" style={{ color: vencida(o.proximaAccionAt) ? 'var(--ax-danger-500)' : undefined }}>{o.proximaAccion}</span>
                        <button type="button" className="ax-btn ax-btn--link" style={{ padding: 0, fontSize: 'var(--ax-text-xs)' }} onClick={() => setAbierta(o.id)}>
                          {o.numero} · {o.titulo}{o.empresa ? ` · ${o.empresa.razonSocial}` : ''}
                        </button>
                        <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.proximaAccionAt ? fechaHora(o.proximaAccionAt) : ''}{vencida(o.proximaAccionAt) ? ' · vencida' : ''} · {etapa(o.etapa).label}{!mias ? ` · ${nombreDe(o.asignado)}` : ''}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
      {abierta && <OportunidadPanel id={abierta} onClose={() => setAbierta(null)} onCambio={cargar} />}
      {nueva && <NuevaTarea fechaInicial={dia} onClose={() => setNueva(false)} onCreada={() => { setNueva(false); cargar(); }} />}
    </>
  );
}

/** Tarea manual: se cuelga de una oportunidad abierta (así aparece también en su ficha). */
function NuevaTarea({ fechaInicial, onClose, onCreada }: { fechaInicial: string | null; onClose: () => void; onCreada: () => void }) {
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [opId, setOpId] = useState('');
  const [texto, setTexto] = useState('');
  const [fecha, setFecha] = useState(fechaInicial ?? clave(new Date()));
  const [hora, setHora] = useState('09:00');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.get<Oportunidad[]>('/crm/oportunidades').then((l) => setOps(l.filter((o) => o.etapa !== 'GANADO' && o.etapa !== 'PERDIDO'))).catch((e) => setError(msg(e, 'No se pudieron cargar las oportunidades.')));
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!opId) return setError('Elige la oportunidad a la que pertenece.');
    if (!texto.trim()) return setError('Escribe qué hay que hacer.');
    if (!fecha) return setError('Elige la fecha.');
    setBusy(true);
    try {
      await api.post(`/crm/oportunidades/${opId}/actividades`, { tipo: 'TAREA', texto: texto.trim(), fecha: deLocal(`${fecha}T${hora || '09:00'}`) });
      onCreada();
    } catch (err) { setError(msg(err, 'No se pudo agregar a la agenda.')); } finally { setBusy(false); }
  }

  return (
    <Modal titulo="Agregar a la agenda" onClose={onClose} ancho={480}>
      <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={guardar}>
        {error && <Alerta>{error}</Alerta>}
        <div className="ax-field"><label className="ax-label" htmlFor="ag-op">Oportunidad *</label>
          <Select id="ag-op" className="ax-select" value={opId} onChange={(e) => setOpId(e.target.value)}>
            <option value="">Elige una oportunidad…</option>
            {ops.map((o) => <option key={o.id} value={o.id}>{o.numero} · {o.titulo}</option>)}
          </Select></div>
        <div className="ax-field"><label className="ax-label" htmlFor="ag-tx">¿Qué hay que hacer? *</label><input id="ag-tx" className="ax-input" maxLength={200} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej. Llamar para confirmar la propuesta" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ax-space-3)' }}>
          <div className="ax-field"><label className="ax-label" htmlFor="ag-f">Fecha *</label><input id="ag-f" type="date" className="ax-input" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
          <div className="ax-field"><label className="ax-label" htmlFor="ag-h">Hora</label><input id="ag-h" type="time" className="ax-input" value={hora} onChange={(e) => setHora(e.target.value)} /></div>
        </div>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}><span className="ax-btn__label">{busy ? 'Guardando…' : 'Agregar'}</span></button>
        </div>
      </form>
    </Modal>
  );
}

export default CrmAgenda;

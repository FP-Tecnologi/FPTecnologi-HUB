'use client';
/*
 * FPTecnologi-HUB — CRM → Agenda: calendario mensual y una sola lista de pendientes. Reúne las tareas pendientes y las
 * «próximas acciones» de las oportunidades abiertas (se agregan solas desde la ficha / el embudo), agrupadas en Vencidas,
 * Hoy y Próximas; filtra por tipo y por día. «Hecha» cierra la tarea sin abrir la ficha. En la vista Comercial puede
 * juntar todas tus marcas (cada pendiente lleva su etiqueta de marca).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { Select } from '../../../components/ui/Select';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Alerta, EtiquetaMarca, Modal, OportunidadPanel, SelectorAlcance, deLocal, etapa, msg, nombreDe, useAlcanceMarcas, useFichaOportunidad, useVeTodoCrm, vencida,
  type Actividad, type Etapa, type MarcaRef, type Oportunidad, type Usuario,
} from './comun';

type Tarea = Actividad & { marcaId?: string; marca?: MarcaRef; oportunidad: { id: string; numero: string; titulo: string; etapa: Etapa; asignado: Usuario | null; contacto: { nombre: string } | null } };
/** Un pendiente de la agenda: una tarea o la «próxima acción» de una oportunidad, con lo mismo para mostrarlos juntos. */
interface Item {
  clave: string; tipo: 'tarea' | 'accion'; fecha: string; titulo: string; opId: string; opNumero: string; opTitulo: string; cliente: string | null;
  etapa: Etapa; asignado: Usuario | null; marcaId?: string; marca?: MarcaRef; tareaId?: string;
}
type Filtro = 'todo' | 'tarea' | 'accion';

const hoyFin = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
const clave = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
const diaCorto = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

const ESTILOS = `
.ag-grid{display:grid;grid-template-columns:minmax(300px,380px) minmax(0,1fr);gap:var(--ax-space-4);align-items:start}
.ag-cal{position:sticky;top:var(--ax-space-4)}
@media (max-width:960px){.ag-grid{grid-template-columns:minmax(0,1fr)}.ag-cal{position:static}}
.ag-resumen{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--ax-space-2);margin-block-end:var(--ax-space-3)}
.ag-kpi{padding:var(--ax-space-3);border-radius:var(--ax-radius-md);background:var(--ax-surface-subtle)}
.ag-kpi b{display:block;font-size:var(--ax-text-lg);line-height:1.2;color:var(--c,var(--ax-text-strong))}
.ag-kpi span{font-size:var(--ax-text-xs);color:var(--ax-text-muted)}
.ag-barra{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--ax-space-2);margin-block-end:var(--ax-space-3)}
.ag-grupo{margin-block-end:var(--ax-space-4)}
.ag-grupo__tit{display:flex;align-items:center;gap:8px;margin:0 0 var(--ax-space-2);font-size:var(--ax-text-sm);font-weight:var(--ax-weight-semibold);color:var(--c,var(--ax-text-muted));text-transform:capitalize}
.ag-grupo__n{min-width:22px;padding:0 7px;border-radius:999px;text-align:center;font-size:var(--ax-text-xs);background:color-mix(in srgb,var(--c,var(--ax-text-muted)) 16%,transparent)}
.ag-lista{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ag-fila{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:var(--ax-space-3);align-items:center;padding:var(--ax-space-3) var(--ax-space-2);border-block-end:1px solid var(--ax-border);border-radius:var(--ax-radius-md);transition:background-color .2s}
.ag-fila:last-child{border-block-end-color:transparent}
.ag-fila:hover{background:var(--ax-surface-subtle)}
.ag-hora{display:flex;flex-direction:column;align-items:flex-start;line-height:1.25}
.ag-hora b{white-space:nowrap;font-size:var(--ax-text-sm);color:var(--ax-text-strong);font-variant-numeric:tabular-nums}
.ag-hora span{font-size:var(--ax-text-xs);color:var(--ax-text-subtle)}
.ag-cuerpo{display:flex;flex-direction:column;gap:4px;min-width:0}
.ag-tit{font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong);line-height:1.3;overflow-wrap:anywhere}
.ag-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:var(--ax-text-xs);color:var(--ax-text-muted)}
.ag-abrir{all:unset;cursor:pointer;color:var(--ax-accent);border-radius:4px}
.ag-abrir:hover{text-decoration:underline}
.ag-abrir:focus-visible{outline:2px solid var(--ax-focus-ring,var(--ax-accent));outline-offset:2px}
.ag-vacio{padding:var(--ax-space-6) var(--ax-space-4);text-align:center;color:var(--ax-text-muted);border:1px dashed var(--ax-border);border-radius:var(--ax-radius-md)}
@media (max-width:560px){.ag-fila{grid-template-columns:minmax(0,1fr) auto}.ag-hora{grid-column:1/-1;flex-direction:row;gap:8px;align-items:baseline}}
`;

export function CrmAgenda({ propio = false }: { propio?: boolean }) {
  const { activeMarcaId } = useAuth();
  const alcance = useAlcanceMarcas();
  const [datos, setDatos] = useState<{ tareas: Tarea[]; acciones: Oportunidad[] } | null>(null);
  const [error, setError] = useState('');
  const [miasSel, setMias] = useState(true);
  const { veTodo: veTodoRol } = useVeTodoCrm();
  const veTodo = veTodoRol && !propio;
  const mias = propio || miasSel;
  const [mes, setMes] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [dia, setDia] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todo');
  const [nueva, setNueva] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setDatos(await api.get(`${alcance.todas ? '/crm/global/agenda' : '/crm/agenda'}${mias ? '?mias=1' : ''}`)); setError(''); } catch (e) { setError(msg(e, 'No se pudo cargar la agenda.')); }
  }, [activeMarcaId, mias, alcance.todas]);
  useEffect(() => { cargar(); }, [cargar]);

  // Todos los pendientes en una sola lista, con la misma forma.
  const items = useMemo<Item[]>(() => {
    const t: Item[] = (datos?.tareas ?? []).map((x) => ({
      clave: `t${x.id}`, tipo: 'tarea', fecha: x.fecha, titulo: x.texto, opId: x.oportunidad.id, opNumero: x.oportunidad.numero, opTitulo: x.oportunidad.titulo, cliente: x.oportunidad.contacto?.nombre ?? null,
      etapa: x.oportunidad.etapa, asignado: x.oportunidad.asignado, marcaId: x.marcaId, marca: x.marca, tareaId: x.id,
    }));
    const a: Item[] = (datos?.acciones ?? []).filter((o) => o.proximaAccionAt).map((o) => ({
      clave: `a${o.id}`, tipo: 'accion', fecha: o.proximaAccionAt!, titulo: o.proximaAccion ?? 'Dar seguimiento', opId: o.id, opNumero: o.numero, opTitulo: o.titulo, cliente: o.empresa?.razonSocial ?? o.contacto?.nombre ?? null,
      etapa: o.etapa, asignado: o.asignado, marcaId: o.marcaId, marca: o.marca,
    }));
    return [...t, ...a].sort((x, y) => new Date(x.fecha).getTime() - new Date(y.fecha).getTime());
  }, [datos]);

  // La ficha de una oportunidad de otra marca se abre con esa marca (ver useFichaOportunidad).
  const referencias = useMemo(() => items.map((i) => ({ id: i.opId, marcaId: i.marcaId }) as Oportunidad), [items]);
  const [abierta, setAbierta] = useFichaOportunidad(referencias, alcance.todas);

  async function hecha(i: Item) {
    try { await api.patch(`/crm/actividades/${i.tareaId}`, { hecha: true }, { marcaId: alcance.todas ? i.marcaId : undefined }); cargar(); } catch (e) { setError(msg(e, 'No se pudo marcar.')); }
  }

  // Puntos del calendario: tareas y próximas acciones por día.
  const porDia = useMemo(() => {
    const m = new Map<string, { tareas: number; acciones: number }>();
    items.forEach((i) => { const c = clave(new Date(i.fecha)); const x = m.get(c) ?? { tareas: 0, acciones: 0 }; x[i.tipo === 'tarea' ? 'tareas' : 'acciones']++; m.set(c, x); });
    return m;
  }, [items]);

  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const desfase = (primero.getDay() + 6) % 7; // semana desde el lunes
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return [...Array(desfase).fill(null), ...Array.from({ length: total }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1))] as (Date | null)[];
  }, [mes]);

  const visibles = items.filter((i) => (filtro === 'todo' || i.tipo === filtro) && (!dia || clave(new Date(i.fecha)) === dia));
  const fin = hoyFin();
  const grupos = dia
    ? [{ titulo: new Date(`${dia}T12:00`).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }), filas: visibles, tono: 'var(--ax-text-strong)' }]
    : [
      { titulo: 'Vencidas', filas: visibles.filter((x) => vencida(x.fecha)), tono: 'var(--ax-danger-500)' },
      { titulo: 'Hoy', filas: visibles.filter((x) => !vencida(x.fecha) && new Date(x.fecha).getTime() <= fin), tono: 'var(--ax-warning-500, var(--ax-viz-amber))' },
      { titulo: 'Próximas', filas: visibles.filter((x) => new Date(x.fecha).getTime() > fin), tono: 'var(--ax-text-muted)' },
    ];
  const cuenta = { vencidas: items.filter((x) => vencida(x.fecha)).length, hoy: items.filter((x) => !vencida(x.fecha) && new Date(x.fecha).getTime() <= fin).length, proximas: items.filter((x) => new Date(x.fecha).getTime() > fin).length };
  const hoy = clave(new Date());
  const mesTitulo = (() => { const t = mes.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }); return t.charAt(0).toUpperCase() + t.slice(1); })();

  return (
    <>
      <style>{ESTILOS}</style>
      <PageHead title={propio ? 'Mi agenda' : 'Agenda comercial'} subtitle="Tus pendientes en un solo lugar: tareas y próximas acciones de las oportunidades. Se llena solo y también puedes agregar a mano." actions={
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
          <SelectorAlcance alcance={alcance} />
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

      <div className="ag-grid">
        <section className="ax-card ag-cal" aria-label="Calendario">
          <div className="ax-card__header">
            <div className="ax-card__titles"><h2 className="ax-card__title" style={{ whiteSpace: 'nowrap', fontSize: 'var(--ax-text-lg)' }}>{mesTitulo}</h2></div>
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

        <section aria-label="Pendientes" aria-busy={!datos}>
          <div className="ag-resumen">
            <div className="ag-kpi" style={{ ['--c' as string]: cuenta.vencidas ? 'var(--ax-danger-500)' : undefined }}><b>{datos ? cuenta.vencidas : '—'}</b><span>Vencidas</span></div>
            <div className="ag-kpi"><b>{datos ? cuenta.hoy : '—'}</b><span>Para hoy</span></div>
            <div className="ag-kpi"><b>{datos ? cuenta.proximas : '—'}</b><span>Próximas</span></div>
          </div>
          <div className="ag-barra">
            <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Tipo de pendiente">
              {([['todo', 'Todo'], ['tarea', 'Tareas'], ['accion', 'Próximas acciones']] as const).map(([v, t]) => (
                <button key={v} type="button" role="radio" aria-checked={filtro === v} className={`ax-btn ax-btn--sm${filtro === v ? ' is-selected' : ''}`} onClick={() => setFiltro(v)}>{t}</button>
              ))}
            </div>
            {dia && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setDia(null)}>Quitar filtro de día</button>}
          </div>

          {!datos ? <p style={{ color: 'var(--ax-text-muted)' }}>Cargando…</p> : visibles.length === 0 ? (
            <div className="ag-vacio">{dia ? 'No hay pendientes este día.' : 'No tienes pendientes. Las tareas y próximas acciones de tus oportunidades aparecerán aquí.'}</div>
          ) : grupos.filter((g) => g.filas.length).map((g) => (
            <div key={g.titulo} className="ag-grupo" style={{ ['--c' as string]: g.tono }}>
              <h3 className="ag-grupo__tit">{g.titulo} <span className="ag-grupo__n">{g.filas.length}</span></h3>
              <ul className="ag-lista">
                {g.filas.map((i) => {
                  const tarde = vencida(i.fecha);
                  return (
                    <li key={i.clave} className="ag-fila" style={{ ['--c' as string]: tarde ? 'var(--ax-danger-500)' : i.tipo === 'tarea' ? 'var(--ax-viz-amber)' : 'var(--ax-viz-emerald)' }}>
                      <span className="ag-hora"><b>{hora(i.fecha)}</b><span>{diaCorto(i.fecha)}</span></span>
                      <span className="ag-cuerpo">
                        <span className="ag-tit">{i.titulo}</span>
                        <span className="ag-meta">
                          <span className={`ax-badge ax-badge--soft ax-badge--sm ${i.tipo === 'tarea' ? 'ax-badge--warning' : 'ax-badge--success'}`}>{i.tipo === 'tarea' ? 'Tarea' : 'Próxima acción'}</span>
                          {tarde && <span className="ax-badge ax-badge--soft ax-badge--sm ax-badge--danger">Vencida</span>}
                          <EtiquetaMarca m={i.marca} />
                          <button type="button" className="ag-abrir" onClick={() => setAbierta(i.opId)} aria-label={`Abrir la oportunidad ${i.opNumero}`}>{i.opNumero} · {i.opTitulo}</button>
                          {i.cliente && <span>{i.cliente}</span>}
                          <span>{etapa(i.etapa).label}</span>
                          {!mias && <span>{nombreDe(i.asignado)}</span>}
                        </span>
                      </span>
                      {i.tipo === 'tarea'
                        ? <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => hecha(i)}>Hecha</button>
                        : <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setAbierta(i.opId)}>Abrir</button>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      </div>
      {abierta && <OportunidadPanel id={abierta} onClose={() => setAbierta(null)} onCambio={cargar} />}
      {nueva && <NuevaTarea key={activeMarcaId} fechaInicial={dia} onClose={() => setNueva(false)} onCreada={() => { setNueva(false); cargar(); }} />}
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

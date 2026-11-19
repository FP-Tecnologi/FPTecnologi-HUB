'use client';
/*
 * FPTecnologi-HUB — CRM → Embudo: tablero por etapas (Nuevo → Contactado → Propuesta → Negociación → Ganado /
 * Perdido), en dos vistas: Tablero (columnas; se arrastra una tarjeta para cambiar su etapa) y Lista (una tabla por
 * etapa, más compacta). En ambas, el selector de etapa de cada fila/tarjeta también mueve (teclado y celular) y arriba
 * va el resumen del embudo. Clic = ficha completa. Las solicitudes de la web entran solas en «Nuevo»; el resto es manual.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Alerta, ETAPAS, NuevaOportunidad, OportunidadPanel, dinero, etapa, msg, montos, nombreDe, pedirMotivo, vencida, fechaCorta, type Etapa, type Oportunidad, EtiquetaResponsable, useVeTodoCrm,
} from './comun';
import { teclaFila } from '../../../lib/teclado';
import { Select } from '../../../components/ui/Select';

type Vista = 'tablero' | 'lista';
const CLAVE_VISTA = 'crm:vista-embudo';
const sumar = (lista: Oportunidad[]) => lista.reduce<Record<string, number>>((a, o) => ((a[o.moneda] = (a[o.moneda] ?? 0) + Number(o.monto ?? 0)), a), {});

const SUAVE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
// Estilos del tablero. El color de cada etapa llega por la variable --c (solo un punto y un tinte suave, sin franjas).
const ESTILOS = `
.emb-resumen{display:flex;gap:var(--ax-space-2);overflow-x:auto}
.emb-resumen__item{flex-basis:132px;flex-shrink:1;min-width:132px;padding:var(--ax-space-3);border-radius:var(--ax-radius-md);background:var(--ax-surface-subtle);transition:flex-grow .45s ${SUAVE},background-color .25s}
.emb-resumen__item:hover{background:color-mix(in srgb,var(--c) 8%,var(--ax-surface-subtle))}
.emb-et{display:flex;align-items:center;gap:8px;font-size:var(--ax-text-xs);color:var(--ax-text-muted);white-space:nowrap}
.emb-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 20%,transparent)}
.emb-resumen__n{margin-block-start:2px;font-size:var(--ax-text-lg);font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong);line-height:1.2}
.emb-resumen__m{font-size:var(--ax-text-xs);color:var(--ax-text-muted)}
.emb-tablero{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(272px,1fr);gap:var(--ax-space-3);overflow-x:auto;align-items:start;padding-block-end:var(--ax-space-3)}
.emb-col{display:flex;flex-direction:column;gap:var(--ax-space-3);min-height:340px;padding:var(--ax-space-3);border-radius:var(--ax-radius-lg,14px);background:var(--ax-surface-subtle);border:1px solid var(--ax-border);transition:background-color .25s ${SUAVE},border-color .25s ${SUAVE},box-shadow .25s ${SUAVE}}
.emb-col.is-over{background:color-mix(in srgb,var(--c) 8%,var(--ax-surface-subtle));border-color:color-mix(in srgb,var(--c) 50%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 12%,transparent)}
.emb-col__cab{display:flex;align-items:center;justify-content:space-between;gap:var(--ax-space-2);padding:2px 2px 0}
.emb-col__tit{display:flex;align-items:center;gap:8px;margin:0;font-size:var(--ax-text-sm);font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong)}
.emb-col__n{min-width:24px;padding:1px 8px;border-radius:999px;text-align:center;font-size:var(--ax-text-xs);font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong);background:color-mix(in srgb,var(--c) 18%,transparent)}
.emb-col__m{padding:0 2px;margin-block-start:-8px;font-size:var(--ax-text-xs);color:var(--ax-text-muted)}
.emb-col__lista{display:flex;flex-direction:column;gap:var(--ax-space-2);flex:1}
.emb-card{display:flex;flex-direction:column;gap:var(--ax-space-2);padding:var(--ax-space-3);border-radius:var(--ax-radius-md);background:var(--ax-surface-raised,var(--ax-surface));border:1px solid var(--ax-border);cursor:grab;box-shadow:var(--ax-shadow-sm,none);transition:transform .22s ${SUAVE},box-shadow .22s ${SUAVE},border-color .22s,opacity .2s}
.emb-card:hover{transform:translateY(-2px);box-shadow:var(--ax-shadow-md);border-color:color-mix(in srgb,var(--c) 45%,var(--ax-border))}
.emb-card:active{cursor:grabbing}
.emb-card.is-drag{opacity:.4;transform:scale(.97);box-shadow:none}
.emb-card__abrir{all:unset;display:flex;flex-direction:column;gap:2px;cursor:pointer;width:100%;border-radius:var(--ax-radius-sm,6px)}
.emb-card__abrir:focus-visible{outline:2px solid var(--ax-focus-ring,var(--ax-accent));outline-offset:3px}
.emb-card__fila{display:flex;align-items:baseline;justify-content:space-between;gap:var(--ax-space-2)}
.emb-card__num{font-size:var(--ax-text-xs);color:var(--ax-text-subtle)}
.emb-card__monto{font-size:var(--ax-text-sm);font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong)}
.emb-card__tit{font-weight:var(--ax-weight-semibold);color:var(--ax-text-strong);line-height:1.3}
.emb-card__cli{font-size:var(--ax-text-sm);color:var(--ax-text-muted)}
.emb-card__pie{display:flex;align-items:center;flex-wrap:wrap;gap:var(--ax-space-2);justify-content:space-between}
.emb-chip{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;font-size:var(--ax-text-xs);color:var(--ax-text-muted);background:var(--ax-surface-subtle)}
.emb-chip.is-late{color:var(--ax-danger-500);background:color-mix(in srgb,var(--ax-danger-500) 12%,transparent)}
.emb-vacio{display:grid;place-items:center;min-height:96px;padding:var(--ax-space-3);border:1px dashed var(--ax-border-strong,var(--ax-border));border-radius:var(--ax-radius-md);font-size:var(--ax-text-xs);color:var(--ax-text-subtle);text-align:center;transition:border-color .25s,color .25s,background-color .25s}
.emb-col.is-over .emb-vacio{border-color:var(--c);color:var(--ax-text-muted)}
.emb-skel{height:104px;border-radius:var(--ax-radius-md);background:linear-gradient(90deg,var(--ax-surface-raised,var(--ax-surface)) 25%,var(--ax-border) 50%,var(--ax-surface-raised,var(--ax-surface)) 75%);background-size:200% 100%;animation:emb-brillo 1.4s ease-in-out infinite}
@keyframes emb-brillo{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.emb-resumen__item,.emb-col,.emb-card,.emb-vacio{transition:none}.emb-card:hover{transform:none}.emb-skel{animation:none}}
`;

export function CrmEmbudo({ propio = false }: { propio?: boolean }) {
  const { activeMarcaId } = useAuth();
  // Posiciones previas de las tarjetas: al cambiar de columna se animan desde donde estaban hasta donde quedan (FLIP).
  const tableroRef = useRef<HTMLDivElement>(null);
  const posiciones = useRef(new Map<string, { x: number; y: number }>());
  const [lista, setLista] = useState<Oportunidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [miasSel, setMias] = useState(false);
  const { veTodo: veTodoRol } = useVeTodoCrm();
  const veTodo = veTodoRol && !propio;
  const mias = propio || miasSel;
  const [cerradas, setCerradas] = useState(false);
  const [q, setQ] = useState('');
  const [abierta, setAbierta] = useState<string | null>(null);
  // ?id=<oportunidad> abre su ficha (enlaces «Ver en CRM» y de la Agenda).
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setAbierta(id); }, []);
  const [nueva, setNueva] = useState(false);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);
  const [vista, setVistaEstado] = useState<Vista>('tablero');
  // La vista elegida se recuerda en este navegador (si el almacenamiento no está disponible, queda el tablero).
  useEffect(() => { try { if (localStorage.getItem(CLAVE_VISTA) === 'lista') setVistaEstado('lista'); } catch { /* sin almacenamiento */ } }, []);
  const setVista = (v: Vista) => { setVistaEstado(v); try { localStorage.setItem(CLAVE_VISTA, v); } catch { /* sin almacenamiento */ } };

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const qs = new URLSearchParams({ estado: cerradas ? 'todas' : 'abiertas', ...(mias ? { asignado: 'yo' } : {}) });
      setLista(await api.get<Oportunidad[]>(`/crm/oportunidades?${qs}`));
      setError('');
    } catch (e) { setError(msg(e, 'No se pudo cargar el embudo.')); } finally { setCargando(false); }
  }, [activeMarcaId, mias, cerradas]);
  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? lista.filter((o) => [o.numero, o.titulo, o.empresa?.razonSocial, o.contacto?.nombre, o.contacto?.email].some((v) => v?.toLowerCase().includes(t))) : lista;
  }, [lista, q]);
  const columnas = ETAPAS.filter((e) => cerradas || !['GANADO', 'PERDIDO'].includes(e.v));

  // Animación suave al mover: mide cada tarjeta tras pintar y la desliza desde su sitio anterior; las nuevas aparecen con fundido.
  useLayoutEffect(() => {
    const cont = tableroRef.current;
    if (!cont) { posiciones.current.clear(); return; }
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = cont.getBoundingClientRect();
    const nuevas = new Map<string, { x: number; y: number }>();
    cont.querySelectorAll<HTMLElement>('[data-opp]').forEach((el) => {
      const id = el.dataset.opp as string;
      const r = el.getBoundingClientRect();
      const p = { x: r.left - base.left + cont.scrollLeft, y: r.top - base.top };
      nuevas.set(id, p);
      if (reducir) return;
      const antes = posiciones.current.get(id);
      if (antes) {
        const dx = antes.x - p.x, dy = antes.y - p.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], { duration: 380, easing: SUAVE });
      } else if (posiciones.current.size > 0) {
        el.animate([{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: SUAVE });
      }
    });
    posiciones.current = nuevas;
  }, [visibles, vista, cargando, cerradas]);

  async function mover(id: string, destino: Etapa) {
    const o = lista.find((x) => x.id === id);
    if (!o || o.etapa === destino) return;
    const motivoPerdida = destino === 'PERDIDO' ? (await pedirMotivo()) ?? undefined : undefined;
    if (destino === 'PERDIDO' && !motivoPerdida) return;
    setLista((l) => l.map((x) => (x.id === id ? { ...x, etapa: destino } : x)));
    try { await api.patch(`/crm/oportunidades/${id}/etapa`, { etapa: destino, motivoPerdida }); } catch (e) { setError(msg(e, 'No se pudo mover.')); }
    cargar();
  }

  return (
    <>
      <style>{ESTILOS}</style>
      <PageHead title={propio ? 'Mi embudo' : 'Embudo comercial'} subtitle="Oportunidades por etapa. Muévelas arrastrando la tarjeta o con su selector de etapa; las solicitudes de la web entran solas en «Nuevo»." actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => setNueva(true)}><span className="ax-btn__label">Nueva oportunidad</span></button>} />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}

      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', marginBlockEnd: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
        <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Vista">
          <button type="button" role="radio" aria-checked={vista === 'tablero'} className={`ax-btn ax-btn--sm${vista === 'tablero' ? ' is-selected' : ''}`} onClick={() => setVista('tablero')}>Tablero</button>
          <button type="button" role="radio" aria-checked={vista === 'lista'} className={`ax-btn ax-btn--sm${vista === 'lista' ? ' is-selected' : ''}`} onClick={() => setVista('lista')}>Lista</button>
        </div>
        {veTodo && (
          <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="De quién">
            <button type="button" role="radio" aria-checked={!mias} className={`ax-btn ax-btn--sm${!mias ? ' is-selected' : ''}`} onClick={() => setMias(false)}>Todas</button>
            <button type="button" role="radio" aria-checked={mias} className={`ax-btn ax-btn--sm${mias ? ' is-selected' : ''}`} onClick={() => setMias(true)}>Mías</button>
          </div>
        )}
        <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
          <input type="checkbox" checked={cerradas} onChange={(e) => setCerradas(e.target.checked)} /> Ver ganadas y perdidas
        </label>
        <input type="search" className="ax-input" placeholder="Buscar cliente, empresa, n.º…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar oportunidades" style={{ maxWidth: 280 }} />
      </div>

      {/* Resumen del embudo: cantidad y monto por etapa (el ancho de cada tramo sigue a la cantidad). */}
      <div>
        <section aria-label="Resumen del embudo" className="ax-card" style={{ padding: 'var(--ax-space-3)' }}>
          <div className="emb-resumen">
            {columnas.map((col) => {
              const items = visibles.filter((o) => o.etapa === col.v);
              return (
                <div key={col.v} className="emb-resumen__item" style={{ '--c': col.color, flexGrow: Math.max(items.length, 1) } as React.CSSProperties}>
                  <div className="emb-et"><span aria-hidden="true" className="emb-dot" />{col.label}</div>
                  <div className="emb-resumen__n ax-num">{items.length}</div>
                  <div className="emb-resumen__m ax-num">{montos(sumar(items))}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {vista === 'lista' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
          {columnas.map((col) => {
            const items = visibles.filter((o) => o.etapa === col.v);
            return (
              <details key={col.v} open={items.length > 0} className="ax-card">
                <summary className="ax-card__body ax-cluster" style={{ cursor: 'pointer', gap: 'var(--ax-space-3)', justifyContent: 'space-between' }}>
                  <span className="emb-et" style={{ '--c': col.color, fontSize: 'var(--ax-text-base)', fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' } as React.CSSProperties}><span aria-hidden="true" className="emb-dot" />{col.label} <span className="ax-badge ax-badge--soft ax-badge--sm">{items.length}</span></span>
                  <span className="ax-num" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{montos(sumar(items))}</span>
                </summary>
                {items.length === 0 ? <p style={{ margin: 0, padding: '0 var(--ax-space-5) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>Sin oportunidades.</p> : (
                  <div className="ax-table-wrap">
                    <table className="ax-table ax-table--hover">
                      <thead className="ax-table__head"><tr>
                        <th className="ax-table__th" scope="col">Oportunidad</th><th className="ax-table__th" scope="col">Cliente</th><th className="ax-table__th" scope="col">Monto</th>
                        <th className="ax-table__th" scope="col">Responsable</th><th className="ax-table__th" scope="col">Próxima acción</th><th className="ax-table__th" scope="col">Etapa</th>
                      </tr></thead>
                      <tbody>
                        {items.map((o) => (
                          <tr key={o.id} className="ax-table__row" onClick={() => setAbierta(o.id)} tabIndex={0} onKeyDown={teclaFila(() => setAbierta(o.id))} style={{ cursor: 'pointer' }}>
                            <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{o.titulo}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.numero}</div></td>
                            <td className="ax-table__td">{o.empresa?.razonSocial ?? o.contacto?.nombre ?? '—'}</td>
                            <td className="ax-table__td ax-num">{dinero(o.monto, o.moneda)}</td>
                            <td className="ax-table__td"><EtiquetaResponsable u={o.asignado} /></td>
                            <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: vencida(o.proximaAccionAt) ? 'var(--ax-danger-500)' : 'var(--ax-text-muted)' }}>
                              {o.proximaAccion ? `${o.proximaAccion}${o.proximaAccionAt ? ` · ${fechaCorta(o.proximaAccionAt)}` : ''}` : '—'}
                            </td>
                            <td className="ax-table__td" onClick={(e) => e.stopPropagation()}>
                              <Select aria-label={`Mover ${o.numero} a otra etapa`} className="ax-select" value={o.etapa} onChange={(e) => mover(o.id, e.target.value as Etapa)} style={{ minWidth: 170 }}>
                                {ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </details>
            );
          })}
        </div>
      ) : (
      <div ref={tableroRef} className="emb-tablero">
        {columnas.map((col) => {
          const items = visibles.filter((o) => o.etapa === col.v);
          const encima = sobre === col.v && arrastrando !== null;
          return (
            <section key={col.v} aria-label={col.label} className={`emb-col${encima ? ' is-over' : ''}`} style={{ '--c': col.color } as React.CSSProperties}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (sobre !== col.v) setSobre(col.v); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSobre((s) => (s === col.v ? null : s)); }}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); setSobre(null); setArrastrando(null); if (id) mover(id, col.v); }}>
              <header>
                <div className="emb-col__cab">
                  <h2 className="emb-col__tit"><span aria-hidden="true" className="emb-dot" />{col.label}</h2>
                  <span className="emb-col__n ax-num">{items.length}</span>
                </div>
              </header>
              <div className="emb-col__m ax-num">{montos(sumar(items))}</div>
              <div className="emb-col__lista">
                {cargando ? (
                  <><div className="emb-skel" /><div className="emb-skel" style={{ opacity: 0.6 }} /></>
                ) : items.length === 0 ? (
                  <div className="emb-vacio">{encima ? 'Suelta aquí' : 'Sin oportunidades'}</div>
                ) : items.map((o) => (
                  <article key={o.id} data-opp={o.id} draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', o.id); e.dataTransfer.effectAllowed = 'move'; setArrastrando(o.id); }}
                    onDragEnd={() => { setArrastrando(null); setSobre(null); }}
                    className={`emb-card${arrastrando === o.id ? ' is-drag' : ''}`}>
                    <button type="button" className="emb-card__abrir" onClick={() => setAbierta(o.id)} aria-label={`Abrir ${o.numero} ${o.titulo}`}>
                      <span className="emb-card__fila">
                        <span className="emb-card__num">{o.numero}</span>
                        <span className="emb-card__monto ax-num">{dinero(o.monto, o.moneda)}</span>
                      </span>
                      <span className="emb-card__tit">{o.titulo}</span>
                      <span className="emb-card__cli">{o.empresa?.razonSocial ?? o.contacto?.nombre ?? '—'}</span>
                    </button>
                    <div className="emb-card__pie">
                      <EtiquetaResponsable u={o.asignado} />
                      {o.proximaAccion && (
                        <span className={`emb-chip${vencida(o.proximaAccionAt) ? ' is-late' : ''}`}>
                          {vencida(o.proximaAccionAt) ? '⚠' : '→'} {o.proximaAccion}{o.proximaAccionAt ? ` · ${fechaCorta(o.proximaAccionAt)}` : ''}
                        </span>
                      )}
                    </div>
                    <Select aria-label={`Mover ${o.numero} a otra etapa`} className="ax-select" value={o.etapa} onChange={(e) => mover(o.id, e.target.value as Etapa)}
                      style={{ fontSize: 'var(--ax-text-xs)', minHeight: 30, padding: '2px 8px' }}>
                      {ETAPAS.map((e) => <option key={e.v} value={e.v}>{etapa(e.v).label}</option>)}
                    </Select>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      )}

      {abierta && <OportunidadPanel id={abierta} onClose={() => setAbierta(null)} onCambio={cargar} />}
      {nueva && <NuevaOportunidad onClose={() => setNueva(false)} onCreada={(id) => { setNueva(false); cargar(); setAbierta(id); }} />}
    </>
  );
}

export default CrmEmbudo;
